var http = require("http");
var url = require("url");
var qs = require('querystring');

function start(route, handle) {

	function onRequest(request, response) {
		var requrl = url.parse(request.url);
		var pathname = (request.url === "/" || requrl.pathname === "/oauth2callback")? "/index.html": requrl.pathname;

		console.log("Request for " + pathname + " received.");

		if(request) {
			var body = "";
			request.addListener("data", function(postDataChunk) {
				body += postDataChunk;
				if (body.length > 1e6){
	                request.connection.destroy();
	            }
			});
			request.addListener("end", function() {
				var data = getRequestData(qs.parse(body) || {}, requrl.query || "");

				response.setHeader('Access-Control-Allow-Origin', '*');
				response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, CONNECT');
				response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
				response.setHeader('Access-Control-Allow-Credentials', true);
				response.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

				route(handle, pathname, response, data);
			});
		}
	}

	function getRequestData(data, params){
		var arr1 = params.split("&&") || [],
			i, l = arr1.length,
			arr2;

		for(i = 0; i < l; i++){
			arr2 = arr1[i].split("=") || [];
			if(arr2.length === 2){
				data[arr2[0]] = arr2[1];
			}
		}
		return data;
	}	

	http.createServer(onRequest).listen(8888);
	console.log("Server has started.");
}

exports.start = start;