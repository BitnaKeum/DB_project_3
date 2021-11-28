var express = require('express');
var router = express.Router();
require('date-utils');


const mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit : 100,
    host : 'localhost',
    user : 'root',
    port: 3306,
    database:'vaccine',
    password : '1234'
});

// const dbconfig   = require('./database.js');
// const connection = mysql.createConnection(dbconfig);


/* GET register page */
router.get('/', function(req, res) {
    res.render('register');
});


// app.get('/users', (req, res) => {
//   connection.query('SELECT * from client', (error, rows) => {
//     if (error) throw error;
//     console.log('User info is: ', rows);
//     res.send(rows);
//   });
// });

/* POST nickname overlap check listener */
 router.get('/check', function(req, res){
     console.log(req.query.nickname);
     var param_nickname = req.query.nickname;
     var overlap_flag = false;
     db.collection("user").orderBy("id_nickName", "desc").get()
         .then((snapshot) => {
             var rows=[];
             snapshot.forEach((doc) => {
                 var childData = doc.data();
                 if(param_nickname == childData.id_nickName){
                 overlap_flag = true;
                 }
             });
             if(overlap_flag == true) {
                 console.log("같은 닉네임이 이미 존재합니다.");
                 res.json(1);
             }
             else {
                 console.log("해당 닉네임은 사용 가능합니다.");
                 res.json(0);
             }
         }
     );
 });

/* POST sign-up event listener */
router.post('/', function(req, res) {
    console.log(req,res)
    var param_name = req.body.userName;
    var param_ID = req.body.id;
    var param_email = req.body.email01 + "@" + req.body.email02;
    var param_age = req.body.age;
    var param_phone = req.body.phone;
    var param_ssn = req.body.ssn;
    var param_pw = req.body.userPw;
    var param_sex = req.body.sex;

    console.log(param_name,param_ssn,param_age,param_phone,param_sex,param_ID,param_pw,param_email)
    var datas = [param_name,param_ssn,param_age,param_phone,param_sex,param_ID,param_pw,param_email];
    console.log(param_email, " ", param_pw);


    pool.getConnection(function (err, connection)
    {
      var sqlForInsertMember = "insert into client(CLIENT_NAME,SSN,AGE,CLIENT_HP,SEX,ID,PASSWORD,EMAIL) values(?,?,?,?,?,?,?,?)";
      connection.query(sqlForInsertMember, datas, function(err, rows){
          if(err) console.error("err : " + err);
          console.log("rows: " + JSON.stringify(rows));
  
          res.redirect('/');
          connection.release();
        });
      });

});


module.exports = router;
