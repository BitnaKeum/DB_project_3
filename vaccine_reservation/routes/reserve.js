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
    var sqlForGetShot = "SELECT SHOT_DATE_1st,SHOT_DATE_2st,VACCINE_VACCINE_TYPE FROM SHOT WHERE CLIENT_CLIENT_CODE = ?";
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


    });

    
    connection.query(sqlForGetShot,CLIENT_CODE, function(err, rows){
        if(err) console.error("error : " + err);

        console.log("CODE",typeof(CLIENT_CODE))
        console.log("CODE",typeof(11))
        console.log("compare : ", 11 == CLIENT_CODE)


        if(rows != undefined)
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


    });

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
   

    });

    connection.query(sqlForGetHospital,hospital_code, function(err, rows){
        if(err) console.error("error : " + err);
        
        hospital_name = rows[0].HOSPITAL_NAME

        console.log("check",CLIENT_NAME, CLIENT_CODE, AGE,SHOT_DATE_1st, SHOT_DATE_2st,VACCINE_VACCINE_TYPE,hospital_name)

        res.render('reserve', {'CLIENT_NAME':CLIENT_NAME, CLIENT_CODE:CLIENT_CODE, AGE:AGE,SHOT_DATE_1st:SHOT_DATE_1st, 
        SHOT_DATE_2st:SHOT_DATE_2st,VACCINE_VACCINE_TYPE:VACCINE_VACCINE_TYPE,hospital_name:hospital_name, 
        VACCINE_ORDER:VACCINE_ORDER,LAST_SHOT_DATE:LAST_SHOT_DATE, MUST_TPYE:MUST_TPYE,
        MODER_NUM:MODER_NUM, AZ_NUM:AZ_NUM, PHIZER_NUM:PHIZER_NUM});
   
        
    });
    
    
    connection.release();

});


});


/* POST show hospital of selected region */
router.post('/', function(req, res) {

    var id = req.session.nickname;

    var CLIENT_CODE;

    pool.getConnection(function(err, connection){
        var sqlForGetClient = "SELECT CLIENT_CODE,CLIENT_NAME,AGE FROM CLIENT WHERE ID = ?";
    
        connection.query(sqlForGetClient,id, function(err, rows){
            if(err) console.error("error : " + err);
    
            CLIENT_CODE = rows[0].CLIENT_CODE;
    
            res.render('shot_info', {client_code:CLIENT_CODE});
    
        });

    
    });

    connection.release();
    
});





module.exports = router;
