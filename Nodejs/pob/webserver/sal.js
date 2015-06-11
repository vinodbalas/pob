var	sf = require('jsforce');
var request = require('request');

var loginInfo = {
	orgType: "Production", 
	userName: "prakash.senthilvel@servicemax.com", 
	password: "123sphsph01tfrM4N6rWD9Z7xCiCsrNt1i",
	accessToken: null,
	instanceUrl: null
}

var cache = {};

function doAuthentication(callback){
	var conn = new sf.Connection({
	   loginUrl : (loginInfo.orgType === "Production")? "https://login.salesforce.com": "https://test.salesforce.com"
	});
	conn.login(loginInfo.userName, loginInfo.password, function(error, result) {
		if (!error) {
			loginInfo.accessToken = conn.accessToken;
			loginInfo.instanceUrl = conn.instanceUrl;
			return callback();
		}
		console.log(error);
	});
}

function getUsersByKeyword(data, callback){
	var query = "SELECT Id FROM User WHERE Email LIKE '%"+ data.keyword +"%' OR Name Like '%"+ data.keyword +"%'";
	executeQuery(query, function(error, result){
		if(!error){
			getUsers(result || [], callback);
		}else{
			callback(error);
		}
	});
}

function getUsersByEmail(data, callback){
	var i, l = data.emails.length,
		emails = "", tmp = [];
	for(i = 0; i < l; i++){
		if(!cache[data.emails[i]]){
			emails += emails.length ? "," : ""; 
			emails += "'" + data.emails[i] + "'";
		}else{
			tmp.push(cache[data.emails[i]]);
		}
	}
	if(!emails.length) return callback(null, tmp);
	var query = "SELECT Id FROM User WHERE Email IN ("+ emails +")";
	executeQuery(query, function(error, result){
		if(!error){
			getUsers(result || [], function(err, res){
				if(!err){
					l = tmp.length;
					for(i = 0; i < l; i++){
						res.push(tmp[i]);
					}
				}
				callback(err, res);
			});
		}else{
			callback(error);
		}
	});
}

function getUsers(lst, callback){
	var url = "/services/data/v34.0/chatter/users/batch/";
	var i, l = lst.length;
	for(i = 0; i < l; i++){
		url += i ? "," + lst[i].Id : lst[i].Id;
	}
	request.get({
   		url: loginInfo.instanceUrl + url,
        headers: {
           'Authorization': 'OAuth ' + loginInfo.accessToken
        },
    }, function (err, resp, body) {
    	if (err) { return callback({error: "Try Again"}); }
		callback(null, formatData(JSON.parse(body)));
    });
}

function formatData(data){
	items = data.results || [];

	var i, l = items.length,
		item, user, result = [];
	for(i = 0; i < l; i++){
		item = items[i].result;
		user = {
			name: item.name, desg: item.title,
			email: item.email, manager: item.manager,
			picture: item.photo && item.photo.standardEmailPhotoUrl, 
			place: item.address && item.address.city
		}
		result.push(user);
		cache[user.email] = user;
	}
	return result;
}

function executeQuery(query, callback){
	var conn = new sf.Connection({ 
		instanceUrl : loginInfo.instanceUrl, 
		accessToken : loginInfo.accessToken 
	});

	var records = [];
	conn.query(query)
	  	.on("record", function(record) {
	    	records.push(record);
	  	})
	  	.on("end", function(query) {
	  		callback(null, records);
	  	})
	  	.on("error", function(error) {
	    	callback(error);
	  	})
	  	.run({ autoFetch : true, maxFetch : 200 });
}

exports.loginInfo = loginInfo;
exports.doAuthentication = doAuthentication;
exports.getUsersByKeyword = getUsersByKeyword;
exports.getUsersByEmail = getUsersByEmail;;
exports.cache = cache;