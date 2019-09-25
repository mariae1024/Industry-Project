const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var Recaptcha = require('recaptcha-verify');
const multer = require('multer');
const crypto = require('crypto');


//gradforce.co.nz@gmail.com
//Aspire2gf


var recaptcha = new Recaptcha({
secret: '6LfzyJgUAAAAAIHX3I9UXa1W-873XGdL2LYfCwV8',
verbose: false
});

const User = require("../models/user");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './logo/');
  },
  //at the end of destination we have to execute the callback
  //into callback we pass an error 'null' and the destination where the file has to be saved
  filename: function (req, file, cb) {
      cb(null, file.originalname)

  }
})

const fileFilter = (req, file, cb) => {

  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ||  file.mimetype === 'image/jpg') { //filefilter by type of file 
      //accept file (save into folder or database)
      cb(null, true);
  } else {
      //reject a file or do not save it
      cb(null, false);
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
      fileSize: 1024 * 1024 * 200
  },
  dest: './logo/'
});

router.post("/signup", upload.single('image'), (req, res, next) => {
User.find({
email: req.body.email
})
.exec()
.then(user => {
if (user.length >= 1) {
return res.status(409).json({
message: "Mail exists"
});
} else {
bcrypt.hash(req.body.password, 10, (err, hash) => {
if (err) {
return res.status(500).json({
error: err
});
} else {
const user = new User({
_id: new mongoose.Types.ObjectId(),
email: req.body.email,
password: hash,
companyName: req.body.companyName,
contactName: req.body.contactName,
url: req.body.url,
phoneNumber: req.body.phoneNumber,
image: req.file.path,

});
user
.save()
.then(result => {
console.log(result);
res.status(201).json({
message: "User created"
});
})
.catch(err => {
console.log(err);
res.status(500).json({
error: err
});
});
}
});
}
});
});

router.post("/login", (req, res, next) => {

var userResponse = req.body['g-recaptcha-response'];
console.log(userResponse);

User.find({
email: req.body.email
})
.exec()
.then(user => {

if (user.length < 1) { // return res.status(401).json({ // message: "Auth failed" // }); 
  var message="failed user" ;
  res.redirect('/users/log_in/?message=' + message + '#login' );
 } 
 bcrypt.compare(req.body.password, user[0].password,
  (err, result)=> { //error during comparison of password process
  if (err) {
  // return res.status(401).json({
  // message: "Auth failed"
  // });
  var message = "failed";
  res.redirect('/users/log_in/?message=' + message + '#login');
  }
  if (result) {
  const token = jwt.sign({
        email: user[0].email,
        userId: user[0]._id
  },
  process.env.JWT_KEY, {
  expiresIn: "1h"
  })
  if (!userResponse) {
  var message = "robot user";
  return res.redirect('/users/log_in/?message=' + message + '#login');
  } else {
  console.log('success');
  res.render("../views/post_a_job", {
  user: user[0]
  });
  }

  // recaptcha.checkResponse(userResponse, (error, response) => {
  // if(error){
  // // an internal error?
  // res.status(401).render('400', {
  // message: err
  // });
  // }else {

  // if(response.success){
  // console.log('success');
  // res.render("../views/post_a_job");
  // // return res.status(200).json({
  // // message: "Auth successful",
  // // token: token
  // // });
  // // save session.. create user.. save form data.. render page, return json.. etc.
  // }else{
  // var message = "robot user";
  // res.redirect('/users/log_in/?message=' + message + '#login');
  // // show warning, render page, return a json, etc.
  // }

  // }


  // })
  } else {
  // res.status(401).json({
  // message: "Auth failed"
  // });
  // console.log('failed');
  var message = "failed password";
  res.redirect('/users/log_in/?message=' + message + '#login');

  }

  });
  })
  .catch(err => {
  console.log(err);
  res.status(500).json({
  error: err
  });
  });
  });

  router.post("/passrecovery", (req,res,next)=>{
    async.waterfall[(User.find({
      email: req.body.email
      })
      .exec()
      .then(user => {
        //console.log(user)
        if(user.length == 0) {
          var message = "User Not found";
          res.redirect('/users/fpassword/?message=' + message + '#forgotpass');
           
        } else {
          res.send("Users found");
          //create token
          var token;
          crypto.randomBytes(20, function (err, buf) {
          token = buf.toString('hex');
         
          });
          user.tempToken = token;
          user.tempTime = Date.now() + 3600000; // 1 hour
          
      
          user.save(function (err) {
            done(err, token, user);
          });


        }
      })
    )]
  });

  router.delete("/:userId", (req, res, next) => {
  User.remove({
  _id: req.params.userId
  })
  .exec()
  .then(result => {
  res.status(200).json({
  message: "User deleted"
  });
  })
  .catch(err => {
  console.log(err);
  res.status(500).json({
  error: err
  });
  });
  });

  router.get("/log_in", (req, res) => {

  var passedVariable = req.query.message;
  res.render("../views/gradforce", {
  message: passedVariable
  });

  });

  router.get("/fpassword", (req, res) => {

    
    var passedVariable = req.query.message;
    res.render("../views/forgotPassword",{
    message: passedVariable});
    });

  module.exports = router;