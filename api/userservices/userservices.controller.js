
var User = require('./userservices.model.js'),
    Post = require('../postservices/postservices.model.js'),
    ObjectId = require('mongoose').Types.ObjectId,
    Notification = require('../notificationservices/notificationservices.model.js'),
    notificationHandler = require('../notificationservices/notificationservices.handler.js'),
    bcrypt = require('bcrypt'),
    jwt    = require('jsonwebtoken'),
    config = require('../../config'),
    fs = require('fs');

exports.signup = function(req, res) {

    var name = req.body.name,
        email = req.body.email,
        password = req.body.password;

    if ((name == '' || name == null) || (email == '' || email == null) || (password == '' || password == null)) {
        res.status(405).send('Missing Parameter');
    } else {

        checkAdminDuplication(req, function(result) {

            if (result.status == 'error') {
                res.status(403).send("Registered user");
            } else if (result.status == 'ok') {

                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(password, salt, function(err, hash) {

                        var newUser = new User({
                            name: name,
                            email: email,
                            password: hash
                        });

                        newUser.save(function(err, data) {
                            if (err) {
                                res.status(403).send(err);
                                return;
                            } else {
                                var token = jwt.sign({email: data.email, type: 'user', _id: data._id}, config.secret);

                                res.json({
                                    "status": 'success',
                                    "token": token
                                });
                            }
                        });

                    });
                });

            } else {
                res.status(403).send('User already exists');
            }

        });
    }
    
}

exports.login = function(req, res) {

    var email = req.body.email,
        password = req.body.password;

    if ((email == '' || email == null) || (password == '' || password == null)) {
        res.status(405).send('Missing Parameter');
    } else {

        User.find({email: email}, function(err, users) {

            if (err) {
                res.status(400).send(err);
                return;
            }

            if (users.length == 0) {
                res.status(403).send('Invalid Credentials')
                return;
            }

            bcrypt.compare(password, users[0].password, function(err, isPasswordMatch) {
                if(isPasswordMatch == false) {
                    res.status(403).send('Invalid Credentials')
                    return;
                } else {
                    var token = jwt.sign({email: users[0].email, type: 'user', _id: users[0]._id}, config.secret);
                    res.json({
                        token: token
                    })
                }
            });
        
        });

    }

}

exports.editUser = function(req, res) {

    var name = req.body.name,
        description = req.body.description,
        phone = req.body.phone;

    var newPassword = req.body.newPassword,
        oldPassword = req.body.oldPassword;

    var userId = new ObjectId( req.user._id);

    //Updating user profile
    if (name != '' && name != null && description != null && phone != null) {

        User.findOne({_id: userId}, function(err, user) {

            if (err || user == null) {
                res.status(404).send('Invalid login')
            } else {

                user.update({$set: {name: name, description: description, phone: phone}}, function(err) {

                    if (err){
                        res.status(403).send(err);
                    } else {
                        res.json({'status': 'success'});
                    }
                    
                });

            }

        });

    } 
    //Updating password
    else if( (newPassword != '' && newPassword != null) && (oldPassword != '' && oldPassword != null) ) {

        User.findOne({_id: userId}, function(err, user) {

            if (err || user == null) {
                res.status(404).send('Invalid login')
            } else {

                bcrypt.compare(oldPassword, user.password, function(err, isPasswordMatch) {

                    if (isPasswordMatch == false) {
                        res.status(404).send('Old password is wrong');
                    } else {
                        bcrypt.genSalt(10, function(err, salt) {

                            bcrypt.hash(newPassword, salt, function(err, hash) {

                                user.update({$set: {password: hash}}, function(err) {

                                    if (err) {
                                        res.status(403).send(err);
                                    } else {
                                        res.json({'status': 'success'});
                                    }
                                    
                                })

                            });

                        });
                    }
                });

            }
            
        });
    }
    else if(req.files != null) {

        User.findOne({_id: userId}, function(err, user) {

            if (err || user == null) {
                res.status(404).send('Invalid login')
            } else {

                user.update({$set: {photo: config.domain + config.image_bucket +'/'+ req.key}}, function(err) {

                    if (err) {
                        res.status(403).send(err);
                    } else {
                        res.json({'status': 'success', 'message': 'upload_success'});
                    }

                });

            }
        });

    }
    else
        res.status(405).send('Missing Parameter');
}

