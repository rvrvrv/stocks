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

//Upon server startup, load a sample set of stocks
let stockData = {AAPL: [], GOOG: [], MSFT: []};
	
for (let stock in stockData) {
	yahooFinance.historical({
		symbol: stock,
		from: '2000-01-01',
		to: moment().format('YYYY-MM-DD'), //Today's date
		period: 'd'
	}).then(quotes => {
		//Format quotes and add to stockData object
		for (let i = 0; i < quotes.length; i++) {
			stockData[stock].push([moment(quotes[i].date).utc().valueOf(), quotes[i].close]);
		}
	});
}



//Sockets.io 
io.on('connection', socket => {
	
	//Send full stock list and data to new user
	socket.emit('newClientConnect', { stockData });

	//Delete stock
	socket.on('deleteStock', stock => {
		//Delete stock and its data from master list
		delete stockData[stock];
		//Update all other users with deleted stock
		io.sockets.emit('deleted', stock);
	});
	
	//Add stock
	socket.on('addStock', stock => {
		//Add stock and its data from master list
		//delete stockData[stock];
		//Update all users with added stock
		io.sockets.emit('added', stock);
	});
});

const port = process.env.PORT || 8080;
http.listen(port, () => console.log(`Node.js listening on port ${port}...`));
