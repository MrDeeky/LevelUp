// Code for setting up sockets, sending chat messages, and switching rooms was adapted from https://github.com/mmukhin/psitsmike_example_2
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var urlParser = bodyParser.urlencoded({extended: false});
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

server.listen(3000);
var rooms = [];
var roomToGame = {};


mongoose.connect('mongodb://csc309:csc309@ds111178.mlab.com:11178/csc309_project');

var userSchema = new mongoose.Schema({
	name: {type: String, trim: true},
	username: {type: String, trim: true, unique: true},
	password: {type: String, trim: true},
	email: {type: String, trim: true, unique: true}
});

var user = mongoose.model('user', userSchema);

app.get('/', function(req, res){
	res.sendFile(__dirname + "/index.html");
});

app.get('/main', function(req, res){
	res.sendFile(__dirname + '/js/main.js');
});

app.get('/route', function(req, res){
	res.sendFile(__dirname + '/lib/angular-route.js');
});

app.get('/min', function(req, res){
	res.sendFile(__dirname + '/lib/angular.min.js');
});

app.get('/login', function(req, res){
	res.sendFile(__dirname + '/login.html');
});

app.get('/signup', function(req, res){
	res.sendFile(__dirname + '/signup.html');
});

app.post('/login', urlParser, function(req, res){
	user.find({username: req.body.username, password: req.body.password}, function(err, data){
		if(data.length == 0) {
			res.redirect('/login');
			console.log("login failed: username not found or password incorrect");
		} else {
			res.redirect('/login');
			console.log("login success");
		}
	});
});

app.post('/signup', urlParser, function(req, res){
	user.find({username: req.body.username}, function(err, data){
		if(data.length == 0) {
			user.find({email: req.body.email}, function(err, data){
				if(data.length == 0) {
					var newUser = user(req.body).save(function(err, data){
						if(err) throw err;
						res.redirect('/signup');
						console.log("signup success");
					});
				} else {
					res.redirect('/signup');
					console.log("signup failed: email in use");
				}
			});
		} else {
			res.redirect('/signup');
			console.log("signup failed: username in use");
		}
	});
});

app.get("/groups", function (req, res) {
    res.sendFile(__dirname + "/Groups.html");
});

app.get('/chatRoom', function (req, res) {
  	res.sendFile(__dirname + '/MultiRoomChat.html');
});


app.post('/makeVisible', function (req, res) {
	//rooms.push(req.body.roomName);
	io.sockets.emit('makeVisible');
	res.end("yes");
});

app.post('/makeInVisible', function (req, res) {
	//rooms.push(req.body.roomName);
	io.sockets.emit('makeInVisible');
	res.end("yes");
});

app.post('/addRoom', function (req, res) {
	rooms.push(req.body.roomName);
	roomToGame[req.body.roomName] = req.body.gameRoomName;
	io.sockets.emit('addroom', req.body.roomName, req.body.roomDescription, req.body.gameRoomName);
	res.end("yes");
});

var usernames = {};


io.sockets.on('connection', function (socket) {	
	socket.on('adduser', function(username){
		socket.username = username;
		usernames[username] = username;
	});

	socket.on('sendchat', function (data) {
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});
	
	socket.on('switchRoom', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom, roomToGame);
	});
	
	socket.on('disconnect', function(){
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});

//app.listen(3000);
console.log("listening to port 3000");