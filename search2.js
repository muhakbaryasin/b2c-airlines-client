var url_b2c = "http://siptiket.co.id:1234";
var airlines_config_response = {};
var request_uuid_response = {};
var request_airlines_response = null;
var search_response = {};
var debug_mode = false;

var airlines_opt = {
	"lion"	: true, "sriwijaya" : true, "citilink" : true //tambahkan yang lain
};

var search_params = {
	"adult_passenger_number": 1,
	"child_passenger_number": 0,
	"depart_city_code": "CGK",
	"depart_city_name": "Jakarta (cengkareng)",
	"depart_date": "2018-11-17",
	"depart_type": "oneway",
	"destination_city_code": "KDI",
	"destination_city_name": "Kendari",
	"infant_passenger_number": 0,
	"return_date": "2018-11-05"
};

function removeElById(id_) {
	var existing_el = document.getElementById(id_);	
    try { existing_el.parentNode.removeChild(existing_el); } catch (err) {  };
	return;
};

function getAirlinesConfigCb(response) {
	airlines_config_response = response;
	return;
};

function requestUuidCb(response) {
	request_uuid_response = response;
	return;
}

function searchCb(response) {
	search_response = response;
	return;
}

function reqJSONP(el_id, url_target, callback=null, params = {} ) {
	var source = url_target + "?";
	
	for (var param in params) {
		source += param + "=" + params[param] + "&";
	}
	
	if (callback !== null)
		source += "callback=" + callback + "&";
	
	var s = document.createElement('script');
	s.src = source;
	s.id = el_id;
	document.body.appendChild(s);
	removeElById(el_id);
	return;
}

/*function getAirlinesConfig() {
	var id = "get-airlines-config";
	removeElById(id);
	var source = url_b2c + "/get-airlines-config?callback=getAirlinesConfigCb";
	var s = document.createElement('script');
	s.src = source;
	s.id = id;
	document.body.appendChild(s);
};*/

function getAirlinesConfig() {
	airlines_config_response = {};
	var id = "get-airlines-config";	
	var url_target = url_b2c + "/get-airlines-config"
	var callback = "getAirlinesConfigCb";
	reqJSONP(id, url_target, callback = callback);
	return;
}

function requestUuid() {
	var id = "request-uuid-id";
	var url_target = url_b2c + "/request-uuid";
	var callback = "requestUuidCb";
	reqJSONP(id, url_target, callback = callback);
	return;
};

function requestAirlines(iter = 0) {
	if (iter == 0) {
		request_airlines_response = null;
		requestUuid();
	}
	
	var search_interval;
	
	if (!request_uuid_response.hasOwnProperty("uuid") && iter < 100) {
		// recursive
		iter++;
		
		setTimeout(function() {
			search_interval = setInterval(requestAirlines(iter = iter), 1000);
		}, 500);
		return;
	}
	
	clearInterval(search_interval);
	search_params.uuid = request_uuid_response["uuid"];
	
	for (var opt in airlines_opt) {
		if (airlines_opt[opt]) {
			var url_target = "";
			
			if (opt == "lion") {
				url_target = url_b2c + "/lion-schedule-json";
				reqJSONP(opt + "_id" , url_target, callback = null, params = search_params);
			}
			
			if (opt == "sriwijaya") {
				url_target = url_b2c + "/sriwijaya-schedule-json";
				reqJSONP(opt + "_id" , url_target, callback = null, params = search_params);
			}
			
			if (opt == "citilink") {
				url_target = url_b2c + "/citilink-schedule-json";
				reqJSONP(opt + "_id" , url_target, callback = null, params = search_params);
			}
			
			if (opt == "garuda") {
				url_target = url_b2c + "/garuda-schedule-json";
				reqJSONP(opt + "_id" , url_target, callback = null, params = search_params);
			}
		}
	}
	request_airlines_response = {};
	return;
};

function search(iter = 0) {
	if (iter == 0) {
		search_response = {};
		requestAirlines();		
	}
	
	if (!request_uuid_response.hasOwnProperty("uuid") && iter < 100) {
		// recursive
		iter++;
		
		setTimeout(function() {
			search_interval = setInterval(search(iter = iter), 1000);
		}, 500);
		return;
	}	
	// uuid udah	
	
	if (request_airlines_response == null && iter < 100) {
		// recursive
		iter++;
		
		setTimeout(function() {
			search_interval = setInterval(search(iter = iter), 1000);
		}, 500);
		return;
	}
	// request_airline udah
	
	var id = "search-id";
	var url_target = url_b2c + "/result-json";
	var callback = "searchCb";
	reqJSONP(id, url_target, callback = callback, params = search_params);
	
	var search_interval;
	
	if (debug_mode)
		console.log(request_uuid_response);
	
	if (!search_response.hasOwnProperty("progress") && iter < 100) {
		// recursive
		iter++;		
		setTimeout(function(){
			search_interval = setInterval(search(iter = iter), 1000);
		}, 1000);
		return;
	}
	
	if (search_response.progress.length == 0 && iter < 100) {
		// recursive
		iter++;		
		setTimeout(function(){
			search_interval = setInterval(search(iter = iter), 1000);
		}, 1000);
		return;
	}
	
	var done = true;
	
	for (var each_progress in search_response.progress) {
		if (debug_mode)
			console.log(search_response.progress[each_progress]);
		
		if (search_response.progress[each_progress].step !== search_response.progress[each_progress].max_step)
			done = done && false;	
	}
	
	if (!done) {
		iter++;		
		setTimeout(function(){
			search_interval = setInterval(search(iter = iter), 1000);
		}, 1000);
		return;
	}
	
	clearInterval(search_interval);
	request_uuid_response = {};
	return;
}