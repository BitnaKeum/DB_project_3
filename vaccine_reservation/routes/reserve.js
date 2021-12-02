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

    const hospital_code = req.query.hospital_code;

    var id = req.session.nickname;

    var CLIENT_NAME;
    var CLIENT_CODE;
    var AGE;

    var SHOT_DATE_1st;
    var SHOT_DATE_2st;
    var VACCINE_VACCINE_TYPE = "해당없음";

    var hospital_name;

    var VACCINE_ORDER = 1;
    var LAST_SHOT_DATE = "해당없음";

    var PHIZER_NUM = 0;
    var MODER_NUM = 0;
    var AZ_NUM = 0;

    var MUST_TPYE;



    pool.getConnection(function(err, connection){
    var sqlForGetClient = "SELECT CLIENT_CODE,CLIENT_NAME,AGE FROM CLIENT WHERE ID = ?";
    var sqlForGetShot = "SELECT SHOT_DATE_1st,SHOT_DATE_2st,VACCINE_VACCINE_TYPE FROM SHOT WHERE CLIENT_CLIENT_CODE =?";
    var sqlForGetHospital = "SELECT HOSPITAL_NAME FROM HOSPITAL WHERE HOSPITAL_CODE = ?";

    var sqlForGetHospital_RESIDUAL_VACCINE = 
    'SELECT V.vaccine_vaccine_TYPE, V.NUM FROM HOSPITAL AS H,VACCINE_RESIUAL AS V WHERE H.hospital_code = V.hospital_hospital_code and h.hospital_code =? ORDER BY V.vaccine_vaccine_TYPE'


    connection.query(sqlForGetClient,id, function(err, rows){
        if(err) console.error("error : " + err);

        CLIENT_CODE = rows[0].CLIENT_CODE;
        CLIENT_NAME = rows[0].CLIENT_NAME;
        AGE = rows[0].AGE;

        if(AGE < 50)
        {
            if( AGE < 30)
            {
                MUST_TPYE = '화이자';
            }

            else
            {
                MUST_TPYE = '화이자 또는 모더나';
            }
        }

        else
        {
            MUST_TPYE = '모든 종류 가능';
        }


           
    connection.query(sqlForGetShot,CLIENT_CODE, function(err, rows){
        if(err) console.error("error : " + err);


        console.log("rrrr", rows)
        if(rows != undefined && rows.length != 0)
        {
            SHOT_DATE_1st = rows[0].SHOT_DATE_1st
            SHOT_DATE_2st = rows[0].SHOT_DATE_2st
            VACCINE_VACCINE_TYPE = rows[0].VACCINE_VACCINE_TYPE

            if(SHOT_DATE_1st != undefined)
            {
                if(SHOT_DATE_2st != undefined)
                {
                    VACCINE_ORDER = '부스터 3';
                    LAST_SHOT_DATE = SHOT_DATE_2st;
                }

                else{
                    VACCINE_ORDER = 2;
                    LAST_SHOT_DATE = SHOT_DATE_1st;
                }
            }
            else
            {
                VACCINE_ORDER = 1;
                LAST_SHOT_DATE = "해당없음"
            }
        }

        connection.query(sqlForGetHospital_RESIDUAL_VACCINE,hospital_code, function(err, rows){
            if(err) console.error("error : " + err);
    
    
            for(var i=0;i <rows.length; i++)
            {
                if(i==0)
                {
                    MODER_NUM = rows[0].NUM
                }
    
                else if(i==1)
                {
                    AZ_NUM = rows[1].NUM
                }
    
                else
                {
                    PHIZER_NUM = rows[2].NUM
                }
            }
    
            console.log(rows)


            connection.query(sqlForGetHospital,hospital_code, function(err, rows){
                if(err) console.error("error : " + err);
                
                hospital_name = rows[0].HOSPITAL_NAME
        
                console.log("check",CLIENT_NAME, CLIENT_CODE, AGE,SHOT_DATE_1st, SHOT_DATE_2st,VACCINE_VACCINE_TYPE,hospital_name)
        
                res.render('reserve', {'CLIENT_NAME':CLIENT_NAME, CLIENT_CODE:CLIENT_CODE, AGE:AGE,SHOT_DATE_1st:SHOT_DATE_1st, 
                SHOT_DATE_2st:SHOT_DATE_2st,VACCINE_VACCINE_TYPE:VACCINE_VACCINE_TYPE,hospital_name:hospital_name, 
                VACCINE_ORDER:VACCINE_ORDER,LAST_SHOT_DATE:LAST_SHOT_DATE, MUST_TPYE:MUST_TPYE,
                MODER_NUM:MODER_NUM, AZ_NUM:AZ_NUM, PHIZER_NUM:PHIZER_NUM});

                connection.release();
           
                
            });
       
    
        });
    


    });

    
    });


});


});

