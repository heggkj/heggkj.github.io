var width = window.innerWidth;
var height = window.innerHeight;

// Parameters for arrow and edge adjustments
var arrowMarkerWidth = 4;
var arrowMarkerHeight = 4;
var arrowRefX = 3; // Adjust this to change how close the arrow is to the node edge
var targetPaddingMultiplier = 5; // Adjust this to change the distance of the arrow from the node center

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g");

// Define arrow markers for graph links
svg.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '-0 -5 10 10')
    .attr('refX', arrowRefX)
    .attr('refY', 0)
    .attr('orient', 'auto')
    .attr('markerWidth', arrowMarkerWidth)
    .attr('markerHeight', arrowMarkerHeight)
    .attr('xoverflow', 'visible')
    .append('svg:path')
    .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
    .attr('fill', '#555')
    .style('stroke', 'none')
    .style('opacity', 0.5);

var zoom = d3.zoom()
    .scaleExtent([1 / 2, 8])
    .on("zoom", function(event) {
        g.attr("transform", event.transform);
    });

svg.call(zoom);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(150))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX(width / 2).strength(0.1))
    .force("y", d3.forceY(height / 2).strength(0.1));

d3.csv("ec-subject-object-pairs.csv").then(function(links) {
    var nodes = {};

    links.forEach(function(link) {
        link.source = nodes[link.Subject] || (nodes[link.Subject] = {id: link.Subject, connections: 0});
        link.target = nodes[link.Object] || (nodes[link.Object] = {id: link.Object, connections: 0});
        link.source.connections++;
        link.target.connections++;
    });

    var colorScale = d3.scaleOrdinal(d3.schemeSet3);

    var link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.5)
        .attr("marker-end", "url(#arrowhead)");

    var node = g.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(Object.values(nodes))
        .enter().append("circle")
        .attr("r", function(d) { return Math.sqrt(d.connections) * 5; })
        .attr("fill", function(d) { return colorScale(Math.sqrt(d.connections) * 5); })
        .style('opacity', 0.8)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("dblclick", function(event, d) {
            event.stopPropagation();
            toggleFocus(d);
        });

    var label = g.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(Object.values(nodes))
        .enter().append("text")
        .attr("class", "label")
        .attr("x", 12)
        .attr("y", ".31em")
        .style("font-weight", "bold")
        .style('stroke', 'rgba(150, 150, 150, 0.3)')
        .style('stroke-width', 0.5)
        .style('fill', '#000')
        .text(function(d) { return d.id; });

var edgeLabels = g.append("g")
    .attr("class", "edge-labels")
    .selectAll("text")
    .data(links)
    .enter().append("text")
    .attr("class", "edge-label")
    .attr("dy", -3)
    .style("fill", "#000")
    .style("font-weight", "bold")
    .style('stroke', 'rgba(255, 255, 255, 0.7)')
    .style('stroke-width', 0.3)
    .style("font-size", "13px")
    .text('');

    simulation
        .nodes(Object.values(nodes))
        .on("tick", ticked);

    simulation.force("link")
        .links(links);

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) {
                var deltaX = d.target.x - d.source.x,
                    deltaY = d.target.y - d.source.y,
                    dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                    normX = deltaX / dist,
                    targetPadding = Math.sqrt(d.target.connections) * targetPaddingMultiplier + 5;
                return d.target.x - (targetPadding * normX);
            })
            .attr("y2", function(d) {
                var deltaX = d.target.x - d.source.x,
                    deltaY = d.target.y - d.source.y,
                    dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                    normY = deltaY / dist,
                    targetPadding = Math.sqrt(d.target.connections) * targetPaddingMultiplier + 5;
                return d.target.y - (targetPadding * normY);
            });

        node
            .attr("cx", function(d) { return d.x = Math.max(0, Math.min(width, d.x)); })
            .attr("cy", function(d) { return d.y = Math.max(0, Math.min(height, d.y)); });

        label
            .attr("x", function(d) { return d.x + 10; })
            .attr("y", function(d) { return d.y + 3; });

        edgeLabels
            .attr("x", function(d) { return (d.source.x + d.target.x) / 2; })
            .attr("y", function(d) { return (d.source.y + d.target.y) / 2; });
    }

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    function toggleFocus(d) {
        var isActive = !d.active;
        Object.values(nodes).forEach(function(n) {
            n.active = false;
        });
        d.active = isActive;

        node.style("visibility", function(o) {
            return o.active || connected(o) ? "visible" : "hidden";
        });

        link.style("visibility", function(l) {
            return l.source.active || l.target.active ? "visible" : "hidden";
        });

        label.style("visibility", function(l) {
            return l.active || connected(l) ? "visible" : "hidden";
        });

        edgeLabels.style("visibility", function(l) {
            return l.source.active || l.target.active ? "visible" : "hidden";
        });

        if (isActive) {
            // Calculate edge counts
            var edgeCounts = {};
            links.forEach(function(l) {
                var key = l.source.id < l.target.id ? l.source.id + '-' + l.target.id : l.target.id + '-' + l.source.id;
                edgeCounts[key] = (edgeCounts[key] || 0) + 1;
            });

            // Update edge labels
            edgeLabels
                .text(function(l) {
                    var key = l.source.id < l.target.id ? l.source.id + '-' + l.target.id : l.target.id + '-' + l.source.id;
                    return edgeCounts[key];
                });
        } else {
            // Hide edge labels when not focusing
            edgeLabels.text('');
        }

        if (!isActive) {
            node.style("visibility", "visible");
            link.style("visibility", "visible");
            label.style("visibility", "visible");
            edgeLabels.style("visibility", "hidden");
        }

        function connected(o) {
            return links.some(function(l) {
                return (l.source === d && l.target === o) || (l.target === d && l.source === o);
            });
        }
    }
});
