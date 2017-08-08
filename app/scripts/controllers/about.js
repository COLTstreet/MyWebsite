'use strict';

/**
 * @ngdoc function
 * @name mywebsiteApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the mywebsiteApp
 */
angular.module('mywebsiteApp')
	.controller('AboutCtrl', ['$scope', '$window', function ($scope, $window) {

		$scope.data = [
			{ label: "Name:", value: "Colt Street"},
			{ label: "Age:", value: "27"},
			{ label: "Phone:", value: "(304) 771-1419" },
			{ label: "Email:", value: "colt.k.street@gmail.com" },
		];

		

 	}]);
