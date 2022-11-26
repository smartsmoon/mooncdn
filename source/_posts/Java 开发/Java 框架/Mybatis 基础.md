---
title: Mybatis 使用初探
date: 2021-02-21 00:00:00
type:
comments:
tags: 
  - 数据库
  - Mybatis
  - SSM 框架
categories: 
  - Java 开发
description: 
keywords: Mybatis
cover: https://w.wallhaven.cc/full/8o/wallhaven-8o2d8k.png
top_img: https://w.wallhaven.cc/full/8o/wallhaven-8o2d8k.png
---

# Mybatis 初识

## Mybatis 

​		数据持久化：将程序的数据在 特久状态 和 瞬时状态 转化的过程。

​		Mybatis：持久层框架，免除了几乎所有的 JDBC 代码以及设置参数和获取结果集的工作。通过简单的 `XML 或 注解` 来配置和映射原始类型、接口 和 Java POJO（Plain Old Java Objects，普通老式 Java 对象）为数据库中的记录。

1）简单，灵活。

2）sql 和代码实现分离，提高了可维护性。

3）提供映射标签，支持对象与数据库的 ORM 字段关系映射。

4）提供对象关系映射标签，支持对象关系组建维护。

5）提供 xml 标签，支持编写` 动态 sql`。

## Mybatis 初识

1、搭建一个 maven 环境项目，创建测试数据库，在 pom 文件中引入 Mybatis 依赖 、MySQL 连接依赖 和 lombok 依赖（用于简单操作实体类）。

1）创建数据库表：

```sql
# 创建数据库
create database mybatis;
# 使用数据库
use mybatis;
# 创建数据表
create table user(
	id int(20) not null PRIMARY KEY,
	name varchar(30) default null,
	password varchar(30) default null
)ENGINE=INNODB DEFAULT CHARSET=utf8;
# 插入测试数据
insert into user(id,name,password) values(1,'管理员','123456'),(2,'普通员工','999999');
```

2）搭建 maven 项目，导入依赖，同时配置`资源的取消拦截`：`pom.xml`

```xml
<dependencies>
    <!-- mybatis 依赖包-->
    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis</artifactId>
        <version>3.5.6</version>
    </dependency>
    <!--  mysql 连接驱动依赖-->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.27</version>
    </dependency>
    <!--  lombok 处理依赖-->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.24</version>
    </dependency>
</dependencies>

<build>
    <!-- resource 目录尽量配置上，可以解决后续的资源导出的问题 -->
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <includes>
                <include>**/*.properties</include>
                <include>**/*.xml</include>
            </includes>
        </resource>
        <resource>
            <directory>src/main/java</directory>
            <includes>
                <include>**/*.properties</include>
                <include>**/*.xml</include>
            </includes>
            <!-- 禁止过滤这些文件-->
            <filtering>false</filtering>
        </resource>
    </resources>
    </build>
</build>
```

2、使用 Mybatis 的第一步就是编写 Mybatis 的核心配置文件：`mybatis-config.xml`。（resources 目录）

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <!-- 此处的 & 符号不能直接写，需要进行转义：" &amp; " -->
                <property name="url" value="url=jdbc:mysql://localhost:3306/mybatis?useSSL=true&amp;useUnicode=true&amp;characterEncoding=utf-8&amp;serverTimezone=Asia/Shanghai
"/>
                <property name="username" value="root"/>
                <property name="password" value="123456"/>
            </dataSource>
        </environment>
    </environments>
<!-- 每一个 Mapper.xml 都需要在 mybatis 核心配置文件中进行注册！-->
    <mappers>
        <mapper resource="com/example/dao/mapper/UserDaoMapper.xml"/>
    </mappers>
</configuration>
```

> 注意`注册 Mapper.xml `：是配置 mapper 映射地址（必须配置），需要对应到具体的 mapper 文件。

3、创建对应的实体类 User，用于测试显示：

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class User {
    private int id;
    private String username;
    private String password;
}
```

4、由于需要手动加载 配置文件mybatis-config.xml，但是又不想重复进行初始化，因此封装成一个工具类（`重要的第二步`）：MybatisUtils

​		由于 mybatis 核心类是 `sqlSession`，相当于之前 JDBC 里面的 connection 对象 和 PrepareStatement，对数据库进行各种操作，而 sqlSession 对象是工厂模式创建的，这是一段固定的代码，目的就是获取 `sqlession`对象。

```java
public class MybatisUtils {
    private static SqlSessionFactory sqlSessionFactory;

    static {
        InputStream resourceAsStream = null;
        try{
            String mybatisResources = "mybatis-config.xml";
            resourceAsStream = Resources.getResourceAsStream(mybatisResources);
            //通过创建者模式创建 sqlSession 工厂
            sqlSessionFactory = new SqlSessionFactoryBuilder().build(resourceAsStream);
        }catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                resourceAsStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    //通过初始化的 sqlSessionFactory 来创建对应的 sqlSession 实例:sqlSession 里面包含了面向数据库执行 SQL 语句的所有方法。
    public static SqlSession getSqlSession(){
        return sqlSessionFactory.openSession();
    }
}
```

5、编写接口：UserDao，和之前操作一样。

```java
public interface UserDao {
    List<User> getUserList();
}
```

6、编写 dao 接口的实现类，以前是 UserDaoImpl，现在转变为一个 Mapper.xml 配置文件：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.dao.UserDao">
    <select id="getUserList" resultType="com.example.pojo.User">
        select * from user
    </select>
</mapper>
```

1）namespace 绑定一个对应的 Dao/Mapper 接口。

2）id 相当于重写方法的名字，这里是重写方法，当实现一个接口的时候以前是需要重写方法的。

3）resultType 表示返回类型，当为自己定义的对象时，需要些 `全限定类名`。

7、测试代码编写：按照行业一般要求，`测试文件夹一般保持和源代码文件夹同步`：com.example.dao.UserDaoTest（注意导入 junit 测试组件，`去掉作用范围scope`）

```java
public class UserDaoTest {
    @Test
    public void test(){
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        UserDao userDao = sqlSession.getMapper(UserDao.class);
        List<User> userList = userDao.getUserList();
        for (User user : userList) {
            System.out.println(user);
        }
        sqlSession.close();
    }
}
```

## Mybatis 原理核心类

1、Mybatis 提供的全部特性都可以利用基于 XML 的映射语言来实现，也可以通过注解（暂不了解）。

2、Mybatis 连接数据库进行操作主要依赖 `sqlSession` 类，而 sqlSession 类是通过工厂模式，利用 `sqlSessionFactory` 创建出来的，sqlSessionFactory 又是利用创建者模式通过 `sqlSessionFactoryBuilder` 创建出来的。

​	1）sqlSessionFactoryBuilder 对象：一旦创建 sqlSessionFactory 工厂后，就不再需要，因此可以放在工具类的方法中进行使用，用完就释放。

​	2）sqlSessionFactory 对象：一旦被创建出来，就在运行期间一直存在，也不会再额外重复创建另一个，因此推荐使用单例模式创建。

​	3）sqlSession 对象：不是线程安全的，不能被共享，建议使用时手动加 try ，并在 finally 里面进行释放（实践中不会这样）。

## 使用问题

​		在上面的代码中可能会出现一些问题：

1、抛异常：绑定异常 `BindingException`。

```cmd
org.apache.ibatis.binding.BindingException: Type interface com.example.dao.UserDao is not known to the MapperRegistry.
```

这种问题的出现是由于，mapper 并没有在配置文件中进行注册，需要在 mybatis-config.xml 加上注册：

```xml
<mappers>
    <mapper resource="com/example/dao/mapper/UserDaoMapper.xml"/>
