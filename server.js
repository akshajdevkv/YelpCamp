const  express= require("express");
const path= require("path");
const methodOverride=require('method-override');
const mongoose= require("mongoose");
const ejsMate=require('ejs-mate');
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
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.engine('ejs',ejsMate);
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
app.get('/campgrounds',async(req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
});
app.get('/campgrounds/new',(req,res)=>{
    res.render('campgrounds/new');
})
app.post('/campgrounds',async(req,res)=>{
    const campground = new Campground(req.body);
 
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})
app.get('/campgrounds/:id',async(req,res)=>{
   const id=req.params.id;
   const campground=await Campground.findById(id);
   res.render('campgrounds/show',{campground});
})
app.get('/campgrounds/:id/edit',async(req,res)=>{
    const id=req.params.id;
    const campground=await Campground.findById(id);
    res.render('campgrounds/edit',{campground});
})
app.put('/campgrounds/:id',async(req,res)=>{
    const id=req.params.id;
    console.log(req.body);
    const campground=await Campground.findByIdAndUpdate(id,req.body);
    res.redirect(`/campgrounds/${campground._id}`);
})
app.delete('/campgrounds/:id',async(req,res)=>{
    const id=req.params.id;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})
app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});