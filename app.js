var express =require('express');
var app = express();
var bodyParser=require('body-parser');
var mongoose = require('mongoose');

var fs = require('fs');
var session= require('express-session');
var product =require('./models/product');
var user =require('./models/user');
var admin =require('./models/admin');
var order =require('./models/order');
var urlencodedParser = bodyParser.urlencoded({ extended: false });


var port=process.env.PORT || 3001;



var db=mongoose.connect('mongodb://test00:test00@ds135413.mlab.com:35413/sampleproject',function(error){
    if(error) console.log(error);
    else console.log("Database Connected");
});




var sess;
var mes;
app.use('/assets', express.static(__dirname + '/public'));
app.set('view engine' , 'ejs');
app.use(session({
    secret : 'sagdjueyfd',
    resave : false,
    saveUninitialized: true
}));



app.post('/product',urlencodedParser, function(req,res){
    console.log(req.body);
    // var mydata=new product(req.body);
    var imgPath = req.body.proimg;
    var imgdata=fs.readFileSync(imgPath);
    var base64 = imgdata.toString('base64');
    var mydata=new product(
        {
            name : req.body.name,
            details : req.body.details,
            category : req.body.category,
            price : req.body.price,
            proimg : base64
        });
        
    mydata.save( function(err,result){
        if(err) throw err;
        else{
            res.redirect('/dashboard');
        }
    });
    
});
app.get('/view-cart',function(req,res){
    sess=req.session;
    mes="";
    if(sess.email){
    user.findOne({email: sess.email}).populate().exec(function(err,pro){
            if(err) console.log("Error");
            else  res.render('view-cart', {
                "list" : pro.cart,
                "sess" : sess
            });
       
    });
}
else{
    res.redirect('/log');
}
});

app.get('/Order',function(req,res){
    sess=req.session;
    order.find({},'_id user_name user_email phone address total_amount payment products',function(err,pro){
        if(err) console.log("Error");
        else{
            res.render('orders', {
                "list" : pro,
                "prod" : pro.products,
                "sess" : sess
            });
        }
        
       
    });
})
app.get('/place-order',function(req,res){
    sess=req.session;
    if(sess.email){
    user.findOne({email: sess.email}).populate().exec(function(err,pro){
            if(err) console.log("Error");
            else{
            var mydata=new order(
                {
                    user_name: sess.o_name,
                    user_email: sess.email,
                    address: {room_no: sess.room,hostel: sess.hostel},
                    phone: sess.phone,
                    total_amount: sess.price,
                    delivered : false,
                    payment : false,
                    transaction_id : "COD",
                    products: pro.cart,
                });
                
            mydata.save( function(err,result){
                if(err) console.log(err);
                else{
                    res.render('succ',{
                        "sess" :sess
                    });
                }
            });
        }
    });
    
}
else{
    return res.status(500).send();
}
});









app.get('/',function(req,res){
    sess=req.session;
    product.find({},'_id name category price proimg',function(err,pro){
        if(err) console.log("Error");
        else  res.render('index', {
            "list" : pro,
            "sess" : sess,
            "msg" : mes
        });
       
    });
    
});

app.get('/AddCart/:id',function(req,res,next){
    sess=req.session;
    var pId,pname,pcat,pprice,pimg;
    pId=req.params.id;
    console.log(pId);
    product.findOne({_id: pId}).populate('_id').exec(function(err,pro){
        console.log(pro.name+" "+pro.price+" "+pro.category);
        pname=pro.name;
        pprice=pro.price;
        pcat=pro.category;
        pimg=pro.proimg;
        if(sess.email){
        user.findOne({email: sess.email},function(err,usr){
            if(err){
                return res.status(500).send();
            }
            usr.cart.push({name: pname,category:pcat,price: pprice, proimg:pimg});
            usr.save( function(err,result){
                if(err) res.send(err);
                else{
                    mes="Added To Cart";
                   return res.redirect('/');
                     
                }
            });
        });
    }else{
        res.redirect('/log');
    }
    });
   
   
});

app.get('/Remove/:id',function(req,res,next){
    sess=req.session;
    pId=req.params.id;  
    user.findOne({email: sess.email}, function (err, usr) {
        if(err){
            return res.status(500).send();
        }
        if(!usr){
            return res.status(404).send();
        }     
        usr.cart.id(pId).remove();
        usr.save(function (err) {
          if (err) return handleError(err);
          res.redirect('/view-cart');   
        });
        
    });
   
});
/* Render All Pages */
app.get('/Admin',function(req,res){
    sess=req.session;
    res.render('admin-login');
   
});

app.get('/Address',function(req,res){
    sess=req.session;
   
    res.render('address',{
        "sess" :sess
    });
   
});

app.post('/Payment',urlencodedParser,function(req,res){
    sess=req.session;
    sess.o_name=req.body.o_name;
    sess.room=req.body.room;
    sess.hostel=req.body.hostel;
    sess.phone=req.body.phone;
    res.render('payment',{
        "sess": sess
    });
   
});
app.get('/Order-Placed',function(req,res){
    sess=req.session;
    res.render('succ',{
        "sess" :sess
    });
   
});
app.get('/logout',function(req,res){
    req.session.destroy();
    res.redirect('/');
})

app.get('/add',function(req,res){
    res.render('add');
});
app.get('/dashboard',function(req,res){
    res.render('admin');
});

app.get('/reg',function(req,res){
    res.render('reg',{
        "msg" : ""
    });
});
app.get('/log',function(req,res){
    res.render('login',{
        "msg" : ""
    });
});
/*Login and Registration */
app.post('/login',urlencodedParser, function(req,res){
    const userEmail=req.body.email;
    const pass=req.body.pass;
    sess=req.session;
    user.findOne({email: userEmail, password: pass},function(err,usr){
        if(err){
            return res.status(500).send();
        }
        if(!usr){
            return res.status(404).send();
        }
        sess.id=usr._id;
        sess.user=usr.name;
        sess.email=userEmail;
        res.redirect('/');
    });
});

app.post('/ad-login',urlencodedParser, function(req,res){
    // console.log(req.body);
    const usern=req.body.username;
    const pass=req.body.pass;
    sess=req.session;
    admin.findOne({username: usern, password: pass},function(err,ad){
        if(err){
            return res.status(500).send();
        }
        if(!ad){
            return res.status(404).send();
        }
        sess.id=ad._id;
        sess.username=ad.username;
        res.redirect('/dashboard');
    });
});

app.post('/register',urlencodedParser, function(req,res){
    // console.log(req.body);
    const userEmail=req.body.email;
    const pass=req.body.pass;
    const cpass=req.body.cpass;
    if(pass==cpass){
        var mydata=new user(
            {
                name : req.body.name,
                email : userEmail,
                phone : req.body.phone,
                password :pass
            });
            
        mydata.save( function(err,result){
            if(err) res.render('reg',{
                "msg" : "User Exist"
            })
            else{
                res.render('login',{
                    "msg" :"Registration Successful"
                })
            }
        });
    }else{
        res.render('reg',{
            "msg" : "Password Did not Match"
        })
    }
});










app.listen(port);