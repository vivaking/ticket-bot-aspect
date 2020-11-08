const { mongo_uri } = require("../../config.json");
const mongoose = require("mongoose");
module.exports = {
  init: () => {
    const dbOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    mongoose.connect(mongo_uri, dbOptions).catch((err) => console.log(err));

    mongoose.connection.on("connected", () => {
      console.log("Connected to MongoDB!");
    });
    mongoose.connection.on("disconnected", () => {
      console.log("Disconnected from MongoDB!");
    });
  },
};
