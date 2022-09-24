//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const itemOne = new Item({
  name: "Welcome to your To Do List"
});

const itemTwo = new Item({
  name: "Hit the + button to add"
});

const itemThree = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [itemOne, itemTwo, itemThree];

// Item.insertMany(defaultItems, (err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Succesfully added");
//   }
// });



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully added");
        }
      });
      res.redirect("/")
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  })

});

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.post("/", (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list.trim();
  const item = new Item({ name: itemName });
  
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", (req, res) => {

  const listName = req.body.listName.trim();
  const checkedID=req.body.check.trim()
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedID, function (err) {
      if (!err) {
        res.redirect("/");
      } else {
        console.log(err);
      }
    })
  } else {
    List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkedID}}},(err,foundList)=> {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }
  
});



app.get("/:customListName", (req, res) => {
  const customListName =_.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, (err, foundList) => {
    if (err) {
      console.log(err);
    } else {
      if (!foundList) {
        //create new 
        const list = new List({ name: customListName, items: defaultItems });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //show existing 
        res.render("list", { listTitle: customListName, newListItems: foundList.items })
      }
    }
  })


})

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
