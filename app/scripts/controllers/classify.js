'use strict';
angular.module('openSenseMapApp')
        .controller('ClassifyCtrl', ['$rootScope', '$scope', '$http', '$filter', '$timeout', '$location', '$routeParams', 'OpenSenseBoxes', 'OpenSenseBoxesSensors', 'OpenSenseBox', 'OpenSenseBoxData', 'leafletEvents', 'validation', 'ngDialog', 'leafletData', 'OpenSenseBoxAPI', 'vdsMultirangeViews',
            function ($rootScope, $scope, $http, $filter, $timeout, $location, $routeParams, OpenSenseBoxes, OpenSenseBoxesSensors, OpenSenseBox, OpenSenseBoxData, leafletEvents, Validation, ngDialog, leafletData, OpenSenseBoxAPI) {
                $scope.rangeLight_Bounds = [
                    {value: 0.25, name: 'shady/semi-shade'},
                    {value: 0.5, name: 'semi-shade/sunny'}
                ];
                $scope.rangeLight_Months = [
                    {value: 2 / 11, name: 'start'},
                    {value: 8 / 11, name: 'end'}
                ];
                $scope.rangeLight_Hours = [
                    {value: 8 / 24, name: 'start'},
                    {value: 19 / 24, name: 'end'}
                ];
                $scope.viewHours = vdsMultirangeViews.TIME;
                $scope.viewMonths = [
                    {
                        zoom: 0.8,
                        step: 1 / 11,
                        // visible units for this view, first entry being the major unit
                        units: [
                            {
                                value: 1 / 11,
                                // function to transform your value into labels | true: value itself | false: none
                                labeller: function (n) {
                                    var months = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                                    return months[Math.round(n * 11)];
                                }
                            }

                        ]
                    }];
                $scope.viewBounds = [
                    {
                        zoom: 0.8,
                        step: 1 / 400,
                        // visible units for this view, first entry being the major unit
                        units: [
                            {
                                value: 1 / 16,
                                // function to transform your value into labels | true: value itself | false: none
                                labeller: function (n) {
                                    return Math.round(n * 16 * 25);
                                }
                            },
                            {
                                value: 1 / 32
                            }

                        ]
                    }];
            }]);



