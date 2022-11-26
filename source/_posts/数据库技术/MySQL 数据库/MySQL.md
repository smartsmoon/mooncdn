---
title: MySQL 底层初探
date: 2022-06-20 00:00:00
type:
comments:
tags: 
  - 数据库
  - MySQL
categories: 
  - 数据库技术
description: 
keywords: MySQL
swiper_index: 6
cover: https://w.wallhaven.cc/full/k7/wallhaven-k7m65d.png
top_img: https://w.wallhaven.cc/full/k7/wallhaven-k7m65d.png
---

# 初识 MySQL

MySQL 是一个数据库管理系统 ( `D`ata`B`ase `M`anagement `S`ystem ) ，DB才是数据库。

> 数据库管理软件：科学组织和存储数据 , 高效地获取和维护数据。

`MySQL 数据库`：数据存储。（关系型数据库），免费开源。

`[问题]`  变种 MySQL 有哪些呢？

​	1）Drizzle：真正的 Mysql 分支出来的，但是和 MySQL 高度不兼容，充分解决数据库的可用性问题。

​	2）MariaDB：MySQL 创始人创建，MySQL 现有功能基础上的加强版。

​	3）Percona Server：《高性能MySQL》作者创建，和 MySQL 兼容，为性能改进版本，MySQL 的尝鲜版。

​	4）Postgre SQL（PG）：MySQL 的替换产品，稳定性极强，高并发场景下性能指标非常良好，数据类型丰富，但约束比较多，学术化强。

​	5）SQLite：世界上部署最广泛的数据库。

`[MySQL 的体系架构]` 上层连接池，底层文件系统。

