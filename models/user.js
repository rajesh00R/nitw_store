var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var usercart =new Schema({
  name: {type: String},
  category: {type: String},
  price: {type: Number},
  proimg: {data: Buffer ,type: String}
}
);
var Users = new Schema(
  {
    name: {type: String, required: true},
    email: {type: String, required: true,unique:true,trim:true},
    password: {type: String, required: true},
    address: {city:String,state:String},
    phone: {type: Number, required: true,unique:true},
    cart: [usercart]
  }
);


//Export model
module.exports = mongoose.model('user', Users);
