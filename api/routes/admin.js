const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Admin = require("../models/admin");
const Job = require("../models/job");
const User = require("../models/user");
const officegen = require("officegen");
const fs = require("fs");
var url = require('url');


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

router.get("/quote", (req, res) => {
    var jobName = req.query.jobName;
    var description = req.query.description;
    console.log(description);
    res.render("../views/quote2", { jobName: jobName, description: description });
});

router.post("/quote", (req, res) => {

    var today = new Date();
    var date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    // Create an empty Word object:
    let docx = officegen('docx')

    // Officegen calling this function after finishing to generate the docx document:
    docx.on('finalize', function(written) {
        console.log(
            'Finish to create a Microsoft Word document.'
        )
    })

    // Officegen calling this function to report errors:
    docx.on('error', function(err) {
        console.log(err)
    })

    // Create a new paragraph:
    let pObj = docx.createP()

    pObj.addText('Gradforce                                                     Quotation', { font_face: 'Calibri(Body)', font_size: 20, color: 'a3a3a3', bold: true })


    pObj = docx.createP()

    pObj.addText('227 Dairy Flat Hwy, Albany,                                                                                   Date: ' + date, { font_face: 'Calibri(Body)', font_size: 11, color: '000000', bold: true })
    pObj.addLineBreak()
    pObj.addText('Auckland 0632', { font_face: 'Calibri(Body)', font_size: 11, color: '000000', bold: true })
    pObj.addLineBreak()
    pObj.addText('Phone  09*******0', { font_face: 'Calibri(Body)', font_size: 11, color: '000000', bold: true })

    pObj = docx.createP()
    pObj.addText('Quotation For', { font_face: 'Calibri(Body)', font_size: 12, color: '000000', bold: true })
    pObj.addLineBreak()
    pObj.addText('Name: ', { font_face: 'Calibri(Body)', font_size: 12, color: '000000', bold: true })
    pObj.addLineBreak()
    pObj.addText('Company name: ', { font_face: 'Calibri(Body)', font_size: 12, color: '000000', bold: true })


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
        // ['BUSINESS', req.body.hoursB, req.body.wageB, req.body.totalB],
        // ['MANAGEMENT COST', req.body.hoursM, req.body.wageM, req.body.totalM],
        // [' ', 'HOURS CONSUMED', ' ', 'COST'],
        // ['OVERHEAD 50%', req.body.hoursO, ' ', req.body.totalO],
        // ['GST 15%', ' ', ' ', req.body.totalGST],
        // [' ', ' ', 'TOTAL COST:', req.body.total],
    ]

    var tableStyle = {
        tableColWidth: 4261,
        tableAlign: "center",
        tableFontFamily: "Calibri(Body)"
    }

    docx.createTable(table, tableStyle);
    // Let's generate the Word document into a file:

    let out = fs.createWriteStream('example.docx')

    out.on('error', function(err) {
        console.log(err)
    })

    // Async call to generate the output file:
    docx.generate(out)

    // console.log(req.query.jobName)
    console.log(req.body.totalIT)
    console.log(req.body.wageIT)
    console.log(req.body.hoursIT)


    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    console.log(req.body.data_jobName);

    res.send("test");
});


module.exports = router;