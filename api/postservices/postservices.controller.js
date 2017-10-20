var Post = require('./postservices.model.js'),
    Meta = require('../meta/meta.model.js'),
    User = require('../userservices/userservices.model.js'),
    Comment = require('../commentservices/commentservices.model.js'),
    Notification = require('../notificationservices/notificationservices.model.js'),
    notificationHandler = require('../notificationservices/notificationservices.handler.js'),
    bcrypt = require('bcrypt'),
    jwt    = require('jsonwebtoken'),
    config = require('../../config'),
    ObjectId = require('mongoose').Types.ObjectId;

exports.sendPosts = function(req, res) {
    var cf = require('aws-cloudfront-sign')
    var options = {keypairId: config.cloudfrontKeyId, privateKeyPath: './key.pem'};
    var signedUrl = cf.getSignedUrl(config.cfDomain + '/' + req.audiokey, options);

    var title = req.body.title,
        author = req.body.author,
        description = req.body.description,
        meta = new Meta({created_at: new Date().toISOString()}),
        userId = new ObjectId(req.user._id);

    if (title == null || author == null || description == null) {
        res.status(405).json({"status": 'failed','message': 'Missing Parameter'});
        return;
    }

    //var userData = new User({_id: user._id, name: user.name, email: user.email, description: user.description, phone: user.phone, photo: config.domain + config.audio_bucket +'/'+ req.imagekey});
    var post = new Post({audio: 'https://'+ config.cfDomain+'/'+ req.audiokey, meta: meta, play_count: 0, title: title, description: description, user: userId, author: author, likes: []});

    post.save(function(err, data) {
        if (err) {
            res.status(400).json({"status": 'failed','message': err});
        } else {
            res.json({"status" : 'success'});

            User.findOne({_id: userId})
            .populate('followers')
            .exec(function(err, user) {

                if (err || user == null) {

                } else {

                    for (var i = 0; i < user.followers.length; i++) {

                        var notification = Notification({
                            notificationType: 3,
                            message: 'just posted a New Broadcast titled "' + post.title + '"',
                            fromUser: userId,
                            toUser: user.followers[i]._id,
                            broadcast: post._id
                        });

                        notificationHandler.sendNotificationWithSenderName(notification, user.followers[i].deviceToken, user.name, function(err) {});

                    }

                }

            });

        }
        
    });
}

exports.getPosts = function(req, res) {
    Post.find()
        .populate('user')
        .exec(function(err, posts) {
            if (err) {
                res.status(400).send(err);
                return;
            } 
            res.json(posts);
        });
}

exports.deletePost = function(req, res) {
    var postId = new ObjectId(req.params.id);

    if (postId == '' || postId == null) {
        res.status(405).json({"status": 'failed','message': 'Missing Parameter'});
        return;
    }

    Post.remove({_id: postId}, function(err) {

        if (err) {
            res.status(400).send(err);
        } else {
            Comment.remove({post: postId}, function(err) {
                res.json({"status": 'success'});
            });
        }

    });
}

exports.incrementPost = function(req, res) {

}

exports.like = function(req, res) {
    var postId = new ObjectId(req.params.id);

    if (postId == '' || postId == null) {
        res.status(405).json({"status": 'failed','message': 'Missing Parameter'});
        return;
    }

    Post.findOne({_id: postId})
    .populate('user')
    .exec(function(err, post) {
        if (err || post == null) {
            res.status(400).send(err);
            return;
        }

        var userId = new ObjectId(req.user._id);

        if (post.likes.indexOf(userId) >= 0) {
            res.status(403).send("Forbidden to like specific post twice");
            return;
        }

        post.likes.push(userId);
        post.update({$set: {likes: post.likes}}, function(err, data) {
            if (err) {
                res.status(400).json({"status": 'failed','message': err});
                return;
            }

            res.json({"status" : 'success'});

            var notification = Notification({

                notificationType: 1,
                message: 'just liked your broadcast "' + post.title + '"',
                fromUser: userId,
                toUser: post.user,
                broadcast: postId

            });

            notificationHandler.sendNotification(notification, post.user.deviceToken, function(err) {

                console.log(err);

            });
        });
    });
}

exports.unlike = function(req, res) {
    var postId = new ObjectId(req.params.id),
        userId = new ObjectId(req.user._id);
        
    if (postId == '' || postId == null) {
        res.status(405).json({"status": 'failed','message': 'Missing Parameter'});
        return;
    }

    Post.findOne({_id: postId}, function(err, post) {
        if (err || post == null) {
            res.status(400).send(err);
            return;
        }

        var idx = post.likes.indexOf(userId);
        if (idx == -1) {
            res.status(403).send("Forbidden to unlike non-existing post");
            return;        
        }

        post.likes.splice(idx, 1);
        post.update({$set: {likes: post.likes}}, function(err, data) {
            if (err) {
                res.status(400).json({"status": 'failed','message': err});
                return;
            }
            
            res.json({"status" : 'success'});

        });
    });
}

exports.getRecommendedPosts = function(req, res) {
    var userId = new ObjectId(req.user._id);

    User.findOne({_id: userId}, function(err, user) {

        if (err || user == null) {
            res.status(400).send(err);
        } else {

            User.find({_id: {$in: user.following}}, function(err, followingUsers) {

                if (err) {
                    res.status(400).send(err);
                } else {
                    var recommendedIds = [];
                    for (var i = 0; i < followingUsers.length; i++) {
                        recommendedIds = recommendedIds.concat(followingUsers[i].followers);
                    }

                    recommendedIds = recommendedIds.filter(function(item, index, inputArray){
                        return (inputArray.indexOf(item) == index) && !item.equals(userId) && (user.following.indexOf(item) == -1);
                    });

                    Post.find({user: {$in: recommendedIds}})
                    .populate('user')
                    .exec(function(err, recommendedPosts) {
                        if (err) {
                            res.status(400).send(err);
                        } else {
                            res.json(recommendedPosts);
                        }
                    });
                }             

            });
        }

    });
}