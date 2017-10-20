var bodyParser = require('body-parser');
module.exports = function(app) {

	// ROUTES FOR OUR API
	// =============================================================================

	// middleware to use for all requests
	app.use(bodyParser());
	app.use(bodyParser({limit: '50mb'}));
	app.use(bodyParser.urlencoded({limit: '50mb'}));
	
	app.use(function(req, res, next) {
		// do logging
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
		res.header("Access-Control-Allow-Methods", "PUT, POST, GET, PATCH, DELETE");
		next();
	});
	app.use('/radioish/api', require('./api/userservices'));
	app.use('/radioish/api/post', require('./api/postservices'));
	app.use('/radioish/api/comment', require('./api/commentservices'));
	app.use('/radioish/api/notification', require('./api/notificationservices'));
};