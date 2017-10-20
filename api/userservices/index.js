'use strict';

var express = require('express');
var controller = require('./userservices.controller');
var config = require('../../config');
var jwt    = require('jsonwebtoken');
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');

var router = express.Router();
aws.config.update({
    secretAccessKey: config.secretAccessKey,
    accessKeyId: config.accessKeyId,
    region: config.region
});

var s3 = new aws.S3();
var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.image_bucket,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {'photo': file.fieldname});
    },
    key: function (req, file, cb) {
    	var key = 'radioish' + Date.now().toString();
    	req.key = key;
	    cb(null, req.key);
	    
    }
  })
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

router.get('/',checkAuth, controller.getMe);
router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.put('/user', checkAuth, upload.array('photo', 1), controller.editUser);
router.post('/forgetPassword', controller.resetPassword);
router.delete('/user', checkAuth, controller.deleteUser);
router.get('/user/me', checkAuth, controller.getMe);
router.get('/user/id/:id', checkAuth, controller.getUser);
router.get('/user/all', checkAuth, controller.getAll);
router.get('/user/timeline', checkAuth, controller.getTimeline);
router.put('/user/follow/:id', checkAuth, controller.setFollow);
router.put('/user/deviceToken', checkAuth, controller.putDeviceToken);
router.put('/user/unfollow/:id', checkAuth, controller.setUnfollow);
router.get('/user/recommended', checkAuth, controller.getRecommendedUsers);

module.exports = router;