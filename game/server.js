var express = require('express');
var app = express();
var http = require('http').Server(app);

app.use(express.static('public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/player', function(req, res){
    res.sendFile(__dirname + '/public/player.obj');
});

app.get('/boss', function(req, res){
    res.sendFile(__dirname + '/public/boss.obj');
});

app.get('/invader1', function(req, res){
    res.sendFile(__dirname + '/public/invader1.obj');
});

app.get('/invader2', function(req, res){
    res.sendFile(__dirname + '/public/invader2.obj');
});

app.get('/invader3', function(req, res){
    res.sendFile(__dirname + '/public/invader3.obj');
});

app.get('/cubo', function(req, res){
    res.sendFile(__dirname + '/public/cubo.obj');
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});


module.exports = function parseOBJ(file){

    var fs = require('fs');

    var contents = fs.readFileSync(file, 'utf8');
    return contents.split('\n');

};

