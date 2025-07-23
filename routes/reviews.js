const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
    const { validateReview } = require('../middleware');

router.post("/", validateReview, catchAsync(async(req, res) => {
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
    req.flash('success', 'Successfully made a new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;
