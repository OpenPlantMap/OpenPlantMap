'use strict';
angular.module('openSenseMapApp')
        .factory('nav_elements', function () {
            var elements_show = false;
            return {
                set_show: function (bool) {
                    elements_show = bool;
                },
                get_show: function () {
                   return elements_show;
                }
            };
        });