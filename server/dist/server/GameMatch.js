"use strict";
const PetRules = require("../shared/PetRules");
const MatchRules_1 = require("../shared/MatchRules");
class MatchPlayer {
    constructor(user, type) {
        this.isLinkLost = false;
        //matching variables
        this.matchStartTime = Date.now(); //开始匹配的时间
        this.matchExp = 0; //匹配经验
        this.currentStatusStartTime = Date.now();
        this.lastUpdateTime = Date.now();
        this.gameScore = 0;
        this.gameLeftTime = 0;
        this.user = user;
        this.type = type;
    }
    prepareGameStartObject() {
        if (this.gameStartObject)
            return;
        let pets = [];
        let usedColors = {};
        let currentPet = this.user.dbuser.currentPet | 0;
        let pet = this.user.dbuser.pets[currentPet];
        pets.push(currentPet);
        usedColors[PetRules.PET_REAL_COLORS[currentPet]] = true;
        while (pets.length < 5) {
            let idx = (Math.random() * PetRules.MAX_PET_COUNT) | 0;
            if (pets.indexOf(idx) < 0 && !usedColors[PetRules.PET_REAL_COLORS[idx]]) {
                pets.push(idx);
                usedColors[PetRules.PET_REAL_COLORS[idx]] = true;
            }
        }
        this.gameStartObject = {
            id: Date.now() + '' + Math.random(),
            time: Date.now(),
            totalTime: 60,
            skillLevel: pet ? (pet.skillLv | 0) : 0,
            pets: pets,
            items: [],
            scoreExtraRate: 0,
            isMatch: true,
            matchType: this.type
        };
    }
}
exports.MatchPlayer = MatchPlayer;
class MatchGame {
    constructor(players, type) {
        this.closed = false;
        this.players = players.slice();
        this.type = type;
    }
    getOthers(p) {
        return this.players.filter(pp => {
            if (pp === p || pp.user === p)
                return false;
            return true;
        });
    }
    getOther(p) {
        if (p === this.players[0] || p === this.players[0].user)
            return this.players[1];
        return this.players[0];
    }
    getMatchPlayer(p) {
        return p.matchPlayer;
    }
    //开始比赛啦
    //函数调用完成后，所有玩家都是loading状态啦
    startMatch() {
        let now = Date.now();
        for (let p of this.players) {
            p.status = 'loading';
            p.lastUpdateTime = now;
            p.currentStatusStartTime = now;
            p.prepareGameStartObject();
        }
        for (let p of this.players) {
            this.sendPlayerInfo(p);
            this.sendStatusToOther(p);
            p.user.socket.sendPacket({
                cmd: 'match_start',
                gameStartObject: p.gameStartObject,
                type: this.type
            });
        }
    }
    setReady(user) {
        let player = this.getMatchPlayer(user);
        //let other = this.getOther(player);
        if (player.status === 'loading') {
            player.status = 'ready';
            player.lastUpdateTime = Date.now();
            player.currentStatusStartTime = Date.now();
            if (this.players.every(p => p.status === 'ready' || p.isLinkLost)) {
                this.startPlaying();
            }
            else {
                this.sendStatusToOther(player);
            }
        }
    }
    startPlaying() {
        for (let p of this.players) {
            if (!p.isLinkLost) {
                p.status = 'playing';
                p.lastUpdateTime = Date.now();
                p.currentStatusStartTime = Date.now();
                p.user.socket.sendPacket({
                    cmd: 'match_go'
                });
            }
        }
    }
    setGameScore(user, obj) {
        let player = this.getMatchPlayer(user);
        if (player.status === 'playing') {
            player.lastUpdateTime = Date.now();
            player.gameScore = obj.gameScore | 0;
            player.gameLeftTime = obj.gameScore | 0;
            this.sendStatusToOther(player);
        }
    }
    setGameOver(user, obj) {
        let player = this.getMatchPlayer(user);
        if (player.status === 'playing') {
            player.lastUpdateTime = Date.now();
            player.status = 'gameover';
            player.currentStatusStartTime = Date.now();
            let goObject = {};
            player.user.processGameResult(obj, player.gameStartObject, goObject);
            player.user.currentGame = null;
            if (goObject.cmd === 'gameover') {
                player.gameScore = goObject.score | 0;
                player.gameLeftTime = 0;
            }
            player.gameOverObject = goObject;
            this.sendStatusToOther(player);
            //判断是不是需要结束游戏了
            //let other = this.getOther(player);
            if (this.players.every(p => p.isLinkLost || p.status === 'gameover')) {
                this.endMatch();
            }
        }
    }
    //正常结束比赛
    endMatch() {
        if (this.closed) {
            console.trace('closed and endMatch again');
            return;
        }
        var winner = null;
        var winner_score = 0;
        for (let p of this.players) {
            if (p.gameScore > winner_score) {
                winner = p;
                winner_score = p.gameScore;
            }
        }
        var sortedPlayer = this.players.slice();
        sortOnKey(sortedPlayer, 'gameScore');
        var matchPlayerResultList = [];
        for (let p of sortedPlayer) {
            let coin = 0;
            if (p === winner)
                coin = MatchRules_1.MATCH_AWARD[this.type];
            matchPlayerResultList.push({
                key: p.user.key,
                score: p.gameScore,
                coin: coin,
                nickname: p.user.dbuser.nickname,
                faceurl: p.user.dbuser.faceurl
            });
        }
        for (let p of this.players) {
            if (!p.isLinkLost) {
                if (p.gameOverObject) {
                    p.gameOverObject.isMatch = true;
                    p.gameOverObject.matchType = p.type;
                    p.gameOverObject.matchPlayerResultList = matchPlayerResultList;
                    var other = this.getOther(p);
                    if (p === winner) {
                        //给胜利的人，加钱
                        var coinToAdd = MatchRules_1.MATCH_AWARD[this.type] | 0;
                        p.user.dbuser.coin += coinToAdd;
                        p.user.socket.sendPacket({ cmd: 'update', coin: p.user.dbuser.coin });
                        p.gameOverObject.coin = coinToAdd;
                        p.gameOverObject.win = true;
                    }
                    else {
                        p.gameOverObject.coin = 0;
                    }
                    p.user.socket.sendPacket(p.gameOverObject);
                }
                p.user.matchGame = null;
                p.user.matchPlayer = null;
            }
        }
        this.close();
    }
    setLinkLost(user) {
        if (this.closed)
            return;
        let player = this.getMatchPlayer(user);
        if (!player.isLinkLost) {
            player.isLinkLost = true;
            player.user.matchGame = null;
            player.user.matchPlayer = null;
            this.sendStatusToOther(player);
            if (this.players.every(p => p.isLinkLost)) {
                this.close();
                return;
            }
            if (this.players.every(p => p.isLinkLost || p.status === 'ready')) {
                this.startPlaying();
                return;
            }
            if (this.players.every(p => p.isLinkLost || p.status === 'gameover')) {
                this.endMatch();
                return;
            }
        }
    }
    kick(p, reason) {
        if (!p.isLinkLost) {
            p.user.socket.sendPacket({
                cmd: 'cancelMatchGame',
                type: this.type,
                reason: reason,
            });
            this.setLinkLost(p.user);
        }
    }
    close() {
        for (var p of this.players) {
            if (p.user.matchGame === this)
                p.user.matchGame = null;
            if (p.user.matchPlayer === p)
                p.user.matchPlayer = null;
        }
        this.closed = true;
    }
    sendStatusToOther(p) {
        //	let other = this.getOther(p);
        //	if (other.isLinkLost) return;
        let obj = { cmd: 'match_playerStatus' };
        obj.key = p.user.key;
        obj.status = p.status;
        if (p.isLinkLost)
            obj.isLinkLost = true;
        if (p.status === 'playing' || p.status === 'gameover') {
            obj.gameScore = p.gameScore;
            obj.gameLeftTime = p.gameLeftTime;
        }
        for (var other of this.getOthers(p)) {
            if (!other.isLinkLost) {
                other.user.socket.sendPacket(obj);
            }
        }
    }
    sendPlayerInfo(p) {
        let obj = {
            cmd: 'match_player',
            key: p.user.key,
            nickname: p.user.dbuser.nickname,
            faceurl: p.user.dbuser.faceurl
        };
        for (let other of this.players) {
            if (other === p)
                continue;
            if (!other.isLinkLost) {
                other.user.socket.sendPacket(obj);
            }
        }
    }
}
exports.MatchGame = MatchGame;
//稳定的排序，总是降序的
function sortOnKey(arr, key) {
    let count = arr.length;
    let swapped = false;
    do {
        swapped = false;
        for (let i = 0; i < count - 1; ++i) {
            if (arr[i][key] < arr[i + 1][key]) {
                let tmp = arr[i];
                arr[i] = arr[i + 1];
                arr[i + 1] = tmp;
                swapped = true;
            }
        }
    } while (swapped);
}
