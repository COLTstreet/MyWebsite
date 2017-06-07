'use strict';

/**
 * @ngdoc function
 * @name mywebsiteApp.controller:PortfolioCtrl
 * @description
 * # PortfolioCtrl
 * Controller of the mywebsiteApp
 */
angular.module('mywebsiteApp')
	.controller('PortfolioCtrl', ['$scope', '$window', '$mdSidenav', function ($scope, $window, $mdSidenav) {

	
	$scope.buildBarChart = function() {
		$scope.showRadial = false;
		$scope.showBar = true;
		$scope.showBubble = false;
		$scope.showPie = false;

		d3.selectAll("g").remove();
		$scope.svg = d3.select("svg");
    	var margin = {top: 20, right: 20, bottom: 30, left: 40},
    		width = +$scope.svg._groups[0][0].clientWidth - margin.left - margin.right,
   			height = +$scope.svg._groups[0][0].clientHeight - margin.top - margin.bottom;

   		var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    		y = d3.scaleLinear().rangeRound([height, 0]);

   		var g = $scope.svg.append("g")
    		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		x.domain($scope.data.map(function(d) { return d.topic; }));
		y.domain([0, d3.max($scope.data, function(d) { return d.skill; })]);

		var size = Object.keys($scope.data).length - 1;

		g.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x));

		g.append("g")
			.attr("class", "axis axis--y")
			.call(d3.axisLeft(y).ticks(5))
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", "0.71em")
			.attr("text-anchor", "end")
			.text("Skill");

		g.selectAll(".bar")
			.data($scope.data)
		.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d) { 
				return x(d.topic); 
			})
			.attr("y", function(d) { 
				return height - y(d.skill);
			})
			.attr("fill", $scope.chartColor)
			.attr("width", x.bandwidth())
			.attr("height", function(d) { 
				return y(d.skill);
			})
			.on("mouseover", function() {
				d3.select(this).attr("fill", $scope.chartHoverColor);
			})
			.on("mouseout", function() {
				d3.select(this).attr("fill", $scope.chartColor);
			})
			.transition()
			.duration(800)
			.ease(d3.easePolyOut)
			.attr("y", function(d) { 
				return y(d.skill);
			})
			.attr("height", function(d) { 
				return height - y(d.skill);
			});

	}

	$scope.buildPieChart = function() {
		$scope.showRadial = false;
		$scope.showBar = false;
		$scope.showBubble = false;
		$scope.showPie = true;

		d3.selectAll("g").remove();
		$scope.svg = d3.select("pieSection");
    	var margin = {top: 20, right: 20, bottom: 30, left: 40},
    		width = +$scope.svg._groups[0][0].clientWidth - margin.left - margin.right,
   			height = +$scope.svg._groups[0][0].clientHeight - margin.top - margin.bottom,
			barHeight = height / 2 - 40,
			containerWidth = document.getElementById("divSize").clientWidth,
			radius = Math.min(width, height) / 2;

   		var gContainer = $scope.svg.append("g")
    		.attr("transform", "translate(" + containerWidth/2 + "," + height/1.75 + ")");

		var color = d3.scaleOrdinal()
    		.range(["#4CAF50", "#673AB7", "#2196F3", "#F44336", "#FF9800", "#E91E63", "#607D8B"]);

		var arc = d3.arc()
			.outerRadius(radius - 10)
			.innerRadius(0);

		var arcOver = d3.arc()
			.innerRadius(0)
			.outerRadius(radius + 15);

		var labelArc = d3.arc()
			.outerRadius(radius-40)
			.innerRadius(radius-40);

		var pie = d3.pie()
			.sort(null)
			.value(function(d) { return d.skill; });

		var g = gContainer.selectAll(".arc")
			.data(pie($scope.data))
			.enter().append("g")
			.attr("class", "arc");

		g.append("path")
			.attr("d", arc)
			.style("fill", function(d) { return color(d.data.topic); })
			.on("mouseover", function (d, i) {
					g.selectAll("*").style("opacity", 0.7);
					var slice = d3.select(this);
					slice.style("opacity", 1);
					slice.transition()
						.duration(200)
						.attr("d", arcOver);
			})
			.on("mouseout", function (d) {
				g.selectAll("*").style("opacity", 1);
				d3.select(this).transition()
					.duration(250)
					.attr("d", arc);
			});

		g.append("text")
			.attr("transform", function(d) { 
				var midAngle = d.endAngle < Math.PI ? d.startAngle/2 + d.endAngle/2 : d.startAngle/2  + d.endAngle/2 + Math.PI ;
				return "translate(" + labelArc.centroid(d)[0] + "," + labelArc.centroid(d)[1] + ") rotate(-90) rotate(" + (midAngle * 180/Math.PI) + ")"; 
			})
			.attr("dy", ".35em")
			.attr('text-anchor','middle')
			.style("font-size", ".75em")
			.text(function(d) { return d.data.topic; });

		function type(d) {
			d.skill = +d.skill;
			return d;
		}
	}

	$scope.buildBubbleChart = function() {
		$scope.showRadial = false;
		$scope.showBar = false;
		$scope.showPie = false;
		$scope.showBubble = true;

		d3.selectAll("g").remove();
		$scope.svg = d3.select("svg");
    	var margin = {top: 20, right: 20, bottom: 30, left: 40},
    		width = +$scope.svg._groups[0][0].clientWidth - margin.left - margin.right,
   			height = +$scope.svg._groups[0][0].clientHeight - margin.top - margin.bottom,
			barHeight = height / 2 - 40;

		var g = $scope.svg.append("g")
    		.attr("transform", "translate(" + 100 + "," + 0 + ")");

		var format = d3.format(",d");

		var bubble = d3.pack()
			.size([width, height])
			.padding(1.5);

		var temp = classes($scope.hData);

		var root = d3.hierarchy(temp)
			.sum(function(d) { 
				return d.value; })
			.sort(function(a, b) { 
				return b.value - a.value; 
				});

		bubble(root);
		var node = g.selectAll(".node")
			.data(root.children)
			.enter().append("g")
			.attr("class", "node")
			.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

		node.append("title")
			.text(function(d) { return d.data.className + ": " + format(d.value); });

		node.append("circle")
			.attr("r", function(d) { return d.r; })
			.style("fill", function(d) { 
				return $scope.chartColor;
			})
			.on("mouseover", function() {
				d3.select(this).style("fill", $scope.chartHoverColor);
			})
			.on("mouseout", function() {
				d3.select(this).style("fill", $scope.chartColor);
			});

		node.append("text")
			.attr("dy", ".3em")
			.style("text-anchor", "middle")
			.style("font-size", ".75em")
			.text(function(d) { 
				return d.data.className.substring(0, d.r / 3); 
			});

		// Returns a flattened hierarchy containing all leaf nodes under the root.
		function classes(root) {
			var classes = [];

			function recurse(name, node) {
				if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
				else classes.push({packageName: name, className: node.name, value: node.value});
			}

			recurse(null, root);
			return {children: classes};
		}

		d3.select(self.frameElement).style("height", height + "px");

	}

	$scope.buildRadialChart = function() {
		$scope.showRadial = true;
		$scope.showBar = false;
		$scope.showBubble = false;
		$scope.showPie = false;

		d3.selectAll("g").remove();
		$scope.svg = d3.select("svg");
    	var margin = {top: 20, right: 20, bottom: 30, left: 40},
    		width = +$scope.svg._groups[0][0].clientWidth,
   			height = +$scope.svg._groups[0][0].clientHeight - margin.top - margin.bottom,
			barHeight = height / 2 - 40;

   		var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    		y = d3.scaleLinear().rangeRound([height, 0]);

		var containerWidth = document.getElementById("divSize").clientWidth;

   		var g = $scope.svg.append("g")
    		.attr("transform", "translate(" + containerWidth/2 + "," + height/1.75 + ")");

		$scope.data.sort(function(a,b) { return b.skill - a.skill; });

		var extent = d3.extent($scope.data, function(d) { return d.skill; });
		var barScale = d3.scaleLinear()
			.domain(extent)
			.range([0, barHeight]);

		var keys = $scope.data.map(function(d,i) { return d.topic; });
		var numBars = keys.length;
		var formatNumber = d3.format(".2s");

		var x = d3.scaleLinear()
			.domain(extent)
			.range([0, -barHeight]);

		var xAxis = d3.axisLeft()
			.scale(x)
			.ticks(3)
			.tickFormat(formatNumber);
			
		var circles = g.selectAll("circle")
				.data(x.ticks(3))
				.enter().append("circle")
				.attr("r", function(d) {return barScale(d);})
				.style("fill", "none")
				.style("stroke", "black")
				.style("stroke-dasharray", "2,2")
				.style("stroke-width",".5px");

		var arc = d3.arc()
			.startAngle(function(d,i) { return (i * 2 * Math.PI) / numBars; })
			.endAngle(function(d,i) { return ((i + 1) * 2 * Math.PI) / numBars; })
			.innerRadius(0);
		
		var segments = g.selectAll("path")
				.data($scope.data)
				.enter().append("path")
				.attr("class", "radial-bars")
				.each(function(d) { d.outerRadius = 0; })
				.style("fill", function (d) { return $scope.chartColor; })
				.attr("d", arc)
				.on("mouseover", function() {
					d3.select(this).style("fill", $scope.chartHoverColor);
				})
				.on("mouseout", function() {
					d3.select(this).style("fill", $scope.chartColor);
				});

		segments.transition().ease(d3.easeElastic).duration(800).delay(function(d,i) {return (25-i)*50;})
				.attrTween("d", function(d,index) {
					var i = d3.interpolate(d.outerRadius, barScale(+d.skill));
					return function(t) { d.outerRadius = i(t); return arc(d,index); };
				});

		g.append("circle")
			.attr("r", barHeight)
			.classed("outer", true)
			.style("fill", "none")
			.style("stroke", "black")
			.style("stroke-width","1.5px");

		var lines = g.selectAll("line")
			.data(keys)
			.enter().append("line")
			.attr("y2", -barHeight - 20)
			.style("stroke", "black")
			.style("stroke-width",".5px")
			.attr("transform", function(d, i) { return "rotate(" + (i * 360 / numBars) + ")"; });

		g.append("g")
			.attr("class", "x axis")
			.call(xAxis);

		// Labels
		var labelRadius = barHeight * 1.025;

		var labels = g.append("g")
			.classed("labels", true);

		labels.append("def")
				.append("path")
				.attr("id", "label-path")
				.attr("d", "m0 " + -labelRadius + " a" + labelRadius + " " + labelRadius + " 0 1,1 -0.01 0");

		labels.selectAll("text")
				.data(keys)
			.enter().append("text")
				.style("text-anchor", "middle")
				.style("font-size",".75em")
				.style("fill", function(d, i) {return "#3e3e3e";})
				.append("textPath")
				.attr("xlink:href", "#label-path")
				.attr("startOffset", function(d, i) {return i * 100 / numBars + 50 / numBars + '%';})
				.text(function(d) {return d.toUpperCase(); });

	}

	$scope.changeChartColor = function(color){
		if($scope.showRadial == true) {
			$scope.chartColor = color;
			$scope.buildRadialChart();
		} else if($scope.showBar == true) {
			$scope.chartColor = color;
			$scope.buildBarChart();
		} else if($scope.showBubble == true) {
			$scope.chartColor = color;
			$scope.buildBubbleChart();
		} else if($scope.showPie == true) {
			$scope.chartColor = color;
			$scope.buildPieChart();
		}
	}

	$scope.changeChartHoverColor = function(color){
		if($scope.showRadial == true) {
			$scope.chartHoverColor = color;
			$scope.buildRadialChart();
		} else if($scope.showBar == true) {
			$scope.chartHoverColor = color;
			$scope.buildBarChart();
		} else if($scope.showBubble == true) {
			$scope.chartHoverColor = color;
			$scope.buildBubbleChart();
		} else if($scope.showPie == true) {
			$scope.chartHoverColor = color;
			$scope.buildPieChart();
		}
	}

	$scope.buildChart = function(type){
		if(type == 'Radial'){
			if($scope.showRadial == false) {
				$scope.buildRadialChart();
			}
		} else if(type == 'Bar') {
			if($scope.showBar == false) {
				$scope.buildBarChart();
			}
		} else if(type == 'Bubble') {
			if($scope.showBubble == false) {
				$scope.buildBubbleChart();
			}
		} else if(type == 'Pie') {
			if($scope.showPie == false) {
				$scope.buildPieChart();
			}
		}
	}

	$scope.toggleTools = function(type) {
		if(type == 'changeChartType') {
			$scope.showChartTools = !$scope.showChartTools;
			$scope.showColorTools = false;
		} else if(type == 'changeChartColor') {
			$scope.showColorTools = !$scope.showColorTools;
			$scope.showChartTools = false;
		}
	}

	$scope.init = function() {

		//Default Variables
		$scope.buildMap();
	}


	$scope.init();

}]);
