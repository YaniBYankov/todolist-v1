const express = require("express");
const bodyParser = require("body-parser");

const app = express();


app.get("/", function (req, res) {
    var today = new Date();
    if (today.getDay() == 6 || today.getDay() == 0) {
        res.sendFile(__dirname + "/index.html");
    }
    else {
        res.send("No");
    }
    
});



app.listen(3000, function () {
    console.log("Server is running on port 3000");
})