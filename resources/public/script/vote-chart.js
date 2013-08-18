App.VoteChart = function(user) {
    var svg, placeholder,
        w = 600;
        h = 500;
        r = (Math.min(w, h) / 2) - 90;
        textOffset = 14;
        tweenDuration = 750;

    //useful d3 functions for pie chart
    var color = d3.scale.category20();
    var arc = d3.svg.arc()
        .innerRadius(r-60)
        .outerRadius(r);
    var pie = d3.layout.pie()
        .value(function(d) { 
            return d.users.length; 
        })
        .sort(null);
    var key = function(d) {
        return d.data.restaurant;
    };

    //create and position svg canvas
    function attach(element) {
        svg = d3.select(element)
            .attr("width", w)
            .attr("height", h)
            .append("g")
            .attr("transform", "translate(" + w/2 + "," + h/2 + ")");
        placeholder = svg.append("path")
            .attr("d", arc({startAngle:0,endAngle:2*Math.PI}))
            .attr("fill", "#EFEFEF");
    }
    //redraw the chart based on its data
    function update(data) {
        // we have a map, make it an array for d3
        var transformed = [];
        for(var key in data) {
            transformed.push({restaurant:key, users:data[key]});
        }

        var pieData = pie(transformed);
        if(pieData.length > 0){
            placeholder.remove();

            render.arcs(pieData);
            render.labels(pieData);
        }  
    }
    var tween = {
        arc: function(d, i) {
            var i = interpolate(this, d);
            return function(t) {
                return arc(i(t));
            };
        },
        arcRemove: function(d, i) {
            if(d.endAngle < Math.PI)
                d.endAngle = d.startAngle;
            else
                d.startAngle = d.endAngle;
            var i = interpolate(this, d)
            return function(t) {
                return arc(i(t));
            };
        },
        label: function(d, i) {
            var i = interpolate(this, d);
            return function(t) {
                var n = i(t);
                var val = (n.startAngle + n.endAngle - Math.PI)/2;
                return "translate(" + Math.cos(val) * (r+textOffset) + "," + Math.sin(val) * (r+textOffset) + ")";
            };
        },
        mark: function(d, i) {
            var i = interpolate(this, d);
            return function(t) {
                var n = i(t);
                var val = (n.startAngle + n.endAngle - Math.PI)/2;
                return "translate(" + Math.cos(val) * (r-40) + "," + Math.sin(val) * (r-40) + ")";
            };
        }
    };
    var render = {
        arcs: function(pieData) {
            var paths = svg.selectAll("path").data(pieData, key);
            paths.enter().append("svg:path")
                .attr("fill", function(d, i) { return color(i); })
            paths
                .transition()
                .duration(tweenDuration)
                .attrTween("d", tween.arc);
            paths.exit()
                .transition()
                .duration(tweenDuration)
                .attrTween("d", tween.arcRemove)
                .remove();
        },
        labels: function(pieData) {
            // poor man's text wrapping
            function wrap(d) {
                var el = d3.select(this);
                var text = el.text()
                var breakspace = text.indexOf(' ', 10);
                if(text.length > 10 && breakspace > 10) {
                    el.text('');
                    el.append('tspan').text(text.substring(0,breakspace)); 
                    el.append('tspan').text(text.substring(breakspace+1)).attr('x',0).attr("dy",18); 
                }
            }

            var valueLabels = svg.selectAll("text").data(pieData, key);
            valueLabels.enter().append("text").text(key).each(wrap);
            valueLabels
                .transition().duration(tweenDuration).attrTween("transform", tween.label)
                .attr("dy", 5) 
                .attr("text-anchor", function(d){
                    var currentAngle = (d.startAngle+d.endAngle)/2;
                    var inMiddle = Math.abs(currentAngle - Math.PI) < 0.1;
                    var onLeft = (d.startAngle+d.endAngle)/2 < Math.PI;
                    return inMiddle ? "middle" :
                           onLeft ? "beginning" : 
                           "end";
                })
            valueLabels.exit().remove();

            var voteMarks = svg.selectAll("text").data(pieData, key);
            voteMarks.enter().append("text");
            voteMarks
                .attr("class","checkmark")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .transition().duration(tweenDuration).attrTween("transform", tween.mark)
                .text(function(d) { 
                    if(d.data.users.indexOf(user) > -1) 
                        return "✓" 
                })
            voteMarks.exit().remove();
        }
    };
    return {
        attach:attach,
        update:update
    };
    function interpolate(self, d) {
        if(!self._current) {
            self._current = {
                value:d.value,
                data:d.data,
                startAngle:2*Math.PI,
                endAngle:2*Math.PI-0.00001
            };
        }
        var i = d3.interpolate(self._current, d);
        self._current = i(d);
        return i;
    }
}
