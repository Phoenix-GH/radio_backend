var mongoose     = require('mongoose');
var Schema       = mongoose.Schema,
    ObjectId 	 = Schema.ObjectId;

var notificationSchema = new Schema({

	notificationType: Number,
    message: {type: String, default: ""},
    broadcast: {type: Schema.Types.ObjectId, ref: 'Post'},
    fromUser: {type: Schema.Types.ObjectId, ref: 'User'},
    toUser: {type: Schema.Types.ObjectId, ref: 'User'},
    isRead: {type: Boolean, default: false},
    meta: mongoose.Schema.Types.Object

}, {collection: 'notifications' });

module.exports = mongoose.model('Notification', notificationSchema);


/// like: 1, comment: 2, new broadcast: 3, new follower: 4, following request: 5