---
title: ShardingSphere 基本了解
date: 2022-03-29 00:00:00
type:
comments:
tags: 
  - 数据库
  - ShardingSphere
  - 分库分表
categories: 
  - 工具插件
description: 
keywords: ShardingSphere
cover: https://w.wallhaven.cc/full/p9/wallhaven-p938pp.jpg
top_img: https://w.wallhaven.cc/full/p9/wallhaven-p938pp.jpg
---

# ShardingSphere 概述

![在这里插入图片描述](https://img-blog.csdnimg.cn/bae89534e0fe447c9bf4e6817dd54edc.png)

​		`ShardingSphere` 是一套开源的分布式数据库解决方案，由 `JDBC`、`Proxy`、`Sidecar`(规划中) 组成，这三款能独立部署，也能够配合使用。

> 是一个分布式关系型数据库的中间件(`轻量级 Java 框架` Jar 包形式)，用于再分布式环境下操作数据库。

## Sharding-JDBC

​		`Shardingphere-JDBC`是在Java 的 JDBC 层`以 Jar 包的形式`提供额外服务，无需额外部署和依赖 =======> `增强版的 JDBC 驱动`

![在这里插入图片描述](https://img-blog.csdnimg.cn/786294eadc8d48d4ba3be6eb176d3570.png)

​		从上图可知，Sharding-JDBC 应用是以 jar 包形式存在于 Java 应用之内，是位于数据库和业务代码之间，很好的诠释了其作为增强的 JDBC 的能力。

## Sharding-Proxy

​		`ShardingSphere-Proxy` 是数据库代理端，相当于是一个集中的服务，用于对之前 JDBC架构的形式进行解耦，可直接当作 MySQL 使用。

![在这里插入图片描述](https://img-blog.csdnimg.cn/ef53f10d35024d5a84338bd5372e2591.png)

## Sharding-Sidecar

`ShardingSidecar` 是针对 service mesh(服务网格) 定位的一个分库分表插件，目前在规划中，定位为 K8S 的云原生数据库代理。`数据库网络 Database Mesh`

## JDBC 和 Proxy 对比

​		经过了解，Sharding JDBC 和 Proxy 进行对比：

![在这里插入图片描述](https://img-blog.csdnimg.cn/42747a7fde6446a8983711f2293bc836.png)

​		ShardingJDBC 只是客户端的一个工具包，可以理解为一个特殊的JDBC驱动包，所有分库分表逻辑均由业务方自己控制，所以他的功能相对灵活，支持的数据库也非常多，但是对业务侵入大，需要业务方自己定制所有的分库分表逻辑。而 ShardingProxy 是一个独立部署的服务，对业务方无侵入，业务方可以像用一个普通的 MySQL 服务一样进行数据交互，基本上感觉不到后端分库分表逻辑的存在，但是这也意味着功能会比较固定，能够支持的数据库也比较少。

​		而 `ShardingJDBC` 就是企业中使用比较多的。

# Sharding 快速开始

## 准备工作

​		实践采用 `docker` 的方式进行测试。

1、使用 docker 部署第一台 MySQL 服务器。

​	1）在 `/usr/local/docker` 开始准备：

```shell
# 创建文件夹 mysql
mkdir mysql
# 进入 mysql 文件夹
cd mysql
# 编写 docker-compose.yml
vim docker-compose.yml
```

​		docker-compose.yml 文件：（注意复制时保持 yml 文本的层级关系）

```yml
version: '3.1'
services:
  mysql-0:
    image: mysql
    container_name: mysql-0
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

​	2）后台启动上面编写的 mysql-0 服务：

```shell
docker-compose up -d
```

​	3）使用 Navicat 连接远端服务器的 4306 端口的 MySQL 数据库测试：（阿里云服务器注意安全组和防火墙`开启 4306 端口`），结果连接成功。

2、创建物理数据库和数据表，用于测试：

​	1）创建数据库 `db_device_0`。

​	2）创建数据表：逻辑上 tb_device 表示的是描述设备信息的表，为了体现分表的概念，把 tb_device 表分成了两张表。于是 `tb_device 就是逻辑表`，⽽`tb_device_0 和 tb_device_1 就是该逻辑表的物理表`。（alibaba 开发手册规定数据超过 500 万条需要进行分表）

```sql
# 创建 tb_device_0 表
CREATE TABLE `tb_device_0` (
 `device_id` bigint NOT NULL AUTO_INCREMENT,
 `device_type` int DEFAULT NULL,
 PRIMARY KEY (`device_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3;

# 创建 tb_device_1 表
CREATE TABLE `tb_device_1` (
 `device_id` bigint NOT NULL AUTO_INCREMENT,
 `device_type` int DEFAULT NULL,
 PRIMARY KEY (`device_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb3;
```

> 注意：物理表名称很相似， tb_device_number，后面的数字用于区分，可以猜想这是由于数据量过大`分表`的实现，那么如何实现呢？

## 测试分表

1、新建 SpringBoot `2.7.0` 版本工程，添加项目依赖：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.0</version>
        <relativePath/>
    </parent>
    <groupId>com.example</groupId>
    <artifactId>sharding-jdbc</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>sharding-jdbc</name>
    <description>Demo project for Spring Boot</description>
    <properties>
        <java.version>1.8</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- 新增的依赖 -->
        <!-- lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>
        <!-- 数据库连接池选择 alibaba 的 druid -->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid</artifactId>
            <version>1.1.21</version>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>
        <!-- 使用 mybatis-plus 映射 -->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
            <version>3.5.2</version>
        </dependency>
        <!-- 核心依赖：sharding-jdbc 依赖 -->
        <dependency>
            <groupId>org.apache.shardingsphere</groupId>
            <artifactId>sharding-jdbc-spring-boot-starter</artifactId>
            <version>4.1.1</version>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

2、编写配置文件，添加物理表和分表策略。（注意不要在配置后面加注释，可能会被不正确的解析）

```properties
# 配置真实数据源,这里制定数据源为 ds1，在下面对 ds1 做具体的配置
spring.shardingsphere.datasource.names=ds1

# 配置第 1 个数据源：ds1
# 配置为 druid 数据源
spring.shardingsphere.datasource.ds1.type=com.alibaba.druid.pool.DruidDataSource
spring.shardingsphere.datasource.ds1.driver-classname=com.mysql.cj.jdbc.Driver
spring.shardingsphere.datasource.ds1.url=jdbc:mysql://8.142.92.222:4306/db_device_0?serverTimezone=Asia/Shanghai
spring.shardingsphere.datasource.ds1.username=root
spring.shardingsphere.datasource.ds1.password=123456

# 配置物理表，tb_device 就是逻辑表 ===> 对应的物理表是 ds1.tb_device_$->{0..1}（使用 groovy 脚本语法）
spring.shardingsphere.sharding.tables.tb_device.actual-data-nodes=ds1.tb_device_$->{0..1}

# 配置分表策略：根据 device_id 作为分⽚的依据（分⽚键），例如根据 device_id 进行取模，决定数据存储到哪张表
# 分片键
spring.shardingsphere.sharding.tables.tb_device.table-strategy.inline.sharding-column=device_id
# 算法表达式：策略
spring.shardingsphere.sharding.tables.tb_device.table-strategy.inline.algorithm-expression=tb_device_$->{device_id%2}   

# 开启 SQL 显示
spring.shardingsphere.props.sql.show = true
```

3、编写实体类：TbDevice（mp 有一定的数据库映射规则，目前必须设置成此名称）

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TbDevice {
    private Long deviceId;
    private int deviceType;
}
```

4、新建 DeviceMapper 接口。（使用 mybatis-plus）

```java
@Mapper
public interface DeviceMapper extends BaseMapper<Device> {

}
```

5、主启动类添加 `@MapperScan` 注解。

6、测试使用：

```java
@SpringBootTest
class ShardingJdbcApplicationTests {

    @Autowired
    private DeviceMapper deviceMapper;

    @Test
    void testInitData() {
        System.out.println("测试插入数据 ================== ");
        for (int i = 1; i <= 10; i++) {
            TbDevice tbDevice = new TbDevice();
            tbDevice.setDeviceId((long) i);
            tbDevice.setDeviceType(i);
            deviceMapper.insert(tbDevice);
        }
    }
}
```

​		测试发现控制台打印：

```cmd
测试插入数据 ================== 
2022-06-13 13:26:16.402  INFO 1888 --- [           main] ShardingSphere-SQL                       : Logic SQL: INSERT INTO tb_device  ( device_id,
device_type )  VALUES  ( ?,
? )
2022-06-13 13:26:16.402  INFO 1888 --- [           main] ShardingSphere-SQL                       : SQLStatement: InsertStatementContext(super=CommonSQLStatementContext(sqlStatement=org.apache.shardingsphere.sql.parser.sql.statement.dml.InsertStatement@628ba266, tablesContext=org.apache.shardingsphere.sql.parser.binder.segment.table.TablesContext@1231a1be), tablesContext=org.apache.shardingsphere.sql.parser.binder.segment.table.TablesContext@1231a1be, columnNames=[device_id, device_type], insertValueContexts=[InsertValueContext(parametersCount=2, valueExpressions=[ParameterMarkerExpressionSegment(startIndex=61, stopIndex=61, parameterMarkerIndex=0), ParameterMarkerExpressionSegment(startIndex=64, stopIndex=64, parameterMarkerIndex=1)], parameters=[1, 1])], generatedKeyContext=Optional.empty)
2022-06-13 13:26:16.403  INFO 1888 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds1 ::: INSERT INTO tb_device_1  ( device_id,
device_type )  VALUES  (?, ?) ::: [1, 1]
............
```

​		逻辑 SQL 表示插入数据表 tb_device，但并没有这个表，而实际 SQL 表示插入数据表 tb_device_1/0 两个表。

检查 Navicat ，发现呈现分表结果：奇数位于 device_1 表，偶数位于 device_0 表，实现了初步分表操作。

![](https://pic1.imgdb.cn/item/6336ed3f16f2c2beb1bf0733.png)

## 测试分库

1、再使用另一台服务器：39.103.191.179，搭建 mysql-1 服务器。

​	1）编写 docker-compose.yml 文件：

```yml
version: '3.1'
services:
  mysql-1:
    image: mysql
    container_name: mysql-1
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

​	2）使用 Navicat 连接 mysql-1，创建数据库 `db_device_1`，同样再创建相同的 tb_device_0 和 tb_device_1 两张物理表。

此时两个数据库的结构就是：

```shell
- db_device	# 逻辑库
	- db_device_0	# 物理库 0
		- db_device	# 逻辑表
            - db_device_0	# 物理表 0
            - db_device_1	# 物理表 1
	- db_device_1	# 物理库 1
		- db_device	# 逻辑表
            - db_device_0	# 物理表 0
            - db_device_1	# 物理表 1
```

2、修改 SpringBoot 配置文件，配置数据源：

```properties
# 配置真实数据源,这里制定数据源为 ds1，在下面对 ds1 做具体的配置
spring.shardingsphere.datasource.names=ds0,ds1

# 配置第 1 个数据源：ds0 ===> db_device_0
spring.shardingsphere.datasource.ds0.type=com.alibaba.druid.pool.DruidDataSource
spring.shardingsphere.datasource.ds0.driver-classname=com.mysql.cj.jdbc.Driver
spring.shardingsphere.datasource.ds0.url=jdbc:mysql://8.142.92.222:4306/db_device_0?serverTimezone=Asia/Shanghai
spring.shardingsphere.datasource.ds0.username=root
spring.shardingsphere.datasource.ds0.password=123456

# 配置第 2 个数据源：ds1 ===> db_device_1
spring.shardingsphere.datasource.ds1.type=com.alibaba.druid.pool.DruidDataSource
spring.shardingsphere.datasource.ds1.driver-classname=com.mysql.cj.jdbc.Driver
spring.shardingsphere.datasource.ds1.url=jdbc:mysql://39.103.191.179:4306/db_device_1?serverTimezone=Asia/Shanghai
spring.shardingsphere.datasource.ds1.username=root
spring.shardingsphere.datasource.ds1.password=123456

# 现在两个数据库的物理表总共就应该有四个,因此需要将库名也做 groovy 语法配置
spring.shardingsphere.sharding.tables.tb_device.actual-data-nodes=ds$->{0..1}.tb_device_$->{0..1}

# 之前是只有一个数据库，但是现在有两个库，插入数据就必须先知道要去到哪个数据库 ====> 配置数据库的分片策略
# 配置数据库的分片策略    1)分片键   2）分片算法策略
spring.shardingsphere.sharding.default-database-strategy.inline.sharding-column=device_id
spring.shardingsphere.sharding.default-database-strategy.inline.algorithm-expression=ds$->{device_id%2}

# 配置数据表的分片策略    1)分片键   2）分片算法策略
spring.shardingsphere.sharding.tables.tb_device.table-strategy.inline.sharding-column=device_id
spring.shardingsphere.sharding.tables.tb_device.table-strategy.inline.algorithm-expression=tb_device_$->{device_id%2}

# 开启 SQL 显示
spring.shardingsphere.props.sql.show=true
```

​	上面的配置文件主要包括：

​	1）配置数据源的连接信息和选型：ds0 和 ds1

​	2）配置可选的数据表节点：使用 groovy 表达式设置四个节点 2* 2

​	3）由于数据库也有两个，因此首先需要`设置数据库的分片策略`。

​	4）数据库选定后，在具体的数据库中还需要选择具体数据表，因此首先需要`设置数据表的分片策略`。

3、清空之前的数据表，重新测试插入数据。

```java
@SpringBootTest
class ShardingJdbcApplicationTests {

    @Autowired
    private DeviceMapper deviceMapper;

    @Test
    void testInitData() {
        System.out.println("测试插入数据 ================== ");
        for (int i = 1; i <= 20; i++) {
            TbDevice tbDevice = new TbDevice();
            tbDevice.setDeviceId((long) i);
            tbDevice.setDeviceType(i);
            deviceMapper.insert(tbDevice);
        }
    }
}
```

结果发现：奇数存储在 ds1 的 device_1 表，偶数存储在 ds0 的 device_0 表中，基本分表分库。

4、测试查询数据：

```java
@Test
void testQueryDeviceId(){
    QueryWrapper<TbDevice> queryWrapper = new QueryWrapper<>();
    queryWrapper.eq("device_id", 1L);
    List<TbDevice> deviceList = deviceMapper.selectList(queryWrapper);
    System.out.println(deviceList);
}
```

​		测试结果：发现实际去 ds1 的 device_1 表里去查询，且成功查询到对应数据。

5、测试`根据 id 的范围查询`：这里就会涉及到两个库

```java
@Test
void testQueryBetween(){
    QueryWrapper<TbDevice> queryWrapper = new QueryWrapper<>();
    queryWrapper.between("device_id", 1, 10);   //此处如果能查询到则一定需要一种策略：知道应该去哪个表里查询
    List<TbDevice> tbDevices = deviceMapper.selectList(queryWrapper);
    System.out.println(tbDevices);
}
```

​		发现结果并未查出，同时报错：`Inline 分片策略不支持范围查询`，那么如何解决呢？

```cmd
### Cause: java.lang.IllegalStateException: Inline strategy cannot support this type sharding:RangeRouteValue(columnName=device_id, tableName=tb_device, valueRange=[1‥10])
```

# 分库分表实现

## 核心概念

### 基本概念

1）`逻辑表`：⽔平拆分的数据库（表）的相同逻辑和数据结构表的总称。例：订单数据根据主键尾数拆分为10张表，分别是 `t_order_0 到 t_order_9` ，他们的逻辑表名为 `t_order` 。

2）`物理表`：在分⽚的数据库中真实存在的物理表。即上个示例中的 t_order_0 到 t_order_9 。

3）`数据节点`：数据分⽚的最⼩单元。由数据源名称和数据表组成，例： `ds_0.t_order_0` 。（类似于指定具体的某个库的某个数据表）

4）`绑定表`：后续详细说明。

5）`广播表`：后续详细说明。



### 分片策略

1、`分片键`：⽤于分⽚的数据库字段，是将数据库(表)⽔平拆分的关键字段。例如上面快速开始案例的：`device_id` 字段，通过此字段进行划分。

2、`分片算法`：通过分⽚算法将数据分⽚。`ShardingSphere 并未实现具体的分片算法`，只是`提供接口`让开发者自行实现分片算法。

​	1）精确分片算法：PreciseShardingAlgorithm。⽤于处理使⽤单⼀键作为分⽚键，使用 `=` 与 `IN` 进⾏分⽚的场景，配合 StandardShardingStrategy 使⽤。

​	2）范围分⽚算法：RangeShardingAlgorithm。⽤于处理使⽤单⼀键作为分⽚键，使用 `BETWEEN AND`、`>`、`<`、` >=`、`<=` 进⾏分⽚的场景。配合StandardShardingStrategy 使⽤。

​	3）复合分片算法：ComplexKeysShardingAlgorithm。⽤于处理使⽤多键作为分⽚键进⾏分⽚的场景，`包含多个分⽚键的逻辑`较复杂，需要应⽤开发者⾃⾏处理其中的复杂度，配合 ComplexShardingStrategy使⽤。

​	4）Hint 分片算法：HintShardingAlgorithm。⽤于处理使⽤ Hint⾏分⽚的场景，配合 HintShardingStrategy 使⽤。（`强制分片`）

3、`分片策略`：包含分片键和分片算法。

​	1）标准分片策略：StandardShardingStrategy，实际就是提供 `PreciseShardingAlgorithm`（必选） + RangeShardingAlgorithm（可选） 分片算法。

​	2）复合分片策略：ComplexShardingStrategy，支持多分片键，分⽚算法则完全由应⽤开发者实现，提供最⼤的灵活度。

​	3）行表达式分片策略：InlineShardingStrategy（快速开始案例使用的），使⽤ Groovy 的表达式，提供对SQL语句中的=和IN的分⽚操作⽀持，只⽀持单分⽚键。对于简单的分⽚算法，可以通过简单的配置使⽤，从⽽避免繁琐的 Java代码开发。

​	4）Hint 分片策略：HintShardingStrategy。通过 Hint 指定分⽚值⽽⾮从SQL中提取分⽚值（提取方式就是字段）的⽅式进⾏分⽚的策略。

​	5）不分片策略：NoneShardingStrategy。不分⽚的策略。

## 标准分片策略实现

​		根据上面的概念可知，快速开始案例中的`行表达式分片策略 lnline`只支持单分片键，且只提供`= 和 in` 的分片操纵，因此范围查询 `报错`。

### 精准分片算法

1、配置分库的分片策略：包括分片键和分片算法。 =====> 使用`标准分片策略`实现

```properties
# 配置真实数据源,这里制定数据源为 ds1，在下面对 ds1 做具体的配置
spring.shardingsphere.datasource.names=ds0,ds1

# 配置第 1 个数据源：ds0 ===> db_device_0
spring.shardingsphere.datasource.ds0.type=com.alibaba.druid.pool.DruidDataSource
spring.shardingsphere.datasource.ds0.driver-classname=com.mysql.cj.jdbc.Driver
spring.shardingsphere.datasource.ds0.url=jdbc:mysql://8.142.92.222:4306/db_device_0?serverTimezone=Asia/Shanghai
spring.shardingsphere.datasource.ds0.username=root
spring.shardingsphere.datasource.ds0.password=123456

# 配置第 2 个数据源：ds1 ===> db_device_1
spring.shardingsphere.datasource.ds1.type=com.alibaba.druid.pool.DruidDataSource
spring.shardingsphere.datasource.ds1.driver-classname=com.mysql.cj.jdbc.Driver
spring.shardingsphere.datasource.ds1.url=jdbc:mysql://39.103.191.179:4306/db_device_1?serverTimezone=Asia/Shanghai
spring.shardingsphere.datasource.ds1.username=root
spring.shardingsphere.datasource.ds1.password=123456

# 现在两个数据库的物理表总共就应该有四个,因此需要将库名也做 groovy 语法配置
spring.shardingsphere.sharding.tables.tb_device.actual-data-nodes=ds$->{0..1}.tb_device_$->{0..1}

# 配置数据库的分片策略:分片键 + 分片算法策略(标准分片策略)
spring.shardingsphere.sharding.default-database-strategy.standard.sharding-column=device_id
# 配置精准分片算法（必选），需要配置具体的实现类
spring.shardingsphere.sharding.default-database-strategy.standard.precise-algorithm-class-name=com.example.algorithm.database.MyDatabaseStandardPreciseAlgorithm

# 配置数据表的分片策略:分片键 + 分片算法策略(标准分片策略)
spring.shardingsphere.sharding.tables.tb_device.table-strategy.standard.sharding-column=device_id
spring.shardingsphere.sharding.tables.tb_device.table-strategy.standard.precise-algorithm-class-name=com.example.algorithm.table.MyTableStandardPreciseAlgorithm

# 开启 SQL 显示
spring.shardingsphere.props.sql.show = true
```

2、编写具体的数据库的精准分片算法实现：`implements PreciseShardingAlgorithm<Long>`，Long 指代具体的分片键的类型

```java
//泛型是分片键的类型
public class MyDatabaseStandardPreciseAlgorithm implements PreciseShardingAlgorithm<Long> {

    /**
     * 精确分片的具体实现方法
     * @param collection 具体的物理数据库的集合（ds0、ds1）
     * @param preciseShardingValue 分片的参数
     * @return 定位到的数据库
     */
    @Override
    public String doSharding(Collection<String> collection, PreciseShardingValue<Long> preciseShardingValue) {
        // 获取逻辑表的名称
        String logicTableName = preciseShardingValue.getLogicTableName();
        //获取分片键列名
        String columnName = preciseShardingValue.getColumnName();
        //获取分片键的具体的值
        Long value = preciseShardingValue.getValue();

        //设置分片的具体实现算法：还是用原来的取模 2 的方式查找
        String databaseName = "ds" + (value % 2);
        if (!collection.contains(databaseName)){
            throw new UnsupportedOperationException("数据源：" + databaseName + "不存在");
        }
        return databaseName;
    }
}
```

3、编写具体的数据表的精准分片算法实现：`implements PreciseShardingAlgorithm<Long>`，Long 指代具体的分片键的类型

```java
public class MyTableStandardPreciseAlgorithm implements PreciseShardingAlgorithm<Long> {

    /**
     * 精确分片的具体实现方法
     * @param collection 具体的物理表的集合
     * @param preciseShardingValue 分片的参数
     * @return 返回找到的表名
     */
    @Override
    public String doSharding(Collection<String> collection, PreciseShardingValue<Long> preciseShardingValue) {
        Long value = preciseShardingValue.getValue();
        //tb_device_0/1
        String actTableName = preciseShardingValue.getLogicTableName() + "_" + (value % 2);
        if (!collection.contains(actTableName)){
            throw new UnsupportedOperationException("表：" + actTableName + "不存在");
        }
        return actTableName;
    }
}
```

### 范围分片算法

1、添加数据库分库的范围分片算法配置：

```properties
spring.shardingsphere.sharding.default-database-strategy.standard.range-algorithm-class-name=com.example.algorithm.database.MyDatabaseStandardRangeAlgorithm
```

2、编写数据库具体的范围分片算法实现：`implements RangeShardingAlgorithm<Long>`，Long 指代具体的分片键的类型

```java
public class MyDatabaseStandardRangeAlgorithm implements RangeShardingAlgorithm<Long> {
    /**
     * 范围分片的具体实现：直接返回数据源即可
     * 范围查询，需要在两个库的两张表中查。
     * @param collection 具体的物理数据库的集合（ds0、ds1）
     * @param rangeShardingValue 分片信息，提供了这次查询的条件 1,10
     * @return
     */
    @Override
    public Collection<String> doSharding(Collection<String> collection, RangeShardingValue<Long> rangeShardingValue) {
        return Arrays.asList("ds0", "ds1");
    }
}
```

3、添加数据表分表的范围分片算法配置：

```properties
spring.shardingsphere.sharding.tables.tb_device.table-strategy.standard.range-algorithm-class-name=com.example.algorithm.table.MyTableStandardRangeAlgorithm
```

4、编写数据表具体的范围分片算法实现：`implements RangeShardingAlgorithm<Long>`，Long 指代具体的分片键的类型

```java
public class MyTableStandardRangeAlgorithm implements RangeShardingAlgorithm<Long> {
    @Override
    public Collection<String> doSharding(Collection<String> collection, RangeShardingValue<Long> rangeShardingValue) {
        String logicTableName = rangeShardingValue.getLogicTableName();
        // 数据来自于两张表
        return Arrays.asList(logicTableName + "_0", logicTableName + "_1");
    }
}
```

5、再次进行测试范围查询：

```java
@Test
void testQueryBetween(){
    QueryWrapper<TbDevice> queryWrapper = new QueryWrapper<>();
    queryWrapper.between("device_id", 1, 10);
    List<TbDevice> tbDevices = deviceMapper.selectList(queryWrapper);
    System.out.println(tbDevices);
}
```

测试结果发现已经能够`查询到数据`了，并不会报错了。

```cmd
[TbDevice(deviceId=2, deviceType=2), TbDevice(deviceId=4, deviceType=4), TbDevice(deviceId=6, deviceType=6), TbDevice(deviceId=8, deviceType=8), TbDevice(deviceId=10, deviceType=10), TbDevice(deviceId=1, deviceType=1), TbDevice(deviceId=3, deviceType=3), TbDevice(deviceId=5, deviceType=5), TbDevice(deviceId=7, deviceType=7), TbDevice(deviceId=9, deviceType=9)]
```

​		但是会发现：会在四个节点都进行查询，比较浪费效率，会影响性能。

<span style="color:green">问题提出：</span>

再次进行`测试`：device_id 满足范围条件，device_type 满足精确条件，那么结果又是如何呢？

```java
@Test
void queryDeviceByRangeAndDeviceType(){
    QueryWrapper<TbDevice> queryWrapper = new QueryWrapper<>();
    queryWrapper.between("device_id", 1, 10);       // 范围查询
    queryWrapper.eq("device_type", 5);                   // 精确查询
    List<TbDevice> deviceList = deviceMapper.selectList(queryWrapper);
    System.out.println(deviceList);
}
```

​		测试结果：

```java
2022-06-13 17:58:19.648  INFO 8616 --- [           main] ShardingSphere-SQL                       : Logic SQL: SELECT  device_id,device_type  FROM tb_device WHERE (device_id BETWEEN ? AND ? AND device_type = ?)
    
2022-06-13 17:58:19.648  INFO 8616 --- [           main] ShardingSphere-SQL                       : SQLStatement: 
.........
2022-06-13 17:58:19.649  INFO 8616 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds0 ::: SELECT  device_id,device_type  FROM tb_device_0 WHERE (device_id BETWEEN ? AND ? AND device_type = ?) ::: [1, 10, 5]
2022-06-13 17:58:19.649  INFO 8616 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds0 ::: SELECT  device_id,device_type  FROM tb_device_1 WHERE (device_id BETWEEN ? AND ? AND device_type = ?) ::: [1, 10, 5]
2022-06-13 17:58:19.649  INFO 8616 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds1 ::: SELECT  device_id,device_type  FROM tb_device_0 WHERE (device_id BETWEEN ? AND ? AND device_type = ?) ::: [1, 10, 5]
2022-06-13 17:58:19.649  INFO 8616 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds1 ::: SELECT  device_id,device_type  FROM tb_device_1 WHERE (device_id BETWEEN ? AND ? AND device_type = ?) ::: [1, 10, 5]

[TbDevice(deviceId=5, deviceType=5)]
```

​		在对 device_id 进⾏范围查询的同时，需要根据 device_type 做精确查找，发现此时也`需要查两个库的四张表`，但实际上奇数的 device_type 只会在奇数库的奇数表中，此时冗余了多次不必要的查询，影响效率。 =====> 如何解决呢？ `复合分片策略`

## 复合分片策略实现

​		为了解决上面出现的问题，解决冗余的多次无效查找，使用 complex 的复合分片策略（`支持多个字段的分片`）。

1、确定分片键：device_id 和 device_type。

2、修改配置文件，使用复合分片策略：

```properties
# 配置数据库的分片策略:分片键 + 分片算法策略(标准分片策略)
spring.shardingsphere.sharding.default-database-strategy.complex.sharding-columns=device_id,device_type
spring.shardingsphere.sharding.default-database-strategy.complex.algorithm-class-name=com.example.algorithm.database.MyDatabaseComplexAlgorithm

# 配置数据表的分片策略:分片键 + 分片算法策略(标准分片策略)
spring.shardingsphere.sharding.tables.tb_device.table-strategy.complex.sharding-columns=device_id,device_type
spring.shardingsphere.sharding.tables.tb_device.table-strategy.complex.algorithm-class-name=com.example.algorithm.table.MyTableComplexAlgorithm
```

3、编写数据库的分片策略实现：

```java
public class MyDatabaseComplexAlgorithm implements ComplexKeysShardingAlgorithm<Integer> {

    /**
     * 复杂策略实现
     * @param collection 数据库集合
     * @param complexKeysShardingValue 分片信息
     * @return 这次要查找的数据库集合
     */
    @Override
    public Collection<String> doSharding(Collection<String> collection, ComplexKeysShardingValue<Integer> complexKeysShardingValue) {
        //获取 device_type 的数据,sql 可能包含多个数值
        Collection<Integer> deviceTypeValues = complexKeysShardingValue.getColumnNameAndShardingValuesMap().get("device_type");
        Collection<String> databases = new ArrayList<>();
        for (Integer deviceType : deviceTypeValues) {
            String databaseName = "ds" + (deviceType % 2);
            databases.add(databaseName);
        }
        return databases;
    }
}
```

4、编写数据表的分片策略实现：

```java
public class MyTableComplexAlgorithm implements ComplexKeysShardingAlgorithm<Integer> {
    @Override
    public Collection<String> doSharding(Collection<String> collection, ComplexKeysShardingValue<Integer> complexKeysShardingValue) {
        //获取 device_type 的数据,sql 可能包含多个数值
        Collection<Integer> deviceTypeValues = complexKeysShardingValue.getColumnNameAndShardingValuesMap().get("device_type");
        Collection<String> tables = new ArrayList<>();
        for (Integer deviceTypeValue : deviceTypeValues) {
            //获取数据节点
            String tableName = complexKeysShardingValue.getLogicTableName() + "_" + (deviceTypeValue % 2);
            tables.add(tableName);
        }
        return tables;
    }
}
```

5、测试之前冗余问题的那个请求：

```java
@Test
void queryDeviceByRangeAndDeviceType(){
    QueryWrapper<TbDevice> queryWrapper = new QueryWrapper<>();
    queryWrapper.between("device_id", 1, 10);       // 范围查询
    queryWrapper.eq("device_type", 5);                   // 精确查询
    List<TbDevice> deviceList = deviceMapper.selectList(queryWrapper);
    System.out.println(deviceList);
}
```

​		测试结果：

```cmd
2022-06-13 21:36:03.659  INFO 7304 --- [           main] ShardingSphere-SQL                       : Logic SQL: SELECT  device_id,device_type  FROM tb_device 
 
 WHERE (device_id BETWEEN ? AND ? AND device_type = ?)
2022-06-13 21:36:03.659  INFO 7304 --- [           main] ShardingSphere-SQL                       : SQLStatement: 
 ........
2022-06-13 21:36:03.659  INFO 7304 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds1 ::: SELECT  device_id,device_type  FROM tb_device_1 
 
 WHERE (device_id BETWEEN ? AND ? AND device_type = ?) ::: [1, 10, 5]
[TbDevice(deviceId=5, deviceType=5)]
```

​		发现此时只查询了 ds1 数据库，只查询了 tb_device_1 这个表，完美的`解决了冗余查询的问题`。

## Hint 分片策略实现

​		Hint 分片策略是一种`强制指定`的策略，直接指定进入到具体某个库的具体某个表进行查询。（一般出现 Hint 分片策略也只会指定在表中）

1、修改配置文件：将数据库的分片策略使用 `行表达式分片策略`，表的分片策略使用 `Hint 分片策略`。

```properties
# 配置数据库的分片策略:分片键 + 分片算法策略(标准分片策略)
spring.shardingsphere.sharding.default-database-strategy.inline.sharding-column=device_id
spring.shardingsphere.sharding.default-database-strategy.inline.algorithm-expression=ds$->{device_id%2}

# 配置数据表的分片策略:分片键(因为是强制去到某个表，因此分片键已经没用了) + 分片算法策略(标准分片策略)
spring.shardingsphere.sharding.tables.tb_device.table-strategy.hint.algorithm-class-name=com.example.algorithm.table.MyTableHintAlgorithm
```

2、编写 hint 分片策略的实现：

```java
public class MyTableHintAlgorithm implements HintShardingAlgorithm<Long> {
    @Override
    public Collection<String> doSharding(Collection<String> collection, HintShardingValue<Long> hintShardingValue) {
        //根据指定参数强制查询物理表
        String tableName = hintShardingValue.getLogicTableName() + "_" + hintShardingValue.getValues().toArray()[0];
        if (!collection.contains(tableName)){
            throw new UnsupportedOperationException("数据表：" + tableName + "不存在");
        }
        return Arrays.asList(tableName);
    }
}
```

3、测试使用：

```java
@Test
void testHint(){
    //使用 hint 进行强制路由时，需要得到一个 hintManage 对象
    HintManager hintManager = HintManager.getInstance();
    //手动传入参数，强制指定物理表为：tb_device_0
    hintManager.addTableShardingValue("tb_device", 0);
    List<TbDevice> devices = deviceMapper.selectList(null);
    for (TbDevice device : devices) {
        System.out.println(device);
    }
}
```

​		测试发现结果`只会查询每个库的 tb_device_0 表`中的内容。

```cmd
2022-06-13 22:02:18.900  INFO 14280 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds0 ::: SELECT  device_id,device_type  FROM tb_device_0
2022-06-13 22:02:18.900  INFO 14280 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds1 ::: SELECT  device_id,device_type  FROM tb_device_0
TbDevice(deviceId=2, deviceType=2)
```

## 绑定表

### 笛卡尔积问题

​		先模拟数据库查询的`笛卡尔积`场景：`联表查询`可能出现的问题。

1、两个数据库分别创建 tb_device_info_0 和 tb_device_info_1 物理表：

```sql
CREATE TABLE `tb_device_info_0` (
 `id` bigint NOT NULL,
 `device_id` bigint DEFAULT NULL,
 `device_intro` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tb_device_info_1` (
 `id` bigint NOT NULL,
 `device_id` bigint DEFAULT NULL,
 `device_intro` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

2、配置 tb_device 和 tb_device_info 两套表的分⽚策略。（数据库和数据表的分片策略都换成 `inline`分片策略）

```properties
# 配置节点
spring.shardingsphere.sharding.tables.tb_device.actual-data-nodes=ds$->{0..1}.tb_device_$->{0..1}
spring.shardingsphere.sharding.tables.tb_device_info.actual-data-nodes=ds$->{0..1}.tb_device_info_$->{0..1}

# 配置数据库的分片策略:分片键 + 分片算法策略(标准分片策略)
spring.shardingsphere.sharding.default-database-strategy.inline.sharding-column=device_id
spring.shardingsphere.sharding.default-database-strategy.inline.algorithm-expression=ds$->{device_id%2}

# 配置 tb_device 数据表的分片策略:
spring.shardingsphere.sharding.tables.tb_device.table-strategy.inline.sharding-column=device_id
spring.shardingsphere.sharding.tables.tb_device.table-strategy.inline.algorithm-expression=tb_device_$->{device_id%2}
# 配置 tb_device_info 数据表的分片策略:
spring.shardingsphere.sharding.tables.tb_device_info.table-strategy.inline.sharding-column=device_id
spring.shardingsphere.sharding.tables.tb_device_info.table-strategy.inline.algorithm-expression=tb_device_info_$->{device_id%2}
```

3、编写实体类：`TbDeviceInfo`

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TbDeviceInfo {
    private Long id;
    private Long deviceId;
    private String deviceIntro;
}
```

4、编写对应的 Mapper 接口，集成 BaseMapper 。

```java
@Mapper
public interface DeviceInfoMapper extends BaseMapper<TbDeviceInfo> {

}
```

5、清除原来的所有数据，测试重新插入数据：

```java
@SpringBootTest
public class Test01 {

    @Autowired
    private DeviceMapper deviceMapper;

    @Autowired
    private DeviceInfoMapper deviceInfoMapper;

    @Test
    void testInitData(){
        for (int i = 0; i < 10; i++) {
            //插入 tb_device 表
            TbDevice device = new TbDevice((long) i, i);
            deviceMapper.insert(device);

            //插入 tb_device_info 表
            TbDeviceInfo deviceInfo = new TbDeviceInfo();
            deviceInfo.setDeviceId((long) i);
            deviceInfo.setDeviceIntro("intro:" + i);
            deviceInfoMapper.insert(deviceInfo);
        }
    }
}
```

6、此时创建出出现 `笛卡尔积` 的`联表查询`的场景：

​	1）mapper 文件修改，自己编写 sql 语句

```java
@Mapper
public interface DeviceInfoMapper extends BaseMapper<TbDeviceInfo> {

    //联表查询：id、deviceId、deviceType、deviceIntro 四个属性
    @Select("select tdi.id,tdi.device_id,td.device_type,tdi.device_intro from tb_device_info as tdi left join tb_device as td on tdi.device_id=td.device_id")
    List<TbDeviceInfo> queryDeviceInfo();
}
```

​	2）再次进行测试联表查询：

```java
@Test
void testQueryDeviceInfo(){
    List<TbDeviceInfo> deviceInfos = deviceInfoMapper.queryDeviceInfo();
    deviceInfos.forEach(deviceInfo -> System.out.println(deviceInfo));
}
```

​	测试结果：

```cmd
2022-06-14 16:24:48.686  INFO 15568 --- [           main] ShardingSphere-SQL                       : Logic SQL: select tdi.id,tdi.device_id,td.device_type,tdi.device_intro from tb_device_info as tdi left join tb_device as td on tdi.device_id=td.device_id
2022-06-14 16:24:48.686  INFO 15568 --- [           main] ShardingSphere-SQL                       : SQLStatement: 
.......................
2022-06-14 16:24:48.687  INFO 15568 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds0 ::: select tdi.id,tdi.device_id,td.device_type,tdi.device_intro from tb_device_info_1 as tdi left join tb_device_0 as td on tdi.device_id=td.device_id
2022-06-14 16:24:48.687  INFO 15568 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds0 ::: select tdi.id,tdi.device_id,td.device_type,tdi.device_intro from tb_device_info_1 as tdi left join tb_device_1 as td on tdi.device_id=td.device_id
2022-06-14 16:24:48.687  INFO 15568 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds0 ::: select tdi.id,tdi.device_id,td.device_type,tdi.device_intro from tb_device_info_0 as tdi left join tb_device_0 as td on tdi.device_id=td.device_id
2022-06-14 16:24:48.687  INFO 15568 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds0 ::: select tdi.id,tdi.device_id,td.device_type,tdi.device_intro from tb_device_info_0 as tdi left join tb_device_1 as td on tdi.device_id=td.device_id
2022-06-14 16:24:48.687  INFO 15568 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds1 ::: select tdi.id,tdi.device_id,td.device_type,tdi.device_intro from tb_device_info_1 as tdi left join tb_device_0 as td on tdi.device_id=td.device_id
2022-06-14 16:24:48.687  INFO 15568 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds1 ::: select tdi.id,tdi.device_id,td.device_type,tdi.device_intro from tb_device_info_1 as tdi left join tb_device_1 as td on tdi.device_id=td.device_id
2022-06-14 16:24:48.687  INFO 15568 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds1 ::: select tdi.id,tdi.device_id,td.device_type,tdi.device_intro from tb_device_info_0 as tdi left join tb_device_0 as td on tdi.device_id=td.device_id
2022-06-14 16:24:48.687  INFO 15568 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds1 ::: select tdi.id,tdi.device_id,td.device_type,tdi.device_intro from tb_device_info_0 as tdi left join tb_device_1 as td on tdi.device_id=td.device_id
TbDeviceInfo(id=1536623345439145986, deviceId=0, deviceIntro=intro:0)
TbDeviceInfo(id=1536623346542247937, deviceId=2, deviceIntro=intro:2)
...........................
TbDeviceInfo(id=1536623349054636034, deviceId=7, deviceIntro=intro:7)
TbDeviceInfo(id=1536623350027714562, deviceId=9, deviceIntro=intro:9)
```

​		发现问题：ds0 和 ds1 两个数据库都`查询了四次`（本来应该只查询两次），同时查询结果是 20 条`出现重复`。 ======> 出现笛卡尔积 问题

> 笛卡尔积：交叉查询，一个库的四个表和另外库的表都进行了交叉联表查询。
>

### 绑定表实现

​		绑定表是指分片规则一致的主表和子表（例如上面案例中的两张表的关系`能够`互为绑定表），绑定表之间的多表关联查询不会出现笛卡尔积关联，关联查询效率也将⼤⼤提升。

1、配置文件添加绑定表配置：

```properties
# 配置绑定表:是个数组，可以绑定多对
spring.shardingsphere.sharding.binding-tables[0]=tb_device,tb_device_info
```

2、再次进行刚才的查询测试，发现：

```cmd
2022-06-14 16:38:36.720  INFO 11696 --- [           main] ShardingSphere-SQL                       : Logic SQL: select tdi.id,tdi.device_id,td.device_type,tdi.device_intro from tb_device_info as tdi left join tb_device as td on tdi.device_id=td.device_id
2022-06-14 16:38:36.720  INFO 11696 --- [           main] ShardingSphere-SQL                       : SQLStatement: 
......................................
2022-06-14 16:38:36.721  INFO 11696 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds0 ::: select tdi.id,tdi.device_id,td.device_type,tdi.device_intro from tb_device_info_0 as tdi left join tb_device_0 as td on tdi.device_id=td.device_id
2022-06-14 16:38:36.721  INFO 11696 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds0 ::: select tdi.id,tdi.device_id,td.device_type,tdi.device_intro from tb_device_info_1 as tdi left join tb_device_1 as td on tdi.device_id=td.device_id
2022-06-14 16:38:36.721  INFO 11696 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds1 ::: select tdi.id,tdi.device_id,td.device_type,tdi.device_intro from tb_device_info_0 as tdi left join tb_device_0 as td on tdi.device_id=td.device_id
2022-06-14 16:38:36.721  INFO 11696 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds1 ::: select tdi.id,tdi.device_id,td.device_type,tdi.device_intro from tb_device_info_1 as tdi left join tb_device_1 as td on tdi.device_id=td.device_id
TbDeviceInfo(id=1536623345439145986, deviceId=0, deviceIntro=intro:0)
TbDeviceInfo(id=1536623346542247937, deviceId=2, deviceIntro=intro:2)
TbDeviceInfo(id=1536623347448217602, deviceId=4, deviceIntro=intro:4)
TbDeviceInfo(id=1536623348475822081, deviceId=6, deviceIntro=intro:6)
TbDeviceInfo(id=1536623349516009473, deviceId=8, deviceIntro=intro:8)
TbDeviceInfo(id=1536623346017959937, deviceId=1, deviceIntro=intro:1)
TbDeviceInfo(id=1536623347053953025, deviceId=3, deviceIntro=intro:3)
TbDeviceInfo(id=1536623348014448641, deviceId=5, deviceIntro=intro:5)
TbDeviceInfo(id=1536623349054636034, deviceId=7, deviceIntro=intro:7)
TbDeviceInfo(id=1536623350027714562, deviceId=9, deviceIntro=intro:9)
```

​		查询结果正常，每个数据库查询两次（0 -> 0，1 -> 1），查询结果没有出现重复。

## 广播表

​		广播表：指所有的分⽚数据源中都存在的表，表结构和表中的数据在每个数据库中均完全⼀致。适⽤于数据量不⼤且需要与海量数据的表进⾏关联查询的场景，例如：字典表。

​		新场景：device_type 列表示设备类型的 id值，应该有一个对应的 tb_device_type 表来表示具体的设备类型名，这个表数据量不打，现在要求这个表不应该被分表，`两个库中都应该有全量的该表的数据，且更新时都应该同时更新`。

1、在两个数据库中创建 tb_device_type 物理表。

```sql
CREATE TABLE `tb_device_type` (
 `type_id` int NOT NULL AUTO_INCREMENT,
 `type_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
 PRIMARY KEY (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

2、创建实体类：`TbDeviceType`

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TbDeviceType {
    private int typeId;
    private String typeName;
}
```

3、新建 DeviceTypeMapper 文件：

```java
@Mapper
public interface DeviceTypeMapper extends BaseMapper<TbDeviceType> {
}
```

4、新建测试用例：

```java
@SpringBootTest
public class Test02 {

    @Autowired
    private DeviceTypeMapper deviceTypeMapper;

    @Test
    void testInitData(){
        TbDeviceType deviceType1 = new TbDeviceType();
        deviceType1.setTypeId(1);
        deviceType1.setTypeName("⼈脸考勤");
        deviceTypeMapper.insert(deviceType1);

        TbDeviceType deviceType2 = new TbDeviceType();
        deviceType2.setTypeId(2);
        deviceType2.setTypeName("⼈脸通道");
        deviceTypeMapper.insert(deviceType2);

        TbDeviceType deviceType3 = new TbDeviceType();
        deviceType3.setTypeId(3);
        deviceType3.setTypeName("异常检测");
        deviceTypeMapper.insert(deviceType3);
    }
}
```

​		测试结果：`当不进行广播表配置时，结果会随机查其中一个表`。

```cmd
2022-06-14 16:52:16.192  INFO 17564 --- [           main] ShardingSphere-SQL                       : Logic SQL: INSERT INTO tb_device_type  ( type_id,type_name )  VALUES  ( ?,? )
2022-06-14 16:52:16.193  INFO 17564 --- [           main] ShardingSphere-SQL                       : SQLStatement: 
.......................
2022-06-14 16:52:16.193  INFO 17564 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds1 ::: INSERT INTO tb_device_type  ( type_id,type_name )  VALUES  (?, ?) ::: [1, ⼈脸考勤]
2022-06-14 16:52:16.431  INFO 17564 --- [           main] ShardingSphere-SQL                       : Logic SQL: INSERT INTO tb_device_type  ( type_id,type_name )  VALUES  ( ?,? )
2022-06-14 16:52:16.431  INFO 17564 --- [           main] ShardingSphere-SQL                       : SQLStatement: 
.......................
2022-06-14 16:52:16.431  INFO 17564 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds1 ::: INSERT INTO tb_device_type  ( type_id,type_name )  VALUES  (?, ?) ::: [2, ⼈脸通道]
2022-06-14 16:52:16.569  INFO 17564 --- [           main] ShardingSphere-SQL                       : Logic SQL: INSERT INTO tb_device_type  ( type_id,type_name )  VALUES  ( ?,? )
2022-06-14 16:52:16.569  INFO 17564 --- [           main] ShardingSphere-SQL                       : SQLStatement: 
.......................
2022-06-14 16:52:16.569  INFO 17564 --- [           main] ShardingSphere-SQL                       : Actual SQL: ds0 ::: INSERT INTO tb_device_type  ( type_id,type_name )  VALUES  (?, ?) ::: [3, 异常检测]
```

5、进行广播表的配置：

```properties
# 配置广播表
spring.shardingsphere.sharding.broadcast-tables=tb_device_type
spring.shardingsphere.sharding.tables.t_dict.key-generator.column=type_id
spring.shardingsphere.sharding.tables.t_dict.key-generator.type=SNOWFLAKE
```

6、清空 tb_device_type 表数据，再进行插入测试：发现`数据出现在两张表中，且数据完全相同`，观察 sql 语句发现在两个数据库都会执行相同插入语句。

# 读写分离实现

​		项目实际上线多数情况下都是读取数据，为了提高数据库读的性能，因此需要配置`读写分离`的模式，前提就是要搭建一个主从同步的集群，`主库 master 负责写数据请求，配置多个读库 slave 负责读数据请求`，那么如何利用 ShardingSphere 实现这个效果呢？

## 主从同步

​		实现读写分离的前提就是 `数据库已经实现了主从复制`，这样数据才会同步，此有后续的读写分离的操作。

​		Master 主库将数据写⼊到 `binlog ⽇志`中。Slave 开启 IO 线程专门读取主节点的 Binlog 数据到本地的 relaylog ⽇志⽂件中。此时，Slave 持续不断的与 Master 同步，且数据存在于 `relaylog 文件` 中，⽽并⾮落在数据库。于是 Slave 还需要再开启⼀条线程，专⻔将 relaylog 文件中的数据写⼊到数据库中。

>  binlog ⽇志：主库 master 的`所有行为都会保存`其中（可以配置）。=====> `数据变化就在这个文件里`

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210307194735258.png)

​		使用`不同服务器`上的 docker-compose 进行模拟搭建 `一主二从` 的主从同步的 mysql 集群。

1、mysql-master 的 docker 创建 yml 配置：（`8.142.92.222：4306`）使用 4306 端口，注意端口开放。

```yml
version: '3.1'
services:
  mysql:
    restart: always
    image: mysql:5.7.25
    container_name: mysql-master
    ports:
      - 4306:3306
    environment:
      TZ: Asia/Shanghai
      MYSQL_ROOT_PASSWORD: 123456
    command:
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_general_ci
      --explicit_defaults_for_timestamp=true
      --lower_case_table_names=1
      --max_allowed_packet=128M
      # 服务的 id
      --server-id=47
      # 表示开启 master 的 binlog 日志
      --log_bin=master-bin
      # binlog 索引
      --log_bin-index=master-bin.index
      --skip-name-resolve
      --sql-mode="STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO"
    volumes:
      - mysql-data:/var/lib/mysql
volumes:
 mysql-data:
```

2、创建该容器，并记录 binlog 日志文件的全称和偏量值：

```shell
# 后台启动 mysql-master
docker-compose up -d
# 进入容器
docker exec -it mysql-master /bin/bash
# 进入 mysql
mysql -uroot -p123456
# 查询 master 配置：binlog 文件和偏量值
mysql> show master status;
+-------------------+----------+--------------+------------------+-------------------+
| File              | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+-------------------+----------+--------------+------------------+-------------------+
| master-bin.000001 |      154 |              |                  |                   |
+-------------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)
# 因此 binlog 日志全称为：master-bin.000001，偏量值为 154
```

3、另两台服务器作为从库 slave，配置 yml 文件：（`39.103.191.179：4306` 和 `120.55.57.73：4306`）使用 4306 端口，注意端口开放。

```yml
version: '3.1'
services:
  mysql:
    restart: always
    image: mysql:5.7.25
    container_name: mysql-slave
    ports:
      - 4306:3306
    environment:
      TZ: Asia/Shanghai
      MYSQL_ROOT_PASSWORD: 123456
    command:
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_general_ci
      --explicit_defaults_for_timestamp=true
      --lower_case_table_names=1
      --max_allowed_packet=128M
      # 服务端口，另一个 slave 此处换成 49 即可！！！
      --server-id=48
      # 开启中继日志索引（从库文件）
      --relay-log-index=slave-relay-bin.index
      # 开启中继日志文件配置
      --relay-log=slave-relay-bin
      --log-bin=mysql-bin
      --log-slave-updates=1
      --sql-mode="STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO"
    volumes:
      - mysql-data:/var/lib/mysql
volumes:
 mysql-data:
```

4、启动从库并进入从库，配置成 master 的从库：

```shell
# 进入 docker 容器内部
docker exec -it mysql-slave /bin/bash
# 登录进入 mysql
mysql -uroot -p123456
# 设置同步节点，这里的信息就是 master 的 logbin 信息
CHANGE MASTER TO
MASTER_HOST='8.142.92.222',
MASTER_PORT=4306,
MASTER_USER='root',
MASTER_PASSWORD='123456',
MASTER_LOG_FILE='master-bin.000001',
MASTER_LOG_POS=154;
```

5、以其中一个 slave 为例，查看从节点 slave 当前信息：

```shell
mysql> show slave status \G;
*************************** 1. row ***************************
               Slave_IO_State: 
                  Master_Host: 8.142.92.222
                  Master_User: root
                  Master_Port: 4306
                Connect_Retry: 60
              Master_Log_File: master-bin.000001
          Read_Master_Log_Pos: 154
               Relay_Log_File: slave-relay-bin.000001
                Relay_Log_Pos: 4
        Relay_Master_Log_File: master-bin.000001
        # 当前 IO 线程和 SQL 线程并没有执行
             Slave_IO_Running: No
            Slave_SQL_Running: No
              .....................
                   Last_Errno: 0
                   Last_Error: 
                 Skip_Counter: 0
          Exec_Master_Log_Pos: 154
              Relay_Log_Space: 154
              Until_Condition: None
               ..................... 
             Master_Info_File: /var/lib/mysql/master.info
                    SQL_Delay: 0
          SQL_Remaining_Delay: NULL
      Slave_SQL_Running_State: 
           Master_Retry_Count: 86400
              ......................
           Master_TLS_Version: 
1 row in set (0.00 sec)
```

6、开启从节点的功能：

```shell
# 开启从节点的功能：
start slave;

# 再次检查状态
mysql> show slave status \G;
*************************** 1. row ***************************
               Slave_IO_State: Waiting for master to send event
                  Master_Host: 8.142.92.222
                  Master_User: root
                  Master_Port: 4306
                Connect_Retry: 60
              Master_Log_File: master-bin.000001
          Read_Master_Log_Pos: 154
               Relay_Log_File: slave-relay-bin.000002
                Relay_Log_Pos: 321
        Relay_Master_Log_File: master-bin.000001
        # 此时 IO 线程和 SQL 线程开始执行
             Slave_IO_Running: Yes
            Slave_SQL_Running: Yes
              .........................
                 Skip_Counter: 0
          Exec_Master_Log_Pos: 154
              Relay_Log_Space: 528
              Until_Condition: None
               ..........................
             Master_Server_Id: 47
                  Master_UUID: e8bb79d5-ebd9-11ec-b193-0242ac140002
             Master_Info_File: /var/lib/mysql/master.info
                    SQL_Delay: 0
          SQL_Remaining_Delay: NULL
      Slave_SQL_Running_State: Slave has read all relay log; waiting for more updates
           Master_Retry_Count: 86400
                  ......................... 
           Master_TLS_Version: 
1 row in set (0.00 sec)
```

​		此时`主从复制同步数据库集群搭建完毕，并已经开启了 slave 的功能，开始主从复制`。

7、测试效果：在主库创建数据库 `db_device`，并在其中创建表 `tb_user`。

```sql
CREATE TABLE `tb_user` (
 `id` bigint(20) NOT NULL AUTO_INCREMENT,
 `name` varchar(255) DEFAULT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
```

​		测试结果发现两个 slave 也同步出现了数据库 `db_device`，其中出现表 `tb_user`。 ======> 表示主从复制成功，主从复制搭建完毕！

## 读写分离

1、使用之前的项目架构，`重新编写配置文件`，配置数据源主从策略：

```properties
# 开启 SQL 显示
spring.shardingsphere.props.sql.show=true

# 配置真实数据源
spring.shardingsphere.datasource.names=master,slave01,slave02

# 注意数据源都需要设置 useSSL=false，不设置可能会由于 ssl 安全问题报错：
# Caused by: javax.net.ssl.SSLException: Unsupported record version Unknown-0.0
# 配置 master 数据源
spring.shardingsphere.datasource.master.type=com.alibaba.druid.pool.DruidDataSource
spring.shardingsphere.datasource.master.driver-classname=com.mysql.cj.jdbc.Driver
spring.shardingsphere.datasource.master.url=jdbc:mysql://8.142.92.222:4306/db_device?serverTimezone=Asia/Shanghai&useSSL=false
spring.shardingsphere.datasource.master.username=root
spring.shardingsphere.datasource.master.password=123456

# 配置 slave01 数据源
spring.shardingsphere.datasource.slave01.type=com.alibaba.druid.pool.DruidDataSource
spring.shardingsphere.datasource.slave01.driver-classname=com.mysql.cj.jdbc.Driver
spring.shardingsphere.datasource.slave01.url=jdbc:mysql://39.103.191.179:4306/db_device?serverTimezone=Asia/Shanghai&useSSL=false
spring.shardingsphere.datasource.slave01.username=root
spring.shardingsphere.datasource.slave01.password=123456

# 配置 slave02 数据源
spring.shardingsphere.datasource.slave02.type=com.alibaba.druid.pool.DruidDataSource
spring.shardingsphere.datasource.slave02.driver-classname=com.mysql.cj.jdbc.Driver
spring.shardingsphere.datasource.slave02.url=jdbc:mysql://120.55.57.73:4306/db_device?serverTimezone=Asia/Shanghai&useSSL=false
spring.shardingsphere.datasource.slave02.username=root
spring.shardingsphere.datasource.slave02.password=123456

# 分配读写规则,ds0 只是代表整个主从同步数据库，此处指定整个数据库集群的主节点和从节点
spring.shardingsphere.sharding.master-slave-rules.ds0.master-data-source-name=master
spring.shardingsphere.sharding.master-slave-rules.ds0.slave-data-source-names[0]=slave01
spring.shardingsphere.sharding.master-slave-rules.ds0.slave-data-source-names[1]=slave02

# 确定物理表
spring.shardingsphere.sharding.tables.tb_user.actual-data-nodes=ds0.tb_user

# 确定主键生成策略:使用`雪花算法`自动生成
spring.shardingsphere.sharding.tables.t_dict.key-generator.column=id
spring.shardingsphere.sharding.tables.t_dict.key-generator.type=SNOWFLAKE
```

2、编写实体类 `TbUser`，`UserMapper` 接口集成 BaseMapper。

3、测试类编写测试程序，测试插入数据。

```java
@SpringBootTest
public class TestMasterAndSlave {

    @Autowired
    private UserMapper userMapper;

    @Test
    void initData(){
        for (int i = 1; i <= 10; i++) {
            TbUser user = new TbUser();
            user.setName("张三" + i + "号");
            userMapper.insert(user);
        }
    }
}
```

​		观察打印 SQL 语句发现，`数据都是直接插入了 master 数据库`，因此 slave 数据是通过`同步获取`存储的。 =====> master 和 slave 都有相同的数据。

4、测试读取数据：

```java
@Test
void queryUser(){
    List<TbUser> users = userMapper.selectList(null);
    users.forEach(user -> System.out.println(user));
}
```

​		观察打印 SQL 语句发现，`数据查询是直接从 slave01数据库服务器`执行一条 SQL 语句获取的。 =======> 数据的读取来自于从库 slave。

# 连接模式

​		ShardingSphere 采⽤⼀套⾃动化的执⾏引擎，负责将路由和改写完成之后的真实 SQL 安全且⾼效发送到底层数据源执⾏。 它不是简单地将 SQL 通过 JDBC 直接发送⾄数据源执⾏，也并⾮直接将执⾏请求放⼊线程池去并发执⾏。它更关注`平衡数据源连接创建以及内存占⽤所产⽣的消耗`，以及最⼤限度地合理利⽤并发等问题。 执⾏引擎的⽬标是`⾃动化的平衡资源控制与执⾏效率`。

> 一个 SQL 的创建会连向多个数据库，希望系统的整体性能比较好，就会设置多个线程并发的访问数据库，数据库的压力就会很大，那么`如何平衡`呢？

​		那么连接模式又是什么呢？

​		从`资源控制`的⻆度，业务⽅访问数据库的`连接数量`应当有所限制，防⽌某⼀业务操作过多的占⽤资源，从⽽将数据库连接的资源耗尽，以致于影响其他业务的正常访问。特别是在⼀个数据库实例中存在较多分表的情况下，⼀条不包含分⽚键的逻辑 SQL 将产⽣落在同库不同表的⼤量真实 SQL ，如果每条真实SQL都占⽤⼀个独⽴的连接，那么⼀次查询⽆疑将会占⽤过多的资源。

​		从`执⾏效率`的⻆度，为每个分⽚查询维持⼀个独⽴的数据库连接，可以更加有效的利⽤多线程来提升执⾏效率，还能够避免过早的将查询结果数据加载⾄内存。为每个数据库连接开启独⽴的线程，可以将 I/O 所产⽣的消耗并⾏处理，独⽴的数据库连接，能够持有查询结果集游标位置的引⽤，在需要获取相应数据时移动游标即可。

​		以结果集游标下移进⾏结果归并的⽅式，称之为流式归并，它⽆需将结果数据全数加载⾄内 存，可以有效的节省内存资源，进⽽减少垃圾回收的频次。 当⽆法保证每个分⽚查询持有⼀ 个独⽴数据库连接时，则需要在复⽤该数据库连接获取下⼀张分表的查询结果集之前，将当 前的查询结果集全数加载⾄内存。 因此，即使可以采⽤流式归并，在此场景下也将退化为内 存归并。 ⼀⽅⾯是对数据库连接资源的控制保护，⼀⽅⾯是采⽤更优的归并模式达到对中间件内存资 源的节省，如何处理好两者之间的关系，是 ShardingSphere 执⾏引擎需要解决的问题。 具 体来说，如果⼀条 SQL 在经过 ShardingSphere 的分⽚后，需要操作某数据库实例下的 200 张表。 那么，是选择创建 200 个连接并⾏执⾏，还是选择创建⼀个连接串⾏执⾏呢？效率与 资源控制⼜应该如何抉择呢？ 针对上述场景，ShardingSphere 提供了⼀种解决思路。 它提出了连接模式（Connection Mode）的概念，将其划分为内存限制模式（MEMORY_STRICTLY）和连接限制模式 （CONNECTION_STRICTLY）这两种类型。

![](https://pic1.imgdb.cn/item/6336ed2616f2c2beb1beea89.png)

1）内存限制模式

​		内存限制模式采用`流式归并`的方式，允许多个数据库连接同时查询提高执行效率，但是如果查询数据量很大，肯定`不能允许直接将数据加到内存`中？

流式归并不会讲数据直接加到内存，而是会`将数据所在位置（游标）记录`下来，当需要获取数据时，只需要获取响应数据的移动游标即可。

​		劣势：如果 Java 应用程序过多，每个都会保持和每个数据库的独立连接，那么对数据库的压力就会过大。

​		使⽤此模式的前提是，ShardingSphere 对⼀次操作所耗费的数据库连接数量不做限制。 如果实际执⾏的 SQL 需要对某数据库实例中的 200 张表做操作，则对每张表创建⼀个新的数据库连接，并通过多线程的⽅式并发处理，以达成执⾏效率最⼤化。 并且在 SQL 满⾜条件情况 下，优先选择流式归并，以防⽌出现内存溢出或避免频繁垃圾回收情况。

2）连接限制模式

​		当无法保证每个分片查询持有独立的数据库连接时，则需要复用该数据库连接，查询一次就需要将数据全数加载到内存，因此该场景下即使采用流式归并也会退化为`内存归并`。（需要多个表数据时：数据库1查询数据加到内存，再连接到数据库2查询数据加到内存，再在内存实现筛选）

​		使⽤此模式的前提是，ShardingSphere 严格控制对⼀次操作所耗费的数据库连接数量。 如 果实际执⾏的 SQL 需要对某数据库实例中的 200 张表做操作，那么只会创建唯⼀的数据库连 接，并对其 200 张表串⾏处理。 如果⼀次操作中的分⽚散落在不同的数据库，仍然采⽤多线 程处理对不同库的操作，但每个库的每次操作仍然只创建⼀个唯⼀的数据库连接。 这样即可 以防⽌对⼀次请求对数据库连接占⽤过多所带来的问题。该模式始终选择内存归并。

​		内存限制模式适⽤于 OLAP 操作，可以通过放宽对数据库连接的限制提升系统吞吐量； 连接限制模式适⽤于 OLTP 操作，OLTP 通常带有分⽚键，会路由到单⼀的分⽚，因此严格控制数据库连接，以保证在线系统数据库资源能够被更多的应⽤所使⽤，是明智的选择。

> 那么什么时候用哪种模式呢？ =====> `自动化执行引擎`
>

​		将连接模式的选择决定权交由给用户配置，会增加用户学习成本，并非最优方案，而应该在内部消化连接模式概念，使用`自动化执行引擎`，动态决定。

![](https://pic1.imgdb.cn/item/6336ed1a16f2c2beb1beddc6.png)

​		用户只需要配置 `maxConnectionSizePerQuery（一般配成 1）` 配置项，ShardingSphere 内部根据此配置计算结果，决定采用哪种连接模式。

​		每⼀次的连接模式的选择，是`针对每⼀个物理数据库`的。也就是说，在同⼀次查询中，如果路由⾄⼀个以上的数据库，每个数据库的连接模式不⼀定⼀样，它们可能是混合存在的形态。

# 归并引擎

​		分库分表情形下，将从各个数据节点获取的多数据结果集，组合成为⼀个结果集并正确的返回⾄请求客户端， 称为`结果归并`，那么如何归并呢？

## 遍历归并

​		将多个数据结果集合并为⼀个`单向链表`即可。在遍历完成链表中当前数据结果集之后，将链表元素后移⼀位，继续遍历下⼀个数据结果集即可。

## 排序归并

​		举例：成绩表分为三张表，需要查询所有成绩并排序。

![](https://pic1.imgdb.cn/item/6336ed0c16f2c2beb1becfd1.png)

​		通过此优先级队列实现每次将三个库的游标位置的数据进行比较，当获取一条数据后，就将该数据库弹出。（原理类似于`归并排序`）

​		ShardingSphere 的排序归并，是在维护数据结果集的纵轴和横轴这两个维度的有序性。 纵轴是指每个数据结果集本身，它是天然有序的，它通过包含 order by 的 SQL 所获取。 横轴是指每个数据结果集当前游标所指向的值，它需要通过`优先级队列`来维护其正确顺序。 每⼀次数据结果集当前游标的下移，都需要将该数据结果集`重新放⼊`优先级队列排序，⽽只有排列在`队列⾸位`（选取出来）的数据结果集才可能发⽣游标下移的操作。

## 分组归并

​		举例说明，假设根据科⽬分⽚，表结构中包含考⽣的姓名和分数。通过 SQL 获取每位考⽣的总分，可通过如下 SQL：

```sql
SELECT name, SUM(score) FROM t_score GROUP BY name ORDER BY name;
```

​		在`分组项与排序项完全⼀致`的情况下，取得的数据是连续的，分组所需的数据全数存在于各个数据结果集的当前游标所指向的数据值，因此可以采⽤`流式归并`。

![](https://pic1.imgdb.cn/item/6336ecff16f2c2beb1bec1cf.png)

流式分组归并与排序归并的区别仅仅在于两点： 

​	1）它会⼀次性的将多个数据结果集中的分组项相同的数据全数取出。 

​	2）它需要根据`聚合函数`的类型进⾏聚合计算。

## 聚合归并

​		⽆论是流式分组归并还是内存分组归并，对聚合函数的处理都是⼀致的。 除了分组的 SQL 之 外，不进⾏分组的 SQL 也可以使⽤聚合函数。 因此，聚合归并是在之前介绍的归并类的之上追加的归并能⼒，即`装饰者模式`。聚合函数可以归类为⽐较、累加和求平均值这 3 种类型。 ⽐较类型的聚合函数是指 MAX 和 MIN 。它们需要对每⼀个同组的结果集数据进⾏⽐较，并且直接返回其最⼤或最⼩值即可。 累加类型的聚合函数是指 SUM 和 COUNT 。它们需要将每⼀个同组的结果集数据进⾏累加。 求平均值的聚合函数只有 AVG 。它必须通过 SQL 改写的 SUM 和 COUNT 进⾏计算，相关内容 已在 SQL 改写的内容中涵盖，不再赘述。

## 分页归并

分⻚也是追加在其他归并类型之上的装饰器， ShardingSphere 通过装饰者模式来增加对数据结果集进⾏分⻚的能⼒。 分⻚归并负责将⽆需获取的数据过滤掉。

例如 limit 10000，10 这个分页需求：

1）内存模式实现：所有数据 5000 + 5000放入内存，再进行取数据 10。

2）流式归并实现：记录游标 5000 和 5000，通过游标取出数据 前 10 条。

![](https://pic1.imgdb.cn/item/6336ecf216f2c2beb1beb41d.png)
