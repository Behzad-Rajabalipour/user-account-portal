// Importing required modules
const express = require("express");
const app = express();
const storeSer = require("./store-service");
const multer = require("multer");
const upload = multer(); 
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const authData = require("./auth-service");
const clientSessions = require("client-sessions");

// Setting up the HTTP port
const HTTP_PORT = process.env.PORT || 8800;

// Configuring static file serving
app.use(express.static("public")); 

// Configuring middleware for parsing URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Configuring Handlebars engine
app.engine(".hbs", exphbs.engine({
  extname: ".hbs",
  defaultLayout: "main",
  helpers: {  
    navLink: function (url, options) {  
      return (
        "<li" + (url == app.locals.activeRoute ? ' class="active"' : "") +
        '><a href="' + url + '">' + options.fn(this) + "</a></li>" 
      );
    },
    equal: function (lvalue, rvalue, options) {    
      if (arguments.length < 3) { 
        throw new Error("Handlerbars Helper equal needs 2 parameters");
      }
      if (String(lvalue) != String(rvalue)) {
        return options.inverse(this);
      } else {
        return options.fn(this); 
      }
    },
  },
}));
app.set("view engine", ".hbs");

// Setting up middleware for route handling
app.use(function (req, res, next) {
  let route = req.baseUrl + req.path; 
  app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
  next(); 
});

// Setting up client sessions
app.use(clientSessions({
  cookieName: "session",
  secret: "web_a6_secret",
  duration: 2 * 60 * 1000,
  activeDuration: 1000 * 60
}));

// Setting up a common middleware for accessing session data in templates
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Middleware to ensure user login
const ensureLogin = (req, res, next) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
};

// Handling server start log
const onHttpStart = () => {
  console.log("Express http server listening on: " + HTTP_PORT);
};

// Routes configuration

// Home route
app.get("/", (req, res) => {
  res.render("home");
});

// About route
app.get("/about", (req, res) => {
  res.render("about");
});

// Add item route
app.get("/items/add", ensureLogin, (req, res) => {
  res.render("addItem");
});

// Display item by ID route
app.get("/item/:value", ensureLogin, (req, res) => {
  storeSer
    .getItemById(req.params.value)
    .then((data) => res.render("item", { item: data[0].dataValues }))
    .catch((err) => res.render("item", { message: "no results" }));
});

// Display items route with optional filters
app.get("/items", ensureLogin, (req, res) => {
  if (req.query.category) {
    storeSer
      .getItemByCategory(req.query.category)
      .then((data) => res.render("items", { items: data }))
      .catch((err) => res.render("items", { message: "no results" }));
  } else if (req.query.minDate) {
    storeSer
      .getItemsByMinDate(req.query.minDate)
      .then((data) => res.render("items", { items: data }))
      .catch((err) => res.render("items", { message: "no results" }));
  } else {
    storeSer
      .getAllItems(req.session.user.userEmail)
      .then((data) => res.render("items", { items: data }))
      .catch((err) => res.render("items", { message: "no results" }));
  }
});

// Display published items route
app.get("/store", ensureLogin, (req, res) => {
  storeSer
    .getPublishedItems(req.session.user.userEmail)
    .then((data) => res.render("store", { items: data }))
    .catch((err) => res.render("store", { message: " no results" }));
});

// Get categories API
app.get("/categories", (req, res) => {
  storeSer
    .getCategories()
    .then((data) => res.json(data))     // API(json)
    .catch((err) => res.json(err));
});

// Add item route (POST)
app.post("/items/add", ensureLogin, upload.single("featureImage"), (req, res) => { 
  if (req.file) {
    storeSer
      .upload(req)
      .then((uploaded) => {
        req.body.featureImage = uploaded.url; 
        req.body.userEmail = req.session.user.userEmail;      // because we didn't post email of user, so we need to add it to the body
      })
      .then(() => storeSer.addItem(req.body))
      .then(() => storeSer.getAllItems(req.session.user.userEmail))
      .then(() => res.redirect("/items"))
      .catch(() => res.redirect("/items"));
  } else {
    req.body.featureImage = "";
  }
});

// Update item route (POST)
app.post("/item/update", ensureLogin, upload.single("featureImage"), (req, res) => {
  if (req.file) {
    storeSer
      .upload(req) 
      .then((uploaded) => {
        req.body.featureImage = uploaded.url
      })
      .then(() => storeSer.updateItem(req.body))
      .then(() => res.redirect("/items")) 
      .catch((err) => res.json({ message: err }));
  } else {
    storeSer
      .updateItem(req.body)
      .then(() => res.redirect("/items"))     
      .catch((err) => res.json({ message: err }));
  }
});

// Load images route
app.get("/images", ensureLogin, (req, res) => {
  storeSer
    .readFiles(req.session.user.userEmail)       // because we have req here, we have access to req.session. If we don't have req, we can't access req.session
    .then((data) =>
      res.render("imagePage", {
        CloudImages: data,
        title: "Images",
      })
    );
});

// Login route
app.get("/login", (req, res) => {
  res.render("login");
});

// Register route
app.get("/register", (req, res) => {
  res.render("register");
});

// Register user route (POST)
app.post("/register", (req, res) => {
  authData.registerUser(req.body)
    .then(() => res.render("register", { successMessage: "User created" }))
    .catch(err => res.render("register", { errorMessage: err, userName: req.body.userName }));
});

// Login route (POST)
app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");    // "User-Agent" is default. userAgent exists in mongoDb(mongoose) schema
  authData.checkUser(req.body)
    .then(user => {
      req.session.user = {                  
        userName: user.userName,
        userEmail: user.email,
        loginHistory: user.loginHistory, 
      };
      res.redirect("/items");
    })
    .catch(err => {
      res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

// User history route
app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory", { user: req.session.user });      // session.user
});

// Error page route
app.get("*", (req, res) => {            
  res.status(404).render("error404.hbs");
});

// Initializing modules and starting the server
console.log("Ready for initialize.");
storeSer.initialize()                   
  .then(authData.initialize())            
  .then(app.listen(HTTP_PORT, onHttpStart))
  .catch((err) => { console.log(err) });
