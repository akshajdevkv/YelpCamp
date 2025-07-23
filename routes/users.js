const express = require('express');
const router = express.Router();
const users = require('../controllers/user');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const { storeReturnTo } = require('../middleware');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/users/login'
    }), users.login);

router.get('/logout', users.logout);

module.exports = router;
