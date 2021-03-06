const express = require("express");
const app = express();
const session = require('express-session');
const fs = require('fs');
const cheerio = require('cheerio');
const request = require("request");
const nodemailer = require("nodemailer");

const port = process.env.PORT || 8000;
const about_you_text = require("./about_you.json").text;
const gmail = require("./config.json");
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmail.user,
    pass: gmail.pass
  }
});
let story_list;
let no_child_list = [];

function write_log(str) {
    str = "[" + new Date() + "] " + str; 
    console.log(str);
    fs.appendFile('/log', str + '\n', function(err){});
}

function get_your_no() {
    return Math.floor(Math.random() * about_you_text.length);
}

function get_your_text(no) {
    return about_you_text[no].content + " — <" + about_you_text[no].title + ">";
}

function print_story_list() {
    let tree = [];
    tree[0] = [];
    tree[0][0] = 0;

    function put_item(row, col) {
        let buffer = 0;
        const child = story_list[tree[row][col]].child;
        const sibling = story_list[tree[row][col]].sibling;
        const close = story_list[tree[row][col]].close;
        if (child != -1) {
            if (!tree[row + 1])
                tree[row + 1] = [];
            tree[row + 1][col] = child;
            buffer = put_item(row + 1, col);
        }
        if (close) {
            if (!tree[row + 1])
                tree[row + 1] = [];
            tree[row + 1][col] = -3;
        }
        if (sibling != -1) {
            for (let i = 1;i <= buffer;++i)
                tree[row - 1][col + i] = -2;
            buffer += 1;
            tree[row - 1][col + buffer] = -1;
            tree[row][col + buffer] = sibling;
            buffer = buffer + put_item(row, col + buffer);
        }
        return buffer;
    }

    function full_dig(num) {
        if (num != 0 && !num) return num;
        let ans = num.toString();
        ans = '#' + ans;
        if (ans.length < 5) ans = ' ' + ans;
        if (ans.length < 5) ans = ' ' + ans;
        if (ans.length < 5) ans = ' ' + ans;
        return ans;
    }

    put_item(0, 0);
    var ans = "";
    for (let i = 0;i < tree.length;++i) {
        for (let j = 0;j < tree[i].length;++j) {
            if (tree[i][j] >= 0) ans = ans + full_dig(tree[i][j]);
            else if (tree[i][j] == -3) ans = ans + "    X";
            else ans = ans + "     ";
        }
        ans = ans + "\n";
        for (let j = 0;j < tree[i].length;++j) {
            if (tree[i][j] != 0 && !tree[i][j]) ans = ans + "     ";
            else if (tree[i][j] == -1) ans = ans + "----+";
            else if (tree[i][j] == -2) ans = ans + "-----";
            else if (tree[i + 1] && tree[i + 1][j]) ans = ans + "    |";
            else ans = ans + "     ";
        }
        ans = ans + "\n";
        
    }
    return ans;
}

function get_real_ip(req) {
    var ipAddr = req.headers["x-forwarded-for"];
    if (ipAddr) {
        var list = ipAddr.split(",");
        ipAddr = list[list.length-1];
    } 
    else
        ipAddr = req.connection.remoteAddress;
    return ipAddr;
}

function send_mail(type, no_prev, no_new) {

    var mailOptions = {
        from: 'story.nymu',
        to: gmail.to,
    };
    // Receive
    if (type == 0) {
        mailOptions.subject = '#' + no_new + " Story!";
        mailOptions.html = "<pre style='font-family: Courier New'>Receive #" + no_new + " story @" + story_list[no_new].time + ", from: " + story_list[no_new].ip + "\n\nPrevious story:\n" + story_list[no_prev].context + "\n\nNew story:\n" + story_list[no_new].context + '\n\nBranch status:\n' + print_story_list() + "</pre>";
    }
    // Close
    if (type == 1) {
        mailOptions.subject = "Close branch #" + no_new;
        mailOptions.html = "<pre style='font-family: Courier New'>Close branch #" + no_new + " @" + new Date() + '\n\nBranch status:\n' + print_story_list() + "</pre>";
    }
    // Receive
    if (type == 2) {
        mailOptions.subject = "Open branch #" + no_new;
        mailOptions.html = "<pre style='font-family: Courier New'>Open branch #" + no_new + " @" + new Date() + '\n\nBranch status:\n' + print_story_list() + "</pre>";
    }
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function backup_data(i) {
    if (gmail.test) return;
	request({
    	url: "http://linux2.csie.ntu.edu.tw:3334/write",
    	method: "POST",
    	json: true, 
    	body: story_list[i]
	}, function (error, response, body){});
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
    res.sendFile(__dirname + '/index.html');
    write_log(get_real_ip(req) + " GET " +req.url + " " + req.protocol + " 200");
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
    write_log(get_real_ip(req) + " GET " +req.url + " " + req.protocol + " 200");
});

app.get("/final.html",function(req, res) {
    const doc = fs.readFileSync("./final.html", "utf8");
    const $ = cheerio.load(doc);
    let no = get_your_no;
    if (!req.session.state || req.session.state == 1){
        res.redirect("/index.html");
        return;
    }
    else if (req.session.state == 2){ 
        req.session.final_no = no;
        req.session.state = 3;
    }
    else if (req.session.state == 3) no = req.session.final_no;
    $('#no').text(no);
    res.send($.html());
    write_log(get_real_ip(req) + " GET " +req.url + " " + req.protocol + " 200");
});

