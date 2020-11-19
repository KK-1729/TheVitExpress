const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const searchtext = "";
const request=require("request");


app.use(bodyParser.urlencoded({
  extended: true,
  useUnifiedTopology: true
}));
app.use(express.static(__dirname + "/public"));
mongoose.connect("mongodb://localhost:27017/newsdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
app.set("view engine", "ejs");


const newsschema = {
  title: String,
  date: String,
  class: String,
  content: String
};

const News = mongoose.model("News", newsschema);



app.get("/", function(req, res) {
  var count1 = 0;
  News.find({}, function(err, found) {
    if (!err) {

      res.render("home", {
        posts: found,
      })
    } else {
      console.log(err);
    }
  });
});



app.get("/subscribe", function(req, res) {
  res.render("subscribe");
});
app.post("/subscribe", function(req, res) {
  var firstname = req.body.fname;
  var lastname = req.body.lname;
  var email = req.body.email;

  var data = {
    members: [{
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstname,
        LNAME: lastname
      }
    }]
  };
  var jsondata = JSON.stringify(data);
  //console.log(firstname,lastname,email);

  var options = {
    url: "https://us17.api.mailchimp.com/3.0/lists/1e2cd46765",
    method: "POST",
    headers: {
      "Authorization": "yash1 b1956c0b0c7e82ce98c9469b1e16fc71-us17"
    },
    body: jsondata
  };
  request(options, function(error, response, body) {
    if (error) {
      console.log(error);
    } else {
      if (response.statusCode === 200) {
        res.render("success");
      }
    }
  });
});







app.get("/compose", function(req, res) {
  News.find({}, function(err, foundBlog) {

    res.render("compose");


  });
});
app.get("/about", function(req, res) {
  res.render("about");
});


app.post("/compose", function(req, res) {

  const titlename = _.capitalize(req.body.posttitle);
  const classname = req.body.classname;
  const contentname = req.body.postbody;

  const news = new News({
    title: titlename,
    class: classname,
    content: contentname
  });
  News.findOne({
    title: titlename
  }, function(err, foundBlog) {
    if (!foundBlog) {
      news.save();
      res.redirect("/");
    } else {
      console.log(err);
    }
  });
});


app.get("/posts/:postId", function(req, res) {

  const requestedPostId = (req.params.postId);

  News.findOne({
    _id: requestedPostId
  }, function(err, news) {
    res.render("post", {
      content: news
    });

  })
});

app.get("/success", function(req, res) {
  res.render("success");
});




app.listen(3000, function() {
  console.log("The server has started");
});
