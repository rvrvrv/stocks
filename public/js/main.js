/*jshint browser: true, esversion: 6*/
/* global $, io */

$(document).ready(() => {
	var socket = io();


	// Generate the chart
	var seriesOptions = [],
		seriesCounter = 0,
		stocks = ['MSFT', 'AAPL', 'GOOG'];

	/**
	 * Create the chart when all data is loaded
	 * @returns {undefined}
	 */
	function createChart() {

		Highcharts.stockChart('chart', {

			rangeSelector: {
				selected: 4
			},

			yAxis: {
				labels: {
					formatter: function () {
						return (this.value > 0 ? ' + ' : '') + this.value + '%';
					}
				},
				plotLines: [{
					value: 0,
					width: 2,
					color: 'silver'
            }]
			},

			plotOptions: {
				series: {
					compare: 'percent',
					showInNavigator: true
				}
			},

			tooltip: {
				pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
				valueDecimals: 2,
				split: true
			},

			series: seriesOptions
		});
	}

	$.each(stocks, function (i, stock) {

		$.getJSON(`http://localhost:8080/test/${stock}`, (data) => {

			seriesOptions[i] = {
				name: stock,
				data: data
			};

			// As we're loading the data asynchronously, we don't know what order it will arrive. So
			// we keep a counter and create the chart when all the data is loaded.
			seriesCounter += 1;

			if (seriesCounter === stocks.length) {
				createChart();
			}
		});
	});

});


/*
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
*/

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
