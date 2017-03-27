'use strict';

let bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    express     = require("express"),
    app         = express();


// APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app"); //restful_blog_app will be created the first time this file runs. After that, it'll connect to it, cuz it already exists
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));


// MONGOOSE/MODEL CONFIG
let blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now} //So if someone makes a blog post without having this, it will default to the current date. Could be useful for other things too, like the image URL having a placeholder if nothing was provided
})
let Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Test Blog",
//     image: "http://cdn.wallpapersafari.com/17/99/knHlCG.jpg",
//     body: "Look at this pic I found! It's the first on this blog.",
// })


//RESTFUL ROUTES
app.get("/", (req, res) => {
    res.redirect("/blogs")
})

app.get("/blogs", (req, res) => {
    Blog.find({}, (err, blogs) => {
        //the empty object means "use the find() method on everything"
        if(err){
            console.log("ERROR!");
        } else {
            res.render("index", {blogs: blogs})
    /* NOTE: So we pass the data coming back from the DB (from the .find method) into the "blogs" parameter, into the index file */
        }
    });
});

app.get("/blogs/new", (req, res) => {
    res.render("new");
})

app.post("/blogs", (req, res) => {
    //create blog post (stick into DB)
    Blog.create(req.body.blog, (err, newBlog)=>{
        if(err){
            console.log("Sorry, there was an error...")
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    });
})


app.listen(3000, function () {
    console.log("BEEP BOOP! Running blog server!");
})
