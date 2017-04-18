/*jshint browser: true, esversion: 6*/
/* global $, console, Highcharts, io */

$(document).ready(() => {
	//Initialize materialize modals and declare global vars
	$('.modal').modal();
	var socket = io();
	var stocks = [];


	/**
	 * Create the chart when all data is loaded
	 * @returns {undefined}
	 */
	function createChart() {

		Highcharts.stockChart('chart', chartConfig);
	}


	//Remove stock from the list and chart
	function removeStock(stock) {
		//Remove stock & its modal 
		$(`#${stock}`).remove();
		setTimeout(() => $(`#del${stock}`).remove(), 0);
		//TO DO: Update the chart
	}

	//Handle 'delete stock' confirmation
	$('.del-btn').click(function () {
		removeStock($(this).attr('data-stock'));
		socket.emit('deleteStock', $(this).attr('data-stock'));
	});

	//Handle when another user deletes a stock
	socket.on('deleted', stock => removeStock(stock));


	//On initial connection, load all stock data from server
	socket.on('newClientConnect', data => {
		console.log(data);
		stocks = data.stocks;
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
	});
});


//Chart config
var seriesOptions = [],
	seriesCounter = 0,
	chartConfig = {

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
	};
