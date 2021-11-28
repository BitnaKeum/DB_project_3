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
    port: 3306,
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
    region = req.query.region;
    console.log(region);
    
    var page = Number(req.query.page);
    if (!page) {    // 그냥 boardList로 이동할 경우 1페이지를 보여줌
        page = 1;
    }
    
    pool.getConnection(function (err, connection)
    {
        if (err) {throw err};
        
        var sqlForGetHospital = "SELECT * FROM HOSPITAL WHERE LOCATION LIKE '서울특별시 " + region + "%'";

        connection.query(sqlForGetHospital, function(err, rows){
            if(err) console.error("error : " + err);
            hospitals_str = JSON.stringify(rows);
            hospitals = JSON.parse(hospitals_str);
            res.render('hospital', {region: region, hospitals: hospitals, page: page}); 
        });
        
        connection.release();
    });
 
});

/* GET show hospital of selected region */
router.get('/hospital', function(req, res) {
    region = req.query.region;
    console.log(region);
    
    var page = Number(req.query.page);
    if (!page) {    // 그냥 boardList로 이동할 경우 1페이지를 보여줌
        page = 1;
    }
    
    pool.getConnection(function (err, connection)
    {
        if (err) {throw err};
        
        var sqlForGetHospital = "SELECT * FROM HOSPITAL WHERE LOCATION LIKE '서울특별시 " + region + "%'";

        connection.query(sqlForGetHospital, function(err, rows){
            if(err) console.error("error : " + err);
            hospitals_str = JSON.stringify(rows);
            hospitals = JSON.parse(hospitals_str);
            res.render('hospital', {region: region, hospitals: hospitals, page: page}); 
        });
        
        connection.release();
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