</mappers>
```

2、在绑定后，可能并没有解决问题，仍然抛出错误：`ExceptionInInitializerError`。

```cmd
java.lang.ExceptionInInitializerError
	at com.example.dao.DaoTest01.test(DaoTest01.java:13)
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	......
Caused by: org.apache.ibatis.exceptions.PersistenceException: 
### Error building SqlSession.
### The error may exist in com/example/dao/mapper/UserDaoMapper.xml
### Cause: org.apache.ibatis.builder.BuilderException: Error parsing SQL Mapper Configuration. Cause: java.io.IOException: Could not find resource com/example/dao/mapper/UserDaoMapper.xml
	
```

​		这种问题的出现是由于`找不到 对应的 mapper 文件`导致的 <======== 这是由于 java 文件下编译的静态资源（xml、properties 配置文件）编译时，并没有进入 编译后的 classes 目录，此时解决办法有：

1）手动将 mapper.xml 文件复制到 classes 对应目录下（每次都得复制）。

2）最有办法是在 pom 文件中设置，让 静态资源通过编译一起打包到 编译文件 中：（Maven 导出资源问题）

```xml
<build>
    <!-- resource 目录尽量配置上，可以解决后续的资源导出的问题 -->
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <includes>
                <include>**/*.properties</include>
                <include>**/*.xml</include>
            </includes>
        </resource>
        <resource>
            <directory>src/main/java</directory>
            <includes>
                <include>**/*.properties</include>
                <include>**/*.xml</include>
            </includes>
            <!-- 禁止过滤这些文件-->
            <filtering>false</filtering>
        </resource>
    </resources>
</build>
```

3、`mapper 和 dao 方法名需对应`、返回类型需要一致。

4、如果出现 `resources 下的文件无法找到`，例如 mybais-config.xml 文件无法找到，首先检查编译后的 classes 目录下有没有这个文件，如果没有说明没有参与编译，可以从以下几个方面排错：

```cmd
Exception in thread "main" java.io.IOException: Could not find resource mybatis-config.xml 
```

​	1）检查 resources 目录是否设置为 `Resources` 目录类型。

​	2）检查 pom 文件中的 maven `静态资源导出`配置。

## CRUD 操作

1、namespace ：包名要和 dao 接口的包名一致。

2、id ：对应的 namespace 中的具体的方法名。（绑定）

3、resultType：返回值类型。

4、parameterType：参数类型。

CRUD 测试例子：分别对 1）根据 id 查询用户；2）插入用户；3）修改用户；4）删除用户 四个方面进行测试。

UserDao：

```java
public interface UserDao {
    //根据 id 查询用户
    User getUserById(int id);

    //新增用户
    int insertUser(User user);

    //根据 id 修改用户
    int updateUser(User user);

    //根据 id 删除用户
    int deleteUser(int id);
}
```

UserDaoMapper：注意`insert、update、delete 操作没有返回值设置（但实际上是返回 int 类型）`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.dao.UserDao">
    <select id="getUserById" resultType="com.example.pojo.User" parameterType="int">
        select * from user where id=#{id}
    </select>
    <insert id="insertUser" parameterType="com.example.pojo.User">
        insert into user(id, name, password) values(#{id}, #{name}, #{password})
    </insert>
    <update id="updateUser" parameterType="com.example.pojo.User">
        update user set name=#{name},password=#{password} where id=#{id}
    </update>
    <delete id="deleteUser" parameterType="int">
        delete from user where id=#{id}
    </delete>
</mapper>
```

UserDaoTest：注意`增删改查需要事务提交（mybatis 不用关闭自动提交，本身就需要提交事务）`。

```java
public class UserDaoTest {
    @Test
    public void test(){
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        UserDao mapper = sqlSession.getMapper(UserDao.class);
        //根据 id 查询用户
        User user = mapper.getUserById(1);
        System.out.println(user);

        //新增用户（需要增加事务设置）
        int admin = mapper.insertUser(new User(10, "admin", "222222"));
        System.out.println(admin > 0 ? "新增成功" : "新增失败");

        //根据 id 修改用户（需要增加事务设置）
        int updateUser = mapper.updateUser(new User(1, "好嗨哟", "000000"));
        System.out.println(admin > 0 ? "修改成功" : "修改失败");

        //根据 id 删除用户（需要增加事务设置）
        int deleteUser = mapper.deleteUser(2);
        System.out.println(admin > 0 ? "删除成功" : "删除失败");

        sqlSession.commit();
        sqlSession.close();
    }
}
```

结果展示：

```cmd
User(id=1, name=管理员, password=123456)
新增成功
修改成功
删除成功
```

## 万能 Map

当 实例对象（User）字段过多时，应该考虑使用 map。重点：`key 和 数据库中的 key 对应`。`修改添加`功能使用的比较多。（不正规，但是用的多）

使用一个示例进行测试：

UserDao：

```java
//万能 map 测试：新增用户
int addUserByMap(Map<String, Object> map);
```

UserDaoMapper：

```xml
<insert id="addUserByMap" parameterType="map">
    insert into user (id, password) values(#{userId}, #{userPassword})
</insert>
```

测试：此种操作插入到数据库时，不填写 name 属性也可插入（前提是 name 属性允许为空）。

```java
public class UserDaoTest02 {
    @Test
    public void test(){
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        UserDao userDao = sqlSession.getMapper(UserDao.class);
        Map<String, Object> map = new HashMap<>();
        map.put("userId", 999);
        map.put("userPassword", "777777");
        int user = userDao.addUserByMap(map);
        System.out.println(user > 0 ? "插入成功" : "插入失败");
        sqlSession.commit();
        sqlSession.close();
    }
}
```

总结：

1）Map 传递参数时，只需要 mapper 文件参数的键与 map 中对应即可，不需要严格匹配字段名，sql 会直接从 map 中取值。

2）实体类对象作为参数传递时，需要字段严格对应（不取别名和设置情况下），sql 会直接从对象的属性中取值。

3）当参数只有一个基本类型时，sql 中可以不规定 paramterType。

## 模糊查询

模糊查询需要使用 通配符%。

1）直接在 sql 语句进行拼接(通配符直接写在 sql 语句里面)：会有 sql注入 问题。

```xml
<select id="getUserLike" resultType="com.example.pojo.User">
    select * from user where name like "%"#{value}"%"
</select>
```

2）如果使用参数传递 %，则不会出现 sql 注入，因为 sql 语句已经预编译了。

```java
<select id="getUserLike" resultType="com.example.pojo.User">
    select * from user where name like #{value}
</select>
```

测试时使用：

```java
List<User> users = userDao.getUserLike("%张%");
```

# Mybatis 配置解析

## 核心配置文件

`mybatis-config.xml`：MyBatis 的配置文件包含了会深深影响 MyBatis 行为的设置和属性信息。

1、环境配置：`environments`

1）MyBatis 可以配置成适应多种环境，但每个 SqlSessionFactory 实例只能选择一种环境：通过 default 属性指定环境。

2）Mybatis默认的事务管理器就是 JDBC，连接池：POOLED。

	- 事务管理器：JDBC （默认）和 MANAGED（没什么用）====> 使用 spring 时，不需要配置这些，因为 spring 会是使用自带的管理器覆盖这些配置。
	- 数据源：UNPOOLED（无池，用完回收）、POOLED（连接池）和 JNID。

2、属性：`properties`

​		配置文件可以通过 properties 属性来实现引用配置文件，这些属性都是可外部配置且可动态替换的，既可以在典型的 Java 属性文件（jdbc.properties）中配置，亦可通过 properties 元素的子元素来传递。（`数据库配置信息单独文件配置，核心配置文件进行引用`）

