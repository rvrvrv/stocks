/*jshint browser: true, esversion: 6*/
/* global $, Highcharts, io */

$(document).ready(() => {
	//Initialize socket.io and materialize.css modals
	var socket = io();
  	$('.modal').modal();


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

			//Begin theme
			colors: ["#F92672", "#66D9EF", "#A6E22E", "#A6E22E"],
			chart: {
				backgroundColor: "#212121",
				style: {
					color: "#A2A39C"
				}
			},
			subtitle: {
				style: {
					color: "#A2A39C"
				},
				align: "left"
			},
			legend: {
				align: "right",
				verticalAlign: "bottom",
				itemStyle: {
					fontWeight: "normal",
					color: "#A2A39C"
				}
			},
			xAxis: {
				gridLineDashStyle: "Dot",
				gridLineWidth: 1,
				gridLineColor: "#A2A39C",
				lineColor: "#A2A39C",
				minorGridLineColor: "#A2A39C",
				tickColor: "#A2A39C",
				tickWidth: 1
			},
			yAxis: {
				gridLineDashStyle: "Dot",
				gridLineColor: "#A2A39C",
				lineColor: "#A2A39C",
				minorGridLineColor: "#A2A39C",
				tickColor: "#A2A39C",
				tickWidth: 1,
				labels: {
					formatter: function () {
						return (this.value > 0 ? ' + ' : '') + this.value + '%';
					}
				},
			},
			//End theme

			rangeSelector: {
				selected: 4
			},

			plotLines: [{
				value: 0,
				width: 2,
				color: 'silver'
            }],

			plotOptions: {
				series: {
					compare: 'percent',
					showInNavigator: true
				}
			},

			tooltip: {
				backgroundColor: '(255,255,255, 0.9)',
				pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
				valueDecimals: 2,
				split: true,
				xDateFormat: '%a, %B %e'
			},

			series: seriesOptions
		});
	}

	$.each(stocks, (i, stock) => {

		$.getJSON(`http://localhost:8080/test/${stock}`, (data) => {

			seriesOptions[i] = {
				name: stock,
				data: data
			};

			// Counter keeps track of when all async data has loaded
			seriesCounter += 1;
			if (seriesCounter === stocks.length) createChart();
		});
	});

	//Remove stock from the list and chart
	function removeStock(stock) {
		//Remove stock & its modal 
		$(`#${stock}`).remove();
		setTimeout(() => $(`#del${stock}`).remove(), 0);
		//TO DO: Update the chart
		
	}
	
	//Handle 'delete stock' confirmation
	$('.del-btn').click(function() {
		removeStock($(this).attr('data-stock'));
		socket.emit('deleteStock', $(this).attr('data-stock'));
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
