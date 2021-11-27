var express = require('express');
var app2 = express();
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
require('date-utils');

app2.use(passport.initialize());
app2.use(passport.session());


const mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit : 100,
    host : 'localhost',
    user : 'root',
    port:3306,
    database:'vaccine',
    password : '1234'
});

var pass;


router.get('/emailLogin', function(req, res, next){
  res.render('login');
  console.log("ddrr")
  // console.log(res)
})

router.post('/emailLogin', passport.authenticate(
  'local',{failureRedirect: '/', failureFlash: true}),
  function(req, res) {
      console.log("ddrr")
      res.redirect('/');
  }

);

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
  }, function(req, username, password, done){
    var params = [username, password];
    pool.getConnection(function(err, connection){
      var sqlForLoggin = "select m1.ID from client as m1 where exists (select *  From client as q where q.ID = ? and q.PASSWORD = ?)";
      connection.query(sqlForLoggin, params, function(err, rows){
        console.log(username);
        console.log(rows.length)
        if(err) {return done(false, {
          'username': username,
          'password': password
        });}
        else {
          if(rows.length != 0){
            pass = true;
            console.log("로그인성공");
            return done(null, null);
          }
          //로그인 실패
          else {
            console.log("로그인실패");
            pass = false;
            return done(false, null);
          }
        }
      });
    });
}));

passport.serializeUser(function(user, done){
  done(null, user)
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});



module.exports = router;