1）编写配置文件：jdbc.properties

```properties
driver=com.mysql.cj.jdbc.Driver
url=jdbc:mysql://localhost:3306/mybatis?useSSL=true&amp;useUnicode=true&amp;characterEncoding=utf-8&amp;serverTimezone=Asia/Shanghai
username=root
password=123456
```

2）在核心配置文件中通过 properties 属性引入 （注意： xml 中的标签具有一定的顺序，properties 必须放在最前面）。

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <!--  引入外部 jdbc.properties 配置文件-->
    <properties resource="jdbc.properties"></properties>
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <!-- 使用 jdbc.properties 配置文件中的数据库连接信息-->
                <property name="driver" value="${driver}"/>
                <property name="url" value="${url}"/>
                <property name="username" value="${username}"/>
                <property name="password" value="${password}"/>
            </dataSource>
        </environment>
    </environments>
    <mappers>
        <mapper resource="com/example/dao/mapper/UserDaoMapper.xml"/>
    </mappers>
</configuration>
```

引入方式一：全部使用配置文件内容。

```xml
<properties resource="jdbc.properties"></properties>
```

引入方式二：使用配置文件，同时增加新的属性。（用的不多）

```xml
<properties>
    <property name="username" value="root"/>
    <property name="password" value="111111"/>
</properties>
```

如果两个文件（核心配置文件和 jdbc 配置文件）有同一个字段，优先使用`外部配置文件（jdbc 配置文件）`的！

3、类型别名：`typeAliases`

类型别名是为 Java 类型设置一个短的名字，目的在于用来`减少类的完全限定名的冗余`。（例如查询语句的参数类型需要写：`com.example.pojo.User`）

```xml
<!-- 给实体类设置别名-->
<typeAliases>
    <typeAlias type="com.example.pojo.User" alias="User"></typeAlias>
</typeAliases>
```

设置别名后，查询语句可以直接使用 alias 属性值中的别名。

```xml
<select id="getUser" resultType="User">
    select * from user 
</select>
```

​		同时还可以直接指定一个包， Mybatis 会在包名下搜索需要的 JavaBean，会为他们设置默认的别名：就是这个类的`类名首字母小写`（user 或 User：实际上大写也可以，官方推荐写小写）。com.example.pojo.User  ======> user 或  User

```xml
<package name="com.example.pojo"/>
```

​		但是这种指定包的方式，无法自定义别名，但是可以通过`注解起别名`：（需要先指定包）

```java
@Alias("UserAlias")
```

> 默认的别名设置：
>
> 1）基本类型在前面加 _ 就是别名，例如 int 别名就是 _int ，double 别名就是 _double。
>
> 2）包装类基本类型首字母小写就是别名，例如 Integer 别名就是 int，Double 别名就是 double，Map 别名为 map，List 别名为 list。
>
> 3）ResultSet 别名为 ResultSet 。

4、设置：`setting`

​		MyBatis 中极为重要的调整设置，它们会改变 MyBatis 的运行时行为。（spring 之后就不使用了）

5、其他配置：

1）typeHandlers（类型处理器）

2）objectFactory（对象工厂）

3）plugins（插件）：例如 mybatis-plus。

6、映射器：`mappers`

MapperRegistry：`注册绑定`我们的 Mapper 文件（dao）。

1）方式一：使用相对于类路径的资源引用进行绑定。（之前的方法，使用` resource `）

```xml
<mappers>
    <mapper resource="com/example/dao/mapper/UserDaoMapper.xml"/>
</mappers>
```

`Mapper.xml 配置文件可以放在 resources `等任意目录下，但是放在 resources 目录下时`建议同包同级`。

2）方式二：使用完全限定资源定位符·`url `来绑定（`不用`）。

3）方式三：使用映射器接口实现类的完全限定类名绑定。（使用` class `）

```xml
<mappers>
    <mapper class="com.example.dao.UserDao"></mapper>
</mappers>
```

这种方法可能会有问题（绑定异常 BindingException），需要注意几个点：

- `接口 和对应的 Mapper.xml 配置文件必须同名`，例如：UserMapper.inteface 和 UserMapper.xml 。
- 接口 和对应的 Mapper.xml 配置文件必须在`同一个包`下。

4）方式四：使用 `package` 可以将包内的映射接口实现全部注册到映射器。

```xml
<mappers>
    <package name="com.example.dao"/>
</mappers>
```

`此种方式注意点和方式三相同`，因此推荐使用方式一进行注册。

=====》 `约定大于配置！`

## 生命周期和作用域

​		生命周期是至关重要的，因为错误的使用会导致非常严重的`并发问题`。

![image-20220314202318028](https://img-blog.csdnimg.cn/img_convert/e410ace48672740c872f7406c5c4b2c7.png)

1）SqlSessionFactoryBuilder：创建了SqlSessionFactory，就不再需要它了。=====> `局部变量`

2）SqlSessionFactory：可以想象为`数据库连接池`，一旦被创建就应该在应用的运行期间一直存在，没有任何理由丢弃它或重新创建另一个实例，因此SqlSessionFactory 的最佳作用域是`应用作用域`，使用单例模式或者静态单例模式创建。

3）SqlSession：可以想象为`连接到连接池的一个请求`，SqlSession的实例不是线程安全的，因此是不能被共享的，所以它的最佳的作用域是`请求或方法作用域`，用完之后需要赶紧关闭，否则资源被占用，造成浪费。

> 举例：
>
> SqlSessionFactoryBuilder 放在一个方法中作为`局部变量`使用，用完回收。
>
> SqlSessionFactory 应用运行期间一直存在，`保证连接`，同时也只需要一个。
>
> SqlSession 在 web 运行期间放在一个和 http 请求共同的作用域，有请求就创建一个，`用完马上关闭`。 

## ResultMap

ResultMap：结果集映射，用于`解决属性名和字段名不一致的问题`。

问题：属性名和字段名不一致怎么办？例如数据库中字段 name，但是实体类设置属性名为 username。

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class User {
    private int id;
    private String username;
    private String password;
}
```

​		以  根据 id 查询用户  为例：当执行查询语句时，获得的字段是：id、name、password，但实体类没有对应的属性 name，因此`类型处理器`无法自动将数据装填到 对应的属性上，导致查询出来的结果中 name 属性为 `null`。

解决办法：

1）对数据库查询字段`起别名`：

```xml
<select id="getUserById" parameterType="int" resultType="com.example.pojo.User">
    select id,name as username,password from user where id =#{id}
</select>
```

2）使用 resultMap 进行`结果集映射`：先注册 map，再使用 map。

```xml
<!--结果集映射：注册 map-->
<resultMap id="UserMap" type="User">
    <!--property 对应实体类的属性，column对应数据库的字段-->
    <result  column="id" property="id"></result>
    <result  column="name" property="username"></result>
    <result  column="password" property="password"></result>
</resultMap>
<!--结果集映射：使用 map-->
<select id="getUserByIdTest" resultMap="UserMap">
    select * from user where id=#{id}
</select>
```

### 简单使用

​		`resultMap`元素是 MyBatis 中最重要最强大的元素。

- resultMap 的设计思想是：对于简单的语句根本不需要配置显式的结果映射，而对于复杂一点的语句只需要描述它们的关系就行了。

- resultMap 对于字段和属性一致时，不需要显式的用到它。因此上面的映射关系可以简化：

- ```xml
  <resultMap id="UserMap" type="User">
      <result  column="name" property="username"></result>
  </resultMap>
  ```

### 复杂使用

​		resultMap 复杂使用和表之间的对应关系有关：一对一、一对多、多对一。`在关联关系部分描述`。

