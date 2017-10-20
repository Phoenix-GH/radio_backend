'use strict';

var express = require('express');
var controller = require('./commentservices.controller');
var config = require('../../config');
var jwt    = require('jsonwebtoken');

var router = express.Router();

function checkAuth(req, res, next) {
	var bearerHeader = req.get('Authorization');
	// decode token
	if (bearerHeader) {
		var bearer = bearerHeader.split(" ");
        if(bearer[0] == 'Bearer')
        {
        	var token = bearer[1];
			// verifies secret and checks exp
			jwt.verify(token, config.secret, function(err, decoded) {
				if (err) {
					return res.status(401).send({message: 'Authorization failed'});
				} else {
				// if everything is good, save to request for use in other routes
					req.user = decoded;
					next();
				}
			});
		}
		else {
			return res.status(401).send({message: 'Authorization failed'});
		}
	} else {
		return res.status(401).send({message: 'Authorization failed'});
	}
}

router.get('/:id', checkAuth, controller.getComments);
router.post('/:id', checkAuth, controller.postComment);

module.exports = router;