const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const searchtext = "";
const request=require("request");
const nodemailer = require("nodemailer");


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

app.get("/newsletter", function(req, res) {
  res.render("newsletter");
});

app.post("/send", function(req, res) {
  newsletter_template = `
  <!DOCTYPE html>
  <html>
  <head>
    <title></title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Montserrat:wght@700&display=swap" rel="stylesheet">
    <style type="text/css">
      .whole {
        background: linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(31,159,76,0.9699230033810399) 50%, rgba(2,47,56,1) 87%);
        color: white;
        padding: 7%;
      }
      h1 {
        text-align: center;
        font-family: 'Montserrat', sans-serif;
        font-weight: 600;
        margin-top: 50px;
        margin-bottom: 50px;
      }
      .card {
        background: rgb(0, 128, 102);
        padding: 4%;
        margin-bottom: 20px;
      }
      .card-title {
        color: white;
      }
    </style>
  </head>
  <body>
    <div class="whole">
      <h1>THE VIT EXPRESS</h1>
      <div class="container">
        <div class="card">
          <h3 class="card-title">You definitely don't wanna believe this!</h3>
          <p class="card-text">
            ${req.body.rumour}
          </p>
        </div>
        <div class="card">
          <h3 class="card-title">Trending in VIT</h3>
          <p class="card-text">
            ${req.body.headlines}
          </p>	
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    // host: "mail.google.com",
    // port: 587,
    // secure: false, // true for 465, false for other ports
    service: "Gmail",
    auth: {
      user: "thevitexpress308@gmail.com", // generated ethereal user
      pass: "vitnews123", // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // setup email data with defined transport object
  let mailOptions = {
    from: '"THE VIT EXPRESS" <thevitexpress308@gmail.com>', // sender address
    to: "kkarthikmadduri1729@gmail.com", // list of receivers
    subject: "THE VIT EXPRESS NEWSLETTER", // Subject line
    // text: "Hello world?", // plain text body
    html: newsletter_template, // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if(error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  });

  
  res.render("success");
});


app.listen(3000, function() {
  console.log("The server has started");
});
