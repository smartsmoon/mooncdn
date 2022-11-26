---
title: Hexo魔改日记
type:
comments:
tags: 
  - Hexo
  - Butterfly
  - Acryple
categories: 
  - 奇思淫巧
description: 本文是在 Acryple 主题的基础上进行魔改
keywords: Hexo 博客
swiper_index: 6
cover: https://w.wallhaven.cc/full/x6/wallhaven-x6128o.jpg
top_img: https://w.wallhaven.cc/full/x6/wallhaven-x6128o.jpg
---
{% note info modern %}
`博客主题说明`：由于本博客项目直接采用

{% link Hexo-Acryple 主题更新日志,Ariasakaの小窝,https://yisous.xyz %}

根据 butterfly 主题进行魔改后的 Acryple 主题进行实现，因此此处只记录 Ariasaka 发布主题 Acryple 后进行的魔改进度。

{% endnote %}

## 首页分类条
{% note info modern %}
版权声明：此组件名为 `hexo-magnet`，用于处理首页的分类条样式，来源于 <a href="https://zfe.space/">小冰博客</a> 。
{% endnote %}
{% tabs muself-catelist %}
<!-- tab 前置安装npm组件 -->

```shell
npm i hexo-magnet --save
# 或者
cnpm i hexo-magnet --save
```
<!-- endtab -->

<!-- tab hexo根配置文件_config配置 -->
```json
magnet:
  enable: true  # 是否开启插件
  priority: 1   # 插件堆放顺序，和之前的 hexo-githubcalendar 参数可能冲突
  enable_page: all  # 路由地址，如 / 代表主页。/me/ 代表自我介绍页等等
  type: categories  # 选择筛选分类还是标签
  devide: 2         # 表示分隔的列数
  display:  # 显示相关的信息（手动设置）
    - name: Java 开发   # 真实分类
      display_name: 月のJava 源泉   # 显示名称
      icon: 📚    # 图标
    - name: 数据库技术
      display_name: 月の数据库总结
      icon: 🎮
    - name: 运维技术
      display_name: 月のLinux遨游
      icon: 🐱‍👓
    - name: 工具插件
      display_name: 月の妙用小工具
      icon: 👩‍💻
    - name: 奇思淫巧
      display_name: 月の奇思淫巧
      icon: 📒
    - name: 项目练习
      display_name: 月の个人项目
      icon: 💡
  color_setting:  # 颜色设置
    text_color: black 
    text_hover_color: white
    background_color: "#f2f2f2 !important"
    background_hover_color: "#dd8484 !important"
  layout:
    type: id    # 根据 id/class 挂载
    name: fl
    index: 0
  temple_html: '<div class="recent-post-item" style="width:100%;height: 100% !important;border-radius:12px"><div id="catalog_magnet">${temple_html_item}</div></div>'   # 设置的显示模板，插入到指定挂载的位置
  plus_style: ""    # 提供可自定义的 style，如加入黑夜模式。
```
<!-- endtab -->

<!-- tab hexo三连 -->

```shell
hexo clean 
hexo g 
hexo s
```
<!-- endtab -->

{% endtabs  %}

## 昼夜切换动画

{% note info modern %}
版权声明：此美化样式实际上是通过一个 svg 的动画来显示，方案来源于 <a href="https://akilar.top/posts/d9550c81/">店长Akilar</a> 。
{% endnote %}
{% tabs muself-catelist %}
<!-- tab SVG文件 -->

新建 `[Blogroot]/themes/Acryple/layout/includes/custom/sun_moon.pug` ，实质上就是 svg 文件，通过 JS 操作它的旋转显隐，淡入淡出实现动画效果。

```diff
svg(aria-hidden='true', style='position:absolute; overflow:hidden; width:0; height:0')
  symbol#icon-sun(viewBox='0 0 1024 1024')
    path(d='M960 512l-128 128v192h-192l-128 128-128-128H192v-192l-128-128 128-128V192h192l128-128 128 128h192v192z', fill='#FFD878', p-id='8420')
    path(d='M736 512a224 224 0 1 0-448 0 224 224 0 1 0 448 0z', fill='#FFE4A9', p-id='8421')
    path(d='M512 109.248L626.752 224H800v173.248L914.752 512 800 626.752V800h-173.248L512 914.752 397.248 800H224v-173.248L109.248 512 224 397.248V224h173.248L512 109.248M512 64l-128 128H192v192l-128 128 128 128v192h192l128 128 128-128h192v-192l128-128-128-128V192h-192l-128-128z', fill='#4D5152', p-id='8422')
    path(d='M512 320c105.888 0 192 86.112 192 192s-86.112 192-192 192-192-86.112-192-192 86.112-192 192-192m0-32a224 224 0 1 0 0 448 224 224 0 0 0 0-448z', fill='#4D5152', p-id='8423')
  symbol#icon-moon(viewBox='0 0 1024 1024')
    path(d='M611.370667 167.082667a445.013333 445.013333 0 0 1-38.4 161.834666 477.824 477.824 0 0 1-244.736 244.394667 445.141333 445.141333 0 0 1-161.109334 38.058667 85.077333 85.077333 0 0 0-65.066666 135.722666A462.08 462.08 0 1 0 747.093333 102.058667a85.077333 85.077333 0 0 0-135.722666 65.024z', fill='#FFB531', p-id='11345')
    path(d='M329.728 274.133333l35.157333-35.157333a21.333333 21.333333 0 1 0-30.165333-30.165333l-35.157333 35.157333-35.114667-35.157333a21.333333 21.333333 0 0 0-30.165333 30.165333l35.114666 35.157333-35.114666 35.157334a21.333333 21.333333 0 1 0 30.165333 30.165333l35.114667-35.157333 35.157333 35.157333a21.333333 21.333333 0 1 0 30.165333-30.165333z', fill='#030835', p-id='11346')
```

<!-- endtab -->

<!-- tab 样式文件 -->

新建 `[Blogroot]/themes/Acryple/source/css/_layout/sun_moon.styl` 。

```stylus
.Cuteen_DarkSky,
.Cuteen_DarkSky:before
  content ''
  position fixed
  left 0
  right 0
  top 0
  bottom 0
  z-index 88888888

.Cuteen_DarkSky
  background linear-gradient(#feb8b0, #fef9db)
  &:before
    transition 2s ease all
    opacity 0
    background linear-gradient(#4c3f6d, #6c62bb, #93b1ed)

.DarkMode
  .Cuteen_DarkSky
    &:before
      opacity 1

.Cuteen_DarkPlanet
  z-index 99999999
  position fixed
  left -50%
  top -50%
  width 200%
  height 200%
  -webkit-animation CuteenPlanetMove 2s cubic-bezier(0.7, 0, 0, 1)
  animation CuteenPlanetMove 2s cubic-bezier(0.7, 0, 0, 1)
  transform-origin center bottom

@-webkit-keyframes CuteenPlanetMove {
  0% {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes CuteenPlanetMove {
  0% {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
.Cuteen_DarkPlanet
  &:after
    position absolute
    left 35%
    top 40%
    width 9.375rem
    height 9.375rem
    border-radius 50%
    content ''
    background linear-gradient(#fefefe, #fffbe8)

.search
  span
    display none

.menus_item
  a
    text-decoration none!important
//按钮相关，对侧栏按钮做过魔改的可以调整这里的数值
.icon-V
  padding 5px
```

<!-- endtab -->

<!-- tab JS逻辑控制文件 -->

新建 `[Blogroot]/themes/Acryple/source/js/sun_moon.js` 。

```js
function switchNightMode() {
  document.querySelector('body').insertAdjacentHTML('beforeend', '<div class="Cuteen_DarkSky"><div class="Cuteen_DarkPlanet"></div></div>'),
    setTimeout(function() {
      document.querySelector('body').classList.contains('DarkMode') ? (document.querySelector('body').classList.remove('DarkMode'), localStorage.setItem('isDark', '0'), document.getElementById('modeicon').setAttribute('xlink:href', '#icon-moon')) : (document.querySelector('body').classList.add('DarkMode'), localStorage.setItem('isDark', '1'), document.getElementById('modeicon').setAttribute('xlink:href', '#icon-sun')),
        setTimeout(function() {
          document.getElementsByClassName('Cuteen_DarkSky')[0].style.transition = 'opacity 3s';
          document.getElementsByClassName('Cuteen_DarkSky')[0].style.opacity = '0';
          setTimeout(function() {
            document.getElementsByClassName('Cuteen_DarkSky')[0].remove();
          }, 1e3);
        }, 2e3)
    })
  const nowMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  if (nowMode === 'light') {
    activateDarkMode()
    saveToLocal.set('theme', 'dark', 2)
    GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night)
    document.getElementById('modeicon').setAttribute('xlink:href', '#icon-sun')
  } else {
    activateLightMode()
    saveToLocal.set('theme', 'light', 2)
    document.querySelector('body').classList.add('DarkMode'), document.getElementById('modeicon').setAttribute('xlink:href', '#icon-moon')
  }
  // handle some cases
  typeof utterancesTheme === 'function' && utterancesTheme()
  typeof FB === 'object' && window.loadFBComment()
  window.DISQUS && document.getElementById('disqus_thread').children.length && setTimeout(() => window.disqusReset(), 200)
}
```

<!-- endtab -->

<!-- tab 引入 SVG 文件 -->

修改 `[Blogroot]/themes/Acryple/layout/includes/head.pug`，在文件末位加上一行：

```diff
  !=fragment_cache('injectHeadJs', function(){return inject_head_js()})
  !=fragment_cache('injectHead', function(){return injectHtml(theme.inject.head)})
+ include ./custom/sun_moon.pug
```

<!-- endtab -->

<!-- tab 使用位置 -->

- 推荐位置：修改 `[Blogroot]/themes/Acryple/layout/includes/rightside.pug` 侧边悬浮按钮。

```diff
when 'darkmode'
    if darkmode.enable && darkmode.button
-     button#darkmode(type="button" title=_p('rightside.night_mode_title'))
-       i.fas.fa-adjust
+     a.icon-V.hidden(onclick='switchNightMode()',  title=_p('rightside.night_mode_title'))
+       svg(width='25', height='25', viewBox='0 0 1024 1024')
+         use#modeicon(xlink:href='#icon-moon')
```

- 推荐位置：修改 `[Blogroot]/themes/Acryple/layout/includes/header/nav.pug` 导航栏。

```diff
#toggleButtons
    ......
+    a.icon-V.hidden(onclick='switchNightMode()',  title=_p('rightside.night_mode_title'))
+      svg(width='25', height='25', viewBox='0 0 1024 1024')
+        use#modeicon(xlink:href='#icon-moon')
```

- 推荐位置：修改 `[Blogroot]/themes/Acryple/layout/includes/rightmenu.pug` 右键菜单选项，感觉用原生图标好一下，那个彩色的很突兀。

```diff
a.rightMenu-item(href="javascript:switchNightMode();")
	i.fa.fa-moon
	span='昼夜切换'
```

<!-- endtab -->

<!-- tab 引入切换逻辑JS文件 -->

在 `_config.Acryple.yml` 主题配置文件中引入 `sun_moon.js` 文件。

```yml
- <script src="/js/sun_moon.js" async></script>
```

<!-- endtab -->

<!-- tab hexo三连 -->

```shell
hexo clean 
hexo g 
hexo s
```

<!-- endtab -->

{% endtabs  %}

## 魔改音乐栏
{% note info modern %}
版权声明：此音乐栏效果来源于 <a href="https://anzhiy.cn/posts/6c69.html">安知鱼</a> 博客创新。
{% endnote %}
{% tabs muself-catelist %}
<!-- tab 开启主题音乐支持 -->

修改 `_config.yml` 中`aplayer`选项：

```yml
aplayer:
  meting: true
  asset_inject: false
```
修改 `_config.Acryple.yml` 中 `aplayerInject` ：

```yml
# Inject the css and script (aplayer/meting)
aplayerInject:
  enable: true
  per_page: true
```

<!-- endtab -->

<!-- tab aplayer 不间断设置 -->

{% note info modern %}
版权声明：aplayer 切换页面不间断效果设置来源于 <a href="https://yisous.xyz/posts/614f1131/">Ariasakaの小窝</a> 博客创新。
{% endnote %}

- 如果开启了 `Pjax` 渲染，那么直接就可以切换页面音乐不间断，但本站考虑到多个其他组件的渲染效果，暂未开启 。
- 未开启 `Pjax` 渲染情况下，考虑使用新的方案来解决：用 JS 记录播放进度并且在每次刷新后都重新定位(存在 Bug) ====> `Mark 一下(本站初衷只是看文章时听听歌，因此直接未使用此存在 Bug 的不间断方案)`

新增  `themes/Acryple/source/js/page_aplayer.js` 逻辑文件：

```js
//音乐不间断解决方案（富含bug）
function doStuff() {
    var flag=0;
    try{
        ap=aplayers[0]; //aplayer对象的存放位置挺离谱的
        ap.list;
        flag=1;
    }catch{
        setTimeout(doStuff, 50);//等待aplayer对象被创建（没找到初始化实例的地方只能这样了，这个判断代码是StackOverflow上面扒的（因为自己是个蒟蒻
        return;
    }
    if(flag){
        ap.lrc.hide();
        ap.setMode("normal"); //自动展开，可以删了
        document.getElementsByClassName("aplayer-icon-menu")[0].click()
        if(localStorage.getItem("musicIndex")!=null){
            musicIndex = localStorage.getItem("musicIndex");
            ap.list.switch(musicIndex);
            //歌曲可以本地储存下次访问体验更好
        }
        if(sessionStorage.getItem("musicTime") != null){
            window.musict = sessionStorage.getItem("musicTime");
            if(sessionStorage.getItem("musicPaused")!='1'){
                ap.play();
            }
            // setTimeout(function(){
            //     ap.seek(window.musict); //seek炸了我很久，最后决定加个延时（本来要用canplay但是莫名鬼畜了）
            // },500);
            var g=true; //加个变量以防鬼畜但是不知道怎么节流qwq
            ap.on("canplay",function(){
                if(g){
                    ap.seek(window.musict);
                    g=false; //如果不加oncanplay的话会seek失败就这原因炸很久
                }
            });
        }else{
            sessionStorage.setItem("musicPaused",1);
        }
        ap.on("pause",function(){sessionStorage.setItem("musicPaused",1);ap.lrc.hide()}); //原基础上加了个检测暂停免得切换页面后爆零(bushi)（指社死）
        ap.on("play",function(){sessionStorage.setItem("musicPaused",0);ap.lrc.show()});
        setInterval(function(){
            musicIndex = ap.list.index;
            musicTime = ap.audio.currentTime;
            localStorage.setItem("musicIndex",musicIndex);//保存播放进度
            sessionStorage.setItem("musicTime",musicTime);
            //节流，200ms精度感知不大qwq
        },200);
    }
}
doStuff();
```

<!-- endtab -->

<!-- tab 更改 aplayer 样式 -->

修改 `_config.Acryple.yml` 中的 `CDN.option`  相关选项，推荐将远程静态文件下载到本地进行导入：

```yml
aplayer_css: https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/aplayer/1.10.1/APlayer.min.css
aplayer_js: https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/aplayer/1.10.1/APlayer.min.js
meting_js: https://alist.anzhiy.cn/d/anzhiyu/js/Meting2.min.js
```

<!-- endtab -->

<!-- tab pug 结构新增并引入 -->

新建  `themes/Acryple/layout/includes/music.pug` 文件：

```shell
#nav-music
  #nav-music-hoverTips(onclick='anzhiyu.musicToggle()') 播放音乐
  meting-js#1708664797(server="tencent" type="playlist" mutex="true" preload="none" theme="var(--anzhiyu-main)" data-lrctype="0" order="random")
```
在 `themes/Acryple/layout/includes/layout.pug` 底部中引入`music.pug` ：

```diff
+ include ./music.pug
  !=partial('includes/third-party/search/index', {}, {cache: true})
  include ./additional-js.pug
```

<!-- endtab -->

<!-- tab 新建css样式和js逻辑 -->

直接使用 <a href="https://anzhiy.cn/posts/6c69.html">安知鱼 </a>博主的全局 css 样式，新建 `themes/Acryple/source/css/anzhiyu-theme.css` 文件：

```css
/* 颜色 */
:root {
  --anzhiyu-theme-op: #4259ef23;
  --anzhiyu-card-bg-none: rgba(255, 255, 255, 0);
  --anzhiyu-main-op-deep: var(--anzhiyu-theme-op-deep) !important;
  --anzhiyu-gray-op: #9999992b;
  --anzhiyu-theme-top: var(--anzhiyu-theme);
  --anzhiyu-white: #fff;
  --anzhiyu-white-op: rgba(255, 255, 255, 0.2);
  --anzhiyu-black: #000;
  --anzhiyu-black-op: rgba(0, 0, 0, 0.2);
  --anzhiyu-none: rgba(0, 0, 0, 0);
  --anzhiyu-gray: #999999;
  --anzhiyu-yellow: #ffc93e;
  --anzhiyu-orange: #e38100;
  --anzhiyu-border-radius: 8px;
  --anzhiyu-main: var(--anzhiyu-theme);
  --anzhiyu-main-op: var(--anzhiyu-theme-op);
  --anzhiyu-shadow-theme: 0 8px 12px -3px var(--anzhiyu-theme-op);
  --anzhiyu-shadow-main: 0 8px 12px -3px var(--anzhiyu-main-op);
  --anzhiyu-shadow-blue: 0 8px 12px -3px rgba(40, 109, 234, 0.2);
  --anzhiyu-shadow-white: 0 8px 12px -3px rgba(255, 255, 255, 0.2);
  --anzhiyu-shadow-black: 0 0 12px 4px rgba(0, 0, 0, 0.05);
  --anzhiyu-shadow-yellow: 0px 38px 77px -26px rgba(255, 201, 62, 0.12);
  --anzhiyu-shadow-red: 0 8px 12px -3px #ee7d7936;
  --anzhiyu-shadow-green: 0 8px 12px -3px #87ee7936;
  --anzhiyu-shadow-border: 0 8px 16px -4px #2c2d300c;
  --anzhiyu-shadow-blackdeep: 0 2px 16px -3px rgba(0, 0, 0, 0.15);
  --anzhiyu-logo-color: linear-gradient(215deg, #4584ff 30%, #ff7676 70%);
  --style-border: 1px solid var(--anzhiyu-card-border);
  --anzhiyu-blue-main: #3b70fc;
  --style-border-hover: 1px solid var(--anzhiyu-main);
  --style-border-dashed: 1px dashed var(--anzhiyu-theme-op);
  --style-border-avatar: 4px solid var(--anzhiyu-background);
  --style-border-always: 1px solid var(--anzhiyu-card-border);
  --style-border-none: 1px solid transparent;
  --anzhiyu-white-acrylic1: #fefeff !important;
  --anzhiyu-white-acrylic2: #fcfdff !important;
  --anzhiyu-black-acrylic2: #08080a !important;
  --anzhiyu-black-acrylic1: #0b0b0e !important;
  --anzhiyu-main-none: #b8b8b800 !important;
}

[data-theme="light"] {
  --anzhiyu-theme-op-deep: #4259efdd;
  --global-bg: #f7f9fe;
  --anzhiyu-theme: #3b70fc;
  --anzhiyu-theme-deep: #1856fb;
  --anzhiyu-theme-op: #4259ef23;
  --anzhiyu-blue: #3b70fc;
  --anzhiyu-red: #d8213c;
  --anzhiyu-pink: #ff7c7c;
  --anzhiyu-green: #57bd6a;
  --anzhiyu-fontcolor: #363636;
  --anzhiyu-background: #f7f9fe;
  --anzhiyu-reverse: #000;
  --anzhiyu-maskbg: rgba(255, 255, 255, 0.6);
  --anzhiyu-maskbgdeep: rgba(255, 255, 255, 0.85);
  --anzhiyu-hovertext: var(--anzhiyu-theme);
  --anzhiyu-ahoverbg: #f7f7fa;
  --anzhiyu-lighttext: var(--anzhiyu-main);
  --anzhiyu-secondtext: rgba(60, 60, 67, 0.6);
  --anzhiyu-scrollbar: rgba(60, 60, 67, 0.4);
  --anzhiyu-card-btn-bg: #edf0f7;
  --anzhiyu-post-blockquote-bg: #fafcff;
  --anzhiyu-post-tabs-bg: #f2f5f8;
  --anzhiyu-secondbg: #f1f3f8;
  --anzhiyu-shadow-nav: 0 5px 12px -5px rgba(102, 68, 68, 0.05);
  --anzhiyu-card-bg: #fff;
  --anzhiyu-shadow-lightblack: 0 5px 12px -5px rgba(102, 68, 68, 0);
  --anzhiyu-shadow-light2black: 0 5px 12px -5px rgba(102, 68, 68, 0);
  --anzhiyu-card-border: #e3e8f7;
}

[data-theme="dark"] {
  --anzhiyu-theme-op-deep: #0084ffdd;
  --global-bg: #18171d;
  --anzhiyu-theme: #0084ff;
  --anzhiyu-theme-deep: #0076e5;
  --anzhiyu-theme-op: #0084ff23;
  --anzhiyu-blue: #0084ff;
  --anzhiyu-red: #ff3842;
  --anzhiyu-pink: #ff7c7c;
  --anzhiyu-green: #57bd6a;
  --anzhiyu-fontcolor: #f7f7fa;
  --anzhiyu-background: #18171d;
  --anzhiyu-reverse: #fff;
  --anzhiyu-maskbg: rgba(0, 0, 0, 0.6);
  --anzhiyu-maskbgdeep: rgba(0, 0, 0, 0.85);
  --anzhiyu-hovertext: #0a84ff;
  --anzhiyu-ahoverbg: #fff;
  --anzhiyu-lighttext: #f2b94b;
  --anzhiyu-secondtext: #a1a2b8;
  --anzhiyu-scrollbar: rgba(200, 200, 223, 0.4);
  --anzhiyu-card-btn-bg: #30343f;
  --anzhiyu-post-blockquote-bg: #000;
  --anzhiyu-post-tabs-bg: #121212;
  --anzhiyu-secondbg: #30343f;
  --anzhiyu-shadow-nav: 0 5px 20px 0px rgba(28, 28, 28, 0.4);
  --anzhiyu-card-bg: #1d1b26;
  --anzhiyu-shadow-lightblack: 0 5px 12px -5px rgba(102, 68, 68, 0);
  --anzhiyu-shadow-light2black: 0 5px 12px -5px rgba(102, 68, 68, 0);
  --anzhiyu-card-border: #42444a;
}
```

新建 `themes/Acryple/source/css/aplayer.css` 文件：

```css
/* 音乐播放器 */

.aplayer.aplayer-narrow .aplayer-body,
.aplayer.aplayer-narrow .aplayer-pic {
  height: 66px;
  width: 66px;
}

#page:has(.aplayer):has(.aplayer-body):has(.aplayer-list) #post-comment .tk-comments-container > .tk-comment {
  border: none;
  box-shadow: none;
}

/* 导航栏音乐 */
@media screen and (max-width: 1300px) {
  #nav-music {
    display: none !important;
  }
}

#nav-music {
  display: flex;
  align-items: center;
  z-index: 9;
  position: fixed;
  bottom: 45px;
  left: 10px;
  cursor: pointer;
  transition: 0.5s;
  transform-origin: left bottom;
  box-shadow: var(--anzhiyu-shadow-border);
  border-radius: 40px;
  overflow: hidden;
}

#nav-music:active {
  transform: scale(0.97);
}

#nav-music.playing {
  box-shadow: 0 0px 12px -3px var(--anzhiyu-none);
  animation: playingShadow 5s linear infinite;
}

@keyframes playingShadow {
  0% {
    box-shadow: 0 0px 12px -3px var(--anzhiyu-none);
  }

  50% {
    box-shadow: 0 0px 12px 0px var(--anzhiyu-main);
  }

  100% {
    box-shadow: 0 0px 12px -3px var(--anzhiyu-none);
  }
}

#nav-music .aplayer.aplayer-withlrc .aplayer-pic {
  height: 25px;
  width: 25px;
  border-radius: 40px;
  z-index: 1;
  transition: 0.3s;
  transform: rotate(0deg) scale(1);
  border: var(--style-border-always);
  animation: changeright 24s linear infinite;
  animation-play-state: paused;
}

#nav-music.playing .aplayer.aplayer-withlrc .aplayer-pic {
  box-shadow: 0 0 14px #ffffffa6;
  transform: rotate(0deg) scale(1.1);
  border-color: var(--anzhiyu-white);
  animation-play-state: running;
}

@keyframes changeright {
  0% {
    transform: rotate(0deg) scale(1.1);
    box-shadow: 0 0 2px #ffffff00;
  }

  25% {
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 0 14px #ffffff;
  }

  50% {
    transform: rotate(180deg) scale(1.1);
    box-shadow: 0 0 2px #ffffff00;
  }

  75% {
    transform: rotate(270deg) scale(1.1);
    box-shadow: 0 0 14px #ffffff;
  }

  100% {
    transform: rotate(360deg) scale(1.1);
    box-shadow: 0 0 2px #ffffff00;
  }
}

#nav-music .aplayer.aplayer-withlrc .aplayer-info {
  height: 100%;
  color: var(--anzhiyu-fontcolor);
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
}

#nav-music.playing .aplayer.aplayer-withlrc .aplayer-info {
  color: var(--anzhiyu-white);
}

#nav-music.playing #nav-music-hoverTips {
  width: 0;
  opacity: 0;
}
#nav-music #nav-music-hoverTips {
  color: var(--anzhiyu-white);
  background: var(--anzhiyu-main);
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  display: flex;
  border-radius: 40px;
  opacity: 0;
  font-size: 12px;
  z-index: 2;
  transition: 0.3s;
}

#nav-music:hover:not(.playing) #nav-music-hoverTips {
  opacity: 1;
}

#nav-music
  .aplayer
  .aplayer-info
  .aplayer-controller
  .aplayer-bar-wrap:hover
  .aplayer-bar
  .aplayer-played
  .aplayer-thumb {
  display: none;
}

#nav-music .aplayer {
  background: var(--card-bg);
  border-radius: 60px;
  height: 41px;
  display: flex;
  margin: 0;
  transition: 0.3s;
  border: var(--style-border);
  box-shadow: none;
}

#nav-music.playing .aplayer {
  background: var(--anzhiyu-main-op-deep);
  border: var(--style-border-hover);
  backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: blur(20px);
}

#nav-music .aplayer .aplayer-notice {
  display: none;
}

#nav-music .aplayer .aplayer-miniswitcher {
  display: none;
}

#nav-music .aplayer .aplayer-body {
  position: relative;
  display: flex;
  align-items: center;
}

#nav-music .aplayer-list {
  display: none;
}

#nav-music .aplayer .aplayer-info .aplayer-music {
  margin: 0;
  display: flex;
  align-items: center;
  padding: 0 12px 0 8px;
  cursor: pointer;
  z-index: 1;
  height: 100%;
}

#nav-music .aplayer .aplayer-info .aplayer-controller .aplayer-time {
  display: none;
}

#nav-music .aplayer .aplayer-info .aplayer-music .aplayer-author {
  display: none;
}

#nav-music .aplayer.aplayer-withlist .aplayer-info {
  border: none;
}

#nav-music .aplayer .aplayer-pic .aplayer-button {
  bottom: 50%;
  right: 50%;
  transform: translate(50%, 50%);
  margin: 0;
  transition: 0.3s;
}
#nav-music .aplayer .aplayer-pic:has(.aplayer-button.aplayer-play) {
  animation-play-state: paused;
}
#nav-music .aplayer.aplayer-withlrc .aplayer-pic {
  margin-left: 8px;
}
#nav-music .aplayer .aplayer-info .aplayer-music .aplayer-title {
  cursor: pointer;
  line-height: 1;
  display: inline-block;
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: 0.3s;
  user-select: none;
}

#nav-music .aplayer .aplayer-info .aplayer-controller {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

#nav-music .aplayer .aplayer-info .aplayer-controller .aplayer-bar-wrap {
  margin: 0;
  padding: 0;
}

#nav-music .aplayer .aplayer-info .aplayer-controller .aplayer-bar-wrap .aplayer-bar {
  height: 100%;
  background: none;
}

#nav-music .aplayer .aplayer-info .aplayer-controller .aplayer-bar-wrap .aplayer-bar .aplayer-loaded {
  display: none;
}

#nav-music .aplayer .aplayer-info .aplayer-controller .aplayer-bar-wrap .aplayer-bar .aplayer-played {
  height: 100%;
  opacity: 0.1;
  background-color: var(--anzhiyu-white) !important;
  animation: lightBar 5s ease infinite;
  animation-play-state: paused;
}

#nav-music.playing .aplayer .aplayer-info .aplayer-controller .aplayer-bar-wrap .aplayer-bar .aplayer-played {
  animation-play-state: running;
}

@keyframes lightBar {
  0% {
    opacity: 0.1;
  }

  60% {
    opacity: 0.3;
  }

  100% {
    opacity: 0.1;
  }
}

/* 歌词 */
#nav-music .aplayer.aplayer-withlrc .aplayer-lrc {
  width: 0;
  opacity: 0;
  transition: 0.3s;
  margin-top: -2px;
  padding: 5px 0;
}
#nav-music.stretch .aplayer.aplayer-withlrc .aplayer-lrc {
  margin-left: 8px;
}
#nav-music.stretch .aplayer.aplayer-withlrc .aplayer-lrc {
  width: 200px;
  margin-bottom: 0;
  opacity: 1;
}

#nav-music .aplayer .aplayer-lrc p.aplayer-lrc-current {
  color: var(--anzhiyu-white);
  border: none;
}

#nav-music .aplayer .aplayer-lrc:after,
#nav-music .aplayer .aplayer-lrc:before {
  display: none;
}

#nav-music .aplayer .aplayer-lrc p {
  color: #ffffffb3;
}
```

新建 `themes/Acryple/source/js/aplayer.js` 文件：

```js
var anzhiyu_musicPlaying = false;
var anzhiyu_musicStretch = false;
var anzhiyu_musicFirst = false;
var anzhiyu = {
  //切换音乐播放状态
  musicToggle: function () {
    if (!anzhiyu_musicFirst) {
      musicBindEvent();
      anzhiyu_musicFirst = true;
    }
    let msgPlay = '<i class="fa-solid fa-play"></i><span>播放音乐</span>'; // 此處可以更改為你想要顯示的文字
    let msgPause = '<i class="fa-solid fa-pause"></i><span>暂停音乐</span>'; // 同上，但兩處均不建議更改
    if (anzhiyu_musicPlaying) {
      document.querySelector("#nav-music").classList.remove("playing");
      document.getElementById("menu-music-toggle").innerHTML = msgPlay;
      document.getElementById("nav-music-hoverTips").innerHTML = "音乐已暂停";
      anzhiyu_musicPlaying = false;
      document.querySelector("#nav-music").classList.remove("stretch");
      anzhiyu_musicStretch = false;
    } else {
      document.querySelector("#nav-music").classList.add("playing");
      document.getElementById("menu-music-toggle").innerHTML = msgPause;
      anzhiyu_musicPlaying = true;
      document.querySelector("#nav-music").classList.add("stretch");
      anzhiyu_musicStretch = true;
    }
    document.querySelector("#nav-music meting-js").aplayer.toggle();
  },
  // 音乐伸缩
  musicTelescopic: function () {
    if (anzhiyu_musicStretch) {
      document.querySelector("#nav-music").classList.remove("stretch");
      anzhiyu_musicStretch = false;
    } else {
      document.querySelector("#nav-music").classList.add("stretch");
      anzhiyu_musicStretch = true;
    }
  },

  //音乐上一曲
  musicSkipBack: function () {
    document.querySelector("#nav-music meting-js").aplayer.skipBack();
  },

  //音乐下一曲
  musicSkipForward: function () {
    document.querySelector("#nav-music meting-js").aplayer.skipForward();
  },

  //获取音乐中的名称
  musicGetName: function () {
    var x = $(".aplayer-title");
    var arr = [];
    for (var i = x.length - 1; i >= 0; i--) {
      arr[i] = x[i].innerText;
    }
    return arr[0];
  },
};

// 音乐绑定事件
function musicBindEvent() {
  document.querySelector("#nav-music .aplayer-music").addEventListener("click", function () {
    anzhiyu.musicTelescopic();
  });
}
```

<!-- endtab -->

<!-- tab 引入css 和 js -->

主题配置文件 `_config.acryple.yml` 的 head 中引入 css ，bottom 中引入 js ：

```yml
# head 中引入 css
- <link rel="stylesheet" href="/css/anzhiyu-theme.css">
- <link rel="stylesheet" href="/css/aplayer.css">   # 音乐播放器相关的样式设置
```

```yml
# bottom 中引入 js
- <script async defer src="/js/aplayer.js"></script>   # 音乐播放器的相关js逻辑设置
```

<!-- endtab -->

<!-- tab hexo三连 -->

```shell
hexo clean 
hexo g 
hexo s
```

注：由于博主设置的 js 逻辑是和后续的魔改右键菜单功能搭配使用，所以如果单独使用此 aplayer 功能，可能会存在一些 `bug` ，比如第一次点击不播放等问题。

<!-- endtab -->

{% endtabs  %}

## 右键菜单补充功能
{% note info modern %}
原创：此部分是在当前现有的菜单基础上改进，主要是修改原来 Acryple 主题的菜单目录(个人觉得有些并没有必要性)，同时加上音乐操作菜单。
{% endnote %}
{% tabs muself-catelist %}
<!-- tab 修改原本 pug 文件 -->

修改位于 `themes/Acryple/layout/includes/rightMenu.pug` 文件，如果没有则创建：

```diff
#rightMenu
	.rightMenu-group.rightMenu-small
		a.rightMenu-item(href="javascript:window.history.back();")
			i.fa.fa-arrow-left
		a.rightMenu-item(href="javascript:window.history.forward();")
			i.fa.fa-arrow-right
		a.rightMenu-item(href="javascript:window.location.reload();")
			i.fa.fa-refresh
		a.rightMenu-item(href="javascript:window.location.href = window.location.origin;")
			i.fa-solid.fa-house
	.rightMenu-group.rightMenu-line.rightMenuOther#menu-base1
		a.rightMenu-item.menu-link(href='/archives/')
			i.fa-solid.fa-archive
			span='文章归档'
		a.rightMenu-item.menu-link(href='/categories/')
			i.fa-solid.fa-folder-open
			span='文章分类'
		a.rightMenu-item.menu-link(href='/tags/')
			i.fa-solid.fa-tags
			span='文章标签'
	.rightMenu-group.rightMenu-line.hide#menu-text
		a.rightMenu-item(href="javascript:rmf.copySelect();")
			i.fa.fa-copy
			span='复制文本'
		a.rightMenu-item(href="javascript:window.open(\"https://www.baidu.com/s?wd=\"+window.getSelection().toString());window.location.reload();")
			i.iconfont.icon-baidu
			span='百度搜索'
		a.rightMenu-item(href="#post-comment" onclick="rmf.yinyong()")
			i.fa-solid.fa-message
			span='引用文本评论'
	.rightMenu-group.rightMenu-line.hide#menu-paste
		a.rightMenu-item(href='javascript:rmf.paste()')
			i.fa.fa-copy
			span='粘贴文本'
	.rightMenu-group.rightMenu-line.hide#menu-img
		a.rightMenu-item(href="javascript:rmf.saveAs()")
			i.fa.fa-download
			span='保存图片'
		a.rightMenu-item(href="javascript:rmf.openWithNewTab()")
			i.fa.fa-window-restore
			span='窗口预览'
		a.rightMenu-item(href="javascript:rmf.click()")
			i.fa.fa-arrows-alt
			span='全屏显示'
		a.rightMenu-item(href="javascript:rmf.copyLink()")
			i.fa.fa-copy
			span='复制链接'
	.rightMenu-group.rightMenu-line.hide#menu-music
		a.rightMenu-item(href="javascript:rmf.musicSkipBack()")
			i.fas.fa-backward
			span='上一首~'
		a.rightMenu-item(href="javascript:rmf.musicSkipForward()")
			i.fas.fa-forward
			span='下一首~'
		a.rightMenu-item#menu-music-toggle(href="javascript:rmf.musicToggle()")
			i.fa-solid.fa-pause
			span='暂停音乐'
		a.rightMenu-item(href="javascript:rmf.copyMusicName()")
			i.fas.fa-copy
			span='复制歌名'
	.rightMenu-group.rightMenu-line#menu-base2
		a.rightMenu-item(href="javascript:toRandomPost()")
			i.fa.fa-paper-plane
			span='随便逛逛'
		a.rightMenu-item(href="javascript:rmf.switchDarkMode();")
			i.fa.fa-moon
			span='昼夜切换'
		a.rightMenu-item(href="javascript:rmf.translate();")
			i.iconfont.icon-fanti
			span='繁简转换'
		.rightMenu-item(href="javascript:rmf.printPage();")
			i.fa-solid.fa-print.fa-fw
			span='打印页面'
		a.rightMenu-item(href="javascript:window.location.href=\"/license/\";")
			i.fa.fa-info-circle
			span='版权声明'
		a.rightMenu-item(href="javascript:toggleWinbox();")
			i.fas.fa-cog
			span='博客设置'
```
<!-- endtab -->

<!-- tab 引入新建pug文件 -->

如果是新建的 pug 文件，则还需要在 `themes/Acryple/layout/includes/layout.pug` 引入到主题中：

```diff
  include ./rightside.pug
  !=partial('includes/third-party/search/index', {}, {cache: true})
+ !=partial('includes/rightmenu', {}, {cache:true})
  include ./additional-js.pug
```

<!-- endtab -->

<!-- tab 新建 js 逻辑 -->

新建 `themes/Acryple/source/js/rightmenu.js` 文件，内部混杂之前 Acryple 主题实现 rightmenu 功能的代码：

```js
console.log(
    "Codes uses GPL Licence"
)
function setMask(){//设置遮罩层
    mask = document.createElement('div');
    mask.style.width = window.innerWidth + 'px';
    mask.style.height = window.innerHeight + 'px';
    mask.style.background = '#fff';
    mask.style.opacity = '.0';
    mask.style.position = 'fixed';
    mask.style.top = '0';
    mask.style.left = '0';
    mask.style.zIndex = 998;
    document.body.appendChild(mask);
    document.getElementById("rightMenu").style.zIndex=19198;
}

function insertAtCursor(myField, myValue) {

    //IE 浏览器
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
        sel.select();
    }

    //FireFox、Chrome等
    else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;

        // 保存滚动条
        var restoreTop = myField.scrollTop;
        myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);

        if (restoreTop > 0) {
            myField.scrollTop = restoreTop;
        }

        myField.focus();
        myField.selectionStart = startPos + myValue.length;
        myField.selectionEnd = startPos + myValue.length;
    } else {
        myField.value += myValue;
        myField.focus();
    }
}
let rmf = {};
rmf.showRightMenu = function (isTrue, x = 0, y = 0) {
    let $rightMenu = $('#rightMenu');
    $rightMenu.css('top', x + 'px').css('left', y + 'px');

    if (isTrue) {
        $rightMenu.show();
    } else {
        $rightMenu.hide();
    }
}
rmf.switchDarkMode = function () {
    const nowMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
    if (nowMode === 'light') {
        activateDarkMode()
        saveToLocal.set('theme', 'dark', 2)
        GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night)
    } else {
        activateLightMode()
        saveToLocal.set('theme', 'light', 2)
        GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day)
    }
    // handle some cases
    typeof utterancesTheme === 'function' && utterancesTheme()
    typeof FB === 'object' && window.loadFBComment()
    window.DISQUS && document.getElementById('disqus_thread').children.length && setTimeout(() => window.disqusReset(), 200)
};
rmf.yinyong=function(){
    var e = document.getElementsByClassName("el-textarea__inner")[0],
        t = document.createEvent("HTMLEvents");
    t.initEvent("input", !0, !0), e.value = d.value = "> "+getSelection().toString()+"\n\n", e.dispatchEvent(t);
    console.log(getSelection().toString());
    document.getElementsByClassName("el-textarea__inner")[0].value="> "+getSelection().toString()+"\n\n";
    Snackbar.show({
        text: '为保证最佳评论阅读体验，建议不要删除空行',
        pos: 'top-center',
        showAction: false,
    })
}
rmf.copyWordsLink = function () {
    let url = window.location.href
    let txa = document.createElement("textarea");
    txa.value = url;
    document.body.appendChild(txa)
    txa.select();
    document.execCommand("Copy");
    document.body.removeChild(txa);
    Snackbar.show({
        text: '链接复制成功！快去分享吧！',
        pos: 'top-right',
        showAction: false
    });
}
rmf.switchReadMode = function () {
    const $body = document.body
    $body.classList.add('read-mode')
    const newEle = document.createElement('button')
    newEle.type = 'button'
    newEle.className = 'fas fa-sign-out-alt exit-readmode'
    $body.appendChild(newEle)

    function clickFn() {
        $body.classList.remove('read-mode')
        newEle.remove()
        newEle.removeEventListener('click', clickFn)
    }

    newEle.addEventListener('click', clickFn)
}

//复制选中文字
rmf.copySelect = function () {
    document.execCommand('Copy', false, null);
    //这里可以写点东西提示一下 已复制
}

//回到顶部
rmf.scrollToTop = function () {
    document.getElementsByClassName("menus_items")[1].setAttribute("style","");
    document.getElementById("name-container").setAttribute("style","display:none");
    btf.scrollToDest(0, 500);
}
rmf.translate = function () {
    document.getElementById("translateLink").click();
}

//音乐按钮的功能实现
rmf.musicToggle = function() {
    btf.snackbarShow("音乐太吵了~~~✌️");
    anzhiyu.musicToggle();
}
rmf.musicSkipForward = function() {
    btf.snackbarShow("这首不好听，下一曲~~~✌️");
    anzhiyu.musicSkipForward();
}
rmf.musicSkipBack = function() {
    btf.snackbarShow("这首还不如上一个，上一曲~~~✌️");
    anzhiyu.musicSkipBack();
}
rmf.copyMusicName = function() {
    let musicName = $(".aplayer-title").text();
    let input = document.createElement('input') // 新增一个input
    input.style.position = 'absolute' // 将它隐藏（注意不能使用display或者visibility，否则粘贴不上）
    input.style.top = '-100px'
    document.body.appendChild(input) // 追加
    input.value = musicName // 设置文本框的内容
    input.select() // 选中文本
    document.execCommand("copy") // 执行浏览器复制命令
    Snackbar.show({
        text: '复制歌名成功：' + musicName,
        pos: 'top-right',
        showAction: false
    });
}

//打印页面js逻辑
rmf.printPage = function () {
    window.print();
}

document.body.addEventListener('touchmove', function(e){
    
}, { passive: false });
function popupMenu() {
    //window.oncontextmenu=function(){return false;}
    window.oncontextmenu = function (event) {
        if(event.ctrlKey)return true;
        console.log(event.keyCode)
        $('.rightMenu-group.hide').hide();
        // setMask();
        //如果有文字选中，则显示 文字选中相关的菜单项
        if (document.getSelection().toString()) {
            $('#menu-text').show();
        }
        if (document.getElementById('post')) {
            $('#menu-post').show();
        } else {
            if (document.getElementById('page')) {
                $('#menu-post').show();
            }
        }

        // 音乐按钮相关的设置
        if (document.querySelector("#nav-music meting-js").contains(event.target)) {
            $("#menu-music").show();
            $("#menu-base1").hide();
            $("#menu-base2").hide();
        } else {
            $("#menu-music").hide();
            $("#menu-base1").show();
            $("#menu-base2").show();
        }


        var el = window.document.body;
        el = event.target;
        var a=/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+$/
        if (a.test(window.getSelection().toString())){
            $('#menu-too').show()
        }
        if (el.tagName == 'A') {
            $('#menu-to').show()
            rmf.open = function () {
                location.href = el.href
            }
            rmf.openWithNewTab = function () {
                window.open(el.href);
                // window.location.reload();
            }
            rmf.copyLink = function () {
                let url = el.href
                let txa = document.createElement("textarea");
                txa.value = url;
                document.body.appendChild(txa)
                txa.select();
                document.execCommand("Copy");
                document.body.removeChild(txa);
            }
        }
        if (el.tagName == 'IMG') {
            $('#menu-img').show()
            rmf.openWithNewTab = function () {
                window.open(el.src);
                // window.location.reload();
            }
            rmf.click = function () {
                el.click()
            }
            rmf.copyLink = function () {
                let url = el.src
                let txa = document.createElement("textarea");
                txa.value = url;
                document.body.appendChild(txa)
                txa.select();
                document.execCommand("Copy");
                document.body.removeChild(txa);
            }
            rmf.saveAs=function(){
                var a = document.createElement('a');
                var url = el.src;
                var filename = url.split("/")[-1];
                a.href = url;
                a.download = filename;
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } else if (el.tagName == "TEXTAREA" || el.tagName == "INPUT") {
            $('#menu-paste').show();
            rmf.paste = function () {
                navigator.permissions
                    .query({
                        name: 'clipboard-read'
                    })
                    .then(result => {
                        if (result.state == 'granted' || result.state == 'prompt') {
                            //读取剪贴板
                            navigator.clipboard.readText().then(text => {
                                console.log(text)
                                insertAtCursor(el, text)
                            })
                        } else {
                            Snackbar.show({
                                text: '请允许读取剪贴板！',
                                pos: 'top-center',
                                showAction: false,
                            })
                        }
                    })
            }
        }
        let pageX = event.clientX + 10;
        let pageY = event.clientY;
        let rmWidth = $('#rightMenu').width();
        let rmHeight = $('#rightMenu').height();
        if (pageX + rmWidth > window.innerWidth) {
            pageX -= rmWidth + 10;
        }
        if (pageY + rmHeight > window.innerHeight) {
            pageY -= pageY + rmHeight - window.innerHeight;
        }



        rmf.showRightMenu(true, pageY, pageX);
        return false;
    };

    window.addEventListener('click', function () {
        rmf.showRightMenu(false);
    });
}
if (!(navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
    popupMenu()
}
const box = document.documentElement

function addLongtabListener(target, callback) {
    let timer = 0 // 初始化timer

    target.ontouchstart = () => {
        timer = 0 // 重置timer
        timer = setTimeout(() => {
            callback();
            timer = 0
        }, 380) // 超时器能成功执行，说明是长按
    }

    target.ontouchmove = () => {
        clearTimeout(timer) // 如果来到这里，说明是滑动
        timer = 0
    }

    target.ontouchend = () => { // 到这里如果timer有值，说明此触摸时间不足380ms，是点击
        if (timer) {
            clearTimeout(timer)
        }
    }
}

addLongtabListener(box, popupMenu)
```

<!-- endtab -->

<!-- tab 引入 rightmenu.js -->

```yml
- <script type="text/javascript" src="/js/rightmenu.js"></script>
```

<!-- endtab -->

<!-- tab hexo三连 -->

```shell
hexo clean 
hexo g 
hexo s
```
<!-- endtab -->

{% endtabs  %}

## 魔改友链

{% note info modern %}
版权声明：此友链效果效果来源于 <a href="https://anzhiy.cn/posts/292d.html">安知鱼</a> 博客创新。
{% endnote %}
{% tabs muself-catelist %}
<!-- tab 友链页面设置 -->

在 Hexo 博客根目录 `[Blogroot]`下打开终端，输入一下命令创建 link 页面。

```diff
hexo new page link
```

打开创建好的 `[Blogroot]\source\link\index.md`，添加一行 `type: 'link'` 标识此页面为友链页。

```
---
title: link
date: 2020-12-01 22:19:45
type: 'link'
---
```

新建文件 `[Blogroot]\source\_data\link.yml`，没有`_data`文件夹的话就新建：

```yml
- class_name: 推荐博客
  flink_style: flexcard		# 该参数可选值 flexcard 或者 butterfly(原生样式) 分别对应两种样式。
  link_list:
    - name: 安知鱼`Blog
      link: https://anzhiy.cn/
      avatar: https://image.anzhiy.cn/adminuploads/1/2022/09/15/63232b7d91d22.jpg
      descr: 生活明朗，万物可爱
      siteshot: https://npm.elemecdn.com/anzhiyu-blog@1.1.6/img/post/common/anzhiy.cn.jpg
```

<!-- endtab -->

<!-- tab 引入新建pug文件 -->

如果是新建的 pug 文件，则还需要在 `themes/Acryple/layout/includes/layout.pug` 引入到主题中：

```diff
- class_name: 月の子豚小窝
  class_desc: 那些人，那些事
  flink_style: flexcard
  link_list:
    - name: 月の子豚小窝
      link: https:/xxx.com/
      avatar: https://xxx.jpg
      descr: 2022年的计划我都完成了吗？
      theme_color: "#BB8384"
- class_name: 网站
  class_desc: 值得推荐的网站
  flink_style: flexcard
  link_list:
    - name: Twitter
      link: https://twitter.com/
      avatar: https://i.loli.net/2020/05/14/5VyHPQqR6LWF39a.png
      descr: 社交分享平台
```

<!-- endtab -->

<!-- tab pug 页面设置 -->

替换原本的 `[Blogroot]\themes\butterfly\layout\includes\page\flink.pug` 文件：

```diff
#article-container
  if top_img === false
    h1.page-title= "友链"
  .flink
    if site.data.link
      each i in site.data.link
        if i.class_name
          h2!= i.class_name
        if i.class_desc
          .flink-desc!=i.class_desc
        if i.flink_style === 'butterfly'
          .butterfly-flink-list
            each item in i.link_list
              .flink-list-item
                a(href=url_for(item.link)  title=item.name target="_blank")
                  .flink-item-icon
                    if theme.lazyload.enable
                      img(data-lazy-src=url_for(item.avatar) onerror=`this.onerror=null;this.src='` + url_for(theme.error_img.flink) + `'` alt=item.name )
                    else
                      img(src=url_for(item.avatar) onerror=`this.onerror=null;this.src='` + url_for(theme.error_img.flink) + `'` alt=item.name )
                  .flink-item-info
                    .flink-item-name= item.name
                    .flink-item-desc(title=item.descr)= item.descr
        else if i.flink_style === 'flexcard'
          .flexcard-flink-list
            each item in i.link_list
              a.flink-list-card(href=url_for(item.link) target='_blank' data-title=item.descr)
                .wrapper.cover
                  - var siteshot = item.siteshot ? url_for(item.siteshot) : 'https://image.thum.io/get/width/400/crop/800/allowJPG/wait/20/noanimate/' + item.link
                  if theme.lazyload.enable
                    img.cover.fadeIn(data-lazy-src=siteshot onerror=`this.onerror=null;this.src='` + url_for(theme.error_img.post_page) + `'` alt='' )
                  else
                    img.cover.fadeIn(src=siteshot onerror=`this.onerror=null;this.src='` + url_for(theme.error_img.post_page) + `'` alt='' )
                .info
                  if theme.lazyload.enable
                    img.flink-avatar(data-lazy-src=url_for(item.avatar) onerror=`this.onerror=null;this.src='` + url_for(theme.error_img.flink) + `'` alt='' )
                  else
                    img(src=url_for(item.avatar) onerror=`this.onerror=null;this.src='` + url_for(theme.error_img.flink) + `'` alt='' )
                  span.flink-sitename= item.name
    != page.content
```

<!-- endtab -->

<!-- tab 友链样式设置 -->

替换 `[Blogroot]\themes\Acryple\source\css\_page\flink.styl` 文件：

```styl
.flink-desc
  margin: .2rem 0 .5rem

.butterfly-flink-list
  overflow: auto
  padding: 10px 10px 0
  text-align: center

  & > .flink-list-item
    position: relative
    float: left
    overflow: hidden
    line-height: 17px
    -webkit-transform: translateZ(0)
    height: 100px;
    padding: 10px;
    width: calc(100% / 5 - 0.5rem)
    margin: 0.5rem 0.25rem;
    border-radius: 12px;
    border: var(--style-border);
    background-color: var(--anzhiyu-card-bg);
    -webkit-transition: all .3s ease-in-out;
    -moz-transition: all .3s ease-in-out;
    -o-transition: all .3s ease-in-out;
    -ms-transition: all .3s ease-in-out;
    transition: all .3s ease-in-out;

    +maxWidth1024()
      width: calc(50% - 15px) !important

    +maxWidth600()
      width: calc(100% - 15px) !important

    &:hover
      border-color: var(--anzhiyu-main)!important;
      background-color: var(--anzhiyu-main)!important;
      box-shadow: var(--anzhiyu-shadow-theme)!important;

      .flink-item-icon
        width: 0;
        height: 0;
        margin-left: -10px;
      .flink-item-name,.flink-item-desc
        color: var(--anzhiyu-white);

    &:hover:before,
    &:focus:before,
    &:active:before
      transform: scale(1)

    a
      color: var(--font-color)
      text-decoration: none

      .flink-item-icon
        float: left
        overflow: hidden
        margin: 15px 10px
        width: 60px
        height: 60px
        border-radius: 35px
        transition: all .3s ease-out
        margin: 8px 0 8px 0;
        background: var(--anzhiyu-background);
        border-radius: 50%;
        overflow: hidden;

        img
          width: 100%
          height: 100%
          transition: filter 375ms ease-in .2s, transform .3s
          object-fit: cover

      .img-alt
        display: none
.flink-item-info
  display: flex;
  flex-wrap: wrap;
  padding-left: 10px;
  text-align: left;
  flex-direction: column;

  .flink-item-name
    @extend .limit-one-line
    padding: 12px 0 16px 0;
    height: auto;
    font-weight: bold
    font-size: 1.2em
    color: var(--anzhiyu-fontcolor);

  .flink-item-desc
    @extend .limit-one-line
    padding: 0
    height: 35px
    font-size: .93em
    opacity: .7;
    color: var(--anzhiyu-fontcolor);
    word-break: break-all;
    white-space: break-spaces;
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;

.flink-name
  margin-bottom: 5px
  font-weight: bold
  font-size: 1.5em

#article-container img
  margin-bottom: 0.5rem;
  object-fit: cover;
  max-height: 900px;
.flexcard-flink-list
  overflow hidden
  .flink-list-card
    .wrapper img
      transition: transform .5s ease-out !important;
    &:hover
      border-color: var(--anzhiyu-main)!important;
      background-color: var(--anzhiyu-main)!important;
      box-shadow: var(--anzhiyu-shadow-theme)!important;

  & > a
    width: calc(100% / 5 - 0.5rem);
    height 150px
    position relative
    display block
    margin: 0.5rem 0.25rem;
    float left
    overflow hidden
    padding: 0;
    border-radius: 8px;
    transition all .3s ease 0s, transform .6s cubic-bezier(.6, .2, .1, 1) 0s
    box-shadow none
    border: var(--style-border)!important;
    &:hover
      .info
        transform translateY(-100%)
      .wrapper
        img
          transform scale(1.2)
      &::before
        position: fixed
        width:inherit
        margin:auto
        left:0
        right:0
        top:10%
        border-radius: 10px
        text-align: center
        z-index: 100
        content: attr(data-title)
        font-size: 20px
        color: #fff
        padding: 10px
        background-color: rgba($theme-color,0.8)

    .cover
      width 100%
      transition transform .5s ease-out
    .wrapper
      position relative
      .fadeIn
        animation coverIn .8s ease-out forwards
      img
        height 150px
        pointer-events none
    .info
      display flex
      flex-direction column
      justify-content center
      align-items center
      width 100%
      height 100%
      overflow hidden
      border-radius 3px
      background-color hsla(0, 0%, 100%, .7)
      transition transform .5s cubic-bezier(.6, .2, .1, 1) 0s
      img
        position relative
        top 45px
        width 80px
        height 80px
        border-radius 50%
        box-shadow 0 0 10px rgba(0, 0, 0, .3)
        z-index 1
        text-align center
        pointer-events none
      span
        padding 20px 10% 60px 10%
        font-size 16px
        width 100%
        text-align center
        box-shadow 0 0 10px rgba(0, 0, 0, .3)
        background-color hsla(0, 0%, 100%, .7)
        color var(--font-color)
        white-space nowrap
        overflow hidden
        text-overflow ellipsis
.flexcard-flink-list>a .info,
.flexcard-flink-list>a .wrapper .cover
  position absolute
  top 0
  left 0

@media screen and (max-width:1024px)
  .flexcard-flink-list
    & > a
      width calc(33.33333% - 15px)

@media screen and (max-width:600px)
  .flexcard-flink-list
    & > a
      width calc(50% - 15px)

[data-theme=dark]
  .flexcard-flink-list a .info,
  .flexcard-flink-list a .info span
    background-color rgba(0, 0, 0, .6)
  .flexcard-flink-list
    & > a
      &:hover
        &:before
          background-color: rgba(#121212,0.8);
.justified-gallery > div > img,
.justified-gallery > figure > img,
.justified-gallery > a > a > img,
.justified-gallery > div > a > img,
.justified-gallery > figure > a > img,
.justified-gallery > a > svg,
.justified-gallery > div > svg,
.justified-gallery > figure > svg,
.justified-gallery > a > a > svg,
.justified-gallery > div > a > svg,
.justified-gallery > figure > a > svg
  position static!important
```

<!-- endtab -->

<!-- tab 丰富友链页内容 -->

丰富友联页面内容实际就是添加一些静态说明：

````md
---
title: 
date: 2022-09-28 15:48:52
type: "link"
---

<h1>本站友链啦</h1>
{% hideToggle 本站友链信息 %}

{% tabs muself-link %}
<!-- tab Butterfly & MengD -->
```yaml
- name: 月の子豚小窝
  link: https://xxx.com
  avatar: https://xxx.png
  descr: 2022年的计划我都完成了吗？
  siteshot: https://xxx.png
```
<!-- endtab -->

<!-- tab fluid -->
```json
- {
  title: '月の子豚小窝',
  intro: '2022年的计划我都完成了吗？',
  link: 'https://xxx.com/',
  avatar: 'https://xxx.png'
}
```
<!-- endtab -->

<!-- tab volantis -->
```yaml
- title: 月の子豚小窝
  avatar: https://xxx.png
  url: https://xxx.com/
  screenshot: 
  keywords: 个人博客
  description: 2022年的计划我都完成了吗？
```
<!-- endtab -->

<!-- tab html -->
```html
<a href="https://xxx.com"><img src="https://xxx.png" alt="avatar">月の子豚小窝</a>
```
<!-- endtab -->

{% endtabs  %}

{% endhideToggle %}

{% hideToggle 推荐标签衡量标准 %}

1.遵循社会主义核心价值观思想：富强、民主、文明、和谐、自由、平等、公正、法治、爱国、敬业、诚信、友善。

2.博客文章没有不良思想、不良内容传播。

3.博客文章具有一定深度，质量较高。

4.博客文章较多/或者质量过硬。

5.Hexo 大佬友情链接。

{% endhideToggle %}

<h1>如何申请友链？</h1>

点击 <a href="javascript:void(0)" onclick="addflink()">快速添加友链</a> 按钮到评论区填写信息哦啦啦！
<script type="text/javascript" src="https://cdn1.tianli0.top/npm/jquery@latest/dist/jquery.min.js"></script>
<script src = "/js/randomFriend.js"></script>
````

<!-- endtab -->

<!-- tab 宝藏网站页面 -->

样式仿照友联页面，新增一个可以收藏常用网站的页面，方便以后开发和使用，主要包括工具、娱乐、学习、花样等网站。

- 创建 `[Blogroot]/themes/Acryple/layout/includes/page/tools.pug` 页面文件：

```diff
#article-container
  if top_img === false
    h1.page-title= "宝藏网站 ✨"
  .flink
    if site.data.tools
      each i in site.data.tools
        if i.class_name
          h2!= i.class_name
        if i.class_desc
          .flink-desc!=i.class_desc
        if i.flink_style === 'butterfly'
          .butterfly-flink-list
            each item in i.link_list
              .flink-list-item
                a(href=url_for(item.link)  title=item.name target="_blank")
                  .flink-item-icon
                    if theme.lazyload.enable
                      img(data-lazy-src=url_for(item.avatar) onerror=`this.onerror=null;this.src='` + url_for(theme.error_img.flink) + `'` alt=item.name )
                    else
                      img(src=url_for(item.avatar) onerror=`this.onerror=null;this.src='` + url_for(theme.error_img.flink) + `'` alt=item.name )
                  .flink-item-info
                    .flink-item-name= item.name
                    .flink-item-desc(title=item.descr)= item.descr
        else if i.flink_style === 'flexcard'
          .flexcard-flink-list
            each item in i.link_list
              a.flink-list-card(href=url_for(item.link) target='_blank' data-title=item.descr)
                .wrapper.cover
                  - var siteshot = item.siteshot ? url_for(item.siteshot) : 'https://image.thum.io/get/width/400/crop/800/allowJPG/wait/20/noanimate/' + item.link
                  if theme.lazyload.enable
                    img.cover.fadeIn(data-lazy-src=siteshot onerror=`this.onerror=null;this.src='` + url_for(theme.error_img.post_page) + `'` alt='' )
                  else
                    img.cover.fadeIn(src=siteshot onerror=`this.onerror=null;this.src='` + url_for(theme.error_img.post_page) + `'` alt='' )
                .info
                  if theme.lazyload.enable
                    img.flink-avatar(data-lazy-src=url_for(item.avatar) onerror=`this.onerror=null;this.src='` + url_for(theme.error_img.flink) + `'` alt='' )
                  else
                    img(src=url_for(item.avatar) onerror=`this.onerror=null;this.src='` + url_for(theme.error_img.flink) + `'` alt='' )
                  span.flink-sitename= item.name
    != page.content
```

- 创建 `source/tools/index.md` 文件，用于页面的显示：

```md
---
title: 
date: 2022-11-23 15:23:02
type: 'tools'
---

<h1 style="height:10px"> </h1>
{% hideToggle 推荐你的个人收藏宝藏网站啦 %}

- 遵循社会主义核心价值观思想：富强、民主、文明、和谐、自由、平等、公正、法治、爱国、敬业、诚信、友善。

- 可以是梯子网站等各种无法表达的网站，哈哈哈哈哈哈哈哈哈😉

- 网站尽量能够访问，如果不能访问请在网站描述中增加时间限制描述

{% endhideToggle %}

<h3>申请宝藏网站推荐：</h3>
点击 <a href="javascript:void(0)" onclick="addflink()">快速推荐宝藏🙌</a> 按钮到评论区填写信息哦啦啦！
<h1 style="height:30px"> </h1>
<script type="text/javascript" src="https://cdn1.tianli0.top/npm/jquery@latest/dist/jquery.min.js"></script>
<script>
  function addflink() {
    var e = document.getElementsByClassName("el-textarea__inner")[0],
        t = document.createEvent("HTMLEvents");
    t.initEvent("input", !0, !0), e.value = d.value = `\`\`\`yaml
- name: #网站名称
  link: #网站首页地址
  avatar: #网站头像
  descr: #网站简要介绍
  theme_color: #网站背景色，因为#号在yaml中识别为注释请加引号（可选）
\`\`\``, e.dispatchEvent(t);
}
</script>
```

- 修改 `[Blogroot]/themes/Acryple/layout/page.pug` 引入页面文件：

```diff
when 'tools'
    include includes/page/tools.pug
```

- 样式表则直接沿用友链样式，也就是 `flink.styl` 样式表，因此后续的 `[Blogroot]/source/_data.tools.yml` 文件标签需要保持一致。

```yml
- class_name: 镜像站
  flink_style: flexcard
  class_desc: 常用的PyPi/npm/SDK镜像站
  link_list:
  - name: TUNA
    link: https://mirrors.tuna.tsinghua.edu.cn
    avatar: https://mirrors.tuna.tsinghua.edu.cn/static/img/logo-small.png
    descr: 清华大学开源镜像站
  - name: 豆瓣PYPI源
    link: https://pypi.douban.io/simple
    avatar: https://www.douban.com/favicon.ico
    descr: 豆瓣PYPI镜像站
  - name: jsDelivr
    link: https://https://github.com/jsdelivr/jsdelivr
    avatar: https://camo.githubusercontent.com/ef61c154fec4fa5b935957f63561fd15bbd7713c9ae381b955a4dadcdc5457a3/68747470733a2f2f7777772e6a7364656c6976722e636f6d2f696d672f69636f6e5f323536783235362e706e67
    descr: jsDelivr静态资源加速（GFW已墙）
  - name: unpkg
    link: https://cdn1.tianli0.top/npm
    avatar: https://cdn1.tianli0.top/npm/favicon.ico
    descr: 另一个静态资源加速CDN（没墙）
- class_name: 资源下载类
  flink_style: flexcard
  class_desc: 好用的资源下载/收录站
  link_list:
  - name: MSDN,我告诉你
    link: https://msdn.itellyou.cn
    avatar: https://msdn.itellyou.cn/favicon.ico
    descr: 微软MSDNED2K镜像收录站
  - name: 唧唧Down
    link: https://client.jijidown.com/
    avatar: https://client.jijidown.com/images/favicon.ico
    descr: 下载B站视频
  - name: 无损生活
    link: https://flac.life/
    avatar: https://flac.life/favicon.png
    descr: 免费下载全网绝大部分无损音乐
  - name: 百度网盘简易下载助手
    link: https://greasyfork.org/zh-CN/scripts/418182-%E7%99%BE%E5%BA%A6%E7%BD%91%E7%9B%98%E7%AE%80%E6%98%93%E4%B8%8B%E8%BD%BD%E5%8A%A9%E6%89%8B-%E7%9B%B4%E9%93%BE%E4%B8%8B%E8%BD%BD%E5%A4%8D%E6%B4%BB%E7%89%88
    avatar: /img/rjxm.jpg
    descr: 特别好用的bd网盘破解器（不知道为什么公众号分享很怕敏感词）
- class_name: 日常工具
  flink_style: flexcard
  class_desc: 常用日常工具
  link_list:
  - name: 计时器
    link: https://naozhong.net.cn/jishiqi/
    avatar: https://naozhong.net.cn/favicon.ico
    descr: 闹钟网计时器
  - name: 
    link: https://picwish.cn/
    avatar: https://naozhong.net.cn/favicon.ico
    descr: 佐糖在线抠图
- class_name: 图片系列
  flink_style: flexcard
  class_desc: 关于图片的工具
  link_list:
  - name: Bigjpg
    link: //bigjpg.com
    avatar: https://bigjpg.com/favicon.ico
    descr: 高清修复图片与降噪
  - name: waifu2x
    link: //waifu2x.io
    avatar: https://baidu.com
    descr: 高清修复图片与降噪，性能貌似好一点
  - name: jpgrm
    link: https://jpgrm.com/
    avatar: https://jpgrm.com/htdocs/favicon.ico
    descr: 高清修复图片与降噪
  - name: Sheilds
    link: https://shields.io/
    avatar: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAASCAYAAABb0P4QAAABE0lEQVR4AWJkAIKkpCQ7TU3NySIiIlosQMCABejbMWAFf//8YXj77vWn27duZWVGz1nKGBYWZiQkJHSIkZGRmwEPCMxiwAt+/fz3/86VL8EAbuiiAKEoiMLwGcHdCQMBiUAlurDErmJ75tmKP8A3oiJyuF6vAxglws+0C5pv81GJaJdzhlWMMJssaaXM3C0CpmSDLAQtgH3BiCIVB2NRMKWEIoXQMBiLgjHGP9nQ+6ZPLgqGgs9xriDovX8A6Jjgw8ZyIigzn5xz+yZ+6O/tsz7Hy8tb/PLlywPAHMOFT/G3LwRc95fxPyerQCojuKwLDLQAGjoJWIzpAw1mw6bB0guHSYyMDBysnO/5hUTTGvM3rQEAI8qCnLiY3O4AAAAASUVORK5CYII=
    descr: 制作Github项目徽章
  - name: 极简壁纸
    link: https://bz.zzzmh.cn/index
    avatar: https://bz.zzzmh.cn/favicon.ico
    descr: 海量高清壁纸美图&二次元图片
- class_name: 常用测试网站
  flink_style: flexcard
  class_desc: 测试一些基础功能
  link_list:
  - name: 还没做完呢
    link: https://114514.hentai/
    avatar: //1919810.xxx
    descr: 你瞅啥？还妹做完呢！
```

<!-- endtab -->

<!-- tab hexo三连 -->

```shell
hexo clean
hexo g
hexo s
```

<!-- endtab -->

{% endtabs  %}

## 评论系统优化

{% tabs muself-catelist %}

<!-- tab 配置私有 Twikoo 服务 -->

{% note info modern %}
提醒：腾讯云服务需要收费，因此本站采用私有服务器部署的方式，部署采用 Docker 启动。
{% endnote %}

```shell
docker run -p 8888:8080 -v ${PWD}/data:/app/data -d imaegoo/twikoo
```

此时访问 `http://IP:8888` 进行访问测试，打印一下信息表示成功部署：

```json
{
    "code": 100,
    "message": "Twikoo 云函数运行正常，请参考 https://twikoo.js.org/quick-start.html#%E5%89%8D%E7%AB%AF%E9%83%A8%E7%BD%B2 完成前端的配置",
    "version": "1.6.7"
}
```

此时只需要修改主题配置文件 `_config.Acryple.yml` 中 twikoo 配置即可生效。

```yml
twikoo:
  envId: http://IP:8888
  region:
  visitor: true
  option:
```

<!-- endtab -->

<!-- tab 评论输入提醒 -->

{% note info modern %}
版权声明：评论输入提醒主要就是用于在用户输入信息时会进行适当提示，优化来源于 <a href="https://blog.leonus.cn/2022/inputAlert.html">Leonus</a> 魔改教程。
{% endnote %}

> 此方案目前只适用于 twikoo 评论插件，其他评论插件需要进行适当修改。

新建  `themes/Acryple/source/css/commentTip.css` 文件，存放评论提醒相关 css 样式设置：

```css
/* 设置文字内容 :nth-child(1)的作用是选择第几个 */
.el-input.el-input--small.el-input-group.el-input-group--prepend:nth-child(1):before {
    content: '宝的QQ号会自动获取昵称和头像哦🐧';
}

.el-input.el-input--small.el-input-group.el-input-group--prepend:nth-child(2):before {
    content: '宝的评论回复会发送到宝的邮箱哦📧';
}

.el-input.el-input--small.el-input-group.el-input-group--prepend:nth-child(3):before {
    content: '可以通过昵称访问宝的个人主页或博客哦🔗';
}

/* 当用户点击输入框时显示 */
.el-input.el-input--small.el-input-group.el-input-group--prepend:focus-within::before,
.el-input.el-input--small.el-input-group.el-input-group--prepend:focus-within::after {
    display: block;
}

/* 主内容区 */
.el-input.el-input--small.el-input-group.el-input-group--prepend::before {
    /* 先隐藏起来 */
    display: none;
    /* 绝对定位 */
    position: absolute;
    /* 向上移动60像素 */
    top: -60px;
    /* 文字强制不换行，防止left:50%导致的文字换行 */
    white-space: nowrap;
    /* 圆角 */
    border-radius: 10px;
    /* 距离左边50% */
    left: 50%;
    /* 然后再向左边挪动自身的一半，即可实现居中 */
    transform: translate(-50%);
    /* 填充 */
    padding: 14px 18px;
    background: #444;
    color: #fff;
}

/* 小角标 */
.el-input.el-input--small.el-input-group.el-input-group--prepend::after {
    display: none;
    content: '';
    position: absolute;
    /* 内容大小（宽高）为0且边框大小不为0的情况下，每一条边（4个边）都是一个三角形，组成一个正方形。
    我们先将所有边框透明，再给其中的一条边添加颜色就可以实现小三角图标 */
    border: 12px solid transparent;
    border-top-color: #444;
    left: 50%;
    transform: translate(-50%, -48px);
}
```

<!-- endtab -->

<!-- tab 评论表情源更换 -->

进入 `Twikoo 管理面板` ，进入`配置管理`，选择 `插件`，在 `EMOTION_CDN` 输入框中填写以下来自 <a href="https://blog.eurkon.com/">Eurkon</a> 的表情 json 文件源：

```json
https://npm.elemecdn.com/eurkon-cdn/hexo/json/comment/twikoo.json
```

<!-- endtab -->

<!-- tab 评论图床设置 -->

目前图床尚未选定，图片功能目前使用SM·MS图库(实际就是没钱)，非常slow，`请等待后续更新......`

<!-- endtab -->

<!-- tab 评论框样式优化 -->

{% note info modern %}
版权声明：评论框优化来源于 <a href="https://blog.zhheo.com/p/8b1dde4c.html">Heo</a> 魔改教程。
{% endnote %}

加入 Heo 定义的 js 文件即可，实际就是修改一些样式一级定义一些触发动作：

```shell
https://cdn.jsdelivr.net/gh/zhheo/twikoo@dev/dist/twikoo.all.min.js
```

`注`：如果没有效果则尝试将其添加到主题配置文件的 `CDN.option.twikoo` 选项中。

<!-- endtab -->

<!-- tab 邮件回复模板 -->

{% note info modern %}
版权声明：邮件回复模板来源于 <a href="https://blog.zhheo.com/p/169a1abb.html">Heo</a> 魔改教程，内部包含 Twikoo 邮件模板的参数含义，可适当二次魔改。
{% endnote %}

进入 `Twikoo 管理面板` ，进入`配置管理`，选择 `邮件通知`，在 `MAIL_TEMPLATE` 输入框中输入一下代码

```html
<div class="page flex-col">
  <div class="box_3 flex-col" style="
      display: flex;
      position: relative;
      width: 100%;
      height: 206px;
      background: #ef859d2e;
      top: 0;
      left: 0;
      justify-content: center;">
  <div class="section_1 flex-col" style="
      background-image: url(&quot;这里更改为你的网站图标&quot;);
      position: absolute;
      width: 152px;
      height: 152px;
      display: flex;
      top: 130px;
      background-size: cover; ">
  </div>
</div>
  <div class="box_4 flex-col" style="
  margin-top: 92px;
  display: flex;
  flex-direction: column;
  align-items: center;
">
    <div class="text-group_5 flex-col justify-between" style="
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 20px;
">
      <span class="text_1" style="
  font-size: 26px;
  font-family: PingFang-SC-Bold, PingFang-SC;
  font-weight: bold;
  color: #000000;
  line-height: 37px;
  text-align: center;
">嘿！你在&nbsp;${SITE_NAME}&nbsp;博客中收到一条新回复。</span>
      <span class="text_2" style="
  font-size: 16px;
  font-family: PingFang-SC-Bold, PingFang-SC;
  font-weight: bold;
  color: #00000030;
  line-height: 22px;
  margin-top: 21px;
  text-align: center;
">你之前的评论&nbsp;在&nbsp;${SITE_NAME} 博客中收到来自&nbsp;${NICK}&nbsp;的回复</span>
    </div>
    <div class="box_2 flex-row" style="
  margin: 0 20px;
  min-height: 128px;
  background: #F7F7F7;
  border-radius: 12px;
  margin-top: 34px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 32px 16px;
  width: calc(100% - 40px);
">
      
      <div class="text-wrapper_4 flex-col justify-between" style="
  display: flex;
  flex-direction: column;
  margin-left: 30px;
  margin-bottom: 16px;
">
        <span class="text_3" style="
  height: 22px;
  font-size: 16px;
  font-family: PingFang-SC-Bold, PingFang-SC;
  font-weight: bold;
  color: #C5343E;
  line-height: 22px;
">${PARENT_NICK}</span>
        <span class="text_4" style="
  margin-top: 6px;
  margin-right: 22px;
  font-size: 16px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #000000;
  line-height: 22px;
">${PARENT_COMMENT}</span>
      </div><hr style="
    display: flex;
    position: relative;
    border: 1px dashed #ef859d2e;
    box-sizing: content-box;
    height: 0px;
    overflow: visible;
    width: 100%;
"><div class="text-wrapper_4 flex-col justify-between" style="
  display: flex;
  flex-direction: column;
  margin-left: 30px;
">
<hr>
        <span class="text_3" style="
  height: 22px;
  font-size: 16px;
  font-family: PingFang-SC-Bold, PingFang-SC;
  font-weight: bold;
  color: #C5343E;
  line-height: 22px;
">${NICK}</span>
        <span class="text_4" style="
  margin-top: 6px;
  margin-right: 22px;
  font-size: 16px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #000000;
  line-height: 22px;
">${COMMENT}</span>
      </div>
      
      <a class="text-wrapper_2 flex-col" style="
  min-width: 106px;
  height: 38px;
  background: #ef859d38;
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  margin: auto;
  margin-top: 32px;
" href="${POST_URL}">
        <span class="text_5" style="
  color: #DB214B;
">查看详情</span>
      </a>
    </div>
    <div class="text-group_6 flex-col justify-between" style="
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 34px;
">
      <span class="text_6" style="
  height: 17px;
  font-size: 12px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #00000045;
  line-height: 17px;
">此邮件由评论服务自动发出，直接回复无效。</span>
      <a class="text_7" style="
  height: 17px;
  font-size: 12px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #DB214B;
  line-height: 17px;
  margin-top: 6px;
  text-decoration: none;
" href="${SITE_URL}">前往博客</a>
    </div>
  </div>
</div>
```

<!-- endtab -->

<!-- tab 评论区域方格化 -->

图片方格化实际就是提高个人阅读评论区评论的方便化，觉得丑的别用(我觉得气泡不太好看所以没用气泡)，反正我自己觉得这样的方格化挺好，略略略，因此添加 CSS 样式表即可：

```css
:root {
    --gz-radius: 7px;
    --gz-card-border-width: 1px;
  }
  
  /* 浅色模式颜色 */
  [data-theme=light] {
    --gz-border-color: #e3e8f7;
    --gz-card-bg: rgb(235, 221, 221);
    --gz-card-border: #e3e8f7;
    --style-border-always: 1px solid var(--gz-card-border);
    --gz-blue: #425AEF;
  }
  
  /* 深色模式颜色 */
  [data-theme=dark] {
    --gz-border-color: #42444a;
    --gz-card-bg: #1d1b26;
    --gz-card-border: #42444a;
    --style-border-always: 1px solid var(--gz-card-border);
    --gz-blue: #0084FF;
  }
  
  /* 评论区评论大框 */
  .twikoo .tk-comments-container>.tk-comment {
    /* 内边距 */
    padding: 1rem;
    /* 圆角 */
    border-radius: var(--gz-radius);
    /* 背景颜色 */
    background: var(--gz-card-bg);
    /* 变动动画时长 */
    transition: .3s;
  }
  
  /* 浅色模式评论区评论大框 */
  [data-theme=light] .twikoo .tk-comments-container>.tk-comment {
    /* 阴影 */
    box-shadow: var(--card-box-shadow);
  }
  
  /* 浅色模式评论区评论大框阴影悬浮加深 */
  [data-theme=light] .twikoo .tk-comments-container>.tk-comment:hover {
    /* 阴影（浅色模式突出层次感） */
    box-shadow: var(--card-hover-box-shadow);
  }
  
  /* 黑暗模式评论区评论大框 */
  [data-theme=dark] .twikoo .tk-comments-container>.tk-comment {
    /* 边框样式 */
    border-style: solid;
    /* 边框宽度 */
    border-width: var(--gz-card-border-width);
    /* 边框颜色 */
    border-color: var(--gz-card-border);
  }
  
  /* 设备信息 */
  .twikoo .tk-extra {
    /* 圆角 */
    border-radius: var(--gz-radius);
    /* 背景颜色 */
    background: var(--gz-card-bg);
    /* 内边距 */
    padding: 0.4rem;
    /* 底边距 */
    margin-bottom: 1rem;
    /* 变动动画时长 */
    transition: .3s;
  }
  
  /* 浅色模式设备信息 */
  [data-theme=light] .twikoo .tk-extra {
    /* 阴影 */
    box-shadow: var(--card-box-shadow);
  }
  
  /* 浅色模式设备信息阴影悬浮加深 */
  [data-theme=light] .twikoo .tk-extra:hover {
    /* 阴影 */
    box-shadow: var(--card-hover-box-shadow);
  }
  
  /* 黑暗模式设备信息 */
  [data-theme=dark] .twikoo .tk-extra {
    /* 边框样式 */
    border-style: solid;
    /* 边框宽度 */
    border-width: var(--gz-card-border-width);
    /* 边框颜色 */
    border-color: var(--gz-card-border);
  }
  
  /* 加载更多按钮 */
  .twikoo .tk-expand {
    /* 圆角 */
    border-radius: var(--gz-radius);
  }
  
  /* 浅色模式加载更多按钮 */
  [data-theme=light] .twikoo .tk-expand {
    /* 阴影 */
    box-shadow: var(--card-box-shadow);
  }
  
  /* 浅色模式加载更多按钮（鼠标悬浮时） */
  [data-theme=light] .twikoo .tk-expand:hover {
    /* 阴影 */
    box-shadow: var(--card-hover-box-shadow);
    /* 背景颜色 */
    background-color: var(--btn-bg);
  }
  
  /* 黑暗模式加载更多按钮（鼠标悬浮时） */
  [data-theme=dark] .twikoo .tk-expand:hover {
    /* 背景颜色 */
    background-color: var(--gz-blue);
  }
  
  /* 黑暗模式加载更多按钮 */
  [data-theme=dark] .twikoo .tk-expand {
    /* 边框样式 */
    border-style: solid;
    /* 边框宽度 */
    border-width: var(--gz-card-border-width);
    /* 边框颜色 */
    border-color: var(--gz-card-border);
  }
```

<!-- endtab -->

<!--tab 侧边栏评论 -->

{% note info modern %}
版权声明：根据 <a href="https://akilar.top/posts/397b8b90/">店长</a> 的魔改方案实现侧边评论按钮点击弹出评论页面，而不是以前的抵达评论区。
{% endnote %}

- 新建 `/themes/Acryple/source/css/fixed_comment.css` 样式表：

```css
div#post-comment.fixedcomment {
    position: fixed;
    top: 0;
    width: 60%;
    right: 0;
    padding: 25px 30px 20px 20px;
    height: 100vh;
    overflow: scroll;
    z-index: 999;
    background: rgba(222, 222, 222, 0.95);
    box-shadow:3px 2px 14px #464340;
    animation: fixedright 0.5s linear;
}
div#post-comment.fixedcomment::-webkit-scrollbar {
width: 0;
}
div#quit-board{
  display: none;
}
div#quit-board.fixedcomment {
  position: fixed;
  display:block!important;
  left: 0;
  top: 0;
  width: 40%;
  height: 100vh;
  z-index: 89!important;
  background: rgba(25,25,25,0.3);
  filter: blur(4px) !important;
  animation: fixedleft 0.5s linear;
}
/*手机端样式适配*/
@media screen and (max-width: 768px) {
  div#post-comment.fixedcomment {
      width: 90%;
      right: 0;
  }
  div#quit-board.fixedcomment {
    width: 10%;
  }
}
/*动画效果*/
@keyframes fixedright {
  from {right:-50%;}
  to {right:0;}
}
@keyframes fixedleft {
  from {left:-50%;}
  to {left:0;}
}
/* 夜间模式匹配 */
[data-theme="dark"]
  div#post-comment.fixedcomment {
      background: rgba(35, 35, 35, 0.95);
      box-shadow:3px 2px 12px #90a1a4;
  }
[data-theme="dark"]
  div#quit-board.fixedcomment {
    background: rgba(147, 146, 128, 0.3);
  }
```

- 新建 `/themes/Acryple/source/js/fixed_comment.js` JS 逻辑：

```js
//移除FixedComment类，保持原生样式，确保不与最新评论跳转冲突
function RemoveFixedComment() {
  var activedItems = document.querySelectorAll('.fixedcomment');
  if (activedItems) {
    for (i = 0; i < activedItems.length; i++) {
      activedItems[i].classList.remove('fixedcomment');
    }
  }
}
//给post-comment添加fixedcomment类
function AddFixedComment(){
  var commentBoard = document.getElementById('post-comment');
  var quitBoard = document.getElementById('quit-board');
  commentBoard.classList.add('fixedcomment');
  quitBoard.classList.add('fixedcomment');
}
//创建一个蒙版，作为退出键使用
function CreateQuitBoard(){
  var quitBoard = `<div id="quit-board" onclick="RemoveFixedComment()"></div>`
  var commentBoard = document.getElementById('post-comment');
  commentBoard.insertAdjacentHTML("beforebegin",quitBoard)
}

function FixedCommentBtn(){
  //第一步，判断当前是否存在FixedComment类，存在则移除，不存在则添加
  // 获取评论区对象
  var commentBoard = document.getElementById('post-comment');
  // 若评论区存在
  if (commentBoard) {
      // 判断是否存在fixedcomment类
      if (commentBoard.className.indexOf('fixedcomment') > -1){
        // 存在则移除
        RemoveFixedComment();
      }
      else{
        // 不存在则添加
        CreateQuitBoard();
        AddFixedComment();
      }
  }
  // 若不存在评论区则跳转至留言板(留言板路径记得改为自己的)
  else{
    // 判断是否开启了pjax，尽量不破坏全局吸底音乐刷新
      if (pjax){
        pjax.loadUrl("/comments/#post-comment");
      }
      else{
        window.location.href = "/comments/#post-comment";
      }
  }
}
//切换页面先初始化一遍，确保开始时是原生状态。所以要加pjax重载。
RemoveFixedComment();
```

- 理论上给任意元素添加 `onclick="FixedCommentBtn();"` 属性就可以实现评论区侧栏开闭，本站采用修改原生 Butterfly 主题的直达评论按钮的方式来实现。因此需要修改原来的侧边栏按钮功能  `/themes/Acryple/layout/includes/rightside.pug` ：

```diff
  if commentsJsLoad
-   a#to_comment(href="#post-comment" title=_p("rightside.scroll_to_comment"))
+   button#to_comment(type="button" title=_p("rightside.scroll_to_comment") onclick="FixedCommentBtn();")
```

- 引入定义好的 CSS 和 JS 文件。

```yml
- <link rel="stylesheet" href="/css/fixed_comment.css"  media="defer" onload="this.media='all'">
- <script data-pjax defer src="/js/fixed_comment.js"></script>
```

<!-- endtab -->

<!-- tab hexo三连 -->

```shell
hexo clean 
hexo g 
hexo s
```

<!-- endtab -->

{% endtabs  %}

## 加载进度条

{% note info modern %}
版权声明：此效果是为修改博客顶端加载时的进度条，来源于 <a href="https://xlenco.eu.org/posts/769f.html">Xlenco</a> 。
{% endnote %}
{% tabs muself-catelist %}
<!-- tab 引入 CSS 样式 -->

新建  `themes/Acryple/source/css/paceTip.css` 文件，存放加载进度条相关 css 样式设置（如果使用 Acryple 主题则需要修改 `style.css` 文件即可）。

```css
.pace {
  pointer-events: none;
  user-select: none;
  z-index: 2;
  position: fixed;
  margin: auto;
  top: 4px;
  left: 0;
  right: 0;
  height: 8px;
  border-radius: 8px;
  width: 6rem;
  background: #eaecf2;
  overflow: hidden;
}

.pace-inactive .pace-progress {
  opacity: 0;
  transition: 0.3s ease-in;
}

.pace.pace-inactive {
  opacity: 0;
  transition: 0.3s;
  top: -8px;
}

.pace .pace-progress {
  box-sizing: border-box;
  transform: translate3d(0, 0, 0);
  position: fixed;
  z-index: 2;
  display: block;
  position: absolute;
  top: 0;
  right: 100%;
  height: 100%;
  width: 100%;
  background: #49b1f5;
  background: linear-gradient(
    to right,
    rgb(18, 194, 233),
    rgb(196, 113, 237),
    rgb(246, 79, 89)
  );
  animation: gradient 2s ease infinite;
  background-size: 200%;
}
```

<!-- endtab -->

<!-- tab 引入 JS 逻辑文件 -->

```yml
- <script src="//cdn.bootcss.com/pace/1.0.2/pace.min.js"></script>
```

<!-- endtab -->

<!-- tab hexo三连 -->

```shell
hexo clean 
hexo g 
hexo s
```

<!-- endtab -->

{% endtabs  %}

## 标签云上标

{% note info modern %}
版权声明：为标签云增加上标显示文章数量，方案来源于 <a href="https://blog.eurkon.com/post/6687849c.html">Eurkon</a> 。
{% endnote %}

{% tabs muself-catelist %}
<!-- tab 标签云上标 -->

修改  `themes/Acryple/scripts/helpers/page.js` 文件，存放加载进度条相关 css 样式设置（如果使用 Acryple 主题则需要修改 `style.css` 文件即可）。

```diff
source.forEach(tag => {
	const ratio = length ? sizes.indexOf(tag.length) / length : 0
	const size = minfontsize + ((maxfontsize - minfontsize) * ratio)
	let style = `font-size: ${parseFloat(size.toFixed(2))}${unit};`
	const color = 'rgb(' + Math.floor(Math.random() * 201) + ', ' + Math.floor(Math.random() * 201) + ', ' + Math.floor(Math.random() * 201) + ')' // 0,0,0 -> 200,200,200
	style += ` color: ${color}`
-	result += `<a href="${env.url_for(tag.path)}" style="${style}">${tag.name}</a>`
+	result += `<a href="${env.url_for(tag.path)}" style="${style}">${tag.name}<sup>${tag.length}</sup></a>`
})
```

<!-- endtab -->

<!-- tab 引入 JS 逻辑文件 -->

```yml
- <script src="//cdn.bootcss.com/pace/1.0.2/pace.min.js"></script>
```

<!-- endtab -->

<!-- tab hexo三连 -->

```shell
hexo clean 
hexo g 
hexo s
```

<!-- endtab -->

{% endtabs  %}

## 留言弹幕

{% note info modern %}
版权声明：留言采用弹幕样式弹出直观化显示，美化方案来源于 <a href="https://blog.dorakika.cn/p/20220418.html">KIKA</a> ，魔改基于 Twikoo 评论系统，其他系统需要修改。
{% endnote %}

{% tabs muself-catelist %}
<!-- tab 留言页面 -->

source 目录下创建 barrage 文件夹，内部编写 index.md 文件，用来显示留言板内容。

```md
---
title: 留言板
date: 2022-04-18
type: "barrage"
aside: false
permalink: /barrage/
---

<div id="barrage-container">
	<div class="loading">与主机通讯中……</div>
</div>

<link rel="stylesheet" href="/css/barrage.css">
<script type="text/javascript" src="/js/barrage.js"></script>

```

`注`：此处在页面中直接引入了 `barrage.css` 样式表和 `barrage.js` 逻辑文件，后续需要编写完善。

<!-- endtab -->

<!-- tab 留言页面 CSS 样式 -->

创建  `themes/Acryple/source/css/barrage.css` 样式表文件：

```css
#barrage-container{
	width: 100%;
	height: 400px;
	background: rgba(73,177,245,0.1);
	background-size: cover;
	background-position: center;
	border-radius: 8px;
	position: relative;
}

#barrage-container .barrage{
	min-width: 150px;
	max-width: 300px;
	min-height: 80px;
	max-height: 300px;
	position: absolute;
	padding: 8px;
	background: rgba(0, 0, 0, 0.9);
	border-radius: 8px;
	color: #fff;
	animation: barrageIn 0.3s cubic-bezier(.25,.01,.5,1.5);
	transition: 1s;
	display: flex;
	flex-direction: column;
	border: 1px solid rgba(255, 255, 255, 0.2);
}
#barrage-container .barrage.out{
	opacity: 0;
}
@keyframes barrageIn{
	0%{
		transform: scale(0.1);
	}
	
	100%{
		transform: scale(1.0);
	}
}

#barrage-container .barrage .barrageHead{
	height: 30px;
	padding: 4px 0;
	line-height: 22px;
	font-size: 12px;
	border-bottom: 1px solid rgba(255,255,255,0.3);
    display: flex;
    justify-content: space-between;
}
#barrage-container .barrage .barrageAvatar{
	width: 16px;
	height: 16px;
	margin: 0;
	border-radius: 50%;
}
#barrage-container .barrage .barrageContent{
	font-size: 14px;
}
```

<!-- endtab -->

<!-- tab 留言页面 JS 逻辑文件 -->

创建  `themes/Acryple/source/js/barrage.js` 逻辑文件：

> 本站使用 Twikoo 评论系统是私有服务器部署，因此后续的 twikooUrl 都是填写 Twikoo 的 `envId` ，也就是环境ID，而 accessToken 则是可以通过 `F12` 打开控制台，进入 `Network` 选项卡，搜索 Twikoo 或是自己私有服务器的 IP，下方的请求中选一个就可以找到 accessToken ，后续会使用。

```js
//这里可以定义弹幕的背景色与字体色
const barrageColors = [
	['#386adecc','#fffa'],
	['#9248f0cc','#fffa'],
	['#2da55dcc','#fffa'],
	['#ffc505cc','#fffc'],
	['#d44e30cc','#fffa']
]
//这两个是与随机位置的范围相关的
const maxBarrageWidth = 150;
const maxBarrageHeight = 100;
//最多同时显示的弹幕个数
const maxBarrage = 10;
//每个弹幕的间隔时间
const barrageTime = 1500;
//我用的是Vercel部署，这里链接就是Vercel的链接，腾讯云的自己琢磨一下哈，应该也差不多
const twikooUrl = "自己的 envId 环境ID";
//token要手动获取（反正我是开发者工具里获取的，教程在下面
const accessToken = "自己的 accessToken";
const pageUrl = "/barrage/"

const barrageTimer = [];
let barrageList = [];
let barrageIndex = 0;

const barrageDom = document.getElementById('barrage-container');
window.addEventListener('load',()=>{
	var data = JSON.stringify({
	  "event": "COMMENT_GET",
	  "accessToken": accessToken,
	  "url": pageUrl
	});

	var xhr = new XMLHttpRequest();
	xhr.withCredentials = true;

	xhr.addEventListener("readystatechange", function() {
	  if(this.readyState === 4) {
		barrageList = linkFilter(JSON.parse(this.responseText).data);
		barrageDom.innerHTML = '';
	  }
	});

	xhr.open("POST", twikooUrl);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(data);		//发送请求获取评论数据
	setInterval(()=>{
		if(barrageList.length){
			popBarrage(barrageList[barrageIndex]);
			barrageIndex += 1;
			barrageIndex %= barrageList.length;
		}
		if(barrageTimer.length > (barrageList.length > maxBarrage?maxBarrage:barrageList.length)){
			removeBarrage(barrageTimer.shift())
		}
	},barrageTime)
})

//过滤掉博主自身发表的留言/评论
function linkFilter(data){
	const newData = data.filter((comment)=>{
		return !comment.master;
	})
	return newData;
}
function popBarrage(data){
	let barrage = document.createElement('div');
	let width = barrageDom.clientWidth;
	let height = barrageDom.clientHeight;
	barrage.className = 'barrage'
	barrage.style.top = Math.floor(Math.random()*(height - maxBarrageHeight))+'px';
	barrage.style.left = Math.floor(Math.random()*(width - maxBarrageWidth))+'px';
	let ran = Math.floor(Math.random()*barrageColors.length)
	barrage.style.background = barrageColors[ran][0];
	barrage.style.color = barrageColors[ran][1];

    //拼凑内部 DOM 元素
	barrage.innerHTML = `
		<div class="barrageHead">
			<img class="barrageAvatar" src="https://cravatar.cn/avatar/${data.mailMd5}"/>
			<div class="barrageNick">${data.nick}</div>
		</div>
		<div class="barrageContent">${data.comment}</div>
	`
	barrageTimer.push(barrage);
	barrageDom.append(barrage);
    //防止溢出（这里防止随机位置产生的溢出，弹幕太大产生的溢出就要靠css了
	if(barrage.clientWidth+parseInt(barrage.style.left)>width){
		barrage.style.left = (width - barrage.clientWidth) + 'px';
	}
	if(barrage.clientHeight+parseInt(barrage.style.top)>height){
		barrage.style.top = (height - barrage.clientHeight) + 'px';
	}
}
function removeBarrage(barrage){
	barrage.className = 'barrage out';
	setTimeout(()=>{
		barrageDom.removeChild(barrage);
	},1000)
}
```

> 由于 `linkFilter 方法` 过滤掉了博主自身发表的留言/评论，因此只有当存在其他 guest 用户发表评论时留言板才会有弹幕显示。

<!-- endtab -->

<!-- tab 侧边栏弹幕容器设置 -->

修改 `themes/Acryple/layout/includes/third-party/comments/index.pug` 文件：

```diff
  .comment-wrap
    each name in theme.comments.use
      ............
+  .comment-barrage
+  link(rel="stylesheet" href="/css/commentBarrage.css")
+  script(src="/js/commentBarrage.js")
```

`注`：此处直接引入了弹幕的  `commentBarrage.css` 样式表和 `commentBarrage.js` 逻辑文件，后续需要编写完善，同时也确定 `不需要再在主题配置文件单独引入`。

<!-- endtab -->

<!-- tab 弹幕 CSS 样式表 -->

修改 `themes/Acryple/source/css/commentBarrage.css` 文件：

```css
#post-comment .comment-barrage{
	position: fixed;
	bottom: 0;
	right: 55px;
	padding: 0 0 30px 10px;
	z-index: 100;
	display: flex;
	flex-direction: column;
	justify-content: end;
	align-items: flex-end;
}

@media screen and (max-width: 768px){
	#post-comment .comment-barrage{
		display: none;
	}
}
#post-comment .comment-barrage-item{
	min-width: 100px;
	max-width: 200px;
	width: fit-content;
	min-height: 80px;
	max-height: 144px;
	margin: 4px 0;
	padding: 8px;
	background: rgba(0, 0, 0, 0.9);
	border-radius: 8px;
	color: #fff;
	animation: barrageIn 0.3s cubic-bezier(.25,.01,.5,1.5);
	transition: 1s;
	display: flex;
	flex-direction: column;
	border: 1px solid rgba(255, 255, 255, 0.2);
}
#post-comment .comment-barrage-item.out{
	opacity: 0;
}
@keyframes barrageIn{
	0%{
		transform: scale(0.1);
	},
	100%{
		transform: scale(1.0);
	}
}

#post-comment .comment-barrage-item .barrageHead{
	height: 30px;
	padding: 0;
	line-height: 30px;
	font-size: 12px;
	border-bottom: 1px solid rgba(255,255,255,0.3);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
#post-comment .comment-barrage-item .barrageAvatar{
	width: 16px;
	height: 16px;
	margin: 0;
	border-radius: 50%;
}
#post-comment .comment-barrage-item .barrageContent{
	font-size: 14px;
	height: calc(100% - 30px);
	overflow: scroll;
}
#post-comment .comment-barrage-item .barrageContent::-webkit-scrollbar{
	height: 0;
	width: 4px;
}
#post-comment .comment-barrage-item .barrageContent::-webkit-scrollbar-button{
	display: none;
}
```

<!-- endtab -->

<!-- tab 弹幕 JS 逻辑 -->

修改 `themes/Acryple/source/js/commentBarrage.js` 文件：

```js
const commentBarrageConfig = {
	//颜色
	colors:[
		['rgba(56,106,178,0.93)','rgba(255,255,255,0.8)'],
		['rgba(146, 72, 240,0.93)','rgba(255,255,255,0.8)'],
		['rgba(45, 165, 93,0.93)','rgba(255,255,255,0.8)'],
		['rgba(255, 197, 5,0.93)','rgba(255,255,255,0.9)'],
		['rgba(212, 78, 48,0.93)','rgba(255,255,255,0.8)']
	],
	//同时最多显示弹幕数
	maxBarrage: 3,
	//弹幕显示间隔时间ms
	barrageTime: 3000,
	//twikoo部署地址腾讯云的为环境ID
	twikooUrl: "自己的 envId 环境ID",
	//token获取见上方
	accessToken: "自己的 accessToken",
	pageUrl: window.location.pathname,
	barrageTimer: [],
	barrageList: [],
	barrageIndex: 0,
	dom: document.querySelector('.comment-barrage'),
}

function initCommentBarrage(){
		var data = JSON.stringify({
		  "event": "COMMENT_GET",
		  "commentBarrageConfig.accessToken": commentBarrageConfig.accessToken,
		  "url": commentBarrageConfig.pageUrl
		});
		var xhr = new XMLHttpRequest();
		xhr.withCredentials = true;
		xhr.addEventListener("readystatechange", function() {
		  if(this.readyState === 4) {
			commentBarrageConfig.barrageList = commentLinkFilter(JSON.parse(this.responseText).data);
			commentBarrageConfig.dom.innerHTML = '';
		  }
		});
		xhr.open("POST", commentBarrageConfig.twikooUrl);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.send(data);

		setInterval(()=>{
			if(commentBarrageConfig.barrageList.length){
				popCommentBarrage(commentBarrageConfig.barrageList[commentBarrageConfig.barrageIndex]);
				commentBarrageConfig.barrageIndex += 1;
				commentBarrageConfig.barrageIndex %= commentBarrageConfig.barrageList.length;
			}
			if(commentBarrageConfig.barrageTimer.length > (commentBarrageConfig.barrageList.length > commentBarrageConfig.maxBarrage?commentBarrageConfig.maxBarrage:commentBarrageConfig.barrageList.length)){
				removeCommentBarrage(commentBarrageConfig.barrageTimer.shift())
			}
		},commentBarrageConfig.barrageTime)

}
function commentLinkFilter(data){
	data.sort((a,b)=>{
		return a.created - b.created;
	})
	let newData = [];
	data.forEach(item=>{
		newData.push(...getCommentReplies(item));
	});
	return newData;
}
function getCommentReplies(item){
	if(item.replies){
		let replies = [item];
		item.replies.forEach(item=>{
			replies.push(...getCommentReplies(item));
		})
		return replies;
	}else{
		return [];
	}
}
function popCommentBarrage(data){
	let barrage = document.createElement('div');
	let width = commentBarrageConfig.dom.clientWidth;
	let height = commentBarrageConfig.dom.clientHeight;
	barrage.className = 'comment-barrage-item'
	let ran = Math.floor(Math.random()*commentBarrageConfig.colors.length)
	barrage.style.background = commentBarrageConfig.colors[ran][0];
	barrage.style.color = commentBarrageConfig.colors[ran][1];

	barrage.innerHTML = `
		<div class="barrageHead">
			<div class="barrageNick">${data.nick}</div>
			<img class="barrageAvatar" src="https://cravatar.cn/avatar/${data.mailMd5}"/>
		</div>
		<div class="barrageContent">${data.comment}</div>
	`
	commentBarrageConfig.barrageTimer.push(barrage);
	commentBarrageConfig.dom.append(barrage);
}
function removeCommentBarrage(barrage){
	barrage.className = 'comment-barrage-item out';
	setTimeout(()=>{
		commentBarrageConfig.dom.removeChild(barrage);
	},1000)
}

initCommentBarrage()

//进行弹幕开关的切换实现
function switchCommentBarrage(){
    let commentBarrage = document.querySelector('.comment-barrage');
    if(commentBarrage){
        $(commentBarrage).toggle()
    }
}
```

<!-- endtab -->

<!-- tab 控制弹幕显隐 -->

修改 `themes/Acryple/layout/includes/rightside.pug` 文件，直接在评论按钮下面添加控制弹幕显隐的按钮。

```diff
	when 'comment'
        if commentsJsLoad
          button#to_comment(type="button" title=_p("rightside.scroll_to_comment") onclick="FixedCommentBtn();")
            i.fas.fa-comments
+          a#switch_commentBarrage(href="javascript:switchCommentBarrage();" title="开关弹幕")
+            i.iconfont.icon-danmu
```

<!-- endtab -->

<!-- tab hexo三连 -->

```shell
hexo clean 
hexo g 
hexo s
```

<!-- endtab -->

{% endtabs  %}

## 侧边电子钟

{% note info modern %}
版权声明：侧边电子钟采用 <a href="https://anzhiy.cn/posts/fc18.html">安知鱼</a> 的 clock 插件 hexo-butterfly-clock-anzhiyu，需要使用 npm 进行安装。
{% endnote %}

{% tabs muself-catelist %}

<!-- tab npm安装插件 -->

```shell
npm uninstall hexo-butterfly-clock		# 卸载店长的原版电子钟
npm install hexo-butterfly-clock-anzhiyu --save		# 安装anzhiyu的电子钟插件
```

<!-- endtab -->

<!-- tab 配置电子钟 -->

在主题配置文件 `_config.butterfly.yml` 中添加电子钟的相关配置：

```shell
# electric_clock
# see https://anzhiy.cn/posts/fc18.html
electric_clock:
  enable: true	 # 开关
  priority: 5 	# 过滤器优先权
  enable_page: all 	# 应用页面
  exclude:
    # - /posts/
    # - /about/
  layout: 	# 挂载容器类型
    type: class
    name: sticky_layout
    index: 0
  loading: https://cdn.cbd.int/hexo-butterfly-clock-anzhiyu/lib/loading.gif 	#加载动画自定义
  clock_css: https://cdn.cbd.int/hexo-butterfly-clock-anzhiyu/lib/clock.min.css
  clock_js: https://cdn.cbd.int/hexo-butterfly-clock-anzhiyu/lib/clock.min.js
  ip_api: https://widget.qweather.net/simple/static/js/he-simple-common.js?v=2.0
  qweather_key: 5cb4f63e85c148a3bd7f49f81456f48c  	# 和风天气key
  gaud_map_key: 334aebc0599a80601395fd75921efc43  	# 高得地图web服务key
  default_rectangle: false 	# 开启后将一直显示rectangle位置的天气，否则将获取访问者的地理位置与天气
  rectangle: 112.982279,28.19409 	# 获取访问者位置失败时会显示该位置的天气，同时该位置为开启default_rectangle后的位置
```

- 配置项的详细设置描述：

|       参数        | 备选值/类型 |                             释义                             |
| :---------------: | :---------: | :----------------------------------------------------------: |
|     priority      |   number    |  【可选】过滤器优先级，数值越小，执行越早，默认为 10，选填   |
|      enable       | true/false  |                       【必选】控制开关                       |
|    enable_page    |  path/all   | 【可选】填写想要应用的页面的相对路径（即路由地址）,如根目录就填’/‘,分类页面就填’/categories/‘。若要应用于所有页面，就填’all’，默认为 all |
|      exclude      |    path     | 【可选】填写想要屏蔽的页面，可以多个。写法见示例。原理是将屏蔽项的内容逐个放到当前路径去匹配，若当前路径包含任一屏蔽项，则不会挂载。 |
|    layout.type    |  id/class   |   【可选】挂载容器类型，填写 id 或 class，不填则默认为 id    |
|    layout.name    |    text     |                     【必选】挂载容器名称                     |
|   layout.index    | 0 和正整数  | 【可选】前提是 layout.type 为 class，因为同一页面可能有多个 class，此项用来确认究竟排在第几个顺位 |
|      loading      |     URL     |                 【可选】电子钟加载动画的图片                 |
|     clock_css     |     URL     |                 【可选】电子钟样式 CDN 资源                  |
|     clock_js      |     URL     |               【可选】电子钟执行脚本 CDN 资源                |
|      ip_api       |     URL     |                  【可选】获取时钟 IP 的 API                  |
|   qweather_key    |    text     |                     【可选】和风天气 key                     |
|   gaud_map_key    |    text     |                【可选】高得地图 web 服务 key                 |
| default_rectangle |    text     | 【可选】开启后将一直显示 rectangle 位置的天气，否则将获取访问者的地理位置与天气 |
|     rectangle     |    text     | 【可选】获取访问者位置失败时会显示该位置的天气，同时该位置为开启 default_rectangle 后的位置 |

<!-- endtab -->

<!-- tab hexo三连 -->

```shell
hexo clean 
hexo g 
hexo s
```

<!-- endtab -->

{% endtabs  %}

## 音乐界面

{% note info modern %}
版权声明：音乐界面复刻 <a href="https://www.chuckle.top/article/3322c8a8.html">轻笑Chuckle</a> 音乐界面的配置，比较富有新意，使用纯 JS 实现。
{% endnote %}

{% tabs muself-catelist %}

<!-- tab 音乐界面 -->

在主题配置文件 `_config.butterfly.yml` 中添加电子钟的相关配置：

```js
---
title: 
date: 2022-11-15 20:20:27
top_img: false
type: musiccentor
---

<style>
@media screen and (max-width: 650px) {
	.music-player__controls {
		width: 100%
	}
	.music-player__main {
		height: 45%
	}
	.music__info {
		margin-top: 30px;
		text-align: center;
	}
	.music-player__disc{
		float: none;
		margin: 0 auto !important;
	}
	.toggle{
		margin-top: 130px;
	}
}
</style>
<h1 style="text-align:center">推荐~音乐 ✨</h1>
<!-- 播放器 -->
<div class="music-player">
	<!-- audio标签 -->
	<audio class="music-player__audio" ></audio>
	<!-- 播放器主体 -->
	<div class="music-player__main">
		<!-- 模糊背景 -->
		<div class="music-player__blur"></div>
		<!-- 唱片 -->
		<div class="music-player__disc">
			<!-- 唱片图片 -->
			<div class="music-player__image">
				<img width="100%" src="" alt="">
			</div>
			<!-- 指针 -->
			<div class="music-player__pointer"><img width="100%" src="./images/cd_tou.png" alt=""></div>
		</div>
		<!-- 控件主体 -->
		<div class="music-player__controls">
			<!-- 歌曲信息 -->
			<div class="music__info">
				<h3 class="music__info--title">...</h3>
			</div>
			<!-- 控件... -->
			<div class="player-control">
				<div class="player-control__content">
					<div class="player-control__btns">
						<div class="player-control__btn player-control__btn--prev"><i class="iconfont icon-prev"></i></div>
						<div class="player-control__btn player-control__btn--play"><i class="iconfont icon-play"></i></div>
						<div class="player-control__btn player-control__btn--next"><i class="iconfont icon-next"></i></div>
						<div class="player-control__btn player-control__btn--mode"><i class="iconfont icon-random"></i></div>
					</div>
					<div class="player-control__volume">
						<div class="control__volume--icon player-control__btn"><i class="iconfont icon-volume"></i></div>
						<div class="control__volume--progress progress"></div>
					</div>
				</div>
				<div class="player-control__content">
					<div class="player__song--progress progress"></div>
					<div class="player__song--timeProgess nowTime">00:00</div>
					<div class="player__song--timeProgess totalTime">00:00</div>
				</div>
			</div>
		</div>
	</div>
	<!-- 歌曲列表 -->
	<div class="music-player__list">
		<ul class="music__list_content">
		</ul>
	</div>
</div>

{% hideToggle 音乐资源获取 %}	
- 富强、民主、文明、和谐、自由、平等、公正、法治、爱国、敬业、诚信、友善
- 注意：本站音乐资源版权如果涉及到侵权问题，请联系我 <span style="color:pink; background-color:pink">1963885633@qq.com</span> 删除。
- 如果是想获取目录中的音乐资源，请点击下方获取音乐资源按钮在评论区评论，博主有时间时会将资源发送到宝评论时所填写的邮箱中(评论区也可以另选获取方式)
- 音乐资源来源于个人收藏，获取到希望能够给我一点糖糖作为打赏，嘻嘻嘻🤞
- 如果需要其他音乐资源，可以在下方申请，博主会努力给宝找到哒👌
<h1 style="height:10px"> </h1>
<h3>获取音乐资源：</h3>
点击 <a href="javascript:void(0)" onclick="getSong()">获取音乐资源🙌</a> 按钮到评论区填写信息哦啦啦！
{% endhideToggle %}
<h3>申请音乐资源推荐：</h3>
点击 <a href="javascript:void(0)" onclick="addflink()">快速推荐音乐到本站🙌</a> 按钮到评论区填写信息哦啦啦！
<h1 style="height:50px"> </h1>


<script type="text/javascript" src="https://cdn1.tianli0.top/npm/jquery@latest/dist/jquery.min.js"></script>
<script>
  function addflink() {
    var e = document.getElementsByClassName("el-textarea__inner")[0],
        t = document.createEvent("HTMLEvents");
    t.initEvent("input", !0, !0), e.value = d.value = `\`\`\`yaml
  Song:   # 歌曲名称
  Singer: # 歌手名字
  descr:  # 备注描述
  Url:    # 资源地址(没有资源填写待获取)
\`\`\``, e.dispatchEvent(t);
}
</script>
<script>
  function getSong() {
    var e = document.getElementsByClassName("el-textarea__inner")[0],
        t = document.createEvent("HTMLEvents");
    t.initEvent("input", !0, !0), e.value = d.value = `\`\`\`yaml
  name:   # 歌曲名称
  type:   # 获取方式(邮箱/微信/QQ/其他)
  descr:  # 详细接收资源方式
\`\`\``, e.dispatchEvent(t);
}
</script>
<script src="/js/player_utils.js"></script>
<script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.slim.min.js"></script>
<script src="/js/player.js?10"></script>
<div style="text-align:center;margin:-100px 0; font:normal 14px/24px 'MicroSoft YaHei';color:#ffffff"></div>
<h1 style="height:50px"> </h1>
```

`注`：从页面上发现，需要编写 `utils.js` 和 `player.js` 两个逻辑实现的 JS 文件。

> 站点音乐界面中的来源于 <a href="https://blog.chuckle.top/img/cd.png">cd.png</a> 和 <a href="https://blog.chuckle.top/img/cd_tou.png">cd_tou.png</a> ，同时需要在 `blog\source\musiccentor` 下新建 songs 和 images 文件夹，songs 内直接放入歌曲。再在 images 文件夹内新建 songs 文件夹，里面放歌曲封面。

<!-- endtab -->

<!-- tab 编写 JS 实现 -->

- 新增 `themes/Acryple/source/js/player.js` 逻辑文件

```js
//创建一个音乐播放器的类 单例模式
class Player {
    constructor() { //类的构造函数
        //如果没有实例化，就去构造一个实例
        return this.getInstance(...arguments);
    }

    //构建实例
    getInstance() {
        let instance = new PlayerCreator(...arguments);
        //让实例可以使用到Player的原型的属性方法
        // instance.__proto__=Player.prototype;
        // instance.constructor=Player;
        //把构建好的实例挂在Player类上
        Player.instance = instance;
        return instance;
    }
}

//歌曲信息
class Musics {
    //歌曲
    constructor() {
        this.songs = [{
                id: 1,
                title: '最伟大的作品-周杰伦',
                singer: '周杰伦',
                songUrl: '../../../../musiccentor/songs/最伟大的作品.flac',
                imageUrl: 'https://y.qq.com/music/photo_new/T002R300x300M0000042cH172YJ0mz_3.jpg?max_age=2592000'
            },
            {
                id: 2,
                title: '消愁-毛不易',
                singer: '毛不易',
                songUrl: '../../../../musiccentor/songs/消愁.mp3',
                imageUrl: '../../../../musiccentor/images/songs/消愁.jpg'
            },
            {
                id: 3,
                title: '盗墓笔记·十年人间-李常超',
                singer: '李常超',
                songUrl: '../../../../musiccentor/songs/盗墓笔记·十年人间.mp3',
                imageUrl: 'https://y.qq.com/music/photo_new/T002R300x300M000003tKntM4Tnk3N_1.jpg?max_age=2592000'
            },
            {
                id: 4,
                title: 'Mojito-周杰伦',
                singer: '周杰伦',
                songUrl: '../../../../musiccentor/songs/Mojito.flac',
                imageUrl: 'https://y.qq.com/music/photo_new/T002R300x300M0000042cH172YJ0mz_3.jpg?max_age=2592000'
            },
            {
                id: 5,
                title: '错过的烟火-周杰伦',
                singer: '周杰伦',
                songUrl: '../../../../musiccentor/songs/错过的烟火.flac',
                imageUrl: 'https://y.qq.com/music/photo_new/T002R300x300M0000042cH172YJ0mz_3.jpg?max_age=2592000'
            },
            {
                id: 6,
                title: '倒影-周杰伦',
                singer: '周杰伦',
                songUrl: '../../../../musiccentor/songs/倒影.flac',
                imageUrl: 'https://y.qq.com/music/photo_new/T002R300x300M0000042cH172YJ0mz_3.jpg?max_age=2592000'
            },
            {
                id: 7,
                title: '等你下课-周杰伦',
                singer: '周杰伦',
                songUrl: '../../../../musiccentor/songs/等你下课.flac',
                imageUrl: 'https://y.qq.com/music/photo_new/T002R300x300M0000042cH172YJ0mz_3.jpg?max_age=2592000'
            },
            {
                id: 8,
                title: '反方向的钟-周杰伦',
                singer: '周杰伦',
                songUrl: '../../../../musiccentor/songs/反方向的钟.flac',
                imageUrl: 'https://y.qq.com/music/photo_new/T002R300x300M0000042cH172YJ0mz_3.jpg?max_age=2592000'
            },
            {
                id: 9,
                title: '粉色海洋-周杰伦',
                singer: '周杰伦',
                songUrl: '../../../../musiccentor/songs/粉色海洋.flac',
                imageUrl: 'https://y.qq.com/music/photo_new/T002R300x300M0000042cH172YJ0mz_3.jpg?max_age=2592000'
            },
            {
                id: 10,
                title: '还在流浪-周杰伦',
                singer: '周杰伦',
                songUrl: '../../../../musiccentor/songs/还在流浪.flac',
                imageUrl: 'https://y.qq.com/music/photo_new/T002R300x300M0000042cH172YJ0mz_3.jpg?max_age=2592000'
            },
            {
                id: 11,
                title: '红颜如霜-周杰伦',
                singer: '周杰伦',
                songUrl: '../../../../musiccentor/songs/红颜如霜.flac',
                imageUrl: 'https://y.qq.com/music/photo_new/T002R300x300M0000042cH172YJ0mz_3.jpg?max_age=2592000'
            },
            {
                id: 12,
                title: '说好不哭-周杰伦·五月天',
                singer: '周杰伦·五月天',
                songUrl: '../../../../musiccentor/songs/说好不哭.flac',
                imageUrl: 'https://y.qq.com/music/photo_new/T002R300x300M0000042cH172YJ0mz_3.jpg?max_age=2592000'
            },
            {
                id: 13,
                title: '我是如此相信-周杰伦',
                singer: '周杰伦',
                songUrl: '../../../../musiccentor/songs/我是如此相信.flac',
                imageUrl: 'https://y.qq.com/music/photo_new/T002R300x300M0000042cH172YJ0mz_3.jpg?max_age=2592000'
            },
            {
                id: 14,
                title: '无名的人-毛不易',
                singer: '毛不易',
                songUrl: '../../../../musiccentor/songs/无名的人.mp3',
                imageUrl: 'https://y.qq.com/music/photo_new/T002R300x300M0000042cH172YJ0mz_3.jpg?max_age=2592000'
            },
            {
                id: 15,
                title: '平凡之路-朴树',
                singer: '朴树',
                songUrl: '../../../../musiccentor/songs/平凡之路.mp3',
                imageUrl: '../../../../musiccentor/images/songs/平凡之路.webp'
            }
        ]
    }
    //根据索引获取歌曲的方法
    getSongByNum(index) {
        return this.songs[index];
    }
}

//真正的构建播放器的类
class PlayerCreator {
    constructor() {
        this.audio = document.querySelector('.music-player__audio') // Audio dom元素, 因为很多api都是需要原生audio调用的，所以不用jq获取
        // this.audio.muted = true; // 控制静音
        this.audio.volume = 0.2;

        //工具
        this.util = new Util();
        this.musics = new Musics(); //歌曲信息
        this.song_index = 0; // 当前播放的歌曲索引
        this.loop_mode = 1; // 1 2
        // 下方歌曲列表容器
        this.song_list = $('.music__list_content');

        this.render_doms = { //切换歌曲时需要渲染的dom组
            title: $('.music__info--title'),
            singer: $('.music__info--singer'),
            image: $('.music-player__image img'),
            blur: $('.music-player__blur')
        }
        this.ban_dom = { //禁音时需要渲染的dom组
            control__btn: $('.control__volume--icon')
        }

        // 时间显示容器
        this.render_time = {
            now: $('.nowTime'),
            total: $('.totalTime')
        }

        // 唱片
        this.disc = {
            image: $('.music-player__image'),
            pointer: $('.music-player__pointer')
        };
        //播放器初始化
        this.init();
    }
    //初始化函数
    init() {
        this.renderSongList();
        this.renderSongStyle();
        this.bindEventListener();
    }
    //生成播放列表
    renderSongList() {
        let _str = '';
        this.musics.songs.forEach((song, i) => {
            _str += `<li class="music__list__item">${song.title}</li>`
        });
        this.song_list.html(_str);
    }

    //根据歌曲去渲染视图
    renderSongStyle() {
        let {
            title,
            singer,
            songUrl,
            imageUrl
        } = this.musics.getSongByNum(this.song_index);
        this.audio.src = songUrl;
        this.render_doms.title.html(title);
        this.render_doms.singer.html(singer);
        this.render_doms.image.prop('src', imageUrl);
        this.render_doms.blur.css('background-image', 'url("' + imageUrl + '")');

        //切换列表中的item的类名 play
        this.song_list.find('.music__list__item').eq(this.song_index).addClass('play').siblings().removeClass('play');
    }
    //绑定各种事件
    bindEventListener() {
        //播放按钮
        this.$play = new Btns('.player-control__btn--play', {
            click: this.handlePlayAndPause.bind(this)
        });
        //上一首
        this.$prev = new Btns('.player-control__btn--prev', {
            click: this.changeSong.bind(this, 'prev')
        });
        //下一首
        this.$next = new Btns('.player-control__btn--next', {
            click: this.changeSong.bind(this, 'next')
        });
        //循环模式
        this.$mode = new Btns('.player-control__btn--mode', {
            click: this.changePlayMode.bind(this)
        });
        //禁音
        this.$ban = new Btns('.control__volume--icon', {
            click: this.banNotes.bind(this)
        })
        //列表点击
        this.song_list.on('click', 'li', (e) => {
            let index = $(e.target).index();
            this.changeSong(index);
        })

        //音量控制 audio标签音量 vlouem 属性控制0-1

        new Progress('.control__volume--progress', {
            min: 0,
            max: 1,
            value: this.audio.volume,
            handler: (value) => { //更改进度时
                this.audio.volume = value;
            }
        })
        //歌曲进度 this.audio.duration
        //可以播放的时候触发（歌曲的基本信息都已经获取到了）
        this.audio.oncanplay = () => {
            //避免重复实例化
            if (this.progress) {
                this.progress.max = this.audio.duration; //切换歌曲后更新时长
                this.render_time.total.html(this.util.formatTime(this.audio.duration));
                return false;
            };
            this.progress = new Progress('.player__song--progress', {
                min: 0,
                max: this.audio.duration,
                value: 0,
                handler: (value) => {
                    this.audio.currentTime = value;
                }
            })
            //调整总时长
            this.render_time.total.html(this.util.formatTime(this.audio.duration));
        }

        //会在播放的时候持续触发
        this.audio.ontimeupdate = () => {
            this.progress.setValue(this.audio.currentTime);
            //调整当前时长
            this.render_time.now.html(this.util.formatTime(this.audio.currentTime));
        }

        //当歌曲播放完成的时候
        this.audio.onended = () => {
            this.changeSong('next');
            //播放完，换歌后，重新播放
            this.audio.play();
        }
    }

    //播放暂停控制
    handlePlayAndPause() {
        let _o_i = this.$play.$el.find('i');
        //this.audio.pauseed值为true 说明目前是不播放
        if (this.audio.paused) { //现在是暂停的 要播放
            this.audio.play();
            _o_i.removeClass('icon-play').addClass('icon-pause');
            this.disc.image.addClass('play');
            this.disc.pointer.addClass('play')
        } else {
            this.audio.pause();
            _o_i.addClass('icon-play').removeClass('icon-pause');
            this.disc.image.removeClass('play');
            this.disc.pointer.removeClass('play');
        }
    }

    //更改循环模式
    changePlayMode() {
        this.loop_mode++;
        if (this.loop_mode > 2) this.loop_mode = 0;
        this.renderPlayMode();
    }
    //更改按钮样式
    renderPlayMode() {
        let _classess = ['loop', 'random', 'single'];
        let _o_i = this.$mode.$el.find('i');
        //prop 改一些标签的自有属性 attr改一些标签的自定义属性
        _o_i.prop('class', 'iconfont icon-' + _classess[this.loop_mode])
    }
    //更改歌曲索引
    changeSongIndex(type) {
        if (typeof type === 'number') {
            this.song_index = type;
        } else {
            if (this.loop_mode === 0) {
                //列表循环
                this.song_index += type === 'next' ? 1 : -1;
                if (this.song_index > this.musics.songs.length - 1) this.song_index = 0;
                if (this.song_index < 0) this.song_index = this.musics.songs.length - 1;
            } else if (this.loop_mode === 1) {
                //随机播放
                let _length = this.musics.songs.length;
                let _random = Math.floor(Math.random() * _length);
                for (let i = 0; i < 10000; i++) { //随机的数为本身则继续随机
                    if (this.song_index == _random) {
                        _random = Math.floor(Math.random() * _length);
                    } else {
                        this.song_index = _random;
                        break;
                    }
                }
            } else if (this.loop_mode === 2) {
                this.song_index = this.song_index;
            }
        }
    }
    //歌曲时长
    songTime() {
        let totalMinute = parseInt(this.audio.duration / 60) < 10 ? "0" + parseInt(this.audio.duration / 60) : parseInt(this.audio.duration / 60);
        let totalSecond = parseInt(this.audio.duration % 60) < 10 ? "0" + parseInt(this.audio.duration % 60) : parseInt(this.audio.duration % 60);
        $('.totalTime').text(totalMinute + ':' + totalSecond);
    }
    //切换歌曲
    changeSong(type) {
        //更改索引
        this.changeSongIndex(type);
        //记录切歌前的状态
        let _is_pause = this.audio.paused;
        //切歌后更改视图显示
        this.renderSongStyle();
        //如果切歌前是在播放，就继续播放
        if (!_is_pause) this.audio.play();
    }
    //禁音
    banNotes() {
        let _o_i = this.$ban.$el.find("i");
        if (this.audio.muted == true) { //如果禁音则开启
            this.audio.muted = false;
            _o_i.removeClass('icon-muted').addClass('icon-volume');
        } else {
            this.audio.muted = true;
            _o_i.removeClass('icon-volume').addClass('icon-muted');
        }
    }
}

//进度条
class Progress {
    constructor(selector, options) {
        $.extend(this, options);
        ///给this挂载传入的参数
        this.$el = $(selector);
        this.width = this.$el.width();
        this.init();
    }

    //进度条初始化
    init() {
        this.renderBackAndPointer();
        this.bindEvents();
        this.drag();
        this.value;
        this.changeDOMStyle(this.width * this.value);
    }
    //为进度条渲染back和pointer
    renderBackAndPointer() {
        this.$back = $('<div class="back">');
        this.$pointer = $('<div class="pointer">');

        this.$el.append(this.$back);
        this.$el.append(this.$pointer);
    }

    setValue(value) { //主动调用，传入value值，设置进度条样式
        let _distance = this.width * value / (this.max - this.min);
        this.changeDOMStyle(_distance);
    }

    drag() {
        let ele = this.$pointer;
        let father = this.$el;
        let flag = false; //鼠标是否点击
        ele.mousedown((e) => {
            flag = true;
            let mousePos = {
                x: e.offsetX
            }
            $(document).mousemove((e) => {
                if (flag === true) {
                    let _left = e.clientX - father.offset().left - mousePos.x;
                    let _distance = Math.max(0, Math.min(_left, father.outerWidth(false) - ele.outerWidth(false)))
                    let _ratio = _distance / father.outerWidth(false);
                    let _value = _ratio * (this.max - this.min); //当前的音量值
                    this.changeDOMStyle(_distance);
                    this.handler(_value); //更改进度之后，执行回调
                }
            })
        })
        $(document).mouseup(() => {
            flag = false;
        })
    }

    bindEvents() { //鼠标点击时更改
        this.$el.click((e) => {
            let _x = e.offsetX; //鼠标距离元素左边的距离
            let _ratio = _x / this.width;
            let _value = _ratio * (this.max - this.min); //当前的音量值
            this.changeDOMStyle(_x);
            this.handler(_value); //更改进度之后，执行回调
        })
    }
    //更改pointer和back
    changeDOMStyle(distance) {
        this.$back.width(distance + 7 == 7 ? 0 : distance + 7);//进度为0时将进度条背景改为0否则加上进度按钮的长度
        this.$pointer.css('left', distance + 'px');
    }
}


//按钮类 
class Btns {
    constructor(selector, handlers) {
        this.$el = $(selector); //元素
        this.bindEvents(handlers);
    }
    bindEvents(handlers) { //绑定事件
        for (const event in handlers) {
            //使用值的时候保证键值对在对象中是存在的
            if (handlers.hasOwnProperty(event)) {
                this.$el.on(event, handlers[event]);
            }
        }
    }
}
new Player();
document.addEventListener('pjax:complete', (e) => {
    new Player();
})
```

- 新增 `themes/Acryple/source/js/utils.js` 逻辑文件。

```js
class Util {
    constructor() {
        if (Util.instance) return Util.instance;
        return this.getInstance(...arguments);
    }
    
    getInstance() {
        var instance = {
            /*
             *   formatTime 格式化时间（s）为 hour:minutes:seconds
             *   @params  time  required number (s)
             *   return hour:minutes:seconds string
             */
            formatTime(time) {
                //没有传time的时候
                if (time === undefined) {
                    this.handlerError(123, {
                        method: 'formate',
                        param: 'time'
                    });
                    return false;
                }
                let _time = Math.floor(time);
                let _minutes = Math.floor(_time / 60);
                let _hours = Math.floor(_minutes / 60);
                let _seconds = _time - (_minutes * 60);

                return (_hours ? this.fillZero(_hours) + ':' : '') + this.fillZero(_minutes - (_hours * 60)) + ':' + this.fillZero(_seconds);
            },
            /*
             *   fillZero 为小于10的数字补0
             *   @params  num  required number
             *   return '01'.. string
             */
            fillZero(num) {
                //当没有传time的时候
                if (num === undefined) {
                    this.handlerError(123, {
                        method: 'fillZero',
                        param: 'num'
                    });
                    return false;
                }
                //这个函数只是让我们在渲染/显示的时候有一个不同的效果，不要操作原数据
                return num > 9 ? num : '0' + num;
            },
            errors: {
                123: ({
                    method,
                    param
                }) => {
                    return method + 'function need a param ' + param;
                }
            },
            handlerError(code, options) { //处理报错
                console.error('[until error] message' + this.errors[code](options));
            }
        }
        Util.instance = instance;
        return instance;
    }
}

//为了这个工具以后在模块化环境中依然可以使用，需要判断一下，如果是在模块化环境，就将其暴露出去
//commonJs
if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = Util;
}

