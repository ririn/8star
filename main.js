enchant();
enemies = new Array();
shots = new Array();

level = 1;
v = 0.15 * level;
encount = 55;
reload = 25;
enemystop = 55;
charamax = level + 1;
encountnum = level * 0.1 + 0.5;
t = new Sprite(16, 16);

bkimg = new Array('bk01.jpg', 'bk02.jpg', 'bk03.jpg', 'bk04.jpg', 'bk05.jpg');
bkcolor = new Array('#FFCC66', '#DDDDDD', '#D3EDFB', '#CCFF66', '#EEEEEE');

STARTLINE = 20;
DEADLINE = 215;
EXPPARTS = 5;

px = 160;
py = 264;
beforeShot = null;
beforeEnemy = null;
sc = 0;
combo = 0;
maxcombo = 0;
kill = 0;
favor = 0;
maxfavor = 0;
combofavor = 10;
combomaxfavor = 30;

scorebk = null;

Enemy = Class.create(Sprite, {
    initialize: function(x, y, p) {
        Sprite.call(this, 64, 64);
        this.x = x;
        this.y = y;
        this.image = game.assets['8chara64.png'];
        this.frame = p;
        this.stop = 0;
        this.dx = 0;
        this.dy = 0;
        stage.insertBefore(this, beforeEnemy);
        beforeEnemy = this;
        enemies.push(this);
    },
    onenterframe: function() {
        if (this.stop <= 0) {
            this.opacity = 1;
            var lv = v;
            //0,1,5,6,7
            if (this.frame <= 1 || this.frame == 5 || this.frame == 6 || this.frame == 7) {
                h = Math.atan2(py - this.y, px - this.x);

                if (this.frame == 0 || this.frame == 5) {
                    lv = v * 0.6;
                }else if (this.frame == 7) {
                    lv = v * 0.5;
                } else {
                    lv = v * 1.2;
                }
                this.x += Math.cos(h) * lv;
                this.y += Math.sin(h) * lv;
                if (this.frame == 6) {
                    if (this.age % 30 == 0) {
                        this.x += Math.random() * 96 - Math.random() * 96;
                    }
                }
            }
            //2
            if (this.frame == 2) {
                this.y += lv * 0.5;
            }
            //3
            if (this.frame == 3) {
                h = Math.atan2(py - this.y, px - this.x);
                this.x += Math.sin(this.age * 0.01) * lv;
                this.y += Math.sin(h) * lv;
            }
            //4
            if (this.frame == 4) {
                if (this.age < 20 + level * 2) {
                    this.y += this.age * 0.1;
                } else {
                    this.y += lv;
                }
            }
            //共通
            if (this.x < 160 && this.scaleX > 0) {
                this.scaleX *= -1;
            }
            if (this.y > DEADLINE) {
                this.scaleX = this.scaleY = 2;
                var msg = 'You make ' + kill + ' girls to ' + sc + ' pieces of flowers.';
                game.end(sc, msg);
            }

        } else {
            //7だけ後退しない
            if (this.frame != 7) {
                this.x += this.dx;
                this.dx *= 0.9;
                this.y += this.dy;
                this.dy *= 0.9;
                this.stop--;
            } else {
                this.stop -= 2;
            }
            this.opacity = 0.8;
        }
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > 320 - 64) {
            this.x = 320 - 64;
        }
        if (this.y < STARTLINE) {
            this.y = STARTLINE;
        }
        for (i = 0; i < enemies.length; i++) {
            if (enemies.indexOf(this) != i) {
                if (this.within(enemies[i], 32)) {
                    h = Math.atan2(enemies[i].y - this.y, enemies[i].x - this.x);
                    this.x -= Math.cos(h) * 1;
                    this.y -= Math.sin(h) * 1;
                }
            }
        }

    }
});

