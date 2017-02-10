'use strict';

/**
 * @ngdoc function
 * @name mywebsiteApp.controller:FooterCtrl
 * @description
 * # FooterCtrl
 * Controller of the mywebsiteApp
 */
angular.module('mywebsiteApp')
	.controller('FooterCtrl', ['$scope', function ($scope) {

	$scope.activePage = 'home';

    $scope.setActivePage = function(page) {
      $scope.activePage = page;
    };
}]);