//AMD
if (typeof define === 'function' && define.amd) {
    define('util', [], function () {
        return Util;
    });
}
```

<!-- endtab -->

<!-- tab 音乐CSS样式表 -->

新增 `themes/Acryple/source/css/player.css` 样式表文件。

```shell
/* music页面透明：需要配置单页设置 page.pug */
.transparentpage{
    background:transparent!important;
    border: none !important;
}

/* 播放器大小 */
.music-player {
    width: 80%;
    height: 800px;
  }
  .music-player h3{
    margin: 0px 0 1px!important;
  }
  @font-face {font-family: "iconfont";
    src: url('iconfont.eot?t=1537976418058'); /* IE9*/
    src: url('iconfont.eot?t=1537976418058#iefix') format('embedded-opentype'), /* IE6-IE8 */
    url('data:application/x-font-woff;charset=utf-8;base64,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') format('woff'),
    url('iconfont.ttf?t=1537976418058') format('truetype'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/
    url('iconfont.svg?t=1537976418058#iconfont') format('svg'); /* iOS 4.1- */
  }
  
  .icon-prev:before { content: "\f0069"; }
  
  .icon-next:before { content: "\f006a"; }
  
  .icon-play:before { content: "\e66a"; }
  
  .icon-pause:before { content: "\e76a"; }
  
  .icon-random:before { content: "\e622"; }
  
  .icon-muted:before { content: "\e61e"; }
  
  .icon-volume:before { content: "\e87a"; }
  
  .icon-loop:before { content: "\e66c"; }
  
  .icon-single:before { content: "\e66d"; }
  
  
  /* 播放器位置 */
  .music-player {
    position: relative;
    margin: 0px auto;
  }
  
  /* 歌曲列表 */
  
  .music-player__list {
    width: 100%;
    padding: 10px;
    margin-top: 30px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 5px;
    -webkit-box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
  }
  
  .music__list__item {
    padding-left: 25px;
    color: #ccc;
    position: relative;
    margin-bottom: 10px;
    font-size: 14px;
    cursor: pointer;
  }
  
  .music__list__item:last-of-type {
    margin: 0;
  }
  
  .music__list__item.play {
    color: #fff;
  }
  
  .music__list__item.play:before {
    font-family: 'iconfont';
    content: "\e87a";
    position: absolute;
    left: 0px;
    top: 4px;
  }
  /* 播放器主体 */
  .music-player__main {
    height: 180px;
    padding: 25px;
    box-shadow: 0 0 10px rgb(0 0 0 / 20%);
    border-radius: 10px;
    position: relative;
    overflow: hidden;
  }
  
  /* 播放器主体模糊背景 */
  .music-player__blur {
    width: 100%;
    height: 100%;
    position: absolute;
    background-size: 100%;
    left: 0;
    top: 0;
    z-index: -1;
    -webkit-filter: blur(20px);
    filter: blur(20px);
  }
  /* 播放器唱片效果 */
  .music-player__disc {
    float: left;
    width: 130px;
    height: 130px;
    background: url(../../../../musiccentor/images/cd.png) no-repeat center;
    background-size: 100%;
    position: relative;
  }
  
  /* 唱片指针 */
  .music-player__pointer {
    width: 25px;
    position: absolute;
    right: -10px;
    top: 0;
    -webkit-transform-origin: right top;
    -ms-transform-origin: right top;
    transform-origin: right top;
    -webkit-transform: rotate(-15deg);
    -ms-transform: rotate(-15deg);
    transform: rotate(-15deg);
    -webkit-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;
  }
  
  /* 唱片指针播放状态 加play类名 */
  .music-player__pointer.play {
    -webkit-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  
  /* 唱片歌曲图片 */
  .music-player__image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    position: absolute;
    overflow: hidden;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
  }
  /* 播放器控件 */
  .music-player__controls {
    width: 330px;
    height: 130px;
    float: right;
  }
  
  /* 歌曲信息 */
  .music__info {
    width: 100%;
    height: 50px;
    margin-bottom: 15px;
  }
  
  .music__info .music__info--title {
    color: #fff;
  }
  
  .music__info .music__info--title {
    font-size: 16px;
  }
  /* 控件 */
  
  .player-control {
    width: 100%;
  }
  
  .player-control__content {
    overflow: hidden;
  }
  
  /* 播放暂停按钮 */
  .player-control__btns {
    float: left;
    overflow: hidden;
  }
  
  .player-control__btn {
    float: left;
    margin: 0 5px;
    font-weight: bolder;
    color: #fff;
    cursor: pointer;
  }
  
  .player-control__volume {
    float: right;
    overflow: hidden;
  }
  
  .control__volume--progress {
    float: left;
    width: 100px;
    position: relative;
    top: 8px;
  }
  
  .player__song--timeProgess{
    font-size: 12px;
    color: #fff;
    padding: 0px 3px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 5px;
  }
  
  .player-control__content .nowTime{
    float: left;
  }
  .player-control__content .totalTime{
    float: right;
  }
  
  .music-player .progress {
    background: rgba(0, 0, 0, 0.3);
    height: 5px;
    -webkit-box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) inset;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) inset;
    overflow: hidden;
    margin: 0.5rem 0!important;
    border-radius: 2px;
    position: relative;
    cursor: pointer;
  }
  
  .music-player .progress .back {
    width: 0px;
    height: 100%;
    border-radius: 2px;
    background: rgb(12, 182, 212);
  }
  
  .music-player .progress .pointer {
    width: 7px;
    height: 7px;
    background: #fff;
    border-radius: 50%;
    opacity: 0;
    -webkit-transition: opacity 0.3s;
    -o-transition: opacity 0.3s;
    transition: opacity 0.3s;
    position: absolute;
    top: -1px;
    left: 0;
  }
  
  .music-player .progress:hover .pointer {
    opacity: 1;
  }
  
  
  /* 播放 画片 动画 */
  
  @-webkit-keyframes disc {
    from {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
  
    to {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
    }
  }
  
  @keyframes disc {
    from {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    to {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
    }
  }
  .music-player__image.play {
    -webkit-animation: disc 5s linear 0s infinite;
    animation: disc 5s linear 0s infinite;
  }
  /*  播放进度  */
  .player__song--progress {
    width: 100%;
    margin-top: 15px;
  }
  .music-player h1, .music-player h2, .music-player h3,.music-player h4, .music-player h5, .music-player h6, .music-player p {
    margin: 0; padding: 0;
  }
  .music-player li { list-style: none; }
```

<!-- endtab -->

<!-- tab 引入css样式表 -->

由于 `player.js` 和 `utils.js` 都是直接在页面上进行引用，而 `player.css` 则需要在主题配置文件 `_config.acryple.yml` 文件中进行引用：

```yml
- <link rel="stylesheet" href="/css/player.css">   # 音乐界面的样式设置
```

<!-- endtab -->

<!-- tab bug说明 -->

> 本地浏览可能音乐的进度条无法拖动或者一拖动音乐就回到最开头，bug 问题不大，推送上去就正常了。

<!-- endtab -->

<!-- tab hexo三连 -->

```shell
hexo clean 
hexo g 
hexo s
```

<!-- endtab -->

{% endtabs  %}

## 博客统计

{% note info modern %}
版权声明：
{% endnote %}
{% tabs muself-catelist %}

<!-- tab hexo三连 -->

```shell
hexo clean 
hexo g 
hexo s
```

<!-- endtab -->

{% endtabs  %}

## 文章统计

{% note info modern %}
版权声明：博客统计是对博客的文章发布时间、文章分类、文章标签的维度绘制统计图，使用的是 [ECharts](https://echarts.apache.org/examples/zh/index.html) 开源可视化绘图库，美化方案来源于 <a href="https://blog.eurkon.com/post/1213ef82.html">Eurkon</a> 。
{% endnote %}
{% tabs muself-catelist %}

<!-- tab 文章统计页面 -->

在 `/source` 目录下创建 charts 文件夹，并在新建的 `charts` 文件夹下新建 `index.md` 文件，添加内容：

```md
---
title: 文章统计
date: 2022-10-01 00:00:00
---

<!-- 文章发布时间统计图，data-start="2021-01" 属性表示文章发布时间统计图仅显示 2021-01 及以后的文章数据。 -->
<div id="posts-chart" data-start="2020-01" style="border-radius: 8px; height: 300px; padding: 10px;"></div>
<!-- 文章标签统计图 ，data-length="10" 属性表示仅显示排名前 10 的标签。-->
<div id="tags-chart" data-length="15" style="border-radius: 8px; height: 300px; padding: 10px;"></div>
<!-- 文章分类统计图 ， data-parent="true" 属性表示 有子分类 时以旭日图显示分类，其他 无子分类 或 设置为false 或 不设置该属性 或 设置为其他非true属性 情况都以饼状图显示分类。-->
<div id="categories-chart" data-parent="true" style="border-radius: 8px; height: 300px; padding: 10px;"></div>
<script src="https://npm.elemecdn.com/echarts@4.9.0/dist/echarts.min.js"></script>
```

<!-- endtab -->

<!-- tab 文章统计 -->

在  `/themes/Acryple/scripts/helpers/` 目录下创建 `charts.js` 文件：

```js
const cheerio = require('cheerio')
const moment = require('moment')

hexo.extend.filter.register('after_render:html', function (locals) {
  const $ = cheerio.load(locals)
  const post = $('#posts-chart')
  const tag = $('#tags-chart')
  const category = $('#categories-chart')
  const htmlEncode = false

  if (post.length > 0 || tag.length > 0 || category.length > 0) {
    if (post.length > 0 && $('#postsChart').length === 0) {
      if (post.attr('data-encode') === 'true') htmlEncode = true
      post.after(postsChart(post.attr('data-start')))
    }
    if (tag.length > 0 && $('#tagsChart').length === 0) {
      if (tag.attr('data-encode') === 'true') htmlEncode = true
      tag.after(tagsChart(tag.attr('data-length')))
    }
    if (category.length > 0 && $('#categoriesChart').length === 0) {
      if (category.attr('data-encode') === 'true') htmlEncode = true
      category.after(categoriesChart(category.attr('data-parent')))
    }

    if (htmlEncode) {
      return $.root().html().replace(/&amp;#/g, '&#')
    } else {
      return $.root().html()
    }
  } else {
    return locals
  }
}, 15)

function postsChart (startMonth) {
  const startDate = moment(startMonth || '2020-01')
  const endDate = moment()

  const monthMap = new Map()
  const dayTime = 3600 * 24 * 1000
  for (let time = startDate; time <= endDate; time += dayTime) {
    const month = moment(time).format('YYYY-MM')
    if (!monthMap.has(month)) {
      monthMap.set(month, 0)
    }
  }
  hexo.locals.get('posts').forEach(function (post) {
    const month = post.date.format('YYYY-MM')
    if (monthMap.has(month)) {
      monthMap.set(month, monthMap.get(month) + 1)
    }
  })
  const monthArr = JSON.stringify([...monthMap.keys()])
  const monthValueArr = JSON.stringify([...monthMap.values()])

  return `
  <script id="postsChart">
    var color = document.documentElement.getAttribute('data-theme') === 'light' ? '#4c4948' : 'rgba(255,255,255,0.7)'
    var postsChart = echarts.init(document.getElementById('posts-chart'), 'light');
    var postsOption = {
      title: {
        text: '文章发布统计图',
        x: 'center',
        textStyle: {
          color: color
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        name: '日期',
        type: 'category',
        boundaryGap: false,
        nameTextStyle: {
          color: color
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true,
          color: color
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: color
          }
        },
        data: ${monthArr}
      },
      yAxis: {
        name: '文章篇数',
        type: 'value',
        nameTextStyle: {
          color: color
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true,
          color: color
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: color
          }
        }
      },
      series: [{
        name: '文章篇数',
        type: 'line',
        smooth: true,
        lineStyle: {
            width: 0
        },
        showSymbol: false,
        itemStyle: {
          opacity: 1,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(128, 255, 165)'
          },
          {
            offset: 1,
            color: 'rgba(1, 191, 236)'
          }])
        },
        areaStyle: {
          opacity: 1,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(128, 255, 165)'
          }, {
            offset: 1,
            color: 'rgba(1, 191, 236)'
          }])
        },
        data: ${monthValueArr},
        markLine: {
          data: [{
            name: '平均值',
            type: 'average',
            label: {
              color: color
            }
          }]
        }
      }]
    };
    postsChart.setOption(postsOption);
    window.addEventListener('resize', () => { 
      postsChart.resize();
    });
    postsChart.on('click', 'series', (event) => {
      if (event.componentType === 'series') window.location.href = '/archives/' + event.name.replace('-', '/');
    });
  </script>`
}

function tagsChart (len) {
  const tagArr = []
  hexo.locals.get('tags').map(function (tag) {
    tagArr.push({ name: tag.name, value: tag.length, path: tag.path })
  })
  tagArr.sort((a, b) => { return b.value - a.value })

  const dataLength = Math.min(tagArr.length, len) || tagArr.length
  const tagNameArr = []
  for (let i = 0; i < dataLength; i++) {
    tagNameArr.push(tagArr[i].name)
  }
  const tagNameArrJson = JSON.stringify(tagNameArr)
  const tagArrJson = JSON.stringify(tagArr)

  return `
  <script id="tagsChart">
    var color = document.documentElement.getAttribute('data-theme') === 'light' ? '#4c4948' : 'rgba(255,255,255,0.7)'
    var tagsChart = echarts.init(document.getElementById('tags-chart'), 'light');
    var tagsOption = {
      title: {
        text: 'Top ${dataLength} 标签统计图',
        x: 'center',
        textStyle: {
          color: color
        }
      },
      tooltip: {},
      xAxis: {
        name: '标签',
        type: 'category',
        nameTextStyle: {
          color: color
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true,
          color: color,
          interval: 0
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: color
          }
        },
        data: ${tagNameArrJson}
      },
      yAxis: {
        name: '文章篇数',
        type: 'value',
        splitLine: {
          show: false
        },
        nameTextStyle: {
          color: color
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true,
          color: color
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: color
          }
        }
      },
      series: [{
        name: '文章篇数',
        type: 'bar',
        data: ${tagArrJson},
        itemStyle: {
          borderRadius: [5, 5, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(128, 255, 165)'
          },
          {
            offset: 1,
            color: 'rgba(1, 191, 236)'
          }])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(128, 255, 195)'
            },
            {
              offset: 1,
              color: 'rgba(1, 211, 255)'
            }])
          }
        },
        markLine: {
          data: [{
            name: '平均值',
            type: 'average',
            label: {
              color: color
            }
          }]
        }
      }]
    };
    tagsChart.setOption(tagsOption);
    window.addEventListener('resize', () => { 
      tagsChart.resize();
    });
    tagsChart.on('click', 'series', (event) => {
      if(event.data.path) window.location.href = '/' + event.data.path;
    });
  </script>`
}

function categoriesChart (dataParent) {
  const categoryArr = []
  let categoryParentFlag = false
  hexo.locals.get('categories').map(function (category) {
    if (category.parent) categoryParentFlag = true
    categoryArr.push({
      name: category.name,
      value: category.length,
      path: category.path,
      id: category._id,
      parentId: category.parent || '0'
    })
  })
  categoryParentFlag = categoryParentFlag && dataParent === 'true'
  categoryArr.sort((a, b) => { return b.value - a.value })
  function translateListToTree (data, parent) {
    let tree = []
    let temp
    data.forEach((item, index) => {
      if (data[index].parentId == parent) {
        let obj = data[index];
        temp = translateListToTree(data, data[index].id);
        if (temp.length > 0) {
          obj.children = temp
        }
        if (tree.indexOf())
          tree.push(obj)
      }
    })
    return tree
  }
  const categoryNameJson = JSON.stringify(categoryArr.map(function (category) { return category.name }))
  const categoryArrJson = JSON.stringify(categoryArr)
  const categoryArrParentJson = JSON.stringify(translateListToTree(categoryArr, '0'))

  return `
  <script id="categoriesChart">
    var color = document.documentElement.getAttribute('data-theme') === 'light' ? '#4c4948' : 'rgba(255,255,255,0.7)'
    var categoriesChart = echarts.init(document.getElementById('categories-chart'), 'light');
    var categoryParentFlag = ${categoryParentFlag}
    var categoriesOption = {
      title: {
        text: '文章分类统计图',
        x: 'center',
        textStyle: {
          color: color
        }
      },
      legend: {
        top: 'bottom',
        data: ${categoryNameJson},
        textStyle: {
          color: color
        }
      },
      tooltip: {
        trigger: 'item'
      },
      series: []
    };
    categoriesOption.series.push(
      categoryParentFlag ? 
      {
        nodeClick :false,
        name: '文章篇数',
        type: 'sunburst',
        radius: ['15%', '90%'],
        center: ['50%', '55%'],
        sort: 'desc',
        data: ${categoryArrParentJson},
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          emphasis: {
            focus: 'ancestor',
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(255, 255, 255, 0.5)'
          }
        }
      }
      :
      {
        name: '文章篇数',
        type: 'pie',
        radius: [30, 80],
        roseType: 'area',
        label: {
          color: color,
          formatter: '{b} : {c} ({d}%)'
        },
        data: ${categoryArrJson},
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(255, 255, 255, 0.5)'
          }
        }
      }
    )
    categoriesChart.setOption(categoriesOption);
    window.addEventListener('resize', () => { 
      categoriesChart.resize();
    });
    categoriesChart.on('click', 'series', (event) => {
      if(event.data.path) window.location.href = '/' + event.data.path;
    });
  </script>`
}
```

更多统计图的自定义属性可以查看 [ECharts 配置项文档](https://echarts.apache.org/zh/option.html)，根据自行喜好对 ECharts 统计图进行修改。

<!-- endtab -->

<!-- tab 昼夜模式适配 -->

- 前面 JS 文件中已经进行了昼夜模式的适配颜色确定：

```diff
- var color = '#000'
+ var color = document.documentElement.getAttribute('data-theme') === 'light' ? '#4c4948' : 'rgba(255,255,255,0.7)'
```

- 此时就需要在 `/themes/Acryple/source/js` 下自定义 `post_charts.js` 逻辑实现不同模式下颜色渲染的效果：

```js
function switchPostChart () {
  // 这里为了统一颜色选取的是“明暗模式”下的两种字体颜色，也可以自己定义
  let color = document.documentElement.getAttribute('data-theme') === 'light' ? '#4C4948' : 'rgba(255,255,255,0.7)'
  if (document.getElementById('posts-chart') && postsOption) {
    try {
      let postsOptionNew = postsOption
      postsOptionNew.title.textStyle.color = color
      postsOptionNew.xAxis.nameTextStyle.color = color
      postsOptionNew.yAxis.nameTextStyle.color = color
      postsOptionNew.xAxis.axisLabel.color = color
      postsOptionNew.yAxis.axisLabel.color = color
      postsOptionNew.xAxis.axisLine.lineStyle.color = color
      postsOptionNew.yAxis.axisLine.lineStyle.color = color
      postsOptionNew.series[0].markLine.data[0].label.color = color
      postsChart.setOption(postsOptionNew)
    } catch (error) {
      console.log(error)
    }
  }
  if (document.getElementById('tags-chart') && tagsOption) {
    try {
      let tagsOptionNew = tagsOption
      tagsOptionNew.title.textStyle.color = color
      tagsOptionNew.xAxis.nameTextStyle.color = color
      tagsOptionNew.yAxis.nameTextStyle.color = color
      tagsOptionNew.xAxis.axisLabel.color = color
      tagsOptionNew.yAxis.axisLabel.color = color
      tagsOptionNew.xAxis.axisLine.lineStyle.color = color
      tagsOptionNew.yAxis.axisLine.lineStyle.color = color
      tagsOptionNew.series[0].markLine.data[0].label.color = color
      tagsChart.setOption(tagsOptionNew)
    } catch (error) {
      console.log(error)
    }
  }
  if (document.getElementById('categories-chart') && categoriesOption) {
    try {
      let categoriesOptionNew = categoriesOption
      categoriesOptionNew.title.textStyle.color = color
      categoriesOptionNew.legend.textStyle.color = color
      if (!categoryParentFlag) { categoriesOptionNew.series[0].label.color = color }
      categoriesChart.setOption(categoriesOptionNew)
    } catch (error) {
      console.log(error)
    }
  }
}
document.getElementById("mode-button").addEventListener("click", function () { setTimeout(switchPostChart, 100) })
```

- 在主题配置文件 `_config.Acryple.yml` 引入该 JS 文件： 

```yml
- <script src="/js/post_charts.js"></script>
```

<!-- endtab -->

<!-- tab hexo三连 -->

```shell
hexo clean 
hexo g 
hexo s
```

<!-- endtab -->

{% endtabs  %}

## 全局设置


{% tabs muself-catelist %}

<!-- tab 站点动态title设置 -->

{% note info modern %}
版权声明：站点动态 title 是通过 JS 监测是否聚焦于当前页面，从而替换标签显示内容，方案来源于 <a href="https://akilar.top/posts/ebf20e02/">店长Akilar</a> 。
{% endnote %}

- 在 `/themes/Acryple/source/js` 目录下新建 `diytitle.js` 文件进行监听：

```js
//站点动态标题监听设置
var OriginTitile = document.title;
var titleTime;
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        //离开当前页面时标签显示内容
        document.title = 'w(ﾟДﾟ)w 不要走！再看看嘛！';
        clearTimeout(titleTime);
    }
    else {
        //返回当前页面时标签显示内容
        document.title = '♪(^∇^*)欢迎肥来！' + OriginTitile;
        //两秒后变回正常标题
        titleTime = setTimeout(function () {
            document.title = OriginTitile;
        }, 2000);
    }
});
```

在主题配置文件 `_config.Acryple.yml` 中异步的引入加载该体量极小的 JS 逻辑文件：

```yml
- <script async src="/js/diytitle.js"></script>
```

<!-- endtab -->

<!-- tab 站点公祭日变灰设置 -->

{% note info modern %}
版权声明：站点动态 title 是通过 JS 监测是否聚焦于当前页面，从而替换标签显示内容，方案来源于 <a href="https://akilar.top/posts/ebf20e02/">店长Akilar</a> 。
{% endnote %}

为了统一管理，直接在 `diytitle` 逻辑文件中添加监听即可：

```js
//站点公祭日变灰监听设置
if(PublicSacrificeDay()){
    document.getElementsByTagName("html")[0].setAttribute("style","filter:gray !important;filter:grayscale(100%);-webkit-filter:grayscale(100%);-moz-filter:grayscale(100%);-ms-filter:grayscale(100%);-o-filter:grayscale(100%);");
}

