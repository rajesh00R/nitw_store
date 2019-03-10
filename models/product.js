var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Products = new Schema(
  {
    name: {type: String, required: true},
    details: {type: String, required: true},
    category: {type: String, required: true},
    price: {type: Number, required: true},
    proimg: {data: Buffer ,type: String}
  }
);


//Export model
module.exports = mongoose.model('Product', Products);