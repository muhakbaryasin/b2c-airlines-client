function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
		  .toString(16)
		  .substring(1);
		}	
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

var url_b2c = "http://siptiket.co.id:1234";

var airlines_config_response = {};
var request_uuid_response = {};
var request_airlines_response = {};

var airlines_opt = {
	"lion"	: true, "sriwijaya" : true //tambahkan yang lain
};

var search_params = {
	"adult_passenger_number": 1,
	"child_passenger_number": 0,
	"depart_city_code": "CGK",
	"depart_city_name": "Jakarta (cengkareng)",
	"depart_date": "2018-11-16",
	"depart_type": "oneway",
	"destination_city_code": "DPS",
	"destination_city_name": "Denpasar Bali",
	"infant_passenger_number": 0,
	"return_date": "2018-11-05"
};

function removeElById(id_) {
	var existing_el = document.getElementById(id_);	
    try { existing_el.parentNode.removeChild(existing_el); } catch (err) {  };
};

function getAirlinesConfigCb(response) {
	airlines_config_response = response;
};

function requestUuidCb(response) {
	request_uuid_response = response;
}

function reqJSONP(el_id, url_target, callback=null, params = {} ) {
	removeElById(el_id);
	var source = url_target + "?";
	
	for (var param in params) {
		source += param + "=" + params[param] + "&";
	}
	
	if (callback !== null)
		source += "callback=" + callback + "&";
	
	console.log(source);
	
	var s = document.createElement('script');
	s.src = source;
	s.id = el_id;
	document.body.appendChild(s);
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
	var id = "get-airlines-config";	
	var url_target = url_b2c + "/get-airlines-config"
	var callback = "getAirlinesConfigCb";
	reqJSONP(id, url_target, callback = callback);
}

function requestUuid() {
	var id = "request-uuid-id";
	var url_target = url_b2c + "/request-uuid";
	var callback = "requestUuidCb";
	reqJSONP(id, url_target, callback = callback);
};

async function search() {
	requestUuid();
	
	var iter = 0;
	
	while (!request_uuid_response.hasOwnProperty("uuid") && iter < 100) {
		console.log("sleep " + iter.toString());
		await sleep(1000);
		iter++;
	}
	
	search_params.uuid = request_uuid_response["uuid"];
	console.log(request_uuid_response);
	
	for (var opt in airlines_opt) {
		
		if (airlines_opt[opt]) {
			var url_target = "";			
			
			if (opt == "lion") {
				url_target = url_b2c + "/lion-schedule-json";			
				reqJSONP(opt + "_id" , url_target, callback = null, params = search_params);
			}
		}
		
	}
	
	
};




/*function xmlHttpRequest() {
	if (window.XMLHttpRequest) {
    // code for modern browsers
		xmlhttp = new XMLHttpRequest();
	} else {
		// code for old IE browsers
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	return xmlhttp;
}

function getAirlinesConfig() {
	callback = ""
	url_get_config = url_b2c + "/get-airlines-config?" + ;
	
	xhr = xmlHttpRequest();
	
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
			alert(xhr.responseText);
		}
	}
	xhr.open('GET', url_get_config, true);
	xhr.send(null);
}

*/