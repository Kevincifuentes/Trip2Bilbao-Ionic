ws = new WebSocket('wss://dev.mobility.deustotech.eu:61614?needClientAuth=true&amp;wantClientAuth=true&amp;transport.clientCertSubject=nms.client.170&amp;transport.clientCertPassword=trip2bilbao;transport.clientCertFilename=client.ks', 'stomp');

//Notificar para la conexión
ws.onopen = function () {
    ws.send('CONNECT\n\n\0');

    //Notificar que nos suscribimos y a que nos suscribimos
    ws.send('SUBSCRIBE\ndestination:/topic/PruebaEMISOR\nack:auto\nactivemq.retroactive:true\n\n\0');
};
//En caso de mensaje de ejecutará la función
ws.onmessage = function (e) {

    if (e.data.startsWith('MESSAGE')) {
        var lines = e.data.split('\n');
        postMessage(lines);
    }
};