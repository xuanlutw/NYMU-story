let no;
let pre_no;
let story_list;

function init() {
    const requestURL = './cry_cat';
    const request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();
    request.onload = function() {
        story_list = request.response;
        no = 0;
        update();
    }
    document.onkeydown = function(){
        const keycode = event.which || event.keyCode;
        if (keycode == 37) to_left();
        if (keycode == 38) to_up();
        if (keycode == 39) to_right();
        if (keycode == 40) to_down();
    }
}

function update() {
    if (no == 0) {
        document.getElementById('pre_story_title').innerHTML = 'Pre story';
        document.getElementById('pre_story_content').innerHTML = '起點ˊˇˋ'; 
    }
    else {
        document.getElementById('pre_story_title').innerHTML = 'Pre story #' + pre_no;
        document.getElementById('pre_story_content').innerHTML = story_list[pre_no].context; 
    }
    document.getElementById('now_story_title').innerHTML = 'Now story #' + no;
    document.getElementById('now_story_content').innerHTML = story_list[no].context;
    document.getElementById('button_up').disabled = (no==0);
    document.getElementById('button_down').disabled = (story_list[no].child == -1);
    document.getElementById('button_left').disabled = (!story_list.find(x => x.sibling == no));
    document.getElementById('button_right').disabled =(story_list[no].sibling == -1);
    document.getElementById('tree').innerHTML = print_story_list(no);
}

function print_story_list(no) {
    let tree = [];
    tree[0] = [];
    tree[0][0] = 0;

    function put_item(row, col) {
        let buffer = 0;
        const child = story_list[tree[row][col]].child;
        const sibling = story_list[tree[row][col]].sibling;
        if (child != -1) {
            if (!tree[row + 1])
                tree[row + 1] = [];
            tree[row + 1][col] = child;
            buffer = put_item(row + 1, col);
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
            if (tree[i][j] >= 0){
                if (tree[i][j] == no) ans += '<font color="red">';
                ans = ans + full_dig(tree[i][j]);
                if (tree[i][j] == no) ans += '</font>';
            }
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

function to_up() {
    function valid(x) {
        if (x.child == pre_no) return 1;
        if (x.child < 0) return 0;
        function valid_inner(x) {
            if (x.no == pre_no) return 1;
            if (x.sibling == -1) return 0;
            return valid_inner(story_list[x.sibling]);
        }
        return valid_inner(story_list[x.child]);
    }
    if (no != 0) {
        no = pre_no;
        pre_no = story_list.find(x => valid(x)).no;
    }
    update();
}

function to_down() {
    if (story_list[no].child != -1) {
        pre_no = no;
        no = story_list[no].child;
    }
    update();
}

function to_right() {
    if (story_list[no].sibling != -1) no = story_list[no].sibling;
    update();
}

function to_left() {
    if (story_list.find(x => x.sibling == no)) no = story_list.find(x => x.sibling == no).no;
    update();
}
