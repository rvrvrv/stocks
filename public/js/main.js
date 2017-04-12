/*jshint browser: true, esversion: 6*/
/* global io */

var socket = io();
let user;

//Attempt to set username
function setUsername() {
	socket.emit('setUsername', document.getElementById('name').value);
}

//Send message to chat room
function sendMessage() {
	let msg = document.getElementById('message').value;
	if (msg) socket.emit('msg', { message: msg, user: user });
}

//If user already exists, display error message
socket.on('userExists', data => {
	document.getElementById('error-container').innerHTML = data;
});

//When user is created, display chat box
socket.on('userSet', data => {
	user = data.username;
	document.body.innerHTML = `<input type="text" id="message">
		<button type="button" name="button" onclick="sendMessage()">Send</button>
		<div id="message-container"></div>`;
});

//When new message is sent, display it
socket.on('newMsg', data => {
	if (user) document.getElementById('message-container').innerHTML += 
		`<div><b>${data.user}</b>: ${data.message}</div>`;
});
/*
var socket = io();
socket.on('connectToRoom', data => {
	document.body.innerHTML = data;
});

socket.on('connect_failed', () => document.body.innerHTML = 'Connection error.');
localStorage.debug = 'socket.io-client:socket';
*/

/*
var socket = io('/my-namespace');
socket.on('hi', data => {
	document.body.innerHTML = data;
});
*/

/*
var socket = io();

socket.on('newClientConnect', data => {
	document.body.innerHTML = data.description;
});
*/
