const express = require("express")
const router = express.Router()
const campgrounds = require("../controllers/campgrounds")
const catchAsyncError = require("../utils/catchAsyncError")
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware")
const multer = require("multer")
const { storage, cloudinary } = require("../cloudinary/index")
const upload = multer({ storage })

const Campground = require("../models/campground")

router
  .route("/")
  .get(catchAsyncError(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsyncError(campgrounds.createCampground)
  )

router.get("/new", isLoggedIn, campgrounds.renderNewForm)

router
  .route("/:id")
  .get(catchAsyncError(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsyncError(campgrounds.editCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsyncError(campgrounds.deleteCampground))

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsyncError(campgrounds.renderEditForm)
)

module.exports = router
