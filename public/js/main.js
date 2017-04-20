/*jshint browser: true, esversion: 6*/
/* global $, console, Highcharts, io */

$(document).ready(() => {

	var socket = io();
	var stockData = {};



	/**
	 * Create the chart when all data is loaded
	 * @returns {undefined}
	 */
	function createChart() {
		Highcharts.stockChart('chart', chartConfig);
	}

	//Generate materialize card and modal for stocks
	function generateHTML(stock) {
		//HTML for modal
		$('.modals').append(`
			<div id="del${stock}" class="modal">
				<div class="modal-content">
					<h4>Delete ${stock}</h4>
					<p>Are you sure you want to remove ${stock}?</p>
				</div>
				<div class="modal-footer">
					<a class="modal-action modal-close waves-effect waves-green btn-flat">No</a>
					<a class="modal-action modal-close waves-effect waves-red btn-flat del-btn" data-stock="${stock}">Yes</a>
				</div>
			</div>`);
		$('.modal').modal();

		//HTML for card
		$('.stock-cards').append(`
			<div class="col s6 m4" id="${stock}">
				<div class="card grey darken-4 z-depth-3">
					<div class="card-content white-text">
						<span class="card-title b">${stock}</span>
						<a class="btn-floating waves-effect tooltipped indigo darken-3" data-position="bottom" data-delay="100" data-tooltip="Learn about ${stock}" href="https://www.google.com/finance?q=${stock}" target="_blank"><i class="large material-icons">info</i></a>
						<a class="btn-floating modal-trigger waves-effect tooltipped red darken-4" data-position="bottom" data-delay="100" data-tooltip="Remove ${stock}" href="#del${stock}"><i class="large material-icons">delete</i></a>
					</div>
				</div>
			</div>`);
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


	//On initial connection, load and format stock data from server
	socket.on('newClientConnect', data => {
		stockData = data.stockData;
		console.log(stockData);
		//Iterate through all stocks
		let i = 0;
		for (let stock in stockData) {
			seriesOptions[i] = {
				name: stock,
				data: stockData[stock]
			};
			generateHTML(stock);
			i++;
		}
		//Draw the chart
		createChart();
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