// 아직은 위에서 SHOT정보가 CLIENT CODE를 토대로 제대로 안뽑혀서 처음 예약하는 사람에 한해서만 제대로 동작함
/* POST show hospital of selected region */
router.post('/', function(req, res) {

    const hospital_code = req.query.hospital_code
    const BookDate = req.body.BookDate
    const vaccine_type = req.body.vaccine_type

    var id = req.session.nickname;

    console.log("ID ",id )

    var CLIENT_CODE;
    var datas;

    pool.getConnection(function(err, connection){


        var sqlForGetClient = "SELECT CLIENT_CODE,CLIENT_NAME,AGE FROM CLIENT WHERE ID = ?";
        var sqlForGetShot = "SELECT SHOT_DATE_1st,SHOT_DATE_2st,VACCINE_VACCINE_TYPE FROM SHOT WHERE CLIENT_CLIENT_CODE =?";

        connection.query(sqlForGetClient,id, function(err, rows){
            if(err) console.error("error : " + err);
    
            CLIENT_CODE = rows[0].CLIENT_CODE;

            console.log("CODE : ",CLIENT_CODE)
            datas = [BookDate,hospital_code,CLIENT_CODE,vaccine_type];

            
            console.log("here",datas);

            connection.query(sqlForGetShot,CLIENT_CODE, function(err, rows){
                if(err) console.error("error : " + err);
                

                
                // 기존에 shot 테이블에 들어있는 경우
                if(rows != undefined && rows.length != 0)
                {
                    SHOT_DATE_1st = rows[0].SHOT_DATE_1st
                    SHOT_DATE_2st = rows[0].SHOT_DATE_2st
                    VACCINE_VACCINE_TYPE = rows[0].VACCINE_VACCINE_TYPE
        

                    console.log("rrrre ",SHOT_DATE_1st)
                    if(SHOT_DATE_1st != undefined)
                    {
                        if(SHOT_DATE_2st != undefined)
                        {
                            VACCINE_ORDER = '부스터 3';
                            LAST_SHOT_DATE = SHOT_DATE_2st;
                        }
        
                        else{
                            VACCINE_ORDER = 2;
                            LAST_SHOT_DATE = SHOT_DATE_1st;
                        }
                    }
                    else
                    {
                        VACCINE_ORDER = 1;
                        LAST_SHOT_DATE = "해당없음"
                    }


                    if(VACCINE_ORDER != "부스터 3"){

                        
                        if(SHOT_DATE_1st == null)
                        {
                            console.log("imphehe2323")
                        var sqlForInsertMember = "update (client as c join shot as s) set s.BOOK_DATE_1ST = ? where c.CLIENT_CODE = s.CLIENT_CLIENT_CODE and c.CLIENT_CODE = ?";
                        connection.query(sqlForInsertMember, [BookDate, CLIENT_CODE], function(err, rows){
                            if(err) console.error("err : " + err);
                            console.log("rows: " + JSON.stringify(rows));
    
                        });
                         }
    
                        else
                        {
                            console.log("imphehe")
                        var sqlForInsertMember = "update (client as c join shot as s) set s.BOOK_DATE_2ST = ? where c.CLIENT_CODE = s.CLIENT_CLIENT_CODE and c.CLIENT_CODE = ?";
                        connection.query(sqlForInsertMember, [BookDate, CLIENT_CODE], function(err, rows){
                            if(err) console.error("err : " + err);
                            console.log("rows: " + JSON.stringify(rows));
    
                        });
                          }
                    }
        
        
                }


                // 기존 shot 테이블에 없던 경우
                else
                {
                    var sqlForInsertMember = "insert into shot(BOOK_DATE_1ST,HOSPITAL_HOSPITAL_CODE,CLIENT_CLIENT_CODE,VACCINE_VACCINE_TYPE) values(?,?,?,?)";
                    connection.query(sqlForInsertMember, datas, function(err, rows){
                        if(err) console.error("err : " + err);
                        console.log("rows: " + JSON.stringify(rows));

                    });
                }

                
                res.redirect('/shot_info');
                connection.release();
            });



    
        });

    
    });

    
});





module.exports = router;
