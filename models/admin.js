var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var Admin = new Schema(
  {
    username: {type: String, required: true},
    password: {type: String, required: true}
  }
);


//Export model
module.exports = mongoose.model('admin', Admin);