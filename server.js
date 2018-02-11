const express = require("express");
const app = express();
const fs = require('fs');
const cheerio = require('cheerio');

const port = 8000;
const story_list = JSON.parse(fs.readFileSync("./story_list.json"));
const no_child_list = [];

function write_log(str){
    str = "[" + new Date() + "] " + str; 
    console.log(str);
    fs.appendFile('/log', str + '\n', function(err){});
}

app.get("/", function(req, res) {
    res.redirect('/index.html');
});

app.get("/write_story.html",function(req, res) {
    const doc = fs.readFileSync("write_story.html", "utf8");
    const $ = cheerio.load(doc);
    const index = Math.floor(Math.random() * no_child_list.length);
    $('#pre_story').text(story_list[no_child_list[index]]["context"]);
    $('#story_no').text(story_list[no_child_list[index]]["no"]);
    res.send($.html());
    write_log(req.ip + " GET " +req.url + " " + req.protocol + " 200");
});

app.get("/final.html",function(req, res) {
    const text = ["愛上一匹野馬可我的家裡沒有草原", "我擁有的都是僥倖啊我失去的都是人生", "霧是很容易飄散的想念你", "把你點亮的人忘了在離開的時候把你熄滅", "把你的影子風乾老的時候下酒", "雲淡風輕"]
    const no = Math.floor(Math.random() * text.length);
    const doc = fs.readFileSync("final.html", "utf8");
    const $ = cheerio.load(doc);
    const index = Math.floor(Math.random() * no_child_list.length);
    $('#about_you').text(text[no]);
    res.send($.html());
    write_log(req.ip + " GET " +req.url + " " + req.protocol + " 200");
});

function exit(){
    location.href = "/";
}

app.get("/*.html", function(req, res) {
    res.sendFile(__dirname + (req.url == "/"? "/index.html": req.url), function(err) {
        if (err){
            res.sendStatus(404);
            write_log(req.ip + " GET " +req.url + " " + req.protocol + " 404");
        }    
        else write_log(req.ip + " GET " +req.url + " " + req.protocol + " 200");
    });
});

// Other file
app.get(/(.*)\.(jpg|gif|png|ico|css|js|txt)/i, function(req, res) {
    res.sendFile(__dirname + "/" + req.params[0] + "." + req.params[1], function(err) {
        if (err){
            res.sendStatus(404);
            write_log(req.ip + " GET " +req.url + " " + req.protocol + " 404");
        }    
        else write_log(req.ip + " GET " +req.url + " " + req.protocol + " 200");
    });
});

app.get("/get_story2", function(req, res) {
    //var no = req.query["no"];
    res.status(200).json(story_list);
    var to_write = "[" + new Date() + "] " + req.ip + " GET " +req.url + " " + req.protocol + " 200";
    console.log(to_write);
    fs.appendFile(__dirname + '/log', to_write + '\n', function(err){});
});

app.get('/put_story', function(req, res) {
    res.send("");
    write_log(req.ip + " GET " +req.path + " " + req.protocol + " 200");
    const no = req.query["no"];
    if (story_list[no]["child"] == -1) story_list[no]["child"] = story_list.length;
    else{
        no = story_list[no]["child"];
        while (story_list[no]["sibling"] != -1) no = story_list[no]["sibling"];
        story_list[no]["sibling"] = story_list.length;
    }
    story_list.push({"no": story_list.length, "context": req.query["context"], "child": -1, "sibling": -1});
    for (let i = 0;i < no_child_list.length;++i)
        if (no_child_list[i] == no)
            no_child_list.splice(i,1);
    no_child_list.push(story_list.length - 1);
    fs.writeFile("./story_list.json", JSON.stringify(story_list), function(err){});
});

// Intialization
app.listen(port, function() {
    for (var i = 0;i < story_list.length;++i)
        if (story_list[i].child == -1)
            no_child_list.push(i);
    write_log("Listening on " + port); 
});
