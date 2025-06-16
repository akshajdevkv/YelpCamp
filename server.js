const  express= require("express");
const path= require("path");
const mongoose= require("mongoose");
mongoose.connect('mongodb://localhost:27017/yelp-camp');
const db=mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',()=>{
    console.log('Database connected');
});
const Campground = require('./models/campground');
const app =express();
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));
app.get('/',(req,res)=>{
    res.render('home');
});
app.get('/makecampground',async(req,res)=>{
    const campground=new Campground({
        name:'Campground 1',
        price:100,
        desciprtion:'This is a description of the campground',
        location:'New York'
    });
    await campground.save();
    res.send(campground);
});
app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});