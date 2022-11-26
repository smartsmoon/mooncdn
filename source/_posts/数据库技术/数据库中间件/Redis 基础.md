---
title: Redis 基本使用
date: 2022-05-20 00:00:00
type:
comments:
tags: 
  - Redis
  - 数据库
  - 缓存
  - NoSQL
categories: 
  - 数据库技术
description: 
keywords: Redis
cover: https://w.wallhaven.cc/full/we/wallhaven-weoe9q.jpg
top_img: https://w.wallhaven.cc/full/we/wallhaven-weoe9q.jpg
---

# NoSQL 概述

## NoSQL 来源

`阶段一`：基本的网站访问量不大，同时基本都是使用静态 Html 网页 ========> 单个数据库完全足够，服务器压力不大。那么这种情况下网站的瓶颈是什么呢？

​	1）数据量过大，一个机器放不下。

​	2）数据的索引（B+ Tree），一个机器内存放不下。

​	3）访问量过大，同时数据库读写混合使用，一个服务器承受不住压力。

`阶段二`：使用缓存 Memcache + MySQL + 垂直拆分(读写分离)

​	但是发现相同的 SQL 时也会重复读 MySQL 数据库，因此使用`缓存` Memcache。

`阶段三`：分库分表 + MySQL 水平拆分 + MySQL 集群 + 缓存

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200820103739584.png)

`当今企业架构`：各种各样的数据类型出现，大数据的背景下关系型数据库（RDBMS）无法满足大量数据要求 ====> Nosql 数据库就能轻松解决这些问题。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200820103804572.png)

​		因此，为什么用 NoSQL 呢？

​		社交网络、地理位置、用户数据等，用户日志等等爆发式增长，这时候我们就需要使用 NoSQL 数据库的。

## NoSQL 简述

​		`NoSQL`：`Not Only SQL`，泛指非关系型数据库。其中 Redis 是最流行的 NoSQL。

1）有些数据存储没有固定的格式，例如个人信息等，数据之间没有关系，容易扩展。

2）大数据量高性能（NoSQL 的缓存记录级，是一种细粒度的缓存，性能会比较高）。

3）数据类型多样性（不需要事先设计数据库）。

4）传统的 RDBMS 和 NoSQL 区别。

大数据时代问题(`3V`)：海量、多样、实时。大数据程序要求(`3高`)：高并发、高可扩、高性能。

企业实践：NoSQL + RDBMS 一起使用。

## NoSQL 分类

1、`KV键值对`：`redis`

2、文档型数据库( Bson 格式)：`MongoDB`（基于分布式文件存储，NoSQL中最像关系型数据库的数据库）、ConthDB

3、列存储数据库：`HBase`(大数据)、分布式文件系统

4、图关系数据库：Neo4j、InfoGrid。存放的是关系，用于推荐系统、社交网络。

# Redis 基础

## Redis 简述

`Redis`：Remote Dictionary Server ，远程字典服务，是一种 KV 键值对类型的 NoSQL 数据库。

1）数据缓存在内存，但是会 redis 会周期性进行持久化，并可实现 master-slave 主从同步。

2）免费开源。

3）内存存储 ，并支持持久化 （`RDB、AOF`）

4）效率高，可以用于高速缓存。

5）功能：发布订阅系统、地图信息分析、计时器、计数器(浏览量) . . . . . .

特点：多样数据类型、支持持久化、支持集群、支持事务. . . . . .

## Redis 性能测试

​		在 Redis 的安装目录：`/usr/local/bin` 下，有一个 Redis 官方的压测工具 `redis-benchmark`。

```shell
# 测试 100 个并发连接，每个并发 100000 万个请求
# -h 主机
# -p 端口
# -c 并发线程数
# -n 每个线程的请求数
redis-benchmark -h localhost -p 6379 -c 100 -n 100000

# 分析测试结果：以 set 为例
====== SET ======                                                   
  100000 requests completed in 1.40 seconds		# 10万个请求进行写入测试，花费 1.40 s
  100 parallel clients		# 100个并发客户端
  3 bytes payload			# 每次写入三个字节
  keep alive: 1				# 只有一台 redis 服务处理请求，单机性能
  host configuration "save": 3600 1 300 100 60 10000
  host configuration "appendonly": no
  multi-thread: no
  Latency by percentile distribution:
0.000% <= 0.239 milliseconds (cumulative count 1)
50.000% <= 0.687 milliseconds (cumulative count 51042)
...............................
100.000% <= 3.983 milliseconds (cumulative count 100000)

Cumulative distribution of latencies:
0.000% <= 0.103 milliseconds (cumulative count 0)
0.005% <= 0.303 milliseconds (cumulative count 5)
................................
100.000% <= 4.103 milliseconds (cumulative count 100000)

Summary:
  throughput summary: 71275.84 requests per second			# 表示每秒处理 71275.84 个请求
  latency summary (msec):			# 综合性能
          avg       min       p50       p95       p99       max
        0.777     0.232     0.687     1.255     1.655     3.983
```

## Redis 基础命令

根据 Redis 的配置文件，Redis 默认有 16 个数据库，`默认使用第 0 个数据库`：

```shell
# Set the number of databases. The default database is DB 0, you can select
# a different one on a per-connection basis using SELECT <dbid> where
# dbid is a number between 0 and 'databases'-1
databases 16
```

1、数据库操作：

```shell
# 切换数据库
127.0.0.1:6379> select 3
OK
127.0.0.1:6379[3]>

# 查看当前数据库容量
127.0.0.1:6379[3]> dbsize
(integer) 0
127.0.0.1:6379[3]> set name gaozheng
OK
127.0.0.1:6379[3]> dbsize
(integer) 1

# 清除当前数据库
flushdb

# 清除所有的数据库
flushall
```

>  		Redis 是 key-value 类型的 NoSQL 数据库，无论什么数据类型，在数据库中都是`以 key-value 形式保存`，通过进行对 key 的操作，来完成对数据库中数据的操作。

2、键 key 的相关操作：

```shell
# 查看当前数据库所有的 key
keys *

# 判断某个 key 是否存在
exists key

# 删除某个 key-value
del key

# 将键值对移动到指定数据库 db，例如 move key 1
move key db

# 设置 key 的过期时间 second，单位是 秒
expire key second

# 查看某个 key 存放 value 的数据类型
type key

# 批量设置值
mset k1 v1 k2 v2 k3 v3
# 批量获取值
mget k1 k2 k3
```

3、查看过期时间：-2 代表过期。-1 代表永不过期，其余情况返回当前剩余过期时间。

```shell
ttl key
```

## Redis 分析

​		`Redis 是单线程的`：Redis 是基于内存操作，其性能瓶颈不是 CPU限制，而是`机器内存和网络带宽`，既然可以使用单线程实现，就直接使用单线程实现了。

那么为什么 Redis 是单线程但是如此之快呢？ =====> `10 万+ 的 QPS`，不比 MemeCache 差。

> `误区`：
>
> 1）误区1：高性能的服务器一定是多线程的。`（×）`
>
> 2）误区2：多线程（CPU上下文会切换 ===> 耗时）一定比单线程效率高。`（×）`

​		核心原因：Redis 是将所有的数据放在`内存`中的，所以说使用单线程去操作效率就是最高的，多线程会产生 CPU 上下文会切换，是一个耗时的操作。对于内存系统来说，如果`没有上下文切换效率就是最高的`，多次读写都是在一个 CPU 上的，`在内存存储数据情况下，单线程就是最佳的方案`。

# Redis 数据类型

​		官方说明：Redis 是一个开源（BSD许可），内存存储的数据结构服务器，可用作`数据库`，`高速缓存`和`消息队列`代理。它支持`字符串`、`哈希表`、`列表`、`集合`、`有序集合`，`位图`，`hyperloglogs` 等数据类型。Redis 内置复制、Lua 脚本、LRU 收回、事务以及不同级别磁盘持久化功能，同时通过 Redis Sentinel 提供高可用，通过 Redis Cluster 提供自动分区（集群搭建）。

## String 字符串

​		除了一些基本的命令外，String 还有一些常用的命令：

1、`append`  追加 key 对应的 value，如果 key 不存在，则新建一个 key。

```shell
127.0.0.1:6379> append key1 hello
(integer) 11		# 返回当前该 key 的 value 的长度
127.0.0.1:6379> keys *
1) "key1"
127.0.0.1:6379> get key1
"value1hello"

# 当 key 不存在时，新建
127.0.0.1:6379> append name zhangsan
(integer) 8
127.0.0.1:6379> get name
"zhangsan"
```

2、`strlen`  获取某个 key 对应 value 字符串长度。

```shell
127.0.0.1:6379> strlen key1
(integer) 19
```

3、自加 1 和 自减 1 操作，支持设置步长 step 指定增量。

```shell
# 自加 1 操作：incr
127.0.0.1:6379> set view 0
OK
127.0.0.1:6379> incr view
(integer) 1
127.0.0.1:6379> incr view
(integer) 2

# 自减 1 操作：decr
127.0.0.1:6379> decr view
(integer) 1
127.0.0.1:6379> decr view
(integer) 0

# 自加 step 操作：incrby
127.0.0.1:6379> incrby view 10
(integer) 10
127.0.0.1:6379> incrby view 10
(integer) 20

# 自减 step 操作：decrby
127.0.0.1:6379> decrby view 2
(integer) 18
127.0.0.1:6379> decrby view 2
(integer) 16
127.0.0.1:6379> decrby view 2
(integer) 14
```

4、字符串范围操作，例如截取字符串。

```shell
# 截取字符串，闭区间 [] 截取
127.0.0.1:6379> set name "hello,gaozheng"
OK
127.0.0.1:6379> getrange name 0 4
"hello"
# -1 代表截取所有，和 java 一样
127.0.0.1:6379> getrange name 0 -1
"hello,gaozheng"

# 替换字符串，从指定位置开始的字符串，替换 n 个字符串
127.0.0.1:6379> setrange name 6 xxxx
(integer) 14
127.0.0.1:6379> get name
"hello,xxxxheng"
```

5、`setex` 插值时设置过期时间。

```shell
setex dbname 30 "redis"
# key 为 dbname，过期时间为 30 s， value 为 redis
```

6、`setnx` 当值不存在时设置值，分布式锁中经常使用。

```shell
127.0.0.1:6379> set dbname "redis"
OK
127.0.0.1:6379> setnx dbname "mongoDb"
(integer) 0
127.0.0.1:6379> get dbname
"redis"
# 发现该键存在因此插入失败，返回 0

# 批量按条件设置
127.0.0.1:6379> mset k1 v1 k2 v2 k3 v3
OK
127.0.0.1:6379> keys *
1) "k2"
2) "k3"
3) "k1"
# 如果不存在，则设置 =====> mset 保证原子性
127.0.0.1:6379> msetnx k1 v1 k4 v4
(integer) 0
127.0.0.1:6379> keys *
1) "k2"
2) "k3"
3) "k1"
# 发现虽然 k4 不存在，但是并没有操作成功 =====> 原子性操作：同时失败
```

7、对象 json 字符串类型的 value 操作。

```shell
# 方式一：直接存储对象
127.0.0.1:6379> set user:1 {name:zhangsan,age:3}
OK
127.0.0.1:6379> keys *
1) "k2"
2) "k3"
3) "user:1"
4) "k1"
127.0.0.1:6379> get user:1
"{name:zhangsan,age:3}"

# 方式二：通过 ： 来确定属性 ，使用 mset 进行插入，这是 redis 的一个巧妙设计之处 user:{id}:{field}
127.0.0.1:6379> mset  user:1:name lisi user:1:age 100
OK
127.0.0.1:6379> keys *
1) "user:1:name"
2) "user:1:age"
127.0.0.1:6379> mget user:1:name user:1:age
1) "lisi"
2) "100"
```

8、`getset` 先 get 再 set。

```shell
# 当没有这个 key 时，getset 会先返回当前的存放 null，再插入数据
127.0.0.1:6379> getset db redis
(nil)
127.0.0.1:6379> get db
"redis"
# 当有这个 key 时，getset 会先返回当前的存放的 value，再插入新的 value
127.0.0.1:6379> getset db mongodb
"redis"
127.0.0.1:6379> get db
"mongodb"
```

## List 列表