exports.resetPassword = function(req, res) {

    var forgot = require('password-reset')({
        uri : 'http://localhost/radioish/password_reset',
        from : 'password-robot@localhost',
        host : 'localhost', port : 25,
    });

    var email = req.body.email;
    var reset = forgot(email, function (err) {
        if (err) res.end('Error sending message: ' + err)
        else res.end('Check your inbox for a password reset message.')
    });

     reset.on('request', function (req_, res_) {
        req_.session.reset = { email : email, id : reset.id };
        fs.createReadStream(__dirname + '/forgot.html').pipe(res_);
    });
    // reset.on('request', function (req_, res_) {
    //     req_.session.reset = { email : email, id : reset.id };
    //     fs.createReadStream(__dirname + '/forgot.html').pipe(res_);
    // });
    // var template = handlebars.compile([
    //     '<p>You requested a password reset for the following account(s).</p>',
    //     '<ul>',
    //     '{{#each resets}}',
    //         '<li>{{name}}: <a href="{{url}}">{{url}}</a></li>',
    //     '{{/each}}',
    //     '</ul>'
    // ].join('\n'));

    // passReset.sendEmail(function(email, resets, callback) {
    //     mailer.send({
    //         to: req.body.email,
    //         from: 'noreply@example.com',
    //         subject: 'password reset',
    //         body: template({ resets: resets })
    //     });
    //     callback({"status": "success"});
    // });
}

exports.deleteUser = function(req, res) {
    var userId = new ObjectId(req.user._id),
        type = req.user.type;

    if (type == "admin") {
        res.status(403).send('Could not delete super admin');
        return;
    }

    User.findOne({_id: userId}, function(err, user) {
        if (err || user == null){
            res.status(404).send(err);
        } else {

            user.remove(function(err) {

                if (err) {
                    res.status(400).send(err);
                } else {
                    res.json({'status': 'success'});
                }

            });

        }
    }); 
}

exports.getMe = function(req, res) {
    var userId = new ObjectId(req.user._id);
    User.findOne({_id: userId}, {'password': false})
        .populate('following')
        .populate('followers')
        .lean()
        .exec(function(err, user) {

            if (err || user == null) {
                res.status(404).json({"status": 'failed'});
            } else {
                Post.find({user: userId}, function(err, posts) {

                    if (err) {
                        res.status(404).json({"status": 'failed'});
                    } else {
                        user.posts = posts;
                        res.json(user)
                    }

                });
            }

    });
}

exports.getUser = function(req, res) {
    var o_id = new ObjectId(req.params.id);
    User.findOne({_id: o_id}, {'password': false})
        .populate('following')
        .populate('followers')
        .lean()
        .exec(function(err, user) {

            if (err || user == null) {
                res.status(404).json({"status": 'failed'});
            } else {
                Post.find({user: o_id}, function(err, posts) {

                    if (err) {
                        res.status(404).json({"status": 'failed'});
                    } else {
                        user.posts = posts;
                        res.json(user)
                    }

                });
            }

    });
}

exports.getAll = function(req, res) {
    var skip = req.query.skip,
        limit = req.query.limit;
    if (isNaN(skip)) { skip = 0; }
    if (isNaN(limit)) { limit = config.page_size; }

    User.find({}, {
        'password': false
    }, {
        skip : parseInt(skip), 
        limit : parseInt(limit)
    }, function(err, users) {
        if (err) {
            res.status(400).send(err);
            return;
        }

        res.json(users);
    });
}

exports.getTimeline = function(req, res) {
    var users = [], followingPosts = [];
    var userId = new ObjectId(req.user._id);

    User.findOne({_id: userId}, {'password': false})
    .populate('following')
    .exec(function(err, user) {
        if (err || user == null) {
            res.status(404).send("Invalid user id");
        } else {

            Post.find({user: {$in : user.following}})
            .populate('user')
            .exec(function(err, posts) {
                if (err) {
                    res.status(404).send("Invalid user id");
                } else {
                    res.json(posts);
                }
            });

        }
    });

}

