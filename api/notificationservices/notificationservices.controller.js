var User = require('../userservices/userservices.model.js'),
    Post = require('../postservices/postservices.model.js'),
    Comment = require('../commentservices/commentservices.model.js'),
    Notification = require('./notificationservices.model.js'),
    Meta = require('../meta/meta.model.js'),
    notificationHandler = require('./notificationservices.handler.js'),
    config = require('../../config'),
    aws    = require('aws-sdk'),
    ObjectId = require('mongoose').Types.ObjectId;

exports.getNotifications = function(req, res) {
    
    var skip = req.query.skip,
        limit = req.query.limit;
    if (isNaN(skip)) { skip = 0; }
    if (isNaN(limit)) { limit = config.page_size; }

    var userId = req.user._id;

    Notification.find({ 

        toUser : userId

    }, {}, { 

        skip : parseInt(skip), 
        limit : parseInt(limit)

    })
    .populate('fromUser')
    .populate('broadcast')
    .exec(function(err, notifications) {

        if (err) {
            res.status(400).send(err);
        } else {
            res.json(notifications);
        }

    });

}

exports.postNotification = function(req, res) {

    var fromUser = new ObjectId(req.user._id),
        notificationType = req.body.notificationType,
        message = req.body.message,
        broadcast = req.body.post,
        toUser = new ObjectId(req.params.id);

    if (isNaN(notificationType)) { notificationType = 0; }
    if (message == null) {
        res.status(405).send('Missing Parameter');
        return;
    }

    var notification = Notification({

        notificationType: notificationType,
        message: message,
        fromUser: fromUser,
        toUser: toUser

    });

    if (broadcast != null) { notification.broadcast = broadcast; }

    User.findOne({_id: toUser}, function(err, user) {
        if (err || user == null || user.deviceToken == null) {
            res.status(400).send(err);
        } else {

            notificationHandler.sendNotification(notification, user.deviceToken, function(err) {

                if (err) {
                    res.status(400).send(err);    
                } else {
                    res.json({"status" : 'success'});
                }

            });

        }
    });
    
}
