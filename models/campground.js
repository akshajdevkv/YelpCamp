const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    image: {
        type: String,
        required: [true, 'Image URL cannot be empty']
    },
    location: {
        type: String,
        required: [true, 'Location cannot be empty']
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

const Campground = mongoose.model('Campground', CampgroundSchema);

module.exports = Campground;