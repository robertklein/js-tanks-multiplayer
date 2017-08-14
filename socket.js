g.s = {
    obj: null,
    cf: 10,
    init: function(){
        this.obj = io('http://192.168.102.85:3003/room1');
        this.obj.on('connect', function () {
            console.log('socket: connected');
        });
        this.obj.on('s2c', function(d){
            console.log('socket: s2c');
            console.log(JSON.stringify(d));
        });
    }
};

g.s.init();