​		在 Redis 中，可以经过规则定义将 List 当成 栈、队列、阻塞队列 使用，里面存放的都是字符串。（`所有的List 命令都是以 l 开头`）

List 实际上是一个`链表`，before Node after , left, right 都可以插入值，在两边插入或者改动值，效率最高，修改中间元素，效率相对较低。

1、插入的相关操作：`lpush`、`rpush`

​		（1）`lpush` 从列表头部插入（从左边插入），类似于：wangwu lisi zhangsan。

```shell
127.0.0.1:6379> lpush name zhangsan
(integer) 1
127.0.0.1:6379> lpush name lisi
(integer) 2
127.0.0.1:6379> lpush name wangwu
(integer) 3
127.0.0.1:6379> lrange name 0 -1
1) "wangwu"
2) "lisi"
3) "zhangsan"
```

​		（2）`rpush` 从列表的尾部插入（从右边插入），类似于：wangwu lisi zhangsan lalala。

```shell
127.0.0.1:6379> rpush name lalala
(integer) 4
127.0.0.1:6379> lrange name 0 -1
1) "wangwu"
2) "lisi"
3) "zhangsan"
4) "lalala"
```

​		因此整个列表就相当于是一个 ”`双端队列`“。

​		（3）批量插入：

```shell
127.0.0.1:6379> lpush name hello hello1 hello2 hello3 hello4 hello5
(integer) 6
```

2、查询的相关操作：`lrange`、`lindex`、`len`。

​		（1）查找列表具体区间的值（从左边开始计数）。

```shell
127.0.0.1:6379> lrange name 0 1
1) "wangwu"
2) "lisi"
```

​		（2）通过下标获取值（从左边开始计数）。

```shell
127.0.0.1:6379> lindex name 0
"wangwu"
```

​		（3）获取列表长度。

```shell
127.0.0.1:6379> llen name
(integer) 4
```

3、移除的相关操作：`lpop`、`rpop`、`lrem`、`ltrim`。

​		（1）`lpop` 从列表的头部移除（从左边移除），返回移除的元素.

```shell
127.0.0.1:6379> lpop name 1
1) "wangwu"
```

​		（2）`rpop` 从列表的尾部移除（从右边移除），返回移除的元素.

```shell
127.0.0.1:6379> rpop name 1
1) "lalala"
```

​		（3）移除指定的值，这个 1 代表移除的个数(表示 `list 内部可以有重复值`)，返回移除的个数 <======== `精确匹配`。

```shell
127.0.0.1:6379> lrem name 1 lisi
(integer) 1
```

​		（4）截断操作，保留截取的部分（从左到右计数）.

```shell
127.0.0.1:6379> lpush name hello hello1 hello2 hello3 hello4 hello5
(integer) 6
127.0.0.1:6379> lrange name 0 -1
1) "hello5"
2) "hello4"
3) "hello3"
4) "hello2"
5) "hello1"
6) "hello"
127.0.0.1:6379> ltrim name 1 4
OK
127.0.0.1:6379> lrange name 0 -1
1) "hello4"
2) "hello3"
3) "hello2"
4) "hello1"
```

​		（5）移除列表`最后一个元素（尾部元素）`并添加到新列表（数据的转移），返回移除的元素。

```shell
127.0.0.1:6379> rpoplpush name newName
"hello1"
127.0.0.1:6379> lrange name 0 -1
1) "hello4"
2) "hello3"
3) "hello2"
127.0.0.1:6379> lrange newName 0 -1
1) "hello1"
```

4、其他相关操作：`exists`、`lset`、`linsert`。

​		（1）判断某个 list 存在与否：exists.

```shell
127.0.0.1:6379> exists name
(integer) 0
```

​		（2）根据索引插入数据（类似于更新操作），当索引不存在时，会报错。

```shell
127.0.0.1:6379> lset name 0 zhangsan	# lset 需要保证列表存在
(error) ERR no such key
127.0.0.1:6379> lpush name zhangsan		# 插入数据保证 list 存在
(integer) 1
127.0.0.1:6379> lset name 0 lisi		# lset 插入
OK
127.0.0.1:6379> lrange name 0 -1
1) "lisi"
```

​		（3）在某位置插入新的数据：linsert 命令，可选 before（前）、after（后）。

```shell
# 语法：linsert key before/after pivot element
127.0.0.1:6379> lpush name zhangsan
(integer) 1
127.0.0.1:6379> lpush name wangwu
(integer) 2
127.0.0.1:6379> linsert name before zhangsan lisi
(integer) 3
127.0.0.1:6379> lrange name 0 -1
1) "wangwu"
2) "lisi"
3) "zhangsan"
```

列表的应用举例：消息排队、消息队列（Lpush Rpop）、栈（Lpush Lpop）。

## Set 集合

​		Redis 的 Set 是 String 类型的`无序集合`，集合成员唯一，意味着集合中`不能出现重复的数据`。Redis 中 集合是通过哈希表实现的，所以添加，删除，查找的复杂度都是O(1)。最大的成员数为 232 - 1 (4294967295, 每个集合可存储40多亿个成员)。

1、基本的操作：

```shell
# 批量插入数据到 set
127.0.0.1:6379> sadd myset zhangsan lisi wangwu
(integer) 3

# 添加重复元素发现失败：
127.0.0.1:6379> sadd myset wangwu
(integer) 0

# 查询 set 里面的所有数据
127.0.0.1:6379> smembers myset
1) "lisi"
2) "wangwu"
3) "zhangsan"

# 判断 set 中是否包含某个成员，1 表示是，0 表示不是
127.0.0.1:6379> sismember myset wangwu
(integer) 1

# 获取 set 集合中的个数
127.0.0.1:6379> scard myset
(integer) 3

# 移除 set 集合某个元素，移除成功返回 1，移除不存在的或者失败的返回 0
127.0.0.1:6379> srem myset zhangsan
(integer) 1
```

2、特殊操作：由于 set 中数据无序且不重复 =====> 可以随机的得到或删除值。

```shell
# 随机获取 set 中的一个值
127.0.0.1:6379> srandmember myset
"lisi"
127.0.0.1:6379> srandmember myset
"wangwu"

# 随机获取 set 中的指定个数的值
srandmember myset number

# 随机移除元素
spop myset
spop myset number
```

3、`smove` 值的移动：将一个 set 的一个成员移动到另一个 set。

```shell
127.0.0.1:6379> sadd myset1 zhangsan lisi wangwu
(integer) 3
127.0.0.1:6379> sadd myset2 666
(integer) 1
127.0.0.1:6379> smove myset1 myset2 lisi
(integer) 1
127.0.0.1:6379> smembers myset1
1) "wangwu"
2) "zhangsan"
127.0.0.1:6379> smembers myset2
1) "lisi"
2) "666"
```

4、两个 set 的数字集合类：交集、并集、差集。

```shell
127.0.0.1:6379> sadd myset1 a b c d
(integer) 4
127.0.0.1:6379> sadd myset2 c d e f
(integer) 4
# 求 myset1 和 myset2 的差集，以前面的 set 为标准，此例为 myset1
127.0.0.1:6379> sdiff myset1 myset2
1) "b"
2) "a"
# 求 myset1 和 myset2 的交集
127.0.0.1:6379> sinter myset1 myset2
1) "d"
2) "c"
# 求 myset1 和 myset2 的并集
127.0.0.1:6379> sunion myset1 myset2
1) "d"
2) "c"
3) "a"
4) "b"
5) "e"
6) "f"
```

 set 的应用：微博、b站关注的人放在 set，其粉丝也放于 set =====> `共同关注`、共同爱好、推荐好友。

## Hash 集合

​		Hash 集合类型： `key-Map` 类型，value 是 Map 类型。

1、设置和获取值的操作：

```shell
# 将哈希表 key 中的字段 field 的值设为 value ，重复设置同一个 field 会`覆盖`
127.0.0.1:6379> hset myhash name zhangsan
(integer) 1
# 获取 hash 某个 key 的值
127.0.0.1:6379> hget myhash name
"zhangsan"

# 批量设置值和获取值
127.0.0.1:6379> hmset hash1 name zhangsan age 18 sex men
OK
127.0.0.1:6379> hmget hash1 name age sex
1) "zhangsan"
2) "18"
3) "men"

# 获取哈希表中所有的 key 和 value
127.0.0.1:6379> hgetall hash1
1) "name"
2) "zhangsan"
3) "age"
4) "18"
5) "sex"
6) "men"

# 获取 哈希表中所有的 key（字段）
127.0.0.1:6379> hkeys hash1
1) "name"
2) "age"
3) "sex"

# 获取哈希表中 key 字段的个数
127.0.0.1:6379> hlen hash1
(integer) 3

# 获取哈希表中所有的值
127.0.0.1:6379> hvals hash1
1) "zhangsan"
2) "18"
3) "men"
```

2、移除字段的操作：

```shell
# 批量删除字段
127.0.0.1:6379> hdel hash1 name age
(integer) 2
127.0.0.1:6379> hkeys hash1
1) "sex"
```

3、条件插入和判断：

```shell
# 判断指定字段是否存在，存在返回 1
127.0.0.1:6379> hexists hash1 name
(integer) 1

# 只有在该字段不存在时，才设置哈希表字段的值。
127.0.0.1:6379> hsetnx hash1 name lisi		# 已经存在该字段，设置失败返回 0
(integer) 0
127.0.0.1:6379> hsetnx hash1 hobby games	# 不存在该字段，设置成功返回 1
(integer) 1
```

4、增量操作：

```shell
# 为哈希表 key 中的指定字段的`整数值`加上增量n，并返回增量后结果，只适用于整数型字段
# 语法：hincrby key field number
127.0.0.1:6379> hget hash1 age
"18"
127.0.0.1:6379> hincrby hash1 age 1
(integer) 19

# 为哈希表 key 中的指定字段的`浮点数值`加上增量 n。
# 语法：hincrbyfloat key field number
```

Hash 适合存储变更的数据 user name age，尤其是用户信息之类的，经常变动的信息。====> `Hash 更适合于对象的存储，Sring 更加适合字符串存储！`。

## Zset 有序集合

​		在一般的 set 基础上，增加了一个 double 类型的分数（`score`），用此来进行排序，当 score 相同时，用字典序排序。

1、添加操作：

```shell
# 语法：zadd key score value
# 添加一个值
127.0.0.1:6379> zadd zset01 1 one
(integer) 1
# 批量添加
127.0.0.1:6379> zadd zset01 2 two 3 three
(integer) 2
```

2、查询操作：

```shell
# 根据范围查询 value
127.0.0.1:6379> zrange zset01 0 -1
1) "one"
2) "two"
3) "three"

# 查询成员数量
127.0.0.1:6379> zcard zset01
(integer) 3
```

3、排序操作：

```shell
# zrange 查询默认是按照从小到大排序
127.0.0.1:6379> zadd salary 2500 xiaohong
(integer) 1
127.0.0.1:6379> zadd salary 2000 zhangsan
(integer) 1
127.0.0.1:6379> zadd salary 3000 lisi
(integer) 1
127.0.0.1:6379> zadd salary 500 laji
(integer) 1
127.0.0.1:6379> zrange salary 0 -1
1) "laji"
2) "zhangsan"
3) "xiaohong"
4) "lisi"

# 从大到小降序排列
127.0.0.1:6379> zrevrange salary 0 -1 withscores
1) "lisi"
2) "3000"
3) "zhangsan"
4) "2000"
5) "laji"
6) "500"

# 带上分数排序：根据分数排序 zrangebyscore
127.0.0.1:6379> zrangebyscore salary -inf +inf withscores
1) "laji"
2) "500"
3) "zhangsan"
4) "2000"
5) "xiaohong"
6) "2500"
7) "lisi"
8) "3000"

# 显示工资小于 2500 的员工升序
127.0.0.1:6379> zrangebyscore salary -inf 2500 withscores
1) "laji"
2) "500"
3) "zhangsan"
4) "2000"
5) "xiaohong"
6) "2500"
```

4、移除操作：

```shell
# 移除某一个具体的成员
127.0.0.1:6379> zrem salary xiaohong
(integer) 1
```

5、统计操作：

```shell
127.0.0.1:6379> zadd zset1 1 hello 2 world 3 caixukun
(integer) 3
# 获取区间内的成员数量
127.0.0.1:6379> zcount zset1 1 3
(integer) 3
```

