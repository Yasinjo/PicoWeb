var express = require('express');
var app = express();
var port = process.env.port || 1337;

app.listen(port, function(){
    var datetime = new Date();
    var message = "Server Test on port 1 " + port ;
    console.log(message);
});