function PublicSacrificeDay(){
    var PSFarr=new Array("0403","0404","0405","0406","0414","0512","0707","0807","0814","0909","0918","0930","1025","1213");
    //2020年4月4日 新冠肺炎哀悼日，清明节
    //2010年4月14日，青海玉树地震
    //2008年5月12日，四川汶川地震
    //1937年7月7日,七七事变 又称卢沟桥事变
    //2010年8月7日，甘肃舟曲特大泥石流
    //8月14日，世界慰安妇纪念日
    //1976年9月9日，毛主席逝世
    //1931年9月18日，九一八事变
    //烈士纪念日为每年9月30日
    //1950年10月25日，抗美援朝纪念日
    //1937年12月13日，南京大屠杀
    var currentdate = new Date();
    var str = "";
    var mm = currentdate.getMonth()+1;
    if(currentdate.getMonth()>9){
        str += mm;
    }else{
        str += "0" + mm;
    }
    if(currentdate.getDate()>9){
        str += currentdate.getDate();
    }else{
        str += "0" + currentdate.getDate();
    }
    if(PSFarr.indexOf(str)>-1){
        return 1;
    }else{
        return 0;
    }
}
```

> 如果是单独编写 JS 逻辑文件，那么就需要在主题配置文件 `_config.Acryple.yml` 中异步引入该文件。

<!-- endtab -->

<!-- tab 站点鼠标指针样式 -->

{% note info modern %}
版权声明：站点动态 title 是通过 JS 监测是否聚焦于当前页面，从而替换标签显示内容，方案来源于 <a href="https://akilar.top/posts/ebf20e02/">店长Akilar</a>，鼠标样式文件推荐下载下来本地导入 。
{% endnote %}

在 `Acryple` 主题的集中样式配置文件(其他主体则使用单独文件进行引入) `style.css` 中引入鼠标设置样式：

```js
/* 鼠标样式设置 */
/* 全局默认鼠标指针 */
/* 全局默认鼠标指针 */
body,
html{
  cursor: url('../cur/arrow.cur'),auto !important;
}
/* 悬停图片时的鼠标指针 */
img{
  cursor: url('../cur/btn.cur'),auto !important;
}
/* 选择链接标签时的鼠标指针 */
a:hover{
    cursor: url('../cur/link.cur'),auto;
}
/* 选中输入框时的鼠标指针 */
input:hover{
    cursor: url('../cur/input.cur'),auto;
}
/* 悬停按钮时的鼠标指针 */
button:hover{
    cursor: url('../cur/btn.cur'),auto;
}
/* 悬停列表标签时的鼠标指针 */
i:hover{
    cursor: url('../cur/link.cur'),auto;
}
/* 悬停页脚链接标签（例如页脚徽标）时的鼠标指针 */
#footer-wrap a:hover{
      cursor: url('../cur/hf.cur'),auto;
}
/* 悬停页码时的鼠标指针 */
#pagination .page-number:hover{
      cursor: url('../cur/i.cur'),auto;
}
/* 悬停菜单栏时的鼠标指针 */
#nav .site-page:hover{
      cursor: url('../cur/hf.cur'),auto;
}
```

<!-- endtab -->

<!-- tab 悬浮菜单直达底部 -->

{% note info modern %}
版权声明：悬浮菜单的修改，部分优化来源于 <a href="https://blog.leonus.cn/2022/rightside.html">Leonus</a> （本人觉得阅读模式和在线聊天没一点屁用，此处也不会加） 。
{% endnote %}

修改 `themes/Acryple/layout/includes/rightside.pug` 文件：

```diff
  button#go-up(type="button" title=_p("rightside.back_to_top"))
    i.fas.fa-arrow-up
