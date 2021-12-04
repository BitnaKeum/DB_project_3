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


/* 네비게이션 바에서 예약/접종 현황 조회 버튼 클릭 */
router.get('/', function(req, res, next) {
    user_id = req.session.nickname; // id
    
    pool.getConnection(function (err, connection)
    {
        if (err) {throw err};
        
        var sqlForClient = "SELECT CLIENT_CODE FROM CLIENT WHERE ID = ?";
        connection.query(sqlForClient, user_id, function(err, client_row) {
            client_code = client_row[0].CLIENT_CODE;
            
            var sqlForShot = "SELECT * FROM SHOT WHERE CLIENT_CLIENT_CODE = ?";
            connection.query(sqlForShot, client_code, function(err, shot_row){
                shot = shot_row[0];
                if (shot == null) { // 예약/접종 내역 없음
                    res.render('shot_info', {book_info_1st: null, book_info_2st: null, shot_info_1st: null, shot_info_2st: null}); 
                }
                else {
                    hospital_code = shot.HOSPITAL_HOSPITAL_CODE;
                    var sqlForHospital = "SELECT * FROM HOSPITAL WHERE HOSPITAL_CODE = ?";
                    connection.query(sqlForHospital, hospital_code, function(err, hospital_row){  
                        hospital = hospital_row[0];
                        book_info_1st = null;
                        book_info_2st = null;
                        shot_info_1st = null;
                        shot_info_2st = null;

                        if (shot.BOOK_DATE_1ST != null) {
                            if (shot.SHOT_DATE_1ST == null) { status = "예약"; }
                            else { status = "완료"; }
                            book_info_1st = {
                                'order': 1, 'date': shot.BOOK_DATE_1ST, 'vaccine_type': shot.VACCINE_VACCINE_TYPE, 'status': status, 'shot_code': shot.SHOT_CODE,
                                'hospital_name': hospital.HOSPITAL_NAME, 'hospital_location': hospital.LOCATION, 'hospital_hp': hospital.HOSPITAL_HP, 'hospital_code': hospital_code
                            };
                        }
                        if (shot.BOOK_DATE_2ST != null) {
                            if (shot.SHOT_DATE_2ST == null) { status = "예약"; }
                            else { status = "완료"; }
                            book_info_2st = {
                                'order': 2, 'date': shot.BOOK_DATE_2ST, 'vaccine_type': shot.VACCINE_VACCINE_TYPE, 'status': status, 'shot_code': shot.SHOT_CODE,
                                'hospital_name': hospital.HOSPITAL_NAME, 'hospital_location': hospital.LOCATION, 'hospital_hp': hospital.HOSPITAL_HP, 'hospital_code': hospital_code
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


/* 예약 취소 */
router.post('/cancel', function(req, res) {
    var order = req.body.order;
    var shot_code = req.body.shot_code;

    if (order == 1) {
        var sqlForCancel = "DELETE FROM SHOT WHERE SHOT_CODE = ?";
    }
    else {
        var sqlForCancel = "UPDATE SHOT SET BOOK_DATE_2ST = null WHERE SHOT_CODE = ?";
    }
    
    
    
    pool.getConnection(function (err, connection)
    {
        if (err) {throw err};

        connection.query(sqlForCancel, shot_code, function(err, rows){
            res.send("<script>alert('예약 취소가 완료되었습니다.');location.href=document.referrer;</script>");
            
        });
        connection.release();
    });
});




/* 예약 변경 */
//router.post('/modify', function(req, res) {
//    var order = req.body.order;
//    var shot_code = req.body.shot_code;
//    const hospital_code = req.body.hospital_code;
//    const BookDate = req.body.date;
//    const vaccine_type = req.body.vaccine_type;
//
//    
////    if (order == 1) {
////        var sqlForModify = "UPDATE SHOT SET BOOK_DATE_1ST = ? WHERE SHOT_CODE = ?";
////    }
////    else {
////        var sqlForModify = "UPDATE SHOT SET BOOK_DATE_2ST = ? WHERE SHOT_CODE = ?";
////    }
//
//    console.log(hospital_code);
//    console.log(BookDate);
//    console.log(vaccine_type);
//    
//    
//    var id = req.session.nickname;
//
//    console.log("ID ",id )
//
//    var CLIENT_CODE;
//    var datas;
//
//    pool.getConnection(function(err, connection){
//
//
//        var sqlForGetClient = "SELECT CLIENT_CODE,CLIENT_NAME,AGE FROM CLIENT WHERE ID = ?";
//        var sqlForGetShot = "SELECT SHOT_DATE_1st,SHOT_DATE_2st,VACCINE_VACCINE_TYPE FROM SHOT WHERE CLIENT_CLIENT_CODE =?";
//
//        connection.query(sqlForGetClient,id, function(err, rows){
//            if(err) console.error("error : " + err);
//    
//            CLIENT_CODE = rows[0].CLIENT_CODE;
//
//            console.log("CODE : ",CLIENT_CODE)
//            datas = [BookDate,hospital_code,CLIENT_CODE,vaccine_type];
//
//            
//            console.log("here",datas);
//
//            connection.query(sqlForGetShot,CLIENT_CODE, function(err, rows){
//                if(err) console.error("error : " + err);
//                
//
//                
//                // 기존에 shot 테이블에 들어있는 경우
//                if(rows != undefined && rows.length != 0)
//                {
//                    SHOT_DATE_1st = rows[0].SHOT_DATE_1st
//                    SHOT_DATE_2st = rows[0].SHOT_DATE_2st
//                    VACCINE_VACCINE_TYPE = rows[0].VACCINE_VACCINE_TYPE
//        
//
//                    console.log("rrrre ",SHOT_DATE_1st)
//                    if(SHOT_DATE_1st != undefined)
//                    {
//                        if(SHOT_DATE_2st != undefined)
//                        {
//                            VACCINE_ORDER = '부스터 3';
//                            LAST_SHOT_DATE = SHOT_DATE_2st;
//                        }
//        
//                        else{
//                            VACCINE_ORDER = 2;
//                            LAST_SHOT_DATE = SHOT_DATE_1st;
//                        }
//                    }
//                    else
//                    {
//                        VACCINE_ORDER = 1;
//                        LAST_SHOT_DATE = "해당없음"
//                    }
//
//
//                    if(VACCINE_ORDER != "부스터 3"){
//
//                        
//                        if(SHOT_DATE_1st == null)
//                        {
//                            console.log("imphehe2323")
//                        var sqlForInsertMember = "update (client as c join shot as s) set s.BOOK_DATE_1ST = ? where c.CLIENT_CODE = s.CLIENT_CLIENT_CODE and c.CLIENT_CODE = ?";
//                        connection.query(sqlForInsertMember, [BookDate, CLIENT_CODE], function(err, rows){
//                            if(err) console.error("err : " + err);
//                            console.log("rows: " + JSON.stringify(rows));
//    
//                        });
//                         }
//    
//                        else
//                        {
//                            console.log("imphehe")
//                        var sqlForInsertMember = "update (client as c join shot as s) set s.BOOK_DATE_2ST = ? where c.CLIENT_CODE = s.CLIENT_CLIENT_CODE and c.CLIENT_CODE = ?";
//                        connection.query(sqlForInsertMember, [BookDate, CLIENT_CODE], function(err, rows){
//                            if(err) console.error("err : " + err);
//                            console.log("rows: " + JSON.stringify(rows));
//    
//                        });
//                          }
//                    }
//        
//        
//                }
//
//
//                // 기존 shot 테이블에 없던 경우
//                else
//                {
//                    var sqlForInsertMember = "insert into shot(BOOK_DATE_1ST,HOSPITAL_HOSPITAL_CODE,CLIENT_CLIENT_CODE,VACCINE_VACCINE_TYPE) values(?,?,?,?)";
//                    connection.query(sqlForInsertMember, datas, function(err, rows){
//                        if(err) console.error("err : " + err);
//                        console.log("rows: " + JSON.stringify(rows));
//
//                    });
//                }
//
//                
//                res.redirect('/shot_info');
//                connection.release();
//            });
//
//
//
//    
//        });
//
//    
//    });   
//});


module.exports = router;
