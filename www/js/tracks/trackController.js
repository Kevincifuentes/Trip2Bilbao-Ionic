angular.module('blusecur.track.controllers', [])

.controller('TrackMapCtrl', function ($rootScope, $timeout, $interval, $ionicPopup, $state, $stateParams, $filter, $translate, store, jwtHelper, $ionicModal, CrossingService, VesselService, CrewService, ContactsService, LovsService, LocationService, uiGmapGoogleMapApi, $http) {

    if ($rootScope.map === undefined)
    {
        console.log("primera vez");
        //Inicializar mapa
        var inticor = new google.maps.LatLng(43.262979, -2.934911);
        var mapOptions = {
            zoom: 9,
            center: inticor,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        };

        $rootScope.map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);
        var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap($rootScope.map);

    }
    else
    {
        console.log("Esta inicializado");
        console.log($rootScope.map);
    }
    $rootScope.marcadores = new Array();
    console.log("Aqui llego!");
    $rootScope.markers = [];
    $rootScope.infoWindows = [];

    if ($stateParams.ejecutar) {
        //alert("Hay que rellenar");
    }
    else {
        //alert("No hay que rellenar");
    }
    //AUTOCOMPLETAR
    /*if ($rootScope.primera === true) {
        $rootScope.primera = false;
        console.log("Es falso");
        navigator.geolocation.getCurrentPosition(function (pos) {
            $rootScope.map = { center: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }, zoom: 8 };
            var miPos = {
                id: 0,
                coords: {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.logitude
                },
                options: { draggable: false },
                icon: 'img/marker.png',
                title : 
            };
            $rootScope.marcadores.push(miPos);
        }, function (error) {
            alert('Unable to get location: ' + error.message);
        });
    }*/
    $rootScope.searchQuery;
    $rootScope.prueba = function () {
    console.log("prueba");
    }
    $rootScope.origen = "";
    $rootScope.destino = "";
    // Load the modal from the given template URL
    $ionicModal.fromTemplateUrl('busqueda.html', function ($ionicModal) {
        $rootScope.busqueda = $ionicModal;
    }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $rootScope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });

    /*$rootScope.mostrarBusqueda = function () {
        $rootScope.data = {};
        var myPopup = $ionicPopup.show({
            template: '<div class="input-group"><ion-google-place placeholder="Origen..." ng-model="origen" location-changed="prueba"></ion-google-place><ion-google-place placeholder="Destino..." ng-model="destino" location-changed="prueba"></ion-google-place></div>',
            title: 'Buscar ruta',
            subTitle: 'Introduce direcciones de origen y destino',
            scope: $rootScope,
            buttons: [
              { text: 'Cancelar' },
              {
                  text: '<b>Buscar</b>',
                  type: 'button-positive',
                  onTap: function(e) {
                      if (!$rootScope.data.origen && !$rootScope.data.destino) {
                          var showAlert = function () {
                              var alertPopup = $ionicPopup.alert({
                                  title: 'Ruta incompleta',
                                  template: 'Falta alguno de los parámetros necesarios para determinar la ruta'
                              });
                          };
                          showAlert();
                          e.preventDefault();
                      } else {
                          alert($rootScope.origen + " a " + $rootScope.destino);
                          return $rootScope.data;
                      }
                  }
              }
            ]
        });

        myPopup.then(function(res) {
            console.log('Tapped!', res);
        });
    };*/
        var calcularRuta = function (origen, destino) {
            var start = new google.maps.LatLng(origen.coords.latitude, origen.coords.longitude);
            var end = new google.maps.LatLng(destino.coords.latitude, destino.coords.longitude);
            var request = {
                origin: start,
                destination: end,
                travelMode: google.maps.TravelMode.DRIVING
            };

            $rootScope.directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    limpiarMapa();
                    $rootScope.directionsDisplay = new google.maps.DirectionsRenderer();
                    $rootScope.directionsDisplay.setMap($rootScope.map);
                    $rootScope.directionsDisplay.setDirections(response);
                }
            });
        };

        $rootScope.primera = false;
        $rootScope.directionsDisplay= new google.maps.DirectionsRenderer();;
        $rootScope.directionsService = new google.maps.DirectionsService();
        navigator.geolocation.getCurrentPosition(function (pos) {

            //calcularRuta(pos);
            $rootScope.posActual = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            var contentString = "Usted se encuentra aquí";
            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });
            var marker = new google.maps.Marker({
                position: $rootScope.posActual,
                title: contentString
            });
            $rootScope.infoWindows.push(infowindow);
            $rootScope.markers.push(marker);

            //se añade un evento al marcador
            google.maps.event.addListener(marker, 'click', function () {
                infowindow.open($rootScope.map, marker);
            });

            marker.setMap($rootScope.map);
        }, function (error) {
            alert('Unable to get location: ' + error.message);
        });

        var limpiarMapa = function () {
            console.log("Limpio mapa");
            $rootScope.directionsDisplay.setMap(null);
            for (var i = 0; i < $rootScope.markers.length; i++)
            {
                $rootScope.markers[i].setMap(null);
            }
            $rootScope.markers = [];
        }
        
        var obtenerCodigoPostal = function (destino) {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'address': destino }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    //console.log(results);
                    $rootScope.map.setCenter(results[0].geometry.location);
                    if (results[0].address_components[5].types[0] === "country" && results[0].address_components[6] === undefined) {
                        if (results[1].address_components[5].types[0] === "postal_code") {
                            codigoPostal = results[1].address_components[5].long_name;
                        } else {
                            if (results[1].address_components[6].types[0] === "postal_code") {
                                codigoPostal = results[1].address_components[6].long_name;
                            } else {
                                if (results[1].address_components[7].types[0] === "postal_code") {
                                    codigoPostal = results[1].address_components[7].long_name;
                                } else {
                                    codigoPostal = results[1].address_components[8].long_name;
                                }
                            }
                        }
                        $rootScope.seguirBuscarRuta(codigoPostal, true);
                    } else {
                        if (results[0].address_components[5].types[0] === "postal_code") {
                            codigoPostal = results[0].address_components[5].long_name;
                        } else {
                            if (results[0].address_components[6].types[0] === "postal_code") {
                                codigoPostal = results[0].address_components[6].long_name;
                            } else {
                                if (results[0].address_components[7].types[0] === "postal_code") {
                                    codigoPostal = results[0].address_components[7].long_name;
                                } else {
                                    codigoPostal = results[0].address_components[8].long_name;
                                }
                            }
                        }
                        //console.log(codigoPostal);
                        //PROVISIONAL

                        /////////////
                        $rootScope.seguirBuscarRuta(codigoPostal, true);
                    }
                } else {
                    alert("No pudo obtenerse el código postal por: " + status);
                }
            })
        };

        $rootScope.buscarRuta = function (origen, destino) {
            $rootScope.busqueda.hide();
            //Mirar la cantidad de parkings que hay, para eso obtengo el codigo postal en destino
            obtenerCodigoPostal(destino);

        };

        $rootScope.seguirBuscarRuta = function (cp, primera) {
            if (primera === true)
            {
                $rootScope.parkings = [];
                $rootScope.numeroParkings = 0;
                obtenerParkings(cp);
            }
            else
            {
                console.log($rootScope.parkings);
                if($rootScope.numeroParkings === 0)
                {
                    console.log("0");
                }
                else
                {
                    if($rootScope.numeroParkings === 1)
                    {
                        console.log("1");

                    }else
                    {
                        console.log("MAS DE 1");
                    }
                }

            }
            
        };

        var obtenerParkings = function (cp) {
            $http({ method: 'GET', url: "http://localhost:16422/api/parkings/codigo/" + cp })
            .success(function (data, status) {
                        //si la petición ha sido correcta, tendremos una lista de objetos JSON
                
                angular.forEach(data, function (item, key) {
                    $rootScope.numeroParkings++;
                    $rootScope.parkings.push(item);
                    
                });
                $rootScope.seguirBuscarRuta(cp, false);
            }).error(function (data, status) {
                console.log(status);
                        alert("Error al obtener los parkings, compruebe su conexión a Internet");
            });
        };
});