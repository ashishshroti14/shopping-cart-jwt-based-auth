var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var jwt = require('jsonwebtoken');


var Order = require('../models/order');
var Cart = require('../models/cart');
const User = require('../models/user');

var csrfProtection = csrf({cookie: true});
router.use(csrfProtection);

router.get('/profile', passport.authenticate('jwt', { session: false ,failureRedirect: 'user/signin'}), function (req, res, next) {
  //  loginChecker(req,res,next);
    console.log('hello')
    console.log(req.isAuthenticated());
   

    Order.find({user: req.user}, function(err, orders) {
        if (err) {
            console.log('check 6')
            console.log(err)
            return res.write('Error!');
        }
        var cart;
        console.log(orders);
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        console.log('check5')
        res.render('user/profile', { orders: orders , login: req.isAuthenticated()});
    });
});



router.get('/logout', passport.authenticate('jwt', { session: false , failureRedirect: '/'}), function (req, res, next) {
  // loginChecker(req,res,next);
    req.logout();
    res.locals.login = false;
    res.clearCookie('user');
    res.clearCookie('cart');
    res.clearCookie('jwt');
    

   console.log('check14')
    res.redirect('/');
});

router.use('/', function (req, res, next) {
  // loginChecker(req,res,next);
    next();
});

router.get('/signup', function (req, res, next) {
     var messages = req.flash('error');
    res.render('user/signup', {csrfToken: req.csrfToken() , login : false
        , messages: messages, hasErrors: messages.length > 0
    });
});

router.post('/signup',  (req, res) => {
    passport.authenticate(
      'local.signup',
      { session: false ,
        failureRedirect: '/user/signup',
        failureFlash: true
    
    },
      (error, user) => {
          console.log(user);
          console.log(req.user)
  
        if (error || !user) {
            console.log('me')
            console.log(user, error, 'error')
         return res.redirect('/user/signup');
        }
        console.log('me2')
  
        /** This is what ends up in our JWT */
        const payload = user ;
        console.log(user);
  
        /** assigns payload to req.user */
        req.login(payload, {session: false}, (error) => {
          if (error) {
            res.status(400).send({ error });
            console.log('check4')
          }
          console.log('check')
  
          /** generate a signed json web token and return it in the response */
          const token = jwt.sign(JSON.stringify(payload), 'secretkey');
          console.log('chech2')
          /** assign our jwt to the cookie */
          res.cookie('jwt', token, { httpOnly: true});
        //   res.status(200).send({ username });
        console.log('check3')
      
        res.redirect('/user/profile');
    
        });
      },
    )(req, res);
  }
// ,
//  function (req, res, next) {
//     if (req.session.oldUrl) {
//         var oldUrl = req.session.oldUrl;
//         req.session.oldUrl = null;
//         res.redirect(oldUrl);
//     } else {
//         res.redirect('/user/profile');
//     }
// }
)

router.get('/signin', function (req, res, next) {
    var messages = req.flash('error');
    res.render('user/signin', {csrfToken: req.csrfToken(), login: false
        , messages: messages, hasErrors: messages.length > 0
    });
});

// router.post('/signin', passport.authenticate('local', {
  
//     failureRedirect: '/user/signin',
//     // ,failureFlash: true
//     session: false
// }), function (req, res, next) {
//     // var tokenPayload = {username: req.newUser.username, password: req.newUser.password}
    
//     const user  = jwt.sign(req.user, 'secretkey', {expiresIn : '1h'});
//     res.cookie('user', user, {
//         httpOnly: true,
//         maxAge: 1000 * 60 * 60
//         });
//     // // if (req.session.oldUrl) {
//     // //     var oldUrl = req.session.oldUrl;
//     // //     req.session.oldUrl = null;
//     // //     res.redirect(oldUrl);
//     // } else {
//         var message = "Auth successful"
//         console.log = 'Auth Successful'
//         res.redirect('/user/profile');
    
// });

router.post('/signin', (req, res) => {
    passport.authenticate(
      'local.signin',
      { session: false ,
        failureRedirect: '/user/signin',
        failureFlash: true
    },
      (error, user) => {
          console.log(user)
  
          if (error || !user) {
            console.log('me')
            console.log(user, error, 'error')
         return res.redirect('/user/signin');
        }
        console.log('me2')
  
        /** This is what ends up in our JWT */
        const payload =  user;
        console.log(user);
  
        /** assigns payload to req.user */
        req.login(payload, {session: false}, (error) => {
          if (error) {
            console.log('check4')
           return res.status(400).send({ error });
           
          }
          console.log('check')
  
          /** generate a signed json web token and return it in the response */
          const token = jwt.sign(JSON.stringify(payload), 'secretkey');
          console.log('chech2')
          /** assign our jwt to the cookie */
          res.cookie('jwt', token, { httpOnly: true});
        //   res.status(200).send({ username });
        console.log('check3')
       
            return res.redirect('/user/profile');
        
        });
      },
    )(req, res);
  });
  
  var loginChecker = function(req, res, next)  {
      if(req.cookies.jwt){
          var user = jwt.verify(req.cookies.jwt, 'secretkey',{expiresIn : '1h'}) 
          console.log(user)
      }
     
      req.login(user,{session: false}, function(err) {
          if (err) { return console.log('logged out', err) }
          return console.log('logged in');
        });
        console.log(req.isAuthenticated())
        
        next();
    }
    



// function myAuthentication(req, res, next) {

//     passport.authenticate('jwt', { session: false })
    
// }

// function notLoggedIn(req, res, next) {
//     if (!req.isAuthenticated()) {
//         return next();
//     }
//     res.redirect('/');
// }

// var idValidator = (req, res, next) => {
//     if(!req.cookies.user) {
//         req.user = {};
//         res.redirect('/');
//     } else {
//         try {
//             req.user =  jwt.verify(req.cookies.user, 
//                                   'secretkey',
//                                   {expiresIn : '1h'});
           
//             return next;
            
//         } catch(e) {
//             req.user = {}; 
//             res.redirect('/');
//         }
//     }

//     next();

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

module.exports = router;