+  button#go-down(type="button" title="直达底部" onclick="btf.scrollToDest(document.body.scrollHeight, 500)")
+    i.fas.fa-arrow-down
```

<!-- endtab -->

<!-- tab 悬浮菜单阅读进度 -->

{% note info modern %}
参考版权：悬浮菜单修改原本的直达顶部为阅读进度显示，当前主题直达顶部可以直接采用导航栏的文章标题即可，此部分优化来源于 <a href="https://blog.leonus.cn/2022/rightside.html">Leonus</a> ，用于显示当前 `文章页面`(并非文章正文部分) 的阅读进度 。
{% endnote %}

修改 `themes/Acryple/layout/includes/rightside.pug` 文件：

```diff
button#go-up(type="button" title=_p("rightside.back_to_top"))
  i.fas.fa-arrow-up
+ span#percent 0
+   span %
```

添加 `themes/Acryple/source/js/readPercent.js` 文件，同时此文件还优化一下其他按钮的显隐。

> 本站主题设置几乎不用，所以此部分实际和主题设置中的侧边栏显隐有轻微冲突，如果崇尚主题配置显隐设置则需要取消此 JS 中的部分控制显隐。

```js
window.onscroll = percent;// 执行函数
document.querySelector("#rightside").style.display = 'none';	//注：(可选)
// 页面百分比
function percent() {
    let a = document.documentElement.scrollTop || window.pageYOffset, // 卷去高度
        b = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight) - document.documentElement.clientHeight, // 整个网页高度
        result = Math.round(a / b * 100), // 计算百分比
        up = document.querySelector("#go-up") // 获取按钮
    if (result == 0) {
        document.querySelector("#rightside").style.display = 'none';	//注：(可选)
    } else {
        document.querySelector("#rightside").style.display = 'block';
        if (result <= 95) {
            up.childNodes[0].style.display = 'none';
            up.childNodes[1].style.display = 'block';
            document.querySelector("#go-down").style.display = 'block';		//注：直达顶部显示(可选)
            document.querySelector("#to_comment").style.display = 'block';   //注：侧边栏评论区显示(可选)(可选)
            up.childNodes[1].innerHTML = result;
        } else {
            up.childNodes[1].style.display = 'none';
            up.childNodes[0].style.display = 'block';
            document.querySelector("#go-down").style.display = 'none';		//直达顶部显示(可选)
            document.querySelector("#to_comment").style.display = 'none';   //侧边栏评论区隐藏(可选)
        }
    }
}
```

使用 `Acryple` 主题的直接在 `style.css` 文件中，其他主题新建 `readPercent.css` 文件，根据需要添加以下样式：

```css
/* 返回顶部 */
button#go-up #percent {
    display: none;
    font-weight: bold;
    font-size: 15px !important;
}

