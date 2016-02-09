'use strict';

angular.module('openSenseMapApp')
        .factory('OpenSenseBoxCondition', function ($resource, OpenSenseBoxAPI) {
            return $resource(OpenSenseBoxAPI.url + '/boxes/:boxId/conditions/:measurement?bound=:bound1&bound=:bound2', {}, {'query': {method: 'GET', isArray: false}});
        });