const mongoose= require("mongoose");
require('dotenv').config();
const DB = process.env.DATABASE;

mongoose.connect(DB)
.then(() => {
    console.log("Connected to database!");
})
.catch((error) => {
    console.log("Connection failed!:" + error.message);
    console.log(error);
});

module.exports= mongoose;