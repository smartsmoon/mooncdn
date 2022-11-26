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