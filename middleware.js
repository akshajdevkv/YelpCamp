module.exports = (req,res,next)=>{
        if(!req.isAuthenticated()){
            req.session.returnTo = req.originalUrl; 
        req.flash('error', 'You must be logged in to create a campground');
        return res.redirect('/users/login');
    }
    next();
}
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}