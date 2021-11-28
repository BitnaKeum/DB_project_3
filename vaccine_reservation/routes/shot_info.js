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
    password : 'password1!'
});


router.get('/', function(req, res, next) {
    user_id = req.session.nickname;
    
    pool.getConnection(function (err, connection)
    {
        if (err) {throw err};
        
        
        var sqlForClient = "SELECT CLIENT_CODE FROM CLIENT WHERE ID = ?";
        connection.query(sqlForClient, user_id, function(err, client_row) {
            client_code = client_row[0].CLIENT_CODE;
            
            var sqlForShot = "SELECT * FROM SHOT WHERE CLIENT_CLIENT_CODE = ?";
            connection.query(sqlForShot, client_code, function(err, shot_row){
                shot = shot_row[0];
                if (shot.BOOK_DATE_1ST == null) {
                    res.render('shot_info', {book_info_1st: null, book_info_2st: null, shot_info_1st: null, shot_info_2st: null}); 
                }
                else {
                    hospital_code = shot.HOSPITAL_HOSPITAL_CODE;
                    var sqlForHospital = "SELECT * FROM HOSPITAL WHERE HOSPITAL_CODE = ?";
                    connection.query(sqlForHospital, hospital_code, function(err, hospital_row){  
                        hospital = hospital_row[0];
                        book_info_1st = {};
                        book_info_2st = {};
                        shot_info_1st = {};
                        shot_info_2st = {};

                        if (shot.BOOK_DATE_1ST != null) {
                            book_info_1st = {
                                'order': 1, 'date': shot.BOOK_DATE_1ST, 'vaccine_type': shot.VACCINE_VACCINE_TYPE, 
                                'hospital_name': hospital.HOSPITAL_NAME, 'hospital_location': hospital.LOCATION, 'hospital_hp': hospital.HOSPITAL_HP
                            };
                        }
                        if (shot.BOOK_DATE_2ST != null) {
                            book_info_2st = {
                                'order': 2, 'date': shot.BOOK_DATE_2ST, 'vaccine_type': shot.VACCINE_VACCINE_TYPE, 
                                'hospital_name': hospital.HOSPITAL_NAME, 'hospital_location': hospital.LOCATION, 'hospital_hp': hospital.HOSPITAL_HP
                            };
                        }
                        if (shot.SHOT_DATE_1ST != null) {
                            shot_info_1st = {
                                'order': 1, 'date': shot.SHOT_DATE_1ST, 'vaccine_type': shot.VACCINE_VACCINE_TYPE, 
                                'hospital_name': hospital.HOSPITAL_NAME, 'hospital_location': hospital.LOCATION, 'hospital_hp': hospital.HOSPITAL_HP
                            };
                        }
                        if (shot.SHOT_DATE_2ST != null) {
                            shot_info_2st = {
                                'order': 2, 'date': shot.SHOT_DATE_2ST, 'vaccine_type': shot.VACCINE_VACCINE_TYPE, 
                                'hospital_name': hospital.HOSPITAL_NAME, 'hospital_location': hospital.LOCATION, 'hospital_hp': hospital.HOSPITAL_HP
                            };
                        }

                        res.render('shot_info', {book_info_1st: book_info_1st, book_info_2st: book_info_2st, shot_info_1st: shot_info_1st, shot_info_2st: shot_info_2st}); 
                    });
                }
            });
            
        });
        
        connection.release();
    });
 
    
    
});


