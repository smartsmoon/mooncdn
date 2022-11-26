---
title: Mybatis-Plus 简单使用
date: 2022-03-02 00:00:00
type:
comments:
tags: 
  - Mybatis-Plus
  - 数据库
categories: 
  - Java 开发
description: 
keywords: Mybatis-Plus
cover: https://w.wallhaven.cc/full/wq/wallhaven-wqplxr.jpg
top_img: https://w.wallhaven.cc/full/wq/wallhaven-wqplxr.jpg
---

MybatisPlus：Mybatis 的增强工具，在 MyBatis 的基础上`只做增强不做改变`，为简化开发、提高效率而生。

主要特性：

1）无侵入，有了 spring后，很多的配置都是横切进去的。

2）损耗小，基本 CRUD 已经实现，性能无损耗。

3）分页插件。

4）内置性能分析插件。

. . . . . .

# 快速开始

## 基本测试

1、创建数据库 mybatis，数据表：user 表

```sql
create database mybatis;
DROP TABLE IF EXISTS user;

CREATE TABLE user
(
    id BIGINT(20) NOT NULL COMMENT '主键ID',
    name VARCHAR(30) NULL DEFAULT NULL COMMENT '姓名',
    age INT(11) NULL DEFAULT NULL COMMENT '年龄',
    email VARCHAR(50) NULL DEFAULT NULL COMMENT '邮箱',
    PRIMARY KEY (id)
);

DELETE FROM user;
INSERT INTO user (id, name, age, email) VALUES
(1, 'Jone', 18, 'test1@baomidou.com'),
(2, 'Jack', 20, 'test2@baomidou.com'),
(3, 'Tom', 28, 'test3@baomidou.com'),
(4, 'Sandy', 21, 'test4@baomidou.com'),
(5, 'Billie', 24, 'test5@baomidou.com');
```

2、创建 springboot 2.0+ 工程，引入相关依赖：

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
<!-- 数据库驱动 -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>
<!-- mybatis-plus 依赖 -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.2</version>
</dependency>
```

> mybatis 和 mybatis-plus 尽量不要同时引入，会有依赖问题。

3、编写配置文件，配置数据库连接，和 mybatis 相同：

```yaml
# MYSQL 数据库连接
spring:
  datasource:
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/mybatis?serverTimezone=GMT%2B8&useSSL=false&useUnicode=true&characterEncoding=UTF-8&allowPublicKeyRetrieval=true
```

4、具体业务实现：

1）编写 pojo 实体类：

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private Long id;
    private String name;
    private Integer age;
    private String email;
}
```

2）编写 mapper 文件，以往需要编写实现的 mapper.xml 文件，现在只需要 `继承 baseMapper<T>`，就会`自动实现`里面编写的接口。

​		这里的 `泛型T 表示需要操作的对象`，即 User，同时 User 的 CRUD 操作都已经被自动实现了，就不需要写以前的 xml 实现文件了。

```java
@Repository
public interface UserMapper extends BaseMapper<User> {

}
```

3）主启动类添加扫描位置。`@MapperScan` 注解扫描 mapper 文件夹的所有接口。

```java
@SpringBootApplication
@MapperScan("com.example.mapper")
public class MybatisPlusApplication {
    public static void main(String[] args) {
        SpringApplication.run(MybatisPlusApplication.class, args);
    }
}
```

4）测试：

```java
@SpringBootTest
class MybatisPlusApplicationTests {

    @Autowired
    private UserMapper userMapper;

    @Test
    void contextLoads() {
        //参数是 Wrapper ，是一个条件构造器，类似于 sql 的条件
        List<User> users = userMapper.selectList(null);
        for (User user : users) {
            System.out.println(user);
        }
    }
}
```

> BaseMapper 里面有一些自己的方法，因此 UserMapper 里面所有的方法来自于父类直接实现好的，不过我们也`可以自己编写扩展的方法`。
>

查询结果：

```cmd
User(id=1, name=Jone, age=18, email=test1@baomidou.com)
User(id=2, name=Jack, age=20, email=test2@baomidou.com)
User(id=3, name=Tom, age=28, email=test3@baomidou.com)
User(id=4, name=Sandy, age=21, email=test4@baomidou.com)
User(id=5, name=Billie, age=24, email=test5@baomidou.com)
```

## 测试 CRUD

​		基本的 CRUD 可以直接进行测试，不需要编写 xml 实现。

### 插入操作

```java
@Test
void test2(){
    User user = new User();
    user.setName("蔡徐坤");
    user.setAge(23);
    user.setEmail("111111111@qq.com");
    int insert = userMapper.insert(user);
    System.out.println(insert);
    System.out.println(user);
}
```