button#go-up span {
    font-size: 12px!important;
    margin-right: -1px;
}

/* 鼠标滑动到按钮上时显示返回顶部图标 */
button#go-up:hover i {
    display: block !important;
}

button#go-up:hover #percent {
    display: none !important;
}
```

在主题配置文件 `_config.Acryple.yml` 中引入定义好的 `readPercent.js` 文件(如果单独定义 `readPercent.css` 也需要引入)：

```yml
- <script async type="text/javascript" src="/js/readPercent.js"></script>   # 悬浮菜单进度条显示
```

<!-- endtab -->

<!-- tab 敲敲木鱼页面 -->

{% note info modern %}
版权声明：网页版的简单电子木鱼实现方案来源于 <a href="https://www.chuckle.top/article/904a2780.html">轻笑Chuckle</a> 。
{% endnote %}

新建 `/source/muyu/index.md` 页面，添加以下 html 页面文件：

```html
---
title: 敲敲木鱼收集功德啦
date: 2022-11-14 15:08:46
type: "muyu"
---

{% raw %}
<div class="muyu-layout">
        <div id="jishu-box">
             <p id="jishu">功德：0</p>
        </div>
        <div id="muyu-box">
            <p id="gongde">功德+100</p>
            <img id="muyu" class="no-lightbox entered loaded"
                src="data:image/png;base64,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">
        </div>
    </div>
