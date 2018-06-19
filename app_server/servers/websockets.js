module.exports = function(httpsServer) {
    var config = require('../config');
    var WebSocketServer = require('ws').Server;
    var wss = new WebSocketServer({
        'server': httpsServer
    });
    wss.on('error', onError);
    wss.on('listening', onListening);
//to save all the connections from clients as well as other info
    var connections = [];
    wss.on('connection', function(ws) {
        console.log('Creating connection with WebSocketServer');

        ws.on('message', function(message) {
            console.log('Received: %s', message);
            if (isJson(message)) {
                var obj = JSON.parse(message);
                switch (obj.section) {
                    case 'people':
                        if (obj.data.operation == 'connected') {
                            connections.push({
                                'ws': ws,
                                'user': {
                                    'userName': obj.data.userName,
                                    'name': obj.data.name
                                },
                                'geo': {
                                    'latitude': '',
                                    'longitude': '',
                                },
                                'videoconference': {
                                    'enabled': false
                                }
                            });
                            broadcast(message, obj.data.userName); //to notify others
                            loadInfoFromOthers(ws, obj.data.userName);
                        }
                        else if (obj.data.operation == 'disconnected') {
                            broadcast(message, obj.data.userName); //to notify others
                            disconnectUser(obj.data.userName);
                        }
                        break;
                    case 'messages':
                        broadcast(message, ''); //to notify everybody
                        break;
                    case 'audio':
                        broadcast(message, ''); //to notify everybody
                        break;
                    default:
                        console.log('Unrecognized message');
                        break;
                }
            }
        });

        ws.on('close', function () {
            console.log('Closing connection with WebSocketServer');
            broadcast = function(message, sentBy) {125
                connections.forEach(function(cnn) {
                    if (cnn.user.userName != sentBy) {
                        console.log('Sent: %s to %s', message, cnn.user.userName);
                        if (cnn.ws) cnn.ws.send(message);
                    }
                });
            };
            loadInfoFromOthers = function broadcast(ws, sentBy) {
                connections.forEach(function (cnn) {
                    if (cnn.user.userName != sentBy) {
                        var message = {
                            'section': 'people',
                            'data': {
                                'operation': 'connected',
                                'name': cnn.user.name,
                                'userName': cnn.user.userName
                            }
                        };
                        console.log('**Sent: %s to %s', JSON.stringify(message), sentBy);
                        if (ws) ws.send(JSON.stringify(message));
                        var message = {
                            'section': 'geolocation',
                            'data': {
                                'operation': 'connected',
                                'name': cnn.user.name,
                                'userName': cnn.user.userName,
                                'latitude': cnn.geo.latitude,
                                'longitude': cnn.geo.longitude
                            }
                        };
                        console.log('**Sent: %s to %s', JSON.stringify(message), sentBy);
                        if (ws) ws.send(JSON.stringify(message));
                    }
                });
            };
            disconnectUser = function(sentBy) {
                for (var i = 0; i < connections.length; i++) {
                    if (connections[i].user.userName == sentBy) {
                        connections.splice(i, 1);
                        i--;
                    }
                }
            };
        });

        broadcast = function(message, sentBy) {
            connections.forEach(function(cnn) {
                if (cnn.user.userName != sentBy) {
                    console.log('Sent: %s to %s', message, cnn.user.userName);
                    if (cnn.ws) cnn.ws.send(message);
                }
            });
        };
        loadInfoFromOthers = function broadcast(ws, sentBy) {
            connections.forEach(function (cnn) {
                if (cnn.user.userName != sentBy) {
                    var message = {
                        'section': 'people',
                        'data': {
                            'operation': 'connected',
                            'name': cnn.user.name,
                            'userName': cnn.user.userName
                        }
                    };
                    console.log('**Sent: %s to %s', JSON.stringify(message), sentBy);
                    if (ws) ws.send(JSON.stringify(message));
                    var message = {
                        'section': 'geolocation',
                        'data': {
                            'operation': 'connected',
                            'name': cnn.user.name,
                            'userName': cnn.user.userName,
                            'latitude': cnn.geo.latitude,
                            'longitude': cnn.geo.longitude
                        }
                    };
                    console.log('**Sent: %s to %s', JSON.stringify(message), sentBy);
                    if (ws) ws.send(JSON.stringify(message));
                }
            });
        };
        disconnectUser = function(sentBy) {
            for (var i = 0; i < connections.length; i++) {
                if (connections[i].user.userName == sentBy) {
                    connections.splice(i, 1);
                    i--;
                }
            }
        };
    });
    function isJson(str) {
        try {
            JSON.parse(str);
        }
        catch (e) {
            return false;
        }
        return true;
    }
    function onError(err) {
        console.error(err.message);
        process.exit(1);
    }
    function onListening() {
        console.log('The Websocket server is running on PORT: ' + config.port);
    }
};