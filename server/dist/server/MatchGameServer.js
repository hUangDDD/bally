"use strict";
///<reference path="typings/tsd.d.ts"/>
const assert = require("assert");
const GameMatch_1 = require("./GameMatch");
class MatchGameServer {
    constructor(server) {
        this._matchPlayerList_11 = [];
        this._matchPlayerList_44 = [];
        this._matchPlayerList_master = [];
        //为了方便使用上面的三个list，不要太多的switch case
        this._matchPlayerListMap = {
            "11": this._matchPlayerList_11,
            "44": this._matchPlayerList_44,
            "master": this._matchPlayerList_master
        };
        this._matchGameList = [];
        this._server = server;
        global['match'] = this;
    }
    //get matchPlayerCount() { return this._matchPlayerList_11.length; }
    get matchGameCount() { return this._matchGameList.length; }
    getMatchPlayerCount(type) {
        var list = this._matchPlayerListMap[type];
        if (list)
            return list.length;
        return 0;
    }
    onLinkLost(user) {
        if (user.matchGame) {
            user.matchGame.setLinkLost(user);
            user.matchPlayer = null;
            user.matchGame = null;
        }
        if (user.matchPlayer && !user.matchGame) {
            var list = this._matchPlayerListMap[user.matchPlayer.type];
            if (list) {
                let i = list.indexOf(user.matchPlayer);
                if (i >= 0) {
                    list.splice(i, 1);
                }
            }
            user.matchPlayer = null;
        }
    }
    enterMatch(user, type) {
        assert(!user.matchGame, '!user.matchGame');
        assert(!user.matchPlayer, '!user.matchPlayer');
        let mp = new GameMatch_1.MatchPlayer(user, type);
        user.matchPlayer = mp;
        var list = this._matchPlayerListMap[type];
        if (list) {
            list.push(mp);
        }
        else {
            assert(false, "invalid match type:" + type);
        }
    }
    leaveMatch(user) {
        if (!user.matchGame && user.matchPlayer) {
            var list = this._matchPlayerListMap[user.matchPlayer.type];
            if (list) {
                let i = list.indexOf(user.matchPlayer);
                if (i >= 0) {
                    list.splice(i, 1);
                }
            }
            else {
                assert(false, "invalid match type:" + user.matchPlayer.type);
            }
            user.matchPlayer = null;
        }
    }
    onTimer() {
        this._matchGameList = this._matchGameList.filter(m => !m.closed);
        this._makeMatch(this._matchPlayerList_11, "11");
        this._makeMatch(this._matchPlayerList_44, "44");
        this._makeMatch(this._matchPlayerList_master, "master");
    }
    _makeMatch(list, type) {
        var now = Date.now();
        var PLAYER_COUNT = 2;
        var WAIT_AT_LEAST = 2000;
        if (['44', 'master'].indexOf(type) >= 0)
            PLAYER_COUNT = 4;
        for (var i = 0; i < list.length;) {
            var arr;
            if (type === "11") {
                var p = list[i];
                var p2 = list[i + 1];
                if (p && p2 && now - p.matchStartTime >= WAIT_AT_LEAST && now - p2.matchStartTime >= WAIT_AT_LEAST)
                    arr = [p, p2];
            }
            else if (type === "44" || type === "master") {
                var p = list[i];
                var p2 = list[i + 1];
                var p3 = list[i + 2];
                var p4 = list[i + 3];
                if (p && p2 && p3 && p4) {
                    if (now - p.matchStartTime >= WAIT_AT_LEAST &&
                        now - p2.matchStartTime >= WAIT_AT_LEAST &&
                        now - p3.matchStartTime >= WAIT_AT_LEAST &&
                        now - p4.matchStartTime >= WAIT_AT_LEAST) {
                        arr = [p, p2, p3, p4];
                    }
                }
            }
            if (arr) {
                list.splice(i, arr.length);
                var g = new GameMatch_1.MatchGame(arr, type);
                for (var pp of arr)
                    pp.user.matchGame = g;
                this._matchGameList.push(g);
                g.startMatch();
            }
            else {
                ++i;
            }
        }
    }
}
exports.MatchGameServer = MatchGameServer;
