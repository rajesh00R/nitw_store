var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var pro =new Schema({
  name: {type: String},
  category: {type: String},
  price: {type: Number},
  proimg: {data: Buffer ,type: String}
});
var Orders = new Schema(
  {
    user_name: {type: String, required: true},
    user_email: {type: String, required: true},
    address: {room_no:String,hostel:String},
    phone: {type: Number, required: true},
    total_amount: {type: Number, required: true},
    timestamp :{type : Date , default : Date.now},
    delivered : {type : Boolean, required :true},
    payment : {type : Boolean, required :true},
    products: [pro]
  }
);


//Export model
module.exports = mongoose.model('order', Orders);