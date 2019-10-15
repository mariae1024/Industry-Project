const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Admin = require("../models/admin");
const Job = require("../models/job");
const User = require("../models/user");
const officegen = require("officegen");

const fs = require("fs");
var url = require('url');

const delay = ms => new Promise(res => setTimeout(res, ms))



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
                                    jwt.sign({
                                        data: 'foobar'
                                      }, 'secret', { expiresIn: '1h' });
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

router.get("/quote1", (req, res) => {
    var jobName = req.query.jobName;
    var jobId = req.query.jobId;
    var description = req.query.description;
    var companyName = req.query.companyName;
    var contactName = req.query.contactName;
    var phoneNumber = req.query.phoneNumber;
    var jobEmail = req.query.jobEmail;
    //  var users = req.query.users;
    //var jobs = req.query.jobs;
    //var admin = req.query.admin;
    console.log(description);
    var message = "";
    res.render("../views/quote", { message, jobId: jobId, jobName: jobName, description: description, companyName: companyName, contactName: contactName, phoneNumber: phoneNumber, jobEmail: jobEmail });
});


router.post("/quote", (req, res) => {

    var users = req.body.users;
    console.log("Jobs:\n" + jobs);
    var jobs = req.body.jobs;
    var admin = req.body.admin;
    var jobEmail = req.body.jobEmail;
    var jobId = req.body.jobId;
    var description = req.body.description;
    var myEmail = "gradforce.co.nz@gmail.com";
    var today = new Date();
    // console.log("Company name:" + req.body.companyName + "\nContactName: " + req.body.contactName);
    var date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    // Create an empty Word object:
    let docx = officegen('docx');

    async.waterfall([
            function createAttachment(callback) {
                console.log("Inside async waterfall function createAttachment()");

                /*
                // Officegen calling this function after finishing to generate the docx document:
                docx.on('finalize', function(written) {
                    console.log(
                        'Finish to create a Microsoft Word document.'
                    );
                })
                */

                // Officegen calling this function to report errors:
                /*
                docx.on('error', function(err) {
                    console.log(err);
                    console.log("Something went wrong here");
                    res.status(500).json({ "error": "Something went wrong here!!" });

                })
                */

                // Create a new paragraph:
                console.log("reaches here??");
                //debugger;
                let pObj = docx.createP()

                pObj.addText('Gradforce                                                      Quotation', { font_face: 'Calibri(Body)', font_size: 20, color: 'a3a3a3', bold: true });


                pObj = docx.createP();

                pObj.addText('227 Dairy Flat Hwy, Albany,                                                                             Date: ' + date, { font_face: 'Calibri(Body)', font_size: 11, color: '000000', bold: true })
                pObj.addLineBreak()
                pObj.addText('Auckland 0632', { font_face: 'Calibri(Body)', font_size: 11, color: '000000', bold: true });
                pObj.addLineBreak()
                pObj.addText('Phone  09*******0', { font_face: 'Calibri(Body)', font_size: 11, color: '000000', bold: true })


                pObj = docx.createP()
                pObj.addText('Quotation For', { font_face: 'Calibri(Body)', font_size: 12, color: '000000', bold: true })
                pObj.addLineBreak()
                pObj.addText('Job Title: ' + req.body.jobName, { font_face: 'Calibri(Body)', font_size: 12, color: '000000', bold: true })
                pObj.addLineBreak()
                pObj.addText('Name: ' + req.body.contactName, { font_face: 'Calibri(Body)', font_size: 12, color: '000000', bold: true })
                pObj.addLineBreak()
                pObj.addText('Company name: ' + req.body.companyName, { font_face: 'Calibri(Body)', font_size: 12, color: '000000', bold: true })
                pObj.addLineBreak()
                pObj.addText('Phone number: ' + req.body.phoneNumber, { font_face: 'Calibri(Body)', font_size: 12, color: '000000', bold: true })
                pObj.addLineBreak()
                pObj.addText('Job description: ' + description, { font_face: 'Calibri(Body)', font_size: 12, color: '000000', bold: true })

                pObj = docx.createP()
                pObj.addText('Total cost: $' + req.body.total, { font_face: 'Calibri(Body)', font_size: 12, color: '000000', bold: true })
                    // Let's generate the Word document into a file:

                let out = fs.createWriteStream('./uploads/' + req.body.jobName + '_external_quote.docx');
                console.log("BLAH");

                out.on('error', function(err) {
                    console.log(err);
                })

                // Async call to generate the output file:
                docx.generate(out);
                console.log("DOES IT EVEN GET HERE");
                callback(null, docx, date);

            },

            function sendEmail(docx, date, callback) {
                console.log("Inside async waterfall function sendEmail()");
                // console.log(req.query.jobName)
                console.log(req.body.totalIT);
                console.log(req.body.wageIT);
                console.log(req.body.hoursIT)


                // var url_parts = url.parse(req.url, true);
                //var query = url_parts.query;

                //  console.log(req.body.data_jobName);

                var transport = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true, // use SSL
                    auth: {
                        user: 'gradforce.co.nz@gmail.com',
                        pass: process.env.GMAIL
                    }
                });
                console.log('File created');
                console.log('Wait for 10 seconds....');
                setTimeout(function() {
                 console.log('10 seconds complete');
                    let message = {
                        from: '"GradForce" <gradforce.co.nz@gmail.com>',
                        to: jobEmail,
                        subject: 'Quote',
                        text: 'Hello ' + req.body.contactName + '. Please find the attached copy of quote in this email.',

                     //take off attachments 

                      /*  attachments: [{
                            filename: req.body.jobName + '_' + date + '_quote.docx',
                            content: fs.createReadStream('./uploads/' + req.body.jobName + '_external_quote.docx')
                                //  filepath: process.cwd() + '/example.docx',
                                // contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        }]*/
                    };
                    transport.sendMail(message, function(err) {
                        //console.log("Filepath: " + message.attachments.filepath);
                        if (err) {
                            console.log("Failed to send email.");
                            console.log(err);
                            res.status(500).json({ "error": "Opps something went wrong while sending email" });
                        } else {
                            console.log("Email sent");
                            var result = {
                                "message": 'Email sent',
                                "status": 200
                            }
                            callback(null, result);
                        }
                    });
                 }, 5000);
            }
        ],

        function(err, result) {
            if (err) {
                console.log(err);
                res.status(500).json({ 'error': 'An error has occured' });
            } else {
                Job.findByIdAndUpdate(jobId).then((job) => {
                    job.status = "sent";
                    job.save()
                        .then(job => {
                            console.log(job);
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });
                });


                res.redirect("alljobs");





            }
        }
    );



});

