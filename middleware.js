module.exports = (req,res,next)=>{
        if(!req.isAuthenticated()){
        req.flash('error', 'You must be logged in to create a campground');
        return res.redirect('/users/login');
    }
    next();
}