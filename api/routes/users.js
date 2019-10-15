const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var Recaptcha = require('recaptcha-verify');

const multer = require('multer');
//for email
var crypto = require('crypto');
var async = require("async");
const nodemailer = require("nodemailer");


//gradforce.co.nz@gmail.com
//Aspire2gf


var recaptcha = new Recaptcha({
    secret: '6LfzyJgUAAAAAIHX3I9UXa1W-873XGdL2LYfCwV8',
    verbose: false

});

const User = require("../models/user");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './logo/');
    },
    //at the end of destination we have to execute the callback
    //into callback we pass an error 'null' and the destination where the file has to be saved
    filename: function(req, file, cb) {
        cb(null, file.originalname)

    }
})

const fileFilter = (req, file, cb) => {

    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') { //filefilter by type of file 
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

    //WARNING !!
    //captcha bypass

    var userResponse = true; //req.body['g-recaptcha-response'];
    console.log(userResponse);

    User.find({
            email: req.body.email
        })
        .exec()
        .then(user => {

            if (user.length < 1) { // return res.status(401).json({ // message: "Auth failed" // }); 
                var message = "failed user";
                res.redirect('/users/log_in/?message=' + message + '#login');
            }
            bcrypt.compare(req.body.password, user[0].password,
                (err, result) => { //error during comparison of password process
                    if (err) {
                        // return res.status(401).json({
                        // message: "Auth failed"
                        // });
                        var message = "failed";
                        res.redirect('/users/log_in/?message=' + message + '#login');
                    }
                    if (result) {
                        jwt.sign({
                            data: 'foobar'
                          }, 'secret', { expiresIn: '1h' });
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

router.post("/passrecovery", (req, res, next) => {
    async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    //console.log(token);
                    done(err, token);
                });
            },
            function(token, done) {
                User.findOne({
                    email: req.body.email
                }, function(err, user) {
                    if (!user) {
                        var message = "The email doesn't exist. Please try again";
                        return res.redirect('/users/fpassword/?message=' + message + '#forgotpass');
                    }
                    user.tempToken = token;
                    user.tempTime = Date.now() + 3600000; // 1 hour
                    //res.send("Users found");
                    user.save(function(err) {
                        done(err, token, user);
                    });

                });
            },
            function(token, user, done) {
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
                    to: user.email,
                    from: '"GradForce" <gradforce.co.nz@gmail.com>',
                    subject: 'GradForce Password Reset',
                    // text: 'Hi'
                    text: 'Hi ' + user.email + ', \n\n' + 'You are receiving this because you have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n\n' +
                        'Thanks, \n' +
                        'GradForce Team'
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    console.log('mail sent');
                    //req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                    done(err, 'done');
                });
            }
        ],
        function(err) {
            if (err) return next(err);
            var success = "We sent you an email with the instructions";
            return res.redirect('/users/fpassword/?success=' + success + '#forgotpass');
        }
    );
});

router.get('/reset/:token', function(req, res) {
    User.findOne({
        tempToken: req.params.token,
        tempTime: {
            $gt: Date.now()
        }
    }, function(err, user) {
        if (!user) {
            //passwords do not match
        }
        res.render("../views/changepass", {
            token: req.params.token,
            message: null
        });
    });
});

router.post('/reset/:token', function(req, res) {
    async.waterfall([
            function(done) {
                User.findOne({
                    tempToken: req.params.token,
                    tempTime: {
                        $gt: Date.now()
                    }
                }, function(err, user) {
                    if (!user) {
                        //req.flash("failure", "Token expired. Come back to Forget Password");
                        var message = "Token expired. Come back to Forget Password";
                        return res.render('../views/changepass', {
                            message: message,
                            token: req.params.token
                        });
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
                                user.password = hash;
                                user.tempToken = undefined;
                                user.tempTime = undefined;
                                user.save(function(err) {
                                    done(err, user);
                                    //console.log(user);
                                    const token = jwt.sign({
                                            email: user.email,
                                            userId: user._id
                                        },
                                        process.env.JWT_KEY, {
                                            expiresIn: "1h"
                                        })
                                    console.log('success');
                                    res.render("../views/post_a_job", {
                                        user: user
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
                            token: req.params.token
                        });
                    }
                });
            },
            function(user, done) {
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
                    to: user.email,
                    from: 'gradforce.co.nz@gmail.com',
                    subject: 'Your password has been changed',
                    text: 'Hi there,\n\n' +
                        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n\n' +
                        'Thanks, \n' +
                        'GradForce Team'
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    done(err);
                });
            }
        ],
        function(err) {
            res.render("../views/post_a_job", {
                user: user
            });
        }
    );
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
    var passedVariable2 = req.query.success;
    res.render("../views/forgotPassword", {
        message: passedVariable,
        success: passedVariable2
    });
});

router.get("/logout", (req, res) => {
    res.redirect("log_in");
});

module.exports = router;