---
title: Influxdb 数据库基础
date: 2021-05-20 00:00:00
type:
comments:
tags: 
  - 数据库
  - Influxdb
categories: 
  - 数据库技术
description: 
keywords: Influxdb
cover: https://w.wallhaven.cc/full/x6/wallhaven-x6567z.jpg
top_img: https://w.wallhaven.cc/full/x6/wallhaven-x6567z.jpg
---

## influxdb简介

​		`InfluxDB`是一个用于存储和分析时间序列数据的开源数据库。InfluxDB 作为优秀的时序数据之一，其中集成了大量的功能，包括数据采集的 Telegraf 以及数据分析的 Kapacitor。也通过 HTTP 提供了大量的API，以供使用代码的方式去操作 InfluxDB。

`[特点]`	开源分布式时序、事件和指标数据库，无需外部依赖。

### 数据库名词

> `database`：数据库
>
> `measurement`：传统数据库中的表
>
> `points`：表里面的每一行数据，相当于传统数据库里的一行数据，由时间戳（time）、数据（field）、标签（tags）组成。
>
> ​		`time`：主索引。添加数据时，如果未插入time值，会自动生成当前事件戳。
>
> ​		`tags`：标签。用于给一条数据一个属性，可以用于检索时作为索引。
>
> ​		`field`：字段。具体的字段名。

## influxdb安装

`influxdb` 数据库一般是在linux系统中进行使用，比如云服务器、虚拟机等linux系统场景。

> 以阿里云服务器搭载`centos 7.9` 系统为例进行`influxdb 1.8` 数据库的搭建！使用 wget 工具下载influxdb的rpm包

1、进入/usr/local 目录

```shell
cd /usr/local
```

2、下载 InfluxDB依赖包。

​		方式一：云服务器直接使用 wget 工具下载 Influxdb 的rpm包。

```shell
wget https://dl.influxdata.com/influxdb/releases/influxdb-1.8.2.x86_64.rpm
```

​		方式二：本地下载好依赖包后，而后借助 `XFTP`或 `Winscp `放入云服务器目录。

```txt
# 本地下载直接使用 http 下载，地址栏输入 
https://dl.influxdata.com/influxdb/releases/influxdb-1.8.2.x86_64.rpm
浏览器直接会下载好安装包（此种方法速度快）。
```

3、使用 yum 命令进行influxdb的安装。

```shell
yum localinstall influxdb-1.8.0.x86_64.rpm
```

4、修改influxdb.conf配置文件(`可选`)

​		因为监控的数据量一般会比较大，所以相关数据的目录一般需要调整至空间比较大的目录。安装后默认的配置文件在`/etc/influxdb/influxdb.conf`，进入修改`[meta]下dir`目录、`[meta]下dir`目录、`[meta]下wal-dir`目录。

```shell
[meta]
  dir = "/data/influxdb/meta"
```

```shell
[data]
  dir = "/data/influxdb/data"
  ......
  wal-dir = "/data/influxdb/wal"
```

5、启动服务

```shell
systemctl start influxdb
```

6、检查 InfluxDB服务启动状态。

```shell
# 检查 influxdb启动状态
systemctl status influxdb  # 或 systemctl status influxd
# 检查所有服务启动状态
ps auxw
```

