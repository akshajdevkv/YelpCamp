const express = require("express");
const path = require("path");
const methodOverride = require('method-override');
const mongoose = require("mongoose");
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const campgroundsRoutes = require('./routes/campgrounds');
const {reviewSchema} = require('./schema');

mongoose.connect('mongodb://localhost:27017/yelp-camp');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const Campground = require('./models/campground');
const Review = require('./models/review');

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(',');
        throw new ExpressError(message, 400);
    }
    next();
}

app.use('/campgrounds', campgroundsRoutes);
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/makecampground', async (req, res) => {
    const campground = new Campground({
        name: 'Campground 1',
        price: 100,
        desciprtion: 'This is a description of the campground',
        location: 'New York'
    });
    await campground.save();
    res.send(campground);
});


app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        throw new ExpressError('Campground not found', 404);
    }
    const review = new Review({
        body: req.body.review.body,
        rating: parseInt(req.body.review.rating)
    });
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));



// Handle 404s
app.use((req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});