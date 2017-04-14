/*jshint esversion: 6*/
/* global console, process, require, __dirname */

const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const yahooFinance = require('yahoo-finance');


app.use(express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

const port = process.env.PORT || 8080;
http.listen(port, () => console.log(`Node.js listening on port ${port}...`));
