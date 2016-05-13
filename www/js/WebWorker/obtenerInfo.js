var obtenerInfo = function (path, tipo) {
    $http({ method: 'GET', url: path })
    .success(function (data, status) {
        //si la petición ha sido correcta, tendremos una lista de objetos JSON

        angular.forEach(data, function (item, key) {

            var contentString = formatearInfo(tipo, item);
            var infowindow = new google.maps.InfoWindow({
                content: contentString,
                maxWidth: 350
            });
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(item.latitud, item.longitud),
                title: contentString,
                icon: iconos[tipo]
            });
            postMessage({ tipo: tipo, marker: marker, infowindow: infowindow });

        });
    }).error(function (data, status) {
        console.log(status);
    });
};

obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/parkings/parkings/", 2);
setTimeout(function () {}, 500);
obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/paradasmetro/paradasmetro/", 9);
obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/puntosbici/puntosbici/", 11);
obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/paradastranvia/paradastranvia/", 10);
obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/paradaseuskotren/paradaseuskotren/", 8);
obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/paradasbizkaibus/paradasbizkaibus/", 7);
obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/paradasbilbo/paradasbilbo/", 6);
obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/incidencias/fecha/", 3);
obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/hospitales/hospitales/", 5);
obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/farmacias/farmacias/", 1);
obtenerInfo("http://dev.mobility.deustotech.eu/Trip2Bilbao/api/centros/centros/", 4);