var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var jwt = require('jsonwebtoken');
var passport = require('passport');



var Product = require('../models/product');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function (req, res, next) {
    loginChecker(req, res, next)
    var successMsg = req.flash('success')[0];
    Product.find(function (err, docs) {
        var productChunks = [];
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('shop/index', {title: 'Shopping Cart', products: productChunks, login: req.isAuthenticated(),  successMsg : successMsg , hasMessages:!successMsg });
        
    });
});

// router.get('/add-to-cart/:id', function(req, res, next) {
//     var productId = req.params.id;
//     var cart = new Cart(req.session.cart ? req.session.cart : {});

//     Product.findById(productId, function(err, product) {
//        if (err) {
//            return res.redirect('/');
//        }
//         cart.add(product, product.id);
//         req.session.cart = cart;
//         console.log(req.session.cart);
//         res.redirect('/');
//     });
// });

router.get('/add-to-cart/:id', cartValidator, (req, res, next) => { 
    loginChecker(req,res,next);
    var productId = req.params.id;   
    // req.cart.items.push(parseInt(req.query.id));
    var cart = new Cart(req.cart ? req.cart : {});

    Product.findById(productId, function(err, product) {
        if (err) {
            return res.redirect('/');
        }
         cart.add(product, product.id);
          req.cart = cart;
         console.log(req.cart.toJSON);
       

         console.log(JSON.stringify(req.cart));
         console.log(cart);
                   const newCart = jwt.sign({cart: JSON.stringify(req.cart) }, 
                             'secretkey', 
                             { expiresIn: '1h'});
        //console.log('Added to cart');
        
         res.cookie('cart', newCart, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60
        });

   

         console.log(`Item ID ${productId} added to cart.`);

          res.redirect('/');
          
     });
    
   
});



router.get('/reduce/:id',  cartValidator, (req, res, next) => {
    loginChecker(req,res,next);
  var productId = req.params.id;
  var cart = new Cart(req.cart);

  Product.findById(productId, function(err, product) {
      if (err) {
          return res.redirect('/');
      }
       cart.reduceByOne(product.id);
        req.cart = cart;
       console.log(req.cart.toJSON);
     

       console.log(JSON.stringify(req.cart));
       console.log(cart);
                 const newCart = jwt.sign({cart: JSON.stringify(req.cart) }, 
                           'secretkey', 
                           { expiresIn: '1h'});
      console.log('1');
       res.cookie('cart', newCart, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60
      });

 

       console.log(`Item ID ${productId} reduced by one`);

        res.redirect('/shopping-cart');
        
   });
})

router.get('/removeAll/:id',  cartValidator, (req, res, next) => {
    // loginChecker(req,res,next);
    var productId = req.params.id;
    var cart = new Cart(req.cart);

    Product.findById(productId, function(err, product) {
        if (err) {
            return res.redirect('/');
        }
         cart.removeAll(product.id);
          req.cart = cart;
         console.log(req.cart.toJSON);
       

         console.log(JSON.stringify(req.cart));
         console.log(cart);
                   const newCart = jwt.sign({cart: JSON.stringify(req.cart) }, 
                             'secretkey', 
                             { expiresIn: '1h'});
        console.log('1');
         res.cookie('cart', newCart, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60
        });

   

         console.log(`Item ID ${productId} revoved all.`);

          res.redirect('/shopping-cart');
          
     });
})

router.get('/shopping-cart', cartValidator ,function(req, res, next) {
    console.log('fty')
    loginChecker(req,res,next);
    
   if (!req.cart) {
       console.log('wrong', req.cart);
       console.log('wrong', res.cart);
       return res.render('shop/shopping-cart', {products: null, login: req.isAuthenticated()});
       
   } 
    var cart = new Cart(req.cart);
    res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice, login: req.isAuthenticated()});
});

router.get('/checkout', cartValidator,passport.authenticate('jwt', { session: false, failureRedirect : 'user/signin'  }), function(req, res, next) {
    loginChecker(req,res,next);
    if (!req.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg, login: req.isAuthenticated()});
});

router.post('/checkout', cartValidator,  passport.authenticate('jwt', { session: false, failureRedirect: 'user/signin' }),  function(req, res, next) {
    loginChecker(req,res,next);
    if (!req.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.cart);
    console.log('check13')
    
    var stripe = require('stripe')('sk_test_51GwsYZLeFUkQE3wuJxAYyoolkD4OkJBuzI0ScIIv33dsLq1sIPr6UVFudyZ0ZeQldArXxhpMqRnp9dybFNUK21Uj00nJ4RkYTU');

    stripe.charges.create({
        amount: cart.totalPrice * 100,
        currency: "inr",
        source: req.body.stripeToken, // obtained with Stripe.js
        description: "Test Charge"
    }, function(err, charge) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/checkout');
        }
        console.log('check12')
        console.log(req.user);
        var order = new Order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentId: charge.id
        });
        console.log(order,'order');
        order.save(function(err, result) {
            req.flash('success', 'Successfully bought product!');
            console.log('Successfully bought product!')
            res.clearCookie('cart')
            res.redirect('/');
        });
    }); 
});





// function isLoggedIn(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     res.redirect('/');
// }

function cartValidator(req, res, next) {
    if(!req.cookies.cart) {
        console.log(req.cookies.cart,'cart');
        req.cart = { items: [] };
    } else {
        try {
            req.cart = 
                JSON.parse(jwt.verify(req.cookies.cart, 
                    'secretkey',
                    { expiresIn: '1h'}).cart)
            ;
            console.log(req.cart,'cart');
        } catch(e) {
            console.log(e,'e');
            req.cart = { items: [] }; 
        }
    }

    next();
}

// var idValidator = (req, res, next) => {
//     if(!req.cookies.jwt) {
//         req.user = {};
//         // res.redirect('/');
        
//     } else {
//         try {
//             req.user =  JSON.parse(jwt.verify(req.cookies.jwt, 
//                                   'secretkey',
//                                   {expiresIn : '1h'}));
//              return next;
            
//         } catch(e) {
//             req.user = {}; 
//             // res.redirect('/');
//         }
//     }

//     next();

// }

var loginChecker = function(req,res,next)  {
      if(req.cookies.jwt){
          var user = jwt.verify(req.cookies.jwt, 'secretkey',{expiresIn : '1h'}) 
          console.log(user)
      }
     
      req.login(user,{session: false}, function(err) {
          if (err) { return console.log('logged out', err) }
          return console.log('logged in');
        });
        console.log(req.isAuthenticated())
        
      
    }




    


module.exports = router;