exports.setFollow = function(req, res) {

    var userId = new ObjectId(req.user._id),
        followUserId = new ObjectId(req.params.id);

    if (followUserId == '' || followUserId == null || userId == followUserId) {
        res.status(403).send('Unable to Follow');
        return;
    }

    User.findOne({_id : userId}, function(err, user) {
        if (err || user == null || user.following.indexOf(followUserId) > -1) {
            res.status(403).send('Unable to Follow');
            return;
        }

        user.following.push(followUserId);
        user.update({$set: {following: user.following}}, function(err) {

            User.findOne({_id : followUserId}, function(err, followingUser) {
                if (err || followingUser == null) {
                    res.status(404).send('Invalid login');        
                } else {

                    followingUser.followers.push(userId);
                    followingUser.update({$set: {followers: followingUser.followers}}, function(err) {
                        res.json({"status" : 'success'});

                        var notification = Notification({

                            notificationType: 4,
                            message: "just started following you.",
                            fromUser: userId,
                            toUser: followUserId

                        });

                        notificationHandler.sendNotificationWithSenderName(notification, followingUser.deviceToken, user.name, function(err) {

                            console.log(err);

                        });

                    });

                }
            });

        });

    });

}

exports.setUnfollow = function(req, res) {
        var userId = new ObjectId(req.user._id),
        followUserId = new ObjectId(req.params.id);

    if (followUserId == '' || followUserId == null || userId == followUserId) {
        res.status(404).send('Unable to unfollow');
        return;
    }

    User.findOne({_id : userId}, function(err, user) {
        if (err || user == null) {
            res.status(404).send('Unable to unfollow');
            return;
        }

        var idx = user.following.indexOf(followUserId);
        if (idx == -1) {
            res.status(404).send('Unable to unfollow');
            return;   
        }

        user.following.splice(idx, 1);
        user.update({$set: {following: user.following}}, function(err) {

            User.findOne({_id : followUserId}, function(err, followingUser) {
                if (err || followingUser == null) {
                    res.status(404).send('Unable to unfollow');
                    return;
                }

                var idx = followingUser.followers.indexOf(userId);
                if (idx == -1) {
                    res.status(404).send('Unable to unfollow');
                    return;
                }

                followingUser.followers.splice(idx, 1);
                followingUser.update({$set: {followers: followingUser.followers}}, function(err) {
                    res.json({"status" : 'success'});
                });
            });

        });

    });

}

exports.getRecommendedUsers = function(req, res) {
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
                        recommendedIds = recommendedIds.concat(followingUsers[i].following);
                    }

                    recommendedIds = recommendedIds.filter(function(item, index, inputArray){
                        return (inputArray.indexOf(item) == index) && !item.equals(userId) && (user.following.indexOf(item) == -1);
                    });

                    User.find({_id: {$in: recommendedIds}}, {'password': false}, function(err, recommendedUsers) {
                        if (err) {
                            res.status(400).send(err);
                        } else {
                            res.json(recommendedUsers);
                        }
                    });
                }             

            });
        }

    });
}

exports.putDeviceToken = function(req, res) {

    var userId = new ObjectId(req.user._id),
        deviceToken = req.body.deviceToken;

    if (deviceToken == '' || deviceToken == null) {

        res.status(400).send(err);

    } else {

        User.findOne({_id: userId}, function(err, user) {

            if (err || user == null) {
                res.status(400).send(err)
            } else {

                user.update({$set: {deviceToken: deviceToken}}, function(err) {

                    if (err) {
                        res.status(400).send(err)    
                    } else {
                        res.json({"status": 'success'});
                    } 

                });

            }

        });

    }

}

function checkAdminDuplication(req, callback){
    User.findOne({email: req.body.email}, function(err, user) {
        if (err){
            callback({status: 'error'})
            return;
        }
        if (user){
            callback(user)
            return;
        }        
        callback({status: 'ok'})
    });
}