测试结果：

```
User(id=1532726602377064449, name=蔡徐坤, age=23, email=111111111@qq.com)
```

此时发现：id 并没有手动设置，但是 mybatis-plus `自动生成了一个id`，并将此 id 回填到 User 对象中。======> `雪花算法`

### 更新操作

```java
@Test
    void test3(){
        User user = new User();
        user.setId(1532726602377064449L);
        user.setName("蔡徐坤");
        user.setAge(23);
        user.setEmail("999@qq.com");
        int update = userMapper.updateById(user);
        System.out.println(update);
        System.out.println(user);
    }
```

测试结果：

![](https://pic1.imgdb.cn/item/6336b5fe16f2c2beb186e51b.png)

​		发现会`自动拼接动态 sql`，只要加上条件即可。

### 查询操作

1）根据 id 查询某个用户

```java
User user = userMapper.selectById(1L);
```

2）根据多个 id 获取 用户：

```java
List<User> users = userMapper.selectBatchIds(Arrays.asList(1, 2, 3));
```

3）条件查询，可以使用 mapper 封装。

```java
@Test
void test4(){
    Map<String, Object> map = new HashMap<>();
    map.put("name", "蔡徐坤");
    List<User> users = userMapper.selectByMap(map);
    for (User user : users) {
        System.out.println(user);
    }
}
```

4）分页查询使用`分页查询插件`。

### 删除操作

​		删除操作的方法和查询差不多。

```java
@Test
void testDelete(){
    userMapper.deleteById(1L);
    userMapper.deleteBatchIds(Arrays.asList(1, 2, 3));
    userMapper.deleteByMap();
    ......
}
```

​		但实际上在工作中不会真实删除，而是会使用`逻辑删除`。

# 相关设置

## 日志设置

​		application 配置文件设置日志即可：

```yaml
# mybatis-plus 配置
mybatis-plus:
  configuration:
    # 控制台输出方式的日志
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

​		现在就可以看到查询的具体操作。

## 主键生成策略

​		根据上面的插入结果测试发现，mybatis-plus 会自动给 User 分配一个 id，那么这个 id 是如何分配出来的呢？可以使用 `@TableID` 注解修改主键策略

1、ASSIGN_ID 策略：全局唯一 id（`雪花算法`）（以前的 ID_WORKER 策略）

​		使用 mybatis-plus 进行数据库插入 id 的默认值为：全局的唯一 id。=====> `雪花算法` snowflake 算法，一种分布式环境下生成唯一 ID。

雪花算法的构成：生成一个的 64 位比特位的 long 类型的唯一 id。（可以基本保证全球唯一）

1）最高位固定值 0，因为生成的 id 是正整数，如果是 1 就是负数了。

2）接下来 41 位存储毫秒级时间戳，2^41/(1000*60*60*24*365)=69，大概可以使用 69 年。

3）再接下 10 位存储机器码，包括 5 位 datacenterId 和 5 位 workerId。最多可以部署 2^10=1024 台机器。

4）最后 12 位存储序列号。同一毫秒时间戳时，通过这个递增的序列号来区分。即对于同一台机器，同一毫秒时间戳，可以生成 2^12=4096 个不重复 id。



2、AUTO 策略：`自增`，数据库也需要设置 id 自增。

```
@TableId(type = IdType.AUTO)
```

3、其余策略的源码解释：

```java
public enum IdType {
    AUTO(0),	//数据库 id 自增
    NONE(1),	//未设置主键
    INPUT(2),	//手动输入主键，未输入则会是 null
    ASSIGN_ID(3),	// 雪花算法（默认）
    ASSIGN_UUID(4);	// UUID 方案生成
	......
}
```

## 自动填充

​		数据库会存在一些特别的字段，例如 创建时间、修改时间等，这些字段的填充都是自动填充的，这些字段并不希望手动更新。

> 阿里巴巴开发手册规定：创建时间、修改时间所有表都需要，并且需要自动填充。

1、数据库级别实现：（`工作中不允许使用此种方式操作`）

1）在表中新增字段 `gmt_create、gmt_modified`。

![](https://pic1.imgdb.cn/item/6336b60e16f2c2beb186f2e1.png)

2）对实体类进行同步：增加属性 gmtCreate 和 gmtModified。

```java
private Date gmtCreate;
private Date gmtModified;
```

3）此时进行更新，就会发现数据库的更新字段 gmt_modified 会随着更新时间变化，而不需要人为插入数据。



2、`代码级别`实现：

1、删除数据库中的两个字段的默认值和自动更新设置（去掉刚才的设置）

2、实体类的属性上增加注解：`@TableField`

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private Long id;
    private String name;
    private Integer age;
    private String email;
    @TableField(fill = FieldFill.INSERT)
    private Date gmtCreate;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date gmtModified;
}
```

3、编写处理器处理注解：

```java
//插入和更新时的填充策略
@Component
@Slf4j
public class MyMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        log.info("start insert fill");
        this.setFieldValByName("gmtCreate", new Date(),metaObject);
        this.setFieldValByName("gmtModified", new Date(),metaObject);
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        log.info("start update fill");
        this.setFieldValByName("gmtModified", new Date(),metaObject);
    }
}
```

需要注意将 处理器 放入 IOC 容器。

## 乐观锁

​		乐观锁使用版本号 version ，因此需要增加字段 `version`。

乐观锁的实现机制：通过版本号来控制是否更新。

​	1）取出记录时，获取当前 version。

​	2）更新时，带上这个 version。

​	3）执行更新时， set version = newVersion where version = oldVersion。

​	4）如果 version 不对，就更新失败。

那么如何使用 mybatis-plus 自带的乐观锁插件呢？

1、在数据库增加 version 字段，并设置此字段默认值为 1。

2、实体类增加属性 version，同时在其上面增加注解 @Version。

```java
@Version
private int version;
```

3、注册插件：配置进 IOC 容器。同时也可以将以前写在主启动类上的扫描包注解 @MapperScan 放在 mybatis-plus 自己的配置类上。

```java
@Configuration
@MapperScan("com.example.mapper")
public class MybatisPlusConfig {
    
    //乐观锁注册
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
        return interceptor;
    }
}
```

4、测试：

1）单线程情况下：

```java
@Test
void test4(){
    User user = userMapper.selectById(1L);
    user.setName("蔡徐坤1");
    user.setEmail("222@qq.com");
    int update = userMapper.updateById(user);
}
```

​		单线程情况下一定会成功，同时发现日志中 sql 语句自动带上了 version：

```cmd
JDBC Connection [HikariProxyConnection@944826636 wrapping com.mysql.cj.jdbc.ConnectionImpl@3d9f5016] will not be managed by Spring
==>  Preparing: SELECT id,name,age,email,gmt_create,gmt_modified,version FROM user WHERE id=?
==> Parameters: 1(Long)
<==    Columns: id, name, age, email, gmt_create, gmt_modified, version
<==        Row: 1, Jone, 18, test1@baomidou.com, 2022-06-04 10:11:34, 2022-06-04 10:11:34, 1
<==      Total: 1
Closing non transactional SqlSession [org.apache.ibatis.session.defaults.DefaultSqlSession@235d659c]
Creating a new SqlSession
SqlSession [org.apache.ibatis.session.defaults.DefaultSqlSession@3b98b809] was not registered for synchronization because synchronization is not active
2022-06-04 10:54:10.292  INFO 18512 --- [           main] com.example.handler.MyMetaObjectHandler  : start update fill
JDBC Connection [HikariProxyConnection@2102562039 wrapping com.mysql.cj.jdbc.ConnectionImpl@3d9f5016] will not be managed by Spring
==>  Preparing: UPDATE user SET name=?, age=?, email=?, gmt_create=?, gmt_modified=?, version=? WHERE id=? AND version=?
==> Parameters: 蔡徐坤1(String), 18(Integer), 222@qq.com(String), 2022-06-04 10:11:34.0(Timestamp), 2022-06-04 10:54:10.292(Timestamp), 2(Integer), 1(Long), 1(Integer)
<==    Updates: 1
Closing non transactional SqlSession [org.apache.ibatis.session.defaults.DefaultSqlSession@3b98b809]
```

2）模拟多线程情况下的插队操作：

```java
@Test
void test4(){
    //线程一
    User user = userMapper.selectById(1L);
    user.setName("蔡徐坤1111");
    user.setEmail("222@qq.com");
    //线程二：插队执行
    User user2 = userMapper.selectById(1L);
    user2.setName("蔡徐坤2222");
    user2.setEmail("222@qq.com");
    userMapper.updateById(user2);

    userMapper.updateById(user);
}
```

此时打印日志：

```cmd
JDBC Connection [HikariProxyConnection@776192909 wrapping com.mysql.cj.jdbc.ConnectionImpl@3d9f5016] will not be managed by Spring
==>  Preparing: SELECT id,name,age,email,gmt_create,gmt_modified,version FROM user WHERE id=?
==> Parameters: 1(Long)
<==    Columns: id, name, age, email, gmt_create, gmt_modified, version
<==        Row: 1, 蔡徐坤1, 18, 222@qq.com, 2022-06-04 10:11:34, 2022-06-04 10:54:10, 2
<==      Total: 1
Closing non transactional SqlSession [org.apache.ibatis.session.defaults.DefaultSqlSession@662e682a]
Creating a new SqlSession
SqlSession [org.apache.ibatis.session.defaults.DefaultSqlSession@2fd72332] was not registered for synchronization because synchronization is not active
2022-06-04 10:58:20.814  INFO 8628 --- [           main] com.example.handler.MyMetaObjectHandler  : start update fill
JDBC Connection [HikariProxyConnection@2122225197 wrapping com.mysql.cj.jdbc.ConnectionImpl@3d9f5016] will not be managed by Spring
==>  Preparing: UPDATE user SET name=?, age=?, email=?, gmt_create=?, gmt_modified=?, version=? WHERE id=? AND version=?
==> Parameters: 蔡徐坤2222(String), 18(Integer), 222@qq.com(String), 2022-06-04 10:11:34.0(Timestamp), 2022-06-04 10:58:20.814(Timestamp), 3(Integer), 1(Long), 2(Integer)
<==    Updates: 1
Closing non transactional SqlSession [org.apache.ibatis.session.defaults.DefaultSqlSession@2fd72332]
Creating a new SqlSession
SqlSession [org.apache.ibatis.session.defaults.DefaultSqlSession@484149eb] was not registered for synchronization because synchronization is not active
2022-06-04 10:58:20.836  INFO 8628 --- [           main] com.example.handler.MyMetaObjectHandler  : start update fill
JDBC Connection [HikariProxyConnection@348209600 wrapping com.mysql.cj.jdbc.ConnectionImpl@3d9f5016] will not be managed by Spring
==>  Preparing: UPDATE user SET name=?, age=?, email=?, gmt_create=?, gmt_modified=?, version=? WHERE id=? AND version=?
==> Parameters: 蔡徐坤1111(String), 18(Integer), 222@qq.com(String), 2022-06-04 10:11:34.0(Timestamp), 2022-06-04 10:58:20.836(Timestamp), 3(Integer), 1(Long), 2(Integer)
<==    Updates: 0
Closing non transactional SqlSession [org.apache.ibatis.session.defaults.DefaultSqlSession@484149eb]
```

发现，第一个由于插队线程执行，导致 version 变化，从而更新失败。

## 分页插件

分页的方式：

1）limit 分页

2）pageHelper 第三方插件

3）`MP 内置了分页插件`。

具体如何使用呢？老版本需要配置拦截器组件：分页插件，但`新版本已经可以直接使用 Page 对象即可`。

```java
@Test
void testPage(){
    Page<User> page = new Page<>(1, 5);
    userMapper.selectPage(page, null);
    List<User> users = page.getRecords();
    
    for (User user : users) {
        System.out.println(user);
    }
}
```

底层还是使用的 limit 插件。同时此 page 对象还封装了很多分页的信息（总数、上一页、下一页等），都可以直接使用。

## 逻辑删除

​		逻辑删除是为了方便数据恢复和保护数据本身价值等等的一种方案，但实际就是删除，不过是通过一个`标志位`来确定删除与否。（`回收站`）

1、在数据表中增加字段：deleted（逻辑删除），设置默认值为 0。

2、实体类同步属性：deleted，同时上面增加注解 `@TableLogic`

```java
@TableLogic
private int deleted;
```

3、配置文件配置，当 配置 logic-delete-field 后，可以不在实体类上添加注解 `@TableLogic`

```yaml
# mybatis-plus 配置
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted  # 全局逻辑删除的实体字段名(since 3.3.0,配置后可以忽略不配置步骤2)
      logic-delete-value: 1 # 逻辑已删除值(默认为 1)
      logic-not-delete-value: 0 # 逻辑未删除值(默认为 0)
```

4、测试发现，删除后，数据库中记录并没有删除，只是 deleted 字段修改为了 1。（同时也发现本质是更新操作）

​		查询时也会发现，查询不到，即`查询时会自动加上条件 deleted=0`。

# 性能分析插件

​		如何分析 sql 的性能，避免 `慢sql`呢？======> mybatis-plus 继承第三方插件 p6spy（`mp 3.1 以上版本`）

1、导入依赖：

```xml
<dependency>
    <groupId>p6spy</groupId>
    <artifactId>p6spy</artifactId>
    <version>3.9.0</version>
</dependency>
```

2、插件配置文件 `spy.properties` 配置：

```yaml
  #3.2.1以上使用
  modulelist=com.baomidou.mybatisplus.extension.p6spy.MybatisPlusLogFactory,com.p6spy.engine.outage.P6OutageFactory
  #3.2.1以下使用或者不配置
  #modulelist=com.p6spy.engine.logging.P6LogFactory,com.p6spy.engine.outage.P6OutageFactory
  # 自定义日志打印
  logMessageFormat=com.baomidou.mybatisplus.extension.p6spy.P6SpyLogger
  #日志输出到控制台
  appender=com.baomidou.mybatisplus.extension.p6spy.StdoutLogger
  # 使用日志系统记录 sql
  #appender=com.p6spy.engine.spy.appender.Slf4JLogger
  # 设置 p6spy driver 代理
  deregisterdrivers=true
  # 取消JDBC URL前缀
  useprefix=true
  # 配置记录 Log 例外,可去掉的结果集有error,info,batch,debug,statement,commit,rollback,result,resultset.
  excludecategories=info,debug,result,commit,resultset
  # 日期格式
  dateformat=yyyy-MM-dd HHss
  # 实际驱动可多个
  #driverlist=org.h2.Driver
  # 是否开启慢SQL记录
  outagedetection=true
  # 慢SQL记录标准 2 秒
  outagedetectioninterval=2
```

3、修改 springboot 全局配置文件 application.yml

```yaml
  driver-class-name: com.p6spy.engine.spy.P6SpyDriver
  url: jdbc:p6spy:mysql:///mp?useSSL=false&useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
```

​		driver-class-name 为 p6spy 提供的驱动类，rl 前缀为 jdbc:p6spy 跟着冒号为对应数据库连接地址。

> 注意：
>
> 1）打印出 sql 为null时，在 excludecategories 增加 commit。
>
> 2）批量操作不打印 sql 时，去除 excludecategories 中的 batch。
>
> 3）批量操作打印重复的问题请使用 MybatisPlusLogFactory (3.2.1新增）
>
> 4）该插件有性能损耗，不建议生产环境使用。（需要指定生效环境）

# 条件构造器

​		条件构造器：`Wrapper`，是为进行条件查询而来的封装类，通过固定的搭配来设置条件。

1、案例一：查询 name不为空，邮箱不为空的用户，年龄大于等于 20 岁。

```java
@Test
public void test1(){
    // 查询 name不为空，邮箱不为空的用户，年龄大于18岁。
    QueryWrapper<User> userQueryWrapper = new QueryWrapper<>();
    userQueryWrapper.isNotNull("name")
        .isNotNull("email")
        .ge("age", 20);
    List<User> users = userMapper.selectList(userQueryWrapper);
    users.forEach(System.out::println);
}
```

> `isNotNull`：表示设置不为 null。
>
> `ge`：表示大于。

2、案例二：查询一个用户，且 name 为 Tom。

```java
@Test
public void test2(){
    // 查询一个用户，且 name 为 Tom。
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    wrapper.eq("name", "Tom");
    userMapper.selectOne(wrapper);
}
```

> `eq`：匹配相等

3、案例三：模糊查询。

```java
@Test
public void test3(){
    // 模糊查询
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    wrapper.notLike("name", "蔡")
        .likeLeft("name", "徐") 
        .likeRight("name", "坤"); 
    List<User> users = userMapper.selectList(wrapper);
}
```

测试发现，三种模糊查询对应三种不同的操作：%蔡%, %徐, 坤%。

```cmd
JDBC Connection [HikariProxyConnection@1740571776 wrapping com.mysql.cj.jdbc.ConnectionImpl@5503de1] will not be managed by Spring
==>  Preparing: SELECT id,name,age,email,gmt_create,gmt_modified,version,deleted FROM user WHERE deleted=0 AND (name NOT LIKE ? AND name LIKE ? AND name LIKE ?)
==> Parameters: %蔡%(String), %徐(String), 坤%(String)
<==      Total: 0
Closing non transactional SqlSession [org.apache.ibatis.session.defaults.DefaultSqlSession@29ebbdf4]
```

4、案例四：使用子查询

```java
@Test
public void test4(){
    // 子查询
    QueryWrapper<User> userQueryWrapper = new QueryWrapper<>();
    // id 是在子查询中查出来的
    userQueryWrapper.inSql("id", "select id from user where id<3")
        // 递减操作
        .orderByAsc("id");
    userMapper.selectObjs(userQueryWrapper);
}
```

5、还有很多其他的操作。
