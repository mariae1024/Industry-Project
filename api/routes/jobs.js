const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require('multer');
const Job = require("../models/job");
const User = require("../models/user");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    //at the end of destination we have to execute the callback
    //into callback we pass an error 'null' and the destination where the file has to be saved
    filename: function (req, file, cb) {
        cb(null, file.originalname)

    }
})

const fileFilter = (req, file, cb) => {

    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || 
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
    file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
    file.mimetype === 'application/vnd.ms-excel.sheet.macroEnabled.12') { //filefilter by type of file 
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
    dest: './uploads/'
});

router.post("/postjob/:id", upload.single('uploadFile'), (req, res, next) => {

    console.log(req.file);
    let id = req.params.id;
    console.log(req.params.id);
    User.findById(id)
        .then(user => {
            console.log(user);
            if (!user) {
                console.log("user not found");
                return res.status(404).json({
                    message: "User not found"
                });
            } else {
                const job = new Job({
                    _id: new mongoose.Types.ObjectId(),
                    user: user._id,
                    jobType: req.body.jobType,
                    jobName: req.body.jobName,
                    description: req.body.description,
                    uploadFile: req.file.path,
                    payment: req.body.payment,
                    startDate: req.body.startDate,
                    endDate: req.body.endDate
                });
                job
                    .save()
                    .then(result => {
                        console.log(result);
                        res.render("../views/confirmation",{
                            user: user
                        })
                        })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        })

                    })
            }
        })
})
router.get("/", (req, res) => {
    res.render("../views/post_a_job");
})



module.exports = router;