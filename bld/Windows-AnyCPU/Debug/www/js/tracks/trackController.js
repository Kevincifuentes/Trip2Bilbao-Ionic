angular.module('blusecur.track.controllers', [])

.controller('TrackMapCtrl', function ($rootScope, $timeout, $interval, $ionicPopup, $state, $stateParams, $filter, $translate, store, jwtHelper, $ionicModal, CrossingService, VesselService, CrewService, ContactsService, LovsService, LocationService, uiGmapGoogleMapApi) {
    $rootScope.data = {};
    $rootScope.account = store.get('account');
    $rootScope.counter = 0;

    var jwt = store.get('jwt');
    var decodedJwt = jwtHelper.decodeToken(jwt);
    var accountId = decodedJwt.accountId;
    $rootScope.accountId = accountId;

    $rootScope.track = $stateParams.track;
    $rootScope.trackPoints = new Array();
    $rootScope.trackMarkers = new Array();

    $rootScope.updatePolylines = function () {
        $rootScope.polylines = [{
            id: 1,
            path: $filter('orderBy')($rootScope.trackPoints, 'timestamp'),
            stroke: {
                color: 'rgba(0,0,100,0.50)',
                weight: 3.5
            },
            editable: true,
            draggable: false,
            geodesic: true,
            visible: true,
            icons: [{
                icon: {
                    path: 'M25.944,105.726c0,8.641,1.148,17.479,3.417,26.292c0.054,0.59,0.187,1.183,0.392,1.762    c0.665,1.851,6.611,18.283,10.725,25.247c21.032,39.987,49.879,74.216,85.732,101.751c0.625,0.714,1.396,1.326,2.275,1.778    c0.866,0.443,1.802,0.695,2.758,0.752c0.215,0.023,0.43,0.032,0.644,0.032c1.162,0,2.333-0.28,3.418-0.812    c0.798-0.397,1.505-0.948,2.093-1.61c80.204-61.429,95.848-125.815,96.426-128.333c2.371-9.024,3.57-18.059,3.57-26.864    C237.396,47.427,189.969,0,131.673,0C73.378,0,25.944,47.432,25.944,105.726z M74.921,88.24l11.077,19.989    c0.943,1.216,1.5,2.735,1.5,4.394c0,3.956-3.206,7.168-7.168,7.168c-0.033-0.004-0.061,0-0.096,0h-4.382    c3.246,25.541,23.503,45.806,49.044,49.044V64.894c-7.953-2.938-13.663-10.527-13.663-19.483c0-11.486,9.348-20.834,20.831-20.834    c11.481,0,20.834,9.348,20.834,20.834c0,8.956-5.717,16.545-13.665,19.483v103.942c25.538-3.238,45.798-23.503,49.042-49.044    h-4.369c-2.539,0-4.891-1.344-6.179-3.528c-1.288-2.188-1.325-4.893-0.094-7.115l11.584-20.904c1.26-2.28,3.668-3.689,6.272-3.689    s5.003,1.414,6.268,3.694l11.075,19.986c0.942,1.214,1.498,2.737,1.498,4.392c0,3.956-3.206,7.169-7.169,7.169    c-0.032-0.005-0.064,0-0.098,0h-4.312c-3.603,35.822-33.93,63.886-70.688,63.886c-36.76,0-67.084-28.063-70.692-63.886h-4.306    c-2.539,0-4.889-1.344-6.174-3.528c-1.291-2.189-1.326-4.894-0.096-7.115L62.38,88.254c1.263-2.285,3.666-3.694,6.27-3.694    C71.255,84.561,73.658,85.965,74.921,88.24z',
                    scale: 0.08,
                    rotation: 180,
                    strokeOpacity: 1,
                    strokeColor: 'white',
                    fillColor: 'navy',
                    fillOpacity: 1,
                    strokeWeight: 1,
                    anchor: new google.maps.Point(125, 280),
                },
                offset: '100%',
                zIndex: 9999
            }]
        }];
    }

    $rootScope.simularRuta = function () {
        $rootScope.actualizando = $interval(function () {
            $rootScope.counter = ($rootScope.counter + 0.033) % 200;
            $rootScope.polylines[0].icons[0].offset = ($rootScope.counter / 2) + '%';
        }, 10);
    }

    $rootScope.actualizarRuta = function () {
        $rootScope.actualizando = $interval(function () {
            $rootScope.updatePolylines();
        }, 1000);
    }

    $rootScope.getTrackPoints = function (track) {
        var markers = [];
        var image = 'img/marker.png';
        for (var i = 0; i < track.waypoints.length; i++) {
            var marker = {};
            marker.latitude = track.waypoints[i].lat;
            marker.longitude = track.waypoints[i].lon;
            //marker.title = 'mm';
            //marker.show = false;
            marker.timestamp = track.waypoints[i].timestamp;
            marker.icon = image;
            marker.id = i;
            markers.push(marker);
        }
        return markers;
    }

    //////

    $rootScope.initCrossingMap = function () {
        // Define variables for our Map object
        var zum = 13, lat, lon;

        if ($rootScope.trackPoints == null || $rootScope.trackPoints.length == 0) {
            var fgGeo = window.navigator.geolocation;
            fgGeo.getCurrentPosition(
                function (location) {
                    lat = location.coords.latitude,
                    lon = location.coords.longitude;
                    $rootScope.map = { center: { latitude: lat, longitude: lon }, zoom: zum, bounds: {}, zIndex: 9999 };
                });
        } else {
            lat = $rootScope.trackPoints[0].latitude,
            lon = $rootScope.trackPoints[0].longitude;
            $rootScope.map = { center: { latitude: lat, longitude: lon }, zoom: zum, bounds: {}, zIndex: 9999 };
        }
        $rootScope.options = { scrollwheel: true };
    }

    $rootScope.initCrossingMap();

    if ($rootScope.track.closed) {
        $rootScope.trackPoints = $rootScope.getTrackPoints($rootScope.track);
        $rootScope.trackMarkers = [$rootScope.trackPoints[0], $rootScope.trackPoints[$rootScope.track.waypoints.length - 1]];
        $rootScope.updatePolylines();
        $rootScope.simularRuta();
    } else {
        $rootScope.actualizarRuta();
    }

    //////

    $rootScope.startCrossing = function () {

        //$rootScope.updatePolylines();
        //$rootScope.actualizar();

        LocationService.initialize($rootScope.track, $rootScope.trackPoints);
    }
    
    $rootScope.endCrossing = function () {

        var endTrackData = {};
        var filterdatetime = $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sss');
        endTrackData.endTimestamp = filterdatetime;

        CrossingService.endTrack(accountId, $rootScope.track.id, endTrackData)
            .success(function (response) {
                var alertPopup = $ionicPopup.alert({
                    title: $translate.instant('CROSSING_END_SUCCESS_TITLE'),
                    template: $translate.instant('CROSSING_END_SUCCESS_MSG')
                });

                $state.go('menu.crossings');

            }).error(function (error_code) {
                var alertPopup = $ionicPopup.alert({
                    title: $translate.instant('SERVER_ERROR_TITLE'),
                    template: $translate.instant('SERVER_ERROR_MSG')
                });
            });

            if (angular.isDefined($rootScope.actualizando)) {
                $interval.cancel($rootScope.actualizando);
                $rootScope.actualizando = undefined;
            }

        LocationService.endTracking();
    }

    console.log($stateParams.track);
    
});