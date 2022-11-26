window.onscroll = percent;// 执行函数
document.querySelector("#rightside").style.display = 'none';
// 页面百分比
function percent() {
    let a = document.documentElement.scrollTop || window.pageYOffset, // 卷去高度
        b = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight) - document.documentElement.clientHeight, // 整个网页高度
        result = Math.round(a / b * 100), // 计算百分比
        up = document.querySelector("#go-up") // 获取按钮
    if (result == 0) {
        document.querySelector("#rightside").style.display = 'none';
    } else {
        document.querySelector("#rightside").style.display = 'block';
        if (result <= 95) {
            up.childNodes[0].style.display = 'none';
            up.childNodes[1].style.display = 'block';
            document.querySelector("#go-down").style.display = 'block';
            document.querySelector("#to_comment").style.display = 'block';   //侧边栏评论区显示
            up.childNodes[1].innerHTML = result;
        } else {
            up.childNodes[1].style.display = 'none';
            up.childNodes[0].style.display = 'block';
            document.querySelector("#go-down").style.display = 'none';
            document.querySelector("#to_comment").style.display = 'none';   //侧边栏评论区隐藏
        }
    }
}