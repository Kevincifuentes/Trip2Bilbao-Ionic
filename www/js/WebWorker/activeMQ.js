ws = new WebSocket('wss://dev.mobility.deustotech.eu:61614', 'stomp');

//Notificar para la conexión
ws.onopen = function () {
    var seconds = new Date().getTime() / 1000;
    ws.send('CONNECT\n\n\0');

    //Notificar que nos suscribimos y a que nos suscribimos
    ws.send('SUBSCRIBE\ndestination:/topic/Trip2Bilbao\nack:auto\nactivemq.retroactive:true\n\n\0');
};
//En caso de mensaje de ejecutará la función
ws.onmessage = function (e) {

    if (e.data.startsWith('MESSAGE')) {
        var lines = e.data.split('\n');
        postMessage(lines);
    }
};