<style>
    .muyu-layout {
        background: black;
        display: flex;
        width: 100%;
        border-radius: 20px;
        position: relative;
        justify-content: center;
        height: 90vh;
        align-items: center;
    }
    #muyu-box img {
        width: 250px;
    }
     #jishu-box{
        top: 55px;
        position: absolute;
     }
    #muyu-box p {
        color: white;
        opacity: 0;
        font-size: 25px;
    }
    #jishu-box p {
        color: white;
        font-size: 30px;
    }
</style>
    <script>
        var gongde = document.getElementById("gongde");
        var muyu = document.getElementById("muyu");
        var jishu = document.getElementById("jishu-box");
        var mp3Url = "./muyu.mp3";
        var player = new Audio(mp3Url);
        var num = 0;
        muyu.addEventListener("click", function () {
            num+=100;
            player.load();
            player.play();
            muyu.animate([{ transform: 'scale(0.85)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }], 500);
            gongde.animate([{ opacity: 0, transform: 'translateY(0)' },{ opacity: 0.3, transform: 'translateY(-10px)' },{ opacity: 0.8, transform: 'translateY(-20px)' }, { opacity: 1, transform: 'translateY(-30px)' }, { opacity: 0.8, transform: 'translateY(-35px)' }, { opacity: 0, transform: 'translateY(-40px)' }], 600);
            jishu.innerHTML = "<p id='jishu'>功德："+num+"</p>";
        });
    </script>
{% endraw %}
```

<!-- endtab -->

<!-- tab 网址外挂标签 -->

{% note info modern %}
版权声明：个性化的超链接网址卡片，美化方案来源于 <a href="https://blog.zhheo.com/p/ccaf9148.html">Heo大佬</a> 。

{% endnote %}

- 效果演示：

{% link Hexo 的 Butterfly 主题魔改大佬,Heo,https://blog.zhheo.com/ %}

- 创建 `/themes/Acryple/scripts/tag/link.js` 外挂文件：

```js
function link(args) {
    args = args.join(' ').split(',');
    let title = args[0];
    let sitename = args[1];
    let link = args[2];

    // 获取网页favicon
    let urlNoProtocol = link.replace(/^https?\:\/\//i, "");
    let imgUrl = "https://api.iowen.cn/favicon/" + urlNoProtocol + ".png";

    return `<a class="tag-Link" target="_blank" href="${link}">
    <div class="tag-link-tips">引用站外地址，不保证站点的可用性和安全性</div>
    <div class="tag-link-bottom">
        <div class="tag-link-left" style="background-image: url(${imgUrl});"></div>
        <div class="tag-link-right">
            <div class="tag-link-title">${title}</div>
            <div class="tag-link-sitename">${sitename}</div>
        </div>
        <i class="fa-solid fa-angle-right"></i>
    </div>
    </a>`
}

hexo.extend.tag.register('link',link, { ends: false })
```

- 在主题配置文件 `_config.Acryple.yml` 中引入加载 CSS 样式文件，推荐下载下来本地引入：

```yml
- <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/zhheo/JS-Heo@master/mainColor/heoMainColor.css">
- <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/zhheo/JS-Heo@main/tag-link/tag-link.css">
```

<!-- endtab -->

<!-- tab 打赏个性化 -->

{% note info modern %}
版权声明：打赏同时配置音效仿照 <a href="https://anzhiy.cn/posts/e62b.html">安知鱼</a> 进行美化，个人觉得确实挺好，嘿嘿。
{% endnote %}

- 修改 `/themes/Acryple/languages/zh-CN.yml` 文件，改变打赏显示文字。

```yml
- donate: 打赏
+ donate: 好想要糖糖呀
```

- 替换 `/themes/butterfly/layout/includes/post/reward.pug` 文件内容为：

```diff
link(rel='stylesheet' href=url_for(theme.CDN.option.coin_css) media="defer" onload="this.media='all'")
.post-reward
  button.tip-button.reward-button
    span.tip-button__text= _p('donate')
    .coin-wrapper
      .coin
        .coin__middle
        .coin__back
        .coin__front
    .reward-main
      ul.reward-all
        each item in theme.reward.QR_code
          - var clickTo = (item.itemlist||item).link ? (item.itemlist||item).link : (item.itemlist||item).img
          li.reward-item
            a(href=clickTo target='_blank')
              img.post-qr-code-img(src=url_for((item.itemlist||item).img) alt=(item.itemlist||item).text)
            .post-qr-code-desc=(item.itemlist||item).text
if theme.reward.coinAudio
  - var coinAudio = theme.reward.coinAudio ? url_for(theme.reward.coinAudio) : 'https://cdn.cbd.int/akilar-candyassets@1.0.36/audio/coin.mp3'
  audio#coinAudio(src=coinAudio)
script(defer src=url_for(theme.CDN.option.coin_js))
```

- 新建样式表 `/themes/butterfly/source/css/coin.css` 文件：

```css
.tip-button {
  border: 0;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 20px;
  font-weight: 600;
  height: 2.6rem;
  margin-bottom: -4rem;
  outline: 0;
  position: relative;
  top: 0;
  transform-origin: 0% 100%;
  transition: transform 50ms ease-in-out;
  width: auto;
  -webkit-tap-highlight-color: transparent;
}
.tip-button:active {
  transform: rotate(4deg);
}
.tip-button.clicked {
  animation: 150ms ease-in-out 1 shake;
  pointer-events: none;
}
.tip-button.clicked .tip-button__text {
  opacity: 0;
  transition: opacity 100ms linear 200ms;
}
.tip-button.clicked::before {
  height: 0.5rem;
  width: 60%;
  background: $button-hover-color;
}
.tip-button.clicked .coin {
  transition: margin-bottom 1s linear 200ms;
  margin-bottom: 0;
}
.tip-button.shrink-landing::before {
  transition: width 200ms ease-in;
  width: 0;
}
.tip-button.coin-landed::after {
  opacity: 1;
  transform: scale(1);
  transform-origin: 50% 100%;
}
.tip-button.coin-landed .coin-wrapper {
  background: radial-gradient(circle at 35% 97%, rgba(3, 16, 50, 0.4) 0.04rem, transparent 0.04rem), radial-gradient(
      circle at 45% 92%,
      rgba(3, 16, 50, 0.4) 0.04rem,
      transparent 0.02rem
    ), radial-gradient(circle at 55% 98%, rgba(3, 16, 50, 0.4) 0.04rem, transparent 0.04rem), radial-gradient(circle at
        65% 96%, rgba(3, 16, 50, 0.4) 0.06rem, transparent 0.06rem);
  background-position: center bottom;
  background-size: 100%;
  bottom: -1rem;
  opacity: 0;
  transform: scale(2) translateY(-10px);
}
.tip-button__text {
  color: #fff;
  margin-right: 1.8rem;
  opacity: 1;
  position: relative;
  transition: opacity 100ms linear 500ms;
  z-index: 3;
}
.tip-button::before {
  border-radius: 0.25rem;
  bottom: 0;
  content: "";
  display: block;
  height: 100%;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  transition: height 250ms ease-in-out 400ms, width 250ms ease-in-out 300ms;
  width: 100%;
  z-index: 2;
}
.tip-button::after {
  bottom: -1rem;
  color: white;
  content: "ヾ(≧O≦)〃嗷~"; /*点击后显示的内容*/
  height: 110%;
  left: 0;
  opacity: 0;
  position: absolute;
  pointer-events: none;
  text-align: center;
  transform: scale(0);
  transform-origin: 50% 20%;
  transition: transform 200ms cubic-bezier(0, 0, 0.35, 1.43);
  width: 100%;
  z-index: 1;
}

.coin-wrapper {
  background: none;
  bottom: 0;
  height: 18rem;
  left: 0;
  opacity: 1;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  transform: none;
  transform-origin: 50% 100%;
  transition: opacity 200ms linear 100ms, transform 300ms ease-out;
  width: 100%;
}

.coin {
  --front-y-multiplier: 0;
  --back-y-multiplier: 0;
  --coin-y-multiplier: 0;
  --coin-x-multiplier: 0;
  --coin-scale-multiplier: 0;
  --coin-rotation-multiplier: 0;
  --shine-opacity-multiplier: 0.4;
  --shine-bg-multiplier: 50%;
  bottom: calc(var(--coin-y-multiplier) * 1rem - 3.5rem);
  height: 3.5rem;
  margin-bottom: 3.05rem;
  position: absolute;
  right: calc(var(--coin-x-multiplier) * 34% + 16%);
  transform: translateX(50%) scale(calc(0.4 + var(--coin-scale-multiplier))) rotate(calc(var(
            --coin-rotation-multiplier
          ) * -1deg));
  transition: opacity 100ms linear 200ms;
  width: 3.5rem;
  z-index: 3;
}
.coin__front,
.coin__middle,
.coin__back,
.coin::before,
.coin__front::after,
.coin__back::after {
  border-radius: 50%;
  box-sizing: border-box;
  height: 100%;
  left: 0;
  position: absolute;
  width: 100%;
  z-index: 3;
}
.coin__front {
  background: radial-gradient(circle at 50% 50%, transparent 50%, rgba(115, 124, 153, 0.4) 54%, #c2cadf 54%),
    linear-gradient(210deg, #8590b3 32%, transparent 32%), linear-gradient(150deg, #8590b3 32%, transparent 32%),
    linear-gradient(to right, #8590b3 22%, transparent 22%, transparent 78%, #8590b3 78%), linear-gradient(
      to bottom,
      #fcfaf9 44%,
      transparent 44%,
      transparent 65%,
      #fcfaf9 65%,
      #fcfaf9 71%,
      #8590b3 71%
    ), linear-gradient(to right, transparent 28%, #fcfaf9 28%, #fcfaf9 34%, #8590b3 34%, #8590b3 40%, #fcfaf9 40%, #fcfaf9
        47%, #8590b3 47%, #8590b3 53%, #fcfaf9 53%, #fcfaf9 60%, #8590b3 60%, #8590b3 66%, #fcfaf9 66%, #fcfaf9 72%, transparent
        72%);
  background-color: #8590b3;
  background-size: 100% 100%;
  transform: translateY(calc(var(--front-y-multiplier) * 0.3181818182rem / 2)) scaleY(var(--front-scale-multiplier));
}
.coin__front::after {
  background: rgba(0, 0, 0, 0.2);
  content: "";
  opacity: var(--front-y-multiplier);
}
.coin__middle {
  background: #737c99;
  transform: translateY(calc(var(--middle-y-multiplier) * 0.3181818182rem / 2)) scaleY(var(--middle-scale-multiplier));
}
.coin__back {
  background: radial-gradient(circle at 50% 50%, transparent 50%, rgba(115, 124, 153, 0.4) 54%, #c2cadf 54%),
    radial-gradient(circle at 50% 40%, #fcfaf9 23%, transparent 23%), radial-gradient(circle at 50% 100%, #fcfaf9 35%, transparent
        35%);
  background-color: #8590b3;
  background-size: 100% 100%;
  transform: translateY(calc(var(--back-y-multiplier) * 0.3181818182rem / 2)) scaleY(var(--back-scale-multiplier));
}
.coin__back::after {
  background: rgba(0, 0, 0, 0.2);
  content: "";
  opacity: var(--back-y-multiplier);
}
.coin::before {
  background: radial-gradient(circle at 25% 65%, transparent 50%, rgba(255, 255, 255, 0.9) 90%), linear-gradient(55deg, transparent
        calc(var(--shine-bg-multiplier) + 0%), #e9f4ff calc(var(--shine-bg-multiplier) + 0%), transparent calc(var(
              --shine-bg-multiplier
            ) + 50%));
  content: "";
  opacity: var(--shine-opacity-multiplier);
  transform: translateY(calc(var(--middle-y-multiplier) * 0.3181818182rem / -2)) scaleY(var(--middle-scale-multiplier))
    rotate(calc(var(--coin-rotation-multiplier) * 1deg));
  z-index: 10;
}
.coin::after {
  background: #737c99;
  content: "";
  height: 0.3181818182rem;
  left: 0;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  z-index: 2;
}

@keyframes shake {
  0% {
    transform: rotate(4deg);
  }
  66% {
    transform: rotate(-4deg);
  }
  100% {
    transform: rotate();
  }
}
```

- 新建 `/themes/butterfly/source/js/coin.js` 逻辑文件：

```js
var tipButtons = document.querySelectorAll(".tip-button");

function coinAudio() {
  var coinAudio = document.getElementById("coinAudio");
  if (coinAudio) {
    coinAudio.play(); //有音频时播放
  }
}
// Loop through all buttons (allows for multiple buttons on page)
tipButtons.forEach(button => {
  var coin = button.querySelector(".coin");

  // The larger the number, the slower the animation
  coin.maxMoveLoopCount = 90;

  button.addEventListener("click", () => {
    if (/Android|webOS|BlackBerry/i.test(navigator.userAgent)) return true; //媒体选择
    if (button.clicked) return;
    button.classList.add("clicked");

    // Wait to start flipping th coin because of the button tilt animation
    setTimeout(() => {
      // Randomize the flipping speeds just for fun
      coin.sideRotationCount = Math.floor(Math.random() * 5) * 90;
      coin.maxFlipAngle = (Math.floor(Math.random() * 4) + 3) * Math.PI;
      button.clicked = true;
      flipCoin();
      coinAudio();
    }, 50);
  });

  var flipCoin = () => {
    coin.moveLoopCount = 0;
    flipCoinLoop();
  };

  var resetCoin = () => {
    coin.style.setProperty("--coin-x-multiplier", 0);
    coin.style.setProperty("--coin-scale-multiplier", 0);
    coin.style.setProperty("--coin-rotation-multiplier", 0);
    coin.style.setProperty("--shine-opacity-multiplier", 0.4);
    coin.style.setProperty("--shine-bg-multiplier", "50%");
    coin.style.setProperty("opacity", 1);
    // Delay to give the reset animation some time before you can click again
    setTimeout(() => {
      button.clicked = false;
    }, 300);
  };

  var flipCoinLoop = () => {
    coin.moveLoopCount++;
    var percentageCompleted = coin.moveLoopCount / coin.maxMoveLoopCount;
    coin.angle = -coin.maxFlipAngle * Math.pow(percentageCompleted - 1, 2) + coin.maxFlipAngle;

    // Calculate the scale and position of the coin moving through the air
    coin.style.setProperty("--coin-y-multiplier", -11 * Math.pow(percentageCompleted * 2 - 1, 4) + 11);
    coin.style.setProperty("--coin-x-multiplier", percentageCompleted);
    coin.style.setProperty("--coin-scale-multiplier", percentageCompleted * 0.6);
    coin.style.setProperty("--coin-rotation-multiplier", percentageCompleted * coin.sideRotationCount);

    // Calculate the scale and position values for the different coin faces
    // The math uses sin/cos wave functions to similate the circular motion of 3D spin
    coin.style.setProperty("--front-scale-multiplier", Math.max(Math.cos(coin.angle), 0));
    coin.style.setProperty("--front-y-multiplier", Math.sin(coin.angle));

    coin.style.setProperty("--middle-scale-multiplier", Math.abs(Math.cos(coin.angle), 0));
    coin.style.setProperty("--middle-y-multiplier", Math.cos((coin.angle + Math.PI / 2) % Math.PI));

    coin.style.setProperty("--back-scale-multiplier", Math.max(Math.cos(coin.angle - Math.PI), 0));
    coin.style.setProperty("--back-y-multiplier", Math.sin(coin.angle - Math.PI));

    coin.style.setProperty("--shine-opacity-multiplier", 4 * Math.sin((coin.angle + Math.PI / 2) % Math.PI) - 3.2);
    coin.style.setProperty("--shine-bg-multiplier", -40 * (Math.cos((coin.angle + Math.PI / 2) % Math.PI) - 0.5) + "%");

    // Repeat animation loop
    if (coin.moveLoopCount < coin.maxMoveLoopCount) {
      if (coin.moveLoopCount === coin.maxMoveLoopCount - 6) button.classList.add("shrink-landing");
      window.requestAnimationFrame(flipCoinLoop);
    } else {
      button.classList.add("coin-landed");
      coin.style.setProperty("opacity", 0);
      setTimeout(() => {
        button.classList.remove("clicked", "shrink-landing", "coin-landed");
        setTimeout(() => {
          resetCoin();
        }, 300);
      }, 1500);
    }
  };
});
```

- 修改 `_config.Acryple.yml` 主配置文件，配置打赏设置：

```yml
reward:
    enable: true
    coinAudio: https://cdn.cbd.int/akilar-candyassets@1.0.36/audio/aowu.m4a
    QR_code:
      ......
  CDN:
    ......
    option:
    # 打赏按钮投币效果
   	  coin_js: /js/coin.js
      coin_css: /css/coin.css
```

- 整体替换 `/themes/Acryple/source/css/_layout/reward.styl` 样式表文件：

```stylus
.post-reward
  position: relative
  margin-top: 4rem
  width: 100%
  text-align: center

  .reward-button
    display: inline-block
    padding: .2rem 1.2rem
    background: var(--btn-bg)
    color: var(--btn-color)
    cursor: pointer
    transition: all .4s

    &:hover
      box-shadow: inset 15em 0 0 0 var(--btn-hover-color)

      .reward-main
        display: block

    .reward-main
      position: absolute
      bottom: 40px
      left: -50%
      z-index: 100
      display: none
      padding: 15px 0px 15px 0px
      width: 200%

      .reward-all
        display: inline-block
        margin: 0
        padding: 1rem .5rem
        border-radius: 4px
        background: var(--reward-pop)

        &:before
          position: absolute
          bottom: -10px
          left: 0
          width: 100%
          height: 20px
          content: ''

        &:after
          position: absolute
          right: 0
          bottom: 2px
          left: 0
          margin: 0 auto
          width: 0
          height: 0
          border-top: 13px solid var(--reward-pop)
          border-right: 13px solid transparent
          border-left: 13px solid transparent
          content: ''

        .reward-item
          display: inline-block
          padding: 0 8px
          list-style-type: none
          vertical-align: top

          img
            width: 130px
            height: 130px

          .post-qr-code-desc
            padding-top: .4rem
            width: 130px
            color: $reward-pop-up-color
```

<!-- endtab -->

<!-- tab hexo三连 -->

```shell
hexo clean 
hexo g 
hexo s
```

<!-- endtab -->

{% endtabs  %}

## 文章点赞

{% note info modern %}
版权声明：文章点赞效果如本文 banner 效果，点赞数据位于 <a href="https://console.leancloud.cn/apps">LeanCloud国内版</a> ，点赞实现方案来源于 <a href="https://yisous.xyz/posts/1b850b16/">Ariasakaの小窝</a> 。
{% endnote %}


{% tabs muself-catelist %}

<!-- tab Pug设置 -->

修改 `/themes/Acryple/layout/includes/header/post-info.pug` 文件，末尾添加：

```diff
.meta-secondline
	............
	if comments.count && !comments.lazyload && page.comments !== false && comments.use
        - var whichCount = comments.use[0]
    .............
	span.post-meta-separator |&nbsp 
        span.post-meta-dianzan
          if theme.wordcount.post_wordcount
            a(href="javascript:void(0)" class="dianzan"  onclick="dianzan()")
              i.fas.fa-thumbs-up
            span.post-meta-label= _p(' 点赞') + ':'
            span.dianzan-count=0
```

<!-- endtab -->

<!-- tab LeanCloud 配置 -->

进入 <a href="https://console.leancloud.cn/register">LeanCloud国内版注册页面</a> ，按照注册流程进行，同时需要进行实名认证，创建应用，选择 `开发版` ，进入应用，点击 `数据存储`，选择结构化数据，按照下图创建 `class` ，名称为 `dianzan` ：

![](https://pic.imgdb.cn/item/637ddbeb16f2c2beb1fe40ee.png)

<!-- endtab -->

<!-- tab 点赞 JS 实现 -->

创建  `/themes/Acryple/source/js/dianzan.js` 文件，其中 {YOUR_APPID} 、{YOUR_APPKEY} 、{YOUR_URL} 都是从设置中的 `应用凭证` 中获取到。

```js
function GetUrlRelativePath() {
    var url = document.location.toString();
    var arrUrl = url.split("//");

    var start = arrUrl[1].indexOf("/");
    var relUrl = arrUrl[1].substring(start);

    if (relUrl.indexOf("?") != -1) {
        relUrl = relUrl.split("?")[0];
    }
    return relUrl;
}
$(document).ready(function () {
    const {
        Query,
        User
    } = AV;
    AV.init({
        appId: "{YOUR_APPID}",
        appKey: "{YOUR_APPKEY}",
        serverURL: "{YOUR_URL}"
    });
    var dianzans = [];
    var hrefs = [];
    var ids = [];
    const query2 = new AV.Query('dianzan');
    query2.find().then((dzs) => {
        for (i = dzs.length - 1; i >= 0; i--) {
            dianzans.push(dzs[i]["attributes"]["count"]);
            hrefs.push(dzs[i]["attributes"]["href"]);
            ids.push(dzs[i]["id"])
        }
        index = hrefs.indexOf(GetUrlRelativePath());
        console.log(dianzans[index])
        if (dianzans[index] === undefined) {
            document.getElementsByClassName("dianzan-count")[0].innerText = "0";
        } else {
            document.getElementsByClassName("dianzan-count")[0].innerText = dianzans[index];
        }
    });
})

function setCount() {
    var dianzans = [];
    var hrefs = [];
    var ids = [];
    const query2 = new AV.Query('dianzan');
    query2.find().then((dzs) => {
        for (i = dzs.length - 1; i >= 0; i--) {
            dianzans.push(dzs[i]["attributes"]["count"]);
            hrefs.push(dzs[i]["attributes"]["href"]);
            ids.push(dzs[i]["id"])
        }
        index = hrefs.indexOf(GetUrlRelativePath());
        console.log(dianzans[index])
        if (dianzans[index] === undefined) {
            document.getElementsByClassName("dianzan-count")[0].innerText = "0";
        } else {
            document.getElementsByClassName("dianzan-count")[0].innerText = dianzans[index] + 1;
        }
    });
}

function dianzan() {
    try {
        var dianzans = [];
        var hrefs = [];
        var ids = [];
        const query = new AV.Query('dianzan');
        query.find().then((dzs) => {
            for (i = dzs.length - 1; i >= 0; i--) {
                dianzans.push(dzs[i]["attributes"]["count"]);
                hrefs.push(dzs[i]["attributes"]["href"]);
                ids.push(dzs[i]["id"])
            }
            if (hrefs.indexOf(GetUrlRelativePath()) == -1) {
                console.log(1)
                const TestObject = AV.Object.extend('dianzan');
                const testObject = new TestObject();
                testObject.set('href', GetUrlRelativePath());
                testObject.set('count', 1);
                testObject.save();
            } else {
                index = hrefs.indexOf(GetUrlRelativePath());
                console.log(ids[index])
                query.get(ids[index]).then((todo) => {
                    todo.set('count', dianzans[index] + 1);
                    todo.save();
                });
            }
            setCount();
        });
    } catch (err) {
        const TestObject = AV.Object.extend('dianzan');
        const testObject = new TestObject();
        testObject.set('href', GetUrlRelativePath());
        testObject.set('count', 1);
        testObject.save();
    }

}
```

<!-- endtab -->

<!-- tab 引入JS文件 -->

在主题配置文件 `_config.Acryple.yml` 中引入定义好的 `dianzan.js` 文件：

```yml
- <script async type="text/javascript" src="/js/dianzan.js"></script>
```

<!-- endtab -->

<!-- tab hexo三连 -->

```shell
hexo clean 
hexo g 
hexo s
```

<!-- endtab -->

{% endtabs  %}

## 关于页面

{% note info modern %}
版权声明：本站关于页面是仿照 <a href="https://anzhiy.cn/posts/e62b.html">安知鱼</a> 实现，剔除了我觉得并没有什么用的东西，嘻嘻嘻 . . . . . .
{% endnote %}


{% tabs muself-catelist %}

<!-- tab 页面设置 -->

修改 about 页面的 `index.md` 文件：

```md
---
title: 月の子豚小屋
date: 2022-09-28 15:48:52
type: "about"
---
```

<!-- endtab -->

<!-- tab Pug 结构 -->

添加 `/themes/Acryple/layout/includes/page/about.pug` 文件：

```diff
#about-page
  .author-box
    .author-img
      img.no-lightbox(src='https://pic.imgdb.cn/item/637b405e16f2c2beb1405fb3.jpg')
    .image-dot
  p.p.center.small 2022年的计划正在进行中......✨
  .author-content
    .author-content-item.myInfoAndSayHello.single
      .title1 你好，很高兴认识你👋
      .title2
        | 我叫
        span.inline-word 小月亮
      .title1
        | 是一名 Java 后端开发工程师，正在努力成为架构师的路上.....
  .author-content
    .create-site-post.author-content-item.single
      | 欢迎来到我的博客 😝，这里是我记笔记的地方 🙌，目前就读于湖北武汉的
      strong 武汉科技大学信息科学与工程学院
      | 的
      strong 通信工程
      | 专业，目前是处于
      strong 研三
      | 进行中，个人方向主要是数据挖掘方面，异常检测数据清洗之类的
      strong (神经网络)
      | ......
      | 这个博客应该算是我的第二版了吧，第一版是基于原生的 Butterfly ，但是后面各种魔改的报错 bug 信息让我失去了使用这个博客的兴趣。
      | 而现在这个博客是使用 
      a LXY大佬
      |  的
      strong Acryple 
      | 主题实现的，在这个基础上参照大量的魔改文章进行各种细节上的优化
      del (个人觉得是优化，用的更舒服哈，虽然有些卡🤣)
      | 以后自己的笔记都会更新在这个博客上面，会用到老吧，哈哈哈哈哈哈哈哈哈
      del (应该吧🤣)
      | 快上班太忙了可能就不会比较迅速写自己的笔记了✋~ 但记笔记真的是一个很棒的习惯 💪，既能养成好的习惯，也能丰富自身的知识积累，还能回顾以前自己的所思所想，
      del 还能哔哔赖赖
      | ，魔改主题可能到此结束了，大论文已经在 Push 我了，导师的 Push 接踵而至，自身睡眠的 Push 也来了
      del (不写完大论文都感觉睡不好)
      psw 你们应该也看出来了吧，我就是那种记挂着一个事情就心里有个刺的人，博客就是这样，不搞的比较舒服就用的不舒服，就不愿意用了，阿巴阿巴~
      | 个人是在读研期间自学的 Java 开发，今年刚找到的工作，形式很难，人麻了
      del (不要卷Java!)
      | 🤢，以后还是想成为一个 Java 后端精品选手🐷，要是能够做到架构师的地步那就最好啦，哈哈哈哈哈哈哈😜。
      | 本身也是一个热爱游戏的人，但是是一个又菜又爱玩🎮的菜鸡，网游基本都是玩 
      strong moba游戏
      | ，FPS游戏玩的头晕
      del (传说中的3D晕眩症哈)
      | 😢，手游还能玩一下和平精英这种FPS游戏，也比较酷爱单机游戏吧，嘻嘻嘻嘻😉
      | 写个人介绍还有点写不下去了，哈哈哈哈哈哈哈哈哈，先就这样吧🤦‍♂️
  .author-content
    .author-content-item.single.reward
      .author-content-item-tips 致谢
      span.author-content-item-title 赞赏名单
      .author-content-item-description 感谢因为有你们，让我更加有创作的动力。
        each i in site.data.reward
          - let rawData = [...i.reward_list]
          .reward-list-all
            - let reward_list_amount = i.reward_list.sort((a,b)=>b.amount -  a.amount)
            each item, index in reward_list_amount
              .reward-list-item
                .reward-list-item-name=item.name
                .reward-list-bottom-group
                  if item.amount >= 50
                    .reward-list-item-money(style='background:var(--lyx-pink)')=`¥ ${item.amount}` + " 软妹币"
                  else if item.amount >= 20
                    .reward-list-item-money(style='background:var(--anzhiyu-yellow)')=`¥ ${item.amount}` + " 软妹币"
                  else 
                    .reward-list-item-money=`¥ ${item.amount + (item.suffix ? item.suffix : "")}` + " 软妹币"
                  .datatime.reward-list-item-time(datatime=item.datatime)=new Date(item.datatime).toISOString().slice(0, -14)
          .reward-list-updateDate
            | 最新更新时间：
            time.datatime.reward-list-updateDate-time(datatime=rawData[0].datatime)=new Date(rawData[0].datatime).toISOString().slice(0, -14)
      .post-reward
        button.tip-button.reward-button
          span.tip-button__text 不给糖果就捣蛋
          .coin-wrapper
            .coin
              .coin__middle
              .coin__back
              .coin__front
          .reward-main
            ul.reward-all
              li.reward-item
                a(href='/cur/wechat.png', target='_blank')
                  img.post-qr-code-img(alt='wechat', src='/cur/wechat.png')
                .post-qr-code-desc wechat
              li.reward-item
                a(href='/cur/alipay.jpg', target='_blank')
                  img.post-qr-code-img(alt='alipay', src='/cur/alipay.jpg')
                .post-qr-code-desc alipay
```

<!-- endtab -->

<!-- tab 引入 about 页面 -->

修改 `themes/Acryple/layout/page.pug`，在 case 中加入判断（缩进样式需要注意一致）。

```diff
when 'about'
  include includes/page/about.pug
```

<!-- endtab -->

<!-- tab CSS 样式表 -->

在  `/themes/Acryple/source/css/index.styl` 文件中引入 about 需要的 css 页面：

```stylus
@import 'about/about.css'
```

编写 `about.css` 样式表文件：

```css
#gitcalendar {
    margin: 0 auto;
    border-radius: 24px;
    background: var(--anzhiyu-card-bg);
    border: var(--style-border-always);
    box-shadow: var(--anzhiyu-shadow-border);
    position: relative;
    padding: 1rem 2rem;
    overflow: hidden;
  }
  
  #page:has(#about-page) {
    border: 0;
    box-shadow: none !important;
    padding: 0 !important;
    background: transparent !important;
  }
  
  #page:has(#about-page) .page-title {
    display: none;
  }
  
  .page:has(#about-page) #footer-wrap {
    opacity: 1;
    overflow: visible;
    height: auto !important;
    min-height: 16px;
    color: #666;
  }
  
  #web_bg ~ .page:has(#about-page) {
    background: var(--anzhiyu-background);
  }
  
  #about-page .author-box {
    position: relative;
  }
  #about-page .author-box .author-img {
    margin: auto;
    border-radius: 50%;
    overflow: hidden;
    width: 180px;
    height: 180px;
  }
  #about-page .author-box .author-img img {
    border-radius: 50%;
    overflow: hidden;
    width: 180px;
    height: 180px;
  }
  
  #about-page .author-box .image-dot {
    width: 45px;
    height: 45px;
    background: #6bdf8f;
    position: absolute;
    border-radius: 50%;
    border: 6px solid var(--anzhiyu-background);
    top: 50%;
    left: 50%;
    transform: translate(35px, 45px);
  }
  
  .author-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 100%;
    margin-top: 1rem;
  }
  
  #about-page .myInfoAndSayHello {
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: var(--anzhiyu-white);
    background: linear-gradient(120deg, #ff7676  0, #ff7676  100%);
    background-size: 200%;
    animation: gradient 15s ease infinite;
    width: 100%;
  }

  #about-page p.p.center, span.p.center {
    display: block;
    text-align: center;
}
  
  .author-content-item {
    width: 49%;
    border-radius: 24px;
    background: var(--anzhiyu-card-bg);
    border: var(--style-border-always);
    box-shadow: var(--anzhiyu-shadow-border);
    position: relative;
    padding: 1rem 2rem;
    overflow: hidden;
  }
  
  #about-page .myInfoAndSayHello .title1 {
    opacity: 0.8;
    line-height: 1.3;
  }
  
  #about-page .myInfoAndSayHello .title2 {
    font-size: 36px;
    font-weight: 700;
    line-height: 1.1;
    margin: 0.5rem 0;
  }
  .inline-word {
    word-break: keep-all;
    white-space: nowrap;
  }
  
  #about-page .myInfoAndSayHello .title1 {
    opacity: 0.8;
    line-height: 1.3;
  }
  
  .author-content-item .card-content {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    padding: 1rem 2rem;
  }
  
  .author-content-item .card-content .author-content-item-title {
    margin-bottom: 0.5rem;
  }
  .author-content-item .author-content-item-title {
    font-size: 36px;
    font-weight: 700;
    line-height: 1;
  }
  .author-content-item.single {
    width: 100%;
  }
  .author-content-item.myInfoAndSayHello.single {
    width: 100%;
    display: block;
    text-align: center;
  }
