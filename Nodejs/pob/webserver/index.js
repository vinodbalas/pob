var server = require("./server");
var router = require("./router");
var handler = require("./handler");

var handle = {
	"/file": handler.file,
	"/teams": handler.teams,
	"/trends": handler.trends,
	"/people": handler.people,
	"/savetrend": handler.savetrend,
	"/savecomment": handler.savecomment,
	"/liketrend": handler.liketrend,
	"/cache": handler.cache
};

server.start(router.route, handle);