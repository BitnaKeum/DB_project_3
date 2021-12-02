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
    password : '1234',
    multipleStatements: true
});


/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.session.is_logined)
    if(req.session.is_logined == true){
        console.log("---------로그인---------");   
        pool.getConnection(function(err, connection){
            var sql = "select \
                sum(if(c.AGE between 10 and 19 , 1, 0)) as age_10, \
                sum(if(c.AGE between 20 and 29 , 1, 0)) as age_20, \
                sum(if(c.AGE between 30 and 39 , 1, 0)) as age_30, \
                sum(if(c.AGE between 40 and 49 , 1, 0)) as age_40, \
                sum(if(c.AGE between 50 and 59 , 1, 0)) as age_50, \
                sum(if(c.AGE between 60 and 69 , 1, 0)) as age_60 \
                from client as c join shot as s \
                where c.CLIENT_CODE = s.CLIENT_CLIENT_CODE; \
                select \
                sum(if(c.AGE between 10 and 19 , 1, 0)) as age_10, \
                sum(if(c.AGE between 20 and 29 , 1, 0)) as age_20, \
                sum(if(c.AGE between 30 and 39 , 1, 0)) as age_30, \
                sum(if(c.AGE between 40 and 49 , 1, 0)) as age_40, \
                sum(if(c.AGE between 50 and 59 , 1, 0)) as age_50, \
                sum(if(c.AGE between 60 and 69 , 1, 0)) as age_60 \
                from client as c join shot as s \
                where c.CLIENT_CODE = s.CLIENT_CLIENT_CODE and s.SHOT_DATE_2ST is not null; \
                select c.SEX as sex, count(*) as cnt \
                from client as c join shot as s \
                where c.CLIENT_CODE = s.CLIENT_CLIENT_CODE \
                group by c.SEX; \
                select c.SEX as sex, count(*) as cnt \
                from client as c join shot as s \
                where c.CLIENT_CODE = s.CLIENT_CLIENT_CODE and s.SHOT_DATE_2ST is not null \
                group by c.SEX; \
                select s.VACCINE_VACCINE_TYPE as vaccine_type, count(*) as cnt \
                from client as c join shot as s \
                where c.CLIENT_CODE = s.CLIENT_CLIENT_CODE \
                group by s.VACCINE_VACCINE_TYPE; \
                select s.VACCINE_VACCINE_TYPE as vaccine_type, count(*) as cnt \
                from client as c join shot as s \
                where c.CLIENT_CODE = s.CLIENT_CLIENT_CODE and s.SHOT_DATE_2ST is not null \
                group by s.VACCINE_VACCINE_TYPE; \
                select s.SHOT_DATE_1ST as shot_date, sum(count(*)) over (order by s.SHOT_DATE_1ST) as culcum_sum \
                from shot as s \
                where s.SHOT_DATE_1ST is not null \
                group by s.SHOT_DATE_1ST order by s.SHOT_DATE_1ST; \
                select s.SHOT_DATE_2ST as shot_date, sum(count(*)) over (order by s.SHOT_DATE_2ST) as culcum_sum \
                from shot as s \
                where s.SHOT_DATE_2ST is not null \
                group by s.SHOT_DATE_2ST order by s.SHOT_DATE_2ST; \
            ";
            var sql2 = "";

            connection.query(sql, function(err, rows){
                if (err) console.error("err: " + err);
                console.log("rows: " + JSON.stringify(rows));
    
                res.render("main_login", {title: 'main_login', name: req.session.nickname, rows:rows});
                connection.release();
            })
        })

    }
    else {
        console.log("---------유저없음---------");
        
        pool.getConnection(function(err, connection){
            var sqlForGetLocationGu = "select substring(h.LOCATION, 7, 3) as Location, count(*) as Cnt \
                        from hospital as h join vaccine_resiual as vr \
                        where h.HOSPITAL_CODE = vr.HOSPITAL_HOSPITAL_CODE \
                        group by substring(h.LOCATION, 7, 3)";
            connection.query(sqlForGetLocationGu, function(err, rows){
                if (err) console.error("err: " + err);
                console.log("rows: " + JSON.stringify(rows));
    
                res.render("main_logout", {title: 'main_logout', rows:rows});
                connection.release();
            })
        })
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
