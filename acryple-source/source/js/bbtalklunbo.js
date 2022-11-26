
AV.init({
    appId: "W7dceLXrUuiCITXy8cfM3sQ5-gzGzoHsz",
    appKey: "Cu1minmiIoZRLGrJNxHnhZgn",
    serverURL: "https://w7dcelxr.lc-cn-n1-shared.com"
});
var speaks=[];
const query = new AV.Query('speaks');
query.find().then((talks) => {
    for(i=talks.length-1;i>=0;i--){
        speaks.push(talks[i]["attributes"]["content"]);
    }
    
});
window.onload=function(){
var count=0;
document.getElementsByClassName("shuoshuo")[0].innerHTML=speaks[count%speaks.length];
    count++;
setInterval(()=>{
    document.getElementsByClassName("shuoshuo")[0].innerHTML=speaks[count%speaks.length];
    count++;
},5000)
}
