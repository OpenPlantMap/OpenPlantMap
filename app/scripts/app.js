'use strict';

angular
        .module('openSenseMapApp', [
            'ngCookies',
            'ngResource',
            'ngSanitize',
            'ngRoute',
            'ngDialog',
            'leaflet-directive',
            'ui.bootstrap',
            'ui.bootstrap.accordion',
            'nya.bootstrap.select',
            'osemFilters',
            'angular-underscore',
            'rcWizard',
            'rcForm',
            'ngClipboard',
            'flow',
            'ui.checkbox',
            'highcharts-ng',
            'pascalprecht.translate',
            'ui.bootstrap-slider'
        ])
        .config(function ($routeProvider) {
            $routeProvider
                    .when('/', {
                        templateUrl: 'views/start.html',
                        controller: 'StartCtrl'
                    })
                    .when('/register', {
                        templateUrl: 'views/register.html',
                        controller: 'RegisterCtrl'
                    })
                    .when('/explore', {
                        templateUrl: 'views/explore.html',
                        controller: 'ExploreCtrl'
                    })
                    .when('/explore/Light', {
                        templateUrl: 'views/explore.html',
                        controller: 'ExploreCtrl'
                    })
                    .when('/explore/PH', {
                        templateUrl: 'views/explore.html',
                        controller: 'ExploreCtrl'
                    })
                    .when('/explore/Temp', {
                        templateUrl: 'views/explore.html',
                        controller: 'ExploreCtrl'
                    })
                    .when('/explore/Moisture', {
                        templateUrl: 'views/explore.html',
                        controller: 'ExploreCtrl'
                    })
                    .when('/launch', {
                        templateUrl: 'views/explore.html',
                        controller: 'ExploreCtrl'
                    })
                    .when('/getid', {
                        templateUrl: 'views/getid.html',
                        controller: 'GetIdCtrl'
                    })
                    .when('/explore/:boxid', {
                        templateUrl: 'views/explore.html',
                        controller: 'ExploreCtrl'
                    })
                    .when('/download', {
                        templateUrl: 'views/explore.html',
                        controller: 'ExploreCtrl'
                    })
                    .when('/download/:boxid', {
                        templateUrl: 'views/explore.html',
                        controller: 'ExploreCtrl'
                    })
                    .when('/classify/Light', {
                        templateUrl: 'views/classifyLight.html',
                        controller: 'ClassifyCtrl'
                    })
                    .when('/classify/Temp', {
                        templateUrl: 'views/classifyTemp.html',
                        controller: 'ClassifyCtrl'
                    })
                    .when('/classify/Moisture', {
                        templateUrl: 'views/classifyMoisture.html',
                        controller: 'ClassifyCtrl'
                    })
                    .when('/classify/Ph', {
                        templateUrl: 'views/classifyPh.html',
                        controller: 'ClassifyCtrl'
                    })
                    .when('/plant_viewer', {
                        templateUrl: 'views/plant_viewer.html',
                        controller: 'PlantCtrl'
                    })
                    .otherwise({
                        redirectTo: '/'
                    });
        })
        .config(['ngClipProvider', function (ngClipProvider) {
                ngClipProvider.setPath("bower_components/zeroclipboard/dist/ZeroClipboard.swf");
            }])
        .config(function ($translateProvider) {
            $translateProvider.useStaticFilesLoader({
                prefix: '../translations/',
                suffix: '.json'
            });
            $translateProvider.use('de_DE');
            $translateProvider.fallbackLanguage('de_DE');
            $translateProvider.preferredLanguage('de_DE');
            $translateProvider.determinePreferredLanguage();
            $translateProvider.useSanitizeValueStrategy('escaped');
        })
        .controller('HeaderCtrl', ['$scope', '$rootScope', '$translate', '$route','nav_elements', function ($scope, $rootScope, $translate, $route, nav_elements) {
                $scope.key = "de";
                $scope.changeLang = function (key) {
                    $translate.use(key).then(function (key) {
                        console.log("Sprache zu " + key + " gewechselt.");
                        $scope.key = key.split("_")[0];
                    }, function (key) {
                        console.log("Irgendwas lief schief");
                    });
                    $scope.changeLang($translate.use());
                }

                $rootScope.$watch('selectedBox', function () {
                    $scope.box = $rootScope.selectedBox;
                    console.log("box changed to " + $rootScope.selectedBox);
                });
                nav_elements.set_show(false);
                $scope.nav_elements=nav_elements;
                
            }])
        .filter('unsafe', ['$sce', function ($sce) {
                return function (val) {
                    return $sce.trustAsHtml(val);
                };
            }])
        .run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
                var original = $location.path;
                $rootScope.selectedBox = false;
                $location.path = function (path, reload) {
                    if (reload === false) {
                        var lastRoute = $route.current;
                        var un = $rootScope.$on('$locationChangeSuccess', function () {
                            $route.current = lastRoute;
                            un();
                        });
                    }
                    return original.apply($location, [path]);
                };
            }]);
