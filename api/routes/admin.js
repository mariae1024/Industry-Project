const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Admin = require("../models/admin");
const Job = require("../models/job");
const User = require("../models/user");

//for email
var crypto = require('crypto');
var async = require("async");
const nodemailer = require("nodemailer");

router.post("/signup", (req, res, next) => {

    Admin.find({
            email: req.body.email
        })
        .exec()
        .then(admin => {
            if (admin.length >= 1) {
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
                        const admin = new Admin({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash,
                        });
                        admin
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: "Admin created"
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

router.get("/log_in", (req, res) => {

    var passedVariable = req.query.message;
    res.render("../views/adminLogin", {
        message: passedVariable
    });

});

router.post("/login", (req, res, next) => {

    Job.find()
        .exec()
        .then(jobs => {
            User.find()
            .exec()
            .then(users => {
                Admin.find({
                    email: req.body.email
                })
                .exec()
                .then(admin => {
        
                    if (admin.length < 1) {
        
                        var message = "failed admin";
                        res.redirect('/admin/log_in/?message=' + message);
                    }
                    bcrypt.compare(req.body.password, admin[0].password, (err, result) => { //error during comparison of password process
                        if (err) {
                            res.redirect('/admin/log_in/?message=' + message);
                        }
                        if (result) {
                            const token = jwt.sign({
                                    email: admin[0].email,
                                    userId: admin[0]._id
                                },
                                process.env.JWT_KEY, {
                                    expiresIn: "1h"
                                })
                            res.render("../views/adminPanel", {
                                admin: admin[0],
                                jobs: jobs,
                                users: users
                            });
                        } else {
                            var message = "failed password";
                            res.redirect('/admin/log_in/?message=' + message);
                        }
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
    
            })
    
            })
   
});

router.post("/download", (req, res) => {

    let file = req.body.fileToDownload;
    file = file.slice(8);
    console.log(file);
    //res.send("file: " + file)
    res.download("./uploads/" + file);


});

router.post("/quote", (req, res) => {
    var jobName = req.body.jobName;
    var description = req.body.description;
    console.log(description);
    res.render("../views/quote", { jobName: jobName, description: description });
});

router.get("/fpassword", (req, res) => {

    
    var passedVariable = req.query.message;
    var passedVariable2 = req.query.success;
    res.render("../views/adminForgotPass",{
    message: passedVariable,
    success: passedVariable2
  });
});

router.post("/passrecovery", (req,res,next)=>{
    async.waterfall([
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString('hex');
          //console.log(token);
          done(err, token);
        });
      },
      function (token, done) {
        Admin.findOne({
          email: req.body.email
        }, function (err, admin) {
          if (!admin) {
            var message = "The email doesn't exist. Please try again";
            return res.redirect('/admin/fpassword/?message=' + message + '#forgotpass');
          }
          admin.tempToken = token;
          admin.tempTime = Date.now() + 3600000; // 1 hour
          //res.send("Users found");
          admin.save(function (err) {
            done(err, token, admin);
          });
        });
      },
      function (token, admin, done) {
        var smtpTransport = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, // use SSL
          auth: {
            user: 'gradforce.co.nz@gmail.com',
            pass: 'Aspire2gf'
          }
        });
        var mailOptions = {
          to: admin.email,
          from: '"GradForce" <gradforce.co.nz@gmail.com>',
          subject: 'GradForce Password Reset',
          // text: 'Hi'
          text: 'Hi ' + admin.email + ', \n\n' + 'You are receiving this because you have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/admin/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n\n' +
            'Thanks, \n' +
            'GradForce Team'
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          console.log('mail sent');
          //req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], 
    function (err) {
      if (err) return next(err);
      var success = "We sent you an email with the instructions";
      return res.redirect('/admin/fpassword/?success=' + success + '#forgotpass');
    }
    );
    });

    router.get('/reset/:token', function (req, res) {
        Admin.findOne({
          tempToken: req.params.token,
          tempTime: {
            $gt: Date.now()
          }
        }, function (err, admin) {
          if (!admin) {
            //passwords do not match
          }
          res.render("../views/changepassAdmin", {
            token: req.params.token,
            message: null
          });
        });
      });

      router.post('/reset/:token', function (req, res) {


        async.waterfall([
          function (done) {
              
            const jobs = Job.find();
            const users = User.find();
            Admin.findOne({
              tempToken: req.params.token,
              tempTime: {
                $gt: Date.now()
              }
            }, function (err, admin) {
              if (!admin) {
                //req.flash("failure", "Token expired. Come back to Forget Password");
                var message = "Token expired. Come back to Forget Password";
                return res.render('../views/changepassAdmin', { 
                  message: message,
                  token:req.params.token});
                //res.send('Token expired');
                //return res.redirect('back');
              }
              //console.log(user);
              if (req.body.password === req.body.confirm) {
                //user.password = req.body.newpass;
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                  if (err) {
                  return res.status(500).json({
                  error: err
                  });
                  } else {
                  admin.password= hash;
                  admin.tempToken = undefined;
                  admin.tempTime = undefined;
                  admin.save(function (err) {
                    done(err, admin);
                    //console.log(user);
                    const token = jwt.sign({
                      email: admin.email,
                      userId: admin._id
                      },
                      process.env.JWT_KEY, {
                      expiresIn: "1h"
                      })
                      console.log('success');
                    //   console.log(jobs[0]);
                      res.render("../views/adminPanel", {
                        admin: admin, users: users, jobs: jobs
                      });
                
                    // req.logIn(user, function (err) {
                    //   done(err, user);
                    // });
                  
                  });
                }
                })
              } else {
                //passwords do not match
                //req.flash("failure", "The passwords do not match. Try again");
                //res.send('password dont match');
                //return res.redirect('back');
                var message = "Password doesn't match";
                return res.render('../views/changepass', { 
                  message: message,
                  token:req.params.token});
              }
            });
          },
          function (admin, done) {
            var smtpTransport = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 465,
              secure: true, // use SSL
              auth: {
                user: 'gradforce.co.nz@gmail.com',
                pass: 'Aspire2gf'
              }
            });
            var mailOptions = {
              to: admin.email,
              from: 'gradforce.co.nz@gmail.com',
              subject: 'Your password has been changed',
              text: 'Hi there,\n\n' +
                'This is a confirmation that the password for your account ' + admin.email + ' has just been changed.\n\n' +
                'Thanks, \n' +
                'GradForce Team'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
              done(err);
            });
          }
        ], 
        function (err) {
          res.render("../views/adminPanel", {
            admin: admin, users: users, jobs: jobs
            });
        }
        );
      });

module.exports = router;