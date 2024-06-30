const express = require("express")
const reviews = require("../controllers/reviews")
const router = express.Router({ mergeParams: true })
const {
  validateReview,
  isLoggedIn,
  isAuthor,
  isReviewAuthor,
} = require("../middleware")

const catchAsyncError = require("../utils/catchAsyncError")
const ExpressError = require("../utils/EspressError")

const Campground = require("../models/campground")
const Review = require("../models/reviews")

router.post(
  "/",
  isLoggedIn,
  validateReview,
  catchAsyncError(reviews.postReview)
)

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsyncError(reviews.deleteReview)
)

module.exports = router