// ======mobile======

app.get("/mobile_index.html",function(req, res) {
    res.sendFile(__dirname + '/mobile_index.html');
    write_log(get_real_ip(req) + " GET " +req.url + " " + req.protocol + " 200");
});

app.get("/mobile_write_story.html",function(req, res) {
    const doc = fs.readFileSync("mobile_write_story.html", "utf8");
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
    write_log(get_real_ip(req) + " GET " +req.url + " " + req.protocol + " 200");
});

app.get("/mobile_final.html",function(req, res) {
    const doc = fs.readFileSync("mobile_final.html", "utf8");
    const $ = cheerio.load(doc);
    let no = get_your_no();
    if (!req.session.state || req.session.state == 1){
        res.redirect("/index.html");
        return;
    }
    else if (req.session.state == 2){ 
        req.session.final_no = no;
        req.session.state = 3;
    }
    else if (req.session.state == 3) no = req.session.final_no;
    $('#no').text(no);
    res.send($.html());
    write_log(get_real_ip(req) + " GET " +req.url + " " + req.protocol + " 200");
});

// ==================

app.get("/share_meta.html",function(req, res) {
    const doc = fs.readFileSync("share_meta.html", "utf8");
    const $ = cheerio.load(doc);
    let no = Number(req.query["no"]);
    $('#about_you').attr("content", get_your_text(no) || "我無話可說");
    res.send($.html());
    write_log(get_real_ip(req) + " GET " +req.url + " " + req.protocol + " 200");
});

// Other file
app.get(/(.*)\.(jpg|gif|png|ico|css|js|txt)/i, function(req, res) {
    res.sendFile(__dirname + "/" + req.params[0] + "." + req.params[1], function(err) {
        if (err){
            res.sendStatus(404);
            write_log(get_real_ip(req) + " GET " +req.url + " " + req.protocol + " 404");
        }    
        else write_log(get_real_ip(req) + " GET " +req.url + " " + req.protocol + " 200");
    });
});

app.get("/curiosity_killed_the_cat", function(req, res) {
    res.sendFile(__dirname + "/read_story.html", function(err) {
        if (err){
            res.sendStatus(404);
            write_log(get_real_ip(req) + " GET " +req.url + " " + req.protocol + " 404");
        }    
        else write_log(get_real_ip(req) + " GET " +req.url + " " + req.protocol + " 200");
    });
});

app.get("/cry_cat", function(req, res) {
    const type = req.query["type"];
    const no = req.query["no"];
    // get json
    if (!type) {
        res.status(200).json(story_list);
        write_log(get_real_ip(req) + " GET " +req.url + " " + req.protocol + " 200");
    }
    // close 
    if (type == 1) {
        // cna't close all branch
        if (no_child_list.find(x => x == no) && no_child_list.length > 1 && !story_list[no].close) {
            story_list[no].close = 1;
            no_child_list = no_child_list.filter(x => x != no);
            backup_data(no);
            send_mail(1, -1, no);
        }
        res.status(200).end();
        write_log(get_real_ip(req) + " GET " +req.url + " " + req.protocol + " 200 close: " + no);
    }
    // open 
    if (type == 2) {
        if (story_list[no].child == -1 && story_list[no].close) {
            story_list[no].close = 0;
            no_child_list.push(no);
            backup_data(no);
            send_mail(2, -1, no);
        }
        res.status(200).end();
        write_log(get_real_ip(req) + " GET " +req.url + " " + req.protocol + " 200 open: " + no);
    }
});

app.get('/put_story', function(req, res) {
    if (req.session.state != 1) return;
    req.session.state = 2;
    res.send("");
    write_log(get_real_ip(req) + " GET " +req.path + " " + req.protocol + " 200");
    let no = req.query["no"];
    if (!no_child_list.find(x => x==no)) return;
    if (story_list[no]["child"] == -1) {
        story_list[no]["child"] = story_list.length;
        backup_data(no);
    }
    else{
        no = story_list[no]["child"];
        while (story_list[no]["sibling"] != -1) no = story_list[no]["sibling"];
        story_list[no]["sibling"] = story_list.length;
        backup_data(no);
    }
    story_list.push({"no": story_list.length, "context": req.query["context"], "child": -1, "sibling": -1, "time": new Date(), "ip": get_real_ip(req)});
    for (let i = 0;i < no_child_list.length;++i)
        if (no_child_list[i] == no)
            no_child_list.splice(i,1);
    no_child_list.push(story_list.length - 1);
    send_mail(0, no, story_list.length - 1);
    backup_data(story_list.length - 1);
/*
    fs.writeFile("./story_list.json", JSON.stringify(story_list), function(err){
        if (err) console.log("gggggggggg");
    });  
*/ 	


});

// Intialization
app.listen(port, function() {
    /*
    fs.readFile(story_list, "./story_list.json", function(err){
        if (err) console.log("gggggggggg");
    });  
    */
    
    // init data
	request({
    	url: "http://linux2.csie.ntu.edu.tw:3334/story_list.json",
    	method: "GET",
  		json: true
	}, function (error, response, body){
		story_list = body;
    	for (var i = 0;i < story_list.length;++i)
        	if (story_list[i].child == -1 && !story_list[i].close)
            	no_child_list.push(i);
	});
    // 
    write_log("Listening on " + port); 
});
