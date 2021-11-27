var express = require('express');
var router = express.Router();
var firebase = require('firebase');
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


/* firebase Web-App Configuration */
var firebase_config = {
  apiKey: "AIzaSyCE59at8BFrqn84RG63hn1uS_NhNrnPuso",
  authDomain: "lloginexample.firebaseapp.com",
  databaseURL: "https://lloginexample.firebaseio.com",
  projectId: "lloginexample",
  storageBucket: "lloginexample.appspot.com",
  messagingSenderId: "124851004056",
  appId: "1:124851004056:web:b58239166f9907ce3926ed",
  measurementId: "G-CR5E843ZEM"
};

/* Initialize Firebase */
if (!firebase.apps.length) {
  firebase.initializeApp(firebase_config);
}
var db = firebase.firestore();  //firestore

/* GET home page. */
router.get('/', function(req, res, next) {
  var user = firebase.auth().currentUser;

  if (user)
  {
    console.log("---------로그인 후 메인---------");   
    var uid = user.uid;
    var freeData_ref = db.collection("freeData").orderBy("good_num", "desc");
    var data_ref = db.collection("data").doc("allData");
    var user_ref = db.collection("user").doc(uid);

    var freebestpost = [];

    //자유게시판 좋아요 순으로 정렬
    freeData_ref.get().then((freepostsnap) => {
      if(freepostsnap){
        var i = 0;  //4개만 가져옴
        freepostsnap.forEach((freesnap) => {
          i++;
          if(i<=4){
            freebestpost.push(freesnap.data());
          }
        });
          
        // user 데이터로부터 지역 가져옴
        user_ref.get().then((doc) => {
          var data = doc.data();  //사용자 정보
          var region = data.id_region;
            
          res.render('main_login', {region: region, fbp: freebestpost});
        });
      }
    });
    
    
    

      
    
    
  }
  else
  {
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
router.get('/logout', function(req, res, next) {
  firebase.auth().signOut().then(function() {
    res.redirect('/');
  }).catch(function(err) {
    console.log(err);
  });
});

module.exports = router;
