---
title: 博客文章统计
date: 2022-09-28 15:48:52
type: "charts"
---

<script src="https://npm.elemecdn.com/echarts@4.9.0/dist/echarts.min.js"></script>
<!-- 文章发布时间统计图，data-start="2021-01" 属性表示文章发布时间统计图仅显示 2021-01 及以后的文章数据。 -->
<div id="posts-chart" data-start="2020-01" style="border-radius: 8px; height: 300px; padding: 10px;"></div>
<!-- 文章标签统计图 ，data-length="10" 属性表示仅显示排名前 10 的标签。-->
<div id="tags-chart" data-length="20" style="border-radius: 8px; height: 300px; padding: 10px;"></div>
<!-- 文章分类统计图 ， data-parent="true" 属性表示 有子分类 时以旭日图显示分类，其他 无子分类 或 设置为false 或 不设置该属性 或 设置为其他非true属性 情况都以饼状图显示分类。-->
<div id="categories-chart" data-parent="true" style="border-radius: 8px; height: 300px; padding: 10px;"></div>