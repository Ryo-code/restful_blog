'use strict';

let bodyParser  = require("body-parser"),
expressSanitizer = require("express-sanitizer"),
methodOverride  = require("method-override"),
mongoose        = require("mongoose"),
express         = require("express"),
app             = express();


// APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app"); //restful_blog_app will be created the first time this file runs. After that, it'll connect to it, cuz it already exists
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); //expressSanitizer has to go after bodyParser
app.use(methodOverride("_method")); //Used to make the POST method in the edit file actually a PUT request (by overriding it)

// MONGOOSE/MODEL CONFIG
let blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now} //So if someone makes a blog post without having this, it will default to the current date. Could be useful for other things too, like the image URL having a placeholder if nothing was provided
})

let Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "First Post",
//     image: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?dpr=2&auto=compress,format&fit=crop&w=767&h=511&q=80&cs=tinysrgb&crop=",
//     body: "I made this from inside the app.js file. Had to delete the DB because the images weren't httpS. Ugh...",
// })


//RESTFUL ROUTES
app.get("/", (req, res) => {
    res.redirect("/blogs")
})

//INDEX
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


//NEW ROUTE
app.get("/blogs/new", (req, res) => {
    res.render("new");
});

//CREATE ROUTE
app.post("/blogs", (req, res) => {
    //create blog post (stick into DB)
    req.body.blog.body = req.sanitize(req.body.blog.body) //this makes it so that if someone inputs JS into the blog body, it won't run (but HTML will, for stuff like bolding a word)
    Blog.create(req.body.blog, (err, newBlog) => {
        if(err){
            res.render("new");
        } else {
            //then, redirect to the index
            res.redirect("/blogs");
        }
    });
});

//SHOW ROUTE
app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog}); //this "blog" is whatever we found inside the SHOW route, because we looked in the DB for the ID. And if we found it (and we almost definitely will then pass foundBlog through (as "blog", like I said) to show.ejs
        }
    });
});

//EDIT ROUTE
app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});

//UPDATE ROUTE
app.put("/blogs/:id", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
       if(err){
           res.redirect("/blogs");
       } else {
           res.redirect("/blogs/" + req.params.id); //this will redirect to the corresponding SHOW page
       }
    });
});

//DELETE ROUTE
app.delete("/blogs/:id", (req, res) => {
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, (err) => {
       if(err){
           console.log("Error! Error! WWOOOOPP")
           res.redirect("/blogs");
       } else {
           res.redirect("/blogs")
       }
    });
});

app.listen(3000, () => {
    console.log("BEEP BOOP! Running blog server!");
});
