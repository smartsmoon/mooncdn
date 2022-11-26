---
title: MtCat2 简单使用
date: 2022-04-20 00:00:00
type:
comments:
tags: 
  - 数据库
  - MyCat2
  - 分库分表
categories: 
  - 工具插件
description: 
keywords: Netty
cover: https://w.wallhaven.cc/full/1p/wallhaven-1p82mw.png
top_img: https://w.wallhaven.cc/full/1p/wallhaven-1p82mw.png
---

常见数据库瓶颈主要如下，那么如何解决呢？ ======> `Mycat2 分布式数据库中间件`

​	1）数据库数据量大，查询效率低。

​	2）分布式数据库架构复杂，对接困难。

​	3）高访问高并发对数据库压力巨大。

# MyCat2 概述

​		MyCat2 是数据库中间件：连接 Java 应用程序和数据库的工具，是基于 cobar 的二次开发产品。那么它有什么作用呢？

> Mycat 官网：`http://www.mycat.org.cn/`

1、实现`读写分离`：主从复制前提下实现读写分离，优化的首要方案。

![在这里插入图片描述](https://img-blog.csdnimg.cn/daf3aeeb25da465781bee2a852c319c7.png)

2、实现`数据分片`：垂直拆分（`分库`）、水平拆分（`分表`）、垂直+水平拆分。

![在这里插入图片描述](https://img-blog.csdnimg.cn/974112dc498549cca282304e6658be86.png)

3、`多数据源`整合：管理的数据库支持 `集群` `主从复制` `Nosql` 同时使用。

![在这里插入图片描述](https://img-blog.csdnimg.cn/210509c778144ead894d42fc4b835fce.png)

# MyCat2 工作原理

​		Mycat 原理核心就是 `“拦截”`，拦截用户发送的 SQL 语句，对 SQL 语句进行`特定的分析`：分片分析、路由分析、读写分离分析、缓存分析等，然后将该 SQL 发送到真实的数据库，并处理返回的结果，再返回给用户。

![在这里插入图片描述](https://img-blog.csdnimg.cn/af370bcf1a7b4a07b18cd2f2b6b0f1c0.png)

# MyCat2 安装

​		Mycat2 的安装需要二次整合：tar(zip) 包 + jar 包，需要将下载的 tar 包解压，再将核心 jar包放入其 lib 目录。

> 此次安装测试使用的是 39.103.191.179 服务器，使用的 mysql 是服务器本地 docker 创建的 mysql8。

1、下载安装包 zip 包：`http://dl.mycat.org.cn/2.0/install-template/`，选择 1.21 版本。

2、下载核心依赖 Jar 包：`http://dl.mycat.org.cn/2.0/1.21-release/`，选择 1.21 版本。

3、解压安装包，将 Jar 包直接放入 mycat 的 `lib 目录`，此时使用包即搭建完成。

4、利用 XFTP 将此解压包 mycat 放入`/usr/local` 目录下。

5、修改文件夹的权限为最高权限，使其支持 root 用户操作（未修改时是白色文件夹，权限修改后为绿色）

```shell
# 进入 /usr/local 目录
cd /usr/local
# 修改整个文件夹权限
chmod -R 777 mycat
```

6、利用 docker 创建 `mysql 8.0.26` 服务并运行：

​	1）创建 docker-compose.yml 配置文件（docker 创建 mysql 容器配置项很多，因此使用 docker-compose 创建）

```properties
version: '3.1'
services:
  mysql8:
    image: mysql:8.0.28
    container_name: mysql8
    environment:
      MYSQL_ROOT_PASSWORD: 123456
    command:
      --default-authentication-plugin=mysql_native_password
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_general_ci
      --explicit_defaults_for_timestamp=true
      --lower_case_table_names=1
    ports:
      - 4306:3306
    volumes:
      - ./data:/var/lib/mysql
```

​	2）启动 mysql8 容器，进入容器，配置一个 mycat 用户（`也可以不添加用户，直接使用 root 用户`）

```shell
# 利用 docker-compose 启动容器
docker-compose up -d

# 进入 mysql8 容器
docker exec -it mysql8 /bin/bash

# 进入 mysql 客户端
mysql -uroot -p123456

# 创建用户 mycat，设置密码
create user 'mycat'@'%' identified by '123456';
# 设置远程连接的 root 权限用户
grant xa_recover_admin on *.* to 'root'@'%';
# 赋予 mycat 权限
grant all privileges on *.* to 'mycat'@'%';
# 刷新权限
flush privileges;
```

8、修改 mycat 的 prototype 数据源对应的 mysql 数据库配置：`/conf/datasources/prototypeDs.datasource.json` 配置文件

```json
{
        "dbType":"mysql",
        "idleTimeout":60000,
        "initSqls":[],
        "initSqlsGetConnection":true,
        "instanceType":"READ_WRITE",
        "maxCon":1000,
        "maxConnectTimeout":3000,
        "maxRetryCount":5,
        "minCon":1,
        "name":"prototypeDs",
        "password":"123456",
        "type":"JDBC",
        "url":"jdbc:mysql://39.103.191.179:4306/mydb01?useUnicode=true&serverTimezone=Asia/Shanghai&characterEncoding=UTF-8",
        "user":"mycat",
        "weight":0
}
```

​		当前只修改原型库的相关配置：user（刚才创建的 mycat 用户）、password、url（对应的 IP 和 端口以及原型数据库名）。

9、启动 mycat 的相关命令：

```shell
# 进入 mycat的启动文件目录 bin
cd /usr/local/mycat/bin

# 启动 mycat
[root@iZ8vb45xejetxupwfn3mj8Z bin]# ./mycat start
Starting mycat2...

# 检查 mycat 状态
[root@iZ8vb45xejetxupwfn3mj8Z bin]# ./mycat status
mycat2 is running (613329).

# 其他操作命令：
./mycat start  # 启动 mycat
./mycat status # 查看 mycat 状态
./mycat stop   # 停止 mycat
./mycat console # 前台启动 mycat
./mycat install # 添加到系统自动启动（暂未实现）
./mycat remove   # 取消随系统自动启动（暂未实现）
./mycat restart # 重启 mycat 服务
./mycat pause # 暂停 mycat 服务
```

# MyCat2 使用

> 运维人员使用命令维护 Mycat 的情况：`登陆后台管理窗口`
>
> ```shell
> mysql -umycat -p123456 -P 9066
> # 发现 mycat 后台管理端口为 9066，使用之前创建的 mycat 操作账户进入（也可以直接使用 root 进入，配置文件设置）
> ```

`登录数据客户端`：后端开发人员使用 `8066` 端口。

```shell
mysql -umycat -p123456 -P 8066
# 使用 8066 端口登录则是进入 mycat 的数据窗口，用于通过 mycat 查询数据
```

​		由于此处使用的是 docker 里面的 mysql 服务，因此操作都需要进入内部。

```shell
# 进入 mysql 容器内部
docke exec -it mysql8 /bin/bash

# 进入 mycat 数据接口客户端 8066
mysql -umycat -p123456 -P 8066
```

# MyCat2 相关概念

## 基本概念

1、`分库分表`：按照一定规则把数据库中的表拆分为多个带有数据库实例，物理库，物理表访问路径的分表。

2、`逻辑库`：数据库代理（mycat）中的数据库，可以对应多个逻辑表。逻辑上存在，实际并不存在。

3、`逻辑表`：数据库代理（mycat）中的数据表，可以映射代理连接的数据库中的真实的物理表，可以对应多个。

4、`物理库`：数据库代理连接的真是数据库。

5、`物理表`：真实数据表。

6、`分片键`：也叫拆分键，描述`拆分逻辑表的`数据规则的`字段`。比如订单表一般按照用户 id 拆分。

7、物理分表：已经进行数据拆分的在数据库上面的物理表，是分片表的一个分区。`多个物理分表里的数据汇总就是逻辑表的全部数据`。

8、物理分库：一般包含多个物理分表的库。

9、全局表：广播表，指每个数据库实例都具有全量数据的逻辑表。例如系统中翻译字段的字典表。

10、ER 表：`狭义上`指父子表中的子表，其分片键执行附表的分片键，且两表的分片算法相同。`广义上`指具有相同数据分布的一组表。

​		例如关联别的表的子表，订单详情表就是订单表的 ER 表。

11、`集群`：多个数据节点组成的逻辑节点。在 mycat2 中，是把对多个数据源地址视为一个数据源地址（名称），并提供自动故障恢复、转移，即实现高可用和负载均衡的组件。`集群就是高可用和负载均衡的代名词`。

12、数据源：连接后端数据库的组件，是数据库代理（mycat2）中连接后端数据库的客户端。`Mycat2 通过数据源连接 MySQL 数据库`。

13、原型库（prototype）：原型库是 Mycat2 后面的数据库，例如 MySQL 库。

​		`原型库就是存储数据的真实数据库`，配置数据源时必须指定原型库。

## 配置文件

​		Mycat2 和 Mycat1 不同，不需要经常配置修改繁琐的配置文件，只需要在客户端运行命令即可。（改进）

1、服务 `server` ：描述服务相关的配置。配置文件位于 `mycat/conf/server.json`，使用默认配置即可。

2、用户 `user`：配置用户相关的信息。配置文件位于 `mycat/conf/users/root.user.json`

​	1）命名方式：`{用户名}.user.json`。

​	2）配置内容：

```json
{
        "dialect":"mysql",
        "ip":null,
        "password":"123456",
        "transactionType":"proxy",
        "username":"root"
}
// ip 就是客户端访问的 ip，建议为 null，填写后会对客户端的 ip 进行限制，不填写表示任意 ip
// username 就是用户名
// password 表示密码
// isolation 表示设置初始化的事务隔离级别：四种，默认为 3 表示 repeated_read 可重复读
// transactionType 表示事务类型，此处默认为 proxy 表示本地事务，在设计大于 1 个数据库的事务时，commit 阶段失败可能会导致数据不一致，但是 proxy 兼容性最好，还可以选择 XA 事务类型，但是需要确认存储节点集群（数据库）类型是否支持 XA。
// 使用命令：set transaction_policy = 'xa' 或 set transaction_policy = 'proxy' 来设置 
// 查询事务类型：select @@transaction_policy
```

3、数据源 datasource：配置 Mycat 连接的数据源信息。配置文件位于 `mycat/conf/datasource`。(内部初始只有一个原型库配置文件 prototype.datasource.json)

​	1）命名方式：`{数据源名称}.datasource.json`。

​	2）配置内容：

```json
{
        "dbType":"mysql",
        "idleTimeout":60000,
        "initSqls":[],
        "initSqlsGetConnection":true,
        "instanceType":"READ_WRITE",
        "maxCon":1000,
        "maxConnectTimeout":3000,
        "maxRetryCount":5,
        "minCon":1,
        "name":"prototypeDs",
        "password":"123456",
        "type":"JDBC",
        "url":"jdbc:mysql://39.103.191.179:4306/mydb01?useUnicode=true&serverTimezone=Asia/Shanghai&characterEncoding=UTF-8",
        "user":"mycat",
        "weight":0
}
// dbType 表示数据库类型，一般就是 mysql，和 mysql 兼容性最好
// name 表示数据库用户名
// password 表示数据库密码
// type 表示数据源类型，默认 JDBC
// url 表示访问数据库的地址
// idleTimeout 表示空闲连接超时时间
// initSqls 表示初始化的 sql
// initSqlsGetConnection 对于 jdbc 每次获取连接是否都执行设定的 initSqls。
// instanceType 配置示例读写设置，可选值：read_write、read、write 三种
// weight 使用集群时负载均衡权重
// 连接相关配置 maxCon 
// 连接相关配置 maxConnectTimeout 
// 连接相关配置 maxRetryCount 
// 连接相关配置 minCon 
```

4、集群 `cluster`：配置集群信息。配置文件位于 `mycat/conf/clusters`。(内部初始只有一个原型集群配置文件 prototype.cluster.json)

​	1）命名方式：`{集群名字}.cluster.json`。

​	2）配置内容：

```json
{
        "clusterType":"MASTER_SLAVE",
        "heartbeat":{
                "heartbeatTimeout":1000,
                "maxRetry":3,
                "minSwitchTimeInterval":300,
                "slaveThreshold":0
        },
        "masters":[
                "prototypeDs"
        ],
        "maxCon":200,
        "name":"prototype",
        "readBalanceType":"BALANCE_ALL",
        "switchType":"SWITCH"
}
// clusterType 集群类型，MASTER_SLAVE 表示普通主从，single_node 表示单一节点，garela_cluster 表示 garela 集群，，即 pxc 集群，还可选：MHA\MGR
// readBalanceType 表示查询负载均衡策略，可选：BALANCE_ALL 表示获取集群中所有的数据源，其他还有：BALANCE_read 等。
// switchType 表示切换类型，SWITCH 表示进行主从切换，no_switch 表示不进行主从切换
// masters 内部配置多个主节点，在主节点挂掉时，会检测存活的数据源作为主节点
```

5、逻辑库表 `schema`：配置逻辑库表，实现分库分表。配置文件位于 `mycat/conf/schema`。（初始：information_schema.schema.json 和 mysql.schema.json）

​	1）命名方式：`{库名}.schema.json`。

​	2）配置内容：后面说明。

# 读写分离

​		通过 Mycat 和 MySQL 的主从复制配合搭建数据库的读写分离，实现高可用性。以`一主一从`、`双主双从`模式为例。

## 一主一从

​		一主一从模式：一台主机负责写请求，一台主机负责读请求。而 Mycat 就能实现将写请求转发给主机，将读请求转发给从机。

![img](https://img0.baidu.com/it/u=659307887,4266065776&fm=253&fmt=auto&app=138&f=JPEG?w=865&h=398)

### 主从复制

​		Master 将操作记录到 `Binlog 日志`，Slave 开启 IO 线程从Binlog 日志读取内容到本地的 `Relay 日志`，再通过 SQL 线程将数据读取，实现主从同步。

​		![在这里插入图片描述](https://img-blog.csdnimg.cn/08c8b3da287249eeb384304df7df94dd.png)

### 搭建 Master

​		采用 MySQL8 的一主一从的集群，使用 docker 在两个服务器上创建两个 MySQL8 的容器，用来搭建一主一从模式集群。

1、主机 master 位于 `8.142.92.222` ，docker-compose.yml 配置：(此时不知如何像之前那样搭建 mysql8 ，因此使用 docker 创建基础的 mysql8 镜像再进入配置的方式)

```yml
version: '3.1'
services:
  mysql-master:
    image: mysql:8.0.28
    container_name: mysql-master
    environment:
      MYSQL_ROOT_PASSWORD: 123456
    command:
      --default-authentication-plugin=mysql_native_password
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_general_ci
      --explicit_defaults_for_timestamp=true
      --lower_case_table_names=1
    ports:
      - 4306:3306
    volumes:
      - ./data:/var/lib/mysql
```

2、创建容器，开放 4306 端口。

```shell
docker-compose up -d
```

3、进入容器，修改 mysql 配置文件：

```shell
# 进入容器
docker exec -it mysql-master bash
# 安装vim编辑器
apt-get update
apt-get install vim -y
# 进入 mysql 配置文件 /etc/my.cnf 目录进行编辑，发现指引去 /etc/mysql/conf.d/ 
cd /etc/mysql/conf.d/
vim mysql.cnf
```

​		具体修改配置为：

```shell
# 注意需要放到 mysqld 模块，否则登录时会报错：mysql: [ERROR] unknown variable 'server-id=1'.
[mysqld]
# 服务 id，在一个主从复制集群中要唯一,值范围1-255
server-id=1
# 启动 binlog 日志
log-bin=mysql-master-bin
# 从机复制时,忽略的数据库,也就是说这里配置的数据库不会被从机同步
binlog-ignore-db=mysql
binlog-ignore-db=information_schema
# binlog 格式，默认 STATEMENT ，binlog 格式还可以设置成 ROW，不会存在不一致问题，但是效率低
binlog_format=STATEMENT
```

4、重启容器：

```shell
docker restart mysql-master
```

5、再次进入容器，进入 mysql 查看从机需要的配置信息：

```shell
# 进入容器
docker exec -it mysql-master bash
# 进入 mysql
mysql -uroot -p123456
# 创建从机的操作用户,并赋予全部权限，方便使用
create user 'slave'@'%' identified by '123456';
grant all privileges on *.* to 'slave'@'%';
# 这句话必须执行，如果不写这句话也能够修改密码,但是使用的时默认的密码插件是 caching_sha2_password,会导致后面从机连接不上
alter user 'root'@'%' identified with mysql_native_password by '123456';
flush privileges;

# 查看主机 master 的状态，记录 mysql-master-bin.000001 和 Position=157
mysql> show master status;
+-------------------------+----------+--------------+-------------------------------------------------+-------------------+
| File                    | Position | Binlog_Do_DB | Binlog_Ignore_DB                                | Executed_Gtid_Set |
+-------------------------+----------+--------------+-------------------------------------------------+-------------------+
| mysql-master-bin.000002 |      474 |              | mysql,information_schema,performance_schema,sys |                   |
+-------------------------+----------+--------------+-------------------------------------------------+-------------------+
1 row in set (0.00 sec)
```

### 搭建 Slave

1、从机 slave 位于 `39.103.191.179` ，docker-compose.yml 配置：

```yml
version: '3.1'
services:
  mysql-slave:
    image: mysql:8.0.28
    container_name: mysql-slave
    environment:
      MYSQL_ROOT_PASSWORD: 123456
    command:
      --default-authentication-plugin=mysql_native_password
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_general_ci
      --explicit_defaults_for_timestamp=true
      --lower_case_table_names=1
    ports:
      - 4306:3306
    volumes:
      - ./data:/var/lib/mysql
```

2、创建容器，开放 4306 端口。

```shell
docker-compose up -d
```

3、进入容器，修改 mysql 配置文件：

```shell
# 进入容器
docker exec -it mysql-master bash
# 安装vim编辑器
apt-get update
apt-get install vim -y
# 进入 mysql 配置文件 /etc/my.cnf 目录进行编辑，发现指引去 /etc/mysql/conf.d/ 
cd /etc/mysql/conf.d/
vim mysql.cnf
```

​		具体修改配置为：(和主机不同)

```shell
# 注意需要放到 mysqld 模块，否则登录时会报错：mysql: [ERROR] unknown variable 'server-id=2'.
[mysqld]
# 服务 id，在一个主从复制集群中要唯一,值范围1-255
server-id=2
# 开启中继日志
relay-log=mysql-slave-relay
```

4、重启容器：

```shell
docker restart mysql-master
```

5、进入容器内部的 mysql，配置主机的信息：

```shell
# 进入容器
docker exec -it mysql-master bash
# 进入 mysql
mysql -uroot -p123456
# 同步主机的相关设置,使用之前在主机上配置的用户和主机的信息状态。
CHANGE MASTER TO
MASTER_HOST='8.142.92.222',
MASTER_PORT=4306,
MASTER_USER='root',
MASTER_PASSWORD='123456',
MASTER_LOG_FILE='mysql-master-bin.000003',
MASTER_LOG_POS=157;
	
# 启动从机的同步功能
start slave;

# 查看从服务器状态
show slave status \G;
# 检查此两个同步线程的状态，都是 Yes 则 OK
Slave_IO_Running: Yes
Slave_SQL_Running: Yes

# 如果出现问题，查看 error 信息
# 停止 slave 配置
stop slave;
# 重置主机信息
reset master;
```

### 测试集群使用

> 注意：在搭建集群之前，不能单独创建数据库 mydb01，因为在集群 master 配置之前如果改变 数据库信息，则会导致 master 的 position 属性变化。

1、主库创建数据库 mydb01，检查从库服务器是否存在对应数据库：发现存在数据库 mydb01。

2、在该数据库创建表 mytable01，检查从库服务器是否存在对应数据表：发现存在数据表 mytable01。

3、写入数据测试，能够数据同步。

至此整个主从同步 mysql8 集群搭建完成。

### MyCat 读写分离

​		Mycat 读写分离是在主从复制基础上实现的。在 39.103.191.179 服务器的`主机`上安装 Mycat2，并修改文件夹权限。

> 在 8.142.92.222 上装 mycat 发现无法登录 8086 端口，暂时不明白为什么？

1、创建 mycat 的登录用户，也可以`直接使用 root 用户`：`此处直接使用 root 用户`，使用 mycat 用户还需要修改 pid 文件位置，又会衍生修改文件夹权限问题。

1、登录 mycat 数据端口：（注意防火墙 和 安全组开启端口 8066）

​	1）使用命令行：

```shell
# 使用远程的 39.103.191.179 服务器上的 mycat
mysql -uroot -p123456 -h 39.103.191.179 -P 8066
```

​	2）使用 navicat 登录 mycat（类似于 mysql 登录，只不过端口号换成了 mycat 的数据端口 8066）。

2、创建好一个在 mycat 内部配置文件定义的数据源`逻辑库`，此处是使用 `mydb02`，因此还需要添加配置映射到物理库。

3、修改配置文件 `/schemas/mydb02.schemas.json`，这个配置文件是在创库时自动生成的。

```json
{
        "customTables":{},
        "globalTables":{},
        "normalProcedures":{},
        "normalTables":{},
        "schemaName":"mydb02",
        "targetName":"prototype",		// 添加此行指定数据源，配置主机数据源名称
        "shardingTables":{},
        "views":{}
}
```

4、登录 mycat 使用注解添加具体的数据源（也可以使用配置文件配置），指向从机：

```mysql
# 下面操作使用 navicat 操作
# 注解方式添加数据源,/*+ 表示标识符,rwSepw 定位写数据源（主机），rwSepw定义为读数据源（从机）
/*+ mycat:createDataSource{ "name":"rwSepw", "url":"jdbc:mysql://8.142.92.222:4306/mydb02?useSSL=false&characterEncoding=UTF-8&useJDBCCompliantTimezoneShift=true", "user":"root", "password":"123456"} */;
/*+ mycat:createDataSource{ "name":"rwSepr", "url":"jdbc:mysql://39.103.191.179:4306/mydb02?useSSL=false&characterEncoding=UTF-8&useJDBCCompliantTimezoneShift=true", "user":"root", "password":"123456"} */;

# 查询数据源配置结果
/*+ mycat:showDataSources{} */
```

​		1）注解查询数据源配置结果：

```mysql
/*+ mycat:showDataSources{} */;
```

![](https://pic1.imgdb.cn/item/6336eba716f2c2beb1bd3a26.png)

> prototypeDs 表示原型数据源。
>

​		2）配置文件查看：`mycat/conf/datasources/`

```shell
[root@iZ8vb45xejetxupwfn3mj8Z datasources]# ll
total 12
-rwxrwxrwx 1 root root 423 Jun 16 13:48 prototypeDs.datasource.json
-rw-r--r-- 1 root root 572 Jun 16 14:23 rwSepr.datasource.json
-rw-r--r-- 1 root root 570 Jun 16 14:14 rwSepw.datasource.json
```

5、使用注解更新集群信息，添加 dr0 从节点，实现读写分离。

```mysql
/*! mycat:createCluster{"name":"prototype", "masters":["rwSepw"], "replicas":["rwSepr"]} */;
```

​		查看集群信息：

```mysql
/*+ mycat:showClusters{} */;
```

![](https://pic1.imgdb.cn/item/6336eb9b16f2c2beb1bd2bfa.png)

​		2）配置文件查看：`mycat/conf/clusters/`

```shell
[root@iZ8vb45xejetxupwfn3mj8Z clusters]# vim prototype.cluster.json 
{
        "clusterType":"MASTER_SLAVE",
        "heartbeat":{
                "heartbeatTimeout":1000,
                "maxRetryCount":3,
                "minSwitchTimeInterval":300,
                "showLog":false,
                "slaveThreshold":0.0
        },
        "masters":[
                "rwSepw"
        ],
        "maxCon":2000,
        "name":"prototype",
        "readBalanceType":"BALANCE_ALL",
        "replicas":[
                "rwSepr"
        ],
        "switchType":"SWITCH"
}
```

6、重启 Mycat，验证读写分离效果。

```shell
[root@iZ8vb45xejetxupwfn3mj8Z bin]# ./mycat restart
Stopping mycat2...
Stopped mycat2.
Starting mycat2...
```

​		之前说明 logbin 日志时，说明到其有三种格式，默认就是 statement 格式，这种格式下如果使用变量表达式们会造成主从数据不一致，以此来验证。

```sql
# 测试语句
insert into mytb02 values(1, "张三");
insert into mytb02 values(3, @@hostname);
```

​		效果：通过 master 插入后，该表的 value 值插入的并不一致，是各自的 hostname 。同时再从 mycat 多次查询发现，第二项数据是负载均衡查询到的，从两个数据表`随机轮询`查询的。

![](https://pic1.imgdb.cn/item/6336eb8816f2c2beb1bd145a.png)

## 双主双从

### 搭建双主双从

双主双从集群模式初步设定：

​	1）主机 m1 用于处理所有的写请求，其从机 s1 和 主机 m2 以及其从机 s2 负责读请求。

​	2）当主机 m1 宕机，主机 m2 负责写请求，m1 和 m2 互为备用机。

> 集群搭建过程注意：`搭建完成之前不能进行任何写操作`，会改变偏移量，导致集群之间连接失败。

![在这里插入图片描述](https://img-blog.csdnimg.cn/f2b5c291a6904a84a2d9fd2b0b99da21.png)

机器准备：

Master1（8.142.92.222）：docker 部署，端口 4306

Slave1（8.142.92.222）：docker 部署，端口 4307

Master2（39.103.191.179）：docker 部署，端口 4306

Slave2（39.103.191.179）：docker 部署，端口 4307

> 清除原先的 docker 容器，重新创建整个 `双主双从`。另一个服务器一样，只不过是变为 master2 和 slave2。
>

​	1）8.142 服务器上：docker-compose.yml 基本容器配置文件。

```yml
version: '3.1'
services:
  master1:
    image: mysql:8.0.28
    container_name: master1
    environment:
      MYSQL_ROOT_PASSWORD: 123456
    command:
      --default-authentication-plugin=mysql_native_password
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_general_ci
      --explicit_defaults_for_timestamp=true
      --lower_case_table_names=1
    ports:
      - 4306:3306
    volumes:
      - ./master/data:/var/lib/mysql
  slave1:
    image: mysql:8.0.28
    container_name: slave1
    environment:
      MYSQL_ROOT_PASSWORD: 123456
    command:
      --default-authentication-plugin=mysql_native_password
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_general_ci
      --explicit_defaults_for_timestamp=true
      --lower_case_table_names=1
    ports:
      - 4307:3306
    volumes:
      - ./slave/data:/var/lib/mysql
```

​	2）进入容器，修改 master 1 配置文件：

```shell
#主服务器唯一ID,两个 master 需要修改此处，另一个 server-id=3
server-id=1
#启用二进制日志
log-bin=mysql-master1-bin
# 设置不要复制的数据库(可设置多个)
binlog-ignore-db=mysql
binlog-ignore-db=information_schema
#设置logbin格式
binlog_format=STATEMENT
# 在作为从数据库的时候，有写入操作也要更新二进制日志文件
log-slave-updates 
#表示自增长字段每次递增的量，指自增字段的起始值，其默认值是1，取值范围是1 .. 65535
auto-increment-increment=2 
# 表示自增长字段从哪个数开始，指字段一次递增多少，他的取值范围是1 .. 65535
auto-increment-offset=1
```

master 2 的配置文件：

```shell
#主服务器唯一ID
server-id=3
#启用二进制日志
log-bin=mysql-master2-bin
# 设置不要复制的数据库(可设置多个)
binlog-ignore-db=mysql
binlog-ignore-db=information_schema
# 设置需要复制的数据库
# binlog-do-db=需要复制的主数据库名字
#设置logbin格式
binlog_format=STATEMENT
# 在作为从数据库的时候，有写入操作也要更新二进制日志文件
log-slave-updates 
#表示自增长字段每次递增的量，指自增字段的起始值，其默认值是1，取值范围是1 .. 65535
auto-increment-increment=2 
# 表示自增长字段从哪个数开始，指字段一次递增多少，他的取值范围是1 .. 65535
auto-increment-offset=2
```

slave 1 的配置文件：

```shell
#从服务器唯一ID
server-id=2
#启用中继日志
relay-log=mysql-relay
```

 slave 2 的配置文件：

```shell
#从服务器唯一ID
server-id=4
#启用中继日志
relay-log=mysql-relay
```

​	3）重启四个 mysql 容器服务。

​	4）在两台主机上分别创建并授权用户：slave，后续都是用这个 slave 用户。

```mysql
# 在主机MySQL里执行授权命令
GRANT REPLICATION SLAVE ON *.* TO 'slave'@'%' IDENTIFIED BY '123123';
```

​	5）查询 master 的状态，分别记录下 File 和 Position 的值，执行完此步骤后不要再操作主服务器 MySQL，防止主服务器状态值变化在从机上配置需要复制的主机，Slava1 复制 Master1，Slava2 复制 Master2，以及主机 Master2 的复制 Master1。

​	6）直接在 navicate 查看 master1 和 master2 的 binlog 日志和偏移量。

```mysql
show master status;
```

​	7）配置主从复制关系连接：slave1 复制 master1，slave2 复制 master2。

```mysql
# 进入 slave1 容器，复制同步 master1：4306 端口
CHANGE MASTER TO
MASTER_HOST='8.142.92.222',
MASTER_PORT=4306,
MASTER_USER='slave',
MASTER_PASSWORD='123456',
MASTER_LOG_FILE='mysql-master1-bin.000003',
MASTER_LOG_POS=157;

# 进入 slave2 容器，slave2 上复制同步 master2：4306 端口
CHANGE MASTER TO
MASTER_HOST='39.103.191.179',
MASTER_PORT=4306,
MASTER_USER='slave',
MASTER_PASSWORD='123456',
MASTER_LOG_FILE='mysql-master2-bin.000001',
MASTER_LOG_POS=157;
```

​	8）双主机互相同步：master1 复制 master2，master2 复制 master1。====> 互为主备。

```mysql
# 进入 master2 容器，master2 上同步 master1
CHANGE MASTER TO
MASTER_HOST='8.142.92.222',
MASTER_PORT=4306,
MASTER_USER='slave',
MASTER_PASSWORD='123456',
MASTER_LOG_FILE='mysql-master1-bin.000003',
MASTER_LOG_POS=157;

# 进入 master1 容器，master1 上同步 master2
CHANGE MASTER TO
MASTER_HOST='39.103.191.179',
MASTER_PORT=4306,
MASTER_USER='slave',
MASTER_PASSWORD='123456',
MASTER_LOG_FILE='mysql-master2-bin.000001',
MASTER_LOG_POS=157;
```

​	查看每个 mysql8 服务的 slave 是不是双 Yes 线程启动。

​	至此，双主双从的集群已经搭建完成。

​	9）测试使用：

```mysql
# master1 创建数据库 mydb1
create database mydb1;
# 测试结果：其他三台机器 mysql 都出现数据库 mydb1

# master1 在 mydb1 库中创建表 mytb1
create table mytb1(id int, name varchar(50));
# 测试结果：其他三台机器 mydb1 数据库都出现表 mytb1

# master1 插入数据
insert into mytb1 values(1, "张三");
# 测试结果：其他三台机器 mytb1 数据表都同步数据
```

### MyCat 读写分离

​		说明：master1 为主机，master2 也负责读数据，slave1 和 slave2 只负责读数据，当 master1 宕机后，master2 要成为主机负责写数据。

1、创建四个数据源：

```mysql
# master1
/*+ mycat:createDataSource{ "name":"rwSepw", "url":"jdbc:mysql://8.142.92.222:4306/mydb1?useSSL=false&characterEncoding=UTF-8&useJDBCCompliantTimezoneShift=true", "user":"root", "password":"123456"} */;

# slave1
/*+ mycat:createDataSource{ "name":"rwSepr", "url":"jdbc:mysql://8.142.92.222:4307/mydb1?useSSL=false&characterEncoding=UTF-8&useJDBCCompliantTimezoneShift=true", "user":"root", "password":"123456"} */;

# master2
/*+ mycat:createDataSource{ "name":"rwSepw2", "url":"jdbc:mysql://39.103.191.179:4306/mydb1?useSSL=false&characterEncoding=UTF-8&useJDBCCompliantTimezoneShift=true", "user":"root", "password":"123456"} */;

# slave2
/*+ mycat:createDataSource{ "name":"rwSepr2", "url":"jdbc:mysql://39.103.191.179:4307/mydb1?useSSL=false&characterEncoding=UTF-8&useJDBCCompliantTimezoneShift=true", "user":"root", "password":"123456"} */;

/*+ mycat:showDataSources{} */
```

![](https://pic1.imgdb.cn/item/6336eb7516f2c2beb1bcfd0a.png)

2、修改集群配置：`prototype.cluster.json`

```json
{
        "clusterType":"MASTER_SLAVE",
        "heartbeat":{
                "heartbeatTimeout":1000,
                "maxRetryCount":3,
                "minSwitchTimeInterval":300,
                "showLog":false,
                "slaveThreshold":0.0
        },
        "masters":[
                "rwSepw","rwSepw2"
        ],
        "maxCon":2000,
        "name":"prototype",
        "readBalanceType":"BALANCE_ALL",
        "replicas":[
                "rwSepw","rwSepr","rwSepr2"
        ],
        "switchType":"SWITCH"
}
```

3、在 mycat 中创建数据库 mydb1 （对应配置文件设置），再修改配置文件：

```json
{
        "customTables":{},
        "globalTables":{},
        "normalProcedures":{},
        "normalTables":{},
        "schemaName":"mydb1",
        "targetName":"prototype",		// 添加此行指定数据源，配置主机数据源名称
        "shardingTables":{},
        "views":{}
}
```

4、重启 mycat ，检查 mycta 客户端情况，发现已经出现了 mytb1 表，同时表中出现数据 （1，“张三”）数据项。

此时，读写分离已经实现。

> 那么，再测试一下主机 master1 插入带表达式的 hostname 数据。

```mysql
insert into mytb1 values(2, @@hostname);
```

![](https://pic1.imgdb.cn/item/6336eb6616f2c2beb1bcebf1.png)

​		结果发现，四个主机都不同（每个 docker 容器内部主机名不相同）。

​		再此时通过 mycat 进行查询，发现每次刷新就会是不同的 hostname =====> 遵循`随机轮询`的方式。

# 分库分表

​		分库分表：数据库和数据表的存储是有一定的瓶颈的，需要多个数据库数据表共同承担压力。

​		一个数据库由很多表的构成，每个表对应着不同的业务，垂直切分是指按照业务将表进行分类，`分布到不同的数据库`上面，这样也就将数据或者说压力分担到不同的库上面。

## 分库分表原则

> 问题：位于两台主机上的两个数据库中的表能不能关联查询？
>
> 答：`不能关联查询`。=====> `分库原则`：有紧密关联关系的表应该在一个库里，相互没有关联关系的表可以分到不同的库里。

**`举例`**	系统有四张表：用户表（60万）、订单表（600万）、订单详情表（600万）、订单状态表（20）。

1、分库原则：用户表 位于一个库，其余三个表是有关联关系的，位于同一个库。

​	那么订单表和订单详情表数据量 600 万，如何进行分表呢？

2、分表原则：需要确定实际的合理分表字段。

​	1）如果以 `id 或创建时间`分表，历史订单查询时间查询过少，但是 618 、双十一时间段订单多查询多。====> `节点访问不平均`

​	2）以 `客户id` 分表，两个节点访问平均，一个客户的所有订单都在同一个节点。=====> `节点访问较平均`

## 准备工作

​		为避免过多节点影响操作，先将之前的双主双从更改为一主一从模式：直接修改 mycat 里面的配置避免启动报错。

1）修改 clusters 配置：

```json
{
        "clusterType":"MASTER_SLAVE",
        "heartbeat":{
                "heartbeatTimeout":1000,
                "maxRetryCount":3,
                "minSwitchTimeInterval":300,
                "showLog":false,
                "slaveThreshold":0.0
        },
        "masters":[
                "rwSepw"
        ],
        "maxCon":2000,
        "name":"prototype",
        "readBalanceType":"BALANCE_ALL",
        "replicas":[
                "rwSepr"
        ],
        "switchType":"SWITCH"
}
```

2）由于 mycat 启动时会自动加载配置文件，因此需要将之前另外两个不用的数据源注释掉。

```shell
[root@iZ8vb45xejetxupwfn3mj8Z datasources]# ll
total 20
-rwxrwxrwx 1 root root 420 Jun 17 11:27 prototypeDs.datasource.json
-rw-r--r-- 1 root root 572 Jun 17 11:33 rwSepr2.datasource.json
-rw-r--r-- 1 root root 569 Jun 17 11:33 rwSepr.datasource.json
-rw-r--r-- 1 root root 572 Jun 17 11:30 rwSepw2.datasource.json
-rw-r--r-- 1 root root 569 Jun 17 11:30 rwSepw.datasource.json
[root@iZ8vb45xejetxupwfn3mj8Z datasources]# mv rwSepr2.datasource.json rwSepr2.datasource_temp.json
[root@iZ8vb45xejetxupwfn3mj8Z datasources]# mv rwSepw2.datasource.json rwSepw2.datasource_temp.json
[root@iZ8vb45xejetxupwfn3mj8Z datasources]# ll
total 20
-rwxrwxrwx 1 root root 420 Jun 17 11:27 prototypeDs.datasource.json
-rw-r--r-- 1 root root 572 Jun 17 11:33 rwSepr2.datasource_temp.json
-rw-r--r-- 1 root root 569 Jun 17 11:33 rwSepr.datasource.json
-rw-r--r-- 1 root root 572 Jun 17 11:30 rwSepw2.datasource_temp.json
-rw-r--r-- 1 root root 569 Jun 17 11:30 rwSepw.datasource.json
```

​	Mycat2 可以在终端直接创建数据源、集群、库表，并`在创建时指定分库分表`，比之前版本简化了分库分表操作。

1、Mycat2 终端创建数据源：

```mysql
/*+ mycat:createDataSource{ 
	"name":"dw0", 
	"url":"jdbc:mysql://8.142.92.222:4306", 
	"user":"root", 
	"password":"123456"
} */;

/*+ mycat:createDataSource{ 
	"name":"dr0", 
	"url":"jdbc:mysql://8.142.92.222:4306", 
	"user":"root", 
	"password":"123456"
} */;

/*+ mycat:createDataSource{ 
	"name":"dw1", 
	"url":"jdbc:mysql://8.142.92.222:4307", 
	"user":"root", 
	"password":"123456"
} */;

/*+ mycat:createDataSource{ 
	"name":"dr1", 
	"url":"jdbc:mysql://8.142.92.222:4307", 
	"user":"root", 
	"password":"123456"
} */;
```

2、将新添加的数据源配置成集群：

```mysql
/*! mycat:createCluster{"name":"c0", "masters":["dw0"], "replicas":["dr0"]} */;
/*! mycat:createCluster{"name":"c1", "masters":["dw1"], "replicas":["dr1"]} */;
```

​		查看集群配置：

```shell
[root@iZ8vb45xejetxupwfn3mj8Z conf]# cd clusters/
[root@iZ8vb45xejetxupwfn3mj8Z clusters]# ll
total 12
-rw-r--r-- 1 root root 312 Jun 17 14:10 c0.cluster.json
-rw-r--r-- 1 root root 312 Jun 17 14:10 c1.cluster.json
-rw-r--r-- 1 root root 326 Jun 17 13:54 prototype.cluster.json
```

## 广播表

​		上例中的订单状态字典表就是`全局表`，也叫广播表，在每个分片上都需要此全局表。

```mysql
# 创建数据库 db1
create database db1;
```

​		此时 schema 配置文件已经有了 db1 的库结构配置，查看其 schema 配置文件：（发现并未配置数据源 targetName）

```json
{
        "customTables":{},
        "globalTables":{},
        "normalProcedures":{},
        "normalTables":{},
        "schemaName":"db1",
        "shardingTables":{},
        "views":{}
}
```

​		但是现在`不采取之前配置文件修改`来配置数据源的方式，而是直接`采用命令实现`。

```mysql
# 创建广播表，使用关键字 broadcast 指定此表为广播表
create table `travelrecord` (
	`id` bigint not null AUTO_INCREMENT,
	`user_id` varchar(100) default null,
	`traveldata` date default null,
	`fee` decimal(10,0) default null,
	`days` int default null,
	`blob` longblob,
	primary key (`id`),
	key `id` (`id`)
) engine=innodb default CHARSET=utf8 broadcast;
```

​	再检查其配置文件内容：

```json
{
        "customTables":{},
        "globalTables":{
                "travelrecord":{
                        "broadcast":[
                                {
                                        "targetName":"c0"
                                },
                                {
                                        "targetName":"c1"
                                }
                        ],
                        "createTableSQL":"CREATE TABLE `db1`.`travelrecord` (\n\t`id` bigint NOT NULL AUTO_INCREMENT,\n\t`user_id` varchar(100) DEFAULT NULL,\n\t`traveldata` date DEFAULT NULL,\n\t`fee` decimal(10, 0) DEFAULT NULL,\n\t`days` int DEFAULT NULL,\n\t`blob` longblob,\n\tPRIMARY KEY (`id`),\n\tKEY `id` (`id`)\n) BROADCAST ENGINE = innodb CHARSET = utf8"
                }
        },
        "normalProcedures":{},
        "normalTables":{},
        "schemaName":"db1",
        "shardingTables":{},
        "views":{}
}
```

​		发现 targetName 自己出现了，且映射到了两个数据源。 =====> mycat2 封装的更好了，功能更像真正的数据库。

同时打开 c0 和 c1 对应的数据库，即原先的 master1 和 slave1，发现出现了 db1 数据库，内部有对应的数据表 travelrecord。====> 逻辑库和物理库映射

## 分片表

​		假设订单表中已经有 600万 条数据，需要分片，分片到不同服务器上的不同数据库。

Mycat 终端创建数据表时进行分片：

```mysql
CREATE TABLE orders(
 id INT AUTO_INCREMENT,
 order_type INT,
 customer_id INT,
 amount DECIMAL(10,2),
 PRIMARY KEY(id),
 KEY `id`(`id`)
) engine=innodb default CHARSET=utf8
dbpartition by mod_hash(customer_id) 
tbpartition by mod_hash(customer_id) 
tbpartitions 1 
dbpartitions 2;
```

> dbpartition 数据库分片方式：此处根据 customer_id 使用 hash模 的方式。
>
> tbpartition 数据表分片方式：此处根据 customer_id 使用 hash模 的方式。
>
> tbpartitions 1 dbpartitions 2 表示数据表分一片，数据库分两片。====> 两个库，每个库里面各分一片（数据的一部分）。

插入测试数据：

```mysql
insert into orders(id, order_type,customer_id,amount) values(1,101,100,100100);
insert into orders(id, order_type,customer_id,amount) values(2,101,100,100300);
insert into orders(id, order_type,customer_id,amount) values(3,101,100,120100);
insert into orders(id, order_type,customer_id,amount) values(4,101,101,103000);
insert into orders(id, order_type,customer_id,amount) values(5,102,101,100400);
insert into orders(id, order_type,customer_id,amount) values(6,102,100,100020);
```

查询数据：

```mysql
mysql> select * from orders;
+------+------------+-------------+-----------+
| id   | order_type | customer_id | amount    |
+------+------------+-------------+-----------+
|    1 |        101 |         100 | 100100.00 |
|    2 |        101 |         100 | 100300.00 |
|    3 |        101 |         100 | 120100.00 |
|    6 |        102 |         100 | 100020.00 |
|    4 |        101 |         101 | 103000.00 |
|    5 |        102 |         101 | 100400.00 |
|    7 |        103 |         101 | 100007.00 |
+------+------------+-------------+-----------+
7 rows in set (0.01 sec)
# 发现前面四条一堆，后面两条一堆，根据 customer_id 分开的。
```

查看 schema 配置信息，已经配置好了相关的信息：

```json
{
	"customTables":{},
	"globalTables":{
		"travelrecord":{
			"broadcast":[
				{
					"targetName":"c0"
				},
				{
					"targetName":"c1"
				}
			],
			"createTableSQL":"CREATE TABLE `db1`.`travelrecord` (\n\t`id` bigint NOT NULL AUTO_INCREMENT,\n\t`user_id` varchar(100) DEFAULT NULL,\n\t`traveldata` date DEFAULT NULL,\n\t`fee` decimal(10, 0) DEFAULT NULL,\n\t`days` int DEFAULT NULL,\n\t`blob` longblob,\n\tPRIMARY KEY (`id`),\n\tKEY `id` (`id`)\n) BROADCAST ENGINE = innodb CHARSET = utf8"
		}
	},
	"normalProcedures":{},
	"normalTables":{},
	"schemaName":"db1",
	"shardingTables":{
		"orders":{
			"createTableSQL":"CREATE TABLE `db1`.orders (\n\tid INT AUTO_INCREMENT,\n\torder_type INT,\n\tcustomer_id INT,\n\tamount DECIMAL(10, 2),\n\tPRIMARY KEY (id),\n\tKEY `id` (`id`)\n) ENGINE = innodb CHARSET = utf8\nDBPARTITION BY mod_hash(customer_id) DBPARTITIONS 2\nTBPARTITION BY mod_hash(customer_id) TBPARTITIONS 1",
			"function":{
				"properties":{
					"dbNum":"2",
					"mappingFormat":"c${targetIndex}/db1_${dbIndex}/orders_${index}",
					"tableNum":"1",
					"tableMethod":"mod_hash(customer_id)",
					"storeNum":2,
					"dbMethod":"mod_hash(customer_id)"
				}
			},
			"shardingIndexTables":{}
		}
	},
	"views":{}
}
```

​		再次查看 master1 和 slave1 的数据库情况：发现 master1 出现数据库 db1_0 ，slave1出现 db_1 数据库。（`物理库`）点开对应的数据库，db1_0 里存在 orders_0 表，db1_1 里存在 orders_1 表。（`物理表`）

## ER 表

​		问题：与分片表关联的表如何分表呢？===> `ER 表如何分表`。（例如上例中的 orders_detail 表：600万）

```mysql
# 订单详细表：ER 表,通过 order_id 与 orders 联系
CREATE TABLE orders_detail(
 id INT not null AUTO_INCREMENT,
 detail VARCHAR(2000),
 order_id INT,
 PRIMARY KEY(id)
)engine=innodb default CHARSET=utf8
dbpartition by mod_hash(order_id) 
tbpartition by mod_hash(order_id) 
tbpartitions 1 
dbpartitions 2;
```

​		并未指定和 orders 的关系，但是`创建后就会和 orders 实现关系连接`。

加入测试数据：

```mysql
INSERT INTO orders_detail(id,detail,order_id) values(1,'detail1',1);
INSERT INTO orders_detail(id,detail,order_id) VALUES(2,'detail2',2);
INSERT INTO orders_detail(id,detail,order_id) VALUES(3,'detail3',3);
INSERT INTO orders_detail(id,detail,order_id) VALUES(4,'detail4',4);
INSERT INTO orders_detail(id,detail,order_id) VALUES(5,'detail5',5);
INSERT INTO orders_detail(id,detail,order_id) VALUES(6,'detail6',6);
```

​		结果发现：此时出现物理表 orders_detail_0 和 orders_detail_1，但是是间隔插入的数据，0 表里面是 2、4、6序号数据，1 表是 1、3、5 序号数据。

在 Mycat 终端测试关联查询：

```mysql
# 结果：发现可以联表查询出正确结果
mysql> select o.*,od.detail from orders o inner join orders_detail od on o.id=od.order_id;
+------+------------+-------------+-----------+---------+
| id   | order_type | customer_id | amount    | detail  |
+------+------------+-------------+-----------+---------+
|    1 |        101 |         100 | 100100.00 | detail1 |
|    2 |        101 |         100 | 100300.00 | detail1 |
|    3 |        101 |         100 | 120100.00 | detail1 |
|    4 |        101 |         101 | 103000.00 | detail1 |
|    5 |        102 |         101 | 100400.00 | detail1 |
|    6 |        102 |         100 | 100020.00 | detail1 |
|    7 |        103 |         101 | 100007.00 | detail7 |
+------+------------+-------------+-----------+---------+
7 rows in set (0.05 sec)
```

​		正确查询出联表查询的应该结果。

> 分析上述两表具有相同的分片算法，分片字段不同，但是可以进行联表查询自动关联上？

Mycat2 在涉及到这两个表的 join 分片字段等价关系时可以完成 join 的下推，在`无需指定 ER 表的情况下完成自动识别`，具体需要看分片算法的接口。

​	查看配置的表是否具有 ER 关系：

```mysql
mysql> /*+ mycat:showErGroup{} */;
+---------+------------+---------------+
| groupId | schemaName | tableName     |
+---------+------------+---------------+
| 0       | db1        | orders        |
| 0       | db1        | orders_detail |
+---------+------------+---------------+
2 rows in set (0.00 sec)
# 发现 group_id 都是 0，即具有相同的存储分布 ===> ER 关系
```

## 分片规则

​		Mycat2 支持常用的（自动）Hash 型分片算法，也兼容 1.6 内置的 cobar 分片算法。但是`使用 Hash 自动型分片算法时要求集群名称以 c 为前缀，数字为后缀`，c0 就是分片表中的第一个节点。该命名规则允许用户手动改变。

分片规则有很多，列举常见的分片规则简介：

1、`mod_hash 分片规则`：对分片键的值进行转化为数值类型再分片。（`最常用`）

​	1）分库键和分表键是`同一个字段`时：相同分片键

- 分表下标 = 分片键当前值 % (分库数量*分表数量)

- 分库下标 = 分表下标 / 分表数量

​	2）分库键和分表键`不同字段`时：不同分片键

	- 分表下标 = 分片键当前值 % 分表数量
	- 分库下标 = 分片键当前值 % 分库数量

2、right_shift 分片规则：分片值右移二进制位数，然后按分片数量取余，也是 hash 型算法。（仅支持数值类型）

3、yyyymm 分片规则用于分库，mmdd 用于分表。

## 全局序列

​		Mycat2 简化了全局序列，`默认使用雪花算法生成全局序列号`，可以通过配置关闭自动全局序列。

> 雪花算法：引入时间戳和 ID 保持自增的分布式 ID 生成算法。

1、建表语句方式关闭全局序列：建表时`不设置 auto_increment 关键字`，则后续mysql就会使用原先的自增方式，而不会使用雪花算法填充。

​				====> 使用默认的雪花算法则就需要加上` auto_increment 关键字`即可。（一般就用默认的）

2、设置 Mycat 数据库方式获取全局序列：

​	1）在对应数据库下运行 dbseq.sql 脚本（Mycat2 已经提供脚本 `mycat/conf/dbseq.sql`），注意`不是通过 Mycat 客户端执行`。

> 注意：此脚本不能修改，直接运行即可！

​	2）添加全局序列配置文件，位于 `mycat/conf/sequences` 目录，添加文件：`{数据库名称}_{表名称}.sequences.json`。（具体内容需搜索）

​	3）重启 mycat 服务，查看 mycat_sequences 数据表。

3、切换为数据库方式全局序列号：（`前提`：已经导入dbseq.sql 脚本，设置了  mycat_sequences  表内的逻辑表记录）

​		通过注释设置为数据库方式全局序列号：

```mysql
/*+ mycat:setSequence{
	"name":"db1_trvelrecord",
	"clazz":"io.mycat.sequence.SequenceMySQLGenerator",
	"name":"db1_db1_trvelrecord",
	"targetName":"protorype",
	"schemaName":"db2"
} */;
```

​		切换回默认的雪花算法：

```mysql
/*+ mycat:setSequence{
	"name":"db1_trvelrecord",
	"time":true
} */;
```

# 安全设置

## user 标签权限控制

​		Mycat 对于中间件的连接控制并没有做太复杂的控制，只做了中间件`逻辑库级别的读写权限控制`，配置文件位于 `mycat/conf/users` 目录。

命名方式：`{用户名}.user.json`，默认有个 root 的配置文件，在配置文件部分已经讲述。

```json
{
        "dialect":"mysql",
        "ip":null,
        "password":"123456",
        "transactionType":"proxy",
        "username":"root"
}
```

## 权限说明

​		Mycat2 权限分为：登陆权限 和 sql权限。

1、登录权限：Mycat2 在 MySQL 网络协议的时候检查客户端的 IP，用户名，密码，其中 IP 使用正则匹配，匹配成功才放行。（`用户配置`）

2、SQL 权限：使用自定义拦截器实现。（额外开发）
