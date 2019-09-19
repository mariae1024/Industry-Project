const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Admin = require("../models/admin");
const Job = require("../models/job");
const User = require("../models/user");

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

module.exports = router;