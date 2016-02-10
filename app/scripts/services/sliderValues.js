'use strict';
angular.module('openSenseMapApp')
        .factory('sliderValues', function () {
            var light_slider_values = [3000,5000];
            var temp_slider_values = [10,20];
            var ph_slider_values = [6.5, 7.5];
            var moisture_slider_values = [100,400];
            return {
                set_light_values: function (values) {
                    light_slider_values = values;
                },
                set_temp_values: function (values) {
                    temp_slider_values = values;
                },
                set_ph_values: function (values) {
                    ph_slider_values = values;
                },
                set_moisture_values: function (values) {
                    moisture_slider_values = values;
                },
                get_light_values: function () {
                    return light_slider_values;
                },
                get_temp_values: function () {
                    return temp_slider_values;
                },
                get_ph_values: function () {
                    return ph_slider_values;
                },
                get_moisture_values: function () {
                    return moisture_slider_values;
                }
            };
        });
        