# 日志

​		如果数据库操作出现了异常，我们需要`排错`，日志就是最好的助手。（之前使用 sout 和 debug，但具体的 sql 难以看到）=====》 mybatis 的日志工厂。

setting 属性中，有一个关键配置：`logImpl`，就是日志工厂配置，是指 mybatis 的日志的具体实现，未指定时将自动查找。

可选项：SLF4J、`LOG4J（掌握）`、LOG4J2、JDK_LOGGING、COMMONS_LOGGING、STDOUT_LOGGING（默认）、NO_LOGGING。

## STDOUT_LOGGING

​		STDOUT_LOGGING：标准日志输出。

```xml
<settings>
    <setting name="logImpl" value="STDOUT_LOGGING"/>
</settings>
```

![image-20220315094204966](https://img-blog.csdnimg.cn/img_convert/b688c6ab4f4e1d0594a7e51ff1a63070.png)

## LOG4J 日志

​		Log4j：可以定义每一条日志信息的级别，我们能够更加细致地控制日志的生成过程，但是`需要一个配置文件`来进行配置，而不需要修改应用的代码。

1、导入 Log4j 的依赖包：不导入依赖包则会抛出异常（ClassNotFoundException:org.apache.log4j.Priority）

```xml
<!-- https://mvnrepository.com/artifact/log4j/log4j -->
<dependency>
    <groupId>log4j</groupId>
    <artifactId>log4j</artifactId>
    <version>1.2.17</version>
</dependency>
```

2、Mybatis 核心配置文件设置：

```xml
<settings>
    <setting name="logImpl" value="LOG4J"/>
</settings>
```

3、复制 Log4j 配置文件 log4j.properties 到项目结构：

```properties
#将等级为DEBUG的日志信息输出到console和file这两个目的地，console和file的定义在下面的代码
log4j.rootLogger=DEBUG,console,file

#控制台输出的相关设置
log4j.appender.console = org.apache.log4j.ConsoleAppender
log4j.appender.console.Target = System.out
log4j.appender.console.Threshold=DEBUG
log4j.appender.console.layout = org.apache.log4j.PatternLayout
log4j.appender.console.layout.ConversionPattern=[%c]-%m%n

# 文件输出的相关设置
log4j.appender.file = org.apache.log4j.RollingFileAppender
log4j.appender.file.File=./log/kuang.log
log4j.appender.file.MaxFileSize=10mb
log4j.appender.file.Threshold=DEBUG
log4j.appender.file.layout=org.apache.log4j.PatternLayout
log4j.appender.file.layout.ConversionPattern=[%p][%d{yy-MM-dd}][%c]%m%n

# 日志输出级别
log4j.logger.org.mybatis=DEBUG
log4j.logger.java.sql=DEBUG
log4j.logger.java.sql.Statement=DEBUG
log4j.logger.java.sql.ResultSet=DEBUG
log4j.logger.java.sql.PreparedStatement=DEBUG
```

此时直接进行查询，sql 日志就已经可以出来，但如果需要打印指定日志，就需要几个步骤：

1）在要使用 Log4j 的类中，导入包 `import org.apache.log4j.Logger` ，创建 logger 对象（参数为当前类的 class 对象）。

```java
static Logger logger = Logger.getLogger(UserDaoTest.class);
```

2）根据不同日志级别设置日志输出：

```java
logger.info("info:进入了 testLog4j");
logger.debug("debug:进入了 testLog4j");
logger.error("error:进入了 testLog4j");
```

3、配置文件配置 log 文件存放目录后，日志文件会保留，可后续查看。

```java
public class DaoTest01 {
    static Logger logger = Logger.getLogger(DaoTest01.class);

    @Test
    public void test(){
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        UserDao userDao = sqlSession.getMapper(UserDao.class);
        List<User> userList = userDao.getUserList();
        logger.info("info:进入 test 函数");
        logger.debug("debug:进入 test 函数");
        logger.error("error:进入 test 函数");
        for (User user : userList) {
            System.out.println(user);
        }
        sqlSession.close();
    }
}
```

# 分页

分页的目的：减少数据的处理量，使用 limit 。

## Limit 分页

UserDao 接口：使用万能 map 传递分页参数（起始下标，页面大小）

```java
//分页
List<User> getUserByLimit(Map<String, Integer> pageMap);
```

UserDaoMapper.xml 实现：

```xml
<select id="getUserByLimit" resultType="User" parameterType="map">
    select * from user limit #{startIndex},#{pageSize}
</select>
```

测试：

```java
@Test
public void test(){
    SqlSession sqlSession = MybatisUtils.getSqlSession();
    UserDao mapper = sqlSession.getMapper(UserDao.class);
    Map<String, Integer> paramsMap = new HashMap<>();
    paramsMap.put("startIndex", 0); 	//sql 分页下标从 0 开始
    paramsMap.put("pageSize",2);
    List<User> users = mapper.getUserByLimit(paramsMap);
    for (User user : users) {
        System.out.println(user);
    }
}
```

## RowBounds 分页

RowBounds 分页：是通过 java 代码手动实现分页，`不建议开发中使用`，了解即可。（利用 sqlSession 的 selectList 方法查询时赋予参数）

```java
@Test
public void test1(){
    SqlSession sqlSession = MybatisUtils.getSqlSession();
    UserDao mapper = sqlSession.getMapper(UserDao.class);
    //RowBounds 利用代码实现分页，下标从 0 开始
    RowBounds rowBounds = new RowBounds(0, 2);
    //利用 sqlSession 查询所有数据同时，利用 RowBounds 分页
    List<User> users = sqlSession.selectList("com.example.dao.UserDao.getUserList", null, rowBounds);
    for (User user : users) {
        System.out.println(user);
    }
    sqlSession.close();
}
```

## 插件分页

Mybatis 官方有一种分页插件：`PageHelper`，可以优雅的实现分页。`参见官网文档`： https://pagehelper.github.io/docs/howtouse/ 

# 注解开发

> 面向接口编程：真正的开发中，会选择面向接口编程：目的就是 `解耦，可拓展，提高复用`，规范性更好。
>
> ​		在一个面向对象的系统中，系统的各种功能是由许许多多的不同对象协作完成的。在这种情况下，各个对象内部是如何实现自己的，对系统设计人员来说并不重要，重要的是：`各个对象之间的协作关系`。

​		对于映射器而言，还可以使用注解的方式处理映射，他们映射的语句不用 xml 配置，而是用 Java 注解来配置。但是对于复杂的语句来说，还是应该使用 xml 配置来映射语句。当然，这两种方式可以同时使用。

1、创建新项目，使用注解开发。

2、开发 UserMapper 接口：

```java
public interface UserMapper {
    @Select("select * from user")
    List<User> getUserList();
}
```

3、配置文件注册 UserMapper 接口：

```xml
<!-- 使用注解开发需要绑定接口（实际上相当于还是绑定 xml 配置文件）-->
<mappers>
	<mapper class="com.example.dao.UserMapper"></mapper>
</mappers>
```

4、进行测试，测试结果发现：username 为 null，是由于 User 属性和 数据库字段不相同导致，但是此时又没有 xml 文件，无法进行 resultMap 映射，因此注解只是适用于在简单的开发时使用。

```cmd
User(id=1, username=null, password=000000)
User(id=10, username=null, password=222222)
User(id=111, username=null, password=777777)
User(id=999, username=null, password=777777)
```

> 注解为什么能实现？
>
> 通过反射机制实现，通过 SqlSession 对象，拿到 UserMapper 的` Class 对象 `，就拿到了 UserMapper 的所有方法，就可以直接使用了。
>
> 底层使用的是动态代理。

`Mybatis 的执行流程分析：`

> 1、Resources 对象获取并加载 Mybatis 全局配置文件。
>
> 2、实例化 SqlSessionFactoryBuilder 构造器。
>
> 3、SqlSessionFactoryBuilder  对象通过 XMLConfigBuilder 对象解析配置文件流（build 方法），将所有`配置文件文件信息放入 Configuration 类`。
>
> 4、实例化 SqlSessionFactory 对象，创建出 `transactional 事务管理器`，同时创建出了执行器 `executor`（核心）。
>
> 5、创建` SqlSession `对象，用来实现 crud 操作，同时此处也会有事务问题，就由 transactional 事务管理器处理：操作成功则提交事务，操作失败则回滚事务。
>
> 6、关闭 SqlSession 对象，释放 SqlSessionFactory 连接。

注解的 CRUD 操作：

​		增删改有一个重要关注点就是：事务处理，但是默认是关闭自动提交的，可以在创建 SqlSession 时开启自动提交。

```java
sqlSessionFactory.openSession(true);
```

1、查询操作：

UserMapper 接口：由于属性和字段不一致，有没有 xml 配置文件，只能采用别名的方式查询。

```java
public interface UserMapper {
   //根据 id 查询 User
    @Select("select id, name as username, password from user where id=#{id}")
    User getUserById(int id);

    //根据 id 和 name 查询 User：当方法存在多个参数时，所有的参数必须加上 @Param("") 注解
    @Select("select id, name as username, password from user where id=#{id} and name=#{username}")
    User getUserByIdAndName(@Param("id") int id, @Param("username") String username);
}
```

需要注意：当参数为一个时，可以不使用 @param 注解，但是`超过一个参数就必须使用 @param 注解`进行匹配。

2、插入、更新、删除操作：

UserMapper 接口：注意这里不一致时，写的是`实体类里面的属性名`。

```java
@Insert("insert into user(id, name, password) values(#{id}, #{username}, #{password})")
int insertUser(User user);

@Update("update user set name=#{username},password=#{password} where id=#{id}")
int updateUser(User user);

@Delete("delete from user where id=#{id}")
int deleteUser(int id);
```

测试代码：

```java
@Test
public void test1(){
    SqlSession sqlSession = MybatisUtils.getSqlSession();
    UserMapper mapper = sqlSession.getMapper(UserMapper.class);
    User userById = mapper.getUserById(1);
    User user2 = mapper.getUserByIdAndName(999, "张三");
    System.out.println(userById);
    System.out.println(user2);
    sqlSession.close();
}

@Test
public void test2(){
    SqlSession sqlSession = MybatisUtils.getSqlSession();
    UserMapper mapper = sqlSession.getMapper(UserMapper.class);
    int insertUser = mapper.insertUser(new User(55, "月月", "123456"));
    System.out.println(insertUser > 0 ? "插入成功" : "插入失败");
    sqlSession.close();
}

@Test
public void test3(){
    SqlSession sqlSession = MybatisUtils.getSqlSession();
    UserMapper mapper = sqlSession.getMapper(UserMapper.class);
    int updateUser = mapper.updateUser(new User(1, "王玥月", "22222222"));
    System.out.println(updateUser > 0 ? "更新成功" : "更新失败");
    sqlSession.close();
}

@Test
public void test4(){
    SqlSession sqlSession = MybatisUtils.getSqlSession();
    UserMapper mapper = sqlSession.getMapper(UserMapper.class);
    int deleteUser = mapper.deleteUser(999);
    System.out.println(deleteUser > 0 ? "删除成功" : "删除失败");
    sqlSession.close();
}
```

# 关联关系

以老师和学生的关系比喻：多个学生对应一个老师。

1）对于学生而言，多个学生关联一个老师。=====> `多对一`（`关联`）

2）对于老师而言，一个老师有很多学生。=======> `一对多`（`集合`）

对于这种关系，就会需要用到结果映射的复杂使用：

![image-20220317165523351](https://img-blog.csdnimg.cn/img_convert/bdc9e0ac44cb44736ff148108e5cff26.png)

创建学生表和教师表：

```sql
CREATE TABLE `teacher` (
  `id` INT(10) NOT NULL,
  `name` VARCHAR(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8

INSERT INTO teacher(`id`, `name`) VALUES (1, '秦老师'); 

CREATE TABLE `student` (
  `id` INT(10) NOT NULL,
  `name` VARCHAR(30) DEFAULT NULL,
  `tid` INT(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fktid` (`tid`),
  CONSTRAINT `fktid` FOREIGN KEY (`tid`) REFERENCES `teacher` (`id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8INSERT INTO `student` (`id`, `name`, `tid`) VALUES ('1', '小明', '1'); 
INSERT INTO `student` (`id`, `name`, `tid`) VALUES ('2', '小红', '1'); 
INSERT INTO `student` (`id`, `name`, `tid`) VALUES ('3', '小张', '1'); 
INSERT INTO `student` (`id`, `name`, `tid`) VALUES ('4', '小李', '1'); 
INSERT INTO `student` (`id`, `name`, `tid`) VALUES ('5', '小王', '1');
```

## 多对一关联

1、创建 maven 项目，导入依赖。

2、创建实体类 Student 和 Teacher。

Teacher：由于是多对一关系，暂不考虑一对多关系。

```java
@Data
public class Teacher {
    private int id;
    private String username;
}
```

Student：每个学生有个老师。

```java
@Data
public class Student {
    private int id;
    private String username;
	//学生关联到老师
    private Teacher teacher;
}
```

3、建立对应的 mapper 接口：TeacherMapper 和 StudentMapper，并建立对应的 Mapper.xml 实现文件。（mapper 文件放在 resources 目录下）

4、在核心配置文件中对 Mapper 接口进行注册，同时设置简化的别名，设置标准日志：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <!--引入 jdbc.properties 配置文件-->
    <properties resource="jdbc.properties"></properties>
    <settings>
        <setting name="logImpl" value="STDOUT_LOGGING"/>
    </settings>
    <!--设置别名-->
    <typeAliases>
        <typeAlias type="com.example.dao.StudentMapper" alias="StudentMapper"></typeAlias>
        <typeAlias type="com.example.dao.TeacherMapper" alias="TeacherMapper"></typeAlias>
    </typeAliases>
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <!-- 使用 jdbc.properties 配置文件中的数据库连接信息-->
                <property name="driver" value="${driver}"/>
                <property name="url" value="${url}"/>
                <property name="username" value="${username}"/>
                <property name="password" value="${password}"/>
            </dataSource>
        </environment>
    </environments>
    <!--注册 mapper -->
    <mappers>
        <mapper resource="mapper/TeacherMapper.xml"></mapper>
        <mapper resource="mapper/StudentMapper.xml"></mapper>
    </mappers>
</configuration>
```

5、测试程序连通性。

​		问题：查询所有学生的信息，以及对应的老师信息。`首先想到联表查询，但是联表查询 sql 语句返回值的是一些参数，但是 mybatis 设定的返回值是 对象`，因此不能用联表查询，只能用基本的查询语句。

StudentMapper 接口：

```java
List<Student> getStudentList();
```


StudentMapper.xml 实现：

```xml
<select id="getStudentList" resultType="Student">
    select * from student
</select>
```

​		测试结果发现：`每个学生的老师信息都是 null`，因为 Student 表中没有 Teacher 表中的 name 属性。

则需要修改查询的 Mapper.xml 文件：

1）查询所有学生。

2）根据查询到的学生的 tid，来寻找对应的老师信息。

```xml
<!--查询学生信息-->
<select id="getStudentList" resultType="Student">
    select * from student
</select>
<!--查询老师信息-->
<select id="getTeacher" resultType="Teacher">
    select * from teacher where id=#{id}
</select>
```

查询学生信息 和 根据 id 查询老师信息，这两个怎么联系起来呢？======> `结果集映射`

```xml
<mapper namespace="com.example.dao.StudentMapper">
    <select id="getStudentList" resultMap="StudentTeacher">
        select * from student
    </select>
    <!--结果集映射 映射到 Student 上,本质还是回到了学生的信息-->
    <resultMap id="StudentTeacher" type="Student">
        <result property="id" column="id"></result>
        <result property="name" column="name"></result>
        <!-- 复杂的属性，需要通过单独处理
                如果属性是一个对象：就使用 association （此处属性是一个对象 Teacher）
                    这个属性肯定也需要一个类型：javaType 指定为 Teacher
                    但是 tid 和 teacher 怎么关联：使用嵌套查询 ====> select 属性指定 嵌套查询语句（类似于子查询）
                如果属性是一个集合：就使用 collection
		-->
        <association property="teacher" column="tid" javaType="Teacher" select="getTeacher"></association>
    </resultMap>
    <select id="getTeacher" resultType="Teacher">
        select * from teacher where id=#{tid}
    </select>
</mapper>
```

> 这个就是`” 按照查询嵌套处理 “`：类似于子查询的过程。(子查询的参数按照规范推荐写一样，例如 tid)
>
> 如果属性是一个对象：就使用 association 处理
>
> 1）property 指定 `实体类属性`。
>
> 2）column 指定`数据库关联字段`。
>
> 3）javaType 指定子查询返回`结果类型`。
>
> 4）select 指定子查询的`查询语句`。

查询结果：

```cmd
Student(id=1, name=小明, teacher=Teacher(id=1, name=秦老师))
Student(id=2, name=小红, teacher=Teacher(id=1, name=秦老师))
Student(id=3, name=小张, teacher=Teacher(id=1, name=秦老师))
Student(id=4, name=小李, teacher=Teacher(id=1, name=秦老师))
Student(id=5, name=小王, teacher=Teacher(id=1, name=秦老师))
```

还有一种方法就是：`按照结果嵌套处理`。

StudentMapper 接口：

```java
List<Student> getStudentList2();
```


StudentMapper.xml 实现：

```xml
<!--按照结果嵌套处理：需要将查询结果进行封装对应-->
<resultMap id="StudentTeacher2" type="Student">
    <result property="id" column="sid"></result>
    <result property="name" column="sname"></result>
    <!--属性是对象，使用 association
                属性叫 teacher，在数据库字段叫 tname(同时也不完全是)，这种情况就不写 column，直接写返回值类型 Teacher-->
    <association property="teacher" javaType="Teacher">
        <!-- 进行具体对象（老师）属性的匹配-->
        <result property="name" column="tname"></result>
    </association>
</resultMap>
<select id="getStudentList2" resultMap="StudentTeacher2">
    select s.id as sid,s.name as sname,t.name as tname,t.id as tid
    from student as s,teacher as t
    where t.id=s.tid;
</select>
```

> 这个就是`” 按照结果嵌套处理 “`：类似于联表查询的过程。（`更推荐这种，子查询影响性能`）
>
> 1）先写联表查询语句，利用 ResultMap 结果集映射。
>
> 2）进行属性和字段的对应，发现有一个属性是对象，使用 association。
>
> 3） 属性叫 teacher，在数据库字段叫 tname(`同时也不完全是`)，这种情况就`不写 column`，直接写返回值类型 javaType="Teacher"。
>
> 4）再对该 对象属性进行字段匹配，匹配查询结果中的字段。

查询结果：

```cmd
Student(id=1, name=小明, teacher=Teacher(id=1, name=秦老师))
Student(id=2, name=小红, teacher=Teacher(id=1, name=秦老师))
Student(id=3, name=小张, teacher=Teacher(id=1, name=秦老师))
Student(id=4, name=小李, teacher=Teacher(id=1, name=秦老师))
Student(id=5, name=小王, teacher=Teacher(id=1, name=秦老师))
```

## 一对多集合

1、创建新 maven 项目，修改 pojo 实体类：老师角度上，老师有多个学生（集合），学生都有一个 tid。

```java
@Data
public class Teacher {
    private int id;
    private String name;

    //一个老师有多个学生
    private List<Student> students;
}
```

```java
@Data
public class Student {
    private int id;
    private String name;
    private int tid;
}
```

2、进行查询老师，发现学生属性 `students 为 null`。

提出需求：获取指定老师信息，同时包含其学生信息。

TeacherMapper 接口：

```java
Teacher getTeacherList(@Param("tid") int id);
```

按结果嵌套处理：联表查询（`子查询影响性能`）

联表查询 sql 语句：

```sql
select s.id as sid,s.name as sname, t.name as tname, t.id as tid
from student as s,teacher as t 
where s.tid=t.id and t.id=#{tid}
```

TeacherMapper 实现：

```xml
<mapper namespace="com.example.dao.TeacherMapper">
    <resultMap id="TeacherStudent" type="Teacher">
        <result property="id" column="tid"></result>
        <result property="name" column="tname"></result>
<!-- 集合使用 collection，此时指定类型是 List，但是泛型信息 Student 无法直接获取到，因此使用 ofType 获取泛型信息，collection 默认就是 list -->
        <collection property="students" ofType="Student">
            <result property="id" column="sid"></result>
            <result property="name" column="sname"></result>
            <result property="tid" column="tid"></result>
        </collection>
    </resultMap>
    <select id="getTeacher" resultMap="TeacherStudent" parameterType="_int">
        select s.id as sid,s.name as sname, t.name as tname, t.id as tid
        from student as s,teacher as t
        where s.tid=t.id and t.id=#{tid}
    </select>
</mapper>
```

结果：

```cmd
Teacher(id=1, 
	name=秦老师, 
	students=[
		Student(id=1, name=小明, tid=1), 
		Student(id=2, name=小红, tid=1), 
		Student(id=3, name=小张, tid=1), 
		Student(id=4, name=小李, tid=1), 
		Student(id=5, name=小王, tid=1)
	]
)
```

> 扩展：按照查询嵌套处理：子查询方式。
>
> sql 语句：
>
> ```sql
> select * from teacher where id = #{tid};
> select * from student where tid = 结果id;
> ```
>
> TeacherMapper 实现：
>
> ```xml
> <resultMap id="TeacherStudent" type="Teacher">
>     <result property="id" column="id"></result>
>     <result property="name" column="name"></result>
>     <!--这个地方的 column 是指自己的列名，用来做传参，相当于子查询的 连接条件-->
>     <collection property="students" javaType="ArrayList" ofType="Student" select="getStudentByTeacherId" column="id"></collection>
> </resultMap>
> <select id="getTeacher" resultMap="TeacherStudent">
>     select * from teacher where id=#{tid}
> </select>
> <select id="getStudentByTeacherId" resultType="Student">
>     select * from student where tid=#{tid}
> </select>
> ```

> javaType：用来指定实体类中的属性的类型，例如 List。
>
> ofType：用来指定映射到 List 等集合的泛型约束类型，例如 Teacher。

# 动态 SQL

动态 SQL ：根据不同的条件生成不同的 SQL 语句。

​		举例：之前的 smbms 项目中的 SQL 拼接过于繁琐，可以考虑使用动态 SQL 拜托痛苦。

主要使用四个方式实现动态 SQL：`if、choose（when、otherwise）、trim（where、set）、foreach`。

搭建环境：

1、创建数据表：blog。

```sql
CREATE TABLE `mybatis`.`blog`  (
    `id` varchar(50) NOT NULL COMMENT '博客id',
    `title` varchar(30) NOT NULL COMMENT '博客标题',
    `author` varchar(30) NOT NULL COMMENT '博客作者',
    `create_time` datetime(0) NOT NULL COMMENT '创建时间',
    `views` int(30) NOT NULL COMMENT '浏览量'
)
```

2、创建实体类：Blog。

```java
@Data
public class Blog {
    private String id;
    private String title;
    private String author;
    //注意数据库此字段名为：create_time，因此需要在配置文件设置：驼峰和下划线匹配。
    private Date createTime;
    private int views;
}
```

> 数据库下划线和字段驼峰匹配处理：在核心配置文件设置 setting 进行处理。
>
> ```xml
> <!--设置启用数据库字段下划线映射到 java 对象的驼峰式命名属性，默认为 false-->
> <setting name="mapUnderscoreToCamelCase" value="true"/>
> ```

3、id处理：企业工作中不会使用简单的数字作为 id，可以使用 uuid生成 id。

```java
public class IDUtils {
    public static String getId(){
        return UUID.randomUUID().toString().replaceAll("-", "");
    }
}
```

## SQL 标签

Sql 经常需要在对某个字段进行判断，判断`是否需要此条件`，来确定是否需要追加 sql 语句。

需求：如果传递 title ，就查询该 title 的博客，如果传递 author，就查询该作者的博客，如果什么都不传就查询所有博客。（`以前通过 sql 拼接`）

​		由于是两个参数，但不是一个同一个对象的属性，就可以使用 map 进行封装。

1、where 写死，条件用 if 追加。

BlogMapper 接口：（下面的接口在`不单独声明时都一样`）

```java
List<Blog> getBlog(Map<String, String> map);
```

BlogMapper 实现：

```xml
<select id="getBlogByIf" resultType="Blog" parameterType="map">
    select * from blog where 1=1
    <if test="title != null">
        and title=#{title}
    </if>
    <if test="author != null">
        and author=#{author}
    </if>
</select>
```

需要注意： `and` 进行连接，否则 SQL 语句会报错。但是如果不写这个 1=1，没有 title 的条件下，这个 SQL 语句也会报错：`引入 where 标签`

```sql
select * from blog where and author=#{author}
```

2、使用 where 标签：保证字符串拼接不会因为 and 或是 or 出错。

```xml
<select id="getBlogByWhere" resultType="Blog" parameterType="map">
    select * from blog
    <where>
        <if test="title != null">
            title=#{title}
        </if>
        <if test="author != null">
            and author=#{author}
        </if>
    </where>
</select>
```

> 注意：`where 元素只会在至少有一个子元素的条件返回 SQL 子句的情况下才插入 “WHERE” 子句`。（没有条件则会直接去掉 where）
>
> 若子句的开头为 “AND” 或 “OR”，where 元素会将它们去除，即：where 标签下第一个子句的 and 和 or 都会被忽略，`后面的子句仍然需要加 and。`
>
> 例如下面两句效果是一样的，且都等同于上面的效果：
>
> ```xml
> <where>
>     <if test="title != null">
>         and title=#{title}
>     </if>
>     <if test="author != null">
>         and author=#{author}
>     </if>
> </where>
> ```
>
> ```xml
> <where>
>     <if test="title != null">
>         or title=#{title}
>     </if>
>     <if test="author != null">
>         and author=#{author}
>     </if>
> </where>
> ```

3、choose 和 when 联合使用。`三个条件只会选择一个条件`，相当于` switch`，优先选择`最上面的条件`。（`和 if 有区别`）

```xml
<select id="getBlogByChoose" resultType="Blog" parameterType="map">
    select * from blog
    <where>
        <choose>
            <when test="title != null">title=#{title}</when>
            <when test="title != null">and author=#{author}</when>
            <otherwise>and views=#{views}</otherwise>
        </choose>
    </where>
</select>
```

4、set 标签：使用在更新操作上，会动态前置 set 关键字，也会删掉无关的逗号。

```java
int updateBlogById(Map<String, String> map);
```

```xml
<update id="updateBlogById" parameterType="map">
    update blog
    <set>
        <if test="title != null">
            title=#{title},
        </if>
        <if test="author != null">
            author=#{author},
        </if>
    </set>
    where id=#{id}
</update>
```

5、trim 标签：可以定制一些元素的功能。包含上面的 where 和 set。（很少用这个定制化）

```xml
<trim prefix="where" prefixOverrides="and | or">

</trim>
<trim prefix="set" suffixOverrides=",">

</trim>
```

所谓的动态 SQL，本质上还是 SQL语句，只是可以`在 SQL 层面上执行逻辑代码`。

## SQL 片段

​		将公共部分抽取出来，方便服用，这个抽取的部分就是 `sql片段`。

1）使用 sql 标签进行抽取：

```xml
<sql id="commonSql">
    <if test="title != null">
        title=#{title}
    </if>
    <if test="author != null">
        and author=#{author}
    </if>
</sql>
```

2）使用 include 标签进行导入：

```xml
<select id="getBlogByWhere" resultType="Blog" parameterType="map">
    select * from blog
    <where>
        <include refid="commonSql"></include>
    </where>
</select>
```

注意：sql 片段尽量不要存在 where 标签，只做一些简单操作的语句。

## foreach 函数

需求：查询1—3号记录的博客

BlogMapper 接口：

```java
List<Blog> queryBlogForEach(Map<String, ArrayList<String>> map);
```

BlogMapper 实现：

```xml
<select id="queryBlogForEach" resultType="Blog" parameterType="map">
    select * from blog
    <where>
        <foreach collection="ids" item="id" open="and (" close=")" separator="or">
            id=#{id}
        </foreach>
    </where>
</select>
```

测试代码：

```java
@Test
public void test5(){
    SqlSession sqlSession = MybatisUtils.getSqlSession();
    BlogMapper mapper = sqlSession.getMapper(BlogMapper.class);
    Map<String, ArrayList<String>> map = new HashMap<>();
    ArrayList<String> ids = new ArrayList<>();
    ids.add("90f8e45684364dd78958f1d4235062cc");
    map.put("ids", ids);
    mapper.queryBlogForEach(map);
    sqlSession.close();
}
```

# 缓存（了解）

前景：由于连接数据库，非常耗费资源，因此可以将查询结果暂存在内存中，这就是`缓存`。

`缓存 cache`：在内存中的临时数据，将用户经常查询的数据放在缓存（内存）中，用户去查询数据就不用从磁盘上（关系型数据库文件）查询，而是从缓存中查询，从而提高查询效率，解决了高并发系统的性能问题。

`缓存必要性`：减少和数据库的交互次数，减少系统开销，提高系统效率。

`缓存数据类型`：经常查询并且不经常改变的数据。

## Mybatis 缓存

​	MyBatis 包含一个非常强大的查询缓存特性，它可以非常方便的定制和配置缓存，缓存可以极大的提高查询效率。

MyBatis 系统中默认定义了两级缓存：一级缓存 和 二级缓存。

1）一级缓存：默认情况下，只有一级缓存开启（ `SqlSession 级别的缓存`，也叫本地缓存），就是该`方法内`有效。

2）二级缓存：二级缓存需要手动开启和配置，他是基于 `namespace` 级别的缓存。，就是该`接口`内所有方法有效。

为了提高可扩展性，MyBatis 定义了缓存接口 Cache。我们可以通过`实现 Cache 接口来定义二级缓存`。

> Mybatis 缓存的清除策略有：
>
> 1）LRU—最近最少使用：移除`最长时间`不被使用的对象。
>
> 2）FIFO—`先进先出`：按对象进入缓存的顺序移除。
>
> 3）SOFT—软引用：基于垃圾回收器状态和软引用规则移除对象。
>
> 4）WEAK—弱引用：更积极的基于垃圾收集器状态和弱引用规则移除对象。
>
> `默认的清除策略是：LRU`，了解上面两个即可。

## 一级缓存

​		一级缓存也叫本地缓存：SqlSession 级别的缓存，与数据库同一次会话期间查询到的数据会放在本地缓存中，以后如果需要获取相同的数据，会直接从缓存中拿，而不会再去查询数据库（通过查询日志发现并不会重新执行 SQL 语句）。`一级缓存默认开启，只在当前 sqlSession 有效。`    ====>    相当于是一个 map。

1、缓存失效的情况：

​	1）查询`不同的内容`。例如查询 id 为1 和 id 为 2 不同的用户。

​	2）中间出现`增删改操作`，可能会改变原来的数据，所以必定会刷新缓存。

​	3）查询不同的 Mapper 文件，由于 一级缓存只在一个 sqlSession 有效。

​	4）支持手动清理一级缓存：

```java
sqlSession.clearCache();
```

## 二级缓存

​		二级缓存也叫`全局缓存`，一级缓存作用域太低了，所以诞生了二级缓存，`基于 namespace 级别的缓存，也就是一个 mapper 文件，对应一个二级缓存`。

1、对某个 mapper 开启二级缓存：首先需要开启全局缓存，再在其 mapper 文件中中加入标签：

​	1）`全局`的开启或关闭配置文件中的所有映射器已经配置的任何缓存：mybatis-config.xml

```xml
<!--显示的开启全局缓存 默认也是 true，但是一般显式写出-->
<setting name="cacheEnabled" value="true"/>
```

​	2）对当前 mapper 开启二级缓存：xxxMapper.xml

```xml
<cache/>
```

2、也可以对缓存在开启时进行一些配置（一般使用这种方式）：

```xml
<cache flushInterval="60000" size="60" readOnly="true" eviction="FIFO"/> <cache/>
```

3、缓存工作机制：

​	1）一个会话查询一条数据，这个数据就会被放在当前会话的一级缓存中。

​	2）如果会话关闭了，这个会话对应的一级缓存就没了；但是我们想要的是，会话关闭了，一级缓存中的数据被保存到二级缓存中。这样对于新的会话查询信息，就可以直接从二级缓存中获取内容。

​	3）不同的 mapper 查询出的数据会放在自己对应的二级缓存中（对应的 mapper 缓存）。

> 注意：
>
> 1）只要开启了二级缓存，在同一个 Mapper 下就有效。
>
> 2）`所有的数据都会放在一级缓存中`，`只有当前会话(sqlSession)提交，或者关闭的时候，才会提交到二级缓存中`。

注意将实体类序列化，否则就可能会报错：

```cmd
Caused by:java.io.NotserializableException:com.kuang.pojo.User
```

## Mybatis 缓存原理

![image-20220323213734122](https://img-blog.csdnimg.cn/img_convert/1c76be976ecf0e66b135ed0894c5c1f7.png)

缓存顺序：

1）先去二级缓存中看有没有；

2）再看一级缓存中有没有；

3）再去数据库查询。

## 自定义缓存 ehcache

ehcache 缓存：第三方缓存，是一种广泛使用的开源 ]ava `分布式缓存`，主要面向`通用缓存`。（hibernate 使用的缓存机制。）`目前一般使用 redis 作为缓存`。

1）需要先导入 maven 依赖：mybatis-ehcache，然后就直接在 mapper.xml 中进行使用：

```xml
<!-- https://mvnrepository.com/artifact/org.mybatis.caches/mybatis-ehcache -->
<dependency>
    <groupId>org.mybatis.caches</groupId>
    <artifactId>mybatis-ehcache</artifactId>
    <version>1.1.0</version>
</dependency>
```

2）编写 ehcache.xml 文件，如果在加载时`未找到` /ehcache.xml 资源或出现问题，则将使用默认配置。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ehcache xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="http://ehcache.org/ehcache.xsd"
        updateCheck="false">
<!--
      diskStore：为缓存路径，ehcache分为内存和磁盘两级，此属性定义磁盘的缓存位置。参数解释如下：
      user.home – 用户主目录
      user.dir – 用户当前工作目录
      java.io.tmpdir – 默认临时文件路径
-->
   <diskStore path="./tmpdir/Tmp_EhCache"/>
   
   <defaultCache
           eternal="false"
           maxElementsInMemory="10000"
           overflowToDisk="false"
           diskPersistent="false"
           timeToIdleSeconds="1800"
           timeToLiveSeconds="259200"
           memoryStoreEvictionPolicy="LRU"/>
 
   <cache
           name="cloud_user"
           eternal="false"
           maxElementsInMemory="5000"
           overflowToDisk="false"
           diskPersistent="false"
           timeToIdleSeconds="1800"
           timeToLiveSeconds="1800"
           memoryStoreEvictionPolicy="LRU"/>
<!--
      defaultCache：默认缓存策略，当ehcache找不到定义的缓存时，则使用这个缓存策略。只能定义一个。
-->
<!--
	name:缓存名称。
	maxElementsInMemory:缓存最大数目
	maxElementsOnDisk：硬盘最大缓存个数。
	eternal:对象是否永久有效，一但设置了，timeout将不起作用。
	overflowToDisk:是否保存到磁盘，当系统当机时
	timeToIdleSeconds:设置对象在失效前的允许闲置时间（单位：秒）。仅当eternal=false对象不是永久有效时使用，可选属性，默认值是0，也就是可闲置时间无穷大。
	timeToLiveSeconds:设置对象在失效前允许存活时间（单位：秒）。最大时间介于创建时间和失效时间之间。仅当eternal=false对象不是永久有效时使用，默认是0.，也就是对象存活时间无穷大。
     diskPersistent：是否缓存虚拟机重启期数据 Whether the disk store persists between restarts of the Virtual Machine. The default value is false.
     diskSpoolBufferSizeMB：这个参数设置DiskStore（磁盘缓存）的缓存区大小。默认是30MB。每个Cache都应该有自己的一个缓冲区。
     diskExpiryThreadIntervalSeconds：磁盘失效线程运行时间间隔，默认是120秒。
     memoryStoreEvictionPolicy：当达到maxElementsInMemory限制时，Ehcache将会根据指定的策略去清理内存。默认策略是LRU（最近最少使用）。你可以设置为FIFO（先进先出）或是LFU（较少使用）。
     clearOnFlush：内存数量最大时是否清除。
     memoryStoreEvictionPolicy:可选策略有：LRU（最近最少使用，默认策略）、FIFO（先进先出）、LFU（最少访问次数）。
     FIFO，first in first out，这个是大家最熟的，先进先出。
     LFU， Less Frequently Used，就是上面例子中使用的策略，直白一点就是讲一直以来最少被使用的。如上面所讲，缓存的元素有一个hit属性，hit值最小的将会被清出缓存。
     LRU，Least Recently Used，最近最少使用的，缓存的元素有一个时间戳，当缓存容量满了，而又需要腾出地方来缓存新的元素的时候，那么现有缓存元素中时间戳离当前时间最远的元素将被清出缓存。
-->
 
</ehcache>
```

3）在对应的 mapper 文件中使用 ehcache 作为二级缓存：

```xml
<cache type="org.mybatis.cache.ehcache.EhcacheCache"/>
```

也可以使用自定义的缓存，实现 cache 即可（`没意义`）

> 注意：现在已经不使用这些缓存，`一般使用 redis 作为缓存`。
