'use strict';

angular.module('openSenseMapApp')
        .factory('Plants', function ($resource, OpenSenseBoxAPI) {
            return $resource(OpenSenseBoxAPI.url + '/plants', {});
        });