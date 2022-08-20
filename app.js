//jshint esversion:6
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const port = 3000
const mongoose = require("mongoose")
//const encrypt = require('mongoose-encryption')

const session = require('express-session')
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

const app = express()
app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))

//session
app.use(session({
  secret: 'Our little secret',
  resave: false,
  saveUninitialized: true,
  //cookie: { secure: true }
}))

app.use(passport.initialize())
app.use(passport.session())





//database
mongoose.connect("mongodb://localhost:27017/userDB")

const userSchema = new mongoose.Schema({
  email: String,
  password: String
})

userSchema.plugin(passportLocalMongoose) //use hash and salting to store the data into the db

//userSchema.plugin(encrypt, { secret: process.env.SECRET_KEY, encryptedFields: ['password'] })

const User = new mongoose.model("User", userSchema)
passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get("/", function (req, res) {
  res.render("home")
})

app.get("/login", function (req, res) {
  res.render("login")
})

app.get("/register", function (req, res) {
  res.render("register")
})
//post



app.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets")
  } else {
    res.redirect("/login")
  }
})

app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) { return next(err) }
    res.redirect('/')
  })
})

app.post("/register", function (req, res) {
  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err)
      res.redirect("/register")
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets")
      })
    }
  })
})


app.post("/login", passport.authenticate('local', {
  successRedirect: '/secrets',
  failureRedirect: '/login'
}), function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  })

  req.login(user, function (err) {
    if (err) {
      console.log(err)
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets")
      })
    }
  })
})



//end
app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})