应用案例：班级表排序、工资表排序、消息分级（普通消息1、重要消息 2）、`排行榜 Top N`。

## Geospatial 地理位置

​		经纬度查询网站：`https://jingweidu.bmcx.com/`。

作用： 可以实现推算地理位置信息，两地举例等，完成 `附近的人` 功能。

1、`getadd` 添加位置：（注意`两极`是无法添加的）。

```shell
# 批量添加位置语法：geoadd key longitud(经度) latitude(纬度) member [..]
127.0.0.1:6379> geoadd china:city 116.40 39.90 beijing
(integer) 1
...........
127.0.0.1:6379> geoadd china:city 120.16 30.24 hangzhou 108.96 34.26 xian
(integer) 2

# 
```

> 有效的经度从 -180度到180度，有效的纬度从 -85.05112878 度到 85.05112878 度。
>

2、`geopos` 获取指定位置的经纬度位置(之前设置进去的)。

```shell
# 查询 beijing 的地理位置
127.0.0.1:6379> geopos china:city beijing
1) 1) "116.39999896287918091"
   2) "39.90000009167092543"
```

3、`geodist` 可用于获取两个经纬度位置的直线距离。=====> `两人之间的距离的实现`。

```shell
# 默认单位是 米
127.0.0.1:6379> geodist china:city shenzhen shanghai
"1215922.3698"
# 可设置单位为 km，mi(英里)，ft(英尺)
127.0.0.1:6379> geodist china:city shenzhen shanghai km
"1215.9224"
```

4、`georadius` 用于以给定的经纬度为中心，找出某一半径内的其他元素。

​		附近的人如何实现呢？通过`半径`来搜索，前提是地理位置存在于这个 key 内。

```shell
127.0.0.1:6379> georadius china:city 110 30 500 km
1) "chongqing"
2) "xian"
127.0.0.1:6379> georadius china:city 110 30 500 km withcoord
1) 1) "chongqing"
   2) 1) "106.49999767541885376"
      2) "29.52999957900659211"
2) 1) "xian"
   2) 1) "108.96000176668167114"
      2) "34.25999964418929977"
# 参数：
# withcoord 显示目标经纬度
# withdist 显示到中心的直线距离
# count number 指定数量
```

5、`georadiusbymember` 根据给定的地理位置为中心，找出某一半径内的其他元素。

```shell
127.0.0.1:6379> georadiusbymember china:city beijing 1000 km
1) "beijing"
2) "xian"
# 注意：包括了自身
```

6、`geohash` 返回 11 个字符的经纬度转化为  geohash 字符串。（`没用`）

实际上，这个数据类型就是 zset，可以直接使用 zset 的命令：

```shell
127.0.0.1:6379> zrange china:city 0 -1
1) "chongqing"
2) "xian"
3) "shenzhen"
4) "hangzhou"
5) "shanghai"
6) "beijing"
# 其他命令也可以使用
```

## Hyperloglog 基数统计

​		什么是`基数`：数据集中`不重复的元素`的个数。

​		`Redis HyperLogLog` 是用来做`基数统计的算法`，计算基数所需的空间总是固定很小的。花费 12 KB 内存，就可以计算接近 2^64 个不同元素的基数。

因为 HyperLogLog 只会根据输入元素来计算基数，而不会储存输入元素本身，所以 HyperLogLog 不能像集合那样，返回输入的各个元素。

其底层使用string数据类型

应用场景：网页的 UV（访问量统计：一个人访问同一个网站多次，也只能算作一个）

1）传统方式：使用 Set 保存用户的 id，以 id 个数作为标准判断。 ======> 占用内存大。

2）新方法：使用 HyperLogLog 算法，利用 `pfadd`、`pfcount`、`pfmerge` 命令可以实现只占用最大 12k 的内存就能完成基数统计。

```shell
127.0.0.1:6379> pfadd mykey a b c d e f		# 创建第一组元素
(integer) 1
127.0.0.1:6379> pfcount mykey		# 统计基数数量
(integer) 6
127.0.0.1:6379> pfadd mykey2 e f g h i j
(integer) 1
127.0.0.1:6379> pfcount mykey2
(integer) 6
127.0.0.1:6379> pfmerge mykey3 mykey mykey2		# 合并两组成为 mykey3
OK
127.0.0.1:6379> pfcount mykey3
(integer) 10
```

如果允许容错，那么可以使用 Hyperloglog ，不允许容错，就使用 set 或者自己的数据类型即可 。

## Bitmaps 位图

​		信息状态就只有两个状态的：1 和 0，那么就可以使用 Bitmaps，操作二进制位来记录，只有 1 和 0 两个状态。

应用场景：统计用户信息：活跃 和 不活跃？ 登录 和 未登录？打卡 和 未打卡？例如 365 天打卡，只需要 365 bit = 46 字节。

```shell
# 举例：以一周打卡为例，1 代表签到 0 代表未签到
127.0.0.1:6379> setbit sign 1 1
(integer) 0
127.0.0.1:6379> setbit sign 2 1
(integer) 0
127.0.0.1:6379> setbit sign 3 0
(integer) 0
127.0.0.1:6379> setbit sign 4 0
(integer) 0
127.0.0.1:6379> setbit sign 5 1
(integer) 0
127.0.0.1:6379> setbit sign 6 1
(integer) 0
127.0.0.1:6379> setbit sign 7 1
(integer) 0
# 这样的话组成的就像是：1 1 0 0 1 1 1 一共 7bit，存储空间占用少

# 那么如何查看某一天是否打卡呢？ getbit 方法
127.0.0.1:6379> getbit sign 4
(integer) 0

# 那么怎么统计打卡的参数呢？bitcount 方法
127.0.0.1:6379> bitcount sign
(integer) 5
```

# Redis 事务

> Redis 事务的本质：一组命令的集合，`类似于一个队列`。
>
> ​			类同于：set 语句 	set 语句	 set 语句 (执行)
>
> 事务中每条命令都会被序列化，执行过程中按顺序执行，不允许其他命令进行干扰。
>
> 对应着：			`一次性`							`顺序性`								`排他性`
>
> `注意`：（必须知道）
>
> 1）Redis 事务没有隔离级别的概念，所有的命令在事务中并没有被执行，只有发起执行命令时才会统一执行 `Exec`。
>
> 2）Redis 的`单条命令是保证原子性的`，但是 `Redis 事务不能保证原子性`。

Redis 的事务三步骤：1）开启事务(`multi`)；2）命令入队(`正常命令`)；3）执行事务(`exec`)

## 正常执行事务

> 正常情况下，会按照顺序，一次性且不会相互影响的执行事务。当`这个事务执行完毕后就释放了`，再需要用就需要重新开启。
>

```shell
# 开启事务，开启后数据库会标记为 TX，代表事务
127.0.0.1:6379> multi
OK
# 命令入队
127.0.0.1:6379(TX)> set k1 v1
QUEUED
# 命令入队
127.0.0.1:6379(TX)> set k2 v2
QUEUED
# 命令入队
127.0.0.1:6379(TX)> get k2
QUEUED
# 命令入队
127.0.0.1:6379(TX)> set k3 v3
QUEUED
# 执行事务
127.0.0.1:6379(TX)> exec
1) OK
2) OK
3) "v2"
4) OK
```

## 放弃事务

> 放弃事务：放弃事务后`这个事务队列的所有命令都不会执行`了。

```shell
127.0.0.1:6379> multi
OK
127.0.0.1:6379(TX)> set k1 v1
QUEUED
127.0.0.1:6379(TX)> set k4 v4 
QUEUED
127.0.0.1:6379(TX)> discard		# 取消事务
OK
127.0.0.1:6379> get k4
(nil)
# 证明放弃事务后，set k4 v4 并没有得到执行
```

## 事务错误

1、编译时异常：代码语法错误，导致所有的命令都不会执行。

```shell
127.0.0.1:6379> multi
OK
127.0.0.1:6379(TX)> set k1 v1
QUEUED
127.0.0.1:6379(TX)> set k2 v2
QUEUED
127.0.0.1:6379(TX)> error k1
(error) ERR unknown command 'error', with args beginning with: 'k1' 
127.0.0.1:6379(TX)> get k2
QUEUED
127.0.0.1:6379(TX)> exec
(error) EXECABORT Transaction discarded because of previous errors.
127.0.0.1:6379> get k1		# 发现这个事务队列的命令全部没有执行
(nil)
```

2、运行时异常：代码逻辑错误，其他命令可以正常执行。 ========> `此处就说明了 Redis 事务并不能保证原子性`

```shell
127.0.0.1:6379> multi
OK
127.0.0.1:6379(TX)> incr k1		# 字符串不能自增 1
QUEUED
127.0.0.1:6379(TX)> discard
OK
127.0.0.1:6379> multi
OK
127.0.0.1:6379(TX)> set k1 "v1"
QUEUED
127.0.0.1:6379(TX)> incr k1
QUEUED
127.0.0.1:6379(TX)> set k2 v2
QUEUED
127.0.0.1:6379(TX)> set k3 v3
QUEUED
127.0.0.1:6379(TX)> get k3
QUEUED
127.0.0.1:6379(TX)> exec
1) OK
2) (error) ERR value is not an integer or out of range		# 由于字符串自增 1 报错
3) OK
4) OK
5) "v3"
# 发现其中有命令报错，但是其他命令正常执行 =====> 没有原子性
```

## Redis 乐观锁

> `悲观锁`直接上锁再处理数据，很影响性能，而`乐观锁`只会在更新数据的时候去判断在此期间是否有人修改过这个数据(`version 字段`)

​		Redis 使用 `watch key` 监控指定数据，相当于使用`乐观锁`加锁。

1、单客户端情况下，事务过程中正常执行，期间数据没有发生变动：

```shell
127.0.0.1:6379> set money 100
OK
127.0.0.1:6379> set out 0
OK
127.0.0.1:6379> watch money
OK
127.0.0.1:6379> multi
OK
127.0.0.1:6379(TX)> decrby money 20
QUEUED
127.0.0.1:6379(TX)> incrby out 20
QUEUED
127.0.0.1:6379(TX)> exec
1) (integer) 80
2) (integer) 20
```

2、多个客户端同时操作情况下，

客户端 1：

```shell
127.0.0.1:6379> set money 100
OK
127.0.0.1:6379> set out 0
OK
127.0.0.1:6379> watch money
OK
127.0.0.1:6379> multi
OK
127.0.0.1:6379(TX)> decrby money 20
QUEUED
127.0.0.1:6379(TX)> incrby out 20
QUEUED
# 这一步等到 客户端 2 修改后再执行提交事务（原本的数据发生了变化）
127.0.0.1:6379(TX)> exec
(nil)		# 返回 nil 就代表事务提交失败，命令未执行成功
```

客户端 2 ：

```shell
127.0.0.1:6379> get money
"100"
127.0.0.1:6379> set money 1000
OK
```

需要注意的是，`用完了 watch 监视，需要解锁`：（相当于放弃之前的 version 版本，获取最新的 version)

```shell
unwatch
```

# Jedis

## 基本操作

​		Jedis 是 Redis 官方推荐使用的 Java 连接 Redis 的客户端。

1、创建一个 maven 项目，导入 jedis 依赖：

```xml
<dependencies>
    <!--导入jedis的包-->
    <dependency>
        <groupId>redis.clients</groupId>
        <artifactId>jedis</artifactId>
        <version>3.2.0</version>
    </dependency>
    <!--fastjson-->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>fastjson</artifactId>
        <version>1.2.70</version>
    </dependency>
</dependencies>
```

2、建立测试程序，连接远程的 Redis-Server 服务。

```java
public class TestPing {
    public static void main(String[] args) {
        //准备远程连接
        Jedis jedis = new Jedis("8.142.92.222", 6379);
        //设置权限密码
        jedis.auth("gaozheng1998");
        //进行连通性检查
        System.out.println("jedis.ping() = " + jedis.ping());
    }
}
```

测试结果为 pong，证明连同。

```shell
jedis.ping() = PONG
```

3、使用 jedis 进行 redis 的基本操作：

