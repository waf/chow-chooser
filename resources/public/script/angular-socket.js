App.factory('$socket', function($rootScope) {
    var callbacks = {},
        socket;

    function onOpen() {
        console.log('open');
        if(callbacks.connect)
            $rootScope.$apply(function() { callbacks.connect(); });
    }
    function onClose() {
        console.log('close');
    }
    function onMessage(e) {
        console.log('message', e.data);
        var message = JSON.parse(e.data);
        var cmd = message.cmd;
        delete message.cmd;
        $rootScope.$apply(function() { callbacks[cmd](message); });
    }

    return {
        //TODO: requiring a 'connect' function is awkward
        connect: function(addr) {
            socket = new WebSocket(addr);
            socket.onopen = onOpen;
            socket.onclose = onClose;
            socket.onmessage = onMessage;
        },
        on: function(cmd, callback) {
            callbacks[cmd] = callback;
        },
        send: function(cmd, payload) {
            var msg = payload || {};
            msg['cmd'] = cmd;
            socket.send(JSON.stringify(msg));
        }
    };
});
