if(localStorage.getItem("blur")=="false"){
    var blur=0;
    }else{
        var blur=1;
    
    }
    if(localStorage.getItem("yjjs")=="true"){
        var yjjs=1;
    }else{
        var yjjs=0;
        
    }
    if(localStorage.getItem("fpson")==undefined){
        localStorage.setItem("fpson","1");
    }
if(!blur){
    document.getElementById("settingStyle").innerText=`
    *{
        -webkit-backdrop-filter: none!important;
        backdrop-filter: none!important;
        -webkit-filter: none!important;
        filter: none!important;
    }`}
    else{
        document.getElementById("settingStyle").innerText=''
    }
function setBlur(){
    blur=!blur;
    localStorage.setItem("blur",blur);
    if(!blur){
    document.getElementById("settingStyle").innerText=`
    *{
        -webkit-backdrop-filter: none!important;
        backdrop-filter: none!important;
        -webkit-filter: none!important;
        filter: none!important;
    }`}
    else{
        document.getElementById("settingStyle").innerText=''
    }
}
// if(yjjs){
//     document.getElementById("yjjs").innerText=`
//     *:not(#web_bg){
//         transform:translateZ(0);
//         backface-visibility: hidden
//     }`}
//     else{
//         document.getElementById("yjjs").innerText=``
//     }
function yjjs1(){
    yjjs=!yjjs;
    localStorage.setItem("yjjs",yjjs)
    // if(yjjs){
    // document.getElementById("yjjs").innerText=`
    // *:not(#web_bg){
    //     transform:translateZ(0);
    //     backface-visibility: hidden
    // }`}
    // else{
    //     document.getElementById("yjjs").innerText=``
    // }
}
if(localStorage.getItem("theme")=="acrylic"){
    document.getElementById("css").href=""
}
switchTheme=function(){
    if(document.getElementById("css").href==window.location.protocol+"//"+window.location.host+"/css/stylessimple.css"){
        document.getElementById("css").href=""
        localStorage.setItem("theme","acrylic");
    }else{
        document.getElementById("css").href="/css/stylessimple.css"
        localStorage.setItem("theme","simple");
    }
}
setColor=function(c){
    document.getElementById("themeColor").innerText=`:root{--lyx-theme:var(--lyx-${c})!important}`;
    localStorage.setItem("themeColor",c);

}

if(localStorage.getItem("themeColor")==undefined){
    localStorage.setItem("themeColor","pink");
}

setColor(localStorage.getItem("themeColor"));



if(localStorage.getItem("hideRightside")==undefined){
    localStorage.setItem("hideRightside","0");
}

if(localStorage.getItem("hideRightside")=="1"){
    $("#rightside").toggle()
}
function toggleRightside(){
    $("#rightside").toggle();
    localStorage.setItem("hideRightside",Math.abs(Number(localStorage.getItem("hideRightside"))-1))
}












if(localStorage.getItem("font")==undefined){
    localStorage.setItem("font","HYTMR")
}
setFont(localStorage.getItem("font"))
// ?????????
// name????????? data?????????
function saveData(name, data) {
    localStorage.setItem(name, JSON.stringify({ 'time': Date.now(), 'data': data }))
}

// ?????????
// name????????? time???????????????,????????????,?????????30,??????????????????????????????30????????????0,??????????????????
function loadData(name, time) {
    let d = JSON.parse(localStorage.getItem(name));
    // ???????????????????????? 0 ??????????????????
    if (d) {
        let t = Date.now() - d.time
        if (t < (time * 60 * 1000) && t > -1) return d.data;
    }
    return 0;
}

// ???????????????????????????????????????????????????????????????????????????????????????

// ????????????
try {
    let data = loadData('blogbg', 1440)
    if (data) changeBg(data, 1)
    else localStorage.removeItem('blogbg');
} catch (error) { localStorage.removeItem('blogbg'); }

