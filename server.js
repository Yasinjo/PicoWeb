var express = require('express');
var app = express();
var port = process.env.port || 1337;

app.listen(port, function(){
    var datetime = new Date();
    var message = "Server message" + port ;
    console.log(message);
});
