const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Admin = require("../models/admin");
const Job = require("../models/job");
const User = require("../models/user");
const officegen = require("officegen");
const nodemailer = require("nodemailer");
const fs = require("fs");
var url = require('url');
const async = require('async');
const delay = ms => new Promise(res => setTimeout(res, ms))



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

router.get("/quote1", (req, res) => {
    var jobName = req.query.jobName;
    var jobId = req.query.jobId;
    var description = req.query.description;
    var companyName = req.query.companyName;
    var contactName = req.query.contactName;
    var phoneNumber = req.query.phoneNumber;
    var jobEmail = req.query.jobEmail;
    var users = req.query.users;
    var jobs = req.query.jobs;
    var admin = req.query.admin;
    console.log(description);
    var message = "";
    res.render("../views/quote", { message, jobId: jobId, jobName: jobName, description: description, companyName: companyName, contactName: contactName, phoneNumber: phoneNumber, jobEmail: jobEmail, users: users, jobs: jobs, admin: admin });
});


router.post("/quote", (req, res) => {

    var users = req.body.users;
    console.log("Jobs:\n" + jobs);
    var jobs = req.body.jobs;
    var admin = req.body.admin;
    var jobEmail = req.body.jobEmail;
    var jobId = req.body.jobId;
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

                pObj.addText('Gradforce                                                        Quotation', { font_face: 'Calibri(Body)', font_size: 20, color: 'a3a3a3', bold: true });


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

                let out = fs.createWriteStream('./uploads/' + req.body.jobName + '_external_qoute.docx');
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

                let transport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: myEmail,
                        pass: 'Aspire2gf'
                    }
                });
                console.log('File created');
                console.log('Wait for 10 seconds....');
                setTimeout(function() {
                    console.log('10 seconds complete');
                    let message = {
                        from: myEmail,
                        to: jobEmail,
                        subject: 'Quote',
                        text: 'Hello ' + req.body.contactName + '. Please find the attached copy of qoute in this email.',
                        attachments: [{
                            filename: req.body.jobName + '_' + date + '_qoute.docx',
                            content: fs.createReadStream('./uploads/' + req.body.jobName + '_external_qoute.docx')
                                //  filepath: process.cwd() + '/example.docx',
                                // contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        }]
                    };
                    transport.sendMail(message, function(err) {
                        //console.log("Filepath: " + message.attachments.filepath);
                        if (err) {
                            console.log("Failed to send email.");
                            console.log(err);
                            res.status(500).json({ "error": "Opps soemthing went wrong while sending email" });
                        } else {
                            console.log("Email sent");
                            var result = {
                                "message": 'Email sent',
                                "status": 200
                            }
                            callback(null, result);
                        }
                    });
                }, 10000);

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
            }
        }
    );



});

function smallDelay() {
    console.log("5 second wait over");
}

router.post("/quote2", (req, res) => {

    var users = req.body.users;
    var jobs = req.body.jobs;
    var admin = req.body.admin;
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

    pObj.addText('Gradforce                                                              Quotation', { font_face: 'Calibri(Body)', font_size: 20, color: 'a3a3a3', bold: true });


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

    let out = fs.createWriteStream('./uploads/' + req.body.jobName + '_internal_qoute.docx');

    out.on('error', function(err) {
        console.log(err);
    })

    // Async call to generate the output file:
    docx.generate(out);

    var jobName = req.body.jobName;
    var jobId = req.body.jobId;
    var description = req.body.description;
    var companyName = req.body.companyName;
    var contactName = req.body.contactName;
    var phoneNumber = req.body.phoneNumber;

    const message = "The internal qoute was created successfully!";

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

    res.render("../views/quote", { message, jobId: jobId, jobName, description, companyName, contactName, phoneNumber, jobs: jobs, users: users, admin: admin })
});

module.exports = router;