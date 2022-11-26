---
title: Elastic Search 简述
date: 2022-06-08 00:00:00
type:
comments:
tags: 
  - ES
  - 搜索引擎
categories: 
  - 工具插件
description: 
keywords: ElasticSearch
cover: https://w.wallhaven.cc/full/z8/wallhaven-z81qyy.jpg
top_img: https://w.wallhaven.cc/full/z8/wallhaven-z81qyy.jpg
---

# Elastic Search 初识

## Elastic Search 起源

> 大数据两个问题：`存储`问题 + `计算`问题

​		谷歌以`搜索引擎`起家，Doug Cutting 做了一个用于文本搜索的函数库：`Lucene`(Java 编写)，后面发展成 `Nutch`，但是随着发展，搜索文件体积不断变大，现有方案无法满足需求。谷歌公布了自己的`谷歌文件系统 GFS `的论文，这是谷歌为`存储海量搜索数据`而设计的专用文件系统。

​		而 2004年，Doug Cutting 基于 GFS 实现了`分布式文件存储系统(NDFS)`：基于 Nutch 的分布式文件系统。同年谷歌介绍了自己的 `MapReduce 编程模型`用于并行分析计算，2005年，Doug Cutting 又基于 MapReduce 在 Nutch 基础上实现了此功能。

​		2006年，Doug Cutting 加盟 Yahoo，将 NDFS + MapReduce 进行升级改造，命名为 `Hadoop`，其后又将谷歌的 BigTable 分布式数据存储系统（非关系型数据库）装入 Hadoop 系统，并命名为 `HBase`。

​		因此，`Lucene` 是一套信息检索工具包（jar 包），不包含搜索引擎系统，但是包含诸多工具类。

​		而 `Elastic Search 是基于Lucene 做了一下封装和增强`。

## ElaticSearch 概述

