angular.module('blusecur.track.controllers', [])

.controller('TrackMapCtrl', function ($rootScope, $compile, $timeout, $interval, $ionicPopup, $state, $stateParams, $filter, $translate, store, jwtHelper, $ionicModal, CrossingService, VesselService, CrewService, ContactsService, LovsService, LocationService, uiGmapGoogleMapApi, $http) {
    if ($rootScope.map === undefined)
    {
        $rootScope.modo = "coche";
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

        var controlesDiv = document.createElement('DIV');
        var controles = new CrearLeyenda(controlesDiv, $rootScope.map, $rootScope, $compile);
        controlesDiv.index = 3;
        $rootScope.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(controlesDiv);

        var controlesDiv2 = document.createElement('DIV');
        var controles2 = new CrearControles(controlesDiv2, $rootScope.map, $rootScope, $compile);
        controlesDiv2.index = 3;
        $rootScope.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(controlesDiv2);

        for(var i =0; i<$rootScope.marcadoresFavoritos.length; i++)
        {
            $rootScope.marcadoresFavoritos[i].setMap($rootScope.map);
        }

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
        console.log("Buena llamada");
        var transporte;
        var start = new google.maps.LatLng(origen.lat(), origen.lng());
        var end = new google.maps.LatLng(destino.lat(), destino.lng());
        var request;
        console.log(modo);
            switch (modo) {
                case "coche":
                    request = {
                        origin: start,
                        destination: end,
                        travelMode: google.maps.TravelMode.DRIVING
                    };
                    break;
                case "andando":
                    request = {
                        origin: start,
                        destination: end,
                        travelMode: google.maps.TravelMode.WALKING
                    };
                    break;
                case "autobus":
                    request = {
                        origin: start,
                        destination: end,
                        travelMode: google.maps.TravelMode.TRANSIT,
                        transitOptions: { modes: [google.maps.TransitMode.BUS] }
                    };
                    break;
                case "tren":
                    request = {
                        origin: start,
                        destination: end,
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
            $rootScope.busquedaRealizada = true;
            $rootScope.busqueda.hide();
            $rootScope.origenNombre = origen;
            $rootScope.origenDestino = destino;
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
                        var geocoder = new google.maps.Geocoder();
                        geocoder.geocode({ 'address': $rootScope.origenNombre }, function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                //alert(results[0].geometry.location);
                                var puntoLocalizacion = results[0].geometry.location;
                                calcularRuta(puntoLocalizacion, new google.maps.LatLng($rootScope.parkings[0].latitud, $rootScope.parkings[0].longitud), $rootScope.modo);
                                geocoder.geocode({ 'address': $rootScope.origenDestino }, function (results, status) {
                                    if (status == google.maps.GeocoderStatus.OK) {
                                        var destino = results[0].geometry.location;
                                        //calcularRutaSegunda()
                                    }
                                });
                            } else {
                                alert("No se pudo obtener el punto exacto por: " + status);
                            }
                        });
                    }
                    else
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
                                        '<button ng-click="buscarRutaAqui(' + res.latitud + ',' + res.longitud + ')">Ir aquí</button>' +
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
                                      '<button ng-click="buscarRutaAqui()">Ir aquí</button>' +
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
                    $rootScope.marcadorFav.setMap(null);
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
            });

            google.maps.event.addDomListener(controlesUI, 'mouseout', function () {
                controlesUI.style.backgroundColor = 'white';
                controlesUI.style.fontSize = '14px';
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
            controlesUI.style.textAlign = 'center';
            controlesUI.title = 'Controles';
            controlesDiv.appendChild(controlesUI);

            //CHECKBOX DE CLICK
            var radio1 = document.createElement('input');
            radio1.id = 'myRadioId1';
            radio1.type = 'radio';
            radio1.name = 'radioGroup';
            radio1.value = 'Coche';
            radio1.checked = 'true';
            radio1.onclick = function () {
                $rootScope.modo = "coche";
                if ($rootScope.busquedaRealizada === true)
                {
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
                    $rootScope.seguirBuscarRuta(0, false);
                }
            }

            var radio4 = document.createElement('input');
            radio4.id = 'myRadioId3';
            radio4.type = 'radio';
            radio4.name = 'radioGroup';
            radio4.value = 'Bus';
            radio4.onclick = function () {
                $rootScope.modo = "tren";
                if ($rootScope.busquedaRealizada === true) {
                    $rootScope.seguirBuscarRuta(0, false);
                }
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
            label3.innerHTML = 'Autobus';

            var label4 = document.createElement('label');
            label4.setAttribute('for', radio4.id);
            label4.innerHTML = 'Tren';

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
            });

            google.maps.event.addDomListener(controlesUI, 'mouseout', function () {
                controlesUI.style.backgroundColor = 'white';
                controlesUI.style.fontSize = '14px';
            });
        }
});