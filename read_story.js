var pre_story_no;
var after_story_no;
var sibling_story_no;

function init(){
    pre_story_no = 0;
    fill_story();
}

function next_story(){
    if (after_story_no == -1) alert("to be continue...");
    else{
        pre_story_no = after_story_no;
        fill_story();
    }
}

function another_story(){
    if (sibling_story_no == -1) alert("no more branch...");
    else{
        after_story_no = sibling_story_no;
        var requestURL = './get_story2';
        var request = new XMLHttpRequest();
        request.open('GET', requestURL);
        request.responseType = 'json';
        request.send();
        request.onload = function() {
            var data = request.response;
            sibling_story_no = data[after_story_no].sibling;
            document.getElementById('after_story').innerHTML = data[after_story_no].context;
        }
    }
}

function fill_story(){
    var requestURL = './get_story2';
    var request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();
    request.onload = function() {
        var data = request.response;
        after_story_no = data[pre_story_no].child;
        document.getElementById('pre_story').innerHTML = data[pre_story_no].context;
        if (after_story_no == -1){
            document.getElementById('after_story').innerHTML = "to be continue...";
            sibling_story_no = -1;
        }
        else {
            sibling_story_no = data[after_story_no].sibling;
            document.getElementById('after_story').innerHTML = data[after_story_no].context;
        }
    }
}

function fill_after_story(){
        var requestURL = './get_story2?no=' + after_story_no;
        var request = new XMLHttpRequest();
        request.open('GET', requestURL);
        request.responseType = 'json';
        request.send();
        request.onload = function() {
            var data = request.response;
        console.log(after_story_no);
        }
}

function put_story(){
    var requestURL = './put_story?no=' + story_no + '&context=' + document.getElementById('after_story').value;
    var request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();
    request.onload = function() {
    }
    alert("Success!\nThank you");
    location.href = "./";
}