Shot = Class.create(Sprite, {
    initialize: function(x, y, p, f, c, combonum) {
        Sprite.call(this, 16, 16);
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
        this.image = game.assets['stars.png'];
        if (p == -1) {
            this.frame = 0;
            this.status = -1;
        } else {
            this.frame = p;
            this.status = 0;
        }
        this.f = f;
        this.c = c;
        this.combonum = combonum;
        stage.insertBefore(this, beforeShot);
        beforeShot = this;
        shots.push(this);
    },
    onenterframe: function() {
        if (shots.indexOf(this) < 0) {
            shots.push(this);
        }
        if (this.status == -1) {
            this.frame = this.age % charamax;
        }
        if (this.f == 1) {
            this.x += this.dx;
            this.y += this.dy;
            this.rotate(this.age % 10 * 60);
            if (this.y > py) {
                if (this.dy > 0) {
                    this.dy *= -1;
                    if (maxfavor > 0) {
                        this.status = -1;
                    }
                }
            }
            if (this.x < 0 || this.x > 320 || this.y < STARTLINE || this.y > 320) {
                del = shots.indexOf(this);
                shots.splice(del, 1);
                stage.removeChild(this);

            }
        } else if (this.f == 0) {
            this.scaleX = 1.8;
            this.scaleY = 1.8;
            if (this.y == py) {
                this.x += 32 / reload;
                if (this.x > 320 - 32) {
                    this.y += 32;
                }
            } else if (this.y == py + 32) {
                this.x -= 32 / reload;
                if (this.x < 0) {
                    this.y += 32;
                }
            } else if (this.y > py + 64) {
                stage.removeChild(this);
            }
        }
        for (var i = 0; i < enemies.length; i++) {
            if (this.within(enemies[i], 24)) {
                if (enemies[i].frame == this.frame || this.status == -1) {
                    kill++;
                    stage.removeChild(enemies[i]);
                    enemies.splice(i, 1);
                    for (var j = 0; j < EXPPARTS; j++) {
                        var exp = new ExpPart(this.x, this.y, this.frame);
                    }
                    for (j = 0; j < 10; j++) {
                        var shot = new Shot(this.x, this.y, this.frame, 1, 1, this.combonum + 1);
                        shot.dx = Math.random() * 8 - Math.random() * 8;
                        shot.dy = Math.random() * 8 - Math.random() * 8;
                    }
                    combo++;
                    sc += 10 * combo * level * this.combonum;
                    if (maxcombo < combo) {
                        maxcombo = combo;
                    }
                    if (combo % combofavor == 0) {
                        favor = 20 * combo / 10 / level;
                    }
                    if (combo % combomaxfavor == 0) {
                        maxfavor = 60 * combo / 10 / level;
                    }
                    if (combo >= 2) {
                        var combopopup = new Label(combo + "combos");
                        combopopup.x = this.x;
                        combopopup.y = this.y;
                        if (combo % combofavor == 0) {
                            combopopup.color = "red";
                        } else {
                            combopopup.color = "#2D4B2D";
                        }
                        combopopup.originX += this.width / 2;
                        combopopup.originY += this.height / 2;
                        combopopup.on('enterframe', function() {
                            this.opacity *= 0.95;
                            this.scaleX *= 1.05;
                            this.scaleY *= 1.05;
                            if (this.age > 30) {
                                stage.removeChild(this);
                            }
                        });
                        stage.addChild(combopopup);
                    }
                    score.text = "" + sc;
                    del = shots.indexOf(this);
                    shots.splice(del, 1);
                    stage.removeChild(this);
                } else {
                    if (this.c == 0) {
                        combo = 0;
                    }
                    enemies[i].stop = enemystop;
                    enemies[i].dx = this.dx / 2;
                    enemies[i].dy = this.dy / 2;
                    del = shots.indexOf(this);
                    shots.splice(del, 1);
                    stage.removeChild(this);
                }
            }
        }
    }
});

ExpPart = Class.create(Sprite, {
    initialize: function(x, y, p) {
        Sprite.call(this, 32, 32);
        this.x = x + Math.random() * 8 - Math.random() * 8;
        this.y = y + Math.random() * 8 - Math.random() * 8;
        this.image = game.assets['exp32.png'];
        this.bx = x;
        this.by = y;
        this.frame = p;
        stage.addChild(this);
        this.agemax = 30;
    },
    onenterframe: function(e) {
        h = Math.atan2(this.by - this.y, this.bx - this.x);
        this.x += Math.cos(h) * -v;
        this.y += Math.sin(h) * -v;
        this.rotate(this.age % 5 * 30);
        this.scaleX = Math.sin(this.age * 0.1);
        this.scaleY = Math.sin(this.age * 0.1);
        if (this.age > this.agemax) {
            stage.removeChild(this);
        }
    }
});

