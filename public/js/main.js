/*jshint browser: true, esversion: 6*/
/* global $, console, Highcharts, io */

$(document).ready(() => {

	var socket = io();
	var stockData = {};
	var chart;

	/**
	 * Create the chart when all data is loaded
	 * @returns {undefined}
	 */
	function createChart() {
		chart = Highcharts.stockChart('chart', chartConfig);
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
		//First, ensure stock exists on page
		if ($(`#${stock}`).length < 1) return;
		//Remove stock card, its modal, and chart data
		$(`#${stock}`).remove();
		$(`#del${stock}`).remove();
		chart.get(stock).remove();
	}

	//Add stock to the list and chart
	function addStock(stockObj) {
		//First, ensure stock data is valid
		if (!stockObj) return enableInput('No stock data found.');
		
		//Then, ensure stock isn't already on page
		let stock = Object.keys(stockObj)[0];
		if ($(`#${stock}`).length > 0) return;
		
		//Add stock card and modal
		generateHTML(stock);
		
		//Add stock data to chart
		chart.addSeries({
			name: stock,
			id: stock,
			data: stockObj[stock]
		});
		enableInput();
	}

	//Enable the input field and optionally, display an error message
	function enableInput(errorMsg) {
		$('#addStock :input').prop('disabled', false);
		if (errorMsg) Materialize.toast(errorMsg, 3500, 'red darken-4');
	}
	
	//Handle 'delete stock' confirmation
	$('.modals').on('click', '.del-btn', function () {
		let stock = $(this).attr('data-stock');
		//Remove stock from client's page
		removeStock(stock);
		/* Remove stock from list on server,
		which will also update all other clients */
		socket.emit('deleteStock', stock);
	});

	//Handle submission from 'add a stock' field
	$('#addStock').on('submit', e => {
		e.preventDefault();
		$('#addStock :input').prop('disabled', true);
		let stock = $('#stockInput').val().trim().toUpperCase();
		//Ensure input contains letters only
		if (/[^A-Z]/.test(stock) || !stock)
			return enableInput('Please enter a valid ticker symbol');
		//Ensure stock isn't already on page
		if ($(`#${stock}`).length > 0)
			return enableInput(`${stock} is already on the chart.<br> Please enter a new ticker symbol.`);
		//If the ticker symbol is valid, try to add it on the server
		socket.emit('addStock', stock);
	});


	
	
	/*******************************
	BEGIN socket.io operations
	*******************************/

	//Handle when a user deletes a stock
	socket.on('deleted', stock => {
		removeStock(stock);
	});

	//Handle when a user adds a stock
	socket.on('added', data => {
		addStock(data.addedStockData);
	});

	//On initial connection, load and format stock data from server
	socket.on('newClientConnect', data => {
		stockData = data.stockData;
		//Iterate through all stocks
		let i = 0;
		for (let stock in stockData) {
			seriesOptions[i] = {
				name: stock,
				id: stock,
				data: stockData[stock]
			};
			generateHTML(stock);
			i++;
		}
		//Draw the chart
		createChart();
	});
	
	/*******************************
	END socket.io operations
	*******************************/
	
});


//Chart config
var seriesOptions = [],
	chartConfig = {

		//Begin theme
		colors: ['#55b209', '#003aff', '#ff5319', '#ffc200',
					'#b21409', '#a712b2', '#09b28d', '#6818cc',
					'#b29900', '#49f6ff', '#009cff', '#cc2323'],
		chart: {
			backgroundColor: '#212121',
			style: {
				color: '#A2A39C'
			}
		},
		subtitle: {
			style: {
				color: '#A2A39C'
			},
			align: 'left'
		},
		legend: {
			align: 'right',
			verticalAlign: 'bottom',
			itemStyle: {
				fontWeight: 'normal',
				color: '#A2A39C'
			}
		},
		xAxis: {
			gridLineDashStyle: 'Dot',
			gridLineWidth: 1,
			gridLineColor: '#A2A39C',
			lineColor: '#A2A39C',
			minorGridLineColor: '#A2A39C',
			tickColor: '#A2A39C',
			tickWidth: 1
		},
		yAxis: {
			gridLineDashStyle: 'Dot',
			gridLineColor: '#A2A39C',
			lineColor: '#A2A39C',
			minorGridLineColor: '#A2A39C',
			tickColor: '#A2A39C',
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
