var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
// var firebase = require('firebase');
require('date-utils');
var session = require('express-session');


const mysql      = require('mysql');
var pool = mysql.createPool({
    connectionLimit : 100,
    host : 'localhost',
    user : 'root',
    port:3306,
    database:'vaccine',
    password : '1234'
});


// /* firebase Web-App Configuration */
// var firebase_config = {
//   apiKey: "AIzaSyCE59at8BFrqn84RG63hn1uS_NhNrnPuso",
//   authDomain: "lloginexample.firebaseapp.com",
//   databaseURL: "https://lloginexample.firebaseio.com",
//   projectId: "lloginexample",
//   storageBucket: "lloginexample.appspot.com",
//   messagingSenderId: "124851004056",
//   appId: "1:124851004056:web:b58239166f9907ce3926ed",
//   measurementId: "G-CR5E843ZEM"
// };

// /* Initialize Firebase */
// if (!firebase.apps.length) {
//   firebase.initializeApp(firebase_config);
// }
// var db = firebase.firestore();  //firestore
// var fb_auth = firebase.auth();


router.get('/emailLogin', function(req, res, next){
  res.render('login');

  console.log(res)
})

router.post('/emailLogin', passport.authenticate(
  'local', {failureRedirect: '/emailLogin', failureFlash: true}),
  function(req, res) {
    console.log("user: " + req.user.id);
    if(pass)
      res.redirect('/');
    else
      res.render('login.ejs', {pass: pass});
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
        if(err) {return done(false, null);}
        else {
          for(var i=0;i <rows.length; i++)
            console.log(rows[i]);
          //로그인 성공
          if(rows.length > 0){
            pass = true;
            return done(null, {'user_id': username});
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

module.exports = router;