/* 赞赏框相关配置 */
  .author-content-item.single.reward .reward-list-updateDate {
    color: var(--anzhiyu-gray);
    font-size: 14px;
  }

  .author-content-item.single.reward .post-reward {
    position: absolute;
    margin-top: 0px;
    width: auto;
    text-align: none;
    /* pointer-events: none; */
    right: 2rem;
    top: 2rem;
  }
  .tip-button {
    border: 0;
    border-radius: 2.25rem;
    cursor: pointer;
    font-size: 20px;
    font-weight: 600;
    height: 2.6rem;
    margin-bottom: -4rem;
    outline: 0;
    position: relative;
    top: 0;
    transform-origin: 0 100%;
    transition: transform 50ms ease-in-out;
    width: auto;
    -webkit-tap-highlight-color: transparent;
  }
  .coin::before,
  .coin__back,
  .coin__back::after,
  .coin__front,
  .coin__front::after,
  .coin__middle {
    border-radius: 50%;
    box-sizing: border-box;
    height: 100%;
    left: 0;
    position: absolute;
    width: 100%;
    z-index: 3;
  }
  .coin-wrapper {
    background: 0 0;
    bottom: 0;
    height: 18rem;
    left: 0;
    opacity: 1;
    overflow: hidden;
    pointer-events: none;
    position: absolute;
    transform: none;
    transform-origin: 50% 100%;
    transition: opacity 0.2s linear 0.1s, transform 0.3s ease-out;
    width: 100%;
  }
  .coin__front::after {
    background: rgba(0, 0, 0, 0.2);
    content: "";
    opacity: var(--front-y-multiplier);
  }
  .coin__back::after {
    background: rgba(0, 0, 0, 0.2);
    content: "";
    opacity: var(--back-y-multiplier);
  }
  .coin__middle {
    background: #737c99;
    transform: translateY(calc(var(--middle-y-multiplier) * 0.3181818182rem / 2)) scaleY(var(--middle-scale-multiplier));
  }
  .coin::before {
    background: radial-gradient(circle at 25% 65%, transparent 50%, rgba(255, 255, 255, 0.9) 90%), linear-gradient(55deg, transparent
          calc(var(--shine-bg-multiplier) + 0), #e9f4ff calc(var(--shine-bg-multiplier) + 0), transparent calc(var(
                --shine-bg-multiplier
              ) + 50%));
    content: "";
    opacity: var(--shine-opacity-multiplier);
    transform: translateY(calc(var(--middle-y-multiplier) * 0.3181818182rem / -2)) scaleY(var(--middle-scale-multiplier))
      rotate(calc(var(--coin-rotation-multiplier) * 1deg));
    z-index: 10;
  }
  
  .coin {
    --front-y-multiplier: 0;
    --back-y-multiplier: 0;
    --coin-y-multiplier: 0;
    --coin-x-multiplier: 0;
    --coin-scale-multiplier: 0;
    --coin-rotation-multiplier: 0;
    --shine-opacity-multiplier: 0.4;
    --shine-bg-multiplier: 50%;
    bottom: calc(var(--coin-y-multiplier) * 1rem - 3.5rem);
    height: 3.5rem;
    margin-bottom: 3.05rem;
    position: absolute;
    right: calc(var(--coin-x-multiplier) * 34% + 16%);
    transform: translateX(50%) scale(calc(0.4 + var(--coin-scale-multiplier))) rotate(calc(var(
              --coin-rotation-multiplier
            ) * -1deg));
    transition: opacity 0.1s linear 0.2s;
    width: 3.5rem;
    z-index: 3;
  }
  
  .coin__back {
    background: radial-gradient(circle at 50% 50%, transparent 50%, rgba(115, 124, 153, 0.4) 54%, #c2cadf 54%),
      radial-gradient(circle at 50% 40%, #fcfaf9 23%, transparent 23%), radial-gradient(circle at 50% 100%, #fcfaf9 35%, transparent
          35%);
    background-color: #8590b3;
    background-size: 100% 100%;
    transform: translateY(calc(var(--back-y-multiplier) * 0.3181818182rem / 2)) scaleY(var(--back-scale-multiplier));
  }
  .coin__front {
    background: radial-gradient(circle at 50% 50%, transparent 50%, rgba(115, 124, 153, 0.4) 54%, #c2cadf 54%),
      linear-gradient(210deg, #8590b3 32%, transparent 32%), linear-gradient(150deg, #8590b3 32%, transparent 32%),
      linear-gradient(to right, #8590b3 22%, transparent 22%, transparent 78%, #8590b3 78%), linear-gradient(
        to bottom,
        #fcfaf9 44%,
        transparent 44%,
        transparent 65%,
        #fcfaf9 65%,
        #fcfaf9 71%,
        #8590b3 71%
      ), linear-gradient(to right, transparent 28%, #fcfaf9 28%, #fcfaf9 34%, #8590b3 34%, #8590b3 40%, #fcfaf9 40%, #fcfaf9
          47%, #8590b3 47%, #8590b3 53%, #fcfaf9 53%, #fcfaf9 60%, #8590b3 60%, #8590b3 66%, #fcfaf9 66%, #fcfaf9 72%, transparent
          72%);
    background-color: #8590b3;
    background-size: 100% 100%;
    transform: translateY(calc(var(--front-y-multiplier) * 0.3181818182rem / 2)) scaleY(var(--front-scale-multiplier));
  }
  .tip-button__text {
    color: #fff;
    margin-right: 1.8rem;
    opacity: 1;
    position: relative;
    transition: opacity 0.1s linear 0.5s;
    z-index: 3;
  }
  .author-content .post-reward .reward-main {
    bottom: 0;
    top: 50px;
    left: -50px;
    right: 0px;
    width: 200%
  }
  .author-content .post-reward .reward-main .reward-all:before {
    top: -11px;
    bottom: auto;
  }
  #about-page .post-reward .reward-item a:hover {
    background: transparent !important;
  }
  #about-page .post-reward .reward-item a {
    border-bottom: none !important;
  }
  #about-page .post-reward .reward-item a img {
    margin-bottom: 0 !important;
  }
  #about-page .post-reward .reward-main .reward-all {
    border-radius: 10px;
    padding: 20px 10px !important;
  }
  .post-reward .reward-main .reward-all .reward-item {
    padding: 0 8px !important;
  }
  .post-reward .reward-main .reward-all li.reward-item::before {
    content: none !important;
  }
  .post-reward .reward-main .reward-all:after {
    content: none !important;
  }
  .author-content-item .author-content-item-tips {
    opacity: 0.8;
    font-size: 0.6rem;
    margin-bottom: 0.5rem;
  }
  @media screen and (max-width: 768px) {
    .author-content {
      margin-top: 0;
    }
    .author-content-item {
      width: 100% !important;
      margin-top: 1rem;
      padding: 1rem;
    }
    .post-reward {
      display: none;
    }
    .reward-list-item {
      width: 100% !important;
    }
    .layout > div:first-child:not(.recent-posts) {
      /* border-radius: 0; */
      padding: 0 1rem !important;
      box-shadow: none !important;
      background: var(--anzhiyu-background);
    }
  }
  .reward-list-all {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    margin-left: -0.25rem;
    margin-right: -0.25rem;
  }
  
  .reward-list-item {
    padding: 1rem;
    border-radius: 12px;
    border: var(--style-border-always);
    width: calc((100% / 3) - 0.5rem);
    margin: 0 0.25rem 0.5rem 0.25rem;
    box-shadow: var(--anzhiyu-shadow-border);
  }
  
  .reward-list-item .reward-list-item-name {
    font-size: 1rem;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 0.5rem;
  }
  
  .reward-list-item .reward-list-bottom-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .reward-list-item .reward-list-item-money {
    padding: 4px;
    background: var(--font-color);
    color: var(--card-bg);
    font-size: 12px;
    line-height: 1;
    border-radius: 4px;
    margin-right: 4px;
    white-space: nowrap;
  }
  
  .reward-list-item .reward-list-item-time {
    font-size: 12px;
    color: var(--anzhiyu-secondtext);
    white-space: nowrap;
  }
```

<!-- endtab -->

<!-- tab 添加赞赏数据 -->

新建 `source/_data/reward.yml` 文件，存放赞赏信息：

```yml
- class_name: 赞赏
  reward_list:
    - name: 小茶
      amount: 20
      datatime: 2022-11-23
    - name: 爽子哥
      amount: 1
      datatime: 2022-11-23
    - name: moon
      amount: 50
      datatime: 2022-11-10
```

<!-- endtab -->

<!-- tab hexo三连 -->

```shell
hexo clean 
hexo g 
hexo s
```

<!-- endtab -->

{% endtabs  %}

