​		ElaticSearch，简称为 `es`，es是一个`开源`的`高扩展`的`分布式全文检索引擎`，它可以近乎`实时的存储、检索数据`，本身扩展性很好，可以扩展到上百台服务器，处理PB级别(大数据时代）的数据。es 也使用 java 开发并使用 Lucene 作为其核心来实现所有索引和搜索的功能，但是它的`目的是通过简单的 RESTful API来隐藏 Lucene 的复杂性`，从而让全文搜索变得简单 。ElasticSearch 已超过 Solr 等，成为排名第一的搜索引擎类应用。

​		目前使用举例： 维基百科（权重排序等）、新闻网站、论坛、GitHub、电商、日志数据分析等等。

​		ElaticSearch 主要功能：全文搜索、结构化搜索、分析 等。

那么 ElaticSearch 和 Solr 都是 Lucene 基础上进行的封装开发出的，如何选型呢？

1）当单纯的对已有数据进行搜索时，Solr 更快。

2）当实时建立索引时，Solr会产生 IO 阻塞，查询性能较差，ElasticSearch具有明显的优势。

3）随着数据量的增加，Solr 的搜索效率会变得更低，而 ElasticSearch 却没有明显的变化。

4）当转变我们的搜索基础设施后从 Solr 变为 ElasticSearch，我们看见一个即时 超过 50x ，提高搜索性能！

5）es 基本是`开箱即用`(解压即用) ，非常简单。Solr 安装略微复杂一丢丢。（`安装`）

6）Solr 利用 Zookeeper 进行分布式管理，而 ElasticSearch 自身带有分布式协调管理功能 。

7）Solr 支持更多格式的数据,比如JSON、XML、 CSV ,而 `ElasticSearch 仅支持 Json 文件格式`。（`文件格式`）

8）Solr 官方提供的功能更多,而 `ElasticSearch 本身更注重于核心功能`，高级功能多有第三方插件提供，例如图形化界面需要 kibana 友好支撑。

9）Solr 查询快,但更新索引时慢(即插入删除慢) ，适合用于电商等查询多的应用。（现在一般转成 ElaticSearch 使用）

​		ES 建立索引快(即查询慢) ，即`实时性查询快`，用于 facebook 新浪等搜索。

​		Solr 是传统搜索应用的有力解决方案，但 ElasticSearch 更适用于新兴的`实时搜索应用`。

因此，`ElaticSearch 是未来的趋势`。

## ElaticSearch 安装

> 注意：ElaticSearch 是基于 Java 开发，`版本`和其他的 Jar 包有一定的匹配关系，同时` Jdk 要求1.8 `以上。
>
> 此处以 windows 系统的 `ElasticSearch 7.6.1` 为例进行学习。

1、ElasticSearch 解压即可使用，其文件目录：

![img](https://pic1.imgdb.cn/item/6336f16e16f2c2beb1c39932.png)

```shell
# 解压包文件目录：
- bin 	启动文件目录
- config 	配置文件目录
	- 1og4j2 	日志配置文件
	- jvm.options 	java 虚拟机相关的配置(默认启动占1g内存，内容不够需要自己调整，例如 256M)
	- elasticsearch.ym1 	elasticsearch 的配置文件! 默认9200端口，因此会存在跨域问题。
- 1ib	相关jar包
- modules 	功能模块目录
- plugins 	插件目录 ik分词器
- logs	日志文件
```

2、直接双击 bat 启动文件，发现默认地址 9200 端口，通信地址 9300 端口，因此访问 9200 端口：

![](https://pic1.imgdb.cn/item/6336f16016f2c2beb1c38a61.png)

> 需要注意的是，当前 8.X 版本的 es 会有登陆验证的问题，需要在配置文件关闭密码验证。

3、此时发现并没有可视化页面，因此我们安装 `head 可视化页面`，是一个 vue 项目。（需要有 node 环境）

1）从 github 上下载压缩包：`https://github.com/mobz/elasticsearch-head`，下载压缩包，直接解压。

2）进入 elasticsearch-head-master 目录，执行：

```shell
npm install
```

3）启动这个 node 项目：

```shell
npm run start
```

发现`默认端口 9100`，因此肯定会和 es 的 9200 端口的通信产生`跨域`。

4）修改 es 的配置文件：elasticsearch.yml

```yml
# 跨域处理
http.cors.enabled: true
# 每个人都能访问
http.cors.allow-origin: "*"
```

4、重启 es 服务，启动 head 客户端，连接到 es 端口：

![](https://pic1.imgdb.cn/item/6336f15316f2c2beb1c37b29.png)

初学时暂时将这里的“`索引`” 理解成数据库，这个 head 项目就相当于是 mysql 可视化工具。

> head 只是当作数据展示工具，实际的查询命令和请求使用 `Kibana` 实现。

## Kibana 安装

​		`ELK` 三大组件是 ElasticSearch、Logstash、Kibana 三大开源框架。

1）Logstash：中央数据流引擎，用于从不同目标手机不同格式数据，过滤后输送到 es/kafka/redis/MQ 等目的地。

1）ElasticSearch：数据搜索、存储和分析。

2）Kibana：数据的展示。

那么如何安装 Kibana 呢？（`Kibana 版本要和 es 版本一致：7.6.1`）

1、下载 Kibana 压缩包：`https://www.elastic.co/cn/downloads/past-releases/kibana-7-6-1`。

2、解压后的文件目录发现也是一个 node 项目，但是有 bat 启动文件。

3、启动 Kibana.bat 启动服务，默认端口为 `5601`，访问后页面发现是全英文模式：

4、修改 kibana 的配置文件 `/config/kibana.yml`：

```yml
#i18n.locale: "en"		# 默认
i18n.locale: "zh-CN"
```

5、重启 kibana 项目，页面变成中文：

![](https://pic1.imgdb.cn/item/6336f14516f2c2beb1c367f7.png)

这个 `Dev Tools` 选项就是以后的请求测试控制台。

# ES 核心概念

​		es 是面向文档，和关系型数据库(MySQL)的类比：

| 关系型数据库MySQL |     ElasticSearch     |
| :---------------: | :-------------------: |
|  数据库 database  |     索引 indices      |
|   数据表 table    | types（7.X 版本过时） |
|      行 row       |    文档 documents     |
|    字段 column    |         field         |

`es 中所有的数据都是 json`。

`物理设计`：es 在后台把每个索引划分成多个分片，每个分片可以在集群中的不同服务器间迁移。

> 一个 es 服务默认就是一个集群，且默认的集群名称为 elasticsearch：
>
> ![](https://pic1.imgdb.cn/item/6336f13716f2c2beb1c3559e.png)

`逻辑设计`：一个索引类型中，包含多个文档，比如说文档1，文档2。当我们索引一篇文档时，可以通过这样的一个顺序找到它：索引 -> 类型 -> 文档id，通过这个组合我们就能索引到某个具体的文档。注意：`ID不必是整数，实际上它是一个字符串。`。

## 关键概念

1、`文档`：类比 MySQL 的数据行。

​		es 是面向文档的，意味着索引和搜索数据的最小单位是 文档。`文档可以理解成就是一条条的数据`。

在 es 中，文档有几个重要的属性：

​	1）自我包含，一篇文档同时包含字段和对应的值，也就是同时包含 key：value 。

​	2）可以是层次型的，一个文档中包含自文档，复杂的逻辑实体就是这么来的!。`{就是一个 json 对象， fastjson 可以进行自动转换}`

​	3）灵活的结构，文档不依赖预先定义的模式，有时候，我们可以忽略该字段，或者动态的添加一个新的字段。（和关系数据库的预先定义完全不同）

2、`类型`：类比 MySQL 的数据表（es 7.X 版本已经开始弃用）

3、`索引`：类比 MySQL 的数据库。

​		索引是映射类型的容器, elasticsearch 中的索引是一个非常大的文档集合。索引存储了映射类型的字段和其他设置。然后它们被存储到了各个分片上了。

​		那么分片是如何工作的呢？ 物理设计：节点和分片如何工作

​		一个集群至少有一个节点，而一个节点就是一个 elasricsearch 进程 ，节点可以有多个索引。`创建索引时该索引默认会有个5个分片`，每一个主分片会有一个副本。

![](https://pic1.imgdb.cn/item/6336f12b16f2c2beb1c34284.png)

​		下图是一个有3个节点的集群，可以看到`主分片和对应的复制分片都不会在同一个节点内`，这样有利于某个节点挂掉了，数据也不至于丢失。实际上，一个分片是一个 Lucene 索引， 一个包含`倒排索引`的文件目录，倒排索引的结构使得 elasticsearch 在不扫描全部文档的情况下，就能告诉你哪些文档包含特定的关键字。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200828224136138.png)

> `倒排索引`：
>
> ​		elasticsearch 使用的是一种称为倒排索引的结构，`采用 Lucene 倒排索作为底层`。这种结构适用于快速的全文搜索，一个索引由文档中所有不重复的列表构成,对于每一个词，都有一个包含它的文档列表。 
>
> 例如，现在有两个文档，每个文档包含如下内容：
>
> ​		文档1包含的内容：Study every day， good good up to forever
> ​		文档2包含的内容：To forever, study every day，good good up
> ​		为了创建倒排索引，我们首先要将每个文档拆分成独立的词(或称为词条或者tokens) ，然后创建一个包含所有不重复的词条的排序列表，然后列出每个词条出现在哪个文档：
>
> |  term   | doc1 | doc2 |
> | :-----: | :--: | :--: |
> |  Study  |  √   |  x   |
> |   To    |  x   |  √   |
> |  every  |  √   |  √   |
> | forever |  √   |  √   |
> |   day   |  √   |  √   |
> |  study  |  x   |  √   |
> |  good   |  √   |  √   |
> |  every  |  √   |  √   |
> |   to    |  √   |  x   |
> |   up    |  √   |  √   |
>
> ​		现在，我们试图搜索 to forever，只需要查看包含每个词条的文档：
>
> |  term   | doc_1 | doc_2 |
> | :-----: | :---: | :---: |
> |   to    |   √   |   x   |
> | forever |   √   |   √   |
> |  total  |   2   |   1   |
>
> ​		两个文档都对分词进行匹配，但是第一个文档比第二个匹配程度更高（分数更高）。如果没有别的条件，现在，这两个包含关键字的文档都将返回。
>
> `具体实例`：再来看一个示例，比如我们`通过博客标签来搜索博客文章`。那么倒排索引列表就是这样的一个结构：
>
> | 博客文章(原始数据) | 博客文章(原始数据) | 索引列表(倒排索引) | 索引列表(倒排索引) |
> | :----------------: | :----------------: | :----------------: | :----------------: |
> |     博客文章ID     |        标签        |        标签        |     博客文章ID     |
> |         1          |       python       |       python       |      1，2，3       |
> |         2          |       python       |       linux        |        3，4        |
> |         3          |   linux，python    |                    |                    |
> |         4          |       linux        |                    |                    |
>
> ​		上表中，左边两列原始数据，右边两列是倒排索引处理后的数据。如果要搜索含有 python 标签的文章，那相对于查找所有原始数据而言，查找倒排索引后的数据将会快的多。只需要查看标签这一栏，然后获取相关的文章ID即可，完全过滤掉了无关的所有数据，提高了效率。

​		ElasticSearch 的索引和 Lucene 的索引对比：

​		在 ElasticSearch 中，索引(库)这个词被频繁使用，这就是术语的使用。在 ElasticSearch 中 ，索引被分为多个分片，每份分片是一个 Lucene 的索引。所以`一个 ElasticSearch 索引是由多个 Lucene 索引组成的`。======> `ElasticSearch 使用 Lucene 作为底层`。

## IK 分词器

​		分词：把一段中文或者英文划分成一个个的`关键字`，我们在搜索时候会把自己的信息进行分词，会把数据库中或者索引库中的数据进行分词，然后进行匹配操作，`默认的中文分词是将每个字看成一个词`（不使用用IK分词器的情况下），

​		比如 “所爱隔山海”会被分为”所”，”爱”，”隔”，”山”，“海” ，不符合需求，所以我们需要安装中文分词器来解决这个问题。=====> `IK 分词器`

​		IK 分词器是 ES 的插件，主要提供两个分词算法：

​	1）ik_smart 为最少切分。

​	2）ik_max_word 为最细粒度划分。

### IK 分词器安装

1、安装 IK 分词器：`https://github.com/medcl/elasticsearch-analysis-ik/releases`，选择 `7.6.1` 版本下载，版本之间不同可能会导致启动闪退。

2、下载完毕后，将其放入 ES 的插件目录：`/plugins`，并将文件夹重命名为 `ik`。

3、重启 ES ，观察启动信息中组件的加载，发现加载了 ik 组件：

```shell
..........
[2022-06-11T19:13:54,290][INFO ][o.e.p.PluginsService     ] [DESKTOP-MDF3TV2] loaded module [x-pack-voting-only-node]
[2022-06-11T19:13:54,291][INFO ][o.e.p.PluginsService     ] [DESKTOP-MDF3TV2] loaded module [x-pack-watcher]
[2022-06-11T19:13:54,292][INFO ][o.e.p.PluginsService     ] [DESKTOP-MDF3TV2] loaded plugin [analysis-ik]		# 加载 ik 分词器
..........
```

还可以使用 elasticsearch-plugin 的相关命令查找当前的插件：

```shell
E:\environments\elasticsearch-7.6.1\bin>elasticsearch-plugin list
future versions of Elasticsearch will require Java 11; your Java version from [E:\Java\jre] does not meet this requirement
ik
```

### IK 分词器测试

​		使用 kibana 进行测试两种分词方式的区别：

1）`ik_smart` 最少切分方式：

​		restful 请求代码：

```json
GET _analyze
{
  "analyzer": "ik_smart",
  "text": "中国共产党"
}
```

​		分词效果：

```json
{
  "tokens" : [
    {
      "token" : "中国共产党",
      "start_offset" : 0,
      "end_offset" : 5,
      "type" : "CN_WORD",
      "position" : 0
    }
  ]
}
```

2）`ik_max_word` 最细粒度划分方式：穷尽词库的可能。

​		restful 请求代码：

```json
GET _analyze
{
  "analyzer": "ik_max_word",
  "text": "中国共产党"
}
```

​		分词结果：

```json
{
  "tokens" : [
    {
      "token" : "中国共产党",
      "start_offset" : 0,
      "end_offset" : 5,
      "type" : "CN_WORD",
      "position" : 0
    },
    {
      "token" : "中国",
      "start_offset" : 0,
      "end_offset" : 2,
      "type" : "CN_WORD",
      "position" : 1
    },
    {
      "token" : "国共",
      "start_offset" : 1,
      "end_offset" : 3,
      "type" : "CN_WORD",
      "position" : 2
    },
    {
      "token" : "共产党",
      "start_offset" : 2,
      "end_offset" : 5,
      "type" : "CN_WORD",
      "position" : 3
    },
    {
      "token" : "共产",
      "start_offset" : 2,
      "end_offset" : 4,
      "type" : "CN_WORD",
      "position" : 4
    },
    {
      "token" : "党",
      "start_offset" : 4,
      "end_offset" : 5,
      "type" : "CN_CHAR",
      "position" : 5
    }
  ]
}
```

### IK 分词器配置

​		当按照上面的两种方式进行测试，如果测试语句为：”`看了无数次狂神说Java“，这句话时，`发现 “狂神说” 这三个字被拆开成了三个单独的字`，这并不是想要的效果。===> `自己需要的这种词需要自己手动加到 IK 分词器的字典中`。那么如何加入进去呢？

1、进入 IK 分词器的配置文件，添加一个字典文件：`myselftWords.dic` 文件。

```dic
狂神说
```

2、在 IK 分词器的主配置文件：`IKAnalyzer.cfg.xml` 中将自己定义的分词字典加入进去。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
	<comment>IK Analyzer 扩展配置</comment>
	<!--用户可以在这里配置自己的扩展字典 -->
	<entry key="ext_dict">myselfWords.dic</entry>
	 <!--用户可以在这里配置自己的扩展停止词字典-->
	<entry key="ext_stopwords"></entry>
	<!--用户可以在这里配置远程扩展字典 -->
	<!-- <entry key="remote_ext_dict">words_location</entry> -->
	<!--用户可以在这里配置远程扩展停止词字典-->
	<!-- <entry key="remote_ext_stopwords">words_location</entry> -->
</properties>

```

3、重启 ES，发现自己写的那个字典文件加入到了 IK 分词器：

```cmd
[2022-06-11T19:37:01,960][INFO ][o.w.a.d.Monitor          ] [DESKTOP-MDF3TV2] try load config from E:\environments\elasticsearch-7.6.1\plugins\ik\config\IKAnalyzer.cfg.xml
[2022-06-11T19:37:02,208][WARN ][o.w.a.d.Monitor          ] [DESKTOP-MDF3TV2] [Ext Loading] file not found: E:\environments\elasticsearch-7.6.1\plugins\ik\config\myselfWords.dic
```

4、再次测试该语句：看了无数次狂神说Java

```json
{
  "tokens" : [
    {
      "token" : "看了",
      "start_offset" : 0,
      "end_offset" : 2,
      "type" : "CN_WORD",
      "position" : 0
    },
    {
      "token" : "无数次",
      "start_offset" : 2,
      "end_offset" : 5,
      "type" : "CN_WORD",
      "position" : 1
    },
    {
      "token" : "狂神说",
      "start_offset" : 5,
      "end_offset" : 8,
      "type" : "CN_WORD",
      "position" : 2
    },
    {
      "token" : "java",
      "start_offset" : 8,
      "end_offset" : 12,
      "type" : "ENGLISH",
      "position" : 3
    }
  ]
}
```

## 字段数据类型

​		字段数据类型 type 分为：字符串、数值型、日期类型、布尔类型、二进制类型等等（`ES 7.X 已经开始弃用 type 字段`）

1）字符串类型：text（支持分词，无长度限制）、keyword（不参与分词）

2）数值型：long、Integer、short、byte、double、float、half float**、**scaled float。

3）日期类型：date。

4）布尔类型：boolean。

5）二进制类型：binary。

# Restful 风格

​		Restful 风格是一种软件架构风格，而不是标准，只是提供了一组`设计原则和约束条件`。它主要用于客户端和服务器交互类的软件。基于这个风格设计的软件可以更简洁**，**更有层次**，**`更易于实现缓存`等机制。

1、基于 ES 的 restful 风格命令说明：

|      method      |                    url 地址                     |          描述          |
| :--------------: | :---------------------------------------------: | :--------------------: |
| PUT（创建,修改） |     localhost:9200/索引名称/类型名称/文档id     | 创建文档（指定文档id） |
|   POST（创建）   |        localhost:9200/索引名称/类型名称         | 创建文档（随机文档id） |
|   POST（修改）   | localhost:9200/索引名称/类型名称/文档id/_update |        修改文档        |
|  DELETE（删除）  |     localhost:9200/索引名称/类型名称/文档id     |        删除文档        |
|   GET（查询）    |     localhost:9200/索引名称/类型名称/文档id     |   查询文档通过文档ID   |
|   POST（查询）   | localhost:9200/索引名称/类型名称/文档id/_search |      查询所有数据      |

## 基础测试

​		以`创建一个索引`为例：使用 put 命令。

```json
// 创建索引 test1 为索引名，type1 为类型(未来会不存在)，1 为
POST /test1/type1/1
{
  "name": "蔡徐坤",
  "age": 18
}
```

> 如果发送请求显示超时：可能是内存设置的问题，找到 `jvm.options` 配置文件进行修改：
>
> ```options
> -Xms512m
> -Xmx512m
> ```

测试结果：

```json
#! Deprecation: [types removal] Specifying types in document index requests is deprecated, use the typeless endpoints instead (/{index}/_doc/{id}, /{index}/_doc, or /{index}/_create/{id}).
//上面的是 type 的弃用提醒
{
  "_index" : "test1",
  "_type" : "type1",
  "_id" : "1",
  "_version" : 1,
  "result" : "created",
  "_shards" : {
    "total" : 2,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 0,
  "_primary_term" : 1
}
```

检查 head 可视化数据：

![](https://pic1.imgdb.cn/item/6336f11516f2c2beb1c32993.png)

## 字段控制测试

​		测试：创建一个索引，不添加数据，但是创建`数据的类型约束规则`（使用 mappings）。====> 类似于 MySQL `创表`的操作

```json
// 创建索引设置字段类型
PUT /test2
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text"
      },
      "age": {
        "type": "long"
      },
      "birthday": {
        "type": "date"
      }
    }
  }
}
```

测试结果：

```json
{
  "acknowledged" : true,
  "shards_acknowledged" : true,
  "index" : "test2"
}
```

表示状态成功，检查 head 可视化，发现索引 test2 已创建，并且 test2 中没有文档数据。

那么如何获取 test2 的信息呢？

## 查询信息

获取 test2 的相关信息：

```json
// 获取 test2 信息
GET test2
```

```json
{
  "test2" : {
    "aliases" : { },
    "mappings" : {
      "properties" : {
        "age" : {
          "type" : "long"
        },
        "birthday" : {
          "type" : "date"
        },
        "name" : {
          "type" : "text"
        }
      }
    },
    "settings" : {
      "index" : {
        "creation_date" : "1654950785160",
        "number_of_shards" : "1",
        "number_of_replicas" : "1",
        "uuid" : "2oKebmiYTp2_QttcjaLWzg",
        "version" : {
          "created" : "7060199"
        },
        "provided_name" : "test2"
      }
    }
  }
}
```

那么默认的又是什么样的呢？（`由于 type 在ES 7.X 已经被弃用，在 ES 8.x 完全禁止使用，而是使用默认的 _doc 类型`）

因此，创建一个默认的索引以及结果：

![](https://pic1.imgdb.cn/item/6336f10516f2c2beb1c31869.png)

再通过 get 请求获取 test3 的相关信息：

![](https://pic1.imgdb.cn/item/6336f0f516f2c2beb1c30762.png)

发现 ES 默认配置的类型和之前手动指定的基本没有区别，就是 name 变成了 keyword。

同时，还可以通过 `_cat` 命令获取很多系统默认的配置信息和当前状况等。

![](https://pic1.imgdb.cn/item/6336f0e316f2c2beb1c2f420.png)

## 修改索引

​		修改文档有两种方式：

1）使用 put 覆盖原来的值，此种方法会`改变 version`，同时如果缺少某个字段，`该字段就会直接丢失`，状态变为 updated。

![](https://pic1.imgdb.cn/item/6336f0d116f2c2beb1c2e099.png)

> 注：此处 version=3 是由于操作了两次，表示此种方法覆盖一次，version 就会加1。

2）直接使用 post 的更新的方式，`version 仍会改变`，`不会丢失字段`。

![](https://pic1.imgdb.cn/item/6336f0c416f2c2beb1c2d517.png)

删除操作：直接使用 delete 命令。

```json
DELETE /test1
```

# 文档操作

## 基本操作

1、添加文档

![](https://pic1.imgdb.cn/item/6336f0b516f2c2beb1c2c469.png)

2、查询文档

![](https://pic1.imgdb.cn/item/6336f0a716f2c2beb1c2b555.png)

3、文档更新

![](https://pic1.imgdb.cn/item/6336f09a16f2c2beb1c2a514.png)

​		原本的方式修改在字段不完整时，会导致元数据的字段丢失，因此官方建议使用 `post _update` 操作：

![](https://pic1.imgdb.cn/item/6336f08b16f2c2beb1c292a9.png)

​		此种方式修改的结果会改变版本，但是可以随意修改某个字段，而不会造成字段的丢失。

4、搜索操作

1）简单搜索：

```json
GET /test/_doc/3
```

2）条件搜索：根据默认的映射规则，产生基本的查询。

![](https://pic1.imgdb.cn/item/6336f07a16f2c2beb1c27f16.png)

## 复杂搜索

> 未来如果查询出多条数据结果，则 score 就代表匹配度，匹配度越高分数越高。

1、基本查询：正常情况下，查询不会像上面那样写 q，而是会直接利用 json 带上整套参数。

```json
//上面的操作完整规范的命令应该为：查询url + 查询参数体
GET test/_doc/_search
{
  "query": {
    "match": {
      "name": "狂神"
    }
  }
}
```

![](https://pic1.imgdb.cn/item/6336f05616f2c2beb1c25717.png)

2、过滤结果：同时还可以对结果进行过滤，例如只需要 name 字段和 desc 字段：（例如MySQL 里面的 select name，desc）

```json
GET test/_doc/_search
{
  "query": {
    "match": {
      "name": "狂神说"
    }
  },
  "_source": ["name", "desc"]
}
```

3、排序查询：对结果进行排序，但是当手动设置排序后，结果的 score 分数就不会有了，为 null 。（此处以`降序排列`举例）

```json
GET test/_doc/_search
{
  "query": {
    "match": {
      "name": "狂神说"
    }
  },
  "sort": [
  {
    "age": {
      "order": "desc"
    }
  }
  ]
}
```

4、分页查询：from 表示从第几条数据开始，size 表示查询几条数据。（索引下标从 0 开始）

```json
GET test/_doc/_search
{
  "query": {
    "match": {
      "name": "狂神说"
    }
  },
  "sort": [
  {
    "age": {
      "order": "asc"
    }
  }
  ],
  "from": 0,
  "size": 1
}
```

5、布尔查询：可以增加匹配条件。

​		`must` 操作：相当于 and 连接，两个条件都得符合。

```json
GET test/_doc/_search
{
  "query": {
    "bool": {
      "must": [
      {
        "match":{
          "name": "狂神说"
        }
      },
      {
        "match": {
          "age": 18
        }
      }
      ]
    }
  }
}
```

​		`should` 操作：相当于 or 连接，符合一个即可。

```json
GET test/_doc/_search
{
  "query": {
    "bool": {
      "should": [
      {
        "match":{
          "name": "狂神说"
        }
      },
      {
        "match": {
          "age": 18
        }
      }
      ]
    }
  }
}
```

​		`must_not` 操作：相当于 not 操作，表示否认判断。

```json
GET test/_doc/_search
{
  "query": {
    "bool": {
      "must_not": [
      {
        "match": {
          "age": 18
        }
      }
      ]
    }
  }
}
```

6、某个字段匹配多个文本进行搜索：多个文字条件用空格隔开即可。结果还会有 score 参数。

```json
GET test/_doc/_search
{
  "query": {
    "match": {
      "tags": "女 花心"
    }
  }
}
```

## 过滤搜索

​		`gt` 表示大于，`gte` 表示大于等于，`lt` 表示小于，`lte` 表示小于等于。

```json
GET test/_doc/_search
{
  "query": {
    "bool": {
      "must": [
      {
        "match": {
          "name": "狂神"
        }
      }
     ],
     "filter": {
       "range":{
         "age": {
           "gte": 4,
           "lte": 16
         }
       }
     }
    }
  }
}
```

注：filter 操作不会影响得分，也就是说 filter 不会贡献得分。

## 精确查找

`term 查询`是直接通过倒排索引指定的词条进程精确查找。

关于分词查找：

1）term 直接查询`精确`的匹配。

2）match 查询会使用分词器解析。

> text 类型：会被分词器解析分词。
>
> `keyword 类型：不会被分词器解析分词`，会被当作整体。

## 高亮搜索

![](https://pic1.imgdb.cn/item/6336f05616f2c2beb1c25717.png)

​		搜索的相关结果会自动加一个 <em> 标签，同时也可以自定义高亮条件：

```json
GET test/_doc/_search
{
  "query": {
    "match": {
      "name": "狂神"
    }
  },
  "highlight": {
    "pre_tags": "<p class='key' style='color:red'>",
    "post_tags": "</p>",
    "fields": {
      "name": {}
    }
  }
}
```

![](https://pic1.imgdb.cn/item/6336f04a16f2c2beb1c24a52.png)

# SpringBoot 集成 ES

## 索引操作

​		翻看官方文档，发现支持的客户端有：`Java REST Client`、Java API 等，但 Java REST Client 是推荐使用的，同时一般使用里面的高级 API 方式。

> 查看源码发现，ES 的自动引入版本为 7.17.3，同时引入的客户端也版本和本地的不对应，需要修改：
>
> ![](https://pic1.imgdb.cn/item/6336f03516f2c2beb1c233a0.png)

1、编写一个配置类，es-client 对象注入：

```java
// ES 的相关配置
@Configuration
public class ElasticSearchClientConfig {

    @Bean
    public RestHighLevelClient restHighLevelClient(){
        RestHighLevelClient client = new RestHighLevelClient(
                RestClient.builder(
                        new HttpHost("127.0.0.1", 9200, "http")));
        return client;
    }
}
```

2、测试使用 client 创建索引。`CreateIndexRequest` 对象

```java
SpringBootTest
class EsApplicationTests {

    @Autowired
    private RestHighLevelClient restHighLevelClient;

    @Test
    void contextLoads() throws IOException {
        //所有的请求都是通过 Request 创建
        //1、创建索引请求
        CreateIndexRequest indexRequest = new CreateIndexRequest("gaozheng01");
        //2、执行请求
        IndicesClient indices = restHighLevelClient.indices();
        CreateIndexResponse indexResponse =
                indices.create(indexRequest, RequestOptions.DEFAULT);   //使用默认的请求的参数
        System.out.println("indexResponse = " + indexResponse);
        restHighLevelClient.close();
    }
}
```

结果返回：

```cmd
indexResponse = org.elasticsearch.client.indices.CreateIndexResponse@6f23a31b
```

同时再通过 head 客户端查看，发现 gaozheng01 索引已经成功创建。

3、测试获取索引是否存在。`GetIndexRequest` 对象

```java
@Test
void getIndexExist() throws IOException {
    GetIndexRequest indexRequest = new GetIndexRequest("gaozheng01");
    boolean exists = restHighLevelClient.indices().exists(indexRequest, RequestOptions.DEFAULT);
    System.out.println(exists);
    restHighLevelClient.close();
}
```

​		返回结果：true，表示存在。

4、删除索引。`DeleteIndexRequest` 对象

```java
@Test
void deleteIndexExist() throws IOException {
    DeleteIndexRequest indexRequest = new DeleteIndexRequest("gaozheng01");
    //删除后的返回对象 AcknowledgedResponse
    AcknowledgedResponse delete = restHighLevelClient.indices().delete(indexRequest, RequestOptions.DEFAULT);
    System.out.println(delete.isAcknowledged());
    restHighLevelClient.close();
}
```

> 此方法在 2.7.0 版本的 SpringBoot 测试中报错：由于 DeleteIndexRequest 需要一个 builder 参数，暂未解决。将 springboot 版本切换到了 `2.2.6.RELEASE`
>

​		返回结果 true，表示删除成功。

## 文档操作

1、创建文档。

1）先创建实体类：User

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String username;
    private int age;
}
```

​		由于需要将插入的文档转成 json 格式，因此还需要引入依赖：`fastjson`。

2）测试添加文档记录：`IndexRequest` 对象

```java
@Test
void addDocument() throws IOException {
    User user = new User("蔡徐坤", 28);
    IndexRequest indexRequest = new IndexRequest("test");
    //之前的请求：put /index/_doc/id
    indexRequest.id("1");
    indexRequest.timeout("1s");
    indexRequest.source(JSON.toJSONString(user), XContentType.JSON);
    IndexResponse indexResponse = restHighLevelClient.index(indexRequest, RequestOptions.DEFAULT);
    String response = indexResponse.toString();
    System.out.println(response);
    System.out.println("响应状态码：" + indexResponse.status());
    restHighLevelClient.close();
}
```

​	测试结果：发现响应就是之前在 kibana 控制台的响应信息，响应状态是 `CREATED`。

```cmd
IndexResponse[index=test,type=_doc,id=1,version=1,result=created,seqNo=0,primaryTerm=1,shards={"total":2,"successful":1,"failed":0}]
响应状态：CREATED
```

2、判断文档是否存在。`GetRequest` 对象

```java
@Test
void getDocumentExist() throws IOException {
    GetRequest getRequest = new GetRequest("test", "1");
    //设置不获取返回的 _source 的上下文
    getRequest.fetchSourceContext(new FetchSourceContext(false));
    getRequest.storedFields("_none_");
    boolean exists = restHighLevelClient.exists(getRequest, RequestOptions.DEFAULT);
    System.out.println(exists);
    restHighLevelClient.close();
}
```

​		返回结果 true，表示 id 为 1 的文档存在。

3、获取文档信息。`GetRequest` 对象

```java
@Test
void getDocument() throws IOException {
    GetRequest getRequest = new GetRequest("test", "1");
    GetResponse response = restHighLevelClient.get(getRequest, RequestOptions.DEFAULT);
    String source = response.getSourceAsString();
    System.out.println(response.toString());
    System.out.println(source);
    restHighLevelClient.close();
}
```

​		测试结果：

```cmd
{
	"_index":"test",
	"_type":"_doc",
	"_id":"1",
	"_version":1,
	"_seq_no":1,
	"_primary_term":1,
	"found":true,
	"_source":{
		"age":28,
		"username":"蔡徐坤"
	}
}
{"age":28,"username":"蔡徐坤"}
```

4、更新文档记录。`UpdateRequest` 对象

```java
@Test
void updateDocument() throws IOException {
    UpdateRequest updateRequest = new UpdateRequest("test", "1");
    updateRequest.timeout("1s");
    User user = new User("IKUN", 999);
    String jsonUser = JSON.toJSONString(user);
    // 通过 kibana 命令知道更新操作里面有个 doc 属性，用来存放新的信息
    updateRequest.doc(jsonUser, XContentType.JSON);
    UpdateResponse response = restHighLevelClient.update(updateRequest, RequestOptions.DEFAULT);
    System.out.println(response.status());
    System.out.println(response.toString());
    restHighLevelClient.close();
}
```

​		结果为：result 为 updated。

```cmd
OK
UpdateResponse[index=test,type=_doc,id=1,version=2,seqNo=2,primaryTerm=1,result=updated,shards=ShardInfo{total=2, successful=1, failures=[]}]
```

5、删除文档记录。`DeleteRequest` 对象

```java
@Test
void deleteDocument() throws IOException {
    DeleteRequest deleteRequest = new DeleteRequest("test", "1");
    DeleteResponse response = restHighLevelClient.delete(deleteRequest, RequestOptions.DEFAULT);
    System.out.println(response.status());
}
```

​		结果测试为 OK，检查 head 可视化，发现确实被删除。（删除不存在的时候会显示 Not Found）

## 批量处理

​		批量处理使用 `BulkRequest` 批处理对象。

1、批量插入数据：

​		实际实践中，数据来自于消息队列、MQ、前端等场景，数据不可能一条一条的进行插入，必须实现`批量插入`。

```java
@Test
void insertBatchDocuments() throws IOException {
    // BulkRequest 批处理请求
    BulkRequest bulkRequest = new BulkRequest("test");
    bulkRequest.timeout("10s");
    List<User> users = new ArrayList<>();
    users.add(new User("张三", 10));
    users.add(new User("李四", 20));
    users.add(new User("王五", 30));
    users.add(new User("赵六", 40));
    users.add(new User("田七", 50));
    for (int i = 0; i < users.size(); i++) {
        bulkRequest.add(
            new IndexRequest("test")
            .id((i+1) + "")
            .source(JSON.toJSONString(users.get(i)), XContentType.JSON));
    }
    BulkResponse response = restHighLevelClient.bulk(bulkRequest, RequestOptions.DEFAULT);
    System.out.println(response.status());
    System.out.println(response.hasFailures());
    restHighLevelClient.close();
}
```

​		测试结果：Ok 和 false(表示未失败)，检查 head 可视化，发现插入成功。

> 当不设置 id 时，会自动加入随机的 id 设置。

2、其他批量操作和批量插入一样，使用 `BulkRequest` 批处理对象，区别只是在于 `bulkRequest.add` 方法内部使用的是哪个 `XXXRequest` 进行操作。

## 搜索操作

​		测试一些搜索的操作：搜索请求采用 `SearchRequest` 对象，搜索条件封装采用 `SearchSourceBuilder` 对象，需要传递一个 `QueryBuilder` 对象作为参数，而就是在这个对象内设置匹配的条件，同时 `SearchSourceBuilder` 对象也支持也进行分页等等操作。

```java
@Test
void search() throws IOException {
    //搜索请求对象 SearchRequest
    SearchRequest searchRequest = new SearchRequest("test");

    //构建搜索条件对象
    SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
    // QueryBuilders 是一个 QueryBuilder 的工具类
    //查询条件设置,此处使用精确查询
    TermQueryBuilder termQueryBuilder =
        QueryBuilders.termQuery("age", "50");
    // QueryBuilders.matchAllQuery() 表示匹配所有

    // query 需要一个 QueryBuilder 查找对象参数
    searchSourceBuilder.query(termQueryBuilder);
    searchSourceBuilder.timeout(new TimeValue(60, TimeUnit.SECONDS));
    //构建分页,from 默认为 -1，size 默认为 -1，表示查询所有
    searchSourceBuilder.from(0).size(1);

    // 向请求对象中装入搜索条件
    searchRequest.source(searchSourceBuilder);

    // 发起 rest 请求
    SearchResponse searchResponse = restHighLevelClient.search(searchRequest, RequestOptions.DEFAULT);
    System.out.println("请求状态：" + searchResponse.status());
    SearchHits hits = searchResponse.getHits();//此处对应之前的 kibana 查询时的 hits 内容
    System.out.println(JSON.toJSONString(hits));
    System.out.println("=================================================");
    System.out.println("查询数据条数：" + hits.getTotalHits());
    System.out.println("=================================================");
    for (SearchHit hit : hits.getHits()) {
        System.out.println(hit.getSourceAsMap());
    }
}
```

​		测试结果：

```cmd
请求状态：OK
{"fragment":true,"hits":[{"fields":{},"fragment":false,"highlightFields":{},"id":"5","matchedQueries":[],"primaryTerm":0,"rawSortValues":[],"score":1.0,"seqNo":-2,"sortValues":[],"sourceAsMap":{"age":50,"username":"田七"},"sourceAsString":"{\"age\":50,\"username\":\"田七\"}","sourceRef":{"fragment":true},"type":"_doc","version":-1}],"maxScore":1.0,"totalHits":{"relation":"EQUAL_TO","value":1}}
=================================================
查询数据条数：1 hits
=================================================
{age=50, username=田七}
```

> 需要注意的是：此处的 `QueryBuilders 对象` 当传递中文作为条件时，无法正常匹配

当需要设置高亮时，要使用 searchSourceBuilder 对象，同时需要传递一个高亮设置的构建对象 HighlightBuilder 进行高亮设置。

```java
searchSourceBuilder.highlighter(new HighlightBuilder());
```

# 京东实战

​		搭建 SpringBoot 项目，修改版本为 `2.2.6.RELEASE` ，同时将 elasticsearch 版本也修改为本地的对应版本，引入 web 和 Thymeleaf 模块依赖。

​		项目采用半前后端分离的模式，使用 Thymeleaf 作为模板引擎。

1、编写配置文件，关闭 Thymeleaf 缓存：

```properties
# 关闭 thymeleaf 缓存
spring.thymeleaf.cache=false
```

2、导入静态页面 Html 等。

3、编写 controller 项目的页面访问。

```java
@Controller
public class IndexController {

    @GetMapping({"/", "/index"})
    public String index(){
        return "index";
    }
}
```

​		测试结果：正常展示首页。

## 数据爬虫

​		数据问题是首当其冲的问题，数据可以从 数据库、消息队列等中获取，但是此处使用 Jsoup 从京东网页爬取。

​		京东官网查找：java，发现 url 实际上就是 `https://search.jd.com/Search?keyword=java`，那么想获取页面的数据，就是`从请求返回的页面信息中筛选出想要的数据`即可。 ======> `Jsoup 解析网页`（不能解析音乐和视频）

1、引入 Jsoup 依赖：

```xml
<dependency>
    <groupId>org.jsoup</groupId>
    <artifactId>jsoup</artifactId>
    <version>1.10.2</version>
</dependency>
```

2、编写解析网页的工具类：

1）测试获取数据文本的整体元素

```java
public class HtmlParseUtils {
    public static void main(String[] args) throws IOException {
        // 获取请求：https://search.jd.com/Search?keyword=java，注意需要在联网环境下，且无法获取 ajax 请求数据
        String uri = "https://search.jd.com/Search?keyword=java";
        URL url = new URL(uri);
        //解析网页,这里的返回值 document，就是前端浏览器的 Document 对象，因此所有之前在 js 中可以使用的方法在这里都能使用
        Document document = Jsoup.parse(url, 30000);
        //F12 开启审查元素，寻找商品信息的 div，发现是 J_goodsList
        Element element = document.getElementById("J_goodsList");
        System.out.println(element.html());     //发现直接获取到了这个 div 里面的页面包括数据
    }
}
```

​		此时打印结果发现，获取到了这个 div 里面的所有页面标签，包括数据信息。这个时候就需要获取里面每个 `li 标签的数据`，这就是具体商品的信息。

![](https://pic1.imgdb.cn/item/6336f02116f2c2beb1c21eb8.png)

2）完整的工具类：

​		封装一个用于商品信息的实体类：Content

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Content {
    private String title;
    private String img;
    private String price;
    private String shopName;
}
```

​		工具类：

```java
@Component
public class HtmlParseUtils {
    public static List<Content> parseJD(String keywords) throws IOException {
        // 获取请求：https://search.jd.com/Search?keyword=java，注意需要在联网环境下，且无法获取 ajax 请求数据
        String uri = "https://search.jd.com/Search?keyword=" + keywords;
        URL url = new URL(uri);
        //解析网页,这里的返回值 document，就是前端浏览器的 Document 对象，因此所有之前在 js 中可以使用的方法在这里都能使用
        Document document = Jsoup.parse(url, 30000);
        //F12 开启审查元素，寻找商品信息的 div，发现是 J_goodsList
        Element element_div = document.getElementById("J_goodsList");
        //获取所有的 li 标签元素
        Elements elements = element_div.getElementsByTag("li");
        //结果集
        List<Content> goodList = new ArrayList<>();
        //循环获取每一个 li 标签里面的数据
        for (Element element : elements) {
            if (!element.attr("class").equalsIgnoreCase("ps-item")) {
                //根据审查该 li 下面的元素，主要包括几个div，每个div里面包含商品的部分信息
                //直接用 src 标签是获取不到的，由于页面上的图片都是延迟加载的（懒加载），很多企业都在使用，使页面响应速度更快
                //再次检查发现还有个属性：data-lazy-img，是存放在这个属性里面的
                String img = element.getElementsByTag("img").eq(0).attr("data-lazy-img");
                String price = element.getElementsByClass("p-price").eq(0).text();
                String title = element.getElementsByClass("p-name").eq(0).text();
                String shopName = element.getElementsByClass("p-shopnum").eq(0).text();
                goodList.add(new Content(title, img, price, shopName));
            }
        }
        return goodList;
    }
}
```

进行测试：

```java
public static void main(String[] args) throws IOException {
    List<Content> contents = HtmlParseUtils.parseJD("分布式");
    for (Content content : contents) {
        System.out.println(content);
    }
}
```

测试结果，表示此工具类已经准备完毕。

```cmd
Content(title=领势LINKSYS VELOP MX8400 5G三频WIFI6无线千兆分布式路由器 全屋WiFi覆盖 /Mesh组网 【MX4200两只装】, img=//img12.360buyimg.com/n1/s200x200_jfs/t1/177721/4/25506/160471/629f28bdE72a0548e/4dcfb0e47c26da6e.jpg, price=￥2499.00, shopName=领势网络京东自营官方旗舰店)
Content(title=架构设计2.0：大型分布式系统架构方法论与实践(博文视点出品) 大型系统架构设计方法论全新呈现|大型互联网公司案例实战全新解读　单册100册以上团购电话4006186622, img=//img10.360buyimg.com/n1/s200x200_jfs/t1/128734/17/21559/233074/61d86967Eaf111c2c/9a3244031a8c822e.jpg, price=￥104.80, shopName=电子工业出版社)
............
Content(title=分布式系统架构：技术栈详解与快速进阶 资深专家多年经验总结，从前后端高效交互、网络传输、负载均衡、高并发、高可用等9个维度讲解分布式架构技术栈　团购电话4006186622, img=//img12.360buyimg.com/n1/s200x200_jfs/t1/137554/4/2925/278688/5ef1d123Ecf16bd76/033ae4b86418edee.jpg, price=￥88.80, shopName=机械工业出版社自营官方旗舰店)

Process finished with exit code 0
```

## 业务实现

1、编写 es 的配置类 ElasticSearchClientConfig，和上面一样。

2、编写业务：ContentServiceImpl 实现，需要先创建好索引 jd_goods。

1）ContentService：

```java
public interface ContentService {
    //解析页面数据放入 es 索引
    Boolean parseContent(String keyWords);

    //通过关键词获取数据
    List<Map<String, Object>> searchPage(String keyword, int pageNo, int pageSize);
}
```

2）ContentServiceImpl 实现：

```java
@Service
public class ContentServiceImpl implements ContentService{

    @Autowired
    private RestHighLevelClient restHighLevelClient;

    //解析页面数据放入 es 索引
    @Override
    public Boolean parseContent(String keyWords) {
        BulkResponse bulkResponse = null;
        List<Content> contents = null;
        try {
            contents = HtmlParseUtils.parseJD(keyWords);
        } catch (IOException e) {
            System.out.println("解析数据出现问题!");
            e.printStackTrace();
        }

        // 批量插入数据
        BulkRequest bulkRequest = new BulkRequest();
        bulkRequest.timeout("2m");
        for (int i = 0; i < contents.size(); i++) {
            String jsonContent = JSON.toJSONString(contents.get(i));
            IndexRequest source = new IndexRequest("jd_goods").source(jsonContent, XContentType.JSON);
            bulkRequest.add(source);
        }
        try {
            bulkResponse = restHighLevelClient.bulk(bulkRequest, RequestOptions.DEFAULT);
        } catch (IOException e) {
            System.out.println("数据插入 ES 过程出现问题!");
            e.printStackTrace();
        }
        return !bulkResponse.hasFailures();
    }

    //通过关键词获取数据
    @Override
    public List<Map<String, Object>> searchPage(String keyword, int pageNo, int pageSize) {
        if (pageNo <= 1) pageNo = 1;
        //条件搜索
        SearchRequest searchRequest = new SearchRequest("jd_goods");
        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
        //使用精准匹配的方式:通过 title 来精准匹配
        TermQueryBuilder termQueryBuilder = QueryBuilders.termQuery("title", keyword);
        sourceBuilder.query(termQueryBuilder);
        sourceBuilder.timeout(new TimeValue(60, TimeUnit.SECONDS));
        //分页
        sourceBuilder.from(pageNo).size(pageSize);
        searchRequest.source(sourceBuilder);
        SearchResponse searchResponse = null;
        try {
            searchResponse = restHighLevelClient.search(searchRequest, RequestOptions.DEFAULT);
        } catch (IOException e) {
            e.printStackTrace();
        }
        //解析结果进行封装
        List<Map<String, Object>> list = new ArrayList<>();
        SearchHit[] hits = searchResponse.getHits().getHits();
        for (SearchHit hit : hits) {
            list.add(hit.getSourceAsMap());
        }
        return list;
    }
}
```

3、测试将京东官方页面解析加载进 ES，同时使用浏览器请求测试查询：

![](https://pic1.imgdb.cn/item/6336f01116f2c2beb1c20d0a.png)

​		查询正常，检查 ES head 发现数据已经装入其中。

​		前端页面使用 vue 渲染，因此需要导入 `vue.min.js 和 axios.js`，放入 `/static/js/` 目录。导入 Vue 后就可以使用 vue 的语法进行遍历将数据进行显示。

## 高亮设置

​		高亮设置需要在原先的业务代码中进行修改，增添高亮的设置。（同时将代码稍微改造，从 ES 查询之前会将数据再爬取一次，但是`未做重复判断`）

```java
@Service
public class ContentServiceImpl implements ContentService{

    @Autowired
    private RestHighLevelClient restHighLevelClient;

    //解析页面数据放入 es 索引
    public Boolean parseContent(String keyWords) {
        BulkResponse bulkResponse = null;
        List<Content> contents = null;
        try {
            contents = HtmlParseUtils.parseJD(keyWords);
        } catch (IOException e) {
            System.out.println("解析数据出现问题!");
            e.printStackTrace();
        }

        // 批量插入数据
        BulkRequest bulkRequest = new BulkRequest();
        bulkRequest.timeout("2m");
        for (int i = 0; i < contents.size(); i++) {
            String jsonContent = JSON.toJSONString(contents.get(i));
            IndexRequest source = new IndexRequest("jd_goods").source(jsonContent, XContentType.JSON);
            bulkRequest.add(source);
        }
        try {
            bulkResponse = restHighLevelClient.bulk(bulkRequest, RequestOptions.DEFAULT);
        } catch (IOException e) {
            System.out.println("数据插入 ES 过程出现问题!");
            e.printStackTrace();
        }
        return !bulkResponse.hasFailures();
    }

    //通过关键词获取数据
    @Override
    public List<Map<String, Object>> searchPage(String keyword, int pageNo, int pageSize) {
        //同步将数据存入 es
        parseContent(keyword);
        if (pageNo <= 1) pageNo = 1;
        //条件搜索
        SearchRequest searchRequest = new SearchRequest("jd_goods");
        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
        //使用精准匹配的方式:通过 title 来精准匹配
        TermQueryBuilder termQueryBuilder = QueryBuilders.termQuery("title", keyword);
        sourceBuilder.query(termQueryBuilder);
        sourceBuilder.timeout(new TimeValue(60, TimeUnit.SECONDS));
        //分页
        sourceBuilder.from(pageNo).size(pageSize);
        searchRequest.source(sourceBuilder);

        //高亮构建者
        HighlightBuilder highlightBuilder = new HighlightBuilder();
        //高亮的相关设置
        highlightBuilder.requireFieldMatch(true);
        highlightBuilder.field("title").preTags("<span style='color:red'>").postTags("</span>");
        //如果出现多个，设置只有第一个高亮,关闭多个高亮显示
        sourceBuilder.highlighter(highlightBuilder);

        SearchResponse searchResponse = null;
        try {
            searchResponse = restHighLevelClient.search(searchRequest, RequestOptions.DEFAULT);
        } catch (IOException e) {
            e.printStackTrace();
        }
        //解析结果进行封装
        List<Map<String, Object>> list = new ArrayList<>();
        SearchHit[] hits = searchResponse.getHits().getHits();
        for (SearchHit hit : hits) {
            //解析高亮的字段，将原来的字段换成我们高亮的字段(由于 title 高亮部分是单独的一块数据：hit.highlight.title 才是高亮的 title 字符串)
            Map<String, HighlightField> highlightFields = hit.getHighlightFields();
            HighlightField title = highlightFields.get("title");
            Map<String, Object> sourceAsMap = hit.getSourceAsMap(); //原来的结果
            if (title != null){
                Text[] fragments = title.fragments();
                String n_title = "";
                for (Text text : fragments) {
                    n_title += text;
                }
                sourceAsMap.put("title", n_title);  //替换原来的内容
            }
            list.add(sourceAsMap);
        }
        return list;
    }
}
```

页面显示：实现查询商品并能够高亮显示关键字。

![](https://pic1.imgdb.cn/item/6336f00216f2c2beb1c1fcd2.png)

