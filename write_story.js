var story_no;

function fill_pre_story(){
    var requestURL = './get_story';
    var request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();
    request.onload = function() {
        var data = request.response;
        story_no = data.no;
        document.getElementById('pre_story').innerHTML = data.context;
    }
}

function put_story(){
    if (document.getElementById('after_story').value.length < 50) alert('這樣有點少诶，多寫一點啦');
    else if (document.getElementById('after_story').value.length > 150) alert('寫太多了啦，留一點故事給別人嗎');
    else{
        var requestURL = './put_story?no=' + story_no + '&context=' + document.getElementById('after_story').value;
        var request = new XMLHttpRequest();
        request.open('GET', requestURL);
        request.responseType = 'json';
        request.send();
        request.onload = function() {}
        alert("Success!\nThank you");
        location.href = "./";
    }
}