```java
public class TestKeyExample {
    public static void main(String[] args) {
        //准备远程连接
        Jedis jedis = new Jedis("8.142.92.222", 6379);
        //设置权限密码
        jedis.auth("gaozheng1998");
        //进行连通性检查
        System.out.println("jedis.ping() = " + jedis.ping());

        System.out.println("清空数据库 —— " + jedis.flushAll());
        System.out.println("判断某个键是否存在 —— "+jedis.exists("name"));
        System.out.println("新增<name:gaozheng> ——"+jedis.set("name","gaozheng"));
        System.out.println("新增<password:gaozheng1998> ——"+jedis.set("password","gaozheng1998"));
        System.out.println("系统中所有的键 ——" +jedis.keys("*"));
        System.out.println("删除 password 的键值对 ——"+jedis.del("password"));
        System.out.println("查看键 username 所存储值的类型 --" + jedis.type("name"));
        System.out.println("随即返回 key 中的一个 --" + jedis.randomKey());
        System.out.println("重命名 key --" + jedis.rename("name", "username"));
        System.out.println("取出改后的 name --" + jedis.get("username"));
        System.out.println("按索引查询 --" + jedis.select(0));
        System.out.println("删除当前数据库的所有 key --" + jedis.flushDB());
        System.out.println("当前数据库的 key 的数目--" + jedis.dbSize());
        System.out.println("清空数据库 —— " + jedis.flushAll());
    }
}
```

> 总结：实际上使用 Jedis 就和之前使用命令行客户端没有区别，没有很大变化，`基本一模一样`。

## 事务操作

​		事务操作命令和之前控制台操作并没有区别，使用 `multi 开启事务`，`exec 执行事务`，`discard 取消事务`。

1、正常情况下，没有任何异常：

```java
public class TestTX {
    public static void main(String[] args) {
        //连接远程 redis
        Jedis jedis = new Jedis("8.142.92.222", 6379);
        jedis.auth("gaozheng1998");

        //开启事务,获取事务对象
        Transaction multi = jedis.multi();
        //具体业务
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("message", "Hello,World");
        jsonObject.put("name", "gaozheng");
        String result = jsonObject.toJSONString();

        try {
            multi.set("user1", result);
            multi.set("user2", result);
            //执行操作
            multi.exec();
        } catch (Exception e){
            //执行失败则事务放弃
            multi.discard();
            e.printStackTrace();
        } finally {
            //关闭连接
            System.out.println("user1" + jedis.get("user1"));
            System.out.println("user2" + jedis.get("user2"));
            jedis.close();
        }
    }
}
```

结果为：

```cmd
user1{"name":"gaozheng","message":"Hello,World"}
user2{"name":"gaozheng","message":"Hello,World"}
```

正常情况下，事务正常提交，数据正常存储。

2、当在代码中模拟一个 `1/0 异常`，则就会抛出异常，事务执行失败，会走取消事务 discard 代码。

```java
multi.set("user1", result);
multi.set("user2", result);
int i = 1 / 0;		// 设置异常情况
//执行操作
multi.exec();
```

结果则会是存储失败，同时还会抛出异常：

```cmd
java.lang.ArithmeticException: / by zero at com.example.TestTX.main(TestTX.java:25)
user1null
user2null
```

# SpringBoot 整合 Redis

Springboot 操作数据都是`使用 Spring Data`：可以整合众多的 SQL 和 NoSQL 数据库（其中包括 Redis）。

## Redis 整合

需要的 Redis 依赖：

```xml
<!-- redis 依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

但实际上，这个依赖包括三个依赖部分：boot-starter、redis、`lettuce`(替换原来的 jedis)

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
        <version>2.7.0</version>
        <scope>compile</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.data</groupId>
        <artifactId>spring-data-redis</artifactId>
        <version>2.7.0</version>
        <scope>compile</scope>
    </dependency>
    <dependency>
        <groupId>io.lettuce</groupId>
        <artifactId>lettuce-core</artifactId>
        <version>6.1.8.RELEASE</version>
        <scope>compile</scope>
    </dependency>
</dependencies>
```

> 说明：在 `SpringBoot 2.X` 之后，原来的` Jedis 被替换为了 lettuce `，因此默认导入的是 lettuce。
>
> `Jedis 和 lettuce 区别`
>
> Jedis ：采用的是`直连`的服务，如果有多个线程操作的话是不安全的，就需要使用 Jedis Pool 连接池取解决，问题就会比较多。 `BIO 模式`
>
> lettuce ：底层采用 `Netty` ，实例可以在多个线程中共享，不存在线程不安全的情况，可以减少线程数据了，性能更高。`NIO 模式`

​		根据之前的 SpringBoot 源码分析可以猜想，自动配置类是 `RedisAutoConfiguration`，属性配置文件是 `RedisProperties`，发现前缀是：“spring.redis”

```java
@AutoConfiguration
@ConditionalOnClass(RedisOperations.class)
@EnableConfigurationProperties(RedisProperties.class)
@Import({ LettuceConnectionConfiguration.class, JedisConnectionConfiguration.class })
public class RedisAutoConfiguration {
   // 默认的 RedisTemplate 没有过多的设置，redis 对象都需要序列化
   //两个泛型都是 Object 类型，我们使用需要强转
   @Bean
   @ConditionalOnMissingBean(name = "redisTemplate")	//这个注解告诉我们可以自己定义一个 redisTemplate 来覆盖原有的默认 redisTemplate
   @ConditionalOnSingleCandidate(RedisConnectionFactory.class)
   public RedisTemplate<Object, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {// 注意需要使用 redisTemplate 命名
      RedisTemplate<Object, Object> template = new RedisTemplate<>();
      template.setConnectionFactory(redisConnectionFactory);
      return template;
   }

   @Bean
   @ConditionalOnMissingBean  //由于 string 最常使用，因此单独提出了一个 bean：stringRedisTemplate
   @ConditionalOnSingleCandidate(RedisConnectionFactory.class)
   public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory redisConnectionFactory) {
      return new StringRedisTemplate(redisConnectionFactory);
   }

}
```

配置 redis 服务的设置：

```java
# 配置 redis
spring:
  redis:
    host: 8.142.92.222
    port: 6379
    password: gaozheng1998
```

redis 操作测试：

```java
// 这就是之前 RedisAutoConfiguration 源码中的 Bean
@Autowired
private RedisTemplate redisTemplate;

@Test
void contextLoads() {
	/** redisTemplate 操作不同的数据类型，API 和 Redis-cli 客户端中的是一样操作
	 * opsForValue 类似于 Redis 中的 String
	 * opsForList 类似于 Redis 中的 List
	 * opsForSet 类似于 Redis 中的 Set
	 * opsForHash 类似于 Redis 中的 Hash
	 * opsForZSet 类似于 Redis 中的 ZSet
	 * opsForGeo 类似于 Redis 中的 Geospatial 地图
	 * opsForHyperLogLog 类似于 Redis 中的 HyperLogLog
	 */

	// 除了基本的操作，常用的命令都可以直接通过 redisTemplate 操作，比如事务、基本的 crud 等。

	// 和数据库相关的操作都需要通过连接操作！
	//RedisConnection connection = redisTemplate.getConnectionFactory().getConnection();
	//connection.flushDb();

    // 测试
	redisTemplate.opsForValue().set("key", "呵呵");
	System.out.println(redisTemplate.opsForValue().get("key"));
}
```

## 序列化问题

​		使用默认的 序列化方式来测试存储 `对象` ，结果会怎样呢？

User：

```java
@Component
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private String name;
    private int age;
}
```

测试类：

```java
@SpringBootTest
class SpringbootRedisApplicationTests {

    @Autowired
    private RedisTemplate redisTemplate;

    @Test
    void contextLoads() {
        User user = new User("图图",20);
        // 真实开发一般是先转成 json 再存储
        // String jsonUser = new ObjectMapper().writeValueAsString(user);
        redisTemplate.opsForValue().set("user", user);
        System.out.println(redisTemplate.opsForValue().get("user"));
    }
}
```

此处未使用 json 序列化，则会直接报错：`SerializationException`。

```cmd
org.springframework.data.redis.serializer.SerializationException: Cannot serialize; nested exception is org.springframework.core.serializer.support.SerializationFailedException: Failed to serialize object using DefaultSerializer; nested exception is java.lang.IllegalArgumentException: DefaultSerializer requires a Serializable payload but received an object of type [com.example.pojo.User]
```

所以一般的实体类都需要序列化。

## 自定义 Redis 序列化

向数据库中插入了一个中文字符串，虽然在 Java 端可以看到返回了中文，但是在 Redis 中查看，发现 key 是乱码：

```shell
"\xac\xed\x00\x05t\x00\x03key"
```

原因：“`未序列化的结果`”，那么 redis 内部如何实现的序列化呢？

1、在 RedisAutoConfiguration 类的 redisTemplate 方法中用到了一个 RedisTemplate 的对象：

