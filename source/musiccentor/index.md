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