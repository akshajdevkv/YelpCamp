const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require('./review');

const ImageSchema = new Schema({
    url: String,
    filename: String
});  
ImageSchema.virtual('thumbnail').get(function() {
    if (this.url.includes('/upload')) {
        // Cloudinary image
        return this.url.replace('/upload', '/upload/w_200');
    } else {
        // Picsum image
        return this.url.replace('picsum.photos/600/400', 'picsum.photos/200/100');
    }
});

const CampgroundSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Campground title cannot be empty']
    },
    price: {
        type: Number,
        required: [true, 'Price cannot be empty'],
        min: [0, 'Price cannot be negative']
    },
    description: {
        type: String,
        required: [true, 'Description cannot be empty']
    },
    images: [ImageSchema],
    location: {
        type: String,
        required: [true, 'Location cannot be empty']
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// Middleware to delete all reviews when a campground is deleted
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

const Campground = mongoose.model('Campground', CampgroundSchema);

module.exports = Campground;