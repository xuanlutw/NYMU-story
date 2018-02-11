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
        request.onload = function() {
            location.href = "./final.html";
        }
    }
}
var text = ["愛上一匹野馬可我的家裡沒有草原", "我擁有的都是僥倖啊我失去的都是人生", "霧是很容易飄散的想念你", "把你點亮的人忘了在離開的時候把你熄滅", "把你的影子風乾老的時候下酒", "雲淡風輕"]
function yeeee(){
    var rnd = Math.floor(Math.random() * 6);
    alert("關於你的最近\n" + text[rnd]);
    location.href = "./";
}
