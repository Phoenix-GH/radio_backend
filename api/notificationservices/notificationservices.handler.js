var User = require('../userservices/userservices.model.js'),
    Post = require('../postservices/postservices.model.js'),
    Comment = require('../commentservices/commentservices.model.js'),
    Notification = require('./notificationservices.model.js'),
    Meta = require('../meta/meta.model.js'),
    config = require('../../config'),
    aws    = require('aws-sdk'),
    ObjectId = require('mongoose').Types.Object,
    async = require('async');

exports.sendNotification = function(notification, deviceToken, callback) {

    aws.config.update({

        secretAccessKey: config.secretAccessKey,
        accessKeyId: config.accessKeyId,
        region: config.sns_region

    });

    notification.meta = new Meta({
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });

    notification.save(function(err) {

        callback(err);

        if (!err && deviceToken != null) {

            var sns = new aws.SNS();

            sns.createPlatformEndpoint({

                //PlatformApplicationArn: config.apns_arn_dev,
                PlatformApplicationArn: config.apns_arn_prod,
                Token: deviceToken

            }, function(err, data) {
                if (err) {
                    console.log(err.stack);
                } else {

                    var endpointArn = data.EndpointArn;

                    User.findOne({_id: notification.fromUser}, function(err, user) {
                        if (err || user == null) {
                            console.log(err.stack);
                        } else {
                            
                            var payload = {
                                default: 'Hello World',
                                APNS: {
                                    aps: {
                                        alert: user.name + " " + notification.message,
                                        sound: 'default',
                                        badge: 1
                                    }
                                }
                            };

                            payload.APNS = JSON.stringify(payload.APNS);
                            payload = JSON.stringify(payload);
                            
                            /****************
                            var payload = {
                                default: 'Hello World',
                                APNS_SANDBOX: {
                                    aps: {
                                        alert: user.name + " " + notification.message,
                                        sound: 'default',
                                        badge: 1
                                    }
                                }
                            };

                            payload.APNS_SANDBOX = JSON.stringify(payload.APNS_SANDBOX);
                            payload = JSON.stringify(payload);
                            *****************/

                            console.log(payload);

                            sns.publish({

                                Message: payload,
                                MessageStructure: 'json',
                                TargetArn: endpointArn

                            }, function(err, data) {
                                if (err) {
                                    console.log(err.stack);
                                }
                            });
                        }
                    });

                }
            });
        }

    });

}

exports.sendNotificationWithSenderName = function(notification, deviceToken, senderName, callback) {

    aws.config.update({

        secretAccessKey: config.secretAccessKey,
        accessKeyId: config.accessKeyId,
        region: config.sns_region

    });

    notification.meta = new Meta({
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });

    notification.save(function(err) {

        callback(err);

        if (!err && deviceToken != null) {

            var sns = new aws.SNS();

            sns.createPlatformEndpoint({

                //PlatformApplicationArn: config.apns_arn_dev,
                PlatformApplicationArn: config.apns_arn_prod,
                Token: deviceToken

            }, function(err, data) {
                if (err) {
                    console.log(err.stack);
                } else {

                    var endpointArn = data.EndpointArn;

                    
                    var payload = {
                        default: 'Hello World',
                        APNS: {
                            aps: {
                                alert: senderName + " " + notification.message,
                                sound: 'default',
                                badge: 1
                            }
                        }
                    };

                    payload.APNS = JSON.stringify(payload.APNS);
                    payload = JSON.stringify(payload);
                    
                    /****************
                    var payload = {
                        default: 'Hello World',
                        APNS_SANDBOX: {
                            aps: {
                                alert: senderName + " " + notification.message,
                                sound: 'default',
                                badge: 1
                            }
                        }
                    };

                    payload.APNS_SANDBOX = JSON.stringify(payload.APNS_SANDBOX);
                    payload = JSON.stringify(payload);
                    ********************/

                    console.log(payload);

                    sns.publish({

                        Message: payload,
                        MessageStructure: 'json',
                        TargetArn: endpointArn

                    }, function(err, data) {
                        if (err) {
                            console.log(err.stack);
                        }
                    });
                }
            });
        }

    });

}

exports.sendNotifications = function(notifications, c) {

    aws.config.update({

        secretAccessKey: config.secretAccessKey,
        accessKeyId: config.accessKeyId,
        region: config.sns_region

    });

    async.each(notifications, function(notification, callback) {
        notification.meta = new Meta({
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        notification.save(function(err) {
            if (err) {
                callback()
            } else {

                User.findOne({_id: notification.toUser}, function(err, user) {
                    if (err || user == null || user.deviceToken == null) {
                        callback()
                    } else {

                        var sns = new aws.SNS();

                        sns.createPlatformEndpoint({

                            PlatformApplicationArn: config.apns_arn_dev,
                            Token: user.deviceToken

                        }, function(err, data) {

                            if (err) {
                                callback()
                            } else {

                                var endpointArn = data.EndpointArn;

                                /****************
                                var payload = {
                                    default: 'Hello World',
                                    APNS: {
                                        aps: {
                                            alert: notification.message,
                                            sound: 'default',
                                            badge: 1
                                        }
                                    }
                                };

                                payload.APNS = JSON.stringify(payload.APNS);
                                payload = JSON.stringify(payload);
                                *****************/
                                var payload = {
                                    default: 'Hello World',
                                    APNS_SANDBOX: {
                                        aps: {
                                            alert: notification.message,
                                            sound: 'default',
                                            badge: 1
                                        }
                                    }
                                };

                                payload.APNS_SANDBOX = JSON.stringify(payload.APNS_SANDBOX);
                                payload = JSON.stringify(payload);

                                console.log(payload);

                                sns.publish({

                                    Message: payload,
                                    MessageStructure: 'json',
                                    TargetArn: endpointArn

                                }, function(err, data) {
                                    callback()
                                });
                            }

                        });

                    }
                });

            }

        });

    }, function(err) {
        c(err);
    });

}
