// BASE SETUP
// =============================================================================

// call the packages we need
var argv = require('minimist')(process.argv.slice(2));
var swagger = require("swagger-node-express");
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var app = express();

var morgan = require('morgan');
var config = require('./config');
var mongoose = require('mongoose');

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT

// Use the session middleware
app.use(cookieParser());

//-------------
var port     = process.env.PORT || 7001; // set our port

// CREATE OUR ROUTER
require('./route')(app);


mongoose.connect(config.database); // connect to database

var db = mongoose.connection;
db.on('error', function(err){
	//console.log('DB connection failed with error:', err);
});
db.once('open', function(){
	//console.log('DB connected');
})

var subpath = express();
app.use("/v1", subpath);
swagger.setAppHandler(subpath);

app.use(express.static('dist'));

swagger.setApiInfo({
    title: "Radioish API",
    description: "API to manage User and Posts.",
    termsOfServiceUrl: "",
    contact: "hiromihara@protonmail.com",
    license: "",
    licenseUrl: ""
});

subpath.get('/', function (req, res) {
    res.sendfile(__dirname + '/dist/index.html');
});

swagger.configureSwaggerPaths('', 'api-docs', '');

var domain = 'localhost';
if(argv.domain !== undefined)
    domain = argv.domain;
else
    console.log('No --domain=xxx specified, taking default hostname "localhost".');
var applicationUrl = 'http://' + domain;
swagger.configure(applicationUrl, '1.0.0');



// START THE SERVER
// =============================================================================
app.listen(port);
//console.log('Requests on port:' + port);
exports = module.exports = app;
