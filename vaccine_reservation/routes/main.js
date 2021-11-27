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



/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.session.is_logined)
    if(req.session.is_logined == true){
        console.log("---------로그인---------");   
        res.render('main_login', {name:req.session.nickname});
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










/* GET Logout function */
router.get('/logout', function (req, res) {
  req.session.is_logined = false;

  req.session.save(function(){
    res.redirect('/');
  })

});




module.exports = router;