![在这里插入图片描述](https://www.freesion.com/images/54/95f7e455c15ad7200e961f94b7645d06.png)

2、点进 redisTemplate ：

![在这里插入图片描述](https://www.freesion.com/images/23/bd12798c921f2f282149e5ac490738df.png)

3、查看源码如何序列化的：使用 jdk 默认的序列化

![在这里插入图片描述](https://www.freesion.com/images/704/884a3d0aeb7e2da5d591fd76d2f88b10.png)

而当使用默认的序列化方式时，即：implements Serializable

```java
@Component
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User implements Serializable {
    private String name;
    private int age;
}
```

但是发现结果仍然是乱码：

```shell
127.0.0.1:6379> get "\xac\xed\x00\x05t\x00\x04user"
"\xac\xed\x00\x05sr\x00\x15com.example.pojo.User\x95\xb3m\xea\xed\x80<E\x02\x00\x02I\x00\x03ageL\x00\x04namet\x00\x12Ljava/lang/String;xp\x00\x00\x00\x14t\x00\x06\xe5\x9b\xbe\xe5\x9b\xbe"
```

因此需要自定义序列化方式，那么`如何自定义序列化方式`呢？

默认的序列化可能会使 JDK 转义，因此我们需要：JSON 序列化，所以就需要`自定义一个配置类 RedisConfig`。

```java
@Configuration
public class RedisConfig {
    
    //编写自己的 redisTemplate：使用原来的作为基本模板进行修改
    @Bean
    @SuppressWarnings("all")
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) throws UnknownHostException {
        // 为了开发方便，直接使用 <String, Object> 类型
        RedisTemplate<String, Object> template = new RedisTemplate();
        template.setConnectionFactory(redisConnectionFactory);

        // Json 配置序列化
        // 使用 jackson 解析任意的对象
        Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer<>(Object.class);
        // 使用 objectMapper 进行转义
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        objectMapper.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
        jackson2JsonRedisSerializer.setObjectMapper(objectMapper);
        
        // String 的序列化
        StringRedisSerializer stringRedisSerializer = new StringRedisSerializer();

        //分别设置各种对象的序列化方式
        // key 采用 String 的序列化方式
        template.setKeySerializer(stringRedisSerializer);
        // Hash 的 key 采用 String 的序列化方式
        template.setHashKeySerializer(stringRedisSerializer);
        // value 采用 jackson 的序列化方式
        template.setValueSerializer(jackson2JsonRedisSerializer);
        // Hash 的 value 采用 jackson 的序列化方式
        template.setHashValueSerializer(jackson2JsonRedisSerializer);
        // 把所有的配置 set 进 template
        template.afterPropertiesSet();

        return template;
    }
}
```

结果发现：序列化乱码问题解决：

```shell
127.0.0.1:6379> get user
"[\"com.example.pojo.User\",{\"name\":\"\xe5\x9b\xbe\xe5\x9b\xbe\",\"age\":20}]"
```

## Redis 工具类

在企业中，基本都不会使用上面的原生的方式编写代码，而是会写一个 `RedisUtils` 工具类。

```java
package com.example.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Component
public class RedisUtils {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // ============================= common ============================
    /**
     * 指定缓存过期时间
     * @param key 键
     * @param time 时间 s
     */
    public boolean expire(String key, long time) {
        try {
            if(time > 0){
                redisTemplate.expire(key,time, TimeUnit.SECONDS);
            }
            return true;
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 获取缓存过期时间
     * @param key 键，不能为 null
     * @return 时间(秒) 返回 0 代表永不过期
     */
    public long getExpire(String key) {
        return redisTemplate.getExpire(key, TimeUnit.SECONDS);
    }

    /**
     * 判断某个 key 是否存在
     * @param key 键
     * @return true 代表存在
     */
    public boolean hasKey(String key){
        try {
            return redisTemplate.hasKey(key);
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 删除缓存数据
     * @param key 键，可能包含多个
     */
    @SuppressWarnings("unchecked")
    public void delCache(String... key){
        if (key != null && key.length > 0){
            if (key.length == 1){
                redisTemplate.delete(key[0]);
            }else {
                redisTemplate.delete((Collection<String>) CollectionUtils.arrayToList(key));
            }
        }
    }

    // ============================ String =============================
    /**
     * 获取普通缓存
     * @param key 键
     * @return 值
     */
    public Object get(String key){
        return key == null ? null : redisTemplate.opsForValue().get(key);
    }

    /**
     * 设置普通缓存数据
     * @param key 键
     * @param value 值
     * @return 插入结果
     */
    public boolean set(String key, Object value){
        try {
            redisTemplate.opsForValue().set(key, value);
            return true;
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 设置普通缓存数据，并设置过期时间
     * @param key 键
     * @param value 值
     * @param time 过期时间，设置小于等于 0 ，则代表设置无限期
     * @return 设置结果
     */
    public boolean set(String key, Object value, long time){
        try {
            if (time > 0){
                redisTemplate.opsForValue().set(key, value, time, TimeUnit.SECONDS);
            }else {
                set(key, value);
            }
            return true;
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 递增
     * @param key 键
     * @param delta 要增加几（大于 0）
     */
    public long increment(String key, long delta){
        if (delta < 0){
            throw new RuntimeException("递增因子必须大于 0");
        }
        return redisTemplate.opsForValue().increment(key, delta);
    }

    /**
     * 递减
     * @param key 键
     * @param delta 要减少几（大于 0）
     */
    public long decrement(String key, long delta){
        if (delta < 0){
            throw new RuntimeException("递减因子必须大于 0");
        }
        return redisTemplate.opsForValue().increment(key, -delta);
    }

    // ================================ Map =================================

    /**
     * HashGet
     * @param key  键 不能为null
     * @param item 项 不能为null
     */
    public Object hget(String key, String item) {
        return redisTemplate.opsForHash().get(key, item);
    }

    /**
     * 获取hashKey对应的所有键值
     * @param key 键
     * @return 对应的多个键值
     */
    public Map<Object, Object> hmget(String key) {
        return redisTemplate.opsForHash().entries(key);
    }

    /**
     * HashSet
     * @param key 键
     * @param map 对应多个键值
     */
    public boolean hmset(String key, Map<String, Object> map) {
        try {
            redisTemplate.opsForHash().putAll(key, map);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    /**
     * HashSet 并设置时间
     * @param key  键
     * @param map  对应多个键值
     * @param time 时间(秒)
     * @return true成功 false失败
     */
    public boolean hmset(String key, Map<String, Object> map, long time) {
        try {
            redisTemplate.opsForHash().putAll(key, map);
            if (time > 0) {
                expire(key, time);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    /**
     * 向一张hash表中放入数据,如果不存在将创建
     *
     * @param key   键
     * @param item  项
     * @param value 值
     * @return true 成功 false失败
     */
    public boolean hset(String key, String item, Object value) {
        try {
            redisTemplate.opsForHash().put(key, item, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 向一张hash表中放入数据,如果不存在将创建
     *
     * @param key   键
     * @param item  项
     * @param value 值
     * @param time  时间(秒) 注意:如果已存在的hash表有时间,这里将会替换原有的时间
     * @return true 成功 false失败
     */
    public boolean hset(String key, String item, Object value, long time) {
        try {
            redisTemplate.opsForHash().put(key, item, value);
            if (time > 0) {
                expire(key, time);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    /**
     * 删除hash表中的值
     *
     * @param key  键 不能为null
     * @param item 项 可以使多个 不能为null
     */
    public void hdel(String key, Object... item) {
        redisTemplate.opsForHash().delete(key, item);
    }


    /**
     * 判断hash表中是否有该项的值
     *
     * @param key  键 不能为null
     * @param item 项 不能为null
     * @return true 存在 false不存在
     */
    public boolean hHasKey(String key, String item) {
        return redisTemplate.opsForHash().hasKey(key, item);
    }


    /**
     * hash递增 如果不存在,就会创建一个 并把新增后的值返回
     *
     * @param key  键
     * @param item 项
     * @param by   要增加几(大于0)
     */
    public double hincr(String key, String item, double by) {
        return redisTemplate.opsForHash().increment(key, item, by);
    }


    /**
     * hash递减
     *
     * @param key  键
     * @param item 项
     * @param by   要减少记(小于0)
     */
    public double hdecr(String key, String item, double by) {
        return redisTemplate.opsForHash().increment(key, item, -by);
    }


    // ============================ set =============================

    /**
     * 根据key获取Set中的所有值
     * @param key 键
     */
    public Set<Object> sGet(String key) {
        try {
            return redisTemplate.opsForSet().members(key);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    /**
     * 根据value从一个set中查询,是否存在
     *
     * @param key   键
     * @param value 值
     * @return true 存在 false不存在
     */
    public boolean sHasKey(String key, Object value) {
        try {
            return redisTemplate.opsForSet().isMember(key, value);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    /**
     * 将数据放入set缓存
     *
     * @param key    键
     * @param values 值 可以是多个
     * @return 成功个数
     */
    public long sSet(String key, Object... values) {
        try {
            return redisTemplate.opsForSet().add(key, values);
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }


    /**
     * 将set数据放入缓存
     *
     * @param key    键
     * @param time   时间(秒)
     * @param values 值 可以是多个
     * @return 成功个数
     */
    public long sSetAndTime(String key, long time, Object... values) {
        try {
            Long count = redisTemplate.opsForSet().add(key, values);
            if (time > 0)
                expire(key, time);
            return count;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }


    /**
     * 获取set缓存的长度
     *
     * @param key 键
     */
    public long sGetSetSize(String key) {
        try {
            return redisTemplate.opsForSet().size(key);
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }


    /**
     * 移除值为value的
     *
     * @param key    键
     * @param values 值 可以是多个
     * @return 移除的个数
     */

    public long setRemove(String key, Object... values) {
        try {
            Long count = redisTemplate.opsForSet().remove(key, values);
            return count;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    // ===============================list=================================

    /**
     * 获取list缓存的内容
     *
     * @param key   键
     * @param start 开始
     * @param end   结束 0 到 -1代表所有值
     */
    public List<Object> lGet(String key, long start, long end) {
        try {
            return redisTemplate.opsForList().range(key, start, end);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    /**
     * 获取list缓存的长度
     *
     * @param key 键
     */
    public long lGetListSize(String key) {
        try {
            return redisTemplate.opsForList().size(key);
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }


    /**
     * 通过索引 获取list中的值
     *
     * @param key   键
     * @param index 索引 index>=0时， 0 表头，1 第二个元素，依次类推；index<0时，-1，表尾，-2倒数第二个元素，依次类推
     */
    public Object lGetIndex(String key, long index) {
        try {
            return redisTemplate.opsForList().index(key, index);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    /**
     * 将list放入缓存
     *
     * @param key   键
     * @param value 值
     */
    public boolean lSet(String key, Object value) {
        try {
            redisTemplate.opsForList().rightPush(key, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    /**
     * 将list放入缓存
     * @param key   键
     * @param value 值
     * @param time  时间(秒)
     */
    public boolean lSet(String key, Object value, long time) {
        try {
            redisTemplate.opsForList().rightPush(key, value);
            if (time > 0)
                expire(key, time);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }

    }


    /**
     * 将list放入缓存
     *
     * @param key   键
     * @param value 值
     * @return
     */
    public boolean lSet(String key, List<Object> value) {
        try {
            redisTemplate.opsForList().rightPushAll(key, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }

    }


    /**
     * 将list放入缓存
     *
     * @param key   键
     * @param value 值
     * @param time  时间(秒)
     * @return
     */
    public boolean lSet(String key, List<Object> value, long time) {
        try {
            redisTemplate.opsForList().rightPushAll(key, value);
            if (time > 0)
                expire(key, time);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    /**
     * 根据索引修改list中的某条数据
     *
     * @param key   键
     * @param index 索引
     * @param value 值
     * @return
     */

    public boolean lUpdateIndex(String key, long index, Object value) {
        try {
            redisTemplate.opsForList().set(key, index, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    /**
     * 移除N个值为value
     *
     * @param key   键
     * @param count 移除多少个
     * @param value 值
     * @return 移除的个数
     */

    public long lRemove(String key, long count, Object value) {
        try {
            Long remove = redisTemplate.opsForList().remove(key, count, value);
            return remove;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }
}
```

测试代码：

```java
@Autowired
private RedisUtils redisUtils;

@Test
public void test2(){
    redisUtils.set("name", "蔡徐坤");
    String name = (String) redisUtils.get("name");
    System.out.println(name);
}
```

# Redis.conf 配置文件

详细说明整个配置文件的内容：

```shell
# Redis 配置文件

# 启动时必须指定配置文件位置
# ./redis-server /path/to/redis.conf

# 说明 Redis 对大小写不敏感
# units are case insensitive so 1GB 1Gb 1gB are all the same.


################################## INCLUDES ###################################
# 此块配置表示配置文件可以使用多个，利用 includ 包含其他文件
# include /path/to/local.conf
# include /path/to/fragments/*.conf


################################## MODULES #####################################
# 加载 so 等启动文件（不重要）
# loadmodule /path/to/my_module.so
# loadmodule /path/to/other_module.so


################################## NETWORK #####################################
# 此块为网络配置模块
# 此项配置为绑定访问 IP
# 默认为只允许本地访问
# bind 127.0.0.1 -::1
# 当需要使用 java 远程连接时，就需要修改 bind，0.0.0.0 代表所有 IP 都可以访问
  bind 0.0.0.0

# 保护模式是否开启，默认开启，远程访问时需要取消保护模式
protected-mode no

# Redis 服务启动的默认端口 6379
port 6379

# TCP 监听设置
tcp-backlog 511
timeout 0
tcp-keepalive 300


################################# GENERAL #####################################
# 此块为通用设置
# 是否为守护进行，即后台运行方式启动，默认为 no
daemonize yes

# 守护进程方式管理，默认是 auto(no)
# supervised auto

# 如果以后台方式运行，就要求指定一个 pid 的运行配置文件
pidfile /var/run/redis_6379.pid

# 日志级别：debug(测试和开发)、verbose、notice(生产环境)、warning(只记录关键日志)
loglevel notice
# 日志文件位置名
logfile ""

# 默认数据库数量
databases 16

# logo 显示，旧版本默认开启
always-show-logo no

# 修改进程标题以显示一些运行时信息
set-proc-title yes
# 当更改进程标题时，Redis 使用以下模板来构造修改后的标题。
proc-title-template "{title} {listen-addr} {server-mode}"


################################ SNAPSHOTTING  ################################
# 快照模块：持久化的设置，持久化的触发条件以及保存等设置
# 持久化的规则，3600s 内至少一个 key 修改就持久化操作，300s 内 100 个key修改则持久化，60s内修改10000个key就持久化
# save 3600 1 300 100 60 10000

# 持久化出错后还是否继续工作，默认 yes，表示失败后，后续写操作均会失败
stop-writes-on-bgsave-error yes

# 是否用 LZF 算法进行压缩 rdb 文件（把整个内存数据映射到硬盘中），需要消耗 CPU 资源
rdbcompression yes

# 保存 rdb 持久化文件时是否使用CRC64算法进行错误检查校验，会增加性能的消耗
rdbchecksum yes

# rdb 文件名设置
dbfilename dump.rdb

# rdb 文件是否删除同步锁
rdb-del-sync-files no

# rdb 持久化文件保存目录，默认当前文件目录
dir ./


################################# REPLICATION #################################
# 此块是复制设置，后面主从复制集群时再说明。


################################## SECURITY ###################################
# 安全配置模块
# 设置 ACL 日志最大长度，默认128个记录。这个日志是存在内存里的。
acllog-max-len 128

# 外部ACL文件配置
# aclfile /etc/redis/users.acl

# 设置全局权限密码，默认没有密码
requirepass gaozheng1998


################################### CLIENTS ####################################
# 客户端限制设置
# 设置最大客户端连接数，达到限制值后的连接会被拒绝并会返回错误信息。
# maxclients 10000


############################## MEMORY MANAGEMENT ################################
# Redis 内存设置
# 指定Redis最大内存限制。达到内存限制时，Redis将尝试删除已到期或即将到期的Key。
# maxmemory <bytes>

# 配置达到最大内存限制后的处理策略，Redis 进行何种操作。默认 noeviction 处理策略（具体看配置文件）。
# maxmemory-policy noeviction

# 使用LRU/LFU/TTL算法时采样率：Redis使用的是近似的LRU/LFU/minimal TTL算法。主要是为了节约内存以及提升性能。Redis配置文件有maxmemory-samples选项，可以配置每次取样的数量。Redis每次会选择配置数量的key，然后根据算法从中淘汰最差的key。
# maxmemory-samples 5
# 暂未了解
# maxmemory-eviction-tenacity 10

# 配置Redis主从复制时，从库超过maxmemory也不淘汰数据。这个配置主要是为了保证主从库的一致性，因为Redis的淘汰策略是随机的，如果允许从库自己淘汰key，那么会导致主从不一致的现象出现（master节点删除key的命令会同步给slave节点）。
# replica-ignore-maxmemory yes

# 设置过期keys仍然驻留在内存中的比重，默认是为1，表示最多只能有10%的过期key驻留在内存中，该值设置的越小，那么在一个淘汰周期内，消耗的CPU资源也更多，因为需要实时删除更多的过期key。
# active-expire-effort 1


############################# LAZY FREEING ####################################
# 惰性删除设置
# 内存达到上面设置的 maxmemory 时，是否使用惰性删除
lazyfree-lazy-eviction no
# 过期keys是否惰性删除
lazyfree-lazy-expire no
# 内部删除选项，此情况是否删除：由于在已经存在的key上存储对象的命令的副作用。例如，RENAME命令可能会删除旧的key的内容，当该key的内容被其它内容代替时。类似的，SUNIONSTORE或者带STORE选项的SORT命令可能会删除已经存在的keys。SET命令会删除指定键的任何旧内容，以便使用指定字符串替换。
lazyfree-lazy-server-del no
# slave接收完RDB文件后清空数据是否是惰性的：在复制过程中，当副库与主库执行完全重新同步时，整个数据库的内容将被删除，以便加载刚刚传输的RDB文件。
replica-lazy-flush no

# 是否将DEL调用替换为UNLINK，注释里写的从user code里替换DEL调用为UNLINK调用可能并不是一件容易的事，因此可以使用以下选项，将DEL的行为替换为UNLINK
lazyfree-lazy-user-del no
# 暂未了解
lazyfree-lazy-user-flush no


############################## APPEND ONLY MODE ###############################
# AOF（另一种持久化的方式）的设置
# 默认不开启 AOF 持久化，默认使用 RDB 持久化
appendonly no
# 持久化文件名
appendfilename "appendonly.aof"
# 持久化文件目录
appenddirname "appendonlydir"
# 每秒都执行一次同步，但是可能会丢失这一秒的数据
appendfsync everysec
# appendfsync always	# 每次修改都会写入，消耗性能
# appendfsync no		# 不执行同步，操作系统自己同步数据，速度最快

# 当有后台保存任务时，关闭appendfsync，防止在进行BGSAVE或者BGREWRITEAOF时在主进程中调用fsync()。
no-appendfsync-on-rewrite no

# 在AOF文件大小增长到了指定的百分比（相对于上次AOF文件大小的增长量）或者最小体积时，自动调用BGREWRITEAOF命令重写AOF文件。
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# AOF文件末尾被截断
aof-load-truncated yes

# 开启混合持久化：当重写AOF文件时，Redis能够在AOF文件中使用RDB前导，以更快地重写和恢复。
aof-use-rdb-preamble yes
# 暂未了解
aof-timestamp-enabled no
```

# Redis 持久化

​		Redis 是内存数据库，如果不将内存中的数据状态保存到磁盘进行`持久化`，那么一旦服务进行退出，Redis 数据库中的数据也会消失。 

## RDB 持久化

​		RDB ：Redis DataBase 持久化方式。在指定的时间间隔将内存数据快照写入磁盘，这也就是 `Snapshot快照`(备份文件)，恢复时只需要将快照文件直接读取到内存即可。`Redis 默认的持久化方式就是 RDB 持久化`

​		默认情况下， Redis 将数据库快照保存在名字为 `dump.rdb` 的二进制文件中。

1、工作原理：在进行 **`RDB`** 的时候，**`redis`** 的主线程是不会做 **`io`** 操作的，主线程会 **`fork`** 一个子线程来完成该操作。

1）Redis 调用 forks。同时拥有父进程和子进程。

2）子进程将数据集写入到一个临时 RDB 文件中。

3）当子进程完成对新 RDB 文件的写入时，Redis 用新 RDB 文件替换原来的 RDB 文件，并删除旧的 RDB 文件。

这种工作方式使得 Redis 可以从 `写时复制（copy-on-write）` 机制中获益（因为是使用子进程进行写操作，而父进程依然可以接收来自客户端的请求）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200513215141519.jpg)

2、RDB 持久化触发规则：

1）save 的规则满足的情况下，会自动触发 RDB 持久化。======> `save 规则在 配置文件的 SNAPSHOTTING 快照模块进行设置`

2）执行 flushall 命令，也会触发我们的 RDB 持久化。

3）退出 Redis 时，也会自动产生 rdb 文件。

4）使用 `save` 命令，会立刻对当前内存中的数据进行持久化 ,但是会`阻塞`，阻塞当前所有客户端的请求。（save 命令使用主线程进行持久化）

5）使用 `bgsave` 命令，也是持久化命令，不过是`异步`的，意味着主线程`不会产生阻塞`，但是需要 fork 子进程（子进程阻塞），消耗内存，但是很小且快。

3、恢复 RDB 文件：只需要将 RDB 文件放在我们 Redis 的启动目录，则启动时就会自动检查 dump.rdb 文件，并恢复其中的数据。

> 检查 rdb 自动扫描扫描文件位置：
>
> ```shell
> 127.0.0.1:6379> config get dir
> 1) "dir"
> 2) "/root"		# 自动扫描位置
> ```

注意：默认配置基本就足够平时企业开发应用。

4、优点和缺点：

1）适合大规模的数据恢复，但是对数据的完整性要求不高时可以使用。

2）需要一定时间间隔的进程操作，如果期间 Redis 宕机，最后一次修改数据就会消失。

3）fork 进程会单独开启一条线程，有一定的内存空间消耗。

## AOF 持久化

​		`AOF` ：Append Only File(追加文件)。实质就是将所有的命令记录下来，类似于一个 `history 文件`，恢复时再全部执行一遍。（类似于 sql 文件备份）

​		默认情况下， Redis 并没有开启 aof 持久化，开启后将数据库日志文件保存在名字为 `appendonly.aof` 的二进制文件中。

1、工作原理：也是`使用 fork 子进程`，以日志的形式来记录每个`写的操作`，将 Redis 执行过的所有指令记录下来（读操作不记录），`只追加`文件但`不改写`文件，redis 启动之初会读取该文件`重新构建数据`，换言之，redis 重启的话就根据日志文件的内容将写指令从前到后执行一次以完成数据的恢复工作。

2、触发规则：`每秒`自动执行子进程将写操作记录进入日志文件（可配置）。

> 但是，这个文件是可以`手动破坏`的，那么破坏后会怎么样呢？如何使其恢复正常呢？
>
> 1）当该 aof 文件被破坏出现问题时，redis-server 服务可以正常启动，但是已经不能进入客户端 redis-cli 了，会直接`连接拒绝`。
>
> 2）redis 官方提供了 aof 的修复工具：`redis-check-aof --fix`，此工具可以直接对 aof 文件进行修复。
>
> ```shell
> redis-check-aof --fix appendonly.aof
> ```
>
> 此时就可以正常启动客户端（可能会丢失 1s 数据）。

3、优缺点：

1）每次修改都会同步，文件完整性很好。（三种同步模式）

2）相对于数据文件来说，aof 文件远远大于 rdb 文件，同时由于是 IO 操作，修复速度比 rdb 慢。

3）aof 运行效率比 rdb 慢，因此 Redis 默认的持久化方式就是 RDB。

4、拓展点：`aof 重写原则`

```shell
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

根据配置文件，aof 文件如果大于 64M（这个 64 来源于上一次生成的文件大小，会自动变化），就会fork 新的子进程来将文件进行重写。

# Redis 发布订阅

## 原理简述

​		Redis 发布订阅(pub/sub)是一种`消息通信`模式：发送者(pub)发送消息，订阅者(sub)接收消息。====> 微信微博等关注系统。

​		Redis 客户端可以订阅任意数量的频道，其订阅/发布消息图为：

![img](https://img1.baidu.com/it/u=92971651,3684802502&fm=253&fmt=auto&app=138&f=PNG?w=804&h=315)

公众号更新人（发布者） -------------> Redis server ------------> 张三、李四、王五订阅就可以收到（消息订阅者）。

​		当有新消息通过 PUBLISH 命令发送给频道 channel 时， 这个消息就会被发送给订阅它的三个客户端：

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020051321553483.png)

主要命令：围绕`消息发送者、频道、消息订阅者`而言。

|                  命令                  |                 描述                 |
| :------------------------------------: | :----------------------------------: |
|    `PSUBSCRIBE pattern [pattern..]`    | `订阅`一个或多个符合给定模式的频道。 |
|    PUNSUBSCRIBE pattern [pattern..]    |  退订一个或多个符合给定模式的频道。  |
| PUBSUB subcommand [argument[argument]] |       查看订阅与发布系统状态。       |
|       `PUBLISH channel message`        |         向指定频道`发布`消息         |
|    `SUBSCRIBE channel [channel..]`     |     `订阅`给定的一个或多个频道。     |
|     SUBSCRIBE channel [channel..]      |          退订一个或多个频道          |

​		每个 Redis 服务器进程都维持着一个表示服务器状态的 redis.h/redisServer 结构， 结构的 pubsub_channels 属性是一个`字典`， 这个字典就用于保存订阅频道的信息，其中，`字典的键为正在被订阅的频道`， 而字典的值则是一个链表（`订阅者链表`）， 链表中保存了所有订阅这个频道的客户端。客户端订阅，就被链接到对应频道的链表的尾部，退订则就是将客户端节点从链表中移除。

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020051321554964.png)

缺点：

1）如果一个客户端订阅了频道，但自己读取消息的速度却不够快的话，那么不断积压的消息会使redis输出缓冲区的体积变得越来越大，这可能使得redis本身的速度变慢，甚至直接崩溃。

2）这和数据传输可靠性有关，如果在订阅方断线，那么他将会丢失所有在短线期间发布者发布的消息。

应用场景：

1）消息订阅：公众号订阅，微博关注等等（企业基本使用消息队列来进行实现）。 ======> `消息中间件 MQ`

2）多人在线聊天室。

3）订阅、关注系统。

## Redis-cli 实现

1）消息订阅者

```shell
# 订阅者订阅消息
127.0.0.1:6379> subscribe gaozheng
Reading messages... (press Ctrl-C to quit)
1) "subscribe"
2) "gaozheng"
3) (integer) 1
# 此处等待消息发布
```

2）消息发布者

```shell
127.0.0.1:6379> publish gaozheng "hello,gaozheng"
(integer) 1
127.0.0.1:6379> publish gaozheng "hello,nihaoya"
(integer) 1
```

3）当发布消息的同时，再检查订阅者等待模式下的状态：

```shell
127.0.0.1:6379> subscribe gaozheng
Reading messages... (press Ctrl-C to quit)
1) "subscribe"
2) "gaozheng"
3) (integer) 1
# 消息1
1) "message"
2) "gaozheng"	# 表示频道
3) "hello,gaozheng"	# 表示消息内容
# 消息 2
1) "message"
2) "gaozheng"	# 表示频道
3) "hello,nihaoya"	# 表示消息内容
```

## Jedis 实现

​		Jedis 实现则需要两个角色：`消息发布者` 和 `消息订阅者`。

1）消息发布者：

```java
//消息发布者:控制台发送消息
public class Publisher{
    public static void main(String[] args) throws IOException {
        Jedis jedis = new Jedis("8.142.92.222", 6379);
        jedis.auth("gaozheng1998");
        //通过控制台发布消息，未来从前端读取
        jedis.publish("channel1", "欢迎订阅!");
        InputStreamReader inputStreamReader = new InputStreamReader(System.in);
        BufferedReader reader = new BufferedReader(inputStreamReader);
        while (true){
            String line = reader.readLine();
            jedis.publish("channel1", "Bilibili 官方：" + line);
            if ("quit".equals(line)) break;
        }
    }
}
```

2）消息订阅者：

```java
//消息订阅者
public class Subcriber extends JedisPubSub {

