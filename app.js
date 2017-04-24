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
let stockData = {
	AAPL: [],
	GOOG: [],
	MSFT: []
};

updateAllStocks();
//Also, update all stock data every 24 hours
setTimeout(() => updateAllStocks, 86400000); 

//Retrieve data for all stocks in collection
function updateAllStocks() {
	for (let stock in stockData) {
		getStockData(stock);
	}
}

//Get stock data from Yahoo! Finance
function getStockData(stock, user) {
	yahooFinance.historical({
		symbol: stock,
		from: '2000-01-01',
		to: moment().format('YYYY-MM-DD'), //Today's date
		period: 'd'
	}).then(quotes => {
		//First, ensure data exists
		if (!quotes.length && user) {
			//If no data, alert the user
			return io.to(user).emit('added', {});
		}
		//If data exists, format quotes and add to stockData object
		stockData[stock] = [];
		for (let i = 0; i < quotes.length; i++) {
			stockData[stock].push([moment(quotes[i].date).utc().valueOf(), quotes[i].close]);
		}
		//If user added the stock, send update via sockets.io
		if (user) {
			let addedStockData = {};
			addedStockData[stock] = stockData[stock];
			io.sockets.emit('added', {
				addedStockData
			});
		}
	});
}

/*******************************
BEGIN socket.io operations
*******************************/

io.on('connection', socket => {

	//Send full stock list and data to new user
	socket.emit('newClientConnect', {
		stockData
	});

	//Delete stock
	socket.on('deleteStock', stock => {
		//Delete stock and its data from master list
		delete stockData[stock];
		//Update all users with deleted stock
		io.sockets.emit('deleted', stock);
		console.log(Object.keys(stockData));
	});

	//Add stock
	socket.on('addStock', stock => {
		getStockData(stock, socket.id);
	});
});

/*******************************
END socket.io operations
*******************************/

const port = process.env.PORT || 8080;
http.listen(port, () => console.log(`Node.js listening on port ${port}...`));
