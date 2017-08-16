var g = {
    o: {
        ll: {},
        map_x: 1870,
        map_y: 910,
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
    tm: {},
    t: [],
    tank: {
        add: function(tid, d){
            if(typeof d !== 'undefined'){
                g.t.push({
                    x: d[0],
                    y: d[1],
                    a: d[2],
                    ta: d[3],
                    h: d[4],
                    s: null
                });
                g.tm[tid] = g.t.length-1;
            } else {
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
            }
        },
        remove: function(tid){
            g.t.splice(g.tm[tid], 1);
        },
        hit: function(index){
            var t = g.t[index];
            t.h = t.h - (t.s === null ? 0 : t.s);
            return Math.max(0, t.h);
        }
    },
    sound: {
        playing_stone_crash: 0
    },
    e: {
        stone: [
            {x: 400, y: 400, r: 50},
            {x: 500, y: 400, r: 50},
            {x: 660, y: 400, r: 80},
            {x: 400, y: 500, r: 120}
        ],
        tree: [
            {x: 900, y: 280, r: 150},
            {x: 700, y: 660, r: 90},
            {x: 1300, y: 300, r: 130},
            {x: 1190, y: 620, r: 110},
            {x: 1470, y: 780, r: 140},
        ]
    },
    init: function(){
        g.o.canvas = document.getElementById("canvas");
        g.o.canvas.setAttribute("width", g.o.map_x);
        g.o.canvas.setAttribute("height", g.o.map_y);
        g.o.context = g.o.canvas.getContext("2d");
        g.o.tank = new Image();
        g.o.tank.src="img/tank_body.png";
        g.o.turret = new Image();
        g.o.turret.src="img/tank_turret.png";
        g.o.background = new Image();
        g.o.background.src = "img/desert.jpg";
        g.o.background.onload = function(){
            g.o.context.drawImage(g.o.background,0,0);
        }
        g.o.stone = new Image();
        g.o.stone.src="img/stone.png";
        g.o.explosion = new Image();
        g.o.explosion.src="img/explosion.png";
        g.o.tree = new Image();
        g.o.tree.src="img/tree1.png";

        window.addEventListener("keydown", g.handlers.keypress, false);
        window.addEventListener("keyup", g.handlers.keyup, false);

        //for(var i = 0; i<10; i++) g.tank.add();

        g.o.ll = {
            x: g.o.x,
            y: g.o.y,
            a: g.o.angle,
            ta: g.o.turret_angle,
            h: g.o.health
        };

        g.o.move = setInterval(function(){
            g.draw.frame();
        }, 33);
        // window.requestAnimationFrame(function(){
        //     g.draw.frame();
        // });
    },
    keys:{
        f: false,
        b: false,
        l: false,
        r: false,
        tl: false,
        tr: false,
        shift: false,
        fire: false,
        nitro: false,
        handle: function(){
            if(!this.shift && this.l){
                g.o.angle -= g.o.rotation;
                if(g.o.angle < 0) g.o.angle = 360 - g.o.angle;
            }
            if(!this.shift && this.r){
                g.o.angle += g.o.rotation;
                g.o.angle %= 360;
            }
            if(this.shift && this.l || this.tl){
                g.o.turret_angle -= g.o.turret_rotation;
            }
            if(this.shift && this.r || this.tr){
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
                if(h > 0.7) g.o.context.strokeStyle = 'rgba(0,255,0,0.4)';
                else if(h > 0.4) g.o.context.strokeStyle = 'rgba(244, 217, 66,0.7)';
                else g.o.context.strokeStyle = 'rgba(255,0,0, 0.9)';
                g.o.context.lineWidth = 14;
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
            all: function(top){
                for(var j in g.e){
                    if(typeof top === 'undefined' || (typeof top !== 'undefined' && top && ['tree'].indexOf(j)!==-1) || (typeof top !== 'undefined' && !top && ['tree'].indexOf(j)===-1)){
                        for(var i in g.e[j]){
                            this.one(j, g.e[j][i]);
                        }
                    }
                }
            },
            one: function(cat, obj){
                g.o.context.save();
                if(cat == 'tree') g.o.context.globalAlpha = 0.75;
                g.o.context.translate(obj.x, obj.y);
                g.o.context.drawImage(g.o[cat], -(obj.r), -(obj.r), obj.r*2, obj.r*2);
                if(cat == 'tree') g.o.context.globalAlpha = 1;
                g.o.context.restore();
            }
        },
        frame: function(){
            g.o.context.clearRect(0, 0, g.o.map_x, g.o.map_y);
            g.o.context.drawImage(g.o.background,0,0);

            g.keys.handle();

            g.o.ox = g.o.x;
            g.o.oy = g.o.y;
            g.o.x += (g.o.speed*(g.keys.nitro ? 2 : 1)*g.o.acc*g.o.mod) * Math.cos(Math.PI/180 * g.o.angle);
            g.o.y += (g.o.speed*g.o.acc*g.o.mod) * Math.sin(Math.PI/180 * g.o.angle);

            if (g.o.x >= g.o.map_x) {
                g.o.x = g.o.map_x;
            } else if (g.o.x <= 0) {
                g.o.x = 0;
            }
            if (g.o.y >= g.o.map_y) {
                g.o.y = g.o.map_y;
            } else if (g.o.y <= 0) {
                g.o.y = 0;
            }

            var x1 = g.o.x;
            var y1 = g.o.y;
            for(var i in g.e.stone){
                var x2 = g.e.stone[i].x;
                var y2 = g.e.stone[i].y;
                var dist = Math.sqrt(Math.pow(Math.abs(x1-x2), 2) + Math.pow(Math.abs(y1-y2), 2));
                //console.log(i + ': ' + dist)
                if(dist < (45 + 0.55*g.e.stone[i].r)){
                    g.o.x = g.o.ox;
                    g.o.y = g.o.oy;
                    g.o.acc = 0;
                    if(!g.sound.playing_stone_crash){
                        var snd = new Audio("sound/stone_crash.mp3");
                        snd.volume = 0.2;
                        snd.play();
                        setTimeout(function(){ g.sound.playing_stone_crash = 0; }, 1000);
                    }
                    g.sound.playing_stone_crash = 1;
                }
            }

            g.s.cf = 0;
            //if(g.s.cf++ >= 1) g.s.cf = 0;
            if(!g.s.cf && (g.o.x != g.o.ll.x || g.o.y != g.o.ll.y || g.o.angle != g.o.ll.a || g.o.turret_angle != g.o.ll.ta)){
                // if(g.s.obj !== null)
                g.s.obj.emit('c2s', [
                    g.s.id, 'm', [
                        Math.round(g.o.x),
                        Math.round(g.o.y),
                        g.o.angle,
                        g.o.turret_angle,
                        g.o.health
                    ]
                ]);

                g.o.ll = {
                    x: g.o.x,
                    y: g.o.y,
                    a: g.o.angle,
                    ta: g.o.turret_angle,
                    h: g.o.health
                };
            }

            g.draw.element.all(0);
            g.draw.tank.all();
            g.draw.tank.my();
            g.draw.element.all(1);
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
            if(e.keyCode == 37){
                g.keys.tl = false;
            }
            if(e.keyCode == 39){
                g.keys.tr = false;
            }
            if(e.keyCode == 16){
                g.keys.shift = false;
            }
            if(e.keyCode == 48){
                g.keys.nitro = false;
            }
        },
        keypress: function(e){
            //console.log(e.keyCode)
            if(e.keyCode == 32){
                e.preventDefault();
                //var snd = new Audio("sound/explosion.mp3");
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
                        var hitko = g.tank.hit(ri[i]);
                        if(!hitko){
                            //g.t.splice(ri[i], 1);
                            //g.tank.add();
                            var tid = null;
                            for(var ij in g.tm) if(g.tm[ij]==ri[i]) tid = ij;
                            g.s.obj.emit('c2s', [tid, 'tr', []]);
                            g.tank.remove(tid);

                            g.s.obj.emit('c2s', [g.s.id, 'explosion', []]);
                            setTimeout(function(){
                                var snd = new Audio("sound/explosion.mp3");
                                snd.volume = 1;
                                snd.play();
                            }, 500);
                        } else {
                            var tid = null;
                            for(var ij in g.tm) if(g.tm[ij]==ri[i]) tid = ij;
                            g.s.obj.emit('c2s', [g.s.id, 'hit', [tid, hitko]]);

                            setTimeout(function(){
                                var snd = new Audio("sound/fire_impact"+Math.ceil(Math.random()*2)+".mp3");
                                snd.volume = 0.6;
                                snd.play();
                            }, 200);
                        }
                    }
                }

                g.s.obj.emit('c2s', [g.s.id, 'bang', []]);

                var snd = new Audio("sound/bang.mp3");
                snd.volume = 1;
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
            if(e.keyCode == 37){
                g.keys.tl = true;
            }
            if(e.keyCode == 39){
                g.keys.tr = true;
            }
            if(e.keyCode == 48){
                g.keys.nitro = true;
            }
        }
    }
};

g.init();