    private String name;

    public Subcriber(String name){
        this.name = name;
    }

    //收到消息时会调用
    @Override
    public void onMessage(String channel, String message) {
        System.out.println(String.format("订阅消息来自于 %s, 消息内容 %s", channel, message));
    }
    //订阅了频道会调用
    @Override
    public void onSubscribe(String channel, int subscribedChannels) {
        System.out.println(String.format("用户 %s 成功订阅频道 %s, subscribedChannels = %d", this.name, channel, subscribedChannels));
    }
    //取消订阅会调用
    @Override
    public void onUnsubscribe(String channel, int subscribedChannels) {
        System.out.println(String.format("已取消订阅来自于频道 %s 的消息, subscribedChannels %d", channel, subscribedChannels));
    }
}
```

3）测试代码，测试消息的接收和发送：使用两个消息订阅者（代码基本相同，name 属性分别为 张三 和 李四）

```java
public class TestSubscriber01 {
    public static void main(String[] args) {
        Jedis jedis = new Jedis("8.142.92.222", 6379);
        jedis.auth("gaozheng1998");
        jedis.subscribe(new Subcriber("张三"), "channel1");
    }
}
```

4）测试结果：

当消息发布者控制台发送：

```shell
亲，你好呀，欢迎您的订阅！
```

两个订阅者接收消息结果为：

```shell
# 张三
用户 张三 成功订阅频道 channel1, subscribedChannels = 1
订阅消息来自于 channel1, 消息内容 hello,world!
订阅消息来自于 channel1, 消息内容 Bilibili 官方：亲，你好呀，欢迎您的订阅！

