var http      = require('http');
var httpProxy = require('http-proxy');
var exec = require('child_process').exec;
var request = require("request");

var GREEN = 'http://127.0.0.1:5060';
var BLUE  = 'http://127.0.0.1:9090';

var TARGET = BLUE;
var REDISLOC = 'C:/Users/Justin/Desktop/devOps/redis/redis-server'; 


//Messy sleep from 
//http://stackoverflow.com/questions/20967006/how-to-create-a-sleep-delay-in-nodejs-that-is-blocking
function sleep(time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    callback();
}

var infrastructure =
{
		setup: function()
		{
			exec('forever stopall');
			//Redis for blue
			exec(REDISLOC + ' --port 6379 &');
			//Redis for green
			exec(REDISLOC + ' --port 6380 &');
			// Proxy.
			
			sleep(2000, function(){}); //Give the redis instances time to launch. (Advice from Chris Theisen)
			
			var options = {};
			var proxy   = httpProxy.createProxyServer(options);

			var server  = http.createServer(function(req, res){
				proxy.web( req, res, {target: TARGET } );
				//Check the request here
				if (req.url == "/switch"){
					//Switch the target
					if(TARGET == GREEN){
						TARGET = BLUE;
					}
					else if(TARGET == BLUE){
						TARGET = GREEN
					}
				}
			});
			server.listen(8080);

			// Launch blue slice
			exec('forever --watch start deploy/blue-www/app.js 9090 6379 6380 blue');
			console.log("blue slice");

			// Launch green slice
			exec('forever --watch start deploy/green-www/app.js 5060 6380 6379 green');
			console.log("green slice");
		},

		teardown: function()
		{
			exec('forever stopall', function()
					{
				console.log("infrastructure shutdown");
				process.exit();
					});
		},
}

infrastructure.setup();

//Make sure to clean up.
process.on('exit', function(){infrastructure.teardown();} );
process.on('SIGINT', function(){infrastructure.teardown();} );
process.on('uncaughtException', function(err){
	console.log(err);
	infrastructure.teardown();} );