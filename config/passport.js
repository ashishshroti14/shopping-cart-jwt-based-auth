var passport = require('passport');
var passportJWT = require('passport-jwt');
var JWTStrategy = passportJWT.Strategy;
var ExtractJwt = passportJWT.ExtractJwt;

var User = require('../models/user');
const { verify } = require('jsonwebtoken');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user,done) => {
    done(null, user.id);
});

passport.deserializeUser((id,done) => {
    User.findById(id, (err,user) => {
        done(err, user);
    });
});

// passport.use('local.signup', new LocalStrategy({
//     usernameField: 'email',
//     passwordField: 'password',
//     passReqToCallback: true
// }, (req, email, password, done) => {
//     req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
//     req.checkBody('password', 'Invalid Password').notEmpty().isLength({min : 4});
//     var errors = req.validationErrors();
//     if (errors) {
//         var messages = [];
//         errors.forEach((error => {
//             messages.push(error.msg);
//         }));
//         return done(null, false
//             // , req.flash('error', messages)
//             );
//     }
//     User.findOne({'email': email}, (err,user) => {
//         if (err) {
//             console.log(err);
//             return done(err);
//         }
//         if (user) {
//             var messages = [];
//             messages.push('Email aready taken')
//             return done(null, false
//                 // , req.flash('error', messages)
//                  );
//         }
//         var newUser = new User();
//         newUser.email = email;
//         newUser.password = newUser.encryptPassword(password);
//         newUser.save((err, result) => {
//             if (err) {

//                 console.log(err, 'errrr');
//                 return done(err);
               
//             }
//             console.log ('hi');
//             return done(null, newUser);
//         });

//     })
// }));

// passport.use('local.signin', new LocalStrategy({
//     usernameField: 'email',
//     passwordField: 'password',
//     passReqToCallback: true
// }, (req, email, password, done) => {
//     req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
//     req.checkBody('password', 'Invalid Password').notEmpty();
//     var errors = req.validationErrors();
//     if (errors) {
//         var messages = [];
//         errors.forEach((error => {
//             messages.push(error.msg);
//         }));
//         return done(null, false
//             //, req.flash('error', messages)
//             );
//     }
//     User.findOne({'email': email}, (err,user) => {
//         if (err) {
//             console.log(err);
//             return done(err);
//         }
//         if (!user) {
//             var messages = [];
//             messages.push('No user found')
//             return done(null, false
//                 // , req.flash('error', messages)
//                  );
//         }
//         if(!(user.validPassword(password))){
//             var messages = [];
//             messages.push('Wrong Password')
//             return done(null, false, 
//                 // req.flash('error', messages)
//                  );
//         }
        
//             return done(null, user);
//         });

//     })
    

// )

passport.use('local.signin',new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },  (req, email, password, done) => {
    try {

    //     console.log('here2')
    // //   const user = User.findOne({'email': email});
    //   console.log(user,'hi')
    //   const passwordsMatch = user.validPassword;
    //     console.log('here')
    //   if (passwordsMatch) {
    //       console.log(user,'hi re')
    //     return done(null, user);
    //   } else {
    //       console.log('mismatch')
    //     return done('Incorrect Username / Password');
    //   }
    req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid Password').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach((error => {
            messages.push(error.msg);
        }));
        return done(null, false, req.flash('error', messages));
    }

    User.findOne({'email': email}, (err,user) => {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                if (!user) {
                    var messages = [];
                    messages.push('No user found')
                    console.log('No user found')
                    return done(null, false, req.flash('error', messages) );
                }
                if(!(user.validPassword(password))){
                    var messages = [];
                    messages.push('Wrong Password')
                    console.log('wrong password')
                    return done(null, false, req.flash('error', messages));
                }
                    
                    return done(null, user);
                });
    } catch (error) {
        var messages = [];
        messages.push(error);
        return done(null, false, req.flash('error', messages) );
    }
  }));

  passport.use('local.signup',new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },  (req, email, password, done) => {
    try {
      console.log('here2')
    // //   const user = User.findOne({'email': email});
    //   console.log(user,'hi')
    //   const passwordsMatch = user.validPassword;
    //     console.log('here')
    //   if (passwordsMatch) {
    //       console.log(user,'hi re')
    //     return done(null, user);
    //   } else {
    //       console.log('mismatch')
    //     return done('Incorrect Username / Password');
    //   }

    req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid Password').notEmpty().isLength({min : 4});
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach((error => {
            messages.push(error.msg);
        }));
        return done(null, false, req.flash('error', messages));

    }
    User.findOne({'email': email}, (err,user) => {
        console.log('check8')
                if (err) {
                    console.log(err);
                    return done(err);
                }
                console.log('check10')

                if (user) {
                    var messages = [];
                     messages.push('Email aready taken')
                    return done(null, false, req.flash('error', messages) );
                }

                if (!user) {
                    console.log('vheck 9')
                    var newUser = new User();
                    newUser.email = email;
                    newUser.password = newUser.encryptPassword(password);
                    newUser.save((err, result) => {
                        if (err) {
            
                            console.log(err, 'errrr');
                            return done(err);
                           
                        }
                        console.log ('hi');
                        console.log(newUser);
                        
                        return done(null, newUser);
                    });
                }
                // if(!(user.validPassword(password))){
                //     var messages = [];
                //     messages.push('Wrong Password')
                //     return done(null, false, 
                //         // req.flash('error', messages)
                //          );
                // }
                
                    // return done(null, user);
                });
    } catch (error) {
        var messages = [];
        messages.push(error);
        console.log(error)
        return done(null, false, req.flash('error', messages) );
    }
  }));

passport.use('jwt',new JWTStrategy({
    failureRedirect: 'user/signup',
    jwtFromRequest: req => req.cookies.jwt,
    secretOrKey: 'secretkey',
  },
  (jwtPayload, done) => {
      console.log('check 15')
    if (Date.now() > jwtPayload.expires) {
      return done('jwt expired');
    }
  
    
    //  console.log(JSON.parse(jwtPayload))
    
    return done(null, jwtPayload);
  }
));



// passport.use('jwt',new JWTStrategy({
//     jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
//     secretOrKey   : 'secretkey',
//     // passReqToCallback: true
// }, 
// function (jwtPayload, done) {

//     idValidator(jwtPayload);


//     //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
//     return User.findOne({'email': jwtPayload.email}, (err,user) => {
//         if (err) {
//             console.log(err);
//             return done(err);
//         }
//         if (!user) {
//             var messages = [];
//             messages.push('No user found')
//             return done(null, false, req.flash('error', messages) );
//         }
//         if(!(user.validPassword(password))){
//             var messages = [];
//             messages.push('Wrong Password')
//             return done(null, false, req.flash('error', messages) );
//         }
        
//             return done(null, user);
//         });
// }
// ));

var cookieExtractor = function(req, res, next) {
    var token = null;
    if (req && req.cookies) {
        req.token = req.cookies['jwt'];
    }
    return token;
};

var idValidator = (req, res, next) => {
    if(!req.token) {
        req.token = {};
        res.redirect('/');
    } else {
        try {
            req.jwtPayload =  jwt.verify(req.token, 
                                  'secretkey',
                                  {expiresIn : '1h'});
            return next;
            
        } catch(e) {
            req.user = {}; 
            res.redirect('/');
        }
    }

    next();

}