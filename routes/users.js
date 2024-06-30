const express = require("express")
const router = express.Router()
const passport = require("passport")
const catchAsync = require("../utils/catchAsyncError")
const User = require("../models/user")
const users = require("../controllers/users")
const { storeReturnTo } = require("../middleware")

router
  .route("/register")
  .get(users.userRegisterForm)
  .post(catchAsync(users.registerUser))

router
  .route("/login")
  .get(users.userLoginForm)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.userLogin
  )

router.get("/logout", users.userLogout)

module.exports = router
