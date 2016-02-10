'use strict';

angular.module('openSenseMapApp')
        .controller('StartCtrl', ['nav_elements', function ($scope, nav_elements) {

                nav_elements.set_show(false);

            }]);
