var story_no;

var text = ["愛上一匹野馬可我的家裡沒有草原", "我擁有的都是僥倖啊我失去的都是人生", "霧是很容易飄散的想念你", "把你點亮的人忘了在離開的時候把你熄滅", "把你的影子風乾老的時候下酒", "雲淡風輕"]
function init(){
    var rnd = Math.floor(Math.random() * 6);
    var obj = document.getElementById("yee")
    obj.innerHTML = (text[rnd])
}

function exit(){
    location.href = "/";
}
