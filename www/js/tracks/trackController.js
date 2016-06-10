angular.module('trip2bilbao.track.controllers', [])

.controller('TrackMapCtrl', function ($scope, $rootScope, $compile, $timeout, $interval, $ionicPopup, $state, $stateParams, $filter, $translate, jwtHelper, $ionicModal, uiGmapGoogleMapApi, $http, $cordovaNetwork) {
        console.log("primera vez");

        //Inicializar mapa
        var inticor = new google.maps.LatLng(43.262979, -2.934911);
        var mapOptions = {
            zoom: 9,
            center: inticor,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        };

        var iconos = ["img/defecto.png", "img/farmacias.png", "img/parking.png", "img/incidencias.png", "img/centros.png", "img/hospitales.png", "img/bilbobus.png", "img/bizkaibus.png", "img/euskotren.png", "img/metro.png", "img/tranvia.png", "img/puntobici.png"];

        $rootScope.map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);
        var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap($rootScope.map);

        var controlesDiv = document.createElement('DIV');
        var controles = new CrearLeyenda(controlesDiv, $rootScope.map, $rootScope, $compile);
        controlesDiv.index = 3;
        $rootScope.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(controlesDiv);

        var controlesDiv2 = document.createElement('DIV');
        var controles2 = new CrearControles(controlesDiv2, $rootScope.map, $rootScope, $compile);
        controlesDiv2.index = 3;
        $rootScope.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(controlesDiv2);

        var controlesDiv3 = document.createElement('DIV');
        var controles3 = new CrearPlay(controlesDiv3, $rootScope.map, $rootScope, $compile);
        controlesDiv3.index = 3;
        $rootScope.map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(controlesDiv3);

        for(var i =0; i<$rootScope.marcadoresFavoritos.length; i++)
        {
            $rootScope.marcadoresFavoritos[i].setMap($rootScope.map);
        }

    $rootScope.marcadores = new Array();
    console.log("Aqui llego!");
    $rootScope.markers = [];
    $rootScope.infoWindows = [];

    //ITEMS de CODIGO
    $rootScope.aparcamientos = [];
    $rootScope.paradasBilboBus = [];
    $rootScope.paradasEuskotren = [];
    $rootScope.paradasTranvia = [];
    $rootScope.paradasBizkaibus = [];
    $rootScope.paradasMetro = [];
    $rootScope.puntosBici = [];
    $rootScope.incidencias = [];
    $rootScope.hospitales = [];
    $rootScope.farmacias = [];
    $rootScope.centrosSalud = [];

    //MARCADORES
    $rootScope.Maparcamientos = [];
    $rootScope.MparadasBilboBus = [];
    $rootScope.MparadasEuskotren = [];
    $rootScope.MparadasTranvia = [];
    $rootScope.MparadasBizkaibus = [];
    $rootScope.MparadasMetro = [];
    $rootScope.MpuntosBici = [];
    $rootScope.Mincidencias = [];
    $rootScope.Mhospitales = [];
    $rootScope.Mfarmacias = [];
    $rootScope.McentrosSalud = [];

    //InfoWindows
    $rootScope.Iaparcamientos = {};
    $rootScope.IparadasBilboBus = {};
    $rootScope.IpuntosBici = {};

    $rootScope.conClick = false;

    $ionicModal.fromTemplateUrl('panelInfo.html', function ($ionicModal) {
        $rootScope.panelInfo = $ionicModal;
        }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $rootScope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
        });

    $rootScope.mostrarInfo = function () {
        $rootScope.panelInfo.show();
        if ($rootScope.directionsDisplay !== undefined)
        {
            $rootScope.directionsDisplay.setPanel(document.getElementById('panel'));
        }
        if ($rootScope.directionsDisplaySegundo !== undefined)
        {
            $rootScope.directionsDisplaySegundo.setPanel(document.getElementById('panel'));
        }
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
    var calcularRuta = function (origen, destino, modo) {
        if (document.getElementById("panel") != null)
        {
            document.getElementById("panel").innerHTML = "No hay ruta seleccionada y, por tanto, no hay información para mostrar.";
        }
        console.log("Buena llamada");
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
            
            $rootScope.directionsService.route(request, function (response, status) {
                console.log(status);
                if (status == google.maps.DirectionsStatus.OK) {
                    console.log("Ruta correcta");
                    limpiarMapa();
                    $rootScope.directionsDisplay = new google.maps.DirectionsRenderer({
                        draggable: true,
                        map: $rootScope.map,
                        preserveViewport: false
                    });
                    //$rootScope.directionsDisplay.setPanel(document.getElementById('panel'));
                    $rootScope.directionsDisplay.setDirections(response);
                }
            });
        };

        $rootScope.primera = false;
        $rootScope.directionsDisplay= new google.maps.DirectionsRenderer();
        $rootScope.directionsService = new google.maps.DirectionsService();
        
        navigator.geolocation.getCurrentPosition(function (pos) {

            //calcularRuta(pos);
            $rootScope.posActual = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            var contentString = "Usted se encuentra aquí";
            var infowindow = new google.maps.InfoWindow({
                content: contentString,
                maxWidth: 350
            });
            var marker = new google.maps.Marker({
                position: $rootScope.posActual,
                animation: google.maps.Animation.DROP,
                title: "Prueba"
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
            if ($rootScope.directionsDisplaySegundo)
            {
                console.log("Existe");
                $rootScope.directionsDisplaySegundo.setMap(null);
            }
            if ($rootScope.parkingsParaSeleccion !== undefined)
            {
                for (var i = 0; i < $rootScope.parkingsParaSeleccion.length; i++) {
                    $rootScope.parkingsParaSeleccion[i].marcador.setMap(null);
                }
            }
            
        }
        
        var obtenerCodigoPostal = function (destino) {
            var geocoder = new google.maps.Geocoder();
            var parametro = '';
            if($rootScope.conClick === true)
            {
                geocoder.geocode({ 'location': destino }, function (results, status) {
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
                            $rootScope.codigoPostalDestino = codigoPostal;
                            $rootScope.seguirBuscarRuta(codigoPostal, true);
                        }
                    } else {
                        alert("No pudo obtenerse el código postal por: " + status);
                    }
                })
            }
            else
            {
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
                            $rootScope.codigoPostalDestino = codigoPostal;
                            $rootScope.seguirBuscarRuta(codigoPostal, true);
                        }
                    } else {
                        alert("No pudo obtenerse el código postal por: " + status);
                    }
                })
            }
        };

        $rootScope.obtenerTodaInfo = function () {
            obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/paradasmetro/codigo/" + $rootScope.codigoPostalDestino, 9);
            obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/puntosbici/codigo/" + $rootScope.codigoPostalDestino, 11);
            obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/paradastranvia/codigo/" + $rootScope.codigoPostalDestino, 10);
            obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/paradaseuskotren/codigo/" + $rootScope.codigoPostalDestino, 8);
            obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/paradasbizkaibus/codigo/" + $rootScope.codigoPostalDestino, 7);
            obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/paradasbilbo/codigo/" + $rootScope.codigoPostalDestino, 6);
            obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/incidencias/codigo/" + $rootScope.codigoPostalDestino, 3);
            obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/hospitales/codigo/" + $rootScope.codigoPostalDestino, 5);
            obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/farmacias/codigo/" + $rootScope.codigoPostalDestino, 1);
            obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/centros/codigo/" + $rootScope.codigoPostalDestino, 4);

        }

        $rootScope.buscarRuta = function (origen, destino) {
            $rootScope.conClick = false;
            $rootScope.enrutado = false;
            resetearMarcadores();
            if (document.getElementById("panel") != null)
            {
                document.getElementById("panel").innerHTML = "No hay ruta seleccionada y, por tanto, no hay información para mostrar.";
            }
            $rootScope.busquedaRealizada = true;
            $rootScope.desdeInserccion = true;
            $rootScope.busqueda.hide();
            $rootScope.origenNombre = origen;
            $rootScope.origenDestino = destino;
            //Mirar la cantidad de parkings que hay, para eso obtengo el codigo postal en destino
            obtenerCodigoPostal(destino);

        };

        $rootScope.seguirBuscarRuta = function (cp, primera) {
            if (primera === true || $rootScope.parkings === undefined)
            {
                if ($rootScope.modo === "coche")
                {
                    if (cp === 0 && primera === false)
                    {
                        obtenerCodigoPostal($rootScope.destinoEnrutado);
                    }
                    else
                    {
                        $rootScope.parkings = [];
                        $rootScope.numeroParkings = 0;
                        obtenerParkings(cp);
                        $rootScope.obtenerTodaInfo();
                    }
                    
                }
                else
                {
                    if ($rootScope.conClick === true)
                    {
                        calcularRuta($rootScope.posActual, $rootScope.destinoEnrutado, $rootScope.modo);
                        $rootScope.obtenerTodaInfo();
                        $rootScope.rutaRealizada = true;
                    }
                    else
                    {
                        var geocoder = new google.maps.Geocoder();
                        geocoder.geocode({ 'address': $rootScope.origenNombre }, function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                //alert(results[0].geometry.location);
                                var puntoLocalizacion = results[0].geometry.location;
                                $rootScope.origenEnrutado = puntoLocalizacion;
                                geocoder.geocode({ 'address': $rootScope.origenDestino }, function (results, status) {
                                    if (status == google.maps.GeocoderStatus.OK) {
                                        var destino = results[0].geometry.location;
                                        calcularRuta(puntoLocalizacion, destino, $rootScope.modo);
                                        $rootScope.obtenerTodaInfo();
                                        $rootScope.rutaRealizada = true;
                                    }
                                });

                            } else {
                                alert("No se pudo obtener el punto exacto por: " + status);
                            }
                        });
                    }
                }
            }
            else
            {
                if ($rootScope.modo === "coche") {
                    console.log($rootScope.parkings);
                    if ($rootScope.numeroParkings === 0) {
                        console.log("0");
                        limpiarMapa();
                        var bounds = new google.maps.LatLngBounds();
                        $rootScope.parkingsParaSeleccion = [];
                        for (var i = 0; i < $rootScope.parkings.length; i++) {
                            var contentString;
                            console.log("aqui");
                            if ($rootScope.parkings[i].nombreParking in $rootScope.estadosParking) {
                                contentString = "<div id='iw-container'><div class='iw-title'><b>Parking:</b> " + $rootScope.parkings[i].nombreParking + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b> Capacidad: </b> " + $rootScope.parkings[i].capacidad + "</li></ul><br><h4><b> Disponibilidad actual: </b>" + $rootScope.estadosParking[$rootScope.parkings[i].nombreParking] + "</h4><button id='seleccion" + i + "' ng-click='seleccionarParking(" + i + ")'>Seleccionar parking</button><br><div class='iw-bottom-gradient'></div></div>";
                            }
                            else {
                                contentString = "<div id='iw-container'><div class='iw-title'><b>Parking:</b> " + $rootScope.parkings[i].nombreParking + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b> Capacidad: </b> " + $rootScope.parkings[i].capacidad + "</li></ul><button id='seleccion" + i + "' ng-click='seleccionarParking(" + i + ")'>Seleccionar parking</button><br><div class='iw-bottom-gradient'></div></div>";
                            }
                            var compiled = $compile(contentString)($rootScope);

                            var infowindow = new google.maps.InfoWindow({
                                maxWidth: 350
                            });
                            var punto = new google.maps.LatLng($rootScope.parkings[i].latitud, $rootScope.parkings[i].longitud);
                            bounds.extend(punto);
                            var marker = new google.maps.Marker({
                                position: punto,
                                title: "parking",
                                content: compiled[0],
                                icon: iconos[2]
                            });
                            marker.infowindow = infowindow;
                            $rootScope.parkingsParaSeleccion.push({ marcador: marker, objetoParking: $rootScope.parkings[i] });
                            google.maps.event.addListener(marker, 'click', function () {
                                infowindow.setContent(this.content);
                                infowindow.open($rootScope.map, this);
                            });

                            marker.setMap($rootScope.map);
                        }

                        if ($state.current.name === "menu.track-mapFav") {
                            $state.go('menu.track-map');

                        }

                        var alertPopup = $ionicPopup.alert({
                            title: 'No existen recintos de aparcamiento en los alrededores',
                            template: 'No existen recintos de aparcamiento cercanos al destino. Se ruega elegir uno de los que se muestran a continuación.'
                        });
                        alertPopup.then(function (res) {
                            $rootScope.map.fitBounds(bounds);
                        });


                    }
                    else {
                        if ($rootScope.numeroParkings === 1) {
                            console.log("1");
                            var contentString;
                            if (cp !== 1) //Esto quiere decir que hemos encontrado más de 1, pero que el usuario ya ha seleccionado
                            {
                                if ($rootScope.parkings[0].nombreParking in $rootScope.estadosParking) {
                                    contentString = "<div id='iw-container'><div class='iw-title'><b>Parking:</b> " + $rootScope.parkings[0].nombreParking + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b> Capacidad: </b> " + $rootScope.parkings[0].capacidad + "</li></ul><br><h4><b> Disponibilidad actual: </b>" + $rootScope.estadosParking[$rootScope.parkings[0].nombreParking] + "</h4></div><div class='iw-bottom-gradient'></div></div>";
                                }
                                else {
                                    contentString = "<div id='iw-container'><div class='iw-title'><b>Parking:</b> " + $rootScope.parkings[0].nombreParking + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b> Capacidad: </b> " + $rootScope.parkings[0].capacidad + "</li></ul></div><div class='iw-bottom-gradient'></div></div>";
                                }

                                var infowindow = new google.maps.InfoWindow({
                                    maxWidth: 350
                                });
                                var marker = new google.maps.Marker({
                                    position: new google.maps.LatLng($rootScope.parkings[0].latitud, $rootScope.parkings[0].longitud),
                                    title: "parking",
                                    content: contentString,
                                    icon: iconos[2]
                                });

                                google.maps.event.addListener(marker, 'click', function () {
                                    infowindow.setContent(this.content);
                                    infowindow.open($rootScope.map, this);
                                });

                                marker.setMap($rootScope.map);
                            }
                            var service = new google.maps.DistanceMatrixService();
                            if ($rootScope.conClick === true) {
                                service.getDistanceMatrix(
                                {
                                    origins: [$rootScope.origenEnrutado],
                                    destinations: [new google.maps.LatLng($rootScope.parkings[0].latitud, $rootScope.parkings[0].longitud)],
                                    travelMode: google.maps.TravelMode.DRIVING
                                }, function (response, status) {
                                    if (status == google.maps.DistanceMatrixStatus.OK) {
                                        $rootScope.varTiempo = response.rows[0].elements[0].duration.value;
                                        calcularRuta($rootScope.origenEnrutado, new google.maps.LatLng($rootScope.parkings[0].latitud, $rootScope.parkings[0].longitud), $rootScope.modo);
                                        $rootScope.parkingEnrutado = new google.maps.LatLng($rootScope.parkings[0].latitud, $rootScope.parkings[0].longitud);
                                        obtenerInformacionDistanciasTiempos(new google.maps.LatLng($rootScope.parkings[0].latitud, $rootScope.parkings[0].longitud), $rootScope.destinoEnrutado);

                                    }
                                });
                            }
                            else {
                                var geocoder = new google.maps.Geocoder();
                                geocoder.geocode({ 'address': $rootScope.origenNombre }, function (results, status) {
                                    if (status == google.maps.GeocoderStatus.OK) {
                                        //alert(results[0].geometry.location);
                                        var puntoLocalizacion = results[0].geometry.location;
                                        $rootScope.origenEnrutado = puntoLocalizacion;
                                        service.getDistanceMatrix(
                                        {
                                            origins: [puntoLocalizacion],
                                            destinations: [new google.maps.LatLng($rootScope.parkings[0].latitud, $rootScope.parkings[0].longitud)],
                                            travelMode: google.maps.TravelMode.DRIVING
                                        }, function (response, status) {
                                            if (status == google.maps.DistanceMatrixStatus.OK) {
                                                console.log(response.rows[0].elements[0].duration.value);
                                                console.log(response);
                                                $rootScope.varTiempo = response.rows[0].elements[0].duration.value;
                                                calcularRuta(puntoLocalizacion, new google.maps.LatLng($rootScope.parkings[0].latitud, $rootScope.parkings[0].longitud), $rootScope.modo);
                                                $rootScope.parkingEnrutado = new google.maps.LatLng($rootScope.parkings[0].latitud, $rootScope.parkings[0].longitud);
                                                geocoder.geocode({ 'address': $rootScope.origenDestino }, function (results, status) {
                                                    if (status == google.maps.GeocoderStatus.OK) {
                                                        var destino = results[0].geometry.location;
                                                        $rootScope.destinoEnrutado = destino;
                                                        obtenerInformacionDistanciasTiempos(new google.maps.LatLng($rootScope.parkings[0].latitud, $rootScope.parkings[0].longitud), destino);
                                                    }
                                                });
                                            }
                                        });

                                    } else {
                                        alert("No se pudo obtener el punto exacto por: " + status);
                                    }
                                });
                            }

                        }
                        else {
                            limpiarMapa();
                            console.log("MAS DE 1");
                            var bounds = new google.maps.LatLngBounds();
                            $rootScope.parkingsParaSeleccion = [];
                            for (var i = 0; i < $rootScope.parkings.length; i++) {
                                var contentString;
                                console.log("aqui");
                                if ($rootScope.parkings[i].nombreParking in $rootScope.estadosParking) {
                                    contentString = "<div id='iw-container'><div class='iw-title'><b>Parking:</b> " + $rootScope.parkings[i].nombreParking + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b> Capacidad: </b> " + $rootScope.parkings[i].capacidad + "</li></ul><br><h4><b> Disponibilidad actual: </b>" + $rootScope.estadosParking[$rootScope.parkings[i].nombreParking] + "</h4><button id='seleccion" + i + "' ng-click='seleccionarParking(" + i + ")'>Seleccionar parking</button><br><div class='iw-bottom-gradient'></div></div>";
                                }
                                else {
                                    contentString = "<div id='iw-container'><div class='iw-title'><b>Parking:</b> " + $rootScope.parkings[i].nombreParking + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b> Capacidad: </b> " + $rootScope.parkings[i].capacidad + "</li></ul><button id='seleccion" + i + "' ng-click='seleccionarParking(" + i + ")'>Seleccionar parking</button><br><div class='iw-bottom-gradient'></div></div>";
                                }
                                var compiled = $compile(contentString)($rootScope);

                                var infowindow = new google.maps.InfoWindow({
                                    maxWidth: 350
                                });
                                var punto = new google.maps.LatLng($rootScope.parkings[i].latitud, $rootScope.parkings[i].longitud);
                                bounds.extend(punto);
                                var marker = new google.maps.Marker({
                                    position: punto,
                                    title: "parking",
                                    content: compiled[0],
                                    icon: iconos[2]
                                });
                                marker.infowindow = infowindow;
                                $rootScope.parkingsParaSeleccion.push({ marcador: marker, objetoParking: $rootScope.parkings[i] });
                                google.maps.event.addListener(marker, 'click', function () {
                                    infowindow.setContent(this.content);
                                    infowindow.open($rootScope.map, this);
                                });

                                marker.setMap($rootScope.map);
                            }

                            if ($state.current.name === "menu.track-mapFav") {
                                $state.go('menu.track-map');
                            }
                            var alertPopup = $ionicPopup.alert({
                                title: 'Existen varios recintos de aparcamiento en destino',
                                template: 'Hay más de un recinto de aparcamiento disponible en destino. Le rogamos que elija uno de los que se muestran en el mapa'
                            });
                            alertPopup.then(function (res) {
                                $rootScope.map.fitBounds(bounds);
                            });
                        }
                    }
                }
                else {
                    // si no es en coche se enruta
                    if ($rootScope.conClick === true) {
                        calcularRuta($rootScope.posActual, $rootScope.destinoEnrutado, $rootScope.modo);
                        $rootScope.obtenerTodaInfo();
                        $rootScope.rutaRealizada = true;
                    }
                    else {
                        var geocoder = new google.maps.Geocoder();
                        geocoder.geocode({ 'address': $rootScope.origenNombre }, function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                //alert(results[0].geometry.location);
                                var puntoLocalizacion = results[0].geometry.location;
                                $rootScope.origenEnrutado = puntoLocalizacion;
                                geocoder.geocode({ 'address': $rootScope.origenDestino }, function (results, status) {
                                    if (status == google.maps.GeocoderStatus.OK) {
                                        var destino = results[0].geometry.location;
                                        calcularRuta(puntoLocalizacion, destino, $rootScope.modo);
                                        $rootScope.obtenerTodaInfo();
                                        $rootScope.rutaRealizada = true;

                                    }
                                });

                            } else {
                                alert("No se pudo obtener el punto exacto por: " + status);
                            }
                        });
                    }

                }
            }
            
        };

        var obtenerParkings = function (cp) {
            $http({ method: 'GET', url: "http://dev.mobility.deustotech.eu/Trip2Bilbao/api/parkings/codigo/" + cp })
            .success(function (data, status) {
                //si la petición ha sido correcta, tendremos una lista de objetos JSON

                angular.forEach(data, function (item, key) {
                    $rootScope.numeroParkings++;
                    $rootScope.parkings.push(item);
                    $rootScope.aparcamientos[item.nombreParking] = item;

                });
                $rootScope.seguirBuscarRuta(cp, false);
               
            }).error(function (data, status) {
                console.log(status);
                if (window.Connection) {
                    if ($cordovaNetwork.isOnline() !== true) {
                        var alerta = function () {
                            var alertPopup = $ionicPopup.alert({
                                title: 'No hay conexión a Internet',
                                template: 'Por favor, compruebe su conexión a Internet, la aplicación necesita tener conexión para poder funcionar.'
                            });

                            alertPopup.then(function (res) {

                            });
                        };
                        alerta();
                    }
                    else {
                        $http({ method: 'GET', url: "http://dev.mobility.deustotech.eu/Trip2Bilbao/api/parkings/parkings/" })
                        .success(function (data, status) {
                        //si la petición ha sido correcta, tendremos una lista de objetos JSON

                        angular.forEach(data, function (item, key) {
                            $rootScope.parkings.push(item);
                            $rootScope.aparcamientos[item.nombreParking] = item;
                        });
                        $rootScope.seguirBuscarRuta(cp, false);
                    });
                    }
                }
                else {
                    $http({ method: 'GET', url: "http://dev.mobility.deustotech.eu/Trip2Bilbao/api/parkings/parkings/" })
                    .success(function (data, status) {
                        //si la petición ha sido correcta, tendremos una lista de objetos JSON

                        angular.forEach(data, function (item, key) {
                            $rootScope.parkings.push(item);
                            $rootScope.aparcamientos[item.nombreParking] = item;
                            console.log("segundo");
                        });
                        $rootScope.seguirBuscarRuta(cp, false);
                    });
                }
            });
        };
        $rootScope.data = {};
        
        $rootScope.anadirFav = function(lat, lng){
            console.log("Estoy en prueba " + lat + " / " + lng);
            $rootScope.data.latitud = lat;
            $rootScope.data.longitud = lng;
            var myPopup = $ionicPopup.show({
                template: '<label for="nombreIdent"> Nombre identificativo: </label><input type="text" ng-model="data.nombreFav"><label for="modoTransporte"> Modo de transporte: </label><br>' +
    '<select name="singleSelect" ng-model="data.modoTransporte">'+
      '<option value="coche" selected>En coche</option>' +
      '<option value="andando">A pie</option>' +
      '<option value="autobus">Autobus</option>' +
      '<option value="tren">Tren</option>' +
    '</select>',
                title: 'Introduce información identificativa',
                subTitle: 'Por favor, introduce un nombre identificativo para el favorito y el modo de transporte habitual.',
                scope: $rootScope,
                buttons: [
                  { text: 'Cancelar' },
                  {
                      text: '<b>Guardar</b>',
                      type: 'button-positive',
                      onTap: function (e) {
                          if (!$rootScope.data.nombreFav) {
                              //don't allow the user to close unless he enters wifi password
                              console.log("No se ha insertado nada");
                              e.preventDefault();
                          } else {
                              return $rootScope.data;
                          }
                      }
                  }
                ]
            });

            myPopup.then(function (res) {
                //Añadir favorito
                if(res)
                {
                    console.log(res);
                    var array = window.localStorage.getItem('favoritos');
                    if (array === null) {
                        var arrayFav = new Array();
                        arrayFav.push(res);
                        window.localStorage.setItem( 'favoritos', JSON.stringify(arrayFav));
                    }
                    else
                    {
                        var arrayFav = JSON.parse(array);
                        arrayFav.push(res);
                        window.localStorage.setItem('favoritos', JSON.stringify(arrayFav));
                    }

                    $rootScope.marcadorFav.setMap(null);

                    var content = '<div id="iw-container">' +
                                        '<div class="iw-title">Favorito ' + res.nombreFav + '</div>' +
                                        '<div class="iw-content">' +
                                            '<div class="iw-subTitle">Información</div>' +
                                            '<ul><li><b>Posición: </b><ul><li>Latitud: '+res.latitud+'</li><li>Longitud:'+res.longitud+'</li></ul></li><li><b>Modo de transporte: '+res.modoTransporte+'</b></li></ul>'+
                                        '<button ng-click="eliminarFav('+res.latitud+','+res.longitud+', true, '+$rootScope.marcadoresFavoritos.length+')">Eliminar favorito</button>' +
                                        '<button ng-click="buscarRutaAqui(' + res.latitud + ',' + res.longitud + ',&quot;' + res.modoTransporte + '&quot;)">Ir aquí</button>' +
                                        '</div>' +
                                        '<div class="iw-bottom-gradient"></div>' +
                                        '</div>';
                    var compiled = $compile(content)($rootScope);
                    var infowindow = new google.maps.InfoWindow({
                        content: compiled[0],
                        maxWidth: 350
                    });

                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(res.latitud, res.longitud),
                        title: "Favorito " + res.nombreFav,
                        icon: 'img/fav.png',
                    });

                    var marker2 = new google.maps.Marker({
                        position: new google.maps.LatLng(res.latitud, res.longitud),
                        title: "Favorito " + res.nombreFav,
                        icon: 'img/fav.png',
                        content: compiled[0],
                        dataId: i
                    });

                    $rootScope.infoWindows.push(infowindow);
                    $rootScope.infoWindowsFavoritos.push(infowindow);
                    $rootScope.marcadoresFavoritosGlobal.push(marker2);
                    $rootScope.marcadoresFavoritos.push(marker);

                    //se añade un evento al marcador
                    google.maps.event.addListener(marker, 'click', function () {
                        infowindow.open($rootScope.map, marker);
                    });

                    marker.setMap($rootScope.map);
                    $rootScope.correctoFav(res);
                }
                


            });
        }
        //Seleccionar Parking
        $rootScope.seleccionarParking = function (index)
        {
            console.log("Se ha seleccionado: " + index);
            var parkingSeleccionado = $rootScope.parkings[index];
            $rootScope.parkings = [];
            $rootScope.parkings.push(parkingSeleccionado);
            $rootScope.numeroParkings = 1;
            for (var i = 0; i < $rootScope.parkingsParaSeleccion.length ; i++)
            {
                    $rootScope.parkingsParaSeleccion[i].marcador.setMap(null);
            }
            $rootScope.seguirBuscarRuta(1, false);

        }

        //CREACION DEL MENU DE MARKERS
        function CrearLeyenda(controlesDiv, map) {

            controlesDiv.style.padding = '5px 0px';
            var controlesUI = document.createElement('DIV');
            controlesUI.style.backgroundColor = 'white';
            controlesUI.style.borderStyle = 'solid';
            controlesUI.style.borderWidth = '1px';
            controlesUI.style.borderColor = 'gray';
            controlesUI.style.boxShadow = 'rgba(0, 0, 0, 0.398438) 0px 2px 4px';
            controlesUI.style.cursor = 'pointer';
            controlesUI.style.opacity = '0.8';
            controlesUI.style.textAlign = 'center';
            controlesUI.title = 'Controles';
            controlesDiv.appendChild(controlesUI);

            //CHECKBOX DE CLICK
            var checkbox = document.createElement('input');
            checkbox.style.width = '15px';
            checkbox.style.height = '15px';
            checkbox.type = "checkbox";
            checkbox.name = "name";
            checkbox.value = "value";
            checkbox.id = "click";
            checkbox.checked = false;
            checkbox.onclick = function () {
                // access properties using this keyword
                if (this.checked) {
                    // SI ESTA MARCADO
                    
                    google.maps.event.addListener($rootScope.map, 'click', function (event) {
                        if ($rootScope.marcadorFav) {
                            console.log("NO ES EL PRIMER MARCADOR FAV");
                            $rootScope.marcadorFav.setMap(null);
                        }
                        var geocoder = new google.maps.Geocoder();
                        geocoder.geocode({ 'location': event.latLng }, function (results, status) {
                            if (status === google.maps.GeocoderStatus.OK) {
                                if (results[1]) {
                                    $rootScope.map.setZoom(16);
                                    $rootScope.map.setCenter(event.latLng);

                                    var content = '<div id="iw-container">' +
                                    '<div class="iw-title">'+results[1].formatted_address+'</div>' +
                                    '<div class="iw-content">' +
                                      '<div class="iw-subTitle">Acciones ha realizar</div>' +
                                      '<button ng-click="anadirFav'+event.latLng+'">Añadir como favorito</button>' +
                                      '<button ng-click="buscarRutaAqui(' + event.latLng.lat() + ',' + event.latLng.lng() + ',&quot;' + $rootScope.modo + '&quot;)">Ir aquí</button>' +
                                    '</div>' +
                                    '<div class="iw-bottom-gradient"></div>' +
                                  '</div>';
                                    var compiled = $compile(content)($rootScope);
                                    // A new Info Window is created and set content
                                    var infowindow = new google.maps.InfoWindow({
                                        content: compiled[0],

                                        // Assign a maximum value for the width of the infowindow allows
                                        // greater control over the various content elements
                                        maxWidth: 350
                                    });

                                    // marker options
                                    $rootScope.marcadorFav = new google.maps.Marker({
                                        position: event.latLng,
                                        map: $rootScope.map,
                                        title: "Favoritos y enrutar"
                                    });

                                    google.maps.event.addListener($rootScope.marcadorFav, 'click', function () {
                                        infowindow.open($rootScope.map, $rootScope.marcadorFav);
                                    });

                                    $rootScope.marcadorFav.setMap($rootScope.map);

                                } else {
                                    window.alert('Geocoder failed due to: ' + status);
                                }
                            } else {
                                window.alert('Geocoder failed due to: ' + status);
                            }
                        });
                        
                    });
                } else {
                    // SI NO ESTA MARCADO
                    if ($rootScope.marcadorFav !== undefined)
                    {
                        $rootScope.marcadorFav.setMap(null);
                    }
                    google.maps.event.clearListeners($rootScope.map, 'click');
                }
            };

            var label = document.createElement('label')
            label.htmlFor = "click";
            label.appendChild(document.createTextNode('Habilitar toque en Mapa'));

            controlesUI.appendChild(checkbox);
            controlesUI.appendChild(label);
            controlesUI.appendChild(checkbox);
            controlesUI.appendChild(label);

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
                controlesUI.style.opacity = '0.8';
            });
        }

        function CrearControles(controlesDiv, map) {

            controlesDiv.style.padding = '5px 0px';
            var controlesUI = document.createElement('DIV');
            controlesUI.style.backgroundColor = 'white';
            controlesUI.style.borderStyle = 'solid';
            controlesUI.style.borderWidth = '1px';
            controlesUI.style.borderColor = 'gray';
            controlesUI.style.boxShadow = 'rgba(0, 0, 0, 0.398438) 0px 2px 4px';
            controlesUI.style.cursor = 'pointer';
            controlesUI.style.opacity = '0.6';
            controlesUI.style.textAlign = 'center';
            controlesUI.title = 'Controles';
            controlesDiv.appendChild(controlesUI);

            //CHECKBOX DE CLICK
            var radio1 = document.createElement('input');
            radio1.id = 'myRadioId1';
            radio1.type = 'radio';
            radio1.name = 'radioGroup';
            radio1.value = 'Coche';
            radio1.onclick = function () {
                $rootScope.modo = "coche";
                if ($rootScope.busquedaRealizada === true)
                {
                    resetearMarcadores();
                    $rootScope.seguirBuscarRuta(0, false);
                }
            }

            var radio2 = document.createElement('input');
            radio2.id = 'myRadioId2';
            radio2.type = 'radio';
            radio2.name = 'radioGroup';
            radio2.value = 'Pie';
            radio2.onclick = function () {
                $rootScope.modo = "andando";
                if ($rootScope.busquedaRealizada === true) {
                    resetearMarcadores();
                    $rootScope.seguirBuscarRuta(0, false);
                }
            }

            var radio3 = document.createElement('input');
            radio3.id = 'myRadioId3';
            radio3.type = 'radio';
            radio3.name = 'radioGroup';
            radio3.value = 'Bus';
            radio3.onclick = function () {
                $rootScope.modo = "autobus";
                if ($rootScope.busquedaRealizada === true) {
                    resetearMarcadores();
                    $rootScope.seguirBuscarRuta(0, false);
                }
            }

            var radio4 = document.createElement('input');
            radio4.id = 'myRadioId4';
            radio4.type = 'radio';
            radio4.name = 'radioGroup';
            radio4.value = 'tren';
            radio4.onclick = function () {
                $rootScope.modo = "tren";
                if ($rootScope.busquedaRealizada === true) {
                    resetearMarcadores();
                    $rootScope.seguirBuscarRuta(0, false);
                }
            }

            switch ($rootScope.modo) {
                case "coche":
                    radio1.checked = 'true';
                    break;
                case "andando":
                    radio2.checked = 'true';
                    break;
                case "autobus":
                    radio3.checked = 'true';
                    break;
                case "tren":
                    radio4.checked = 'true';
                    break;
            }

            var h1 = document.createElement('h4');
            h1.innerHTML = 'Modo de Transporte';

            var label1 = document.createElement('label');
            label1.setAttribute('for', radio1.id);
            label1.innerHTML = 'Coche';

            var label2 = document.createElement('label');
            label2.setAttribute('for', radio2.id);
            label2.innerHTML = 'A pie';

            var label3 = document.createElement('label');
            label3.setAttribute('for', radio3.id);
            label3.innerHTML = 'Autobus*';

            var label4 = document.createElement('label');
            label4.setAttribute('for', radio4.id);
            label4.innerHTML = 'Tren*';

            var label5 = document.createElement('label');
            label5.innerHTML = '(*) Si existe';

            controlesUI.appendChild(h1);
            controlesUI.appendChild(radio1);
            controlesUI.appendChild(label1);
            controlesUI.appendChild(document.createElement('br'));
            controlesUI.appendChild(radio2);
            controlesUI.appendChild(label2);
            controlesUI.appendChild(document.createElement('br'));
            controlesUI.appendChild(radio3);
            controlesUI.appendChild(label3);
            controlesUI.appendChild(document.createElement('br'));
            controlesUI.appendChild(radio4);
            controlesUI.appendChild(label4);
            controlesUI.appendChild(document.createElement('br'));
            controlesUI.appendChild(label5);

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
                controlesUI.style.opacity = '0.6';
            });
        }

        function CrearPlay(controlesDiv, map) {

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
            var content = '<button class="button button-icon ion-play ion-navicon"></button>';
            var compiled = $compile(content)($rootScope);
            boton.appendChild(compiled[0]);
            boton.onclick = function () {
                //si se ha realizado una ruta, ejecutar play. Si no nada.
                console.log("Play");
                if ($rootScope.rutaRealizada === true)
                {
                    $state.go('menu.navigation');
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

        function obtenerInformacionDistanciasTiempos(origin, destiny) {
            //seleccionado = false;
            //informacion andando
            var service = new google.maps.DistanceMatrixService();
            var tiempoEnTransporte, distanciaEnTransporte;
            service.getDistanceMatrix(
            {
                origins: [origin],
                destinations: [destiny],
                travelMode: google.maps.TravelMode.TRANSIT
            }, function (response, status) {
                if (status == google.maps.DistanceMatrixStatus.OK) {
                    tiempoEnTransporte = response.rows[0].elements[0].duration.text;
                    distanciaEnTransporte = response.rows[0].elements[0].distance.text;
                    $rootScope.modoSegundo = "andando";
                    service.getDistanceMatrix(
                    {
                        origins: [origin],
                        destinations: [destiny],
                        travelMode: google.maps.TravelMode.WALKING
                    }, function (response, status) {
                        if (status == google.maps.DistanceMatrixStatus.OK) {
                            var distanciaMetros = response.rows[0].elements[0].distance.value;
                            var tiempoSecs = response.rows[0].elements[0].duration.value;
                            if (tiempoSecs > ($rootScope.varTiempo / 2) || distanciaMetros > 500) {
                                //Mostrar popup para elegir entre andando o transporte público
                                console.log(tiempoSecs + " " + $rootScope.varTiempo + " " + distanciaMetros);
                                var myPopup = $ionicPopup.show({
                                    template: '<div class="row"><div class="col">Transporte</div><div class="col">Tiempo</div><div class="col">Distancia</div></div><div class="row"><div class="col">A pie</div><div class="col">' + response.rows[0].elements[0].duration.text + '</div><div class="col">' + response.rows[0].elements[0].distance.text + '</div></div><div class="row"><div class="col">Transporte público</div> <div class="col">' + tiempoEnTransporte + '</div><div class="col">' + distanciaEnTransporte + '</div></div><label class="item item-input item-stacked-label"><span class="input-label">Elección</span><select ng-model="modoSegundo"><option value="andando" selected>Andando</option><option value="publico">Transporte público</option></select></label>',
                                    title: 'El tiempo o distancia excesiva',
                                    subTitle: 'El tiempo o la distancia desde el parking al destino de la ruta es demasiado grande para ir a pie. Elija una opción en función de los datos que se muestran a continuación',
                                    scope: $rootScope,
                                    buttons: [
                                        {
                                            text: '<b>Aceptar</b>',
                                            type: 'button-positive',
                                            onTap: function (e) {
                                                if (!$rootScope.modoSegundo) {
                                                    //don't allow the user to close unless he enters wifi password
                                                    e.preventDefault();
                                                } else {
                                                    return $rootScope.modoSegundo;
                                                }
                                            }
                                        }
                                    ]
                                });

                                myPopup.then(function (res) {
                                    //Enrutar segun modo
                                    if ($rootScope.modoSegundo === "andando")
                                    {
                                        calcularRutaSegunda(origin, destiny, "andando");
                                    }
                                    else
                                    {
                                        calcularRutaSegunda(origin, destiny, "transporte");
                                    }
                                    
                                    $rootScope.enrutado = true;
                                });
                            } else {
                                //Enrutar desde el parking al destino original y mostrar facilidades
                                console.log(tiempoSecs + " " + $rootScope.varTiempo + " " + distanciaMetros + " X");
                                calcularRutaSegunda(origin, destiny, "andando");
                            }
                        }
                    });
                }
            });
            
        }

        function obtenerInfo(path, tipo)
        {
            $http({ method: 'GET', url: path })
                .success(function (data, status) {
                    //si la petición ha sido correcta, tendremos una lista de objetos JSON

                    angular.forEach(data, function (item, key) {
                        
                        switch (tipo) {
                            case 1:
                                $rootScope.farmacias.push(item);
                                break;

                            case 2:
                                $rootScope.aparcamientos.push(item);
                                break;

                            case 3:
                                $rootScope.incidencias.push(item);
                                break;

                            case 4:
                                $rootScope.centrosSalud.push(item);
                                break;

                            case 5:
                                $rootScope.hospitales.push(item);
                                break;

                            case 6:
                                $rootScope.paradasBilboBus.push(item);
                                break;

                            case 7:
                                $rootScope.paradasBizkaibus.push(item);
                                break;

                            case 8:
                                $rootScope.paradasEuskotren.push(item);
                                break;

                            case 9:
                                $rootScope.paradasMetro.push(item);
                                break;

                            case 10:
                                $rootScope.paradasTranvia.push(item);

                            case 11:
                                $rootScope.puntosBici.push(item);
                                break;
                        }
                    });
                }).error(function (data, status) {
                }).finally(function () {
                    if(tipo === 4 && $rootScope.modo !== "coche")
                    {
                        mostrarTodaInformacion();
                    }
                });
        }

        function calcularRutaSegunda(origen, destino, modo) {
            $rootScope.enrutado = true;
            console.log("Segunda ruta");
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
                case "transporte":
                    request = {
                        origin: start,
                        destination: end,
                        provideRouteAlternatives: true,
                        travelMode: google.maps.TravelMode.TRANSIT,
                        transitOptions: { modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.RAIL, google.maps.TransitMode.SUBWAY, google.maps.TransitMode.TRAIN, google.maps.TransitMode.TRAM] }
                    };
                    break;
            }
            $rootScope.directionsServiceSegundo = new google.maps.DirectionsService();
            $rootScope.directionsDisplaySegundo = new google.maps.DirectionsRenderer({
                draggable: true,
                map: $rootScope.map,
                preserveViewport: true,
                polylineOptions: {
                    strokeColor: "black"
                }
            });
            //$rootScope.directionsDisplaySegundo.setPanel(document.getElementById('panel'));
            $rootScope.directionsService.route(request, function (response, status) {
                console.log(status);
                if (status == google.maps.DirectionsStatus.OK) {
                    console.log("Ruta segunda correcta");
                    $rootScope.directionsDisplaySegundo.setDirections(response);
                    $rootScope.rutaRealizada = true;
                    mostrarTodaInformacion();
                }
            });
        };

        function mostrarTodaInformacion() {
            mostrarInformacion($rootScope.paradasBilboBus, 6);
            mostrarInformacion($rootScope.paradasEuskotren, 8);
            mostrarInformacion($rootScope.paradasTranvia, 10);
            mostrarInformacion($rootScope.paradasBizkaibus, 7);
            mostrarInformacion($rootScope.paradasMetro, 9);
            mostrarInformacion($rootScope.puntosBici, 11);
            mostrarInformacion($rootScope.hospitales, 5);
            mostrarInformacion($rootScope.farmacias, 1);
            mostrarInformacion($rootScope.centrosSalud, 4);

            if ($state.current.name === "menu.track-mapFav") {
                $rootScope.map.setZoom(13);
                $state.go('menu.track-map');
            }
        };

        function mostrarInformacion(lista, tipo)
        {
            angular.forEach(lista, function (item, key) {

                var myLatlng = new google.maps.LatLng(item.latitud, item.longitud);

                var contentString = formatearInfo(item, tipo);

                var infowindow = new google.maps.InfoWindow({
                    maxWidth : 350
                });

                var marker = new google.maps.Marker({
                    position: myLatlng,
                    title: contentString,
                    animation: google.maps.Animation.DROP,
                    icon: iconos[tipo],
                    content: contentString
                });
                marker.infowindow = infowindow;

                switch (tipo) {
                    case 1:
                        //farmacia
                        $rootScope.Mfarmacias.push(marker);
                        break;
                    case 2:
                        //parking
                        $rootScope.Maparcamientos.push(marker);
                        $rootScope.Iaparcamientos[item.nombreParking] = infowindow;
                        break;
                    case 3:
                        //incidencias
                        $rootScope.Mincidencias.push(marker);
                        break;
                    case 4:
                        //centro salud
                        $rootScope.McentrosSalud.push(marker);
                        break;
                    case 5:
                        //hospital
                        $rootScope.Mhospitales.push(marker);
                        break;
                    case 6:
                        //bilbobus
                        $rootScope.MparadasBilboBus.push(marker);
                        $rootScope.IparadasBilboBus[item.nombreParada] = infowindow;
                        break;
                    case 7:
                        //bizkaibus
                        $rootScope.MparadasBizkaibus.push(marker);
                        break;
                    case 8:
                        //Euskotren
                        $rootScope.MparadasEuskotren.push(marker);
                        break;
                    case 9:
                        //metro
                        $rootScope.MparadasMetro.push(marker);
                        break;
                    case 10:
                        //tranvia
                        $rootScope.MparadasTranvia.push(marker);
                        break;
                    case 11:
                        //bicis
                        $rootScope.MpuntosBici.push(marker);
                        $rootScope.IpuntosBici[item.nombrePunto] = infowindow;
                        break;
                }

                //se añade un evento al marcador
                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.setContent(this.content);
                    infowindow.open($rootScope.map, this);
                });

                marker.setMap($rootScope.map);
            });
            }


        function formatearInfo(item, tipo) {
            switch (tipo) {
                case 1:
                    return "<div id='iw-container'><div class='iw-title'><b>" + item.nombreFarmacia + "</b></div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b> Dirección:</b> " + item.direccionAbreviada + "</li><li type='square'><b> Contácto:</b> " + item.telefono + "</li></ul></div><div class='iw-bottom-gradient'></div></div>";
                    break;
                case 2:
                    if (item.nombreParking in $rootScope.estadosParking) {
                        return "<div id='iw-container'><div class='iw-title'><b>Parking:</b> " + item.nombreParking + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b> Capacidad: </b> " + item.capacidad + "</li></ul><br><h4><b> Disponibilidad actual: </b>" + $rootScope.estadosParking[item.nombreParking] + "</h4></div><div class='iw-bottom-gradient'></div></div>";
                    }
                    else {
                        return "<div id='iw-container'><div class='iw-title'><b>Parking:</b> " + item.nombreParking + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b> Capacidad: </b> " + item.capacidad + "</li></ul></div><div class='iw-bottom-gradient'></div></div>";
                    }
                case 3:
                    return "<div id='iw-container'><div class='iw-title'><b>" + item.tipo + "</b></div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b> Descripción: </b> " + item.descripcion + "</li><li type='square'><b>Fecha Inicio:</b> " + item.inicio + "</li><li type='square'><b>Fecha Fin: </b>" + item.fin + "</li></ul></div><div class='iw-bottom-gradient'></div></div>";
                case 4:
                    return "<div id='iw-container'><div class='iw-title'><b>Centro de Salud:</b> " + item.nombreCentro + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b>Dirección:</b> " + item.direccionCompleta + "</li><li type='square'><b>Horario:</b> " + item.horario + "</li><li type='square'><b>Teléfono:<b> " + item.telefono + "</li></ul><a href='" + item.web + "' class='button' target='_blank'><b>Página web:</b></a></div><div class='iw-bottom-gradient'></div></div>";
                case 5:
                    return "<div id='iw-container'><div class='iw-title'><b>Hospital:</b> " + item.nombreHospital + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b>Dirección:</b> " + item.direccionCompleta + "</li><li type='square'><b>Teléfono:<b> " + item.telefono + "</li></ul><a href='" + item.web + "' class='button' target='_blank'><b>Página web:</b></a></div><div class='iw-bottom-gradient'></div></div>";
                case 6:
                    var inicial = "<div id='iw-container'><div class='iw-title'><b>Parada de Bilbobus:</b> " + item.nombreParada + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b>Abreviatura:</b>" + item.abreviatura + "</li></ul>";
                    inicial = inicial + "<hr><table border='1' style='width:100%'><thead><tr><th><b>Id de Linea<b></th><th><b>Nombre de Linea<b></th><th><b>Tiempo Restante<b></th></tr></thead><tbody>";
                    if (item.id in $rootScope.estadosBilbobus) {
                        for (var index in $rootScope.estadosBilbobus[item.id]) {
                            if ($rootScope.estadosBilbobus[item.id][index].tiempo === -1) {
                                inicial = inicial + "<tr><td align='center'>" + $rootScope.estadosBilbobus[item.id][index].id + "</td><td align='center'>" + $rootScope.estadosBilbobus[item.id][index].linea + "</td><td align='center'>En parada</td></tr>";
                            }
                            else {
                                inicial = inicial + "<tr><td align='center'>" + $rootScope.estadosBilbobus[item.id][index].id + "</td><td align='center'>" + $rootScope.estadosBilbobus[item.id][index].linea + "</td><td align='center'>" + $rootScope.estadosBilbobus[item.id][index].tiempo + "</td></tr>";
                            }

                        }
                    }
                    inicial = inicial + "</tbody></table></div><div class='iw-bottom-gradient'></div></div>";
                    return inicial;
                case 7:
                    return "<div id='iw-container'><div class='iw-title'><b>Parada de Bizkaibus:</b> " + item.nombreParada + "</div></div>";
                case 8:
                    if (item.web === undefined) {
                        return "<div id='iw-container'><div class='iw-title'><b>Parada de Euskotren:</b> " + item.nombreParada + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b>Código de parada:</b> " + item.codigoParada + "</li></ul></div><div class='iw-bottom-gradient'></div></div>";
                    }
                    else {
                        return "<div id='iw-container'><div class='iw-title'><b>Parada de Euskotren:</b> " + item.nombreParada + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b>Código de parada:</b> " + item.codigoParada + "</li></ul><a href='" + item.web + "' class='button' target='_blank'><b>Página web:</b></a></div><div class='iw-bottom-gradient'></div></div>";
                    }
                case 9:
                    return "<div id='iw-container'><div class='iw-title'><b>Parada de Metro:</b> " + item.nombreParada + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b>Código de parada:</b> " + item.codigoParada + "</li></ul><a href='https://www.metrobilbao.eus/utilizando-el-metro/mapa-y-frecuencias' class='button' target='_blank'>Más información...</a></div><div class='iw-bottom-gradient'></div></div>";
                case 10:
                    return "<div id='iw-container'><div class='iw-title'><b>Parada de Tranvía:</b> " + item.nombreParada + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b>Localización:</b> " + item.descripcion + "</li></ul></div><div class='iw-bottom-gradient'></div></div>";
                case 11:
                    if (item.nombrePunto in $rootScope.estadosBici) {
                        return "<div id='iw-container'><div class='iw-title'><b>Punto de bicis:</b> " + item.nombrePunto + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b>Estado:</b> " + item.estado + "</li><li type='square'><b>Capacidad:</b> " + item.capacidad + "</li></ul><h4>Disponibilidad en Tiempo Real</h4>" + $rootScope.
                            estadosBici[item.nombrePunto] + "</div><div class='iw-bottom-gradient'></div></div>";
                    }
                    else {
                        return "<div id='iw-container'><div class='iw-title'><b>Punto de bicis:</b> " + item.nombrePunto + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b>Estado:</b> " + item.estado + "</li><li type='square'><b>Capacidad:</b> " + item.capacidad + "</li></ul></div><div class='iw-bottom-gradient'></div></div>";
                    }
                default:
                    console.log(tipo);
            }
        }
        
        function resetearMarcadores()
        {
            for (var i = 0; i < $rootScope.Maparcamientos.length; i++) {
                $rootScope.Maparcamientos[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.MparadasBilboBus.length; i++) {
                $rootScope.MparadasBilboBus[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.MparadasEuskotren.length; i++) {
                $rootScope.MparadasEuskotren[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.MparadasTranvia.length; i++) {
                $rootScope.MparadasTranvia[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.MparadasBizkaibus.length; i++) {
                $rootScope.MparadasBizkaibus[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.MparadasMetro.length; i++) {
                $rootScope.MparadasMetro[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.MpuntosBici.length; i++) {
                $rootScope.MpuntosBici[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.Mincidencias.length; i++) {
                $rootScope.Mincidencias[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.Mhospitales.length; i++) {
                $rootScope.Mhospitales[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.Mfarmacias.length; i++) {
                $rootScope.Mfarmacias[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.McentrosSalud.length; i++) {
                $rootScope.McentrosSalud[i].setMap(null);
            }

            $rootScope.aparcamientos = [];
            $rootScope.paradasBilboBus = [];
            $rootScope.paradasEuskotren = [];
            $rootScope.paradasTranvia = [];
            $rootScope.paradasBizkaibus = [];
            $rootScope.paradasMetro = [];
            $rootScope.puntosBici = [];
            $rootScope.incidencias = [];
            $rootScope.hospitales = [];
            $rootScope.farmacias = [];
            $rootScope.centrosSalud = [];


            $rootScope.Maparcamientos = [];
            $rootScope.MparadasBilboBus = [];
            $rootScope.MparadasEuskotren = [];
            $rootScope.MparadasTranvia = [];
            $rootScope.MparadasBizkaibus = [];
            $rootScope.MparadasMetro = [];
            $rootScope.MpuntosBici = [];
            $rootScope.Mincidencias = [];
            $rootScope.Mhospitales = [];
            $rootScope.Mfarmacias = [];
            $rootScope.McentrosSalud = [];


            $rootScope.Iaparcamientos = {};
            $rootScope.IparadasBilboBus = {};
            $rootScope.IpuntosBici = {};
        }

        function quitarDelMapa()
        {
            for (var i = 0; i < $rootScope.Maparcamientos.length; i++) {
                $rootScope.Maparcamientos[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.MparadasBilboBus.length; i++) {
                $rootScope.MparadasBilboBus[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.MparadasEuskotren.length; i++) {
                $rootScope.MparadasEuskotren[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.MparadasTranvia.length; i++) {
                $rootScope.MparadasTranvia[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.MparadasBizkaibus.length; i++) {
                $rootScope.MparadasBizkaibus[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.MparadasMetro.length; i++) {
                $rootScope.MparadasMetro[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.MpuntosBici.length; i++) {
                $rootScope.MpuntosBici[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.Mincidencias.length; i++) {
                $rootScope.Mincidencias[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.Mhospitales.length; i++) {
                $rootScope.Mhospitales[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.Mfarmacias.length; i++) {
                $rootScope.Mfarmacias[i].setMap(null);
            }
            for (var i = 0; i < $rootScope.McentrosSalud.length; i++) {
                $rootScope.McentrosSalud[i].setMap(null);
            }
        }

        $rootScope.buscarRutaAqui = function(latitud, longitud, modo)
        {
            $rootScope.anteriorModo = $rootScope.modo;
            $rootScope.modo = modo;
            if (document.getElementById('myRadioId1'))
            {
                switch ($rootScope.modo) {
                    case "coche":
                        document.getElementById('myRadioId1').checked = true;
                        break;
                    case "andando":
                        document.getElementById('myRadioId2').checked = true;
                        break;
                    case "autobus":
                        document.getElementById('myRadioId3').checked = true;
                        break;
                    case "tren":
                        document.getElementById('myRadioId4').checked = true;
                        break;
                }
            }
            console.log("En trackController " + modo);
            $rootScope.busquedaRealizada = true;
            $rootScope.conClick = true;
            $rootScope.destinoEnrutado = new google.maps.LatLng(latitud, longitud);
            $rootScope.origenEnrutado = $rootScope.posActual;
            obtenerCodigoPostal($rootScope.destinoEnrutado);
        }

        if ($rootScope.destinoDesdeFav !== null) {
            $rootScope.buscarRutaAqui($rootScope.destinoDesdeFav.lat(), $rootScope.destinoDesdeFav.lng(), $rootScope.modo);
            $rootScope.destinoDesdeFav = null;
        }
});