function smallDelay() {
    console.log("5 second wait over");
}

router.post("/quote2", (req, res) => {
    var description = req.body.description;

    var today = new Date();
    console.log("Company name:" + req.body.companyName + "\nContactName: " + req.body.contactName);
    var date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    // Create an empty Word object:
    let docx = officegen('docx');

    // Officegen calling this function after finishing to generate the docx document:
    docx.on('finalize', function(written) {
        console.log(
            'Finish to create a Microsoft Word document.'
        );
    })

    // Officegen calling this function to report errors:
    docx.on('error', function(err) {
        console.log(err);
        //  res.status(500).json({ "error": "Something went wrong here!!" });

    })

    // Create a new paragraph:
    //debugger;
    let pObj = docx.createP()

    pObj.addText('Gradforce                                                      Quotation', { font_face: 'Calibri(Body)', font_size: 20, color: 'a3a3a3', bold: true });


    pObj = docx.createP();

    pObj.addText('227 Dairy Flat Hwy, Albany,                                                                                   Date: ' + date, { font_face: 'Calibri(Body)', font_size: 11, color: '000000', bold: true })
    pObj.addLineBreak()
    pObj.addText('Auckland 0632', { font_face: 'Calibri(Body)', font_size: 11, color: '000000', bold: true });
    pObj.addLineBreak()
    pObj.addText('Phone  09*******0', { font_face: 'Calibri(Body)', font_size: 11, color: '000000', bold: true })

    pObj = docx.createP()
    pObj.addText('Quotation For', { font_face: 'Calibri(Body)', font_size: 12, color: '000000', bold: true })
    pObj.addLineBreak()
    pObj.addText('Job Title: ' + req.body.jobName, { font_face: 'Calibri(Body)', font_size: 12, color: '000000', bold: true })
    pObj.addLineBreak()
    pObj.addText('Name: ' + req.body.contactName, { font_face: 'Calibri(Body)', font_size: 12, color: '000000', bold: true })
    pObj.addLineBreak()
    pObj.addText('Company name: ' + req.body.companyName, { font_face: 'Calibri(Body)', font_size: 12, color: '000000', bold: true })
    pObj.addLineBreak()
    pObj.addText('Phone number: ' + req.body.phoneNumber, { font_face: 'Calibri(Body)', font_size: 12, color: '000000', bold: true })
    pObj.addLineBreak()
    pObj.addText('Job description: ' + description, { font_face: 'Calibri(Body)', font_size: 12, color: '000000', bold: true })
    var table = [
        [{
            val: " ",
            opts: {
                b: true

            }
        }, {
            val: "HOURS",
            opts: {
                b: true

            }
        }, {
            val: "WAGE",
            opts: {
                b: true

            }
        }, {
            val: "TOTAL",
            opts: {
                b: true

            }
        }],
        ['IT', req.body.hoursIT, req.body.wageIT, req.body.totalIT],
        ['BUSINESS', req.body.hoursB, req.body.wageB, req.body.totalB],
        ['MANAGEMENT COST', req.body.hoursM, req.body.wageM, req.body.totalM],
        [' ', 'HOURS CONSUMED', ' ', 'COST'],
        ['OVERHEAD 50%', req.body.hoursO, ' ', req.body.totalO],
        ['GST 15%', ' ', ' ', req.body.totalGST],
        [' ', ' ', 'TOTAL COST:', req.body.total],
    ]

    var tableStyle = {
        tableColWidth: 4261,
        tableAlign: "center",
        tableFontFamily: "Calibri(Body)",
        borders: true
    }

    docx.createTable(table, tableStyle);
    // Let's generate the Word document into a file:

    let out = fs.createWriteStream('./uploads/' + req.body.jobName + '_internal_quote.docx');

    out.on('error', function(err) {
        console.log(err);
    })

    // Async call to generate the output file:
    docx.generate(out);

    var jobName = req.body.jobName;
    var jobId = req.body.jobId;
   
    var companyName = req.body.companyName;
    var contactName = req.body.contactName;
    var phoneNumber = req.body.phoneNumber;
    var jobEmail = req.body.jobEmail;

    const message = "The internal quote was created successfully!";

    Job.findByIdAndUpdate(jobId).then((job) => {
        job.status = "saved";
        job.save()
            .then(job => {
                console.log(job);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    });

    res.render("../views/quote", { message, jobId: jobId, jobName, description, companyName, contactName, phoneNumber, jobEmail })
});

router.get("/alljobs", (req, res) => {
    Job.find().then((jobs) => {
        console.log(jobs);
        User.find()
            .exec()
            .then((users) => {
                Admin.find()
                    .exec()
                    .then((admin) => {
                        res.render("../views/adminPanel", {
                            admin: admin,
                            jobs: jobs,
                            users: users
                        });

                    })

            })

    });
});

router.post("/download", (req, res) => {

    let file = req.body.fileToDownload;
    file = file.slice(8);
    console.log(file);
    //res.send("file: " + file)
    res.download("./uploads/" + file);


});



router.get("/fpassword", (req, res) => {


    var passedVariable = req.query.message;
    var passedVariable2 = req.query.success;
    res.render("../views/adminForgotPass", {
        message: passedVariable,
        success: passedVariable2
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
                Admin.findOne({
                    email: req.body.email
                }, function(err, admin) {
                    if (!admin) {
                        var message = "The email doesn't exist. Please try again";
                        return res.redirect('/admin/fpassword/?message=' + message + '#forgotpass');
                    }
                    admin.tempToken = token;
                    admin.tempTime = Date.now() + 3600000; // 1 hour
                    //res.send("Users found");
                    admin.save(function(err) {
                        done(err, token, admin);
                    });
                });
            },
            function(token, admin, done) {
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
            return res.redirect('/admin/fpassword/?success=' + success + '#forgotpass');
        }
    );
});

router.get('/reset/:token', function(req, res) {
    Admin.findOne({
        tempToken: req.params.token,
        tempTime: {
            $gt: Date.now()
        }
    }, function(err, admin) {
        if (!admin) {
            //passwords do not match
        }
        res.render("../views/changepassAdmin", {
            token: req.params.token,
            message: null
        });
    });
});

router.post('/reset/:token', function(req, res) {


    async.waterfall([
            function(done) {


                Admin.findOne({
                    tempToken: req.params.token,
                    tempTime: {
                        $gt: Date.now()
                    }
                }, function(err, admin) {
                    if (!admin) {
                        //req.flash("failure", "Token expired. Come back to Forget Password");
                        var message = "Token expired. Come back to Forget Password";
                        return res.render('../views/changepassAdmin', {
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
                                admin.password = hash;
                                admin.tempToken = undefined;
                                admin.tempTime = undefined;
                                admin.save(function(err) {
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
                                    //   
                                    Job.find({}, (err, jobs) => {
                                            User.find({}, (err, users) => {

                                                res.render("../views/adminPanel", {
                                                    admin: admin,
                                                    jobs: jobs,
                                                    users: users

                                                })
                                            })
                                        })
                                        //console.log(users);

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
                        return res.render('../views/changepassAdmin', {
                            message: message,
                            token: req.params.token
                        });
                    }
                });
            },
            function(admin, done) {
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
                smtpTransport.sendMail(mailOptions, function(err) {
                    done(err);
                });
            }
        ],
        function(err) {
            res.render("../views/adminPanel", {
                admin: admin,
                users: users,
                jobs: jobs
            });
        }
    );
});

router.get("/logout", (req, res) => {
    res.redirect("log_in");
});
module.exports = router;