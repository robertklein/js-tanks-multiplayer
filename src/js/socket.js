g.s = {
    obj: null,
    cf: 10,
    id: null,
    init: function(){
        this.obj = io('http://kdevelop.sk:3003/tanks');
        // this.obj = io('http://192.168.102.85:3003/tanks');
        // this.obj = io('http://192.168.0.106:3003/tanks');
        // this.obj = io('http://95.170.246.53:3003/tanks');
        this.obj.on('connect', function () {
            console.log('socket: connected');
        });
        this.obj.on('s2c', function(d){
            //console.log('socket: s2c');
            //console.log(JSON.stringify(d));
            /* if(d[1] == 'm'){
                if(d[1][0])
                g.t[0].x = d[1][1];
                g.t[0].y = d[1][2];
                g.t[0].a = d[1][3];
                g.t[0].ta = d[1][4];
                g.t[0].h = d[1][5];
            }*/
            if(d[1] == 'ta'){
                g.tank.add(d[0], d[2]);
            } else if(d[1] == 'tr'){
                if(d[0] == g.s.id){
                    window.location.href = "new.html";
                } else {
                    g.tank.remove(d[0], d[2]);
                }
            } else if(d[1] == 'yid'){
                g.o.x = d[2][0];
                g.o.y = d[2][1];
                g.o.angle = d[2][2];
                g.o.turret_angle = 0;

                g.s.id = d[0];

                g.s.obj.emit('c2s', [g.s.id, 'ta', [g.o.x, g.o.y, g.o.angle, 0, 1]]);
            } else if(d[1] == 'm'){
                if(typeof g.tm[d[0]] === 'undefined'){
                    g.tank.add(d[0], d[2]);
                } else {
                    g.t[g.tm[d[0]]].x = d[2][0];
                    g.t[g.tm[d[0]]].y = d[2][1];
                    g.t[g.tm[d[0]]].a = d[2][2];
                    g.t[g.tm[d[0]]].ta = d[2][3];
                }
            } else if(d[1] == 'bang'){
                var snd = new Audio("sound/bang.mp3");
                snd.volume = 0.2;
                snd.play();
            } else if(d[1] == 'explosion'){
                setTimeout(function(){
                    var snd = new Audio("sound/explosion.mp3");
                    snd.volume = 1;
                    snd.play();
                }, 500);
            } else if(d[1] == 'hit'){
                if(parseInt(d[2][0]) == g.s.id){
                    console.log(1123123);
                    g.o.health = d[2][1];

                    setTimeout(function(){
                        var snd = new Audio("sound/fire_impact"+Math.ceil(Math.random()*2)+".mp3");
                        snd.volume = 1;
                        snd.play();
                    }, 200);
                } else if(typeof g.tm[d[2][0]] === 'undefined'){
                    console.log('nothing');
                } else {
                    g.t[g.tm[d[2][0]]].h = d[2][1];

                    setTimeout(function(){
                        var snd = new Audio("sound/fire_impact"+Math.ceil(Math.random()*2)+".mp3");
                        snd.volume = 0.2;
                        snd.play();
                    }, 200);
                }
            }
        });
    }
};

/*
    s2c:
    .emit('s2c', [sender_client_id, 'method', [__data_array__]]);

    c2s:
    g.s.obj.emit('c2s', [sender_client_id, 'method', [__data_array__]]);
*/

g.s.init();