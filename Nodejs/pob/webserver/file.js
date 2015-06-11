var fs = require("fs"); 
var path = require("path"); 

var validExtensions = {
	".html" : "text/html",			
	".js": "application/javascript", 
	".css": "text/css",
	".json": "application/json",
	".txt": "text/plain",
	".jpg": "image/jpeg",
	".gif": "image/gif",
	".png": "image/png",
	".ico": "image/ico"
};

function serveFile(pathname, callback){

	var localPath = __dirname;
	var ext = path.extname(pathname);

	var type = validExtensions[ext]; 
	if (type) {	
		localPath += "/.." + pathname;

		fs.exists(localPath, function(exists) {
			if(exists) {
				console.log("Serving file: " + pathname);

				fs.readFile(localPath, function(error, contents) {
					var data;

					if (!error) {
						data = {
							type: type,
							contents: contents 
						}
					}
					callback(error, data);
				});
			} else {
				console.log("File not found: " + localPath);
				
			}
		});
	} else {
		console.log("Invalid file extension detected: " + ext)
	}
}

exports.serveFile = serveFile;