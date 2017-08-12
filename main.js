var g = {
    o: {
        x: 450,
        y: 280,
        speed: 8,
        angle: 190,
        rotation: 2.5,
        health: 1,
        turret_angle: 0,
        turret_rotation: 1,
        mod: 0,
        acc: 0,
        acc_step: 0.02,
        is_acc: 0,
        firing: 0,
        canvas: null,
        context: null,
        tank: null,
        turret: null,
        move: null,
        interval: null,
        target: {x:450, y:230, dist:0, angle:0},
        debug: 0
    },
    t: [],
    tank: {
        add: function(){
            setTimeout(function(){
                g.t.push({
                    x: Math.floor(Math.random() * 1800) + 100,
                    y: Math.floor(Math.random() * 900) + 100,
                    a: Math.floor(Math.random() * 359) + 0,
                    ta:0,
                    h:1,
                    s: null
                });
            }, Math.floor(Math.random() * 10)*1000);
        },
        hit: function(index){
            var t = g.t[index];
            t.h = t.h - (t.s === null ? 0 : t.s);
            return Math.max(0, t.h);
        }
    },
    e: [
        {x: 400, y: 400, r: 50},
        {x: 500, y: 400, r: 50},
        {x: 660, y: 400, r: 80},
        {x: 400, y: 500, r: 120}
    ],
    init: function(){
        g.o.canvas = document.getElementById("canvas");
        g.o.context = g.o.canvas.getContext("2d");
        g.o.tank = new Image();
        g.o.tank.src="tank_body.png";
        g.o.turret = new Image();
        g.o.turret.src="tank_turret.png";
        g.o.background = new Image();
        g.o.background.src = "desert.jpg";
        g.o.background.onload = function(){
            g.o.context.drawImage(g.o.background,0,0);   
        }
        g.o.stone = new Image();
        g.o.stone.src="stone.png";

        window.addEventListener("keydown", g.handlers.keypress, false);
        window.addEventListener("keyup", g.handlers.keyup, false);

        for(var i = 0; i<10; i++) g.tank.add();

        g.o.move = setInterval(function(){
            g.draw.frame();
        }, 30);
    },
    keys:{
        f: false,
        b: false,
        l: false,
        r: false,
        shift: false,
        fire: false,
        handle: function(){
            if(!this.shift && this.l){
                g.o.angle -= g.o.rotation;
                if(g.o.angle < 0) g.o.angle = 360 - g.o.angle;
            }
            if(!this.shift && this.r){
                g.o.angle += g.o.rotation;
                g.o.angle %= 360;
            }
            if(this.shift && this.l){
                g.o.turret_angle -= g.o.turret_rotation;
            }
            if(this.shift && this.r){
                g.o.turret_angle += g.o.turret_rotation;
            }
        }
    },
    draw: {
        tank: {
            _one: function(x, y, a, ta, h, primary){
                primary = typeof primary === 'undefined' ? 0 : primary;
                g.o.context.save();

                g.o.context.translate(x, y);
                g.o.context.rotate(Math.PI/180 * a);
                g.o.context.drawImage(g.o.tank, -(g.o.tank.width/2), -(g.o.tank.height/2));
                g.o.context.rotate(Math.PI/180 * ta);

                if(primary && g.o.firing) g.o.context.globalAlpha = 0.5;
                g.o.context.drawImage(g.o.turret, -(g.o.tank.width/2), -(g.o.tank.height/2));
                if(primary && g.o.firing) g.o.context.globalAlpha = 1;


                if(primary){
                    g.o.context.beginPath();
                    g.o.context.lineWidth = 2;
                    g.o.context.strokeStyle = 'rgba(255,255,255,1)';
                    g.o.context.setLineDash([5, 50]);
                    g.o.context.moveTo(0, 0);
                    g.o.context.lineTo(2000, 0);
                    g.o.context.stroke();
                    g.o.context.lineWidth = 1;
                }

                g.o.context.restore();

                g.o.context.save();
                g.o.context.beginPath();
                g.o.context.strokeStyle = 'rgba(0,255,0,0.8)';
                g.o.context.lineWidth = 8;
                g.o.context.moveTo(x - 50, y - 70);
                g.o.context.lineTo(x - 50 + (h * 100), y - 70);
                g.o.context.stroke();
                g.o.context.restore();
            },
            my: function(){
                this._one(g.o.x, g.o.y, g.o.angle, g.o.turret_angle, g.o.health, 1);
            },  
            all: function(){
                for(var k in g.t){
                    var t = g.t[k];
                    this.one(t.x, t.y, t.a, t.ta, t.h, k);
                }
            },
            one: function(x, y, a, ta, h, i){
                this._one(x, y, a, ta, h);

                // doratat 2. bod na priamke
                var total_angle = g.o.angle+g.o.turret_angle;
                var x1 = g.o.x;
                var y1 = g.o.y;
                var x2 = x1 - 300;
                var y2 = y1 - (Math.tan(Math.PI/180*(total_angle)) * 300);

                var x3 = x;
                var y3 = y;
                var x4 = null;
                var y4 = null;

                var x5 = Math.abs(x3-x1); // rozdiel medzi targetom a delom
                var y5 = Math.abs(y3-y1);
                var a5 = Math.atan(y5/x5)/Math.PI*180;
                var dir = false;
                if(x3<x1 && y3>y1) a5 = 180 - a5;
                if(x3<x1 && y3<y1) a5 = 180 + a5;
                if(x3>x1 && y3<y1) a5 = 360 - a5;
                if(Math.abs(a5-total_angle%360)<90 || Math.abs(a5-total_angle%360)>270) dir = true;


                var k = ((y2-y1) * (x3-x1) - (x2-x1) * (y3-y1)) / (Math.pow(y2-y1, 2) + Math.pow(x2-x1, 2));
                x4 = x3 - k * (y2-y1);
                y4 = y3 + k * (x2-x1);

                if(g.o.debug){
                    g.o.context.beginPath();
                    g.o.context.strokeStyle = 'rgba(0,0,0,0.1)';
                    g.o.context.moveTo(g.o.x, g.o.y);
                    g.o.context.lineTo(x, y);
                    g.o.context.stroke();
                }

                g.o.context.lineWidth = 1;
                var s = Math.sqrt(Math.pow(Math.abs(x3-x4), 2) + Math.pow(Math.abs(y3-y4), 2));
                g.t[i].s = null;
                if(dir){
                    if(s < 45){
                        g.o.context.strokeStyle = 'rgba(0,255,0,1)';
                        g.o.context.lineWidth = 3;
                        g.t[i].s = Math.min(1, (Math.ceil((1-s/45)*10))/10);
                    }else
                        g.o.context.strokeStyle = 'rgba(0,0,255,0.2)';
                } else {
                    g.o.context.strokeStyle = 'rgba(255,0,0,0.2)';
                }

                if(g.o.debug){
                    g.o.context.beginPath();
                    g.o.context.moveTo(x3, y3);
                    g.o.context.lineTo(x4, y4);
                    g.o.context.stroke();
                }
                g.o.context.lineWidth = 1;
            }
        },
        element: {
            all: function(){
                for(var i in g.e){
                    this.stone(i);
                }
            },
            stone: function(i){
                g.o.context.save();
                g.o.context.translate(g.e[i].x, g.e[i].y);
                g.o.context.drawImage(g.o.stone, -(g.e[i].r), -(g.e[i].r), g.e[i].r*2, g.e[i].r*2);
                g.o.context.restore();
            }
        },
        frame: function(){
            g.o.context.clearRect(0, 0, 1870, 950);
            g.o.context.drawImage(g.o.background,0,0);

            g.keys.handle();

            g.o.ox = g.o.x;
            g.o.oy = g.o.y;
            g.o.x += (g.o.speed*g.o.acc*g.o.mod) * Math.cos(Math.PI/180 * g.o.angle);
            g.o.y += (g.o.speed*g.o.acc*g.o.mod) * Math.sin(Math.PI/180 * g.o.angle);
            var x1 = g.o.x;
            var y1 = g.o.y;
            for(var i in g.e){
                var x2 = g.e[i].x;
                var y2 = g.e[i].y;
                var dist = Math.sqrt(Math.pow(Math.abs(x1-x2), 2) + Math.pow(Math.abs(y1-y2), 2));
                //console.log(i + ': ' + dist)
                if(dist < (28 + g.e[i].r)){
                    g.o.x = g.o.ox;
                    g.o.y = g.o.oy;
                    g.o.acc = 0;
                }
            }
            
            g.draw.element.all();
            g.draw.tank.all();
            g.draw.tank.my();
        }
    },
    handlers: {
        keyup: function(e){
            if(e.keyCode == 87 || e.keyCode == 83){
                clearInterval(g.o.interval);
                g.o.interval = setInterval(function(){
                    if(g.o.acc<=0){
                        clearInterval(g.o.interval);
                        g.o.acc = 0;
                        g.o.mod = 0;
                        g.o.is_acc = 0;
                    } else {
                        g.o.is_acc = -1;
                        g.o.acc -= 3 * g.o.acc_step;
                    }
                }, 30);
                //g.o.acc = 0;
            }
            if(e.keyCode == 65){
                g.keys.l = false;
            }
            if(e.keyCode == 68){
                g.keys.r = false;
            }
            if(e.keyCode == 16){
                g.keys.shift = false;
            }
        },
        keypress: function(e){
            //console.log(e.keyCode)
            if(e.keyCode == 32){
                e.preventDefault();
                //var snd = new Audio("explosion.mp3");
                if(g.o.firing) return false;
                g.o.firing = 1;
                setTimeout(function(){ g.o.firing = 0; }, 2000);

                g.o.context.beginPath();
                g.o.context.strokeStyle = 'rgba(255,0,0,0.9)';
                g.o.context.moveTo(0,0);
                g.o.context.lineTo(1000,0);
                g.o.context.stroke();

                var ri = [];
                for(var k in g.t){
                    if(g.t[k].s !== null){
                        ri.push(k);
                    }
                }
                if(ri.length){
                    for(var i = ri.length - 1; i >= 0; i--){
                        if(!g.tank.hit(ri[i])){
                            g.t.splice(ri[i], 1);
                            g.tank.add();

                            setTimeout(function(){ 
                                var snd = new Audio("explosion.mp3");
                                snd.volume = 1;
                                snd.play();
                            }, 500);
                        }
                    }
                }

                var snd = new Audio("bang.mp3");
                snd.volume = 0.4;
                snd.play();
            }
            if(e.keyCode == 87){
                if(g.o.acc==0 || g.o.mod == 1){
                    clearInterval(g.o.interval);
                    g.o.interval = setInterval(function(){
                        if(g.o.acc>=1){
                            clearInterval(g.o.interval);
                            g.o.acc = 1;
                            g.o.is_acc = 0;
                        } else {
                            g.o.is_acc = 1;
                            g.o.acc += g.o.acc_step;
                        }
                    }, 30);
                    g.o.mod = 1;
                }
            }
            if(e.keyCode == 83){
                if(g.o.acc==0 || g.o.mod == -1){
                    clearInterval(g.o.interval);
                    g.o.interval = setInterval(function(){
                        if(g.o.acc>=1){
                            clearInterval(g.o.interval);
                            g.o.acc = 1;
                            g.o.is_acc = 0;
                        } else {
                            g.o.is_acc = 1;
                            g.o.acc += g.o.acc_step;
                        }
                    }, 30);
                    g.o.mod = -1;
                }
            }
            if(e.keyCode == 65){
                g.keys.l = true;
            }
            if(e.keyCode == 68){
                g.keys.r = true;
            }
            if(e.keyCode == 16){
                g.keys.shift = true;
            }
        }
    }
};

g.init();