///* 예약/접종 현황 조회 */
//router.post('/', function(req, res, next) {
//    client_code = req.query.client_code;
//    
//    pool.getConnection(function (err, connection)
//    {
//        if (err) {throw err};
//        
//        var sqlForShot = "SELECT * FROM SHOT WHERE CLIENT_CLIENT_CODE=" + client_code;
//        console.log(sqlForShot);
//        
//        connection.query(sqlForShot, function(err, shot_row){
//            if (shot_row[1] == null) {
//                res.render('shot_info', {book_info_1st: null, book_info_2st: null, shot_info_1st: null, shot_info_2st: null}); 
//            }
//            
//            else {
//                hospital_code = shot_row[5];
//                var sqlForHospital = "SELECT * FROM HOSPITAL WHERE HOSPITAL_CODE=" + hospital_code;
//                console.log(sqlForHospital);
//                connection.query(sqlForHospital, function(err, hospital_row){            
//                    book_info_1st = {};
//                    book_info_2st = {};
//                    shot_info_1st = {};
//                    shot_info_2st = {};
//
//                    if (shot_row[1] != null) {
//                        book_info_1st = {
//                            'order': 1, 'date': shot_row[1], 'vaccine_type': shot_row[7], 
//                            'hospital_name': hospital_row[1], 'hospital_location': hospital_row[2], 'hospital_hp': hospital_row[3]
//                        };
//                    }
//                    if (shot_row[2] != null) {
//                        book_info_2st = {
//                            'order': 2, 'date': shot_row[2], 'vaccine_type': shot_row[7], 
//                            'hospital_name': hospital_row[1], 'hospital_location': hospital_row[2], 'hospital_hp': hospital_row[3]
//                        };
//                    }
//                    if (shot_row[3] != null) {
//                        shot_info_1st = {
//                            'order': 1, 'date': shot_row[3], 'vaccine_type': shot_row[7], 
//                            'hospital_name': hospital_row[1], 'hospital_location': hospital_row[2], 'hospital_hp': hospital_row[3]
//                        };
//                    }
//                    if (shot_row[4] != null) {
//                        shot_info_2st = {
//                            'order': 2, 'date': shot_row[4], 'vaccine_type': shot_row[7], 
//                            'hospital_name': hospital_row[1], 'hospital_location': hospital_row[2], 'hospital_hp': hospital_row[3]
//                        };
//                    }
//
//                    res.render('shot_info', {book_info_1st: book_info_1st, book_info_2st: book_info_2st, shot_info_1st: shot_info_1st, shot_info_2st: shot_info_2st}); 
//                });
//            }
//        });
//        
//        connection.release();
//    });
//});


/* POST show hospital of selected region */
router.post('/hospital', function(req, res) {
//    region = req.query.region;
//    console.log(region);
//    
//    var page = Number(req.query.page);
//    if (!page) {    // 그냥 boardList로 이동할 경우 1페이지를 보여줌
//        page = 1;
//    }
//    
//    pool.getConnection(function (err, connection)
//    {
//        if (err) {throw err};
//        
//        var sqlForGetHospital = "SELECT * FROM HOSPITAL WHERE LOCATION LIKE '서울특별시 " + region + "%'";
//
//        connection.query(sqlForGetHospital, function(err, rows){
//            if(err) console.error("error : " + err);
//            hospitals_str = JSON.stringify(rows);
//            hospitals = JSON.parse(hospitals_str);
//            res.render('hospital', {region: region, hospitals: hospitals, page: page}); 
//        });
//        
//        connection.release();
//    });
// 
});

/* GET show hospital of selected region */
router.get('/hospital', function(req, res) {
//    region = req.query.region;
//    console.log(region);
//    
//    var page = Number(req.query.page);
//    if (!page) {    // 그냥 boardList로 이동할 경우 1페이지를 보여줌
//        page = 1;
//    }
//    
//    pool.getConnection(function (err, connection)
//    {
//        if (err) {throw err};
//        
//        var sqlForGetHospital = "SELECT * FROM HOSPITAL WHERE LOCATION LIKE '서울특별시 " + region + "%'";
//
//        connection.query(sqlForGetHospital, function(err, rows){
//            if(err) console.error("error : " + err);
//            hospitals_str = JSON.stringify(rows);
//            hospitals = JSON.parse(hospitals_str);
//            res.render('hospital', {region: region, hospitals: hospitals, page: page}); 
//        });
//        
//        connection.release();
//    });
// 
});


module.exports = router;