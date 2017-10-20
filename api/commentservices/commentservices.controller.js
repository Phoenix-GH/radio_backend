var User = require('../userservices/userservices.model.js'),
    Post = require('../postservices/postservices.model.js'),
    Comment = require('./commentservices.model.js'),
    Meta = require('../meta/meta.model.js'),
    Notification = require('../notificationservices/notificationservices.model.js'),
    config = require('../../config'),
    notificationHandler = require('../notificationservices/notificationservices.handler.js'),
    ObjectId = require('mongoose').Types.ObjectId;

exports.getComments = function(req, res) {
    
    var skip = req.query.skip,
        limit = req.query.limit;
    if (isNaN(skip)) { skip = 0; }
    if (isNaN(limit)) { limit = config.page_size; }

    var postId = new ObjectId(req.params.id);

    Comment.find({ 

        post : postId

    }, {}, { 

        skip : parseInt(skip), 
        limit : parseInt(limit)

    })
    .populate('user')
    .exec(function(err, comments) {

        if (err) {
            res.status(400).send(err);
        } else {
            res.json(comments);
        }

    });
}

exports.postComment = function(req, res) {

    var postId = new ObjectId(req.params.id),
        userId = req.user._id,
        content = req.body.content,
        meta = new Meta({
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

    if (content == null) {
        res.status(405).send('Missing Parameter');
        return;
    }

    var comment = new Comment({
            content: content,
            post: postId,
            user: userId,
            meta: meta
        });

    Post.findOne({_id: postId})
    .populate('user')
    .exec(function(err, post) {

        if (err || post == null) {
            res.status(400).json({"status": 'failed','message': err});
        } else {

            post.update({$set: {comments_count: post.comments_count + 1}}, function(err) {

                if (err) {
                    res.status(400).json({"status": 'failed','message': err});
                } else {

                    comment.save(function(err, data) {
                        if (err) {
                            res.status(400).json({"status": 'failed','message': err});
                        } else {
                            res.json({"status": 'success', "comment": comment});

                            var notification = Notification({

                                notificationType: 2,
                                message: 'just commented on "' + post.title + '"',
                                fromUser: userId,
                                toUser: post.user,
                                broadcast: postId

                            });

                            notificationHandler.sendNotification(notification, post.user.deviceToken, function(err) {

                                console.log(err);

                            });

                        }
                    });

                }

            });

        }

    });

}