// ??????????????????
// ?????????flag?????????????????????????????????????????????,???????????????????????????
// ??????flag???0?????????,???????????????. ???1????????????,?????????????????????????????????.
function changeBg(s, flag) {
    let bg = document.getElementById('web_bg')
    if (s.charAt(0) == '#') {
        bg.style.backgroundColor = s
        bg.style.backgroundImage = 'none'
    } else bg.style.backgroundImage = s
    if (!flag) { saveData('blogbg', s) }
}
function setFont(n){
    localStorage.setItem("font",n)
    if(n=="main"){
        document.body.style.fontFamily="-apple-system, IBM Plex Mono ,monosapce,'????????????', sans-serif"
    }
    else{
        document.body.style.fontFamily="var(--global-font),-apple-system, IBM Plex Mono ,monosapce,'????????????', sans-serif"
        document.documentElement.style.setProperty('--global-font', n)
    }
}
function fpssw(){
    if(localStorage.getItem("fpson")=="1"){
        localStorage.setItem("fpson","0");
    }else{
        localStorage.setItem("fpson","1");
    }
}
// ?????????2.0????????????

// ????????????
var winbox = ''

var isMax=false;
function createWinbox() {
    
    div = document.createElement('div')
    document.body.appendChild(div)
    winbox = WinBox({
        id: 'changeBgBox',
        index: 999,
        title: "????????????",
        x: "center",
        y: "center",
        minwidth: '300px',
        height: "60%",
        background: '#49b1f5',
        onmaximize: () => {
            isMax=true;
            div.innerHTML = `<style>body::-webkit-scrollbar {display: none;}div#changeBgBox {width: 100% !important;}</style>`
        },
        onrestore: () => {
            isMax=false;
            div.innerHTML = ''
        },
    });
    document.getElementsByClassName("wb-close")[0].onclick=function(){
        sessionStorage.setItem("settingWindow","close");
    }
    winResize();
    window.addEventListener('resize', winResize)

    // ????????????????????????????????????????????????????????? a?????? ?????????????????????????????? ????????????????????? ?????????????????????????????????\????????????
    winbox.body.innerHTML = `
    <div class="settings" style="display: block;"><a class="reSettings content-button">??????????????????</a>
    <p></p>
    <h2 class="content-head">????????????</h2>
    <p></p>
    <div class="content" style="display:flex"><input type="checkbox" id="blur" onclick="setBlur()">
        <div class="content-text">??????????????????</div>
    </div>
    <div class="content" style="display:flex"><input type="checkbox" id="yjjs" onclick="yjjs1()">
        <div class="content-text">????????????</div>
    </div>
    <div class="content" style="display:flex"><input type="checkbox" id="fpson" onclick="fpssw()">
        <div class="content-text">?????????????????????<a href="javascript:window.location.reload()">??????</a>????????????</div>
    </div>
    <p></p>
    <h2 class="content-head">????????????</h2>
    <p></p>
    <div class="content" style="display:flex">
        <button class="content-button" onclick="switchTheme()">????????????</button><br><input type="checkbox" id="hideAside" onclick="toggleRightside()">
        <div class="content-text">???????????????</div>
    </div>
    <h3 class="content-head">&nbsp;&nbsp;?????????</h3>
    <p></p>
    <div class="content" style="display:flex"><input type="radio" id="red" name="colors" value=" "
            onclick="setColor('red')"><input type="radio" id="orange" name="colors" value=" "
            onclick="setColor('orange')"><input type="radio" id="yellow" name="colors" value=" "
            onclick="setColor('yellow')"><input type="radio" id="green" name="colors" value=" "
            onclick="setColor('green')"><input type="radio" id="blue" name="colors" value=" "
            onclick="setColor('blue')"><input type="radio" id="heoblue" name="colors" value=" "
            onclick="setColor('heoblue')"><input type="radio" id="darkblue" name="colors" value=" "
            onclick="setColor('darkblue')"><input type="radio" id="purple" name="colors" value=" "
            onclick="setColor('purple')"><input type="radio" id="pink" name="colors" value=" "
            onclick="setColor('pink')" checked="checked"><input type="radio" id="black" name="colors" value=" "
            onclick="setColor('black')"><input type="radio" id="blackgray" name="colors" value=" "
            onclick="setColor('blackgray')"></div>
    <p></p>
    <p></p>
    <p></p>
    <h2 class="content-head">????????????</h2>
    <p id="swfs">
    <a class="swf" href="javascript:;" rel="noopener external nofollow" style="font-family:'HYTMR'!important;color:black" onclick="setFont('HYTMR')">???????????????</a><br>
    <a class="swf" href="javascript:;" rel="noopener external nofollow" style="font-family:'FZXJLJ'!important;color:black" onclick="setFont('FZXJLJ')">???????????????</a> <br>
    <a class="swf" href="javascript:;" rel="noopener external nofollow" style="font-family:'FZXS'!important;color:black" onclick="setFont('FZXS')">???????????????</a> <br>
    <a class="swf" href="javascript:;" rel="noopener external nofollow" style="font-family:'ZhuZiAWan'!important;color:black" onclick="setFont('ZhuZiAWan')">??????A???????????????</a> <br>
    <a class="swf" href="javascript:;" rel="noopener external nofollow" style="font-family:'FZODZK'!important;color:black" onclick="setFont('FZODZK')">??????????????????</a> <br>
    <a class="swf" href="javascript:;" rel="noopener external nofollow" style="font-family:'Source Serif'!important;color:black" onclick="setFont('Source Serif')">????????????</a> <br>
    <a class="swf" href="javascript:;" rel="noopener external nofollow" style="font-family:'Source Sans'!important;color:black" onclick="setFont('Source Sans')">????????????</a> <br>
    <a class="swf" href="javascript:;" rel="noopener external nofollow" style="font-family:-apple-system, IBM Plex Mono ,monosapce,'????????????', sans-serif;!important;color:black" onclick="setFont('main')">????????????</a> <br>
    </p>
</div>
    <h2 style="margin-left:10px">????????????</h2>
    <div>
    </br>&nbsp&nbsp??????:????????????????????????Acrylic?????????????????????Simple???????????????
    <button onclick="localStorage.removeItem('blogbg');location.reload();" class="content-button"><i class="fa-solid fa-arrows-rotate"></i> ????????????????????????</button>
    </div>
    <div id="article-container" style="padding:20px;">
    <h3 id="??????????????????"><a href="#??????????????????" class="headerlink" title="??????????????????"></a>??????????????????</h3>
    <div class="bgbox">
    <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2022/08/30/630d6d4d539a5.webp)" class="pimgbox" onclick="changeBg('url(https://bu.dusays.com/2022/08/30/630d6d4d539a5.webp)')"></a>
    <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2022/08/30/630d6d4e15c9d.webp)" class="pimgbox" onclick="changeBg('url(https://bu.dusays.com/2022/08/30/630d6d4e15c9d.webp)')"></a>
    <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2022/08/30/630d6f22c03c6.webp)" class="pimgbox" onclick="changeBg('url(https://bu.dusays.com/2022/08/30/630d6f22c03c6.webp)')"></a>
    <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2022/08/30/630d6d56c83eb.webp)" class="pimgbox" onclick="changeBg('url(https://bu.dusays.com/2022/08/30/630d6d56c83eb.webp)')"></a>   
    <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2022/08/30/630d6d50b439b.webp)" class="pimgbox" onclick="changeBg('url(https://bu.dusays.com/2022/08/30/630d6d50b439b.webp)')"></a>   

    </div>
    <h3 id="??????????????????"><a href="#??????????????????" class="headerlink" title="??????????????????"></a>??????????????????</h3>
    <div class="bgbox">
    <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2022/08/30/630d6d5574d0e.webp)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2022/08/30/630d6d5574d0e.webp)')"></a>
    <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2022/08/30/630d6d529adf9.webp)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2022/08/30/630d6d529adf9.webp)')"></a>
    <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2022/08/30/630d6d5159b31.webp)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2022/08/30/630d6d5159b31.webp)')"></a>
    <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2022/08/30/630d718bbeef6.webp)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2022/08/30/630d718bbeef6.webp)')"></a>
    <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2022/08/30/630d72f237d19.jpg)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2022/08/30/630d72f237d19.jpg)')"></a>
    <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2022/08/30/630d72f2032c8.jpg)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2022/08/30/630d72f2032c8.jpg)')"></a>
    <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2021/12/01/7792ff0082ec4.jpg)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2021/12/01/7792ff0082ec4.jpg)')"></a>
    <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2022/08/30/630d72ee6d4f3.png)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2022/08/30/630d72ee6d4f3.png)')"></a>
    <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2022/08/30/630d72ed76532.jpg)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2022/08/30/630d72ed76532.jpg)')"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2022/09/17/6324aea549be6.webp)')"><img src="https://bu.dusays.com/2022/09/17/6324aea549be6.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2022/09/17/6324aec701a68.webp)')"><img src="https://bu.dusays.com/2022/09/17/6324aec701a68.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2022/09/17/6324aef4a5543.webp)')"><img src="https://bu.dusays.com/2022/09/17/6324aef4a5543.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2022/09/17/6324af3622884.webp)')"><img src="https://bu.dusays.com/2022/09/17/6324af3622884.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/5.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/5.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/6.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/6.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/7.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/7.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/8.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/8.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/9.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/9.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/10.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/10.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/11.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/11.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/12.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/12.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/13.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/13.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/14.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/14.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/15.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/15.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/16.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/16.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/17.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/17.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/18.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/18.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/19.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/19.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/20.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/20.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/21.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/21.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/22.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/22.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/23.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/23.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/24.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/24.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/25.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/25.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/26.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/26.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/27.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/27.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/28.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/28.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/29.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/29.webp"></a>
    <a href="javascript:;" class="imgbox" onclick="changeBg('url(https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/30.webp)')"><img src="https://cdn.afdelivr.top/npm/saiodgm-api@1.0.1/randomimg-my/30.webp"></a>
    </div>
    <h3 id="?????????"><a href="#?????????" class="headerlink" title="?????????"></a>?????????</h3>
    <div class="bgbox">
    <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: linear-gradient(to right, #eecda3, #ef629f)" onclick="changeBg('linear-gradient(to right, #eecda3, #ef629f)')"></a>
    <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: linear-gradient(90deg, #ffd7e4 0%, #c8f1ff 100%)" onclick="changeBg('linear-gradient(90deg, #ffd7e4 0%, #c8f1ff 100%)')"></a>
    <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: linear-gradient(45deg, #e5737b, #c6999e, #96b9c2, #00d6e8)" onclick="changeBg('linear-gradient(45deg, #e5737b, #c6999e, #96b9c2, #00d6e8)')"></a>

    </div>
    
    <h3 id="??????"><a href="#??????" class="headerlink" title="??????"></a>??????</h3>
    <div class="bgbox">
    <input type="color" id="colors" autocomplete="on" value="#FF0000"></input>
    </div>

`;
$("#"+localStorage.getItem("themeColor")).attr("checked", true);
if(localStorage.getItem("blur")=="false"){
    document.getElementById("blur").checked=true;
}
if(localStorage.getItem("yjjs")=="true"){
    document.getElementById("yjjs").checked=true;
}
if(localStorage.getItem("fpson")=="1"){
    document.getElementById("fpson").checked=true;
}
if(localStorage.getItem("hideRightside")=="1"){
    document.getElementById("hideAside").checked=true;
}
document.getElementsByClassName("reSettings")[0].onclick=function(){
    localStorage.clear()
    window.location.reload()
}
}

function winResize() {
    if(!isMax){
    var offsetWid = document.documentElement.clientWidth;
    if (offsetWid <= 768) {
        winbox.resize(offsetWid * 0.95 + "px", "90%").move("center", "center");
    } else {
        winbox.resize(offsetWid * 0.6 + "px", "70%").move("center", "center");
    }}
}

// ???????????????????????????????????????????????????????????????????????????????????????
function toggleWinbox() {
    if (document.querySelector('#changeBgBox')) {winbox.toggleClass('hide');sessionStorage.setItem("settingWindow","close");}
    else {createWinbox();sessionStorage.setItem("settingWindow","open");}
}
if(sessionStorage.getItem("settingWindow")=="open"){
    createWinbox();
    
}

