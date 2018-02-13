const express = require("express");
const app = express();
const session = require('express-session');
const fs = require('fs');
const cheerio = require('cheerio');
const request = require("request");

const port = process.env.PORT || 8000;
const no_child_list = [];
const about_you_text = ["愛上一匹野馬可我的家裡沒有草原", "我擁有的都是僥倖啊我失去的都是人生", "霧是很容易飄散的想念你", "把你點亮的人忘了在離開的時候把你熄滅", "把你的影子風乾老的時候下酒", "雲淡風輕"]
let story_list;

function write_log(str){
    str = "[" + new Date() + "] " + str; 
    console.log(str);
    fs.appendFile('/log', str + '\n', function(err){});
}

app.use(session({
    secret: "NTUPHYSxNYMUMED"
    /*
        session.state 1 write_story
                      2 final_no_not_given
                      3 final
        session.pre_story_no
        session.final_no
    */
}));

app.get("/", function(req, res) {
    res.redirect('/index.html');
});

app.get("/index.html",function(req, res) {
    const doc = fs.readFileSync("index.html", "utf8");
    const $ = cheerio.load(doc);
    $('#start').attr("value", "來寫第" + (story_list.length + 1) + "個故事");
    res.send($.html());
    write_log(req.ip + " GET " +req.url + " " + req.protocol + " 200");
});

app.get("/write_story.html",function(req, res) {
    const doc = fs.readFileSync("write_story.html", "utf8");
    const $ = cheerio.load(doc);
    let index = no_child_list[Math.floor(Math.random() * no_child_list.length)];
    if (!req.session.state || req.session.state != 1){
        req.session.state = 1;
        req.session.pre_story_no =index;
    }
    else index = req.session.pre_story_no;
    $('#pre_story').text(story_list[index]["context"]);
    $('#story_no').text(story_list[index]["no"]);
    res.send($.html());
    write_log(req.ip + " GET " +req.url + " " + req.protocol + " 200");
});

app.get("/final.html",function(req, res) {
    const doc = fs.readFileSync("final.html", "utf8");
    const $ = cheerio.load(doc);
    let no = Math.floor(Math.random() * about_you_text.length);
    if (!req.session.state || req.session.state == 1){
        res.redirect("/index.html");
        return;
    }
    else if (req.session.state == 2){ 
        req.session.final_no = no;
        req.session.state = 3;
    }
    else if (req.session.state == 3) no = req.session.final_no;
    $('#about_you').text(about_you_text[no]);
    $('#no').text(no);
    res.send($.html());
    write_log(req.ip + " GET " +req.url + " " + req.protocol + " 200");
});

app.get("/share_meta.html",function(req, res) {
    const doc = fs.readFileSync("share_meta.html", "utf8");
    const $ = cheerio.load(doc);
    let no = Number(req.query["no"]);
    $('#about_you').attr("content", about_you_text[no] || "我無話可說");
    res.send($.html());
    write_log(req.ip + " GET " +req.url + " " + req.protocol + " 200");
});

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
    req.session.state = 2;
    res.send("");
    write_log(req.ip + " GET " +req.path + " " + req.protocol + " 200");
    let no = req.query["no"];
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
/*
    fs.writeFile("./story_list.json", JSON.stringify(story_list), function(err){
        if (err) console.log("gggggggggg");
    });  
*/ 	
	request({
    	url: "http://linux2.csie.ntu.edu.tw:3334/write",
    	method: "POST",
    	json: true,   // <--Very important!!!
    	body: story_list
	}, function (error, response, body){});
});

// Intialization
app.listen(port, function() {
	request({
    	url: "http://linux2.csie.ntu.edu.tw:3334/story_list.json",
    	method: "GET",
  		json: true
	}, function (error, response, body){
		story_list = body;
    	for (var i = 0;i < story_list.length;++i)
        	if (story_list[i].child == -1)
            	no_child_list.push(i);
	});
    write_log("Listening on " + port); 
});
