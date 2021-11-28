var express = require('express');
var app = express();
var router = express.Router();


// var session = require('express-session');
// var FileStore = require('session-file-store')(session);
// app.use(session({
//   secret: 'asadlfkj!@#!@#dfgasdg',
//   resave: false,
//   saveUninitialized: true,
//   store:new FileStore()
// }))


// var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
// var flash = require('connect-flash');
require('date-utils');

// app.use(passport.initialize());
// app.use(passport.session());


var mysql = require('mysql');
const { response } = require('../app');
var pool = mysql.createPool({
    connectionLimit : 10,
    host : 'localhost',
    user : 'root',
    port:3306,
    database:'vaccine',
    password : 'password1!'
});

var pass;


router.get('/emailLogin', function(req, res){
  res.render('login');
})

router.post('/emailLogin', function(request, res){
  var post = request.body;
  var id = post.username;
  var password = post.password;

  var params = [id, password];
  pool.getConnection(function(err, connection){
    var sqlForLoggin = "select m1.ID from client as m1 where exists (select *  From client as q where q.ID = ? and q.PASSWORD = ?)";
    connection.query(sqlForLoggin, params, function(err, rows){
      console.log(id);
      console.log(rows.length)
      if(err) {console.log('err');}
      else {
        if(rows.length != 0){
          pass = true;
          console.log("로그인성공");

          request.session.is_logined = true;
          request.session.nickname = id;

          request.session.save(function(){
            res.redirect('/');
          })
        }
        //로그인 실패
        else {
          res.redirect('/');
          pass = false;
        }
      }
    });
  });
})

// passport.use(new LocalStrategy({
//   usernameField: 'username',
//   passwordField: 'password',
//   passReqToCallback: true
//   }, function(req, username, password, done){
//     var params = [username, password];
//     pool.getConnection(function(err, connection){
//       var sqlForLoggin = "select m1.ID from client as m1 where exists (select *  From client as q where q.ID = ? and q.PASSWORD = ?)";
//       connection.query(sqlForLoggin, params, function(err, rows){
//         console.log(username);
//         console.log(rows.length)
//         if(err) {return done(false, null);}
//         else {
//           if(rows.length != 0){
//             pass = true;
//             console.log("로그인성공");
//             return done(null, {'user_id': username});
//           }
//           //로그인 실패
//           else {
//             console.log("로그인실패");
//             pass = false;
//             return done(false, null);
//           }
//         }
//       });
//     });
// }));

// passport.serializeUser(function(user, done){
//   done(null, user)
// });
// passport.deserializeUser(function(user, done) {
//   done(null, user);
// });



module.exports = router;
