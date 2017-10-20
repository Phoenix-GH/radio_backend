'use strict';

var express = require('express');
var controller = require('./postservices.controller');
var config = require('../../config');
var jwt    = require('jsonwebtoken');
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
var router = express.Router();

var router = express.Router();
aws.config.update({
    secretAccessKey: config.secretAccessKey,
    accessKeyId: config.accessKeyId,
    region: config.region
});

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

var s3 = new aws.S3();
var uploadAudio = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.audio_bucket,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldname: file.fieldname});
    },
    key: function (req, file, cb) {
      	if(file.fieldname == 'audio')
    		req.audiokey = file.originalname;
    	else if(file.fieldname == 'image')
    		req.imagekey = file.originalname;
	    cb(null, file.originalname); 
    }
  })  
});

router.post('/', checkAuth, uploadAudio.any(), controller.sendPosts);
router.get('/all', checkAuth, controller.getPosts);
router.put('/increment/:id', checkAuth, controller.incrementPost);
router.delete('/:id', checkAuth, controller.deletePost);
router.put('/like/:id', checkAuth, controller.like);
router.put('/unlike/:id', checkAuth, controller.unlike);
router.get('/recommended', checkAuth, controller.getRecommendedPosts);

module.exports = router;