![MySQL 体系结构](https://pic1.imgdb.cn/item/633e76ba16f2c2beb193df24.png)

​	1）连接池 Connection Pool：提供各种方式的连接池。

​	2）管理工具和服务 Services & Utilies：启动、集群、复制、恢复功能的实现方案等等。

​	3）SQL 接口 SQL interface：负责对外沟通，接收 SQL 命令。

​	4）解析器 Parser ：词法语法解析，分解语句，判断正确性。

​	5）优化器 Optiimizer：分析和优化、改写 SQL 命令。

​	6）缓存器 Caches：5.7 版本之前还有数据库内部缓存，包括结果缓存、表缓存、key 缓存等。（缓存找不到才往下找）

​	7）插件式引擎 Pluggable Storage Engines：引擎丰富多彩，支持自由选择。

​	8）文件与日志系统 File System & Logs：最终存储 和 日志的文件。

`[分析]`  描述 MySQL 的逻辑架构。（BIO 通信模型）

​	1）连接层：建立连接，进行鉴权，身份验证。

```sql
# 查询最大连接数,一般会往小改，根据并发原理，一般是 CPU 核数的两倍
show variables like '%max_connections%';
```

​	2）Server 层：SQL 解析优化处理，如果开启缓存则还需要查询缓存（MySQL 8 已经抛弃：弊大于利）

```sql
# 查询缓存机制是否开启（MySQL 缓存是多线程安全的：也就意味会加锁）
show variables like '%query_cache_type%';
```

​	3）存储引擎层：提供了很多存储引擎接口，支持切换。（存储引擎内部有缓存）

​		`InnoDB`：适合短事务。（目前使用）

​		`MyISAM`：不需要支持事务，数据可能错乱。（5.1 版本之前默认）

​		其他的还有：Blackhole（复制思想良好）、CSV、Ferderated、NDB集群引擎、TokuDB 存储引擎（使用分型树优化写操作）、Infobridge（列存储）等。

```sql
# 查询 MySQL 支持的存储引擎
show engines
# 查询默认存储引擎
show variables like '%storage_engine%';
```

​	存储引擎针对表，不同的表可以混用多个存储引擎，但是不推荐混用，可能无法优化。

`[面试题]`  MyISAM 和 InnoDB 存储引擎比较：主要区别在于事务和行表锁两方面。

|          |                         MyISAM                          |                            InnoDB                            |
| -------- | :-----------------------------------------------------: | :----------------------------------------------------------: |
| 主外键   |                         不支持                          |                             支持                             |
| 事务     |                        ` 不支持`                        |                           `支持  `                           |
| 行表锁   | `表锁`，操作一条记录也会锁住整个表 ，不适合高并发的操作 | `行锁`，操作时只锁某一行，不对其它行有影响  适合高并发的操作 |
| 缓存     |               只缓存索引，不缓存真实数据                | 缓存索引并缓存真实数据，对内存要求较高，内存大小对性能有决定性的影响 |
| 表空间   |                           小                            |                              大                              |
| 关注点   |                          性能                           |                             事务                             |
| 默认安装 |                            Y                            |                              Y                               |

​		MySQL 数据以文件方式存放磁盘，包括表文件，数据文件，以及数据库的选项文件，位置位于 `Mysql 安装目录 \data\ 下存放数据表` ，目录名对应数据库名，该目录下文件名对应数据表 。`InnoDB` 引擎数据表只有一个 `*.frm` 文件， 以及上一级目录的 `ibdata1` 文件。但 MyISAM 引擎数据表对应三个文件`*.frm` 表示表结构定义文件，`*.MYD` 表示数据文件(data)，`*. MYI` 表示索引文件 (index)。

​		MyISAM 适用于节约空间及提高相应速度，`InnoDB` 适用于安全性 , 事务处理及多用户操作数据表，默认使用 InnoDB 存储引擎。

> 数据目录查询：
>
> ```sql
> show variables like '%datadir%';
> ```
>
> 当创建一个数据库时，就会在 datadir 目录下创建一个新文件夹，该文件夹下，`frm 文件`描述表结构，而表数据放在 InnoDB 独立的表空间（`ibd 文件`）。
>
> 日志文件查询：
>
> ```sql
> show variables like 'log_error';	# 错误日志文件
> # 还有慢查询日志 host_slow.log
> # 查询日志 host.log
> # 二进制文件 bin.log(执行更改的操作)：可用于转存数据到第三方数据库，需要开启
> ```

`[分析]`  MySQL 的系统库（管理维护是 DBA 的操作）。

1）performance_schema：`性能监控`数据库，将运行时的性能信息通过 performance_schema 存储引擎写到此库。

2）sys：系统库，为 DBA 服务。数据来源于 performance 和 information 库。

3）information_schema：保存 MySQL 的信息（列信息、索引信息等），元数据。

4）mysql：数据库核心，存储 MySQL 的用户账户和权限信息，一些存储过程、事件的定义信息，一些运行过程中产生的日志信息（默认不开启，耗费性能），一些帮助信息以及时区信息等。

5）复制信息表：记录主从复制信息。

# 数据库事务

​	数据库事务：数据库管理系统（DBMS）执行过程中的一个逻辑单位（`不可再进行分割`），由一个有限的数据库操作序列构成（多个DML语句，select 语句不包含事务），`要么全部成功，要么全部不成功`。（多条 SQL 语句一起执行的场景）

> 事务的 ACID 原则（特性）：原子性、一致性、隔离性、持久性。

1、原子性 (Atomicity)：不可分割，要么都成功，要么都失败。

2、一致性 (Consist)：事务前后的数据完整性要保持一致。

3、隔离性(Isolated)：事物的隔离性是多个用户并发访问数据库时，数据库为每一个用户开启的事务，不能被其他事务的操作数据所干扰，事务之间要相互隔离。

> 隔离性不能保证时会导致的一些问题：（可通过串行化执行解决，但性能不好）
>
> 1）`脏读`：指一个事务读取了另外一个事务已经修改但未提交的数据。
>
> 2）`不可重复读`：在一个事务内读取表中的某一行数据，多次读取`结果`不同。（这个不一定是错误，只是某些场合不对）
>
> 3）`虚读（幻读）`：是指在一个事务内读取到了别的事务插入的数据记录，导致前后读取记录`条数`不一致。（读取到之前没读取到的新记录）

4、持久性 (Durable) ：事务一旦提交则不可逆，被持久到数据库中。

`[问题]` 如果说在事务1 过程中，事务2 删掉了原来的数据记录，导致事务1 再一次读取时没有数据，这是属于什么情况？

​		按照 SQL 92 标准，这是属于幻读，但是按照 SQL 本身规定而言属于不可重复读情况。（幻读强调的是记录数变多）

> SQL 92 标准中规定允许牺牲一定的隔离性来换取性能：（MySQL 基本遵循这套标准）
>
> 1）未提交读：可能脏读、可能不可重复读、可能幻读。
>
> 2）已提交读：可能不可重复读，可能幻读。
>
> 3）可重复读：只可能产生幻读。（`MySQL 标准在此种情况下基本已经解决了幻读问题 <==== 锁定读 LBCC 也叫当前读`） =====> `默认的隔离级别`
>
> 4）串行化：都不会产生，但会影响性能。
>
> 查询当前隔离级别：
>
> ```sql
> show variables like 'transaction_isolation';
> ```

`[理论]` `隐式提交`：例如在使用 DDL 语句或者使用 MySQL 系统的数据库时，之前的事务都会被提交（没有写 commit 也会提交）

基本语法：

```sql
-- 使用set语句来改变自动提交模式
SET autocommit = 0;   /*关闭*/
SET autocommit = 1;   /*开启*/

# 注意:
# 1.MySQL 中默认是开启事务自动提交！！！
# 2.使用事务时应先关闭自动提交！！！

# 整个流程：
# 1、关闭自动提交
SET autocommit = 1;
# 2、开始一个事务,标记事务的起始点，从这个之后的sql都在同一个事务内
START TRANSACTION  
# 3、提交一个事务给数据库：持久化（成功！）
COMMIT
# 3、将事务回滚,数据回到本次事务的初始状态（失败！）
ROLLBACK
# 4、事务结束：还原 MySQL 数据库的自动提交
SET autocommit =1;

# 保存点（相当于是存档：可以回滚到具体的保存点位置，避免重复执行） =====> 基本不用
SAVEPOINT 保存点名称 # 设置一个事务保存点
ROLLBACK TO SAVEPOINT 保存点名称 # 回滚到保存点
RELEASE SAVEPOINT 保存点名称 # 撤销删除保存点
```

模拟场景：转账的实现。

```sql
# A 在线买一款价格为500元商品,网上银行转账.A的银行卡余额为2000,然后给商家B支付500.商家B一开始的银行卡余额为10000
# 创建数据库 shop 和创建表 account 并插入2条数据

# 创建数据库 shop
CREATE DATABASE shop CHARACTER SET utf8 COLLATE utf8_general_ci;
# 使用数据库
USE `shop`;
# 创建表 account
CREATE TABLE `account` (
`id` INT(11) NOT NULL AUTO_INCREMENT,
`name` VARCHAR(32) NOT NULL,
`money` DECIMAL(9,2) NOT NULL,
PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8
# 插入数据
INSERT INTO account (`name`,`money`) VALUES('A',2000.00),('B',10000.00)

# 模拟转账实现
SET autocommit = 0; # 关闭自动提交
START TRANSACTION;  # 开始一个事务,标记事务的起始点。
UPDATE account SET money=money-500 WHERE `name`='A';	# A 减500
UPDATE account SET money=money+500 WHERE `name`='B';	# B 加500
COMMIT; 	# 提交事务，就被持久化了
rollback;	# 回滚事务
SET autocommit = 1; 	# 恢复默认值：自动提交。
```

# 数据库设计

​		数据库设计必须使关系满足一定的约束条件，此约束已经形成了`规范（Normal Form）`，分成几个等级，满足这些规范的数据库是简洁的、结构明晰的。

`第一范式 (1NF)`：确保列的`原子性：保证每列属性都是不可再分`，单一属性的列为基本数据类型构成，设计出的表都是简单的二维表。

```sql
# 某个字段家庭信息存放：家庭人口数和家庭地理位置
# 不满足 1NF ，应该修改为两个属性列：家庭人口数、户籍
```

`第二范式 (2NF)`：满足第一范式（1NF）的基础，要求实体的属性完全依赖于主关键字。所谓完全依赖是指不能存在仅依赖主关键字一部分的属性，如果存在，那么这个属性和主关键字的这一部分应该分离出来形成一个新的实体，新实体与原实体之间是一对多的关系。（`每个表只描述一件事情`）

```sql
# 某个订单表同一个订单号有多个产品信息（联合主键：主键由多个字段组成）
# 原订单表：订单号、产品号、产品数量、产品价格、订单金额、订单时间（联合主键：订单号和产品号）
# 发现：产品数量、产品价格和联合主键都有关系，但是订单金额和订单时间仅仅与订单号有关
# 需要拆分两张表：表1（订单号、产品号、产品数量、产品价格）、表2（订单号、订单金额、订单时间）
```

`第三范式 (3NF)`：满足第二范式（2NF）的基础，要求一个数据库表中不包含已在其它表中包含的非主关键字信息，即数据不能存在传递关系，即每个属性都跟主键有直接关系而不是间接关系。（一般是多了臃肿的列属性）

```sql
# 如果学生表中存在班主任的信息（性别、年龄等）就应该剔除实现一张单独的表
```

`[总结]` 完全按照范式设计，会产生一些大量的中间表，会导致后面查询时需要联表查询，影响数据库的查询性能。 ====> `反范式设计`（牺牲规范换取性能）

 `反范式设计`：违背范式设计，但是对查询性能有所提高的数据库设计方式。

1）为了性能和读取效率而适当违反对数据库设计范式的要求。

2）为了查询的性能，允许存在部分（少量）冗余数据。（也就是`使用空间换时间`）

`[案例]`  例如商品信息表：ID、商品名称、商品价格、商品描述。分类表：分类名称和分类描述。商品分类对应关系表：商品名称和分类名称。那么便可以直接将分类名称添加到商品信息表中，这时分类名称便是冗余的，但是不用联表查询。

`[总结]`  范式化设计和反范式化设计的对比。

1）范式化设计的`更新操作更快`，只用修改一张表，而反范式化设计需要改变多张表，维护成本更大。

2）范式设计的表比反范式化更小，操作更快。

3）范式设计的关联的表太多了，查询不方便，但范式化设计减少了表的关联。

4）反范式化设计可以更好地进行索引优化。

设计表时应该尽量遵循范式设计，但发现问题时要及时更改为反范式化设计（权衡利弊），主要还是`根据实际的情况`。

`[理论]` 字段数据类型的选择和优化。

表数据字段类型基本遵循几个基本原则：

1）`更小的通常更好`，数据类型需要在业务允许的范围内选择尽量小的字段。

2）`简单的通常更好`，例如可以用整数和字符串存放某个字段，那么就应该选择简单的整数。

3）`尽量避免允许 Null`，定义字段时尽量让此列 not Null，比较难以优化，MySQL 里面存放 Null 值实际所占用空间反而可能更高。（可以`定义特殊值代表 Null`）

> Null 表示不确定的值（每个 null 值都是不一样的，但是`在索引扫描的时候都是同一个值`）或是空值，用 NULL 进行算术运算 ，结果仍为 Null。

数值类型：一般使用 tinyint（1byte）、 int（4byte） 、bigint（8byte）。

> 需要注意的是位数的设定并没有特别大的作用，只是对输出到客户端(Java)的数据的位数限制，实际数据库仍然能够存更多位数。

浮点类型：float（4byte）、double（8byte）、decimal（存储 56 个数字）

> decimal 实际是以`字符串形式`存储的，输出时需要转化，因此速度也会低于 float 和 double。（`数据要求精确的选择项`）
>
> 如果对操作速度有要求，可以考虑将具体的金额进行转化存储到 bigint 中，这样就能提高操作速度。

字符串类型：一般使用 varchar（变长）、char（定长）、text、tinytext、blob（二进制）、枚举。

> 1）varchar 会有 1~2 个字节存放长度，因此过小的数据不适宜使用 varchar。
>
> 2）varchar 存储数据时，长度不应该超过最大长度限制的一半，可能会有性能问题。
>
> 3）blob 和 text 内存占用大，可能会产生性能问题，使用时尽量分离拆成单独的表。（尽量不用）
>
> 4）必要时，固定的几个字符串时，使用枚举代替字符串存储。枚举在实际保存的时候保存的是`数字`，因此更节省空间。

日期和事件类型：datetime（时间范围大，8byte）、timestamp（4byte，和时区有关）。（精度都只到秒）

> 一定需要存储更小的精度时，可以使用 bigint 来存储时间戳。

`[理论]`  数据库表和字段的命名规范：

1）遵循可读性原则，命名应该能描述所表达的对象，库名和表名一般有一定关联。

2）必须使用小写字母和数字（不以数字开头），不使用复数名词，禁用保留字来命名。

> MySQL 在 window 下不区分大小写，但是在 linux 下默认区分大小写。

3）索引命名要一般体现索引的性质，例如 pk、uk、idx等，索引后面尽量跟上索引字段名称。

4）表示概念是与否的字段一般使用 is_xxx 来命名。

# 数据库操作

## 库表基本操作

`[案例]`  数据库相关操作。

1、创建数据库。

```sql
create database [if not exists] 数据库名;
```

2、删除数据库 （不建议删除数据库）。

```sql
drop database [if exists] 数据库名;
```

3、查看数据库 。

```sql
show databases;
```

4、使用数据库 ，进行表操作前需要选择数据库。

```sql
use 数据库名;
```

注意：使用 Navicat 创建数据库时，将数据库排序规则设置成：`utf8_general_ci` 表示校对时不区分大小写。

`[案例]`  数据表相关操作。

1）创建数据表（DDL）。

```sql
create table [if not exists] `表名`(
   '字段名1' 列类型 [属性][索引][注释],
   '字段名2' 列类型 [属性][索引][注释],
   #...
   '字段名n' 列类型 [属性][索引][注释]
)[表类型][表字符集][注释];
```

`说明` ：反引号用于区别 MySQL 保留字与普通字符而引入的 (键盘esc下面的键)。

2）修改表名操作。

```sql
ALTER TABLE 旧表名 RENAME AS 新表名;
```

3）添加字段操作。

```sql
ALTER TABLE 表名 ADD字段名 列属性[属性];
```

4）修改字段(重命名，修改约束)。

```sql
# 修改约束
ALTER TABLE 表名 MODIFY 字段名 列类型[属性]
# 字段重命名
ALTER TABLE 表名 CHANGE 旧字段名 新字段名 列属性[属性]
# 删除字段
ALTER TABLE 表名 DROP 字段名
```

5）删除数据表操作。

```sql
DROP TABLE [IF EXISTS] 表名
```

​	`注意`：所有的操作尽量加上 if 判断，避免报错。

`[理论]`  数据表的字段上的属性选项。

1）`UnSigned` 设定为无符号数，可以增大正数可使用的范围。

2）`ZEROFILL` 零填充，表示 `不足位数的用 0 来填充` , 例如 int(3)，5 则为 005。

3）`Auto_InCrement` 自增属性，表示该字段在添加记录时会自动加 step（可设定的步长），`通常用于设置主键 index , 且为整数类型`。

> 可定义初始值和步长，同时可以设置全局的自增属性：
>
> ```sql
> SET @@auto_increment_increment=5
> ```

4）Null 和 not Null 非空，`如果设置为 NOT NULL , 则该列必须有值`。

5）DEFAULT 默认，用于`设置该字段的默认值`。

`[规定]`  Alibaba 规定：每个表必须存在五个基本字段：id 主键、version 版本号、is_delete 伪删除、gmt_create 创建时间 和 gmt_update 修改时间。

`[案例]` 创建一个 school 数据库，并创建学生表，表字段为学号、登陆密码、姓名、性别、出生日期、家庭住址、邮箱。

```sql
create database `school`;
use `school`;
CREATE TABLE IF NOT EXISTS `student` (
`id` int(4) NOT NULL AUTO_INCREMENT COMMENT '学号',
`name` varchar(30) NOT NULL DEFAULT '匿名' COMMENT '姓名',		# 设置默认值
`pwd` varchar(20) NOT NULL DEFAULT '123456' COMMENT '密码',
`sex` varchar(2) NOT NULL DEFAULT '男' COMMENT '性别',
`birthday` datetime DEFAULT NULL COMMENT '生日',
`address` varchar(100) DEFAULT NULL COMMENT '地址',
`email` varchar(50) DEFAULT NULL COMMENT '邮箱',
PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8

-- 查看数据库的定义
SHOW CREATE DATABASE school;
-- 查看数据表的定义
SHOW CREATE TABLE student;
-- 显示表结构
DESC student;  
-- 设置严格检查模式(不能容错)
SET sql_mode='STRICT_TRANS_TABLES';
```

`[理论]`  可以为数据库，数据表，数据列设定不同的字符集。

1）创建时通过命令来设置，不设置的话，`默认不支持中文`。

```sql
CREATE TABLE 表名()CHARSET = utf8。
```

2）根据 MySQL 数据库配置文件 `my.ini` 中的参数设定。

```sql
character-set-server=utf8
```

`[理论]`  其他常见一般操作。

```sql
1. 可用反引号（``）为标识符（库名、表名、字段名、索引、别名）包裹，以避免与关键字重名！中文也可以作为标识符！
2. 每个库目录存在一个保存当前数据库的选项文件 db.opt。
3. 注释：
  单行注释 # 注释内容
  多行注释 /* 注释内容 */
  单行注释 -- 注释内容       (标准SQL注释风格，要求双破折号后加一空格符（空格、TAB、换行等）)
4. 模式通配符：
  _   任意单个字符
  %   任意多个字符，甚至包括零字符
  单引号需要进行转义 \' 
5. CMD 命令行内的语句结束符可以为 ";", "\G", "\g"，仅影响显示结果。其他地方还是用分号结束。delimiter 可修改当前对话的语句结束符。
6. SQL对大小写不敏感 （关键字）
7. 清除已有语句：\c
```

## DML基本操作

​		数据库管理一般使用 `DML语句`管理数据库数据（还可以使用可视化工具），主要包括 `添加 、更新 、删除  `操作。

`[理论操作]`  添加数据操作：需要注意如果不指明插入字段，则添加的值务必与表结构，数据列，顺序相对应，且数量一致，同时此操作 `返回插入数据条数`。

```sql
# 基本语法
INSERT INTO 表名[(字段1,字段2,字段3,...)] VALUES('值1','值2','值3')

# 基本使用案例和细节说明：
INSERT INTO grade(gradename) VALUES ('大一');
-- 主键自增,那能否省略呢? 可以省略
INSERT INTO grade VALUES ('大二');
-- 查询:INSERT INTO grade VALUE ('大二') 错误代码：1136
Column count doesn`t match value count at row 1
-- 结论:'字段1,字段2...'该部分可省略 , 但添加的值务必与表结构,数据列,顺序相对应,且数量一致.

-- 批量插入多条数据
INSERT INTO grade(gradename) VALUES ('大三'),('大四');
```

`[理论操作]`  修改数据操作：需要注意如果 condition 筛选条件不指定具体数据记录则修改该表的所有列数据，同时此操作`返回受影响的行数` 。

```sql
UPDATE 表名 SET column_name=value [,column_name2=value2,...] [WHERE condition];

# 修改年级信息
UPDATE grade SET gradename = '高中' WHERE gradeid = 1;
```

`[理论操作]`  删除数据操作：需要注意如果 condition 筛选条件不指定具体数据记录则删除该表的所有列数据，同时此操作`返回受影响的行数` 。

```sql
# 避免这样，会删除表中全部数据
DELETE FROM 表名

# 删除指定数据
DELETE FROM 表名 [WHERE condition];

# 删除 gradeid = 5 的数据记录
DELETE FROM grade WHERE gradeid = 5
```

`[理论操作]`  清空数据表操作：使用 `TRUNCATE` 将`完全清空表数据`，但表结构，索引，约束等不变 。

```sql
TRUNCATE [TABLE] table_name;
```

​		truncate 和 delete 操作都能删除数据，都不删除表结构 , 但 truncate 删除速度更快，且 truncate 会重新设置自增属性的计数器，但 delete 并不会重置，同时还不会对事务影响。

```sql
# 创建一个测试表
CREATE TABLE `test` (
`id` INT(4) NOT NULL AUTO_INCREMENT,
`coll` VARCHAR(20) NOT NULL,
PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8

# 插入几个测试数据
INSERT INTO test(`coll`) VALUES('row1'),('row2'),('row3');

# 删除表数据，如不指定 Where 则删除该表的所有列数据，自增当前值依然从原来基础上进行,会记录日志。
DELETE FROM test;

# 清空表数据(truncate)，truncate 清空数据,自增当前值会恢复到初始值重新开始，不会记录日志。
TRUNCATE TABLE test;

# 同样使用 DELETE 清空不同引擎的数据库表数据，重启数据库服务后
# InnoDB : 自增列从初始值重新开始 (因为是存储在内存中，断电即失)（但 MySQL 8.0 已经修复了）
# MyISAM : 自增列依然从上一个自增数据基础上开始 (存在文件中，不会丢失)
```

## DQL基本操作

​		DQL 就是`数据查询语言`，是数据库语言中最核心，最重要的语句，是使用频率最高的语句，使用 `select` 关键字。

SQL 的完整语法：（ [ ] 括号代表可选， { } 括号代表必选）

```sql
SELECT [ALL | DISTINCT]		# 去重
{* | table.* | [table.field1[as alias1][,table.field2[as alias2]][,...]]}	# 查询字段以及别名
FROM table_name [as table_alias]
  [left | right | inner join table_name2]  	# 联合查询
  [WHERE ...]  	# 指定结果需满足的条件
  [GROUP BY ...]  	# 指定结果按照哪几个字段来分组
  [HAVING]  	# 过滤分组的记录必须满足的次要条件，条件和 where 一样，但位置不同
  [ORDER BY ...]  	# 指定查询记录按一个或多个条件排序
  [LIMIT {[offset,]row_count | row_countOFFSET offset}];	# 指定查询的记录从哪条至哪条
```

### 基本查询

1）查询表中所有数据。

```sql
select * from student;	# 效率低
select 1 from student；
```

2）查询指定字段数据。

```sql
# 查询指定列：学号 和 姓名
select studentno,studentname from student;
```

3）使用 `as` 关键字查询数据并重命名。

```sql
# 这里是为列取别名(当然 as 关键词可以省略)
SELECT studentno AS 学号,studentname AS 姓名 FROM student;

# 使用 as 也可以为表取别名
SELECT studentno AS 学号,studentname AS 姓名 FROM student AS s;

# 使用as，为查询结果取一个新名字，CONCAT() 函数拼接字符串
SELECT CONCAT('姓名:',studentname) AS 新姓名 FROM student;
```

4）使用 `distinct` 关键字去除查询记录结果中的重复记录。

```sql
# 利用学号查询哪些同学参加了考试
SELECT * FROM result; 	# 1、查看全部考试成绩
SELECT studentno FROM result; 	# 2、查看哪些同学参加了考试
SELECT DISTINCT studentno FROM result; # 3、DISTINCT 去除重复数据项 , (默认是ALL)
```

5）对一些 MySQL 的基本信息的查询。数据库中的表达式 一般由文本值，列值，NULL，函数和操作符等组成，可以在返回结果列中使用，也可以在order by, having 等子句中使用，也可以在 where 条件语句中使用。

```sql
# selcet 查询中可以使用表达式
SELECT @@auto_increment_increment; 		# 查询自增步长
SELECT VERSION(); 		# 查询系统版本号
SELECT 100*3-1 AS 计算结果; 	# 用来计算

# 学员考试成绩集体加一分查看
SELECT studentno,StudentResult+1 AS '提分后' FROM result;
```

### 条件查询

`[理论]`  条件查询主要用于检索数据表中 `符合设定条件` 的记录，而具体的搜索条件可由一个或多个逻辑表达式组成 , 结果一般为 boolean：真或假。

> `and`：&&，表示逻辑与操作，同时为 true 才为 true。
>
> `or`：||，表示逻辑或操作，有一个为 true 就为 true。
>
> `not`：！，表示逻辑非操作，操作为 false 就为 true。

```sql
# 所有学生的成绩查询
SELECT Studentno,StudentResult FROM result;
# 查询考试成绩在95-100之间的：使用 and 或 &&
SELECT Studentno,StudentResult FROM result WHERE StudentResult>=95 AND StudentResult<=100;
# 模糊查询(对应的词:精确查询)	BETWEEN...AND
SELECT Studentno,StudentResult FROM result WHERE StudentResult BETWEEN 95 AND 100;
# 除了1000号同学,查询其他同学的成绩
SELECT studentno,studentresult FROM result WHERE studentno!=1000;
# 使用 NOT 查询1000号以外其他同学的成绩
SELECT studentno,studentresult FROM result WHERE NOT studentno=1000;
```

`[理论]`  可以使用一些比较运算符来进行模糊查询。

1）`is null` 和 `is not null` 表示查询该项为 null 或者不为 null。

> 当判断某项数据是否为 null 时不能使用 `= Null`，二应该使用 is null。

```sql
# 查询出生日期没有填写的同学（注意此处的判空操作：双重判断）
SELECT studentname FROM student WHERE BornDate IS NULL OR BornDate='';
# 查询出生日期填写的同学
SELECT studentname FROM student WHERE BornDate IS NOT NULL;
# 查询没有写家庭住址的同学(空字符串并不等于null)
SELECT studentname FROM student WHERE Address='' OR Address IS NULL;
```

2）`between and` 表示查询某项位于某个区间内的数据。

3）`like` 表示模糊匹配，有一定的匹配技巧和语法，一般可能会搭配 % （表示转义或缺省）来使用。

```sql
# 查询姓刘的同学的学号及姓名
# like 结合使用的通配符 : % (代表 0 到任意个字符，主要只能在 like 里面使用)	 	
SELECT studentno,studentname FROM student WHERE studentname LIKE '刘%';	# 表示后面可能还有多个字符
SELECT studentno,studentname FROM student WHERE studentname LIKE '%刘';	# 表示前面可能还有多个字符
# 查询姓刘的同学,后面只有一个字的，_ (代表一个字符)
SELECT studentno,studentname FROM student WHERE studentname LIKE '刘_';
# 查询姓刘的同学,后面只有两个字的
SELECT studentno,studentname FROM student WHERE studentname LIKE '刘__';
# 查询姓名中含有'嘉'字的
SELECT studentno,studentname FROM student WHERE studentname LIKE '%嘉%';
```

4）`in` 表示判断某项是否位于某个范围内，in 后面跟范围。

```sql
# 查询学号为 1000,1001,1002 的学生姓名
SELECT studentno,studentname FROM student WHERE studentno IN (1000,1001,1002);
# 查询地址在北京,南京或河南洛阳的学生
SELECT studentno,studentname,address FROM student WHERE address IN ('北京','南京','河南洛阳');
```

### 联表查询

​		联表查询是 SQL 高阶查询的重点查询方式，可以分为 `join 联表查询` 和 `自联结查询`。

`[理论]`  `JOIN` 是对多张表进行结果汇总的一起查询，一般和 `on` 一起使用，使用 Join 联表查询有几种方式。

1）`inner join `：内连接查询，表示取出两张表的`交集`。

2）`left join`：左连接查询，表示以左表为基准，右边表来匹配，匹配不上的，`返回左表的记录`，右表以 NULL 填充。

3）`right join`：右连接查询，表示以右表为基准，左边表来匹配，匹配不上的，`返回右表的记录`，左表以 NULL 填充。

`[案例分析]`  分析网络上的其中 join 理论，全面解释每种的用法，案例为：查询参加了考试的同学信息(学号、学生姓名、科目编号、分数)。

```sql
SELECT * FROM student;	# 查询所有学生
SELECT * FROM result;	# 查询所有成绩
# (1) 分析需求,确定查询的列来源于两个类,student result,连接查询
# (2) 确定使用哪种连接查询? (内连接)：如果表中至少有一个匹配，就返回行
# (3) 确定交叉点，判断这两个表中哪个数据是相同的：学号 studentno，那么判断条件：result.studentno = student.studentno
SELECT s.studentno,studentname,Subjectno,StudentResult 
FROM student s
INNER JOIN result r on r.studentno = s.studentno
```

```sql
# 右连接方式实现：会从右表中返回所有的值，即使左表中没有匹配，没有匹配的记录填充 null
SELECT s.studentno,studentname,subjectno,StudentResult
FROM student s
RIGHT JOIN result r
ON r.studentno = s.studentno
```

```sql
# 左连接方式实现(查询了所有同学,不考试的也会查出来)：会从左表中返回所有的值，即使右表中没有匹配，没有匹配的记录填充 null
SELECT s.studentno,studentname,subjectno,StudentResult
FROM student s
LEFT JOIN result r
ON r.studentno = s.studentno

# 查询缺考的同学(左连接应用场景)
SELECT s.studentno,studentname,subjectno,StudentResult
FROM student s
LEFT JOIN result r
ON r.studentno = s.studentno
WHERE StudentResult IS NULL
```

`[案例实现]`  查询参加了考试的同学信息(学号，学生姓名，科目名，分数)：三表查询。

```sql
# (1) 分析需求,确定查询的列来源于两个类,student result,subject 连接查询
# (2) 确定使用哪种连接查询? (内连接)：如果表中至少有一个匹配，就返回行
# 确定交叉点：这两个表中哪个数据是相同的，判断条件：学生表中的 studentNo=成绩表中的studentNo，result表中的subjectNo=subject 表中的subjectNo
# 解决步骤：
# 1、确定查询字段
# 2、确定从哪几个表查，确定 基准表
# 3、查询考试信息 ===> 以 result 表为基准
# 4、前面两个表结果再和后面的 subject 表需要查交集 ====> Inner Join
# 注意：假设存在一种多张表查询，慢慢来，先查询两张表然后慢慢增加
SELECT s.studentno,studentname,subjectname,StudentResult
FROM student s
RIGHT JOIN result r
ON r.studentno = s.studentno
INNER JOIN `subject` sub
ON sub.subjectno = r.subjectno
```

`[案例实现]`  补充联表查询的 SQL 语句实例。

```sql
# 查询学员及所属的年级(学号,学生姓名,年级名)
SELECT studentno AS 学号,studentname AS 学生姓名,gradename AS 年级名称
FROM student s
INNER JOIN grade g
ON s.`GradeId` = g.`GradeID`

# 查询科目及所属的年级(科目名称,年级名称)
SELECT subjectname AS 科目名称,gradename AS 年级名称
FROM SUBJECT sub
INNER JOIN grade g
ON sub.gradeid = g.gradeid

# 查询参加了高等数学-1 的所有考试结果(学号 学生姓名 科目名称 成绩)
SELECT s.studentno,studentname,subjectname,StudentResult
FROM student s
INNER JOIN result r
ON r.studentno = s.studentno
INNER JOIN `subject` sub
ON r.subjectno = sub.subjectno
WHERE subjectName="高等数学-1"
```

`[理论]`  `七种 Join 理论`的场景适用。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200511191943540.png)

`[理论]`  还存在场景，需要数据表和自身连接查询，这种方案的核心就是`将一张表拆成两张相同的表`使用。

​	对于下面这张表，父类和子类都在同一个表中，那么如何查询到查询父类对应的子类关系呢？这就需要看清楚他们的父子关系，只有部分记录的父 id 是1，这就表示这是父类，其余记录的父 id 是这几个中的其中一个。

```sql
# 创建一个表
CREATE TABLE `category` (
`categoryid` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主题id',
`pid` INT(10) NOT NULL COMMENT '父id',
`categoryName` VARCHAR(50) NOT NULL COMMENT '主题名字',
PRIMARY KEY (`categoryid`)
) ENGINE=INNODB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8

# 插入数据
INSERT INTO `category` (`categoryid`, `pid`, `categoryName`)
VALUES  ('2','1','信息技术'),
        ('3','1','软件开发'),
        ('4','3','数据库'),
        ('5','1','美术设计'),
        ('6','3','web开发'),
        ('7','5','ps技术'),
        ('8','2','办公信息');
```

```sql
# 从一个包含栏目ID , 栏目名称和父栏目ID的表中，查询父栏目名称和其他子栏目名称
# 编写SQL语句,将栏目的父子关系呈现出来 (父栏目名称,子栏目名称)
# 核心思想:把一张表看成两张一模一样的表,然后将这两张表连接查询(自连接)
SELECT a.categoryName AS '父栏目',b.categoryName AS '子栏目'
FROM category AS a,category AS b
WHERE a.`categoryid`=b.`pid`
```

### 分页排序

`[理论]`分页使用 `limit` 关键字实现，需要注意数据是从 0 开始计算。

```sql
limit 起始值，页面的大小
# 第 N 页 : limit (pageNo-1)*pageSzie,pageSzie
# pageNo: 当前页码
# pageSize: 单页面显示条数
# 数据总页数：ceil(数据总数/页面大小)
```

`[理论]`排序使用 `order by` 关键字实现，分为`升序（asc）和倒序（desc）`两种，用来对查询结果进行整理。

```sql
ORDER BY 字段 asc/desc	# 默认按照 ASC 升序对记录进行排序。
```

`[案例]`  查询 高等数学-1 课程成绩前 10 名并且分数大于 80 的学生信息(学号、姓名、课程名、分数)

```sql
select s.studentno as "学号",studentname as "姓名",subjectname as "课程",studentResult as "分数"
from student as s
inner join result as r
on s.studentno=r.studentno
inner join subject as sub
on sub.subjectno=r.subjectno
where r.studentResult > 80 and sub.subjectname="高等数学-1"
order by r.studentResult desc
limit 0,10;
```

###  子句查询

`[理论]`  子查询就是 where 的查询条件是一个查询语句：在查询语句中的 WHERE 条件子句中，又嵌套了另一个查询语句。

`注意`：嵌套查询可由多个子查询组成，求解的方式是由里及外，子查询返回的结果一般都是集合，故而建议使用 `IN` 关键字。

```sql
# 查询 高等数学-1 的所有考试结果(学号,科目名称,成绩),并且成绩降序排列。
# 方法一:使用连接查询
SELECT studentno,r.subjectname,StudentResult
FROM result r
INNER JOIN `subject` sub
ON r.`SubjectNo`=sub.`SubjectNo`
WHERE subjectname = '高等数学-1'
ORDER BY studentresult DESC;

# 方法二:使用子查询(执行顺序:由里及外)
select studentno as "学号",subjectno as "科目编号",studentResult as "成绩"
from result as r
where subjectno=(
	select subjectno from subject where subjectname="高等数学-1"
)
order by studentResult desc;


# 查询课程为 高等数学-2 且分数不小于80分的学生的学号和姓名
# 方法一:使用连接查询	DISTINCT 去重复
SELECT DISTINCT s.studentno,studentname
FROM student s
INNER JOIN result r
ON s.`StudentNo` = r.`StudentNo`
INNER JOIN `subject` sub
ON sub.`SubjectNo` = r.`SubjectNo`
WHERE subjectname = '高等数学-2' AND StudentResult>=80

# 方法二:使用连接查询+子查询
# 分数不小于80分的学生的学号和姓名
SELECT r.studentno,studentname 
FROM student s
INNER JOIN result r ON s.`StudentNo`=r.`StudentNo`
WHERE StudentResult>=80 AND subjectno=...

# 在上面SQL基础上,添加需求:课程为 高等数学-2
SELECT r.studentno,studentname FROM student s
INNER JOIN result r ON s.`StudentNo`=r.`StudentNo`
WHERE StudentResult>=80 AND subjectno=(
   SELECT subjectno FROM subject WHERE subjectname = '高等数学-2'
)

# 方法三:使用纯子查询
# 分步写简单sql语句,然后将其嵌套起来（由里及外）
SELECT studentno,studentname FROM student WHERE studentno IN(
   SELECT studentno FROM result WHERE StudentResult>=80 AND subjectno=(
       SELECT subjectno FROM `subject` WHERE subjectname = '高等数学-2'
  )
)

# 查 C语言-1 的前5名学生的成绩信息(学号,姓名,分数)
# 方法一：联表查询
select s.studentno as "学号",studentname as "姓名",studentResult as "分数"
from student as s
inner join result as r
on s.studentno=r.studentno
inner join subject as sub
on sub.subjectno=r.subjectno
where sub.subjectname="C语言-1"
order by r.studentResult desc
limit 0,5;

# 方法二:使用连接查询+子查询
select s.studentno as "学号",studentname as "姓名",studentResult as "分数"
from student as s 
inner join result as r
on s.studentno=r.studentno
where r.subjectno in (
	select subjectno from subject where subjectname="C语言-1"
)
order by r.studentResult desc
limit 0,5;

# 使用子查询,查询张伟同学所在的年级名称
select gradename
from grade
where gradeid in (
	select gradeid from student where studentname="张伟"
)
```

# 外键概述

`[案例]`  引用别人的表叫主表，被引用的表叫从表。在下面的示例中，学生表的外键是 gradeid，引用年级表。学生表为主表，年级表为从表。

外键作用：保持数据一致性，完整性，主要目的是控制和约束存储在外键表中的数据，使两张表形成关联，外键只能引用外表中的列的值或使用空值。

1）创建外键的方式一：创建子表同时创建外键，增加约束，此种方法麻烦复杂。

```sql
# 年级表 (id、年级名称)
CREATE TABLE `grade` (
`gradeid` INT(10) NOT NULL AUTO_INCREMENT COMMENT '年级ID',
`gradename` VARCHAR(50) NOT NULL COMMENT '年级名称',
PRIMARY KEY (`gradeid`)
) ENGINE=INNODB DEFAULT CHARSET=utf8

# 学生表的 gradeid 字段 要去引用年纪表的 gradeid
# 定义外键 key 
# 给这个外键添加约束（执行引用） references 引用
# 学生信息表 (学号,姓名,性别,年级,手机,地址,出生日期,邮箱,身份证号)
CREATE TABLE `student` (
`studentno` INT(4) NOT NULL COMMENT '学号',
`studentname` VARCHAR(20) NOT NULL DEFAULT '匿名' COMMENT '姓名',
`sex` TINYINT(1) DEFAULT '1' COMMENT '性别',
`gradeid` INT(10) DEFAULT NULL COMMENT '年级',
`phoneNum` VARCHAR(50) NOT NULL COMMENT '手机',
`address` VARCHAR(255) DEFAULT NULL COMMENT '地址',
`borndate` DATETIME DEFAULT NULL COMMENT '生日',
`email` VARCHAR(50) DEFAULT NULL COMMENT '邮箱',
`idCard` VARCHAR(18) DEFAULT NULL COMMENT '身份证号',
PRIMARY KEY (`studentno`),
KEY `FK_gradeid` (`gradeid`),
CONSTRAINT `FK_gradeid` FOREIGN KEY (`gradeid`) REFERENCES `grade` (`gradeid`)		# 设置外键约束
) ENGINE=INNODB DEFAULT CHARSET=utf8
```

2）创建外键的方式二：创建子表完毕后,修改子表添加外键。

```sql
ALTER TABLE `student` ADD CONSTRAINT `FK_gradeid` FOREIGN KEY (`gradeid`) REFERENCES `grade` (`gradeid`);
```

> 删除外键注意项：`删除具有主外键关系的表时 , 要先删子表 , 后删主表。`

```sql
# 删除外键
ALTER TABLE student DROP FOREIGN KEY FK_gradeid;
# 发现执行完上面的,索引还在,所以还要删除索引
# 注:这个索引是建立外键的时候默认生成的
ALTER TABLE student DROP INDEX FK_gradeid;
```

`以上的操作都是物理外键，数据库级别的外键，我们不建议使用！（避免数据库过多造成困扰，这里了解即可！）`

> Alibaba 开发手册规定：不得使用外键和级联，一切外键概念必须在应用层解决。（Java 代码实现），因此更推荐的方式是数据库就是单纯的表，只用来存数据，只有行（数据）和列（字段），如果想要多张表的数据就使用程序实现（联表查询等），而不是使用外键。

# 基本函数

##  基本处理函数

`[理论]`  数据库级别的基本数学计算函数。（实际不怎么实用）

1）绝对值函数。

```sql
SELECT ABS(-8);
```

2）向上取整和向下取整函数。

```sql
# 向上取整
SELECT CEILING(9.4); 	
# 向下取整
SELECT FLOOR(9.4);  
```

3）生成随机数函数，返回一个 0-1 之间的随机数。

```sql
SELECT RAND(); 
```

4）符号函数，用于确定一个数的正负性，负数返回 -1，正数返回 1，0返回 0 。

```sql
SELECT SIGN(0); 	
```

`[理论]`  数据库级别的字符串使用函数，需要注意字符串的操作索引是`从 1 开始计数`，和 Java 有区别。

1）合并字符串。

```sql
SELECT CONCAT('我','爱','程序');  
```

2）截取字符串。

```sql
SELECT SUBSTR('我们说坚持就能成功',4,6);
```

3）替换字符串。

```sql
SELECT REPLACE('我们坚持就能成功','坚持','努力'); 
```

4）其余函数（不怎么使用）。

```sql
 # 返回字符串包含的字符数
 SELECT CHAR_LENGTH('所爱隔山海，山海皆可平'); 
  # 替换字符串,从某个位置开始替换某个长度，从第一个位置替换两个长度
 SELECT INSERT('我爱编程helloworld',1,2,'超级热爱');  
 # 转小写
 SELECT LOWER('GaoZHeng'); 	
 # 转大写
 SELECT UPPER('KuangShen'); 	
 # 返回第一次出现的字串的索引
 SELECT INSTR('GaoZHeng','H');	
 # 从左边截取
 SELECT LEFT('hello,world',5);   
 # 从右边截取
 SELECT RIGHT('hello,world',5);  
 # 反转
 SELECT REVERSE('我们说坚持就能成功');
 
 # 查询姓周的同学,改成邹，不会修改源数据
 SELECT REPLACE(studentname,'周','邹') AS 新名字
 FROM student WHERE studentname LIKE '周%';
```

`[理论]`  日期和时间的操作函数。

```sql
 # 获取当前日期
 SELECT CURRENT_DATE();   
 SELECT CURDATE();   
 # 获取当前日期和时间
 SELECT NOW();   
 # 获取当前本地日期和时间
 SELECT LOCALTIME();   
 # 获取当前系统日期和时间
 SELECT SYSDATE();   
 
 # 获取年、月、日、时、分、秒
 SELECT YEAR(NOW());
 SELECT MONTH(NOW());
 SELECT DAY(NOW());
 SELECT HOUR(NOW());
 SELECT MINUTE(NOW());
 SELECT SECOND(NOW());
```

`[理论]`  系统信息操作函数。

```sql
 # 查询 MySQL 版本
 SELECT VERSION(); 			
 # 查询当前登录用户
 SELECT SYSTEM_USER();    
 SELECT USER();     		
```

## 进阶聚合函数

​		聚合函数是实际工作中使用比较多的函数，可以对查询的数据进行一定的`计算和处理`，例如平均值或是计算总和等。

1）`count` 函数：返回满足 Select 条件的记录总和数。

```sql
# count(字段) 会统计该字段在表中出现的次数，忽略字段为 null 的情况。即不统计字段为 null 的记录。
SELECT COUNT(studentname) FROM student;
# count(*) 包括了所有的列，相当于行数，在统计结果的时候，包含字段为 null 的记录。
SELECT COUNT(*) FROM student;
# count(1) 用 1 代表代码行，在统计结果的时候，包含字段为 null 的记录。(推荐使用)
```

> ​		很多人认为 `count(1)` 执行的效率会比 `count(*)` 高，原因是后者会存在全表扫描，而 count(1) 可以针对一个字段进行查询。其实二者都会对全表进行扫描，统计所有记录的条数，包括那些为 null 的记录，因此，`效率相差无几`。而 count(字段) 则与前两者不同，它会统计该字段不为 null 的记录条数。因此在表没有主键时，count(1) 比 count(*) 快，在有主键时，主键作为计算条件，count(主键)统计效率最高，若表格只有一个字段，则 `count(*)` 效率较高。

2）`sum` 函数：返回数字字段或表达式列作统计，返回一列的总和。

3）`avg` 函数：通常为数值字段或表达列作统计，返回一列的平均值。

4）`max` 函数：可以为数值字段，字符字段或表达式列作统计，返回最大的值。

5）`min` 函数：可以为数值字段，字符字段或表达式列作统计，返回最小的值。

```sql
# 总和
SELECT SUM(StudentResult) AS "总和" FROM result;
# 平均值
SELECT AVG(StudentResult) AS "平均分" FROM result;
# 最高值
SELECT MAX(StudentResult) AS "最高分" FROM result;
# 最低值
SELECT MIN(StudentResult) AS "最低分" FROM result;
```

## 分组过滤方法

`[案例]`  查询不同课程的平均分，最高分，最低分，此时就需要对课程进行`分组统计`。

```sql
select subjectname,avg(studentResult) as "平均分",max(studentResult) as "最高分",min(studentResult) as "最低分"
from result as r
inner join subject as sub
on sub.subjectno=r.subjectno
group by r.subjectno; 
```

​		但是如果加一个要求平均分大于 80 分，就需要对结果再进行过滤。

> where 需要写在 group by 前面，是从数据表中的字段直接进行的筛选的，因此就需要使用 `having` ，从前面筛选的字段再筛选。
>

```sql
# 查询不同课程的平均分,最高分,最低分，同时要求平均分大于 80 分。
select subjectname,avg(studentResult) as "平均分",max(studentResult) as "最高分",min(studentResult) as "最低分"
from result as r
inner join subject as sub
on sub.subjectno=r.subjectno
group by r.subjectno
having `平均分`>=80;
```

## 数据库 MD5

​		`MD5` 即 Message-Digest Algorithm 5（信息-摘要算法5），用于确保信息传输完整一致。是计算机广泛使用的杂凑算法之一（又译摘要算法、哈希算法），主流编程语言普遍已有 MD5 实现。将数据（如汉字）运算为另一固定长度值，是杂凑算法的基础原理，MD5 的前身有 MD2、MD3 和 MD4。其主要是为了增强算法复杂度和不可逆性。但 MD 5不可逆，具体的值的 MD5 是一样的，MD5 破解网站的原理，背后有一个字典，利用 MD5 加密后的值查找加密前的值。

```sql
 CREATE TABLE `testmd5` (
  `id` INT(4) NOT NULL,
  `name` VARCHAR(20) NOT NULL,
  `pwd` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
 ) ENGINE=INNODB DEFAULT CHARSET=utf8
 INSERT INTO testmd5 VALUES(1,'zhangsan','123456'),(2,'lisi','456789')，(3,'wangwu','456789')
 
 # 对 pwd 这一列数据进行加密
 update testmd5 set pwd = md5(pwd);
 # 单独对某个用户(如gaozheng)的密码在进行加密加密
 INSERT INTO testmd5 VALUES(4,'gaozheng','123456')
 update testmd5 set pwd = md5(pwd) where name = 'gaozheng';
 # 插入新的数据自动加密
 INSERT INTO testmd5 VALUES(5,'gaozheng2','123456')
 # 查询登录用户信息（md5对比使用，查看用户输入加密后的密码进行比对）
 SELECT * FROM testmd5 WHERE `name`='gaozheng' AND pwd=MD5('123456');
```

# 高性能索引

​		索引（Index）是帮助 MySQL `高效获取数据`的数据结构，其本质就是数据结构，类似于一本书的目录（线型结构），快速定位到具体的数据。InnoDB 存储引擎支持的索引有：`B+树索引`、全文索引、哈希索引（内部热点数据的处理），其中比较关键的是 B+树索引。

`[问题]`  哈希索引很高效，为什么 MySQL 主索引不使用哈希索引呢？

1）哈希索引只适合匹配查找，并`不适合范围查找`。

2）哈希索引的存储方式是`没办法排序`的。

3）哈希索引本质是一种压缩算法，大数据量下可能会出现`哈希冲突`，影响性能。

## B+ 树索引

​	`B+树索引`就是传统意义上的索引，这是目前关系型数据库系统中查找最常用和最为有效的索引。B+树是通过二叉查找树（可能严重不平衡），演变为平衡二叉树（数据量大了这个树就会很高，同时维护效率低：插入删除时左旋右旋等），再演变为 `B树`（就是一步步提高查询的效率）。而 `B+ 树就是 B 树`（多路搜索树、多叉平衡查找树）的变种。

![image-20220717203821622](https://pic1.imgdb.cn/item/633e76d816f2c2beb1941a51.png)

1）B+ 树一个节点下面有多个子节点，并不止两条，因此`树的高度会很低`。

2）B+ 树的中间节点不存储数据，保存索引和 key 值，`真实数据都在叶子节点上`。

3）B+ 树的叶子节点还单独另外有指针，相当于`叶子节点之间还形成了链表，且还是有序`的。

4）B+ 树的插入和删除还是有一定的性能问题，因为为了保持平衡，插入节点就会有节点分裂以及节点提升等等问题（B+ 树数据结构本身的问题），为了解决这些问题实际可以使用`旋转`的机制，而删除可能涉及到非叶子节点，可能会因为填充因子（50%）会造成叶子节点的合并。

> B+ 树也是一个`平衡树`，且叶子节点上存储的数据也是有序的，即`叶子节点上的数据也是有序的`，因此解决了范围查找的问题。

`[问题]`  为什么索引不适用 B 树，而使用 B+ 树？（`一个索引就是一个 B+ 树`）

​		B 树和 B+树的最大区别就是，B 树不管叶子节点还是非叶子节点，都会保存数据，这样导致在非叶子节点中能保存的指针数量变少（也称为扇出），指针少的情况下要保存大量数据，只能增加树的高度，导致 IO 操作变多，查询性能变低。

`[理论]`  B+ 树和磁盘的关系（根本原因）。

​		磁盘上数据定位使用一个三维地址唯一标示：`柱面号`、`盘面号`、`扇区号`，这个扇区就是读取文件的最小单元，现在磁盘扇区一般是 512 个字节 或 4k 个字节。那么读/写磁盘上某一指定数据需要下面步骤：

1）首先移动臂根据柱面号使磁头移动到所需要的柱面上，这一过程被称为定位或查找。 

2）所有磁头都定位到磁道上后，这时根据盘面号来确定指定盘面上的具体磁道。 （寻道时间）

3） 盘面确定以后，盘片开始旋转，将指定扇区的磁道段移动至磁头下。（旋转延迟）

​		因此可以发现磁盘的读取主要包括三个方面：寻道时间、旋转延迟 和 读取事件，速度会比较慢（9ms），那么为了提高效率，`磁盘往往不是严格按需读取`，而是每次都会`预读`，即使只需要一个字节，磁盘也会从这个位置开始，顺序向后读取一定长度的数据放入内存。遵循`局部性原理`： 当一个数据被用到时，因为程序运行期间所需要的数据通常比较集中，其附近的数据也通常会马上被使用，因此常常会预读。（例如源码中的局部变量就会被优先加载到缓存中）

​		预读的长度一般为`页（page）的整倍数`。页是计算机管理存储器的逻辑块，页大小通常为 4k 或 16K 的，`主存和磁盘以页为单位交换数据`。磁盘`顺序读取的效率很高`（不需要寻道时间，只需很少的旋转时间就可以直接读取），因此具有局部性的数据的读取效率会很高。

> ​		当程序要读取的数据不在主存中时，会触发一个`缺页异常`，此时系统会向磁盘发出读盘信号，磁盘会找到数据的起始位置并向后连续读取一页或几页载入内存中，然后异常返回，程序继续运行。

​		按照磁盘的这种性质，如果`一个页存放一个 B+树的节点`，自然是可以存放很多的数据的， InnoDB 里规定 B+树的节点大小是16KB，这就是说，假如一个 Key 是 8 个字节，那么一个节点可以存放大约 1000 个Key（指向子节点的指针），意味着 B+树可以有 1000 个分叉。同时由于 InnoDB 每一次磁盘 I/O，读取的都是页 16KB 的整数倍的数据，即 InnoDB 在节点的读写上是可以充分利用`磁盘顺序IO`的高速读写特性。 同时按照 B+树逻辑结构来说，在叶子节点一层，所有记录的主键按照从小到大的`顺序排列`，并且形成了一个双向链表。同一层的非叶子节点也互相串联，形成了一个双向链表。那么在实际读写的时候，很大的概率相邻的节点会放在相邻的页上，又可以`充分利用磁盘顺序 IO 的高速读写特性`。因此`对MySQL 优化的一大方向就是尽可能的多让数据顺序读写，少让数据随机读写`。

## InnoDB 索引

`[理论]`  聚集索引（聚簇索引），也称为`主键索引`。

​	主键索引就是将表的主键用来构造一棵 B+ 树，并且将整张表的行记录数据存放在该 B+ 树的`叶子节点`中。

​		1）叶子节点上包含该记录的所有信息，同时主键连续，读取速度会非常快。

​		2）当没有定义主键时，InnoDB 会创建唯一性的隐含主键：rawId（定义主键后不会存在）。

`[理论]`  辅助索引，也称为`二级索引`。

​	一般会建立多个索引，这些索引被称为辅助索引或二级索引，但只有一个 B+ 树，`叶子节点只存放该字段 和 主键列`。

​		1）二级索引列本身是按照 B+ 树的原则排好序的，但这个主键列不会排好序。

​		2）当我们需要根据该索引字段查询记录时，但是节点中只存放了`该字段 和 主键`，并没有存放完整信息，此时便需要通过里面存放的`主键利用主键索引再寻找完整的数据记录`，这个过程称作 `回表`。（通过二级索引查找到完整的一条记录需要用到两个 B+ 树）

​		3）回表的机制意味着回表的记录越少，则查询的性能越高，如果回表次数过高，`查询优化器`就可能会直接使用全文扫描（有一定的机制进行选择）。

> 回表设计原因：如果和 MyISAM 一样在主键索引和辅助索引的叶子节点中都存放数据行指针，一旦数据发生迁移，则需要去重新组织维护所有的索引。

`[理论]`  联合索引，也称为`复合索引`。

​	复合索引是将多个字段列组合起来组成索引，那么此时叶子节点中存放的就是`对应的几个索引列和主键列`。联合索引多个字段也只会建立一个 B+ 树，会`根据定义时的字段的前后顺序来进行多步排序`，最终结果才是叶子节点的顺序。

`[理论]`  覆盖索引，也称为`索引覆盖`，是一种`行为`，并不是一种 InnoDB 索引。覆盖索引的机制指的是从复合索引中就可以得到查询的记录（意思就是需要`查询的列都是索引列`时，就不需要利用主键列进行回表），而不需要查询聚集索引中的记录。同时由于辅助索引包含字段少，可以增多同一页的节点数，减少 IO 操作。

`[理论]`  自适应哈希索引。

​	InnoDB 存储引擎内部会不停的监控`索引热数据`（热点索引），然后内部创建一个 hash 索引，称之为`自适应哈希索引`( Adaptive Hash Index，AHI)，其主要的控制参数有 innodb_adaptive_hash_index 和 innodb_adaptive_hash_index_parts（调整分区个数），基本不能人为干涉此索引，默认处于开启状态。

```sql
# 查看当前 InnoDB 的索引情况，可以查看到内部的 hash table 索引情况
show engine innodb status \G;
```

`[理论]`  新版本的 InnoDB 引擎也提供全文检索的索引，只有字段的数据类型为 `char、varchar、text 及其系列`才可以建全文索引。

​		例如现在需要保存唐宋诗词，如果需要根据标题、作者等等查找诗词很好解决，但是如果需要查找诗词中包含某个字的诗，那么就复杂了，使用全文检索的方式就没有优化的可能性了。那么就考虑可以使用`全文索引的倒排索引 Inverted index` 来解决这个问题。

​		存入数据时就做好`分词`，将`关键词`提取出来，记录每个关键字在每首诗词里面的存在与否的对应关系表。InnoDB 的全文检索的倒排索引使用的并不好，甚至连中文的分词器都没有。

> MySQL 5.6 以前的版本，只有 MyISAM 存储引擎支持全文索引，InnoDB 存储引擎是在之后的版本才支持全文索引。

## 索引的使用

`[问题]` 索引在查询中的作用，以创建表 order_exp 同时添加一个主键索引和两个普通的二级索引和一个联合索引为例说明。

```sql
# 表 order_exp 
PRIMARY KEY (`id`) USING BTREE ,
UNIQUE INDEX `u_ idx_ day_ status` ( `insert_ time`,`order_ status`, `expire_ time` )
INDEX `idx_ order_ no` (`order_ no`) USING BTREE,
INDEX `idx_ expire_ time`(`expire_ time`) USING BTREE
```

1、一个索引就是一个 B+ 树，索引能让查询可以`快速定位和扫描`到我们需要的数据记录上，加快查询的速度。

2、一个 select 查询语句在执行过程中`一般`最多只能使用一个二级索引（辅助索引），即使在 where 条件中用了多个二级索引。

​		如果执行 `SELECT * FROM order_no = 'sss' and expire_time = 'xxxx';` ，此时就会有两个 B+ 树可供选择，但只会选择一个 B+ 树进行检索，而具体的选择是 MySQL 根据优化器来进行计算选择。

`[理论]`  扫描区间的概念。（查询优化器时使用到了 扫描区间 的概念）

​		对于一个查询，最简单粗暴的方式是全面扫描，从头扫描到尾，使用 B+ 树就是为了避免全文扫描，而实际上就是使某个查询能够只在某个区间进行扫描。例如对于查询 `SELECT * FROM order_exp WHERE id >= 3 AND id<= 99;`，如果没有这个 where 条件，MySQL 就只能一条条记录扫描，但是当有了 where 限制条件后，就能通过主键索引从 id = 3 出开始扫描，直到扫描到 id > 99 时（叶子节点都是顺序的），就表示扫描完了，此种方式就是将扫描区间缩小到了 [3, 99]。

​		再通过查询 `SELECT * FROM order_exp WHERE id in(3,9) OR (id>=23 AND id<= 99);`，其扫描区间就有三个 [3, 3]，[9, 9]，[23, 99]，前两者被称为单点扫描区间，后面一个是范围扫描区间。`in` 里面的每个数据都会被视作一个单点扫描区间。再执行查询 `SELECT * FROM order_exp WHERE order_no <'DD00_10S' AND expire _time > '2021-03-22 18:28:28' AND order_note > '7排';` 语句时，因为一个查询中最多只能使用一个二级索引检索，此时 MySQL 就只会选择 order_no 或 expire _time 来作为扫描索引，因此只有一个扫描区间。

`[理论]`  范围区间扫描的概念：对于 B+树索引来说，只要索引列和常数使用 =、<=>、IN、NOT IN、IS NULL、IS NOT NULL、>、<、>=、<=、BETWEEN、!=<> 或 LIKE 等操作符连接起来，就可以产生一个扫描区间。in 操作符产生的是单点扫描区间，!= 产生的扫描区间几近全局区间，like 关键字只有在匹配完整的字符串或者匹配字符串前缀时才产生合适的扫描区间（字符串按照字典排序）。

​		MySQL 优化器会根据几个索引的范围区间进行成本计算，来选择最高效的检索索引，也就是说有些条件并不一定会用上。

`[问题]`  日常的工作中，一个查询的 WHERE 子句可能有很多个小的搜索条件，这些搜索条件需要使用 AND 或者 OR 操作符连接起来，那么怎么从由 AND或 OR 组成的`复杂搜索条件中提取出正确的范围区间`，判断能不能使用索引呢？

1）针对执行 `SELECT * FROM order_exp WHERE order_no > 'DD00_6S' AND order_no > 'DD00_9S';` 语句，这个搜索条件是能够使用索引的。

2）针对执行 `SELECT * FROM order_exp WHERE order_no > 'DD00_6S' or order_no > 'DD00_9S';` 语句，这个搜索条件也是能够使用索引的。

3）针对执行 `SELECT * FROM order_exp WHERE expire_time> '2021-03-22 18:35:09' AND order_note = 'abc';` 语句，这个搜索条件的扫描范围是由 expire_time 决定的，因为 order_note 并没有建立索引。

4）针对执行 `SELECT * FROM order_exp WHERE expire_time> '2021-03-22 18:35:09' OR order_note = 'abc';` 语句，使用 OR 来连接，但因为 order_note 不是索引，因此这个 expire_time 索引实际上是用不上的，还是必须全局扫描。（索引失效）

`[案例]`  针对下面的复杂的搜索条件，怎么判断扫描范围呢？

```sql
SELECT * FROM order_exp WHERE (order_no > 'DD00_9S' AND expire_time = '2021-03-22 18:35:09' ) OR (order_no < 'DD00_6S' AND order_no > 'DD00_10S') OR (order_no LIKE '%0S' AND order_no > 'DD00_12S' AND (expire_time < '2021-03-22 18:28:28' OR order_note = 'abc')) ;
```

​		where 条件中涉及 order_no 和 expire_time 有索引，order_note 是没有索引的。

1）假设使用 order_no 作为索引检索，可以将其他的搜索条件都变成 true 考虑：(`like % 在前面则不能用作索引`)

```sql
SELECT * FROM order_exp WHERE (order_no > 'DD00_9S' AND true) OR (order_no < 'DD00_6S' AND order_no > 'DD00_10S') OR (true AND order_no > 'DD00_12S' AND (true OR true)) ;
# 根据 and 和 or 的计算规则进而化简为
SELECT * FROM order_exp WHERE order_no > 'DD00_9S'  OR (order_no < 'DD00_6S' AND order_no > 'DD00_10S') OR order_no > 'DD00_12S' ;
# 有的条件恒为 true 或 false 时也能化简
SELECT * FROM order_exp WHERE order_no > 'DD00_9S' or false OR order_no > 'DD00_12S' ;
# 再根据 or 的计算规则化简
SELECT * FROM order_exp WHERE order_no > 'DD00_9S' OR order_no > 'DD00_12S' ;
```

​		因此此时的查询区间就是 [DD00_12S，+∞ ]，但是 MySQL 的优化器还是会重新评估的。

1）假设使用 expire_time 作为索引检索，可以将其他的搜索条件都变成 true 考虑：

```sql
SELECT * FROM order_exp WHERE (true AND expire_time = '2021-03-22 18:35:09' ) OR (true AND true) OR (true AND true AND (expire_time < '2021-03-22 18:28:28' OR true)) ;
#  根据 and 和 or 的计算规则进而化简为
SELECT * FROM order_exp WHERE expire_time = '2021-03-22 18:35:09' OR true;
```

​		因此此时如果使用索引，查询区间就是单点区间，同时由于后面条件恒成立，那么还需要根据找到的记录再回表查询所有信息，还不如直接使用全表扫描，因此 MySQL 是不可能使用 expire_time 作为索引进行扫描的。

上面这个 SQL 语句，执行全表扫描的代价大概是 2169，用 order_no 索引的代价大概是 6211，所以实际执行的时候，MySQL 会选择全表扫描。（`成本分析`）

`[理论]`  联合索引执行查询时对应的扫描区间分析。

​		例如上面定义的 `u_ idx_ day_ status` 这个联合主键，MySQL 会先根据 insert_time 排序，再将排序结果相等时按照 order_status 排序，再如果还是相等则按照 expire_time 进行排序，才得到最终的 B+ 树的叶子节点的排序顺序。

1）会定位满足这个条件的第一条记录，向后扫描找到扫描区间，找到所有的记录再进行回表。

```sql
SELECT * FROM order_exp WHERE insert_time = '2021-03-22 18:34:55';
```

2）先根据 insert_time 确定扫描区间，再在扫描区间内找到 order_status 的扫描区间，找到所有的记录再进行回表。

```sql
SELECT * FROM order_exp WHERE insert_time = '2021-03-22 18:34:55' AND order_status = 0;
```

3）先找到第一条满足这个条件的，再往前扫描找到扫描区间，找到所有的记录再进行回表。

```sql
SELECT * FROM order_exp WHERE insert_time < '2021-03-22 18:34:55';
```

4）此种情况是不能得到扫描区间的，因为会现根据 insert_time 排序，order_status 的排列不一定有序，因此并不能作为扫描区间的确定条件。

```sql
SELECT * FROM order_exp  WHERE order_status = 1;
```

5）可以作为扫描区间查找，但是 expire_time 条件在扫描区间的确定上是用不上的，因为并不一定有序。

```sql
SELECT * FROM order_exp WHERE insert_time = '2021-03-22 18:34:55' AND expire_time = '2021-03-22 18:35:12';
```

6）可以作为扫描区间查找，但是 order_status 条件在扫描区间的确定上是用不上的，因为并不一定有序。

```sql
SELECT * FROM order_exp WHERE insert_time < '2021-03-22 18:34:57' AND order_status = 1;
```

## MyISAM索引

`[理论]`  MyISAM 索引底层也是 B+ 树实现，但索引和数据是分开放的，数据记录没有分页，就是顺序放下来（也就是直接统一往数据文件塞）。索引信息则单独放在 `myisam.MYI` 文件，存储时不仅`存储索引值`，还会存在这条记录在文件里面的`行号`，因此使用 MyISAM 存储引擎进行查找时是通过索引找到这条记录在数据文件中的行号，再对应找到数据记录。也就是说 MyISAM 引擎中，只要是索引则`全部都是相当于二级索引`，只要是查询则全部都是需要回表。

## 索引创建策略

1）查看索引。

```sql
SHOW INDEX FROM 表名 \G;
```

2）创建修改索引。

```sql
CREATE TALBE 表名 (
	各种列的信息 ··· ,
	[KEY|INDEX] 索引名 (需要被索引的单个列或多个列)

)
# 已经创建表后添加索引
CREATE [UNIQUE | FULLTEXT | SPATIAL] INDEX 索引名 ON 表名(columnname(length));
ALTER TABLE 表名 ADD [UNIQUE | FULLTEXT | SPATIAL] INDEX [indexName] ON (字段名[(长度)]
```

3）删除索引。

```sql
# 删除索引
DROP INDEX 索引名 ON 表名;
# 删除主键索引
ALTER TABLE 表名 DROP PRIMARY KEY;
```

`[理论]`  索引有一定的好处，但同时也有一定的`代价`（空间和时间代价）。

1）空间代价：每一个索引都会创建一个 B+ 树，每个节点都是一个数据页（16K）。

2）时间代价：增删改查时 B+ 树中的数据很可能需要调整。

`[总结]`  高性能索引创建的策略。

```sql
# EXPLAIN : 分析SQL语句执行性能和状况
EXPLAIN SELECT * FROM student；	# 非全文索引
EXPLAIN SELECT * FROM student WHERE studentno='1000';

# 使用全文索引
# 全文搜索通过 MATCH() 函数完成。
# 搜索字符串作为 against() 的参数被给定。搜索以忽略字母大小写的方式执行。对于表中的每个记录行，MATCH() 返回一个相关性值。即，在搜索字符串与记录行在 MATCH() 列表中指定的列的文本之间的相似性尺度。
EXPLAIN SELECT *FROM student WHERE MATCH(studentname) AGAINST('love');
```

1）数据类型越小，在查询时进行的比较操作越快，同时占用空间代价越小，一个数据页放下的记录越多，从而减少磁盘 I/O 带来的性能损耗，也就意味着可以把更多的数据页缓存在内存中，从而加快读写效率。

2）需要根据索引的 `“选择性/离散型”` 来选择索引。例如某表四个字段为姓名、年龄、性别、区号，则就应该选择姓名来作为索引，性别就是最差的。

> 选择性（离散型）：不重复的记录条数和总记录条数的比值，最好的就是 1，表示完全无重复。（因为离散型高的说明扫描区间小）

​		要计算某数据列的离散性就可以使用 distinct 关键字：

```sql
select count(distinct order_no)/count(*) as cnt from order_exp;
```

3）有时候会使用字符串来做索引，但可能这个字符串很长，那么就可以使用 `模拟哈希索引` 或者 `前缀索引`。

> ​	`模拟哈希索引`：就是将该很长的字段算出一个 hash 值，存入另一个字段列中，马么就使用这个新的字段作为索引。但是这种方法需要重新维护一列字段，同时可能还会发生哈希冲突的问题，同时也很难支持范围查找。

​		`前缀索引`也就是只索引该字段的开始部分字符，可以大大节约索引空间，从而提高索引效率，但也会降低索引的离散性。那么如何选择索引的长度呢？

​	可以使用 sql 语句确定该字段使用不同长度值作为索引的离散型，从而判断：

```sql
SELECT COUNT(DISTINCT LEFT(order_note,3))/COUNT(*) AS sel3 from order_exp;	# 查询三个字符的离散型
SELECT COUNT(DISTINCT LEFT(order_note,4))/COUNT(*) AS sel4 from order_exp;	# 查询四个字符的离散型
```

​	经过判断，例如14个字符的离散性比较好，同时又比较短，因此选择此字段的 14 个字符长度作为索引：

```sql
alter table order_exp add key(order_note(14));
```

​	例如使用当表中有邮箱字段时，需要查询所有 '@qq.com' 的为后缀的邮箱，如果直接使用 `like '%@qq.com'` 那么便不会使用索引查询，因此可以考虑使用反向的查询，但是 MySQL 并不支持反向查询，因此可以在业务处理逻辑中反向，或者在数据库中反转再存储，再建立`前缀索引`进行查询。

4）只为分组、排序或分组的列创建索引：只为出现在 where 子句中的列、连接子句中的连接列创建索引，而出现在查询结果列表中的列一般就没必要建立索引，除非是需要使用覆盖索引，又或者为出现在 ORDER BY 或 GROUP BY 子句中的列创建索引，但是需要注意顺序。

​		例如 `SELECT * FROM order_exp ORDER BY insert_time, order_status,expire_time;`  结果检索出来就直接是排好序的，就不需要额外的排序。group by 也是类似的情况，都是直接查询出来就是顺序的或是分好组的。

5）多列索引（联合索引）如何选择合适的索引创建顺序呢？

​		一般将`选择性最高的列`放到索引最前列（也需要注意业务的使用），同时需要根据那些运行频率最高的查询来调整索引列的顺序（再创建一个新的联合索引），因此在优化性能的时候可能需要使用相同的列但顺序不同的索引来满足不同类型的查询需求。

6）设计针对`查询的三星索引`，表示一个索引设计的好坏可以由三颗星来评价，实践中主要是满足两颗星即可。（针对查询）

​	一星：索引将相关的记录放到一起。（物理上的记录相邻则扫描的范围小，就可以利用顺序读的特点提高查询效率）

​	二星（排序星）：索引中的数据顺序和查找中的排列顺序一致。（也就是充分利用索引判断是否是顺序匹配）

​	三星（宽索引星）：索引中的列包含了查询中需要的全部列，这是最重要的，因为回表会导致`过多的随机读`。（就是索引覆盖：不需要回表）

`[案例]` 创建 customer 表，针对具体的查询语句，判断当前创建的索引是否达到三星索引标准。

```sql
create table customer(
    cno int,
    lname varchar(10),
    fname varchar(10),
    sex int,
    weight int,
    city varchar(10)
);
create index idx_cust on customer(city,lname,fname,cno); # 联合索引
```

​	对于查询语句 `select cno,fname from customer where lname =’xx’ and city =’yy’ order by fname;` 而言，现在创建的索引就是三星索引。因为前面两个 = 条件可以将搜索范围缩的很窄（一星），同时由于前面条件成立时， fname 排列就是有序的（二星），cno 和 fname 都在索引中（三星）。

`[案例]` 创建 test 表，针对具体的查询语句，判断当前创建的索引是否达到三星索引标准。

```sql
CREATE TABLE `test` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `user_name` varchar(100) DEFAULT NULL,
      `sex` int(11) DEFAULT NULL,
      `age` int(11) DEFAULT NULL,
      `c_date` datetime DEFAULT NULL,
      PRIMARY KEY (`id`),
  ) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
  
  # sql 语句：select user_name,sex,age from test where user_name like 'test%' and sex =1 ORDER BY age
```

​		如果创建索引为（user_name，sex，age）不满足二星，因为无法保证 user_name 范围匹配的结果下 age 是一定有序的。

​		如果创建索引为（sex，user_name，age）不满足一星，因为 sex 的选择性过差。

7）`设立主键`时应该使用很少改变的列，少 update 操作，行是按照聚集索引物理排序的，如果主键频繁改变，物理顺序会改变，性能会急剧降低。

8）不要产生冗余和重复的索引。

```sql
# 创建了三个索引都是 ID，重复索引
CREATE TABLE test (
    ID INT NOT NULL PRIMARY KEY,
    A INT NOT NULL,
    B INT NOT NULL,
    UNIQUE(ID),
    INDEX(ID)
) ENGINE=InnoDB;

# 如果创建索引 index(A, B) 和 index(A) 呢？	还是重复索引，因为index(A,B)已经将 A 顺序排列了一次，index(A)又来顺序排列了一次
# 如果创建索引 index(B, A) 和 index(A) 呢？	那么就不是重复索引
# 如果创建索引 index(A) 和 index(A，ID) 呢？	重复索引，因为二级索引本身就存储了索引列和主键列，index(A) 本身就包含了 ID 列
```

9）不要创建未使用的索引（可以统计索引的使用频率）。

# 权限管理和备份

## 用户权限管理

​		用户信息表：mysql.user，实际就是操作这个表。

```sql
# 刷新权限
FLUSH PRIVILEGES

# 增加用户并设置密码
# 语法：CREATE USER 用户名 IDENTIFIED BY [PASSWORD] 密码(字符串)
CREATE USER gaozheng IDENTIFIED BY '123456'
# 注意事项：
# 必须拥有mysql数据库的全局CREATE USER权限，或拥有INSERT权限。
# 只能创建用户，不能赋予权限。
# 用户名，注意引号：如 'user_name'@'192.168.1.1'
# 密码也需引号，纯数字密码也要加引号
# 要在纯文本中指定密码，需忽略PASSWORD关键词。要把密码指定为由 PASSWORD() 函数返回的混编值，需包含关键字PASSWORD

# 重命名用户 
# 语法：RENAME USER old_user TO new_user
RENAME USER gaozheng TO gaozheng2

# 设置（修改）密码
SET PASSWORD = PASSWORD('密码')    # 为当前用户设置密码
SET PASSWORD FOR 用户名 = PASSWORD('密码')   # 为指定用户设置密码

# 删除用户 
# 语法：DROP USER 用户名
DROP USER gaozheng2

# 分配权限/添加用户
# 语法：GRANT 权限列表 ON 表名 TO 用户名 [IDENTIFIED BY [PASSWORD] 'password']
# all privileges 表示所有权限，除了给别的用户授权
# *.* 表示所有库的所有表，库名.表名 表示某库下面的某表
grant all privileges on *.* to gaozheng
# 注意：这个用户拥有所有的权限，但是不能给别的用户授权。

# 查看权限  
# 语法：SHOW GRANTS FOR 用户名
# 查看 root 权限
SHOW GRANTS FOR root@localhost;
# 查看指定用户权限
SHOW GRANTS FOR gaozheng

# 撤消权限
# 语法：REVOKE 权限列表 ON 表名 FROM 用户名
REVOKE ALL PRIVILEGES on *.* FROM 用户名    # 撤销所有权限
```

权限解释：了解即可

```sql
-- 权限列表
ALL [PRIVILEGES]    -- 设置除GRANT OPTION之外的所有简单权限
ALTER    -- 允许使用ALTER TABLE
ALTER ROUTINE    -- 更改或取消已存储的子程序
CREATE    -- 允许使用CREATE TABLE
CREATE ROUTINE    -- 创建已存储的子程序
CREATE TEMPORARY TABLES        -- 允许使用CREATE TEMPORARY TABLE
CREATE USER        -- 允许使用CREATE USER, DROP USER, RENAME USER和REVOKE ALL PRIVILEGES。
CREATE VIEW        -- 允许使用CREATE VIEW
DELETE    -- 允许使用DELETE
DROP    -- 允许使用DROP TABLE
EXECUTE        -- 允许用户运行已存储的子程序
FILE    -- 允许使用SELECT...INTO OUTFILE和LOAD DATA INFILE
INDEX     -- 允许使用CREATE INDEX和DROP INDEX
INSERT    -- 允许使用INSERT
LOCK TABLES        -- 允许对您拥有SELECT权限的表使用LOCK TABLES
PROCESS     -- 允许使用SHOW FULL PROCESSLIST
REFERENCES    -- 未被实施
RELOAD    -- 允许使用FLUSH
REPLICATION CLIENT    -- 允许用户询问从属服务器或主服务器的地址
REPLICATION SLAVE    -- 用于复制型从属服务器（从主服务器中读取二进制日志事件）
SELECT    -- 允许使用SELECT
SHOW DATABASES    -- 显示所有数据库
SHOW VIEW    -- 允许使用SHOW CREATE VIEW
SHUTDOWN    -- 允许使用mysqladmin shutdown
SUPER    -- 允许使用CHANGE MASTER, KILL, PURGE MASTER LOGS和SET GLOBAL语句，mysqladmin debug命令；允许您连接（一次），即使已达到max_connections。
UPDATE    -- 允许使用UPDATE
USAGE    -- “无权限”的同义词
GRANT OPTION    -- 允许授予权限


/* 表维护 */

-- 分析和存储表的关键字分布
ANALYZE [LOCAL | NO_WRITE_TO_BINLOG] TABLE 表名 ...
-- 检查一个或多个表是否有错误
CHECK TABLE tbl_name [, tbl_name] ... [option] ...
option = {QUICK | FAST | MEDIUM | EXTENDED | CHANGED}
-- 整理数据文件的碎片
OPTIMIZE [LOCAL | NO_WRITE_TO_BINLOG] TABLE tbl_name [, tbl_name] ...
```

## MySQL备份

数据库备份必要性：保证重要数据不丢失，同时进行数据转移，一般用于`容灾`。

MySQL数据库备份方法

1）直接拷贝物理文件：data 文件。

2）数据库可视化工具中手动导出：在想要导出的表或者库中右键，选择备份或者导出。

3）使用命令行导出：mysqldump，可以将将数据转移到另一个SQL服务器，不一定是MySQL服务器。

```bash
# 导出一张表
# mysqldump -h主机 -u用户名 -p密码 数据库 表名 >物理磁盘位置/文件名
mysqldump -hlocalhost -uroot -p123456 school student >D:/a.sql
# 导出多张表
# mysqldump -h主机 -u用户名 -p密码 数据库 表1 表2 表3 >物理磁盘位置/文件名
mysqldump -hlocalhost -uroot -p123456 school student grand >D:/a.sql
# 导出一个库
# mysqldump -h主机 -u用户名 -p密码 数据库>物理磁盘位置/文件名
mysqldump -hlocalhost -uroot -p123456 school>D:/a.sql

# 导入过程：
# 登陆的情况下，切换到指定的数据库(尽量登录)
# sources 备份文件
source D:/a.sql

# 在不登录的情况下
# mysql -u用户名 -p密码 库名 < 备份文件
```
