var express = require('express');
var router = express.Router();

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
    res.render('reserve');
   
});


/* POST show hospital of selected region */
router.post('/', function(req, res) {
    region = "서울특별시 " + req.query.region;
    console.log(region);
    
    // pool.getConnection(function (err, connection)
    // {
    //   var sqlForGetHospital = "SELECT * FROM HOSPITAL WHERE LOCATION LIKE '?region?'%";
    //   connection.query(sqlForGetHospital, datas, function(err, rows){
    //       if(err) console.error("err : " + err);
    //       console.log("rows: " + JSON.stringify(rows));
  
    //       res.redirect('/');
    //       connection.release();
    //   });

    // });

    
});





module.exports = router;
