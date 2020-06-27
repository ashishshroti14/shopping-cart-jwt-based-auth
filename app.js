var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressHbs = require('express-handlebars')
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var mongoose = require('mongoose');
var session = require('express-session')
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var  MongoStore = require('connect-mongo')(session);
var jwt = require('jsonwebtoken');
var passportJWT = require('passport-jwt');


mongoose.connect('mongodb+srv://ash:ash@cluster0-essn3.mongodb.net/cart?retryWrites=true&w=majority',{useNewUrlParser: true,  useUnifiedTopology: true });
require('./config/passport');

var app = express();

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs',  handlebars: allowInsecurePrototypeAccess(Handlebars)}));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(validator());
app.use(session({
  secret: 'mysupersecret' ,
   resave: false, 
   saveUninitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  cookie: {maxAge: 180*60*1000 }
}))

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.login = req.isAuthenticated();
  // function getCookie(jwt) {
  //   var name = jwt + "=";
  //   var decodedCookie = decodeURIComponent(req.cookie.jwt);
  //   var ca = decodedCookie.split(';');
  //   for(var i = 0; i <ca.length; i++) {
  //     var c = ca[i];
  //     while (c.charAt(0) == ' ') {
  //       c = c.substring(1);
  //     }
  //     if (c.indexOf(name) == 0) {
  //       return c.substring(name.length, c.length);
  //     }
  //   }
  //   return "";
  // }
  
  // res.locals.session = req.session;
  next();

})


app.use('/user', userRouter);
app.use('/', indexRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err.message);
  res.render('error');
});

// function isAuthenticated(req, res, next) {
//   console.log(req);
//   if (typeof req.cookie.jwt !== "undefined") {
//       // retrieve the authorization header and parse out the
//       // JWT using the split function
//       let token = req.cookie.jwt;
//       // let privateKey = fs.readFileSync('./private.pem', 'utf8');
//       // Here we validate that the JSON Web Token is valid and has been 
//       // created using the same private pass phrase
//       jwt.verify(token, 'secretkey',{expiresIn: '1h'} ,(err, user) => {
          
//           // if there has been an error...
//           if (err) {  
//               // shut them out!
//               res.status(500).json({ error: "Not Authorized" });
//               throw new Error("Not Authorized");
//           }
//           // if the JWT is valid, allow them to hit
//           // the intended endpoint
//           return next();
//       });
//   } else {
//       // No authorization header exists on the incoming
//       // request, return not authorized and throw a new error 
//       res.status(500).json({ error: "Not Authorized" });
//       throw new Error("Not Authorized");
//   }
// }




// app.use(function(req, res, next)  {
//   if(req.cookies.jwt){
//       var user = jwt.verify(req.cookies.jwt, 'secretkey',{expiresIn : '1h'}) 
//       console.log(user)
//   }
 
//   req.login(user,{session: false}, function(err) {
//       if (err) { return console.log('logged out', err) }
//       return console.log('logged in');
//     });
//     console.log(req.isAuthenticated())
    
//     next();
// })
// app.use('/shop', function(req, res, next)  {
//   if(req.cookies.jwt){
//       var user = jwt.verify(req.cookies.jwt, 'secretkey',{expiresIn : '1h'}) 
//       console.log(user)
//   }
 
//   req.login(user,{session: false}, function(err) {
//       if (err) { return console.log('logged out', err) }
//       return console.log('logged in');
//     });
//     console.log(req.isAuthenticated())
    
//     next();
// })

// var loginChecker = function(req, res, next)  {
//   if(req.cookies.jwt){
//       var user = jwt.verify(req.cookies.jwt, 'secretkey',{expiresIn : '1h'}) 
//       console.log(user)
//   }
 
//   req.login(user,{session: false}, function(err) {
//       if (err) { return console.log('logged out', err) }
//       return console.log('logged in');
//     });
//     console.log(req.isAuthenticated())
    
//     next();
// }


module.exports = app;