![Influxdb数据库服务状态](https://pic1.imgdb.cn/item/6337c16b16f2c2beb1746c3f.png)

## influxdb基本使用

### 权限初始化		

​		最初使用 influxdb 数据库时，并不会自带用户认证的功能，对于这种不设置防备的措施，总体来说，不是很好。

因此，需要一个登录用户来进行数据库的管理。

```shell
# 进入influxdb cli客户端
influx
# 显示用户
SHOW USERS

# 创建用户
CREATE USER <username> WITH PASSWORD '<password>'

# 赋予用户管理员权限
GRANT ALL PRIVILEGES TO username

# 创建用户同时赋予 admin 权限
CREATE USER <username> WITH PASSWORD '<password>' WITH ALL PRIVILEGES
# 举例：create user root with password '123456'with all privileges

# 修改用户密码
SET PASSWORD FOR username = 'password'

# 撤消权限
REVOKE ALL ON mydb FROM username

# 查看权限
SHOW GRANTS FOR username

# 删除用户
DROP USER "username"
```

### 基本使用

#### 1、数据库操作

> 针对数据库的操作

```shell
# 查看数据库列表
show databases;

# 创建数据库
create database mydb;

# 使用数据库，使用具体的表时，需要先使用数据库才行
use mydb;

# 删除数据库
drop database mydb;
```

#### 2、数据表操作： 

> 针对 `Measurement `的操作。
>
> `Measurement`相当于传统数据库中的 table 表，时间数据 `time`、`Tag`、`Field` 组合成了 `Measurement`
>
> **注**：influxdb没有创建数据库的说法，需要创建数据库直接使用`insert`插入数据即可创建对应表名。
>
> **注**：`InfluxDB` 没有对 `measurement` 的**修改**操作。

```shell
# 创建一个表名为 cpu， tags为host和region，表数据为vale=0.01的 measurement
insert cpu,host=serverA,region=china value=0.01
```

#### 3、数据查询操作：

> 针对具体的数据查询。

```shell
# 查询表名为 cpu 的所有数据（ tz 设置查询时区为Asia/Shanghai）
select * from cpu tz('Asia/Shanghai');
```

#### 4、series 操作

```shell
show series from <数据库名>
```

#### 5、基本操作演示

```shell
# 进入 influxdb 客户端 
# 方式一：带上认证信息
influx [-host 127.0.0.1] [-port 8086] -username test -password 123456
# 方式二：不带认证信息，进入后进行验证
influx [-host 127.0.0.1] [-port 8086] 
> auth 
username: test
password: 123456 	# 注意此处密码为输入不可见

# 显示所有数据库
show databases;
# 查询结果
> show databases;
name: databases
name
----
_internal
testProxy

# 使用具体数据库
use testProxy
# 查询结果
> use testProxy
Using database testProxy

# 查询所有数据表
show measurements;
# 查询结果
> show measurements
name: measurements
name
----
postmanProxy
postmanProxy2

# 查询具体数据
select * from postmanProxy tz('Asia/Shanghai');
# 查询结果
> select * from postmanProxy tz('Asia/Shanghai');
name: postmanProxy
time                sensor_id  value valueH valueL
----                ---------  ----- ------ ------
1638335173159472640 FSFX111111 10           
1638336937418488971 ND000101         0.01   0.01

# 插入数据
insert postmanProxy,sensor_id=ACC111000 value=100,valueH=100,valueL=1
# 查询插入结果
> select * from postmanProxy tz('Asia/Shanghai');
name: postmanProxy
time                sensor_id  value valueH valueL
----                ---------  ----- ------ ------
1638335173159472640 FSFX111111 10           
1638336937418488971 ND000101         0.01   0.01
1638345139880923037 ACC111000  100   100    1

# 查询所有 series
show series from postmanProxy
# 查询结果
> show series from postmanProxy
key
---
postmanProxy,sensor_id=ACC111000
postmanProxy,sensor_id=FSFX111111
postmanProxy,sensor_id=ND000101
```

#### 6、常用高级操作

## influxdb的HTTP操作

> **注**：查询语句后面可以加 `pretty=true` 增加查询结果的显示直观性(json格式)。
>
> **举例**：`curl http://127.0.0.1:8086/query?pretty=true --data-urlencode "q=show databases"`
>
> HTTP请求是InfluxDB中存在的一个API，提供很多的方式，以便开发者通过代码去操作这个数据库。但是HTTP请求并不是默认开启，而且<span style="color:green;">即使手动开启了InfluxDB的HTTP请求，假如数据库中没有`设置用户`，依旧是没有办法利用HTTP请求来连接数据库的。</span>
>
> 1、创建用户并设置权限；
>
> ```shell
> create user admin with password '123456' with all privileges
> ```
>
> 2、开启HTTP认证
>
> ​		InfluxDB数据库的配置文件在`etc\influxdb\inlfuxdb.conf`，打开之后，找到`HTTP`节点，修改如下：
>
> ```conf
> [http]  
>   enabled = true  
>   bind-address = ":8086"  
>   auth-enabled = true
>   log-enabled = true  
>   write-tracing = false  
>   pprof-enabled = false  
>   https-enabled = false  
>   https-certificate = "/etc/ssl/influxdb.pem"
> ```
>
> 此时就可以通过端口`8086`连接到数据库了。
>
> 但是会出现一个问题：<span style="color:green;">因为Kapacitor是依赖于InfluxDB，假如InfluxDB是开启了认证的话，就需要去Kapacitor中配置好InfluxDB，否则Kapacitor服务是无法启动的。</span>
>
> 配置文件的位置是在`etc\kapacitor\kapacitor.conf`，找到`InfluxDB`节点，然后修改如下：
>
> ```conf
> [[influxdb]]
>   # Connect to an InfluxDB cluster
>   # Kapacitor can subscribe, query and write to this cluster.
>   # Using InfluxDB is not required and can be disabled.
>   enabled = true
>   default = true
>   name = "localhost"
>   urls = ["http://localhost:8086"]
>   username = "ph"
>   password = "123456"
>   timeout = 0
> 
> ```
>
> 然后重启两个服务：
>
> ```shell
> //重启influxd服务
> systemctl restart influxd
> //重启kapacitor服务
> systemctl restart kapacitor
> //查看服务的状态
> systemctl status influxd
> systemctl status kapacitor
> ```
>
> 此时所有的环境就已经具备了。

### API数据库操作

#### 查询所有库

```shell
# 查询所有库,注意此处 http 的引号不能少
curl "http://127.0.0.1:8086/query?u=test&p=123456" --data-urlencode "q=show databases"

# 返回结果
{"results":[{"statement_id":0,"series":[{"name":"databases","columns":["name"],"values":[[["postmanProxy"],["postmanProxy2"]]}]}]}
```

#### 新建数据库

```shell
curl -X POST 'http://127.0.0.1:8086/query?u=test&p=123456' --data-urlencode 'q=CREATE DATABASE "mydb"'

# 返回结果
{"results":[{"statement_id":0}]}
```

### API读数据操作

> 使用 HTTP API 进行查询是比较初级的一种方式，不推荐使用。
>
> 推荐使用第三方语言库和客户端管理程序进行查询操作。

```shell
curl -G 'http://127.0.0.1:8086/query?db=testProxy&u=test&p=123456' --data-urlencode 'q=SELECT * FROM "postmanProxy"'

# 返回结果
{"results":[{"statement_id":0,"series":[{"name":"postmanProxy","columns"：["time","sensor_id","value","valueH","valueL"],"values":[["2021-12-01T05:06:13.15947264Z","FSFX111111",10,null,null],["2021-12-01T05:35:37.418488971Z","ND000101",null,0.01,0.01],["2021-12-01T07:52:19.880923037Z","ACC111000",100,100,1]]}]}]}
```

### API写数据操作

> 在使用HTTP 写入数据 API 时，InfluxDB的响应主要有以下几个：
>
> 1）`2xx`：
>
> ​			204代表no content;
>
> ​			200代表InfluxDB可以接收请求但是没有完成请求。一般会在body体中带有出错信息。
>
> 2）`4xx`：InfluxDB不能解析请求。
>
> 3）`5xx`：系统出现错误。

```shell
curl -i -X POST "http://127.0.0.1:8086/write?db=testProxy&u=test&p=123456" --data-binary 'postmanProxy2,mytag=1 myfield=90'

# 返回响应
HTTP/1.1 204 No Content
X-Influxdb-Version: 2.5.7
Date: Wed, 01 Dec 2021 08:34:43 GMT

# 查询数据表情况
# 查询 http 语句
curl -G 'http://127.0.0.1:8086/query?db=testProxy&u=test&p=123456' --data-urlencode 'q=SELECT * FROM "postmanProxy2"'
# 查询结果
{"results":[{"statement_id":0,"series":[{"name":"postmanProxy2","columns":["time","myfield","mytag","sensor_id","value","valueH","valueL"],"values":[["2021-12-01T05:58:02.49135094Z",null,null,"WSD000101",1000,100,0.01],["2021-12-01T08:34:43.078706002Z",90,"1",null,null,null,null]]}]}]}
```

## influxdb的postman测试

### 数据库测试

#### 1、查询数据库

- 查询方式：GET

- 查询请求：http://x.x.x.x:7076/`query`

- 参数：

  | 参数名 |     参数值     |     参数意义      |
  | :----: | :------------: | :---------------: |
  |   u    |      test      |   influx用户名    |
  |   p    |     123456     |  influx用户密码   |
  |   q    | show databases | influx查询sql语句 |
  | pretty |      true      |   json格式设置    |

#### 2、创建数据库

#### 1、查询数据库

- 查询方式：POST

- 查询请求：http://x.x.x.x:7076/`query`

- 参数：

  | 参数名 |            参数值             |     参数意义      |
  | :----: | :---------------------------: | :---------------: |
  |   u    |             test              |   influx用户名    |
  |   p    |            123456             |  influx用户密码   |
  |   q    | create database postmanTestDb | influx创库sql语句 |
  | pretty |             true              |   json格式设置    |

### 读数据测试

- 查询方式：GET

- 查询请求：http://x.x.x.x:7076/`query`

- 参数：

  | 参数名 |           参数值           |     参数意义      |
  | :----: | :------------------------: | :---------------: |
  |   db   |         testProxy          |     数据库名      |
  |   u    |            test            |   influx用户名    |
  |   p    |           123456           |  influx用户密码   |
  |   q    | select * from postmanProxy | influx创库sql语句 |
  | pretty |            true            |   json格式设置    |

### 写数据测试

- 查询方式：POST

- 查询请求：http://x.x.x.x:7076/`write`

- 参数：

  | 参数名 |  参数值   |    参数意义    |
  | :----: | :-------: | :------------: |
  |   db   | testProxy |    数据库名    |
  |   u    |   test    |  influx用户名  |
  |   p    |  123456   | influx用户密码 |
  | pretty |   true    |  json格式设置  |

- 请求体：(点击 Body **--** 选择 raw 选项)

  ```json
  postmanProxy2,sensor_id=WSD000101 valueH=100,valueL=0.01,value=1000
  ```

## Influxdb的Java工具类

> Java 工具类也是基于 influxdb数据库的 HTTP 请求来实现的，需要注意配好` HTPP 认证`。
>
> **注**：influxdb 工具类不止这一个，可单独重新封装实用工具类。

1、`pom`文件引入 influxdb 依赖包：`influxdb-java` 和 fastjson(方便测试)。

```xml
<!--引入InfluxDB的操作工具类-->
<dependency>
    <groupId>org.influxdb</groupId>
    <artifactId>influxdb-java</artifactId>
    <version>2.10</version>
</dependency>
<!-- https://mvnrepository.com/artifact/com.alibaba/fastjson 为了方便处理数据，引入JSON的数据格式-->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.73</version>
</dependency>
```

2、编写 influxdb 工具类。

```Java
public class InfluxDBUtil {
    
    //influxdb 数据库连接属性
    private String username;
    private String password;
    private String openUrl;
    private String database;
    private String retentionPolicy;  //数据保留策略，采用默认 autogen 即可
    private InfluxDB influxDB;

    public InfluxDBUtil(String username, String password, String openUrl, String database, String retentionPolicy) {
        this.username = username;
        this.password = password;
        this.openUrl = openUrl;
        this.database = database;
        this.retentionPolicy = retentionPolicy == null || retentionPolicy.equals("") ? "autogen" : retentionPolicy;
        influxDBBuild();
    }
    
    //创建一个数据库
    @SuppressWarnings("deprecation")
    public void createDB(String dbName) {
        influxDB.createDatabase(dbName);
    }
   
    //删除一个数据库
    @SuppressWarnings("deprecation")
    public void deleteDB(String dbName) {
        influxDB.deleteDatabase(dbName);
    }
   
    //测试InfluxDB连接是否正常
    public boolean ping() {
        boolean isConnected = false;
        Pong pong;
        pong = influxDB.ping();
        try {
            if (pong != null) {
                isConnected = true;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return isConnected;
    }
   
    //创建数据库连接，加入该数据不存在就创建该数据库
    @SuppressWarnings("deprecation")
    public InfluxDB influxDBBuild() {
        if (influxDB == null) {
            influxDB = InfluxDBFactory.connect(openUrl, username, password);
        }
        try {
            if (!influxDB.databaseExists(database)) {
                influxDB.createDatabase(database);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            influxDB.setRetentionPolicy(retentionPolicy);
        }
        influxDB.setLogLevel(InfluxDB.LogLevel.NONE);
        return influxDB;
    }

    //查询数据，并将查询的数据转成JSONArray的格式
    public JSONArray queryResult(String command) {
        JSONArray results = new JSONArray();
        try {
            QueryResult resultsInfluxDB = influxDB.query(new Query(command, database));
            for (QueryResult.Result result : resultsInfluxDB.getResults()) {
                for (QueryResult.Series series : result.getSeries()) {
                    for (int j = 0; j < series.getValues().size(); j++) {
                        JSONObject data=new JSONObject();
                        for (int i = 0; i <series.getValues().get(j).size(); i++) {
                            data.put(series.getColumns().get(i),series.getValues().get(j).get(i));
                        }
                        results.add(data);
                    }
                }
            }
        } catch (NullPointerException e) {
            System.out.println("查询返回值为空！");
        } catch (InfluxDBException e) {
            System.out.println("请检查查询语句的语法，语法出现问题！");
        }
        return results;
    }
   
    //插入一个数据
    public void insert(String measurement, Map<String, String> tags, Map<String, Object> fields, long time, TimeUnit timeUnit) {
        Builder builder = Point.measurement(measurement);
        builder.tag(tags);
        builder.fields(fields);
        if (0 != time) {
            builder.time(time, timeUnit);
        }
        influxDB.write(database, retentionPolicy, builder.build());
    }
   
    //按照数据的时间去删除数据
    public void deleteData(String measurement,String time){
        String command="delete from "+measurement+" where time='"+time+"'";
        QueryResult result=influxDB.query(new Query(command,database));
    }
}
```

## Tick 技术栈

​	TICK 技术栈是指（Telegraf、InfluxDB、Chronograf、Kapacitor）技术栈。

### Chronograf 安装

​		Chronograf 安装与 InfluxDB 安装类似，都采用本地下载安装包后，放到云服务器，进行安装。

1、下载 Chronograf(1.8.4 版本) 依赖包，下载版本为 `ReadHat&CentOS`版本。

​		本地下载好依赖包后，而后借助 `XFTP`或 `Winscp `放入云服务器目录(建议放到 /usr/local 目录)。

```txt
# 本地下载直接使用 http 下载，地址栏输入 
https://dl.influxdata.com/chronograf/releases/chronograf-1.8.4.x86_64.rpm
浏览器直接会下载好安装包（此种方法速度快）。
```

2、使用 yum 命令进行 Chronograf 的安装。

```shell
yum localinstall chronograf-1.8.4.x86_64.rpm
```

3、不需要修改 Chronograf  配置文件(`目前配置文件未找到`)。

4、启动服务

```shell
systemctl start Chronograf
```

5、检查 Chronograf 服务启动状态。

```shell
# 检查 influxdb启动状态
systemctl status Chronograf
# 检查所有服务启动状态
ps auxw
```

![chronograf服务状态](https://pic1.imgdb.cn/item/6337c17d16f2c2beb1747ea2.png)

### Kapitator 安装

​		Kapacitor 是一个开源的数据处理框架，可以轻松创建警报、运行ETL作业和检测异常。

1、下载 Kapacitor (1.6.2 版本) 依赖包，下载版本为 `ReadHat&CentOS`版本。

​		本地下载好依赖包后，而后借助 `XFTP`或 `Winscp `放入云服务器目录(建议放到 /usr/local 目录)。

```txt
# 本地下载直接使用 http 下载，地址栏输入 
https://dl.influxdata.com/kapacitor/releases/kapacitor-1.6.2-1.x86_64.rpm
浏览器直接会下载好安装包（此种方法速度快）。
```

2、使用 yum 命令进行 Kapacitor 的安装。

```shell
yum localinstall kapacitor-1.6.2-1.aarch64.rpm
```

3、需要修改 Kapacitor 配置文件(`/etc/kapacitor/kapacitor.conf `)。

​		可以使用`kapacitor config`命令查找配置文件的位置，也可以通过`systemctl edit kapacitor`打开服务的配置文件，进行时区的设置，或是通过 `vim /etc/kapacitor/kapacitor.conf`，编辑配置文件。

```shell
[Service]
Environment="TZ=Asia/Shanghai"
```

4、启动服务

```shell
systemctl start Kapacitor
```

5、检查 Chronograf 服务启动状态。

```shell
# 检查 influxdb启动状态
systemctl status Kapacitor
# 检查所有服务启动状态
ps auxw
```

![kapacitor状态](https://pic1.imgdb.cn/item/6337c19d16f2c2beb1749d80.png)

### Telegraf 安装

Telegraf 可用于监测系统参数，并同步写入绑定的 InfluxDB 数据库。

1、下载 Telegraf (1.20.4 版本) 依赖包，下载版本为 `ReadHat&CentOS`版本。

​		本地下载好依赖包后，而后借助 `XFTP`或 `Winscp `放入云服务器目录(建议放到 /usr/local 目录)。

```txt
# 本地下载直接使用 http 下载，地址栏输入 
https://dl.influxdata.com/telegraf/releases/telegraf-1.20.4-1.x86_64.rpm
浏览器直接会下载好安装包（此种方法速度快）。
```

2、使用 yum 命令进行 Telegraf 的安装。

```shell
yum localinstall telegraf-1.20.4-1.x86_64.rpm
```

3、需要修改 Telegraf  配置文件(`/etc/telegraf/telegraf.conf `)。

​		需要设置 Telegraf  绑定 InfluxDB 数据库。

​		1. 编辑配置文件 /etc/telegraf/telegraf.conf 。

```shell
vim /etc/telegraf/telegraf.conf 
```

​		2. 找到配置文件中 [[outputs.influxdb]]模块。

```shell
/influxdb
```

​		3.修改配置文件。

```shell
[[outputs.influxdb]]
  ## The full HTTP or UDP URL for your InfluxDB instance.
  ##
  ## Multiple URLs can be specified for a single cluster, only ONE of the
  ## urls will be written to each interval.
  # urls = ["unix:///var/run/influxdb.sock"]
  # urls = ["udp://127.0.0.1:8089"]
  # 此处为数据写入的 Influxdb 数据库 HTTP 地址
  urls = ["http://127.0.0.1:8086"] 

  ## The target database for metrics; will be created as needed.
  ## For UDP url endpoint database needs to be configured on server side.
  # 写入数据库名称
  database = "telegraf7076"  

  ## The value of this tag will be used to determine the database.  If this
  ## tag is not set the 'database' option is used as the default.
  # database_tag = ""
  .............
  # 验证信息
  username = "test"
  password = "123456"

```

4、启动服务

```shell
systemctl start telegraf
```

5、检查 telegraf服务启动状态。

```shell
# 检查 influxdb启动状态
systemctl status telegraf
# 检查所有服务启动状态
ps auxw
```

![Telegraf状态](https://pic1.imgdb.cn/item/6337c1ba16f2c2beb174bb57.png)

6、查看数据库中数据信息或直接在 Chronograf 中进行查看。

![telegraf测试](https://pic1.imgdb.cn/item/6337c1cf16f2c2beb174d07d.png)































































































