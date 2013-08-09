App.VoteChart = function(data) {
    var width = 400,
        height = 400,
        radius = Math.min(width, height) / 2,
        svg;

    //useful d3 functions for pie chart
    var color = d3.scale.category20();
    var arc = d3.svg.arc()
        .innerRadius(radius - 100)
        .outerRadius(radius - 20);
    var pie = d3.layout.pie()
        .value(function(d) { 
            return d.users.length; 
        })
        .sort(null);

    //create and position svg canvas
    function attach(element) {
        svg = d3.select(element).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    }
    //redraw the chart based on its data
    function update() {
        var path = svg.datum(data).selectAll("path")
            .data(pie);
        
        path.exit().remove()
        path.enter().append("path");
        
        path
            .attr("fill", function(d, i) { return color(i); })
            .attr("d", arc)
            .transition().duration(750).attrTween("d", _arcTween); // redraw the arcs
        
    }
    // Store the displayed angles in _current.
    // Then, interpolate from _current to the new angles.
    // During the transition, _current is updated in-place by d3.interpolate.
    function _arcTween(a) {
        if(!this._current) {
            this._current = {
                value:a.value,
                data:a.data,
                startAngle:2*Math.PI,
                endAngle:2*Math.PI
            };
        }
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
            return arc(i(t));
        };
    }
    return {
        attach:attach,
        update:update
    };
}
