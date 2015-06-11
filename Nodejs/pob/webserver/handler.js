var file = require("./file");
var sal = require("./sal");
var db = require("./db");

function getFile(response, data){
	file.serveFile(data, function(error, result){
		if(!error){
			response.writeHead(200, {"Content-Type": result.type});
			response.write(result.contents);
		}else{
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.write(JSON.stringify(error));
		}
		response.end();
	});
}

function getTeams(response, data){
	db.getTeams(function(error, teams){
		if(!error){
			checkForAuth(function(){
				sal.getUsersByEmail( { emails: getEmailIds(teams || []) }, function(error, result){
					mapResultData(teams || [], result || [], function(){
						prcoessResult(response, error, teams);
					});
				});
			});
		}else{
			prcoessResult(response, error, null);
		}
	});
}

function getEmailIds(teams){
	var i, j, l = teams.length, m,
		team, emails = [];
	for(i = 0; i < l; i++){
		team = teams[i];
		m = team.members ? team.members.length : 0;
		for(j = 0; j < m; j++){
			emails.push(team.members[j]);
		}
	}
	var uniqueArray = emails.filter(function(item, pos) {
	    return emails.indexOf(item) == pos;
	})
	return uniqueArray;
}

function mapResultData(teams, users, callback){
	var i, l = users.length, 
		user, usermap = {};
	for(i = 0; i < l; i++){
		user = users[i];
		usermap[user.email] = user;
	}

	var j, m, team, members;
	l = teams.length;
	for(i = 0; i < l; i++){
		team = teams[i]; members = [];
		m = team.members ? team.members.length : 0;
		for(j = 0; j < m; j++){
			members.push(usermap[team.members[j]]);
		}
		team.members = members;
	}
	callback();
}

function getTrends(response, data){
	db.getTrends(function(error, trends){
		if(!error){
			var emails = _getEmailIds(trends || []);
			if(emails.length){
				checkForAuth(function(){
					sal.getUsersByEmail( { emails: emails }, function(error, result){
						_mapResultData(trends || [], result || [], function(){
							prcoessResult(response, error, trends);
						});
					});
				});
			}else{
				prcoessResult(response, null, trends);
			}
		}else{
			prcoessResult(response, error, null);
		}
	});
}

function _getEmailIds(trends){
	var i, j, l = trends.length, m,
		trend, emails = [];
	for(i = 0; i < l; i++){
		trend = trends[i];
		if(trend.type !== "team"){
			emails.push(trend.owner);	
			emails.push(trend.nominatedBy);
		}
	}
	var uniqueArray = emails.filter(function(item, pos) {
	    return emails.indexOf(item) == pos;
	})
	return uniqueArray;
}

function _mapResultData(trends, users, callback){
	var i, l = users.length, 
		user, usermap = {};
	for(i = 0; i < l; i++){
		user = users[i];
		usermap[user.email] = user;
	}

	var trend;
	l = trends.length; 
	for(i = 0; i < l; i++){
		trend = trends[i];
		if(trend.type !== "team" && usermap[trend.owner]){
			trend.owner = usermap[trend.owner];
		}
		if(trend.type !== "team" && usermap[trend.nominatedBy]){
			trend.nominatedBy = usermap[trend.nominatedBy];
		}
	}
	callback();
}

function checkForAuth(callback){
	if(!sal.loginInfo.accessToken){
		sal.doAuthentication(function(){
			callback();
		})
	}else{
		callback();
	}
}

function getPeople(response, data){
	checkForAuth(function(){
		sal.getUsersByKeyword(data, function(error, result){
			prcoessResult(response, error, result);
		});
	})
}

function saveTrend(response, data){
	data = data ? (data.length ? data : [data]) : [];
	db.loadTrends(data, function(result){
		_processResult(result, function(err, res){
			prcoessResult(response, err, res);
		});
	});
}

function saveComment(response, data){
	db.saveComment(data, function(error, result){
		result = result ? (result.length ? result : [result]) : [];
		_processResult(result, function(err, res){
			prcoessResult(response, err, res);
		});
	});
}

function likeTrend(response, data){
	db.likeTrend(data, function(error, result){
		result = result ? (result.length ? result : [result]) : [];
		_processResult(result, function(err, res){
			prcoessResult(response, err, res);
		});
	});
}

function _processResult(trends, callback){
	var i, l = trends.length,
		emails = [], tmp = {}, user;
	for(i = 0; i < l; i++){
		trend = trends[i];
		user = sal.cache[trend];
		if(!user){
			emails.push(trend.owner);
			tmp[trend.owner] = trend;
		}else{
			trend.owner = user;
		}
	}
	if(emails.length){
		checkForAuth(function(){
			sal.getUsersByEmail( { emails: emails }, function(error, result){
				if(!error){
					l = result.length;
					for(i = 0; i < l; i++){
						user = result[i];
						trend = tmp[user.email];
						if(trend) trend.owner =  user;
					}
					callback(null, trends);	
				}else{
					callback(error);	
				}
			});
		});
	}else{
		callback(null, trends);	
	}
}

function prcoessResult(response, error, result){
	if(!error){
		response.writeHead(200, {"Content-Type": "application/json"});
		response.write(JSON.stringify(result));
	}else{
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write(JSON.stringify(error));
	}
	response.end();
}

function getCache(response, data){
	prcoessResult(response, null, sal.cache);
}

exports.file = getFile;
exports.teams = getTeams;
exports.trends = getTrends;
exports.people = getPeople;
exports.savetrend = saveTrend;
exports.savecomment = saveComment;
exports.liketrend = likeTrend;
exports.cache = getCache;