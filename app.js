/*jshint esversion: 6*/
/* global console, process, require, __dirname */

const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const yahooFinance = require('yahoo-finance');
const moment = require('moment');


app.use(express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

//Initial stocks to load
let stocks = ['AAPL', 'GOOG', 'MSFT'];

//Sockets.io 
io.on('connection', socket => {
	console.log('A user connected');
	
	//Send current stock list and data to user
	socket.emit('newClientConnect', { stocks: stocks });

	
	//Delete stock
	socket.on('deleteStock', stock => {
		//Find stock to be deleted in list
		let stockIndex = stocks.findIndex(e => e === stock);
		console.log(stockIndex);
		//Remove stock from the list
		stocks.splice(stockIndex, 1);
		//Update all other users with deleted stock
		socket.broadcast.emit('deleted', stock);
		//io.sockets.emit('updateStocks', {stocks});
		console.log(stocks);
	});
});
	

app.get('/test/:stock', (req, res) => {
	yahooFinance.historical({
		symbol: req.params.stock,
		from: '2016-01-01',
		to: moment().format('YYYY-MM-DD'), //Today's date
		period: 'd'
	}).then(quotes => {
		let data = [];
		//Format quotes and add to data array
		for (let i = 0; i < quotes.length; i++) {
			data.push([moment(quotes[i].date).utc().valueOf(), quotes[i].close]);
		}
		res.json(data);
	});
});

const port = process.env.PORT || 8080;
http.listen(port, () => console.log(`Node.js listening on port ${port}...`));
