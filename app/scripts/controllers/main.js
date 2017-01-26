'use strict';

/**
 * @ngdoc function
 * @name mywebsiteApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mywebsiteApp
 */
angular.module('mywebsiteApp')
  .controller('MainCtrl', ['$scope', function ($scope) {
    

    $scope.activePage = 'home';

    $scope.setActivePage = function(page) {
      $scope.activePage = page;
    };

  }]);