window.onload = function() {
    game = new Game(320, 320);
    game.preload('stars.png', '8chara64.png', 'exp32.png', 'point_background.png', 'bk01.jpg', 'bk02.jpg', 'bk03.jpg', 'bk04.jpg', 'bk05.jpg');
    game.onload = function() {
        bkno = parseInt(Math.random() * 5);

        stage = new Group();
        game.rootScene.addChild(stage);
        game.rootScene.backgroundColor = bkcolor[bkno];

        score = new Label();
        score.text = "0";
        score.x = 50;
        score.y = 3;
        score.width = 120;
        score.textAlign = 'right';

        lv = new Label();
        lv.text = '1';
        lv.x = 275;
        lv.y = 3;
        lv.width = 30;
        lv.textAlign = 'right';

        scorebk = new Sprite(320, 20);
        scorebk.x = 0;
        scorebk.y = 0;
        scorebk.image = game.assets['point_background.png'];
        stage.addChild(scorebk);

        stage.addChild(t);

        stage.addChild(score);
        stage.addChild(lv);

        var bk = new Sprite(320, 244);
        bk.x = 0;
        bk.y = 20;
        bk.image = game.assets[bkimg[bkno]];
        stage.addChild(bk);
        game.rootScene.on('touchstart', function(e) {
            t.x = e.x;
            t.y = e.y;
            for (var i = 0, s = shots.length; i < s; i++) {
                if (t.within(shots[i], 24)) {
                    shots[i].tsx = e.x;
                    shots[i].tsy = e.y;
                    shots[i].f = 2;
                    shots[i].scaleX = 2.5;
                    shots[i].scaleY = 2.5;
                    shots[i].opacity = 0.5;
                }
            }
        });
        game.rootScene.on('touchmove', function(e) {
            t.x = e.x;
            t.y = e.y;
            for (var i = 0, s = shots.length; i < s; i++) {
                if (t.within(shots[i], 24)) {
                    shots[i].tsx = e.x;
                    shots[i].tsy = e.y;
                    shots[i].f = 2;
                    shots[i].scaleX = 2.5;
                    shots[i].scaleY = 2.5;
                    shots[i].opacity = 0.5;
                }
            }
        });
        game.rootScene.on('touchend', function(e) {
            for (var i = 0; i < shots.length; i++) {
                if (shots[i].f == 2) {
                    shots[i].f = 1;
                    shots[i].scaleX = 1;
                    shots[i].scaleY = 1;
                    shots[i].opacity = 1;
                    shots[i].dx = (e.x - shots[i].tsx) / 10;
                    shots[i].dy = (e.y - shots[i].tsy) / 10;
                }
            }
        });

        game.rootScene.on('enterframe', function() {
            if (game.frame % encount == 0) {
                for (var i = 0; i < encountnum; i++) {
                    var enemy = new Enemy(Math.random() * 320 - 64, STARTLINE, parseInt(Math.random() * charamax));
                }
            }
            if (game.frame % reload == 0) {
                if (favor > 0) {
                    var shot = new Shot(0, py, -1, 0, 0, 1);
                    favor -= reload;
                } else if (maxfavor > 0) {
                    var shot = new Shot(0, py, parseInt(Math.random() * charamax), 0, 2, 1);
                    maxfavor -= reload;
                } else {
                    var shot = new Shot(0, py, parseInt(Math.random() * charamax), 0, 0, 1);
                }
            }
            if (game.frame % 1200 == 0) {
                level++;
                lv.text = '' + level;
                if (level < 8) {
                    v = level * 0.15;
                    encount = 60 - level * 5;
                    if (encount < 30) {
                        encount = 30;
                    }
                    reload = 30 - level * 5;
                    if (reload < 15) {
                        reload = 15;
                    }
                    enemystop = 60 - level * 5;
                    encountnum = level * 0.1 + 1;
                }
                charamax = level + 1;
            }
        });

    };
    game.start();
}