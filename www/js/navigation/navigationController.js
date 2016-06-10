angular.module('trip2bilbao.navigation.controllers', [])

.controller('NavigationCtrl', function ($scope, $rootScope, $compile, $timeout, $interval, $ionicPopup, $state, $stateParams, $filter, $translate, jwtHelper, $ionicModal, uiGmapGoogleMapApi, $http, $cordovaNetwork, $cordovaGeolocation, $compile) {
    
    console.log($rootScope.origenEnrutado+" "+$rootScope.parkingEnrutado+ " "+ $rootScope.destinoEnrutado+ " "+ $rootScope.modo+ " "+ $rootScope.modoSegundo);
    var origen = $rootScope.posActual;
    var destino = $rootScope.destinoEnrutado;
    var modo = $rootScope.modo;

    //si es en coche
    var modoSegundo = $rootScope.modoSegundo;
    var parkingEnrutado = $rootScope.parkingEnrutado;

    var funcionando = true;
    var map;
    var panorama;
    var marcadores = [];
    var head = 270;

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

        var controlesDiv = document.createElement('DIV');
        var controles = new crearPause(controlesDiv, map);
        controlesDiv.index = 1;
        map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(controlesDiv);


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
                icon: 'img/user.png',
                title: data.location.description
            });
            console.log("2 "+head);
            panorama.setPano(data.location.pano);
            panorama.setPov({
                heading: head,
                pitch: 0
            });
            panorama.setVisible(true);

            marker.addListener('click', function () {
                var markerPanoID = data.location.pano;
                // Set the Pano to use the passed panoID.
                panorama.setPano(markerPanoID);
                panorama.setPov({
                    heading: head,
                    pitch: 0
                });
                panorama.setVisible(true);
            });
            marcadores.push(marker);
        } else {
            console.error('Street View data not found for this location.');
        }
    }

    function crearPause(controlesDiv, map) {

        controlesDiv.style.padding = '5px 0px';
        var controlesUI = document.createElement('DIV');
        controlesUI.style.backgroundColor = 'white';
        controlesUI.style.borderStyle = 'solid';
        controlesUI.style.borderWidth = '1px';
        controlesUI.style.borderColor = 'gray';
        controlesUI.style.boxShadow = 'rgba(0, 0, 0, 0.398438) 0px 2px 4px';
        controlesUI.style.cursor = 'pointer';
        controlesUI.style.opacity = '0.5';
        controlesUI.style.textAlign = 'center';
        controlesUI.title = 'Controles';
        controlesDiv.appendChild(controlesUI);

        var boton = document.createElement('DIV');
        boton.id = 'button';
        var content = '<button id="botonParado" class="button button-icon ion-pause ion-navicon"></button>';
        var compiled = $compile(content)($rootScope);
        boton.appendChild(compiled[0]);
        boton.onclick = function () {
            //si se ha realizado una ruta, ejecutar play. Si no nada.
            console.log("Pause");
            if(funcionando === true)
            {
                funcionando = false;
                watch.clearWatch();
                navigator.compass.clearWatch(watchID);
                document.getElementById("botonParado").className = "button button-icon ion-play ion-navicon";
            }
            else
            {
                funcionando = true;

                //limpio marcadores que puede haber
                for (var i = 0; i < marcadores.length; i++) {
                    marcadores[i].setMap(null);
                }
                marcadores = [];

                watchID = navigator.compass.watchHeading(onSuccess, onError, options);
                watch = $cordovaGeolocation.watchPosition(watchOptions);
                watch.then(
                null,
                function (err) {
                    // error
                    console.log('code: ' + err.code + '\n' +
                'message: ' + err.message + '\n');
                },
                function (position) {
                    var lat = position.coords.latitude;
                    var long = position.coords.longitude;
                    console.log("Posición actual: " + lat + " / " + long);
                    $scope.sv.getPanorama({ location: new google.maps.LatLng(lat, long), radius: 50 }, processSVData);
                });
                document.getElementById("botonParado").className = "button button-icon ion-pause ion-navicon";
                map.setCenter(origen);
            }
        }

        controlesUI.appendChild(boton);

        google.maps.event.addDomListener(controlesUI, 'click', function () {
            if (controlesUI.style.fontWeight == 'bold') {
                controlesUI.style.fontWeight = 'normal';
            } else {
                controlesUI.style.fontWeight = 'bold';
            }
        });

        google.maps.event.addDomListener(controlesUI, 'mouseover', function () {
            controlesUI.style.backgroundColor = '#e8e8e8';
            controlesUI.style.fontSize = '35px';
            controlesUI.style.opacity = '1';
        });

        google.maps.event.addDomListener(controlesUI, 'mouseout', function () {
            controlesUI.style.backgroundColor = 'white';
            controlesUI.style.fontSize = '14px';
            controlesUI.style.opacity = '0.5';
        });
    }

    function enrutar(origen, destino, modo, directionsService, directionsDisplay) {

        var transporte;
        var start = new google.maps.LatLng(origen.lat(), origen.lng());
        var end = new google.maps.LatLng(destino.lat(), destino.lng());
        var request;
            switch (modo) {
                case "coche":
                    request = {
                        origin: start,
                        destination: end,
                        provideRouteAlternatives: true,
                        travelMode: google.maps.TravelMode.DRIVING
                    };
                    break;
                case "andando":
                    request = {
                        origin: start,
                        destination: end,
                        provideRouteAlternatives: true,
                        travelMode: google.maps.TravelMode.WALKING
                    };
                    break;
                case "autobus":
                    request = {
                        origin: start,
                        destination: end,
                        provideRouteAlternatives: true,
                        travelMode: google.maps.TravelMode.TRANSIT,
                        transitOptions: { modes: [google.maps.TransitMode.BUS] }
                    };
                    break;
                case "tren":
                    request = {
                        origin: start,
                        destination: end,
                        provideRouteAlternatives: true,
                        travelMode: google.maps.TravelMode.TRANSIT,
                        transitOptions: { modes: [google.maps.TransitMode.RAIL, google.maps.TransitMode.SUBWAY, google.maps.TransitMode.TRAIN, google.maps.TransitMode.TRAM] }
                    };
                    break;
            }
            
            directionsService.route(request, function (response, status) {
                console.log(status);
                if (status == google.maps.DirectionsStatus.OK) {
                    console.log("Ruta correcta");
                    directionsDisplay.setDirections(response);
                }
            });

    }
    

    function mostrarTodos()
        {
            for (var i = 0; i < $rootScope.Maparcamientos.length; i++) {
                $rootScope.Maparcamientos[i].setMap(map);
                google.maps.event.addListener($rootScope.Maparcamientos[i], 'click', function () {
                    this.infowindow.setContent(this.content);
                    this.infowindow.open(map, this);
                });
            }
            for (var i = 0; i < $rootScope.MparadasBilboBus.length; i++) {
                $rootScope.MparadasBilboBus[i].setMap(map);
                google.maps.event.addListener($rootScope.MparadasBilboBus[i], 'click', function () {
                    this.infowindow.setContent(this.content);
                    this.infowindow.open(map, this);
                });
            }
            for (var i = 0; i < $rootScope.MparadasEuskotren.length; i++) {
                $rootScope.MparadasEuskotren[i].setMap(map);
                google.maps.event.addListener($rootScope.MparadasEuskotren[i], 'click', function () {
                    this.infowindow.setContent(this.content);
                    this.infowindow.open(map, this);
                });
            }
            for (var i = 0; i < $rootScope.MparadasTranvia.length; i++) {
                $rootScope.MparadasTranvia[i].setMap(map);
                google.maps.event.addListener($rootScope.MparadasTranvia[i], 'click', function () {
                    this.infowindow.setContent(this.content);
                    this.infowindow.open(map, this);
                });
            }
            for (var i = 0; i < $rootScope.MparadasBizkaibus.length; i++) {
                $rootScope.MparadasBizkaibus[i].setMap(map);
                google.maps.event.addListener($rootScope.MparadasBizkaibus[i], 'click', function () {
                    this.infowindow.setContent(this.content);
                    this.infowindow.open(map, this);
                });
            }
            for (var i = 0; i < $rootScope.MparadasMetro.length; i++) {
                $rootScope.MparadasMetro[i].setMap(map);
                google.maps.event.addListener($rootScope.MparadasMetro[i], 'click', function () {
                    this.infowindow.setContent(this.content);
                    this.infowindow.open(map, this);
                });
            }
            for (var i = 0; i < $rootScope.MpuntosBici.length; i++) {
                $rootScope.MpuntosBici[i].setMap(map);
                google.maps.event.addListener($rootScope.MpuntosBici[i], 'click', function () {
                    this.infowindow.setContent(this.content);
                    this.infowindow.open(map, this);
                });
            }
            for (var i = 0; i < $rootScope.Mincidencias.length; i++) {
                $rootScope.Mincidencias[i].setMap(map);
                google.maps.event.addListener($rootScope.Mincidencias[i], 'click', function () {
                    this.infowindow.setContent(this.content);
                    this.infowindow.open(map, this);
                });
            }
            for (var i = 0; i < $rootScope.Mhospitales.length; i++) {
                $rootScope.Mhospitales[i].setMap(map);
                google.maps.event.addListener($rootScope.Mhospitales[i], 'click', function () {
                    this.infowindow.setContent(this.content);
                    this.infowindow.open(map, this);
                });
            }
            for (var i = 0; i < $rootScope.Mfarmacias.length; i++) {
                $rootScope.Mfarmacias[i].setMap(map);
                google.maps.event.addListener($rootScope.Mfarmacias[i], 'click', function () {
                    this.infowindow.setContent(this.content);
                    this.infowindow.open(map, this);
                });
            }
            for (var i = 0; i < $rootScope.McentrosSalud.length; i++) {
                $rootScope.McentrosSalud[i].setMap(map);
                google.maps.event.addListener($rootScope.McentrosSalud[i], 'click', function () {
                    this.infowindow.setContent(this.content);
                    this.infowindow.open(map, this);
                });
            }
        }


    // ACCION
    initMap();
    if (window.screen.lockOrientation) {
        screen.lockOrientation('landscape');
        window.plugins.insomnia.keepAwake();
        AndroidFullScreen.immersiveMode(function(){}, function(err){console.log("Error: "+err);});
    }

    $scope.$on("$destroy", function () {
        if (window.screen.lockOrientation) {
            screen.lockOrientation('portrait');
            window.plugins.insomnia.allowSleepAgain();
            screen.unlockOrientation();
            AndroidFullScreen.showSystemUI(function(){}, function(err){console.log("Error: "+err);});
        }
    });

    var watchOptions = {
        timeout: 3000,
        enableHighAccuracy: true, // may cause errors if true
        maximumAge: 600000
    };
    function onSuccess(heading) {
        var valor = heading.trueHeading;

        if (valor < 0)
        {
            head = heading.magneticHeading;
        }
        else
        {
            head = valor;
        }
        
        if (panorama) {
            panorama.setPov({
                heading: head,
                pitch: 0
            });
        }
    };

    function onError(compassError) {
        alert('Compass error: ' + compassError.code);
    };

    var options = {
        frequency: 75
    }; // Update every 0,075 seconds

    var watchID = navigator.compass.watchHeading(onSuccess, onError, options);

    var watch = $cordovaGeolocation.watchPosition(watchOptions);
    //watch.clearWatch();
    watch.then(
      null,
      function (err) {
          // error
          console.log('code: ' + err.code + '\n' +
      'message: ' + err.message + '\n');
      },
      function (position) {
          var lat = position.coords.latitude;
          var long = position.coords.longitude;
          if (lat !== origen.lat() && long !== origen.lng())
          {
              origen = new google.maps.LatLng(lat, long); 
              if (parkingEnrutado === undefined)
              {
                  enrutar(origen, destino, modo, primeroService, primeroDisplay);
              }
              else
              {
                   enrutar(origen, parkingEnrutado, modo, primeroService, primeroDisplay);
                   enrutar(parkingEnrutado, destino, modoSegundo, segundoService, segundoDisplay);
              }
              map.setCenter(origen);
          }
          console.log("Posición actual: " + lat + " / " + long);
          $scope.sv.getPanorama({ location: origen, radius: 50 }, processSVData);
      });

    var primeroService;
    var primeroDisplay;
    var segundoService;
    var segundoDisplay;
    primeroService = new google.maps.DirectionsService();
    primeroDisplay = new google.maps.DirectionsRenderer({
        draggable: true,
        map: map,
        preserveViewport: true
    });
    if (parkingEnrutado === undefined) {
        // una sola ruta
        enrutar(origen, destino, modo, primeroService, primeroDisplay);
        map.setCenter(origen);
    }
    else {
        //dos rutas
        segundoService = new google.maps.DirectionsService();
        segundoDisplay = new google.maps.DirectionsRenderer({
            draggable: true,
            map: map,
            preserveViewport: true
        });
        enrutar(origen, parkingEnrutado, modo, primeroService, primeroDisplay);
        enrutar(parkingEnrutado, destino, modoSegundo, segundoService, segundoDisplay);
        map.setCenter(origen);
    }

    mostrarTodos();
});