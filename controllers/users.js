const User = require("../models/user")

module.exports.userRegisterForm = (req, res) => {
  res.render("users/register")
}

module.exports.registerUser = async (req, res) => {
  try {
    const { email, username, password } = req.body
    const user = await new User({ email, username })
    const registeredUser = await User.register(user, password)
    req.login(registeredUser, err => {
      if (err) return next(err)
      req.flash("success", "Welcome To Yelp Camp!")
      res.redirect("/campgrounds")
    })
  } catch (e) {
    req.flash("error", e.message)
    res.redirect("register")
  }
}

module.exports.userLoginForm = (req, res) => {
  res.render("users/login")
}

module.exports.userLogin = async (req, res) => {
  req.flash("success", "Welcome back")
  const redirectUrl = res.locals.returnTo || "/campgrounds"
  res.redirect(redirectUrl)
}

module.exports.userLogout = (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err)
    }
    req.flash("success", "Goodbye!")
    res.redirect("/campgrounds")
  })
}
