const mongoose = require("mongoose")
const axios = require("axios")
const Campground = require("../models/campground")
const cities = require("./cities")
const { descriptors, places } = require("./seedhelpers")

main().catch(err => console.log(err))

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp").then(() => {
    console.log("Mongo connected")
  })
}

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDb = async () => {
  await Campground.deleteMany({})
  for (let i = 0; i < 400; i++) {
    const rand1000 = Math.floor(Math.random() * 1000)
    const price = Math.floor(Math.random() * 20) + 10
    const camp = new Campground({
      author: "6667359f62b2ae539137222e",
      location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Suscipit dicta, vero delectus reprehenderit numquam et. Qui, voluptatem ducimus. Ipsa quas hic veniam nesciunt. Eveniet magnam exercitationem harum enim nemo tempora!",
      price,
      geometry: {
        type: "Point",
        coordinates: [cities[rand1000].longitude, cities[rand1000].latitude],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dledbsdis/image/upload/v1719193015/YelpCamp/pp9mrqlgns7abeqknun6.jpg",
          filename: "YelpCamp/pp9mrqlgns7abeqknun6",
        },
        {
          url: "https://res.cloudinary.com/dledbsdis/image/upload/v1719193031/YelpCamp/k3iiblyq59tqaouzzygg.jpg",
          filename: "YelpCamp/k3iiblyq59tqaouzzygg",
        },
      ],
    })
    await camp.save()
  }
}

seedDb().then(() => {
  mongoose.connection.close()
})
