var express = require('express');
var router = express.Router();
require('date-utils');
var session = require('express-session');
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");



const mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit : 100,
    host : 'localhost',
    user : 'root',
    port:3306,
    database:'vaccine',
    password : '1234'
});

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return true;
  return false;
};


/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.user)
    if(isAuthenticated){
        console.log("---------로그인---------");   
        res.render('main_login');
    }
    else {
        console.log("---------유저없음---------");
        res.render('main_logout');
    }
});


/* POST show hospital of selected region */
router.post('/hospital', function(req, res) {
    region = "서울특별시 " + req.query.region;
    console.log(region);
    
    pool.getConnection(function (err, connection)
    {
      var sqlForGetHospital = "SELECT * FROM HOSPITAL WHERE LOCATION LIKE '?region?'%";
      connection.query(sqlForGetHospital, datas, function(err, rows){
          if(err) console.error("err : " + err);
          console.log("rows: " + JSON.stringify(rows));
  
          res.redirect('/');
          connection.release();
      });

    });

    
    
    
    
    
    
});









// var logout = function() {
//   return function (req, res, next) {
//       console.log("ger");
//       req.logout();
//       req.session.save(function(){
//         res.redirect('/');
//       });
    
//   };
// };


// router.get('/logout', (req,res)=>{
//       req.session = null
//       res.redirect('/');
// })

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var app2 = express();



app2.use(passport.initialize());
app2.use(passport.session());

/* GET Logout function */
router.get('/logout', function (req, res) {
  console.log("ghi2")
  req.session = null;
  console.log("ghi")
  res.redirect('/');
});


passport.serializeUser(function(user, done){
  done(null, user)
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});



module.exports = router;
