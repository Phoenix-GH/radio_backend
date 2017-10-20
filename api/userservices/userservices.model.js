var mongoose     = require('mongoose'),
    Schema       = mongoose.Schema,
	Post = require('../postservices/postservices.model').postSchema,
	User = require('./userservices.model').userSchema;
    
var userSchema = new Schema({

	name: String,
	password: String,
  	email: String,
    deviceToken: String,
    photo: {type: String, default: ""},
    phone: {type: String, default: ""},
    description: {type: String, default: ""},
    following: [{type: Schema.Types.ObjectId, ref: 'User'}],
    followers: [{type: Schema.Types.ObjectId, ref: 'User'}]
    
}, {collection: 'users' });

module.exports = mongoose.model('User', userSchema);