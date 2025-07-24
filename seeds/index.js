const Campground = require('../models/campground');
const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelp-camp');
const db=mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',()=>{
    console.log('Database connected');
});
const cities=require('./cities');
const {descriptors,places}=require('./seedHelpers');
const sample=array=>array[Math.floor(Math.random()*array.length)];
const seedcampground=async()=>{
    await Campground.deleteMany({});
    for (let i=0;i<50;i++){
        const random1000=Math.floor(Math.random()*1000);
        const camp=new Campground({
            author:'687fd34f7fc36e120d8a558b',
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: `https://picsum.photos/600/400?random=${Math.random()}`,
                    filename: `YelpCamp/random[${random1000}]`
                },
                {
                    url: `https://picsum.photos/600/400?random=${Math.random()}`,
                    filename: `YelpCamp/random[${random1000}]`
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
            price: Math.floor(Math.random()*20)+10
           
        });
        await camp.save();
    }
}
seedcampground().then(()=>{
    mongoose.connection.close();
});
