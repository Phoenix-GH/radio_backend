var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var metaSchema = new Schema({
	created_at: String,
	updated_at: {type: String, default: ""}
}, {collection: 'metas'});

module.exports = mongoose.model('Metas', metaSchema);
