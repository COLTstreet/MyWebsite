'use strict';

/**
 * @ngdoc function
 * @name mywebsiteApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the mywebsiteApp
 */
angular.module('mywebsiteApp')
  .controller('HomeCtrl', function () {
  	var clientHeight = document.getElementById('container').clientHeight;
  	document.getElementById('frontPage').style.height = clientHeight + "px";
  });