# 李四
用户 李四 成功订阅频道 channel1, subscribedChannels = 1
订阅消息来自于 channel1, 消息内容 hello,world!
订阅消息来自于 channel1, 消息内容 Bilibili 官方：亲，你好呀，欢迎您的订阅！
```

# Redis 主从复制

​		`主从复制`，是指将一台Redis服务器的数据（`主机 master`），复制到其他的Redis服务器（`从机 slave`）。` 数据的复制是单向的`，只能由主节点复制到从节点。默认情况下，每台 Redis 单机服务器都是主节点，一个主节点可以有0个或者多个从节点，但每个从节点只能由一个主节点管理。

​		主节点主要负责写请求，多台从机负责读请求。 ========> `读写分离`，减缓服务器压力。

`问题`：当请求过多时，单台服务器压力过大，容量有限制(单台 Redis 最大使用内存不应该超过 20G)，同时如果发生单点故障，可能会导致整个系统崩坏。

1、主从复制的主要作用：

1）数据冗余：主从复制实现了数据的热备份，是持久化之外的一种数据冗余的方式。

2）故障恢复：当主节点故障时，从节点可以暂时替代主节点提供服务，是一种服务冗余的方式。

3）负载均衡：在主从复制的基础上，配合读写分离，分担服务器的负载；尤其是在多读少写的场景下，通过多个从节点分担负载，`提高并发量`。

4）高可用基础：主从复制还是`哨兵`和集群能够实施的基础。

## 集群搭建

​		环境配置：只需要从节点的配置，不需要修改主节点的配置。（`每台单机 Redis 默认就是主节点`）

> 查看当前库的集群副本配置：
>
> ```shell
> 127.0.0.1:6379> info replication
> # Replication
> role:master		# 角色
> connected_slaves:0		# 从机个数
> master_replid:ebc2bc894176afd756dd7708dcea6841ac03b22a
> master_replid2:0000000000000000000000000000000000000000
> master_repl_offset:0
> second_repl_offset:-1
> repl_backlog_active:0
> repl_backlog_size:1048576
> repl_backlog_first_byte_offset:0
> repl_backlog_histlen:0
> ```

1、复制配置文件 redis79.conf、redis80.conf、redis81.conf 三个配置文件（搭建`一主两从`集群）

​		修改配置内容：`端口号、pid文件名、日志文件名、rdb文件名`。

```shell
# 以 6380 端口 redis 服务为例，其他端口服务类似配置。
# 启动端口
port 6380
# 后台运行 pid 文件
pidfile /var/run/redis_6380.pid
# 日志
logfile "redis80.log"
# rdb 文件
dbfilename dump80.rdb
```

> 需要`注意`：当要连接的主机设置密码后，从机配置文件需要增加`主机密码设置`的配置：
>
> ```shell
> # 此处主机79密码为 gaozheng1998
> masterauth gaozheng1998
> ```

2、启动这三个 redis 服务。

1）查看 redis 进程：发现三个 redis 服务成功启动。

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ redis-conf]# redis-server ./redis79.conf 
[root@iZ8vb0l7sqdpurpvy5e77xZ redis-conf]# redis-server ./redis80.conf 
[root@iZ8vb0l7sqdpurpvy5e77xZ redis-conf]# redis-server ./redis81.conf 
[root@iZ8vb0l7sqdpurpvy5e77xZ redis-conf]# ps auxw|grep redis
root     3847940  0.0  0.1  53436  8684 ?        Ssl  20:11   0:00 redis-server 0.0.0.0:6379
root     3847945  0.0  0.0  53436  7892 ?        Ssl  20:11   0:00 redis-server 0.0.0.0:6380
root     3847957  0.0  0.0  53436  5824 ?        Ssl  20:11   0:00 redis-server 0.0.0.0:6381
root     3847962  0.0  0.0  12108  1060 pts/0    S+   20:11   0:00 grep --color=auto redis
```

2）以 6379 端口为主机，将 6380 端口和 6381 端口配置成从机（`只需要修改从机`）

```shell
#配置成某台 redis-server 的从机的语法：
slaveof host port
```

将 80 端口配置为从机：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ redis-conf]# redis-cli -p 6380		# 进入指定端口的 redis-cli
127.0.0.1:6380> slaveof 127.0.0.1 6379
OK

# 查看当前库副本配置信息
127.0.0.1:6380> info replication
# Replication
role:slave		# 角色变为 slave 从机
master_host:127.0.0.1	 # 主机 ip
master_port:6379		# 主机端口变为 6379
master_link_status:up	# 表示正常连接到主机
..........
```

将 81 端口配置为从机：
```shell
# 将 81 端口配置为从机
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# redis-cli -p 6381
127.0.0.1:6381> slaveof 127.0.0.1 6379
OK

# 查看当前库副本配置信息
127.0.0.1:6381> info replication
# Replication
role:slave		# 角色变为 slave 从机
master_host:127.0.0.1	 # 主机 ip
master_port:6379		# 主机端口变为 6379
master_link_status:up	 # 表示正常连接到主机
...........
```

3、通过主机查看集群信息：

```shell
127.0.0.1:6379> info replication
# Replication
role:master
connected_slaves:2
slave0:ip=127.0.0.1,port=6380,state=online,offset=98,lag=1		# 从机 80 的信息
slave1:ip=127.0.0.1,port=6381,state=online,offset=98,lag=1		# 从机 81 的信息
master_replid:e1f1a36bb62353d5a3d02b3ce6e91439dbcbeef1
master_replid2:0000000000000000000000000000000000000000
master_repl_offset:98
second_repl_offset:-1
repl_backlog_active:1
repl_backlog_size:1048576
repl_backlog_first_byte_offset:1
repl_backlog_histlen:98
```

> 真实主从复制是在配置文件直接修改，此处通过命令设置只是暂时的`主从设置`。
>
> 配置文件配置是永久的：
>
> ```shell
> ################################# REPLICATION #################################
> # 此处就是设置主机的 ip 和 端口
> # replicaof <masterip> <masterport>
> ...........
> # 设置主机的密码
> # masterauth <master-password>
> ```

4、测试集群的使用。

​		1）主机可以写，但从机只能读。

```shell
# 80 端口测试写数据：报错
127.0.0.1:6380> set k1 v1
(error) READONLY You can't write against a read only replica.

# 主机能读能写，但是一般只用来写数据操作
127.0.0.1:6379> set k1 v1
OK
127.0.0.1:6379> get k1
"v1"

