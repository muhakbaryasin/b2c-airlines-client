function requestIUuid(handleData) {
	jQuery.ajax({
		url: url_host + ':1234/request-uuid',
		jsonp: 'callback',
		dataType: 'jsonp'
	}).done(function(response) {
		if ( response.hasOwnProperty('uuid') )
			handleData(response.uuid);
	}).fail(function() {
		alert("fail");
	});
};

var httpRequestJsonp = function(url_string, webParams) {
	jQuery.ajax ({
		url: url_string,
		jsonp: 'callback',
		data : webParams,
		dataType: 'jsonp'
	}).done(function(response) {
		
	}).fail(function() {
		alert("fail");
	});
};

var requestAirline = function(webParams, searchOpt) {
	var isUp = false;
	if (searchOpt === 'lion' || searchOpt === 'all') {
		httpRequestJsonp(url_host + ':1234/lion-schedule-json', webParams);
		isUp = true;
	}
	if (searchOpt === 'sriwijaya' || searchOpt === 'all') {
		httpRequestJsonp(url_host + ':1234/sriwijaya-schedule-json', webParams);
		isUp = true;
	}
	if (searchOpt === 'citilink' || searchOpt === 'all') {
		httpRequestJsonp(url_host + ':1234/citilink-schedule-json', webParams);
		isUp = true;
	}	
	if (searchOpt === 'airasia' || searchOpt === 'all') {
		httpRequestJsonp(url_host + ':1234/airasia-schedule-json', webParams);
		isUp = true;
	}
	if (searchOpt === 'garuda' || searchOpt === 'all') {
                httpRequestJsonp(url_host + ':1234/garuda-schedule-json', webParams);
		isUp = true;
    	}
	if (!isUp) {
		alert('Tidak ada opsi untuk maskapai ' + searchOpt+ '.');
	}
};

var time_out = 0;
var is_searching = true;

var searchRequest = function(search_params) {
	toogleLoader();
	requestIUuid( function(req_uuid) {
		search_params['uuid'] = req_uuid;

		var search_interval;
		var temp_schedule_len = 0;
		
		function searchResult() {
			getElementById( 'progress' ).innerHTML = 'Sedang mengambil data...';
			getElementById('btn_stop').style.display = 'block';
			
			jQuery.ajax({
				url: url_host + ':1234/result-json',
				jsonp: 'callback',
				dataType: 'jsonp',
				data : search_params
			}).done(function(response) {
				var progress_finished = false;
				
				if (response.hasOwnProperty('progress') && response.progress.length > 0) {
					var item = response.progress.length;
					
					for (var iter = 0; iter < item; iter++) {
						var not_finished = ( response.progress[iter].status !== 'finished' );
						if (!not_finished) {
							//jQuery("#result_depart").html( createResultTableModel(response.schedules['departure'].price_adult, 0) );
							//jQuery("#result_return").html( createResultTableModel(response.schedules['return'], 1) );
							if (response.schedules['departure'] !== undefined && typeof(response.schedules['departure']) !== 'string' && response.schedules['departure'].length > 0) {
								if ( response.schedules['departure'].length > temp_schedule_len ) {
									temp_schedule_len = response.schedules['departure'].length;
									BuyerData.result.s_depart = response.schedules['departure'].sort(function(a, b) {
										var price_a = 0; var price_b = 0;
										try {
											price_a = parseFloat(a.price_adult);
											price_b = parseFloat(b.price_adult);
										} catch( e ) {
											
										}
										return price_a - price_b;
									});
									showMeTheTable(1);

									if (display_loader) {
										toogleLoader();
									}
								}
									
							}
						}
						progress_finished += not_finished;
					}
				}
				
				if (time_out < 1 || progress_finished < 1 ) {
					is_searching = false;
					clearInterval(search_interval);

					if (response.schedules['departure'] !== undefined && typeof(response.schedules['departure']) !== 'string' && response.schedules['departure'].length > 0) {
						if (rTripTypeRadio) {
							if (response.schedules['return'] !== undefined && typeof(response.schedules['return']) !== 'string' && response.schedules['return'].length > 0) {
								BuyerData.result.s_return = response.schedules['return'].sort(function(a, b) {
									var price_a = 0; var price_b = 0;
									try {
										price_a = parseFloat(a.price_adult);
										price_b = parseFloat(b.price_adult);
									} catch( e ) {
										
									}
									return price_a - price_b;
								});
							} else { alert('Jadwal kembali untuk rute dan tanggal yang dipilih tidak ditemukan'); change_schedule(); display_loader = true; toogleLoader(); }
						}
					} else { alert('Jadwal pergi untuk rute dan tanggal yang dipilih tidak ditemukan'); change_schedule(); toogleLoader(); }
					
					getElementById('progress').innerHTML = '';
					getElementById('btn_stop').style.display = 'none';
				} else {
					is_searching = true;
					time_out--;
				}
			}).fail(function() {
				alert('fail');
			});
		};
		
		requestAirline(search_params, BuyerData.search_opt );
		
		setTimeout(function(){
			search_interval = setInterval(searchResult, 1000);
		}, 500); 
		
		
	});
};

var searchToogle = function() {
	if (!is_searching){
		searchRequest(search_params);
		time_out = 60;
	}else {
		time_out = 0;
	}
};
