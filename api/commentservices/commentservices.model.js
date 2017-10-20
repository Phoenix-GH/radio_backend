var mongoose     = require('mongoose');
var Schema       = mongoose.Schema,
    ObjectId 	 = Schema.ObjectId;

var commentSchema = new Schema({
    content: {type: String, default: ""},
    post: {type: Schema.Types.ObjectId, ref: 'Post'},
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    meta: mongoose.Schema.Types.Object
}, {collection: 'comments' });

module.exports = mongoose.model('Comment', commentSchema);