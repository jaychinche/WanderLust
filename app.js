const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const Listing = require("./models/listing.js");
const methodOverride= require("method-override");


//for ejsMate
const ejsMate =require("ejs-mate")

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

//for ejsMate
app.engine("ejs",ejsMate);

//for public flolder
app.use(express.static(path.join(__dirname,"/public")));

//for error handling
const wrapAsync=require("./util/wrapAsync.js");
const ExpressError=require("./util/ExpressError.js");



//Database
main().then(() => {
    console.log("conncetion sucessfully");
}).catch(err => console.log(err));
async function main() {
    await mongoose.connect(MONGO_URL);
};

//server Listen
app.listen(8080, (req, res) => {
    console.log("server is started");
});


app.get("/", (req, res) => {
    res.redirect("/listings");
});

//Index Route
app.get("/listings",wrapAsync( async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }));

//New Route
app.get("/listings/new",((req,res)=>{
    res.render("listings/new.ejs")
}));

//Show Route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}));

//Post Route
app.post("/listings",wrapAsync(async(req,res,next)=>{

    //try for hopcotch pursupose
    if(!res.body.listing){
        throw new ExpressError(400,"send valid data for listing")
    }


        const newListing=new Listing(req.body.listing);

    // if(!newListing.description)
    // {
    //     throw new ExpressError(400,"Description is required");
    // }
        await newListing.save();
        res.redirect("/listings");
}));

//Edit Route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let { id } = req.params;

    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing})

}));

//Update Route 
app.put("/listings/:id",wrapAsync(async(req,res)=>{
    //same hopcotch
    if(!res.body.listing){
        throw new ExpressError(400,"send valid data for listing")
    }
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing})
    res.redirect(`/listings/${id}`)
}));

//Delete Route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let{id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings")
}));

//All Route 
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
});

//Error Handling
app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong !"}=err;

    res.render("error.ejs",{message});
    // res.status(statusCode).send(message);
 
});
























