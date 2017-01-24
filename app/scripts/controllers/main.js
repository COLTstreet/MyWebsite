'use strict';

/**
 * @ngdoc function
 * @name mywebsiteApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mywebsiteApp
 */
angular.module('mywebsiteApp')
  .controller('MainCtrl', ['$scope', '$location', function ($scope, $location) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma',
      'ngMaterial'
    ];

    $scope.activePage = 'home'; 
	$scope.setActivePage = function(page) {
		$scope.activePage = page;
	}

  }]);
