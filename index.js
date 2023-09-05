import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { name } from "ejs";

const app = express();
const port = 3000;
const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const date = new Date();
const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const m = new Date(); 



var today = weekday[date.getDay()]  + ", " +  month[m.getMonth()] + " " +  new Date().getDate();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://sumguywantstobreakin:3xDHqUBRbGqcoGgM@cluster0.lzdvp5c.mongodb.net/todolistDB', {
    useNewUrlParser: true, useUnifiedTopology: true
})

.then(() => {
    console.log(`Connected to Mongo!`);
})
.catch((err) => {
    console.log(`Connection Error!`);
    console.log(err);
});
const itemsSchema = new mongoose.Schema({
    name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<---Hit these to delete an item"
});

const defaultItems = [item1, item2, item3];
const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", (req, res) => {
    
Item.find({})

.then(foundItem => {
    if(foundItem.length ===  0)  {
        return Item.insertMany(defaultItems);
    } else {
        return foundItem;
    }
})

.then(foundItem => {
    res.render("index.ejs",{
        Today: today,
        newListItems: foundItem,
        
})

});

});




app.get("/:customListName", (req, res) => {
    
 
    const customListName = req.params.customListName;

    List.findOne({name:customListName})
    .then(foundList => {
        if (!foundList){
            const list = new List({
                name: customListName,
                items: defaultItems,
              
                
            });
            list.save();
            res.redirect("/" + customListName);
        } else {
            res.render("custom.ejs",{
                listTitle: foundList.name,
                newListItems: foundList.items
                
        });
        }
    });

});

app.post("/", (req,res) => {

    const newItem = req.body.newItem;
    const listName = req.body.list
    const item = new Item({
        name: newItem
    });

    if (listName === today) {
        item.save()
        res.redirect("/")
    } else {
        List.findOne({name: listName})
        .then(foundList => {
            foundList.items.push(item)
            foundList.save();
            res.redirect("/" + listName)
        })
    }
});


app.post("/delete", (req, res) => {
    const deleteItem = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === today) {
        Item.findByIdAndRemove({_id: deleteItem}).then(()=> {
            res.redirect("/");
            console.log("Successfully deleted from the todolistDB")
        }).catch((err) => {
            console.log(err);
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deleteItem}}})
        .then(()=> {
            res.redirect("/" + listName);
        })
    }
   
});
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });