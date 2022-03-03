const express = require("express");
const mongoose = require("mongoose");
const pinRoute = require("./routes/pins");

const app = express();

app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/ukraine", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongodb connected!");
  })
  .catch((error) => {
    console.log(error);
  });

app.use("/api/pins/", pinRoute);

app.listen(8800, () => {
  console.log("Backend is up and running!");
});
