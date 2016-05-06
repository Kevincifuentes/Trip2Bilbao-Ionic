angular.module('blusecur.navigation.controllers', [])

.controller('NavigationCtrl', function ($scope, $rootScope, $compile, $timeout, $interval, $ionicPopup, $state, $stateParams, $filter, $translate, jwtHelper, $ionicModal, uiGmapGoogleMapApi, $http, $cordovaNetwork, $cordovaGeolocation) {
    console.log($rootScope.origenEnrutado+" "+$rootScope.parkingEnrutado+ " "+ $rootScope.destinoEnrutado+ " "+ $rootScope.modo+ " "+ $rootScope.modoSegundo);
    var map;
    var panorama;

    function initMap() {
        var berkeley;
        if($rootScope.desdeInserccion === true)
        {
            berkeley = $rootScope.origenEnrutado;
        }
        else
        {
            berkeley = $rootScope.posActual;
        }
        $scope.sv = new google.maps.StreetViewService();

        panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'));

        // Set up the map.
        map = new google.maps.Map(document.getElementById('map'), {
            center: berkeley,
            zoom: 16,
            streetViewControl: false
        });

        // Set the initial Street View camera to the center of the map
        $scope.sv.getPanorama({ location: berkeley, radius: 50 }, processSVData);
        
        // Look for a nearby Street View panorama when the map is clicked.
        // getPanoramaByLocation will return the nearest pano when the
        // given radius is 50 meters or less.
        map.addListener('click', function (event) {
            $scope.sv.getPanorama({ location: event.latLng, radius: 50 }, processSVData);
        });
    }

    function processSVData(data, status) {
        if (status === google.maps.StreetViewStatus.OK) {
            var marker = new google.maps.Marker({
                position: data.location.latLng,
                map: map,
                title: data.location.description
            });

            panorama.setPano(data.location.pano);
            panorama.setPov({
                heading: 270,
                pitch: 0
            });
            panorama.setVisible(true);

            marker.addListener('click', function () {
                var markerPanoID = data.location.pano;
                // Set the Pano to use the passed panoID.
                panorama.setPano(markerPanoID);
                panorama.setPov({
                    heading: 270,
                    pitch: 0
                });
                panorama.setVisible(true);
            });
        } else {
            console.error('Street View data not found for this location.');
        }
    }

    // ACCION
    initMap();
    if(window.screen.lockOrientation)
    {
        screen.lockOrientation('landscape');
    }

    $scope.$on("$destroy", function () {
        if (window.screen.lockOrientation) {
            screen.lockOrientation('portrait');
            screen.unlockOrientation();
        }
    });

    var watchOptions = {
        timeout: 3000,
        enableHighAccuracy: true, // may cause errors if true
        maximumAge:600000
    };

    var watch = $cordovaGeolocation.watchPosition(watchOptions);
    watch.then(
      null,
      function (err) {
          // error
          alert('code: ' + err.code + '\n' +
      'message: ' + err.message + '\n');
      },
      function (position) {
          var lat = position.coords.latitude;
          var long = position.coords.longitude;
          console.log("Alohas");
          $scope.sv.getPanorama({ location: new google.maps.LatLng(lat, long), radius: 50 }, processSVData);
      });

    function enrutar(origen, destino, modo, directionService, directionDisplay)
    {


    }


});