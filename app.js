if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}

const express = require("express")
const app = express()
const path = require("path")
const ejsMate = require("ejs-mate")
const session = require("express-session")
const flash = require("connect-flash")
const mongoose = require("mongoose")
const methodOverride = require("method-override")
const ExpressError = require("./utils/EspressError")
const passport = require("passport")
const passportLocal = require("passport-local")
const User = require("./models/user.js")
const mongoSanitize = require("express-mongo-sanitize")
const helmet = require("helmet")
const MongoStore = require("connect-mongo")

const userRoutes = require("./routes/users.js")
const campgroundRoutes = require("./routes/campground.js")
const reviewRoutes = require("./routes/reviews.js")

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp"

main().catch(err => console.log(err))

async function main() {
  await mongoose.connect(dbUrl).then(() => {
    console.log("Mongo connected")
  })
}

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.engine("ejs", ejsMate)

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "public")))
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
)

const secret = process.env.SECRET || "thisshouldbeabettersecret"

app.use(
  session({
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      // secure: true,
      expires: Date.now() + 604800000,
      maxAge: 604800000,
    },
    store: MongoStore.create({
      mongoUrl: dbUrl,
      touchAfter: 24 * 60 * 60, // unnucessary updates when the data in the session has not changed
      crypto: {
        secret,
      },
    }).on("error", e => {
      console.log("SESSION STORE ERROR", e)
    }),
  })
)
app.use(flash())
// app.use(helmet())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportLocal(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://res.cloudinary.com/dledbsdis/",
  "https://cdn.maptiler.com/",
]
const styleSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit-free.fontawesome.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://res.cloudinary.com/dledbsdis/",
  "https://cdn.maptiler.com/",
]
const connectSrcUrls = [
  "https://api.maptiler.com/",
  "https://res.cloudinary.com/dledbsdis/",
]

const fontSrcUrls = ["https://res.cloudinary.com/dledbsdis/"]

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dledbsdis/",
        "https://images.unsplash.com/",
        "https://api.maptiler.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
      mediaSrc: ["https://res.cloudinary.com/dledbsdis/"],
      childSrc: ["blob:"],
    },
  })
)

app.use((req, res, next) => {
  console.log(req.query)
  res.locals.currentUser = req.user
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  next()
})

app.get("/fakeuser", async (req, res) => {
  const user = await new User({
    email: "jay@jaymail.com",
    username: "JaYYY",
  })
  const newUser = await User.register(user, "papoose")
  res.send(newUser)
})

app.use("/", userRoutes)
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)

app.get("/", (req, res) => {
  res.render("home")
})

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found!!", 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  if (!err.message) err.message = "Oh No, Something went wrong."
  res.status(statusCode).render("error", { err })
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`SERVING ON PORT ${port}`)
})
