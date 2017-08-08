'use strict';

/**
 * @ngdoc function
 * @name mywebsiteApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the mywebsiteApp
 */
angular.module('mywebsiteApp')
	.controller('HomeCtrl', ['$scope', '$window', '$http', function ($scope, $window, $http) {

	$scope.buildMap = function() {
		var mapboxUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
        mapboxAttribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';

        var streets = L.tileLayer(mapboxUrl, {
        	id: 'mapbox.streets',
        	attribution: mapboxAttribution
        }),
        	dark = L.tileLayer(mapboxUrl, {
        	id: 'mapbox.dark',
        	attribution: mapboxAttribution
        }),
        	satellite = L.tileLayer(mapboxUrl, {
        	id: 'mapbox.satellite',
        	attribution: mapboxAttribution
        }),
        	light = L.tileLayer(mapboxUrl, {
        	id: 'mapbox.light',
        	attribution: mapboxAttribution
        }),
        	openStreet = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY29sdHN0cmVldCIsImEiOiJjajMxdmt5emswMDUyMnFteXRqdGsyOXdlIn0.bqNOBhffmLORYnAVRMMPnw', {
        	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }),
        	moonlight = L.tileLayer('https://api.mapbox.com/styles/v1/coltstreet/cj3n9kp9o00192ro6vyqk5e7k/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY29sdHN0cmVldCIsImEiOiJjajMxdmt5emswMDUyMnFteXRqdGsyOXdlIn0.bqNOBhffmLORYnAVRMMPnw', {
        	attribution: mapboxAttribution
        });



        //add nba markers
		$scope.nbaMarkers = [];
		$scope.locationArray = [];
		for(var i = 0; i < $scope.nbaData.length; i++){
        	var team = $scope.nbaData[i];

			var popupHtml = "<span>" + team.location + "</span>";
        	var marker = L.marker(team.location).bindPopup(popupHtml);

        	$scope.nbaMarkers.push(marker);
        	$scope.locationArray.push(team.location);
        }

        $scope.nbaMarkerLayer = L.layerGroup($scope.nbaMarkers);

		var map = L.map('mapId', {
		    center: [38.895, -77.0363],
		    zoom: 14,
		    layers: [moonlight]
		});

		var baseMaps = {
		    "Streets": streets,
		    "Dark": dark,
    		"Satellite": satellite,
            "Light": light,
            "Moonlight": moonlight,
            "OpenStreet": openStreet

		};

		var overlayMaps = {
			"NBA": $scope.nbaMarkerLayer
		}		


		L.control.layers(baseMaps).addTo(map);


		var southWest = [L.latLngBounds($scope.locationArray).getSouthWest().lat, L.latLngBounds($scope.locationArray).getSouthWest().lng];
        var northEast = [L.latLngBounds($scope.locationArray).getNorthEast().lat, L.latLngBounds($scope.locationArray).getNorthEast().lng];
        
        map.fitBounds([southWest, northEast]);
	}

	$scope.buildRadial = function() {
		d3.selectAll("#chart-svg").selectAll("g").remove();
		d3.selectAll("path").remove();
		$scope.showRadial = true;
		$scope.showSunburst = false;
		$scope.showStack = false;
		$scope.showStreamgraph = false;

		var svg = d3.select("#chart-svg"),
		    margin = 20,
		    width = document.getElementById("chart-section").clientWidth,
		    diameter = document.getElementById("chart-section").clientWidth / 3,
		    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + diameter / 2 + ")");

		var color = d3.scaleLinear()
		    .domain([-1, 5])
		    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
		    .interpolate(d3.interpolateHcl);

		var pack = d3.pack()
		    .size([diameter - margin, diameter - margin])
		    .padding(2);


		var root = d3.hierarchy($scope.flareData)
		  .sum(function(d) { return d.size; })
		  .sort(function(a, b) { return b.value - a.value; });

		var focus = root,
		  nodes = pack(root).descendants(),
		  view;

		var circle = g.selectAll("circle")
		.data(nodes)
		.enter().append("circle")
		  .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
		  .style("fill", function(d) { return d.children ? color(d.depth) : null; })
		  .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

		var text = g.selectAll("text")
		.data(nodes)
		.enter().append("text")
		  .attr("class", "label")
		  .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
		  .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
		  .text(function(d) { return d.data.name; });

		var node = g.selectAll("circle,text");

		svg
		  .style("background", "white")
		  .on("click", function() { zoom(root); });

		zoomTo([root.x, root.y, root.r * 2 + margin]);

		function zoom(d) {
		var focus0 = focus; focus = d;

		var transition = d3.transition()
		    .duration(d3.event.altKey ? 7500 : 750)
		    .tween("zoom", function(d) {
		      var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
		      return function(t) { zoomTo(i(t)); };
		    });

		transition.selectAll("text")
		  .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
		    .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
		    .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
		    .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
		}

		function zoomTo(v) {
			var k = diameter / v[2]; view = v;
			node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
			circle.attr("r", function(d) { return d.r * k; });
		}
	}

	$scope.buildStackedToGrouped = function() {
		d3.selectAll("#chart-svg").selectAll("g").remove();
		d3.selectAll("path").remove();
		$scope.showRadial = false;
		$scope.showSunburst = false;
		$scope.showStreamgraph = false;
		$scope.showStack = true;

		var n = 4, // The number of series.
		    m = 58; // The number of values per series.

		// The xz array has m elements, representing the x-values shared by all series.
		// The yz array has n elements, representing the y-values of each of the n series.
		// Each yz[i] is an array of m non-negative numbers representing a y-value for xz[i].
		// The y01z array has the same structure as yz, but with stacked [y₀, y₁] instead of y.
		var xz = d3.range(m),
		    yz = d3.range(n).map(function() { return bumps(m); }),
		    y01z = d3.stack().keys(d3.range(n))(d3.transpose(yz)),
		    yMax = d3.max(yz, function(y) { return d3.max(y); }),
		    y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); });

		var svg = d3.select("#chart-svg"),
		    margin = {top: 0, right: 10, bottom: 20, left: 10},
		    width = document.getElementById("chart-section").clientWidth - margin.left - margin.right,
		    height = +svg.attr("height") - margin.top - margin.bottom,
		    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var x = d3.scaleBand()
		    .domain(xz)
		    .rangeRound([0, width])
		    .padding(0.08);

		var y = d3.scaleLinear()
		    .domain([0, y1Max])
		    .range([height, 0]);

		var color = d3.scaleOrdinal()
		    .domain(d3.range(n))
		    .range(d3.schemeCategory20c);

		var series = g.selectAll(".series")
		  .data(y01z)
		  .enter().append("g")
		    .attr("fill", function(d, i) { return color(i); });

		var rect = series.selectAll("rect")
		  .data(function(d) { return d; })
		  .enter().append("rect")
		    .attr("x", function(d, i) { return x(i); })
		    .attr("y", height)
		    .attr("width", x.bandwidth())
		    .attr("height", 0);

		rect.transition()
		    .delay(function(d, i) { return i * 10; })
		    .attr("y", function(d) { return y(d[1]); })
		    .attr("height", function(d) { return y(d[0]) - y(d[1]); });

		g.append("g")
		    .attr("class", "axis axis--x")
		    .attr("transform", "translate(0," + height + ")")
		    .call(d3.axisBottom(x)
		        .tickSize(0)
		        .tickPadding(6));

		function transitionGrouped() {
		  y.domain([0, yMax]);

		  rect.transition()
		      .duration(500)
		      .delay(function(d, i) { return i * 10; })
		      .attr("x", function(d, i) { return x(i) + x.bandwidth() / n * this.parentNode.__data__.key; })
		      .attr("width", x.bandwidth() / n)
		    .transition()
		      .attr("y", function(d) { return y(d[1] - d[0]); })
		      .attr("height", function(d) { return y(0) - y(d[1] - d[0]); });
		}

		function transitionStacked() {
		  y.domain([0, y1Max]);

		  rect.transition()
		      .duration(500)
		      .delay(function(d, i) { return i * 10; })
		      .attr("y", function(d) { return y(d[1]); })
		      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
		    .transition()
		      .attr("x", function(d, i) { return x(i); })
		      .attr("width", x.bandwidth());
		}

		// Returns an array of m psuedorandom, smoothly-varying non-negative numbers.
		// Inspired by Lee Byron’s test data generator.
		// http://leebyron.com/streamgraph/
		function bumps(m) {
		  var values = [], i, j, w, x, y, z;

		  // Initialize with uniform random values in [0.1, 0.2).
		  for (i = 0; i < m; ++i) {
		    values[i] = 0.1 + 0.1 * Math.random();
		  }

		  // Add five random bumps.
		  for (j = 0; j < 5; ++j) {
		    x = 1 / (0.1 + Math.random());
		    y = 2 * Math.random() - 0.5;
		    z = 10 / (0.1 + Math.random());
		    for (i = 0; i < m; i++) {
		      w = (i / m - y) * z;
		      values[i] += x * Math.exp(-w * w);
		    }
		  }

		  // Ensure all values are positive.
		  for (i = 0; i < m; ++i) {
		    values[i] = Math.max(0, values[i]);
		  }

		  return values;
		}

		$scope.change = function(grouped) {
			$scope.grouped = grouped;

			if($scope.grouped) {
				transitionGrouped();
			} else {
				transitionStacked();
			}
		}
	}

	$scope.buildStreamgraph = function() {
		d3.selectAll("#chart-svg").selectAll("g").remove();
		d3.selectAll("path").remove();
		$scope.showRadial = false;
		$scope.showSunburst = false;
		$scope.showStreamgraph = true;
		$scope.showStack = false;

		var n = 20, // number of layers
		    m = 200, // number of samples per layer
		    k = 10; // number of bumps per layer

		var stack = d3.stack().keys(d3.range(n)).offset(d3.stackOffsetWiggle),
		    layers0 = stack(d3.transpose(d3.range(n).map(function() { return bumps(m, k); }))),
		    layers1 = stack(d3.transpose(d3.range(n).map(function() { return bumps(m, k); }))),
		    layers = layers0.concat(layers1);

		var svg = d3.select("#chart-svg"),
		    margin = {top: 0, right: 10, bottom: 20, left: 10},
		    width = document.getElementById("chart-section").clientWidth,
		    height = +svg.attr("height");

		var x = d3.scaleLinear()
		    .domain([0, m - 1])
		    .range([0, width]);

		var y = d3.scaleLinear()
		    .domain([d3.min(layers, stackMin), d3.max(layers, stackMax)])
		    .range([height, 0]);

		var z = d3.interpolateCool;

		var area = d3.area()
		    .x(function(d, i) { return x(i); })
		    .y0(function(d) { return y(d[0]); })
		    .y1(function(d) { return y(d[1]); });

		svg.selectAll("path")
		  .data(layers0)
		  .enter().append("path")
		    .attr("d", area)
		    .attr("fill", function() { return z(Math.random()); });

		function stackMax(layer) {
		  return d3.max(layer, function(d) { return d[1]; });
		}

		function stackMin(layer) {
		  return d3.min(layer, function(d) { return d[0]; });
		}

		$scope.streamTransition = function() {
		  var t;
		  d3.selectAll("path")
		    .data((t = layers1, layers1 = layers0, layers0 = t))
		    .transition()
		      .duration(2500)
		      .attr("d", area);
		}

		// Inspired by Lee Byron’s test data generator.
		function bumps(n, m) {
		  var a = [], i;
		  for (i = 0; i < n; ++i) a[i] = 0;
		  for (i = 0; i < m; ++i) bump(a, n);
		  return a;
		}

		function bump(a, n) {
		  var x = 1 / (0.1 + Math.random()),
		      y = 2 * Math.random() - 0.5,
		      z = 10 / (0.1 + Math.random());
		  for (var i = 0; i < n; i++) {
		    var w = (i / n - y) * z;
		    a[i] += x * Math.exp(-w * w);
		  }
		}
	}

	$scope.buildSunburst = function() {
		d3.selectAll("#chart-svg").selectAll("g").remove();
		d3.selectAll("path").remove();
		$scope.showSunburst = true;
		$scope.showRadial = false;
		$scope.showStreamgraph = false;
		$scope.showStack = false;

		var svg = d3.select("#chart-svg");

		var width = document.getElementById("chart-section").clientWidth,
		    height = +svg.attr("height"),
		    radius = (Math.min(width, height) / 2) - 10;

		var formatNumber = d3.format(",d");

		var x = d3.scaleLinear()
		    .range([0, 2 * Math.PI]);

		var y = d3.scaleSqrt()
		    .range([0, radius]);

		var color = d3.scaleOrdinal(d3.schemeCategory20);

		var partition = d3.partition();

		var arc = d3.arc()
		    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
		    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
		    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
		    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });


		svg.attr("width", width)
		    .attr("height", height);

		var burst = svg.append("g")
		    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")")
		    .attr("class", "sunburst");
		  
		  var root = d3.hierarchy($scope.flareData);
		  root.sum(function(d) { return d.size; });

		  burst.selectAll(".sunburst")
		      .data(partition(root).descendants())
		    .enter().append("path")
		      .attr("d", arc)
		      .style("fill", function(d) { return color((d.children ? d : d.parent).data.name); })
		      .on("click", click)
		    .append("title")
		      .text(function(d) { return d.data.name + "\n" + formatNumber(d.value); });

		function click(d) {
		  burst.transition()
		      .duration(750)
		      .tween("scale", function() {
		        var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
		            yd = d3.interpolate(y.domain(), [d.y0, 1]),
		            yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
		        return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
		      })
		    .selectAll("path")
		      .attrTween("d", function(d) { return function() { return arc(d); }; });
		}

		d3.select(self.frameElement).style("height", height + "px");
	}

	$scope.buildBall = function() {
		var width = 80;
		var height = 200;

		var svg = d3.select("#ball-svg")
			.attr("width", width)
			.attr("height", height);

		var ball = svg.append("g")
			.attr("transform","translate(" + (width * 0.5) + "," + (height * 0.5) + ")");

		ball.append("circle")
			.attr("r", "20px")
			.attr("fill", "black");

		ball.append("ellipse")
			.attr("rx","20px")
			.attr("ry","12px")
			.attr("fill", "white");

		ball.append("ellipse")
			.attr("rx","20px")
			.attr("ry","5px")
			.attr("fill", "black");

		function bounce() {
			ball.transition()
				.duration(1500)
        		.ease(d3.easeQuadIn)
				.attr("transform","translate(" + (width * 0.5) + "," + (height * 0.8) + "), scale(1.1,0.9)")
				.transition()
        		.ease(d3.easeQuadOut)
				.duration(1500)
				.attr("transform","translate(" + (width * 0.5) + "," + (height * 0.2) + "), scale(0.9,1.1)")
				.on("end", bounce);
		};

		bounce();
	}

	$scope.radialButton = function() {
    	$scope.buildRadial();
    }

    $scope.stackButton = function() {
    	$scope.buildStackedToGrouped();
    }

    $scope.streamButton = function() {
    	$scope.buildStreamgraph();
    }

    $scope.sunburstButton = function() {
    	$scope.buildSunburst();
    }


	$scope.init = function() {

		//Default Variables
		$scope.grouped = false;
		$scope.showStack = true;
		$scope.showRadial = false;
		$scope.showSunburst = false;
		$scope.hoopfireInfo = false;
		$scope.whereweatherInfo = false;
		$scope.plexInfo = false;

		//Resize chart on window resize
		$(window).resize(function() {
			if($scope.showStack) {
				$scope.buildStackedToGrouped();
			} else if($scope.showRadial) {
    			$scope.buildRadial();
			} else if($scope.showStreamgraph) {
    			$scope.buildStreamgraph();
			}
		});

		$http.get('https://api.myjson.com/bins/14owu5')
			.then(function(response) {
				$scope.nbaData = response.data;

				//build map
		    	$scope.buildMap();
		    }, function(response) {
		        //Second function handles error
		        console.log("Something went wrong");
		    });

		//Get radial/sunburst data
		$http.get('https://api.myjson.com/bins/15lw9d')
			.then(function(response) {
				$scope.flareData = response.data;
		    }, function(response) {
		        //Second function handles error
		        console.log("Something went wrong");
		    });

		
		$scope.buildStackedToGrouped();
		$scope.buildBall();

		
	}


	$scope.init();

 }]);
