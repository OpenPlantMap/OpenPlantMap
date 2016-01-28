'use strict';

/**
 * @ngdoc service
 * @name openSenseMapApp.OpenSenseBoxAPI
 * @description Defines the settings for the OpenSenseBox API such as the URL
 * # OpenSenseBox
 * Factory in the openSenseMapApp.
 */
angular.module('openSenseMapApp')
  .factory('OpenSenseBoxAPI', function ($resource) {
  	var api = {
  		//url: 'http://opensensemap.org:8000'
  		//url: 'http://localhost:8000'
  		url: 'http://openpmap.shaula.uberspace.de/api'
  	};
    return api;
  });
