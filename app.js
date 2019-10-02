const express = require('express');
const app = express();
const morgan = require('morgan');//login, next function
const bodyParser = require('body-parser'); //to collect the json data
const mongoose = require('mongoose');


const userRoutes = require('./api/routes/users');
const jobsRoutes = require('./api/routes/jobs');
const adminRoutes = require('./api/routes/admin');


app.use(morgan('dev'));

mongoose.connect('mongodb://127.0.0.1:27017/industry_project', {
    useNewUrlParser: true
});
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.set('view engine', 'ejs');
app.use(express.static("views"));
app.use(express.static("logo"));

app.use('/users', userRoutes);
app.use('/jobs', jobsRoutes);
app.use('/admin', adminRoutes);


app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;