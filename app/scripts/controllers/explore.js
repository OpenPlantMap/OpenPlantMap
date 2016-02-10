'use strict';
angular.module('openSenseMapApp')
        .controller('ExploreCtrl', ['$rootScope', '$scope', '$http', '$filter', '$timeout', '$location', '$routeParams', 'OpenSenseBoxes',
		'OpenSenseBoxCondition', 'OpenSenseBoxesSensors','Plants', 'OpenSenseBox', 'OpenSenseBoxData', 'leafletMapEvents', 'validation', 'ngDialog', 'leafletData', 'OpenSenseBoxAPI','sliderValues',
            function ($rootScope, $scope, $http, $filter, $timeout, $location, $routeParams, OpenSenseBoxes, OpenSenseBoxCondition,OpenSenseBoxesSensors, Plants, OpenSenseBox, OpenSenseBoxData, leafletMapEvents, Validation, ngDialog, leafletData, OpenSenseBoxAPI,sliderValues) {

                $scope.osemapi = OpenSenseBoxAPI;
                $scope.selectedMarker = '';
                $scope.selectedMarkerData = [];
                $scope.markers = [];
                $scope.mapMarkers = [];
                $scope.pagedMarkers = [];
                $scope.prom;
                $scope.delay = 60000;
                $scope.searchText = '';
                $scope.detailsPanel = false;
                $scope.filterPanel = false;
                $scope.downloadPanel = false;
                $scope.image = "placeholder.png";
                // side panel statuses
                $scope.sidebarActive = false;
                $scope.editIsCollapsed = true;
                $scope.deleteIsCollapsed = true;
                $scope.editableMode = false;
                // variables for charts
                $scope.oneAtATime = true;
                $scope.lastData = []; //Store data from the selected sensor
                $scope.values = [];
                $scope.currentState = ''; //Check state of plots

                // todo: make this globally accessible, used in registration as well
                $scope.phenomenoms = [
                    {value: 1, text: 'Temperatur', unit: '°C', type: 'BMP085'},
                    {value: 2, text: 'Luftfeuchtigkeit', unit: '%', type: 'DHT11'},
                    {value: 3, text: 'Luftdruck', unit: 'Pa', type: 'BMP085'},
                    {value: 4, text: 'Schall', unit: 'Pegel', type: 'LM386'},
                    {value: 5, text: 'Licht', unit: 'Pegel', type: 'GL5528'},
                    {value: 6, text: 'Licht (digital)', unit: 'lx', type: 'TSL2561'},
                    {value: 7, text: 'UV', unit: 'µW/cm²', type: 'GUVA-S12D'},
                    {value: 8, text: 'Kamera', unit: '', type: ''},
                ];
                $scope.dateNow = new Date();
                $scope.downloadform = {};
                $scope.downloadform.daysAgo = 1;
                $scope.downloadform.dateTo = new Date();
                $scope.$watch('downloadform.daysAgo', function () {
                    $scope.downloadform.dateFrom = new Date((new Date()).valueOf() - 1000 * 60 * 60 * 24 * $scope.downloadform.daysAgo);
                });
                $scope.center = {
                    lat: 51.04139389812637,
                    lng: 10.21728515625,
                    zoom: 6
                };
                //##############################added
                $scope.events = {
                    map: {
                        enable: leafletMapEvents.getAvailableMapEvents(),
                        logic: 'emit'
                    }
                };
                $scope.marker_in_buffer = [];
                $scope.paths = {};
                function addBuffer() {
                    $scope.paths = {
                        buffer: {
                            weight: 2,
                            color: '#ff612f',
                            type: 'circleMarker',
                            latlngs: $scope.center,
                            clickable: false
                        }
                    };
                }
                $scope.$on('leafletDirectiveMap.map_main.click', function (event, args) {
                    addBuffer();
                    adapt_Buffer_radius(select_all_Markers_in_Buffer);
                    $scope.show_oneSenseBox = false;
                    $scope.show_manyBoxesAndPlants = true;
                });
                function select_all_Markers_in_Buffer() {
                    var marker = $scope.markers;
                    $scope.marker_in_buffer = [];
                    var radius = $scope.paths.buffer.radius;
                    leafletData.getMap().then(function (map) {
                        var buffer_center_latlng = L.latLng($scope.center.lat, $scope.center.lng);
                        var buffer_center_point = map.project(buffer_center_latlng);
                        //select all boxes which are within the buffer
                        for (var i = 0; i < marker.length; i++) {
                            var latlng = L.latLng(marker[i].lat, marker[i].lng);
                            var point = map.project(latlng);
                            if (getDistance(buffer_center_point, point) <= radius) {
                                $scope.marker_in_buffer.push(i);
                                select_object_in_buffer(i);
                            } else {
                                deselect_object_in_buffer(i);
                            }

                        }
//                        alert($scope.marker_in_buffer.length);
                    });
                }
                function getDistance(p0, p1) {
                    // Pythagorean theorem
                    return Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
                }
                function select_object_in_buffer(id) {
                    switch ($scope.markers[id].icon.icon) {
                        case 'cube':
                            $scope.markers[id].icon = icons.senseBox_selected;
                            break;
                        case 'tree':
                            $scope.markers[id].icon = icons.plant_selected;
                            break;
                        case 'tint':
                            $scope.markers[id].icon = icons.moisture_selected;
                            break;
                        case 'lightbulb-o':
                            $scope.markers[id].icon = icons.light_selected;
                            break;
                        case 'area-chart':
                            $scope.markers[id].icon = icons.temperature_selected;
                            break;
                        case 'bar-chart':
                            $scope.markers[id].icon = icons.ph_selected;
                            break;
                    }


                }
                function deselect_object_in_buffer(id) {
                    switch ($scope.markers[id].icon.icon) {
                        case 'cube':
                            $scope.markers[id].icon = icons.senseBox;
                            break;
                        case 'tree':
                            $scope.markers[id].icon = icons.plant;
                            break;
                        case 'tint':
                            $scope.markers[id].icon = icons.moisture;
                            break;
                        case 'lightbulb-o':
                            $scope.markers[id].icon = icons.light;
                            break;
                        case 'area-chart':
                            $scope.markers[id].icon = icons.temperature;
                            break;
                        case 'bar-chart':
                            $scope.markers[id].icon = icons.ph;
                            break;
                    }

                }
                function deselect_all_objects() {
                    var marker = $scope.markers;
                    for (var i = 0; i < marker.length; i++) {
                        deselect_object_in_buffer(i);
                    }
                }
                function adapt_Buffer_radius(furtherWork) {
                    leafletData.getMap().then(function (map) {
                        var bounds = map.getBounds();
                        var center = bounds.getCenter();
                        var point_center = map.project(center);
                        var north = L.latLng(bounds.getNorth(), center.lng);
                        var point_north = map.project(north);
                        var east = L.latLng(center.lat, bounds.getEast());
                        var point_east = map.project(east);
                        var dist_vertical = getDistance(point_center, point_north);
                        var dist_horizontal = getDistance(point_center, point_east);
                        if (dist_vertical < dist_horizontal) {
                            $scope.paths.buffer.radius = Math.round(dist_vertical);
                        } else {
                            $scope.paths.buffer.radius = Math.round(dist_horizontal);
                        }
                        if (typeof furtherWork !== 'undefined') {
                            furtherWork();
                        }

                        //alert(dist_vertical + ", " + dist_horizontal);
                    });
                }
                $scope.$on('leafletDirectiveMap.map_main.zoomend', function (event, args) {
                    adapt_Buffer_radius(select_all_Markers_in_Buffer);
                });
                $scope.$on('leafletDirectiveMap.map_main.moveend', function (event, args) {
                    adapt_Buffer_radius(select_all_Markers_in_Buffer);
                });
                $scope.hide_show_Buffer = function () {
                    if (typeof $scope.paths.buffer !== 'undefined') {
                        $scope.paths = {};
                        deselect_all_objects();
                        $scope.show_oneSenseBox = true;
                        $scope.show_manyBoxesAndPlants = false;
                    } else {
                        addBuffer();
                        adapt_Buffer_radius(select_all_Markers_in_Buffer);
                        $scope.show_oneSenseBox = false;
                        $scope.show_manyBoxesAndPlants = true;
                    }
                };
                $scope.layers = {
                    baselayers: {
                        mapQuest: {
                            name: 'mapQuest',
                            type: 'xyz',
                            url: "http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg", // Mapquest Open
                            layerOptions: {
                                subdomains: "1234",
                                //attribution in info modal
                                detectRetina: true,
                                reuseTiles: true
                            }
                        }
                    },
                    overlays: {
                        senseBox: {
                            type: 'group',
                            name: 'senseBox',
                            visible: true
                        },
                        plant: {
                            type: 'group',
                            name: 'plant',
                            visible: true
                        }
                    }
                };
                $scope.hide_show_SenseBoxes = function () {
                    $scope.layers.overlays.senseBox.visible = !$scope.layers.overlays.senseBox.visible;
                };
                $scope.hide_show_Plants = function () {
                    $scope.layers.overlays.plant.visible = !$scope.layers.overlays.plant.visible;
                };
                $scope.selectedMarkerCondition = {};
                $scope.show_manyBoxesAndPlants = false;
                $scope.show_oneSenseBox = true;
                $scope.selectedMarkerCondition.temperature = {};
                $scope.selectedMarkerCondition.temperature.interval_names = ['cold', 'medium', 'hot'];
                $scope.selectedMarkerCondition.temperature.class_1 = {};
                $scope.selectedMarkerCondition.temperature.class_2 = {};
                $scope.selectedMarkerCondition.temperature.class_3 = {};
                $scope.temperature_firstClass = [];
                $scope.selectedMarkerCondition.light = {};
                $scope.selectedMarkerCondition.light.interval_names = ['shady', 'semi-shady', 'sunny'];
                $scope.selectedMarkerCondition.light.class_1 = {};
                $scope.selectedMarkerCondition.light.class_2 = {};
                $scope.selectedMarkerCondition.light.class_3 = {};
                $scope.light_firstClass = [];
                $scope.selectedMarkerCondition.moisture = {};
                $scope.selectedMarkerCondition.moisture.interval_names = ['dry', 'semi-humid', 'humid'];
                $scope.selectedMarkerCondition.moisture.class_1 = {};
                $scope.selectedMarkerCondition.moisture.class_2 = {};
                $scope.selectedMarkerCondition.moisture.class_3 = {};
                $scope.moisture_firstClass = [];
                $scope.selectedMarkerCondition.ph = {};
                $scope.selectedMarkerCondition.ph.interval_names = ['acid', 'neutral', 'basic'];
                $scope.selectedMarkerCondition.ph.class_1 = {};
                $scope.selectedMarkerCondition.ph.class_2 = {};
                $scope.selectedMarkerCondition.ph.class_3 = {};
                $scope.ph_firstClass = [];
                function getBiggestPercentageInterval(first1, second1, third1) {
                    var first;
                    var second;
                    var third;
                    var array = [];
                    if (typeof first1[0] !== "undefined") {
                        first = Number(first1[0].percentage);
                    } else {
                        first = -99999;
                    }
                    if (typeof second1[0] !== "undefined") {
                        second = Number(second1[0].percentage);
                    } else {
                        second = -99999;
                    }
                    if (typeof third1[0] !== "undefined") {
                        third = Number(third1[0].percentage);
                    } else {
                        third = -99999;
                    }
                    if (first > second) {
                        if (first > third) {
                            array.push(1);
                            if (second > third) {
                                array.push(2);
                                array.push(3);
                            } else {
                                array.push(3);
                                array.push(2);
                            }
                        } else {
                            array.push(3);
                            if (second > first) {
                                array.push(2);
                                array.push(1);
                            } else {
                                array.push(1);
                                array.push(2);
                            }
                        }
                    } else {
                        if (second > third) {
                            array.push(2);
                            if (first > third) {
                                array.push(1);
                                array.push(3);
                            } else {
                                array.push(3);
                                array.push(1);
                            }
                        } else {
                            array.push(3);
                            if (second > first) {
                                array.push(2);
                                array.push(1);
                            } else {
                                array.push(1);
                                array.push(2);
                            }
                        }
                    }
                    return array;
                }
                //############################end added
                $scope.counter = 3;
                $scope.timeout;
                $scope.stopcountdown = function () {
                    $timeout.cancel($scope.countdown);
                };
                $scope.countdown = function () {
                    if ($scope.counter === 0) {
                        ngDialog.close();
                        $scope.stopcountdown();
                    } else {
                        $scope.counter--;
                        $scope.timeout = $timeout($scope.countdown, 1000);
                        switch ($scope.counter) {
                            case 1:
                                document.getElementById("zundungheader").innerHTML = "<strong>EINS</strong>";
                                break;
                            case 2:
                                document.getElementById("zundungheader").innerHTML = "<strong>ZWEI</strong>";
                                break;
                            case 3:
                                document.getElementById("zundungheader").innerHTML = "<strong>DREI</strong>";
                                break;
                        }
                    }
                };
                $scope.launch = function () {
                    document.getElementById("rocket").remove();
                    document.getElementById("zundungheader").innerHTML = "<strong>DREI</strong>";
                    $scope.timeout = $timeout($scope.countdown, 1000);
                };
                $scope.$on('ngDialog.closing', function (e, $dialog) {
					// adding markers for plants:
					Plants.query(function (response){
						for (var i = 0; i < response.length; i++){
							var plantMarker = {};
							plantMarker.lng = response[i].loc[1];
							plantMarker.lat = response[i].loc[0];
							plantMarker.id = response[i]._id;
							plantMarker.image = response[i]._id+'.jpeg';
							plantMarker.icon = icons.plant;
							plantMarker.layer = 'plant';
							console.log("PLANTTEST",plantMarker.lng+","+plantMarker.lat);
							$scope.markers.push(plantMarker);
						}
						$scope.mapMarkers = $scope.markers;
					});
                    OpenSenseBoxes.query(function (response) {
                        for (var i = 0; i <= response.length - 1; i++) {
                            var tempMarker = {};
                            tempMarker.phenomenons = [];
                            tempMarker.lng = response[i].loc[0].geometry.coordinates[0];
                            tempMarker.lat = response[i].loc[0].geometry.coordinates[1];
                            tempMarker.id = response[i]._id;
                            switch ($location.path()) {
                                case "/":
                                case "/explore":
                                    tempMarker.icon = icons.senseBox;
                                    break;
                                case "/explore/Light":
                                    tempMarker.icon = icons.light;
                                    break;
                                case "/explore/Moisture":
                                    tempMarker.icon = icons.moisture;
                                    break;
                                case "/explore/PH":
                                    tempMarker.icon = icons.ph;
                                    break;
                                case "/explore/Temp":
                                    tempMarker.icon = icons.temperature;
                                    break;
                                default:
                                    tempMarker.icon = icons.senseBox;
                            }
                            tempMarker.name = response[i].name;
                            tempMarker.sensors = response[i].sensors;
                            tempMarker.image = response[i].image;
                            tempMarker.layer = 'senseBox';
                            for (var j = response[i].sensors.length - 1; j >= 0; j--) {
                                tempMarker.phenomenons.push(response[i].sensors[j].title);
                            }
                            ;
                            $scope.markers.push(tempMarker);
                        }
                        $scope.mapMarkers = $scope.markers;
                    });
                });
                //helper function to zoomTo object for filter sidebar
                $scope.zoomTo = function (lat, lng) {
                    $scope.center.lat = lat;
                    $scope.center.lng = lng;
                    $scope.center.zoom = 15;
                };
                $scope.added = function (file, event) {
                    if ((file.getExtension() === "jpg" || file.getExtension() === "png" || file.getExtension() === "jpeg") && file.size < 1500000) {
                        return true;
                    } else {
                        return false;
                    }
                };
                if ($routeParams.boxid !== undefined) {
                    //TODO find boxid
                    OpenSenseBox.query({boxId: $routeParams.boxid}, function (response) {
                        $scope.sidebarActive = true;
                        $scope.detailsPanel = false;
                        $scope.downloadPanel = false;
                        $scope.filterPanel = false;
                        $scope.selectedMarker = response;
                        $rootScope.selectedBox = $scope.selectedMarker._id;
                        if ($location.path().indexOf("/explore") === 0) {
                            $scope.detailsPanel = true;
                        } else if ($location.path().indexOf("/download") === 0) {
                            $scope.downloadPanel = true;
                        }

                        if ($scope.selectedMarker.image === undefined || $scope.selectedMarker.image === "") {
                            $scope.image = "placeholder.png";
                        } else {
                            $scope.image = $scope.selectedMarker.image;
                        }
                        $scope.getMeasurements();
                        var lat = response.loc[0].geometry.coordinates[1];
                        var lng = response.loc[0].geometry.coordinates[0];
                        $scope.zoomTo(lat, lng);
                    });
                    //added
                    selectedMarkerConfig($routeParams.boxid);

                    //end added
                }
                if ($location.path().indexOf("/download") === 0) {
                    $scope.sidebarActive = true;
                    $scope.detailsPanel = false;
                    $scope.filterPanel = false;
                    $scope.downloadPanel = true;
                }

                $scope.downloadArduino = function () {
                    var boxId = "";
                    if ($scope.selectedMarker.id === undefined) {
                        boxId = $scope.selectedMarker._id;
                    } else {
                        boxId = $scope.selectedMarker.id;
                    }
                    Validation.checkApiKey(boxId, $scope.apikey.key).then(function (status) {
                        if (status === 200) {
                            document.getElementById("downloadlink").href = "files/" + boxId + ".ino";
                            $timeout(function () {
                                document.getElementById("downloadlink").click();
                            }, 100);
                            $scope.downloadArduino = false;
                        } else {

                        }
                    });
                };
                $scope.tmpSensor = {};
                $scope.filterOpts = [
                    {name: 'Phänomen'},
                    {name: 'Name'}
                ];
                $scope.selectedFilterOption = 'Phänomen';
                var icons = {
                    senseBox: {
                        type: 'awesomeMarker',
                        prefix: 'fa',
                        icon: 'cube',
                        markerColor: 'red'
                    },
                    senseBox_selected: {
                        type: 'awesomeMarker',
                        prefix: 'fa',
                        icon: 'cube',
                        iconColor: 'yellow',
                        markerColor: 'red'
                    },
                    plant: {
                        type: 'awesomeMarker',
                        prefix: 'fa',
                        icon: 'tree',
                        markerColor: 'green'
                    },
                    plant_selected: {
                        type: 'awesomeMarker',
                        prefix: 'fa',
                        icon: 'tree',
                        iconColor: 'yellow',
                        markerColor: 'green'
                    },
                    light: {
                        type: 'awesomeMarker',
                        prefix: 'fa',
                        icon: 'lightbulb-o',
                        markerColor: 'orange'
                    },
                    light_selected: {
                        type: 'awesomeMarker',
                        prefix: 'fa',
                        icon: 'lightbulb-o',
                        iconColor: 'yellow',
                        markerColor: 'orange'
                    },
                    moisture: {
                        type: 'awesomeMarker',
                        prefix: 'fa',
                        icon: 'tint',
                        markerColor: 'blue'
                    },
                    moisture_selected: {
                        type: 'awesomeMarker',
                        prefix: 'fa',
                        icon: 'tint',
                        iconColor: 'yellow',
                        markerColor: 'blue'
                    },
                    temperature: {
                        type: 'awesomeMarker',
                        prefix: 'fa',
                        icon: 'area-chart',
                        markerColor: 'red'
                    },
                    temperature_selected: {
                        type: 'awesomeMarker',
                        prefix: 'fa',
                        icon: 'area-chart',
                        iconColor: 'yellow',
                        markerColor: 'red'
                    },
                    ph: {
                        type: 'awesomeMarker',
                        prefix: 'fa',
                        icon: 'bar-chart',
                        markerColor: 'red'
                    },
                    ph_selected: {
                        type: 'awesomeMarker',
                        prefix: 'fa',
                        icon: 'bar-chart',
                        iconColor: 'yellow',
                        markerColor: 'red'
                    }
                };
                $scope.openDialog = function () {
                    $scope.launchTemp = ngDialog.open({
                        template: '../../views/app_info_modal.html',
                        className: 'ngdialog-theme-default',
                        scope: $scope,
                        showClose: false,
                        controller: ['$scope', '$filter', function ($scope, $filter) {
                                // controller logic
                            }]
                    });
                };
                if ($location.path() === "/launch") {
                    ngDialog.open({
                        template: '../../views/launch_modal.html',
                        className: 'ngdialog-theme-flat ngdialog-theme-custom',
                        scope: $scope
                    });
                }

                $scope.$watchCollection('searchText', function (newValue, oldValue) {
                    if (newValue === oldValue) {
                        return;
                    }
                    ;
                    var data = angular.copy($scope.markers);
                    var justGroup = _.filter(data, function (x) {
                        if ($scope.selectedFilterOption == "Phänomen") {
                            if (newValue == '' | newValue == undefined) {
                                if (!newValue) {
                                    return true;
                                } else {
                                    for (var i in x.sensors) {
                                        $filter('filter')([x.sensors[i].title], newValue).length > 0;
                                    }
                                }
                                ;
                            } else {
                                for (var i in x.sensors) {
                                    if ($filter('filter')([x.sensors[i].title], newValue).length > 0) {
                                        return x;
                                    }
                                    ;
                                }
                            }
                            ;
                        } else if ($scope.selectedFilterOption == "Name") {
                            if (newValue == '' | newValue == undefined) {
                                if (!newValue) {
                                    return true;
                                } else {
                                    $filter('filter')([x.name], newValue).length > 0;
                                }
                                ;
                            } else {
                                if ($filter('filter')([x.name], newValue).length > 0) {
                                    return x;
                                }
                                ;
                            }
                            ;
                        }
                        ;
                    });
                    data = justGroup;
                    $scope.mapMarkers = data;
                });
                $scope.closeSidebar = function () {
                    $scope.sidebarActive = false;
                    $scope.editIsCollapsed = false;
                    $scope.deleteIsCollapsed = false;
                    $scope.downloadIsCollapsed = false;
                    $scope.selectedMarker = '';
                    $scope.editableMode = false;
                    $scope.apikey.key = '';
                    $scope.stopit();
                    $location.path('/explore', false);
                }

                $scope.saveChange = function (event) {
                    console.log("Saving change");
                    var boxid = $scope.selectedMarker.id || $scope.selectedMarker._id;
                    var imgsrc = angular.element(document.getElementById("image")).attr('src');
                    var newBoxData = {
                        tmpSensorName: $scope.tmpSensor.name,
                        image: imgsrc
                    }
                    $http.put($scope.osemapi.url + '/boxes/' + boxid, newBoxData, {headers: {'X-ApiKey': $scope.apikey.key}}).
                            success(function (data, status) {
                                $scope.editableMode = !$scope.editableMode;
                                $scope.selectedMarker = data;
                                if (data.image === "") {
                                    $scope.image = "placeholder.png";
                                } else {
                                    $scope.image = data.image;
                                }
                            }).
                            error(function (data, status) {
                                // todo: display an error message
                            });
                }

                $scope.discardChanges = function () {
                    $scope.editableMode = !$scope.editableMode;
                    $scope.selectedMarker = $scope.tmpSensor;
                    $scope.image = $scope.tmpSensor.image;
                }

                $scope.deleteBox = function () {
                    // to do
                }

                $scope.checkName = function (data) {
                    if (data == '') {
                        return "";
                    }
                };
                //Create our own control for listing
                var listControl = L.control();
                listControl.setPosition('topleft');
                listControl.onAdd = function () {
                    var className = 'leaflet-control-my-location',
                            container = L.DomUtil.create('div', className + ' leaflet-bar leaflet-control');
                    var link = L.DomUtil.create('a', ' ', container);
                    link.href = '#';
                    L.DomUtil.create('i', 'fa fa-list fa-lg', link);
                    L.DomEvent
                            .on(link, 'click', L.DomEvent.preventDefault)
                            .on(link, 'click', function () {
                                $scope.sidebarActive = true;
                                $scope.detailsPanel = false;
                                $scope.filterPanel = true;
                                $scope.downloadPanel = false;
                            });
                    return container;
                };
                var geoCoderControl = L.Control.geocoder({
                    position: 'topleft',
                    placeholder: $filter('translate')('SEARCH_ADDRESS')
                });
                geoCoderControl.markGeocode = function (result) {
                    leafletData.getMap().then(function (map) {
                        map.fitBounds(result.bbox);
                    });
                }

                //adds the controls to our map
                $scope.controls = {
                    custom: [listControl, geoCoderControl]
                };
                $scope.$watch('sidebarActive', function () {
                    if ($scope.sidebarActive) {
                        // hide controls
                    } else {
                        // re-enable controls
                    }
                });
                $scope.apikey = {};
                $scope.enableEditableMode = function () {
                    var boxId = $scope.selectedMarker._id || $scope.selectedMarker.id;
                    Validation.checkApiKey(boxId, $scope.apikey.key).then(function (status) {
                        if (status === 200) {
                            $scope.editableMode = !$scope.editableMode;
                            $scope.editIsCollapsed = false;
                            $scope.tmpSensor = angular.copy($scope.selectedMarker);
                        } else {
                            $scope.editableMode = false;
                        }
                    });
                }

                $scope.defaults = {
                    controls: {
                        layers: {
                            visible: false
                        }
                    },
                    scrollWheelZoom: true
                };
                $scope.formatTime = function (time) {
                    $scope.date = new Date(time);
                    $scope.currentTime = new Date();
                    $scope.difference = Math.round(($scope.currentTime - $scope.date) / 60000);
                    return $scope.difference;
                };
                $scope.$on('leafletDirectiveMarker.map_main.click', function (e, args) {
                    // Args will contain the marker name and other relevant information
                    //console.log(args);
                    $scope.sidebarActive = true;
                    $scope.detailsPanel = true;
                    $scope.filterPanel = false;
                    $scope.downloadPanel = false;
                    $scope.selectedMarker = $scope.filteredMarkers[args.modelName]; // see explore.html:160

                    if ($scope.selectedMarker.image === undefined || $scope.selectedMarker.image === "") {
                        $scope.image = "placeholder.png";
                    } else {
                        $scope.image = $scope.selectedMarker.image;
                    }
                    $scope.getMeasurements();
                    $scope.center.lat = args.leafletEvent.target._latlng.lat;
                    $scope.center.lng = args.leafletEvent.target._latlng.lng;
                    $scope.center.zoom = 15;
                    $rootScope.selectedBox = $scope.selectedMarker.id;
                    $location.path('/explore/' + $scope.selectedMarker.id, false);
                    //added
                    selectedMarkerConfig($scope.selectedMarker.id);

                    //endadded
                });
                if ($location.path() !== "/launch") {
					// adding markers for plants:
					Plants.query(function (response){
						console.log("PLANTTEST",response);
						console.log("PLANTTEST response length:",response.length);
						for (var i = 0; i < response.length; i++){
							var plantMarker = {};
							plantMarker.lng = response[i].loc[1];
							plantMarker.lat = response[i].loc[0];
							plantMarker.id = response[i]._id;
							plantMarker.image = response[i]._id+'.jpeg';
							plantMarker.icon = icons.plant;
							plantMarker.layer = 'plant';
							console.log("PLANTTEST",plantMarker.lng+","+plantMarker.lat);
							$scope.markers.push(plantMarker);
						}
						$scope.mapMarkers = $scope.markers;
					});
                    OpenSenseBoxes.query(function (response) {
                        for (var i = 0; i <= response.length - 1; i++) {
                            var tempMarker = {};
                            tempMarker.phenomenons = []
                            tempMarker.lng = response[i].loc[0].geometry.coordinates[0];
                            tempMarker.lat = response[i].loc[0].geometry.coordinates[1];
                            tempMarker.id = response[i]._id;
                            switch ($location.path()) {
                                case "/":
                                case "/explore":
                                    tempMarker.icon = icons.senseBox;
                                    break;
                                case "/explore/Light":
                                    tempMarker.icon = icons.light;
                                    break;
                                case "/explore/Moisture":
                                    tempMarker.icon = icons.moisture;
                                    break;
                                case "/explore/PH":
                                    tempMarker.icon = icons.ph;
                                    break;
                                case "/explore/Temp":
                                    tempMarker.icon = icons.temperature;
                                    break;
                                default:
                                    tempMarker.icon = icons.senseBox;
                            }
                            tempMarker.name = response[i].name;
                            tempMarker.sensors = response[i].sensors;
                            tempMarker.image = response[i].image;
                            tempMarker.layer = 'senseBox';
                            for (var j = response[i].sensors.length - 1; j >= 0; j--) {
                                tempMarker.phenomenons.push(response[i].sensors[j].title);
                            }
                            ;
                            $scope.markers.push(tempMarker);
                        }
                        $scope.mapMarkers = $scope.markers;
                    });
                }

                $scope.stopit = function () {
                    $timeout.cancel($scope.prom);
                };
                $scope.clickcounter = 0;
                $scope.getMeasurements = function () {
                    // console.log($scope.selectedMarker);
                    var box = $scope.selectedMarker.id || $scope.selectedMarker._id
                    $scope.chartConfigs = [];
                    //$scope.prom = $timeout($scope.getMeasurements, $scope.delay);
                    OpenSenseBoxesSensors.query({boxId: box}, function (response) {
                        $scope.selectedMarkerData = response;
                    });
                };
                $scope.getData = function (selectedSensor) {
                    $scope.selectedSensor = selectedSensor;
                    var initDate = new Date();
                    var endDate = '';
                    var box = $scope.selectedMarker.id || $scope.selectedMarker._id;
                    // Get the date of the last taken measurement for the selected sensor
                    for (var i = 0; i < $scope.selectedMarker.sensors.length; i++) {
                        if ($scope.selectedMarker.sensors[i]._id == selectedSensor._id) {

                            console.log($scope.selectedMarker);
                            $scope.chartConfigs[$scope.selectedMarker.sensors[i]._id] = chartConfigDefaults;
                            if ($scope.selectedMarker.sensors[i].lastMeasurement != null) { // means that there is no data for this sensor
                                endDate = $scope.selectedMarker.sensors[i].lastMeasurement.createdAt;
                            }
                            //console.log($scope.selectedMarker);
                            break;
                        }
                    }

                    $scope.lastData.splice(0, $scope.lastData.length);
                    OpenSenseBoxData.query({boxId: box, sensorId: selectedSensor._id, date1: '', date2: endDate})
                            .$promise.then(function (response) {
                                for (var i = 0; i < response.length; i++) {
                                    var d = new Date(response[i].createdAt);
                                    $scope.lastData.push([
                                        Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()),
                                        parseFloat(response[i].value)
                                    ]);
                                }
                                ;
                                $scope.updateCharts(selectedSensor);
                            });
                };
                // Update chart data according to the selected sensor(title, yaxis)
                $scope.updateCharts = function (sensor) {
                    $scope.chartConfigs[sensor._id].options.title.text = $filter('translate')(sensor.title);
                    $scope.chartConfigs[sensor._id].series[0].name = $filter('translate')(sensor.unit);
                    $scope.chartConfigs[sensor._id].options.yAxis.title.text = $filter('translate')(sensor.unit);
                    $scope.chartConfigs[sensor._id].loading = false;
                };
                // Charts
                $scope.chartConfigs = [];
                var chartConfigDefaults = {
                    loading: true,
                    options: {
                        tooltip: {
                            formatter: function () {
                                var d = new Date(this.x);
                                var htmlstring = Highcharts.dateFormat('%Y-%m-%d %H:%M:%S.', d) +
                                        '<br><span style="color:' + this.series.color + '">●</span> ' +
                                        this.y + ' ' + this.series.name;
                                return htmlstring;
                            },
                            xDateFormat: '%Y-%m-%d %H:%M:%S'
                        },
                        chart: {
                            zoomType: 'x',
                            backgroundColor: 'rgba(255, 255, 255, 1)'
                        },
                        title: {
                            text: ''
                        },
                        credits: {
                            enabled: false
                        },
                        xAxis: {
                            type: 'datetime'
                        },
                        yAxis: {
                            title: {
                                text: ''
                            }
                        },
                        legend: {
                            enabled: false
                        },
                        plotOptions: {
                            scatter: {
                                animation: false,
                                marker: {radius: 2},
                            }
                        }
                    },
                    series: [{
                            type: 'scatter',
                            name: '',
                            pointInterval: 3600 * 24 * 15,
                            data: $scope.lastData
                        }]
                };
                $scope.dataDownload = function () {
                    var from = $filter('date')(new Date($scope.downloadform.dateFrom), 'yyyy-MM-dd');
                    var to = $filter('date')(new Date($scope.downloadform.dateTo), 'yyyy-MM-dd');
                    angular.element("body")
                            .append('<iframe src="' + $scope.osemapi.url + '/boxes/' + $rootScope.selectedBox + '/data/' + $scope.downloadform.sensorId + '?from-date=' + from + '&to-date=' + to + '&download=true&format=' + $scope.downloadform.format + '" style="display:none"></iframe>')
                }

                $scope.dateOptions = {
                    formatYear: 'yy',
                    startingDay: 1
                };
                $scope.openDatepicker = function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    if ($event.currentTarget.id === "datepicker1") {
                        $scope.opened1 = true;
                        $scope.opened2 = false;
                    } else if ($event.currentTarget.id === "datepicker2") {
                        $scope.opened2 = true;
                        $scope.opened1 = false;
                    }

                };
                //addedstart
                function selectedMarkerConfig(marker_id) {

                    OpenSenseBoxCondition.query({boxId: marker_id, measurement: 'Temperature', bound1: sliderValues.get_temp_values()[0], bound2: sliderValues.get_temp_values()[1]}, function (response) {
                        var mostValues = getBiggestPercentageInterval(response[0], response[1], response[2]);
                        $scope.selectedMarkerCondition.temperature.class_1.response = response[mostValues[0] - 1];
                        $scope.selectedMarkerCondition.temperature.class_1.name = $scope.selectedMarkerCondition.temperature.interval_names[mostValues[0] - 1];
                        $scope.temperature_firstClass=[];
                        $scope.temperature_firstClass.push('temp_' + $scope.selectedMarkerCondition.temperature.interval_names[mostValues[0] - 1]);
                        $scope.selectedMarkerCondition.temperature.class_2.response = response[mostValues[1] - 1];
                        $scope.selectedMarkerCondition.temperature.class_2.name = $scope.selectedMarkerCondition.temperature.interval_names[mostValues[1] - 1];
                        $scope.selectedMarkerCondition.temperature.class_3.response = response[mostValues[2] - 1];
                        $scope.selectedMarkerCondition.temperature.class_3.name = $scope.selectedMarkerCondition.temperature.interval_names[mostValues[2] - 1];
                    });
                    OpenSenseBoxCondition.query({boxId: marker_id, measurement: 'Light', bound1: sliderValues.get_light_values()[0], bound2: sliderValues.get_light_values()[1]}, function (response) {
                        var mostValues = getBiggestPercentageInterval(response[0], response[1], response[2]);
                        $scope.selectedMarkerCondition.light.class_1.response = response[mostValues[0] - 1];
                        $scope.selectedMarkerCondition.light.class_1.name = $scope.selectedMarkerCondition.light.interval_names[mostValues[0] - 1];
                        $scope.light_firstClass=[];
                        $scope.light_firstClass.push('light_' + $scope.selectedMarkerCondition.light.interval_names[mostValues[0] - 1]);
                        $scope.selectedMarkerCondition.light.class_2.response = response[mostValues[1] - 1];
                        $scope.selectedMarkerCondition.light.class_2.name = $scope.selectedMarkerCondition.light.interval_names[mostValues[1] - 1];
                        $scope.selectedMarkerCondition.light.class_3.response = response[mostValues[2] - 1];
                        $scope.selectedMarkerCondition.light.class_3.name = $scope.selectedMarkerCondition.light.interval_names[mostValues[2] - 1];
                    });
                    OpenSenseBoxCondition.query({boxId: marker_id, measurement: 'Moisture', bound1: sliderValues.get_moisture_values()[0], bound2: sliderValues.get_moisture_values()[1]}, function (response) {
                        var mostValues = getBiggestPercentageInterval(response[0], response[1], response[2]);
                        $scope.selectedMarkerCondition.moisture.class_1.response = response[mostValues[0] - 1];
                        $scope.selectedMarkerCondition.moisture.class_1.name = $scope.selectedMarkerCondition.moisture.interval_names[mostValues[0] - 1];
                        $scope.moisture_firstClass=[];
                        $scope.moisture_firstClass.push('moisture_' + $scope.selectedMarkerCondition.moisture.interval_names[mostValues[0] - 1]);
                        $scope.selectedMarkerCondition.moisture.class_2.response = response[mostValues[1] - 1];
                        $scope.selectedMarkerCondition.moisture.class_2.name = $scope.selectedMarkerCondition.moisture.interval_names[mostValues[1] - 1];
                        $scope.selectedMarkerCondition.moisture.class_3.response = response[mostValues[2] - 1];
                        $scope.selectedMarkerCondition.moisture.class_3.name = $scope.selectedMarkerCondition.moisture.interval_names[mostValues[2] - 1];
                    });
                    OpenSenseBoxCondition.query({boxId: marker_id, measurement: 'PH', bound1: sliderValues.get_ph_values()[0], bound2: sliderValues.get_ph_values()[1]}, function (response) {
                        var mostValues = getBiggestPercentageInterval(response[0], response[1], response[2]);
                        $scope.selectedMarkerCondition.ph.class_1.response = response[mostValues[0] - 1];
                        $scope.selectedMarkerCondition.ph.class_1.name = $scope.selectedMarkerCondition.ph.interval_names[mostValues[0] - 1];
                        $scope.ph_firstClass=[];
                        $scope.ph_firstClass.push('ph_' + $scope.selectedMarkerCondition.ph.interval_names[mostValues[0] - 1]);
                        $scope.selectedMarkerCondition.ph.class_2.response = response[mostValues[1] - 1];
                        $scope.selectedMarkerCondition.ph.class_2.name = $scope.selectedMarkerCondition.ph.interval_names[mostValues[1] - 1];
                        $scope.selectedMarkerCondition.ph.class_3.response = response[mostValues[2] - 1];
                        $scope.selectedMarkerCondition.ph.class_3.name = $scope.selectedMarkerCondition.ph.interval_names[mostValues[2] - 1];
                    });
                }
                //endAdded
            }]);



