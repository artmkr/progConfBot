/**
 * Created by admin on 5/16/2017.
 */
var config = require('../config');
const TeleBot = require('telebot');
const bot = new TeleBot(config.telegram.token);
var mongo = require('./mongo');

var telegram = function(){
    bot.on('text', function(msg) {
        mongo.Message.create({
            userId: msg.from.id,
            username: msg.from.username,
            totalWords: msg.text.split(" ").length
            },
        function (err, item){
            if (err) console.log(err);
        });
    });


    bot.on('sticker', function(msg){
        mongo.Sticker.create({
            userId: msg.from.id,
            username: msg.from.username
        },
        function (err, item){
            if (err) console.log(err);
        });
    });

    bot.on(/^\/mss (.+)$/, function(msg){
        var username = msg.text.split(" ")[1];

        var condition = {};
        if (username)
            condition.username = username[0] == '@' ? username.substring(1, username.length) : username;

        mongo.Message.count(condition,
        function (err, count){
            if (err) {
                console.log(err);
                return;
            }
            msg.reply.text(count + " message(s) from " + username)
        });
    });

    bot.on(/(^\/mss$)/, function(msg){
        mongo.Message.count({},
            function (err, count){
                if (err) {
                    console.log(err);
                    return;
                }
                msg.reply.text(count + " total message(s)")
            });
    });

    bot.on(/(^\/sts$)/, function(msg){
        mongo.Sticker.count({},
            function (err, count){
                if (err) {
                    console.log(err);
                    return;
                }
                msg.reply.text(count + " total stickers(s)")
            });
    });

    bot.on(/^\/sts (.+)$/, function(msg){
        var username = msg.text.split(" ")[1];
        mongo.Sticker.count({
                username: username[0] == '@' ? username.substring(1, username.length) : username
            },
            function (err, count){
                if (err) {
                    console.log(err);
                    return;
                }
                msg.reply.text(count + " sticker(s) from " + username)
            });
    });

    bot.on(/^\/tw (.+)$/, function(msg){
        var username = msg.text.split(" ")[1];
        mongo.Message.find({
                username: username[0] == '@' ? username.substring(1, username.length) : username
            },
            function (err, doc){
                if (err) {
                    console.log(err);
                    return;
                }
                if (doc.length > 0){
                    var sumValues = doc.map(totalWords).reduce(sum);
                    msg.reply.text(sumValues + " total words from " + username);
                }
            });
    });

    function totalWords(item){
        return item.totalWords;
    }

    function sum(prev, next){
        return prev + next;
    }

    bot.start();
}



module.exports.Telegram = telegram;