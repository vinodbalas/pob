var mongoose = require('mongoose');

var mongoURI = "mongodb://localhost:27017/napp";
var MongoDB = mongoose.connect(mongoURI).connection;
MongoDB.on('error', function(err) { console.log(err.message); });
MongoDB.once('open', function() {
  	console.log("mongodb connection open");
});

var Team = mongoose.model('Team', { 
	name: String,
	desc: String,
	members: Array
});

var Trend = mongoose.model('Trend', { 
	type: String,
	owner: Object,
	title: String,
	desc: String,
	likes: String,
	comments: Array,
	nominatedBy: Object,
});

function loadTeams(teams, callback){
	var i, l = teams.length, count = l,
		team;
	for(i = 0; i < l; i++){
		team = new Team(teams[i]);
		team.save(function (err) {
			count--;
			if (err) console.log(err.message);
			if(!count) callback();
		});
	}
}

function getTeams(callback){
	Team.find(function (err, result) {
		if (err) callback(err);
		else callback(null, result);
	});
}

function getTeam(name, callback){
	Team.find({ name: name }, function (err, result) {
		if (err) return callback(err);
		callback(result);
	})
}

function removeTeams(){
	Team.remove().exec();
}

function loadTrends(trends, callback){
	var i, l = trends.length, count = l,
		trend, result = [];
	for(i = 0; i < l; i++){
		trend = new Trend(trends[i]);
		trend.save(function (err) {
			count--;
			if (err) return callback(err);
			result.push(trend);
			if(!count) callback(result);
		});
	}
}

function getTrends(callback){
	Trend.find(function (err, result) {
		if (err) callback(err);
		else callback(null, result);
	});
}

function removeTrends(){
	Trend.remove().exec();
}

function saveComment(data, callback){
	if(data.trendId && data.comment){
		Trend.findOne({_id: data.trendId}, function (err, result) {
			if (err) return callback(err);
			result.comments = result.comments || []; 
			result.comments.push(data.comment);
			result.save(function (err) {
				if (err) return callback(err);
				callback(null, result);
			});
		});
	}
}

function likeTrend(data, callback){
	if(data.trendId){
		Trend.findOne({_id: data.trendId}, function (err, result) {
			if (err) return callback(err);
			result.likes = "" + (parseInt(result.likes) + 1); 
			result.save(function (err) {
				if (err) return callback(err);
				callback(null, result);
			});
		});
	}
}

var teams = [{
	"name": "ONLINE",
	"desc": 'Description',
	"members": [
		"vinod.kumarv@servicemax.com",
		"naveen.koka@servicemax.com",
		"praveen.rajendra@servicemax.com",
		"amar.joshi@servicemax.com"
	]
}];

var trends = [{"_id":"55796ccb8812356c1e2da566","owner":"mark.boyer@servicemax.com","type":"user","title":"Thanks for helping Apririo turning around JCI integration design!","desc":"Thank you so much for all your help so far, Mark. You have been a tremendous help in turning around JCI integration design. Thanks for working closely with Apririo to guide them on a technical knowledge.","likes":"200","__v":0,"comments":["Thanks",""],"nominatedBy":"ruth.protpakorn@servicemax.com"},{"_id":"55796caae45560801613825b","owner":"tejasvi.nagendrappa@servicemax.com","type":"user","title":"Above and Beyond","desc":"He has done great job in developing a new feature Location Tracking which is New and completed successfully :)","likes":"2","__v":0,"comments":[],"nominatedBy":"sumit.gupta@servicemax.com"},{"_id":"55796c0ee45560801613825a","owner":"prakash.senthilvel@servicemax.com","type":"user","title":"prakash is a great contributer","desc":"prakash has done great contribution towards SYNC 2.0 and aggressive sync","likes":"0","__v":1,"comments":["I agree!"],"nominatedBy":"vinod.kumarv@servicemax.com"},{"_id":"557968dde455608016138259","owner":"sumit.gupta@servicemax.com","type":"user","title":"Awesome work!!","desc":"Sumit has been a consistent contributer to the team. His never give up attitude and technical skills has benfitted the team and teh team mebers immensely. His work towards migrations tools and automated scripts are a real time saver for the PS and QA teams.","likes":"1","__v":0,"comments":[],"nominatedBy":"vinod.kumarv@servicemax.com"}]

/*
removeTeams();
removeTrends();*/

/*loadTeams(teams, function(){});
loadTrends(trends, function(){});
*/

exports.getTeams = getTeams;
exports.getTrends = getTrends;
exports.loadTrends = loadTrends;
exports.saveComment = saveComment;
exports.likeTrend = likeTrend;