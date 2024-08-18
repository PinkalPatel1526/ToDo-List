//Depandency
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const List = require('./models/task.js')
const methodOverride = require('method-override');
const wrapAsync = require('./util/wrapAsync.js')
const ExpressError = require("./util/ExpressError.js");
const listSchema = require('./schema.js');
const app = express();

// serve public directory
app.use(express.static(path.join(__dirname, '/public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// method override (for DELETE, PATCH, etc.)
app.use(methodOverride("_method"));

main().then((res) => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
});

//Mongoose connection
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/ToDoList');
  }

//validate schema
const validateSchema = (req, res, next) => {
    const { error } = listSchema.validate(req.body);
    if (error) {
        let message = error.details.map((el) => el.message).join(', ');
        throw new ExpressError(400, message);
    } else {
        next();
    }
};

// root route
app.get("/", (req, res) => {
    res.send("i am root"); 
});

//show all task
app.get("/list",wrapAsync( async(req, res) => {
    const  allLists  = await List.find({});
    res.render("../views/index.ejs", {allLists} );
}));

//add task
app.post("/list" ,wrapAsync( async(req, res) => {
    const  task  = req.body.List;   
    const addTask = new List(task)

    await addTask.save();

    res.redirect("/list");
}));

//delete task
app.delete('/list/:id',wrapAsync( async(req, res) => {
    const id = req.params.id;
    await List.findByIdAndDelete(id);

    res.redirect("/list");
}));

//delete all task : new list
app.delete("/list",wrapAsync(  async(req, res) => {
    await List.deleteMany({});

    res.redirect("/list");
}));

// Catch-all route for handling 404 errors
app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'Page Not Found'));
});

app.use((err, req, res, next) => {
    let { status = 501, message="Some error" } = err;
    res.status(status).send("Page not found");
});

//Create a server
app.listen(8080, () => {
    console.log("server start on port: 8080");
});
