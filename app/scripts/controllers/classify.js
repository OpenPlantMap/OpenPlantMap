'use strict';
angular.module('openSenseMapApp')
        .controller('ClassifyCtrl', ['$rootScope', '$scope', '$http', '$filter', '$timeout', '$location', '$routeParams', 'OpenSenseBoxes', 'OpenSenseBoxesSensors', 'OpenSenseBox', 'OpenSenseBoxData', 'validation', 'ngDialog', 'leafletData', 'OpenSenseBoxAPI',
            function ($rootScope, $scope, $http, $filter, $timeout, $location, $routeParams, OpenSenseBoxes, OpenSenseBoxesSensors, OpenSenseBox, OpenSenseBoxData, Validation, ngDialog, leafletData, OpenSenseBoxAPI) {
                $scope.sliderOptions = {                   
                    tooltip: 'always', 
                    tooltipsplit: true,
                    range: true
                };
                $scope.light_slider = {
                    model: [],
                    labels: [0, 400],
                    values:  [100,200],
                    step: 10,
                    prefix:"",         
                    suffix:" lux",
                };
                $scope.temp_slider = {
                    model: [],
                    labels: [-20, 50],
                    values:  [10,20],
                    step: 1,
                    prefix:"",
                    suffix:" °C",
                };
                $scope.moisture_slider = {
                    model: [],
                    labels: [0, 800],
                    values:  [100,400],
                    step: 10,
                    prefix:"",
                    suffix:"",
                };
                $scope.pH_slider = {
                    model: [],
                    values: [6.5*2,7.5*2],
                    tooltip: "hide",
                    step: 0.5,
                    ticks: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28],
                    ticks_labels: ["0","","1","","2","","3","","4","","5","","6","","7","","8","","9","","10","","11","","12","","13","","14"],
                    prefix:"",
                    suffix:"",
                };
                 $scope.months_slider = {
                    model: [],
                    values: [3,9],
                    tooltip: "hide",
                    step: 1,
                    ticks: [1,2,3,4,5,6,7,8,9,10,11,12],
                    ticks_labels: ["January","February","March","April","Mai","June","July","August", "September","October","November","December"],
                    prefix:"",
                    suffix:"",
                };
                 $scope.hours_slider = {
                    model: [],
                    values: [6,18],
                    tooltip: "hide",
                    step: 1,
                    ticks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
                    ticks_labels: ["1:00","2:00","3:00","4:00","5:00","6:00","7:00","8:00", "9:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00", "20:00","21:00","22:00","23:00","24:00"],
                    prefix:"",
                    suffix:"",
                };
                $scope.formatterFn = function (value, prefix, suffix) {
                    return prefix + value + suffix;
                };




            }]);