# 测试从机读取数据：正常
127.0.0.1:6380> get k1
"v1"
```

​		测试发现：主机能读能写，但从机只能读，且`主机数据会自动同步到从机`。		

2）主机断开，从机依旧是连接到主机的，`依旧能够读取主机之前写入的数据`，但是已经没有新的数据写入集群，等待主机恢复，整个集群直接恢复正常。

> 此处就会有一个问题：如果主机很久才恢复，那么将一直不能写入新数据，能不能在从机之间选择一个成为主机呢？
>
> 1）手动将某一台从机独立：`slaveof no one` ，自身就会变成主机，其他节点重新设置主机为此节点。（`需要手动`）如果此时原来的主节点恢复正常了，那么也只能重新再配置了，并不会自动变成其他节点的主节点。
>
> 2）使用`哨兵模式`，利用选举模式自动选一个主机。

3）从机 81 断开，这时主机写入数据，81 再连接回来，发现此时已经变成了主机（`未配置到配置文件则断开就会取消跟随主机`）

​			注意：如果是配置文件配置的（或者`再次配置进入集群`），就会发现主机在其断开期间写入的数据，仍然可以读取到。=====> `自动同步`

## 复制原理

​		Slave 启动成功连接到 master 后会发送一个 sync 同步命令，Master 接收到命令后，启动后台的存盘进程，同时手机所有接收到的修改数据库的命令，在后台进程执行完毕后，`Master 将传送整个数据文件到 Slave`，完成一次完全同步。

​		`全量复制`：Slave 服务在接收到数据库文件数据后，将其存盘并加载到内存中。

​		`增量复制`：Master 继续将`新收集到的修改命令`一次传给 Slave，完成同步。

​		只要是重新连接到 Master，一次完全同步（全量复制）将自动执行。

## 层层链路结构

​		上面提到，当主机宕机后，主机可能短时间无法连接上，那么如何解决？

​		那么，能不能将集群设计成：`79（Master）<---------- 80（Slave和 Master） <----------- 81（从机）` 层层链路的结构呢，这样的结构能不能保证当主机宕机后，`原本的从机 80 直接上升到主机`呢？

1、修改 81 的主机选择，将 81 主机切换成 80 Redis。

​		此时检查 80 发现：`本身角色是从机`（依旧无法写入数据），但是下面有一个从机 6381。

```shell
127.0.0.1:6380> info replication
# Replication
role:slave
master_host:127.0.0.1
master_port:6379
master_link_status:up
master_last_io_seconds_ago:7
master_sync_in_progress:0
slave_repl_offset:3916
slave_priority:100
slave_read_only:1
connected_slaves:1
slave0:ip=127.0.0.1,port=6381,state=online,offset=3916,lag=1
```

​		再检查 81 发现其主机变为 80，检查 79 发现其只有一个从机 80。

​		此时上述的结构就搭建完成。

2、检查正常插入和删除数据：

1）79 正常插入数据 k9 v9 。

2）80 正常能够读取数据 k9 的 value 值。

3）81 同样能够读取到数据 k9 的 value 值。

因此：此种层层链路结构依旧能实现`主从复制`。

3、此时如果关掉原来的主机79，80会变成主机吗？`并不会`

当原来的主机宕机后，80 Redis `依旧是从机角色`，依旧不能写入数据。

```shell
127.0.0.1:6380> set k0 v0
(error) READONLY You can't write against a read only replica.
```

此时如何解决呢？ ====> `将 80 独立设置成为主机`

```shell
127.0.0.1:6380> slaveof no one
OK
```

此时设置后，80从机变为主机，同时原来其 81 从机仍然是其从机。（`比原本的方式容易操作一点`，但同样复杂）

## 哨兵模式

​		Redis 从 2.8 开始正式推出 `Sentinel 哨兵`架构来解决上面的手动选举的过程。

​		哨兵模式：后台自动监控主机是否故障，如果故障则会`根据投票数自动将某个从机转换为主机`。（选举模式）

​		哨兵作用：通过发送命令，让 Redis 服务器返回监控其运行状态，包括主服务器和从服务器。当哨兵监测到 master 宕机，会自动将 slave 切换成 master，然后通过`发布订阅模式`通知其他的从服务器，修改配置文件，让它们切换主机。

单哨兵模式原理图：

![哨兵模式](http://c.biancheng.net/uploads/allimg/210913/1K00M955-0.gif)

​		在实际生产情况中，`Redis Sentinel` 是集群的高可用的保障，为避免 Sentinel 发生意外，它一般是由 3～5 个哨兵节点组成，`哨兵之间也互相监控`，这样就算挂了个别哨兵节点，仍然能够正常监控，该集群仍然可以正常运转。（`起码六个服务`）

多哨兵模式原理图：

![Redis哨兵模式](http://c.biancheng.net/uploads/allimg/210913/1K00HQ5-1.gif)

​		假设主机宕机，哨兵1先检测到此结果，系统并不会立即进行(failover) 过程，仅仅是哨兵1主观认为主机不可用，这个现象称为“`主观下线`”，当后面的哨兵也检测到主机不可用，并且达到一定数目时，那么`哨兵之间就会进行一次选举投票`，投票结果由一个哨兵发起，进行 `failover[故障转移]` 操作，切换成功后，就会通过`发布订阅模式`，让各个哨兵把自己监控的从机实现切换主机，这就是“`客观下线`”。

那么如何搭建出哨兵模式的主从复制集群呢？（目前是一主二从的模式）

1、配置哨兵模式的最简配置文件：`sentinel.conf` 文件

```shell
# 文件内容
port 26379		# 启动端口 26379
# 语法：sentinel monitor 被监控的主机名称 主机ip 主机端口 1
sentinel monitor myredis 127.0.0.1 6379 1
sentinel auth-pass myredis gaozheng1998		# 注意，当主机设置密码后，监视需要添加密码验证
# 这个 1 代表主机宕机后，从机投票的票数
```

2、启动哨兵：利用文件项目 redis-sentinel 进行启动。

```shell
redis-sentinel ./redis-conf/sentinel.conf
# 出现redis 的欢迎页面即为启动成功，同时还有一些信息：
3871668:X 11 Jun 2022 09:43:39.522 # Sentinel ID is 5e970e1b78aa1a89c12ad33b8dcbc62e7221539c
3871668:X 11 Jun 2022 09:43:39.522 # +monitor master myredis 127.0.0.1 6379 quorum 1
3871668:X 11 Jun 2022 09:43:39.523 * +slave slave 127.0.0.1:6381 127.0.0.1 6381 @ myredis 127.0.0.1 6379		# 从机配置
3871668:X 11 Jun 2022 09:43:39.524 * +slave slave 127.0.0.1:6380 127.0.0.1 6380 @ myredis 127.0.0.1 6379		# 从机配置
```

3、测试主机79 宕机，会不会有从机自动变为主机呢？

1）主机宕机关机。

等待一会，等待哨兵监控状态。

2）从机80状态：（`变成了主机`）

```shell
127.0.0.1:6380> info replication
# Replication
role:master
connected_slaves:1
slave0:ip=127.0.0.1,port=6381,state=online,offset=88688,lag=1
master_replid:8d4989b2914953af8a544344b497da2d05c2c65a
master_replid2:8008adc3915ae1cd175409bf0eb54cfe92178e24
master_repl_offset:88820
second_repl_offset:81384
repl_backlog_active:1
repl_backlog_size:1048576
repl_backlog_first_byte_offset:1
repl_backlog_histlen:88820
```

3）从机81状态：（`仍然是从机`，但是跟随的是 80新主机）

4、测试主机恢复后：当主机恢复后，再次查看状态，发现`恢复的主机已经被归并为当前的主机81 的从机`。（注意配置文件：需要配置集群的主机密码）

哨兵模式的优缺点：

1）哨兵集群，基于主从复制模式，所有的主从配置的优势均有。

2）主从可以切换，故障能够转移，系统可用性优良。

3）哨兵模式就是主从模式的升级，手动变为自动配置，更加健壮。

4）`缺点`：Redis 不易在线扩容，集群容量一旦达到上限，扩容就十分麻烦，同时实现哨兵模式配置非常复杂。

完整的哨兵模式的配置：

```shell
# Example sentinel.conf
 
# 哨兵sentinel实例运行的端口 默认26379
port 26379
 
# 哨兵sentinel的工作目录
dir /tmp
 
# 哨兵sentinel监控的redis主节点的 ip port 
# master-name  可以自己命名的主节点名字 只能由字母A-z、数字0-9 、这三个字符".-_"组成。
# quorum 当这些quorum个数sentinel哨兵认为master主节点失联 那么这时 客观上认为主节点失联了
# sentinel monitor <master-name> <ip> <redis-port> <quorum>
sentinel monitor mymaster 127.0.0.1 6379 1
 
# 当在Redis实例中开启了requirepass foobared 授权密码 这样所有连接Redis实例的客户端都要提供密码
# 设置哨兵sentinel 连接主从的密码 注意必须为主从设置一样的验证密码
# sentinel auth-pass <master-name> <password>
sentinel auth-pass mymaster MySUPER--secret-0123passw0rd
 
 
# 指定多少毫秒之后 主节点没有应答哨兵sentinel 此时 哨兵主观上认为主节点下线 默认30秒
# sentinel down-after-milliseconds <master-name> <milliseconds>
sentinel down-after-milliseconds mymaster 30000
 
# 这个配置项指定了在发生failover主备切换时最多可以有多少个slave同时对新的master进行 同步，
# 这个数字越小，完成failover所需的时间就越长，
# 但是如果这个数字越大，就意味着越 多的slave因为replication而不可用。
# 可以通过将这个值设为 1 来保证每次只有一个slave 处于不能处理命令请求的状态。
# sentinel parallel-syncs <master-name> <numslaves>
sentinel parallel-syncs mymaster 1
 
 
 
# 故障转移的超时时间 failover-timeout 可以用在以下这些方面： 
#1. 同一个sentinel对同一个master两次failover之间的间隔时间。
#2. 当一个slave从一个错误的master那里同步数据开始计算时间。直到slave被纠正为向正确的master那里同步数据时。
#3.当想要取消一个正在进行的failover所需要的时间。  
#4.当进行failover时，配置所有slaves指向新的master所需的最大时间。不过，即使过了这个超时，slaves依然会被正确配置为指向master，但是就不按parallel-syncs所配置的规则来了
# 默认三分钟
# sentinel failover-timeout <master-name> <milliseconds>
sentinel failover-timeout mymaster 180000
 
# SCRIPTS EXECUTION
 
#配置当某一事件发生时所需要执行的脚本，可以通过脚本来通知管理员，例如当系统运行不正常时发邮件通知相关人员。
#对于脚本的运行结果有以下规则：
#若脚本执行后返回1，那么该脚本稍后将会被再次执行，重复次数目前默认为10
#若脚本执行后返回2，或者比2更高的一个返回值，脚本将不会重复执行。
#如果脚本在执行过程中由于收到系统中断信号被终止了，则同返回值为1时的行为相同。
#一个脚本的最大执行时间为60s，如果超过这个时间，脚本将会被一个SIGKILL信号终止，之后重新执行。
 
#通知型脚本:当sentinel有任何警告级别的事件发生时（比如说redis实例的主观失效和客观失效等等），将会去调用这个脚本，
#这时这个脚本应该通过邮件，SMS等方式去通知系统管理员关于系统不正常运行的信息。调用该脚本时，将传给脚本两个参数，
#一个是事件的类型，
#一个是事件的描述。
#如果sentinel.conf配置文件中配置了这个脚本路径，那么必须保证这个脚本存在于这个路径，并且是可执行的，否则sentinel无法正常启动成功。
#通知脚本
# sentinel notification-script <master-name> <script-path>
  sentinel notification-script mymaster /var/redis/notify.sh
 
# 客户端重新配置主节点参数脚本
# 当一个master由于failover而发生改变时，这个脚本将会被调用，通知相关的客户端关于master地址已经发生改变的信息。
# 以下参数将会在调用脚本时传给脚本:
# <master-name> <role> <state> <from-ip> <from-port> <to-ip> <to-port>
# 目前<state>总是“failover”,
# <role>是“leader”或者“observer”中的一个。 
# 参数 from-ip, from-port, to-ip, to-port是用来和旧的master和新的master(即旧的slave)通信的
# 这个脚本应该是通用的，能被多次调用，不是针对性的。
# sentinel client-reconfig-script <master-name> <script-path>
sentinel client-reconfig-script mymaster /var/redis/reconfig.sh
```

# Redis 缓存穿透和雪崩

## 11.1 缓存穿透

​		在默认情况下，用户请求数据时，会`先在缓存(Redis)`中查找，若没找到即缓存未命中，再在数据库中进行查找，`数据库也没有`，数量少可能问题不大，可是一旦大量的请求数据（例如秒杀场景）缓存都没有命中的话，就会全部转移到数据库上，造成数据库极大的压力，就有可能导致数据库崩溃。===> `缓存穿透`

​		网络安全中也有人恶意使用这种手段进行攻击被称为`洪水攻击`。

​		那么如何解决呢？

1）在 缓存 之前增加过滤器（布隆过滤器）

2）第一次查询不到就在缓存中缓存一个 空对象，后续就不会持续请求数据库。

### 布隆过滤器

​		对所有可能查询的参数以 `Hash` 的形式存储，以便快速确定是否存在这个值，在控制层先进行拦截校验，`校验不通过直接丢弃`，减轻了存储系统的压力。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200513215824722.jpg?)

### 缓存空对象

​		第一次请求若在缓存和数据库中都没找到，就在缓存中存放一个空对象用于处理后续这个请求。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200513215836317.jpg)

但是此办法会存在问题：

1）存储空对象也需要空间，大量的空对象会耗费一定的空间，存储效率并不高。

2）解决缺陷1的方式就是设置较短过期时间，会存在缓存层和存储层的数据会有一段时间窗口的不一致，这对于需要保持一致性的业务会有影响。

## 缓存击穿

​		相较于缓存穿透，缓存击穿的目的性更强，一个`存在的key`，在缓存过期的一刻，同时有大量的请求，这些请求都会击穿到DB，造成瞬时DB请求量大、压力骤增，这就是`缓存击穿`，只是针对其中某个key的缓存不可用而导致击穿，但是其他的key依然可以使用缓存响应。（`缓存过期瞬间某个 key 请求量过大`）

​		例如：微博热搜，一个热点新闻被同时大量访问就可能导致缓存击穿。

​		那么如何解决呢？

1）设置热点数据 key 永不过期：这样就不会出现热点数据过期的情况，但是当 Redis 内存空间满的时候也会清理部分数据，而且此种方案会占用空间，一旦热点数据多了起来，就会占用部分空间。

2）使用分布式锁：在访问 key 之前，采用 SETNX（set if not exists）来设置另一个短期 key 来锁住当前 key 的访问，访问结束再删除该短期 key。保证同时刻只有一个线程访问，但是这样对锁的要求就十分高。（保证同一时刻只有一个线程进行访问）

## 缓存雪崩

​		大量的 key 设置了相同的过期时间，导致`缓存在同一时刻全部失效`，造成瞬时DB请求量大、压力骤增，引起雪崩。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200513215850428.jpeg)

​		那么如何解决呢？

1）Redis 高可用方案：增设 Redis，这样一台挂掉之后其他的还可以继续工作，其实就是搭建的集群。（`异地多活`）

2）限流降级：在缓存失效后，通过加锁或者队列来控制读数据库写缓存的线程数量。比如对某个 key 只允许一个线程查询数据和写缓存，其他线程等待。

3）数据预热：在正式部署之前，我先把可能的数据先预先访问一遍，这样部分可能大量访问的数据就会加载到缓存中。在即将发生大并发访问前手动触发加载缓存不同的 key，`设置不同的过期时间`，让缓存失效的时间点尽量均匀。
