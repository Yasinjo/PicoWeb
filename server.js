var express = require('express');
var app = express();
var port = process.env.port || 9090;

//Respond with "hello world" for requests that hit our root "/"
app.get("/", function (req, res) {
    res.send("hello world Yassine");
   }); 

app.listen(port, function(){
    var datetime = new Date();
    var message = "Server message test " + port ;
    console.log(message);
});
