var express = require("express");
var app = express();
var fs = require('fs');

var port = 8000;
var story_list;
var no_child_list;

// Index.html
app.get("/", function(req, res) {
    res.sendfile(__dirname + '/index.html', function(err) {
        if (err){
            res.send(404);
            var to_write = "[" + new Date() + "] " + req.ip + " GET " +req.url + " " + req.protocol + " 404";
            console.log(to_write);
            fs.appendFile(__dirname + '/log', to_write + '\n', function(err){});
        }
        else{
            var to_write = "[" + new Date() + "] " + req.ip + " GET " +req.url + " " + req.protocol + " 200";
            console.log(to_write);
            fs.appendFile(__dirname + '/log', to_write + '\n', function(err){});
        }
    });
});


// Other html
app.get("/*.html", function(req, res) {
    res.sendfile(__dirname + req.url, function(err) {
        if (err){
            res.send(404);
            var to_write = "[" + new Date() + "] " + req.ip + " GET " +req.url + " " + req.protocol + " 404";
            console.log(to_write);
            fs.appendFile(__dirname + '/log', to_write + '\n', function(err){});
        }
        else{
            var to_write = "[" + new Date() + "] " + req.ip + " GET " +req.url + " " + req.protocol + " 200";
            console.log(to_write);
            fs.appendFile(__dirname + '/log', to_write + '\n', function(err){});
        }
    });
});

// Other file
app.get(/(.*)\.(jpg|gif|png|ico|css|js|txt)/i, function(req, res) {
    res.sendfile(__dirname + "/" + req.params[0] + "." + req.params[1], function(err) {
        if (err){
            res.send(404);
            var to_write = "[" + new Date() + "] " + req.ip + " GET " +req.url + " " + req.protocol + " 404";
            console.log(to_write);
            fs.appendFile(__dirname + '/log', to_write + '\n', function(err){});
        }
        else{
            var to_write = "[" + new Date() + "] " + req.ip + " GET " +req.url + " " + req.protocol + " 200";
            console.log(to_write);
            fs.appendFile(__dirname + '/log', to_write + '\n', function(err){});
        }
    });
});

app.get("/get_story2", function(req, res) {
    //var no = req.query["no"];
    res.status(200).json(story_list);
    var to_write = "[" + new Date() + "] " + req.ip + " GET " +req.url + " " + req.protocol + " 200";
    console.log(to_write);
    fs.appendFile(__dirname + '/log', to_write + '\n', function(err){});
});

app.get("/get_story", function(req, res) {
    var index = Math.floor(Math.random() * no_child_list.length);
    res.status(200).json(story_list[no_child_list[index]])
    var to_write = "[" + new Date() + "] " + req.ip + " GET " +req.url + " " + req.protocol + " 200";
    console.log(to_write);
    fs.appendFile(__dirname + '/log', to_write + '\n', function(err){});
});

app.get('/put_story', function(req, res) {
    res.send("");
    var to_write = "[" + new Date() + "] " + req.ip + " GET " +req.path + " " + req.protocol + " 200";
    console.log(to_write);
    fs.appendFile(__dirname + '/log', to_write + '\n', function(err){});
    var no = req.query["no"];
    if (story_list[no]["child"] == -1) story_list[no]["child"] = story_list.length;
    else{
        no = story_list[no]["child"];
        while (story_list[no]["sibling"] != -1) no = story_list[no]["sibling"];
        story_list[no]["sibling"] = story_list.length;
    }
    story_list.push({"no": story_list.length, "context": req.query["context"], "child": -1, "sibling": -1});
    for (var i = 0;i < no_child_list.length;++i)
        if (no_child_list[i] == no)
            no_child_list.splice(i,1);
    no_child_list.push(story_list.length - 1);
    fs.writeFile("./story_list.json", JSON.stringify(story_list), function(err){});
});

// Intialization
app.listen(port, function() {
    story_list = JSON.parse(fs.readFileSync("./story_list.json"));
    no_child_list = [];
    for (var i = 0;i < story_list.length;++i)
        if (story_list[i].child == -1)
            no_child_list.push(i);
    var to_write = "[" + new Date() + "] Listening on " + port; 
    console.log(to_write);
    fs.appendFile(__dirname + '/log', to_write + '\n', function(err){});
});
