var mongoose     = require('mongoose');
var Schema       = mongoose.Schema,
    ObjectId     = Schema.ObjectId,
    Meta         = require('../meta/meta.model').metaSchema,
    User         = require('../userservices/userservices.model').userSchema;

var postSchema = new Schema({
    
	audio: String,
  	meta: mongoose.Schema.Types.Object,
    play_count: Number,
    title: String,
    description: String,
    author: String,
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
    comments_count: {type: Number, default: 0}

}, { collection: 'posts' });

module.exports = mongoose.model('Post', postSchema);