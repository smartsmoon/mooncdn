---
title: Spring 原理浅析
date: 2021-06-01 00:00:00
type:
comments:
tags: 
  - Spring
  - SMM 框架
categories: 
  - Java 开发
description: 
keywords: Spring
cover: https://w.wallhaven.cc/full/rd/wallhaven-rdvyk7.jpg
top_img: https://w.wallhaven.cc/full/rd/wallhaven-rdvyk7.jpg
---

# Spring 概述

## Spring 简介

作者：Rod Jahnson，音乐学博士。

前身：2004年3月24日，Spring 框架以` interface21 `框架为基础，经过重新设计，发布了1.0正式版。

官网：` http://spring.io/`

官方文档和源码下载地址：`https://repo.spring.io/libs-release-local/org/springframework/spring/`

github 维护：`https://github.com/spring-projects`

**`Spring 理念：使现有的技术更加容易使用，本身是一个大杂烩，相当于一个融合剂，整合了现有的技术框架。`**

 maven 依赖：导入 Spring-webmvc 即可，其他的会自动导入：

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>5.3.17</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-jdbc</artifactId>
        <version>5.3.10</version>
    </dependency>
</dependencies>
```

## Spring 优点

1、Spring 是一个开源免费的框架（`容器`）

2、Spring 是一个轻量级的框架 （小）, 非侵入式的（引入后不会改变原来的代码结构）。

3、核心思想：控制反转` IoC ` , 面向切面` Aop`（重点）

4、支持事务的处理 , 支持框架的整合。

总结：Spring是一个轻量级的 `控制反转(IoC) 和 面向切面编程(AOP) 的容器`（框架）！

## Spring 核心模块

Spring 框架是一个分层架构，由 7 个定义良好的模块组成。Spring 模块构建在核心容器之上，核心容器定义了`创建、配置和管理 bean `的方式。

![在这里插入图片描述](https://img-blog.csdnimg.cn/76f105325042460686ed93b3692f1e09.png)

# IOC 思想

## IOC 思想推导

1、原来的业务步骤：

1）UserDao 接口。

2）UserDaoImp 实现。

3）UserSevice 接口。

4）UserServiceImp 实现（核心所在）。

```java
public class UserServiceImpl implements UserService{

    //组合的概念：
    private UserDao userDao;

    public UserServiceImpl(){
        userDao = new UserDaoImpl();
    }

    @Override
    public void getUser() {
        userDao.getUser();
    }
}
```

用户 Servlet 实际调用业务层，业务层调用 dao。

存在弊端：当改变需求时，必须改变原有的代码（dao、service），`程序适应不了用户的变更`，如果程序代码量大，修改代码的代价就十分昂贵。

> `分析`：比如，增加一个实现 UserDaoMysqlImpl，则必须要去 service 的实现中去修改原来的 UserServiceImpl，让其组合 UserDaoMysqlImpl。如果又增加一个 UserDaoOracleImpl，则又必须去修改 UserServiceImpl，让其组合 UserDaoOracleImpl，`过程繁琐，且必须一直修改原来的代码`。

```java
public class UserServiceImpl implements UserService{

    //组合的概念：
    private UserDao userDao;

    //必须修改这里为：UserDaoMysqlImpl
    public UserServiceImpl(){
        userDao = new UserDaoMysqlImpl();
    }

    @Override
    public void getUser() {
        userDao.getUser();
    }
}
```

解决： 利用 `set方法` 进行动态实现值的注入：革命性变化。（`接口的思想`）

```java
public class UserServiceImpl implements UserService{

    //组合的概念：
    private UserDao userDao;

    public void setUserDao(UserDao userDao){
        this.userDao = userDao;
    }

    @Override
    public void getUser() {
        userDao.getUser();
    }
}
```

则就可以在调用的时候动态的传入想要的`实现的接口`：

```java
public class MyTest {
    public static void main(String[] args) {
        UserService userService = new UserServiceImpl();
        ((UserServiceImpl)userService).setUserDao(new UserDaoMysqlImpl());
        userService.getUser();
    }
}
```

> 革命性变革体现在哪？
>
> 1）原来方法：程序是`主动创建对象`，控制权在程序员（`业务层 service`）手上。
>
> 2）set 注入方法：程序`不再具有主动性`，变成了被动的接收对象。（`用户（Servlet）`变成主动，需要哪个就 set 哪个接口，不需要改原来的 service 和 dao 业务代码）：也就是`用户控制 service 应该去使用 dao 的哪个实现`
>
> 这就叫 `“控制反转”`！

这种 “控制反转” 思想，从本质上解决了问题，让`程序员不用再管对象的创建`，`系统的耦合性大大降低，可以更加专注于业务的实现。`

`Spring 底层全部使用这种思想，这是 控制反转 IOC 的原型。`

## IOC 本质

​		控制反转 IoC(Inversion of Control)，是一种设计思想，`DI(依赖注入)是实现 IoC 的一种方法（意味着还有其他方式）`。

1）没有 IoC 的程序中 , 我们使用面向对象编程 , 对象的创建与对象间的依赖关系完全`硬编码`在程序中，对象的创建由程序自己控制。（`一层套一层`）

2）控制反转后将对象的创建转移给第三方（用户）。（`选择性`）

控制反转就是：`获得依赖对象的方式反转`。

![图片](https://mmbiz.qpic.cn/mmbiz_png/uJDAUKrGC7KtDiaOqFy5ourlJ8FTVV2FFuYibmavlBHq9e4cDqiclpYSG8VT4EicVsnqKp65yJKQeNibsVdTiahQibJSg/640)

`结论`：根据上图，由对象间的耦合（service 和 dao），进行 IOC 解耦，这样之后，使用哪个就调用哪个 对象的实现。

​		IoC 是 Spring 框架的核心内容，使用`多种方式`完美的实现了 IoC，

1）可以使用 XML 配置。

2）也可以使用 注解。

3）新版本的 Spring 也可以 零配置实现 IoC。

Spring 容器在初始化时先读取配置文件，根据配置文件或元数据创建与组织`对象存入容器`中，程序使用时再`从 Ioc容器 中取出需要的对象`。

![图片](https://mmbiz.qpic.cn/mmbiz_png/uJDAUKrGC7KtDiaOqFy5ourlJ8FTVV2FF67dfeA6cRT7EiafNcibWyf57SGpkZ01JnpiaaicNB1ibBjGaicAvayKEWJ0A/640)

> ​		采用 XML 方式配置 Bean 的时候，Bean 的定义信息是和实现分离的，而采用 注解 的方式可以把两者合为一体，Bean 的定义信息直接以注解的形式定义在实现类中，从而达到了零配置的目的。

​		**`总结：控制反转是一种通过描述（XML或注解）并通过第三方去生产或获取特定对象的方式。在 Spring 中实现控制反转的是 IoC 容器，实现方法是依赖注入（Dependency Injection,DI）`**

## HelloSpring 示例

1、需要一个 applicationContext.xml 配置文件：（一般是命名为 applicationContext，表示 spring 配置文件）

​		`IOC 容器可以理解为这个 配置文件（Beans 标签）`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd">
	<!--使用 spring 来创建对象，在 spring 中所有的对象都成为 Bean-->
    <!-- bean 就是初始化一个对象，id 就是变量名（实例化对象），class 就是该类，property 相当于给对象中的属性设值-->
    <bean id="hello" class="com.example.pojo.Hello">
        <property name="str" value="spring 春天"></property>
    </bean>
</beans>
```

> 1、bean 标签：表示一个对象。
>
> 2、class 属性：表示该对象的类。
>
> 3、property 标签：就是给对象中的属性设值。
>
> 这个过程就叫做`控制反转`。
>
> `控制`：谁来控制对象的创建，传统 new 的方式就是程序本身创建，而现在是由 spring 创建的。
>
> `反转`：程序本身不创建对象，而是变成被动的的接收接收。（`spring 创建，程序使用时接收`）
>
> `spring 的依赖注入实现方式：通过 set 方法实现`（去掉实体类的 set 方法会发现配置文件属性位置报错）。

2）测试：

```java
public class MyTest {
    public static void main(String[] args) {
        //获取 spring 的上下文对象（实例化 ioc 容器），现在对象都在 spring 中进行管理
        ApplicationContext context = new ClassPathXmlApplicationContext("ApplicationContext.xml");
        //获取对象：就是获取 bean 的方式进行获取，是从 IOC 容器中拿出来的，并不是 new 出来的。
        Hello hello = (Hello) context.getBean("hello");
        System.out.println(hello.toString());
    }
}
```

ApplicationContext 是 ClassPathXmlApplicationContext 顶层的接口，中间的过程都由 spring 自动实现。

总结：所谓的`IOC 就是：对象由 Spring 来创建，管理，装配`！

3、改造传统的代码：applicationContext.xml 中进行注册即可。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd">
    
	<bean id="userDao" class="com.example.dao.UserDaoImpl"></bean>
    <bean id="userDaoMysql" class="com.example.dao.UserDaoMysqlImpl"></bean>
    <bean id="userService" class="com.example.service.UserServiceImpl">
        <!-- 里面的属性 userDao，用 ref 来表示引用 spring 中创建好的对象，value 是指基本的数据类型-->
        <property name="userDao" ref="userDao"></property>
    </bean>
    
</beans>
```

​		因此当使用时，想用 UserDao 接口的哪个具体实现，直接修改` ref="userDao" `配置就可以了，而后获取 ApplicationContext 对象（IOC 容器），利用容器获取对象即可。

```java
public class MyTest02 {
    public static void main(String[] args) {
        // 获取 ApplicationContext 这个 IOC 容器对象
        ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
        // 通过 IOC 容器获取 userService 对象
        UserService userService = (UserService) context.getBean("userService");
        userService.getUser();
    }
}
```

## IOC 创建对象方式

1、`默认`使用`无参构造`创建对象。

2、假设我们要使用有参构造创建对象。

1）使用`下标`进行有参构造赋值(下标从 0 开始)：

```xml
<bean id="user" class="com.example.pojo.User">
    <constructor-arg index="0" value="张三"></constructor-arg>
</bean>
```

2）使用`参数类型`进行有参构造赋值：（不推荐使用：假设两个都是 String，就没办法区分）

```xml
<bean id="user" class="com.example.pojo.User">
    <constructor-arg type="java.lang.String" value="李四"/>
</bean>
```

3）使用`参数名`进行有参构造赋值：

```xml
<bean id="user" class="com.example.pojo.User">
    <constructor-arg name="username" value="王五"></constructor-arg>
</bean>
```

> ​		发现：当标签` <constructor-arg> </constructor-arg> `没有设置时，会使用默认的无参构造进行创建对象，当此标签设置后，会使用有参构造进行创建对象。

总结（`对象加载时间`）：在`配置文件加载`的时候，容器中管理的对象就已经`初始化`，即使没有使用，也已经被初始化了！

# Spring 配置

Spring 配置文件：applicationContext.xml 配置文件，Spring 的相关设置也位于该文件。

## 别名设置

```xml
<alias name="user" alias="userNew"/>
```

设置别名后，可以使用 `原名字或别名` 获取对象。例如此处，user 和 userNew 都可以获取到该 bean （对象）。

## Bean 设置

```xml
<bean id="user" class="com.example.pojo.User" name="user2 user3, user4; user5">
    <property name="name" value="蔡徐坤"/>
</bean>
```

> 此处的配置设置：
>
> 1）id 属性：表示 bean 的唯一标识符，也就相当于`对象名`。
>
> 2）class 属性：表示 bean 对象所对应的全限定名：包名+类名（也就是`类`）。
>
> 3）name 属性：表示`别名`，可以取多个。效果比 alias 更高级，中间可以使用 逗号、空格、分号。

## Import 设置

import 用于团队开发，用于将多个配置文件进行合并，使用时直接使用总的即可（`内容相同会合并，内容不同取并集`）。

```xml
<import resource="applicationContext1.xml"></import>
<import resource="applicationContext2.xml"></import>
<import resource="applicationContext3.xml"></import>
```

# 依赖注入

依赖注入（`DI`）：是实现 IOC 的一种方式，`本质就是 set 注入`。

1）依赖：bean 对象的创建依赖于容器。

2）注入：bean 对象中的所有属性，由容器来注入。

Spring 中的依赖注入体现：

​	1）IOC 容器就是一个注入点，将 `对象` 通过`构造器`注入容器，使用时直接取出。

​	1）IOC 容器就是一个注入点，将 `抽象的接口（实际也是对象，此时相当于某个对象的属性）` 注入容器，而接口的具体实现则通过 ref 引用进行实现，使用时直接取出。

## 构造器注入

​		`构造器注入`就是上面讲的 IOC 创建对象的三种方式。

## Set 方式注入(核心)

1、环境搭建。

使用 Student 对象作为测试 bean：

```java
@Data
public class Student {
    private String name;
    private Address address;
    private String[] books;
    private List<String> hobbies;
    private Map<String,String> card;
    private Set<String> games;
    private String wife;
    private Properties info;
}
```

Address 类：

```java
@Data
public class Address {
    private String address;
}
```

2、编写 applicationContext.xml 配置文件，并通过容器创建 Student 对象。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="student" class="com.example.pojo.Student">
        <property name="name" value="程序猿小高"></property>
    </bean>
</beans>
```

发现信息不完整，但是已经通过 set方法 将对象注入成功。（`普通属性`）

3、完善注入信息（都是利用 set方法 注入）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd">
    
    <bean id="address" class="com.example.pojo.Address">
        <property name="address" value="湖北"></property>
    </bean>

    <bean id="student" class="com.example.pojo.Student">
        <!-- 1、普通属性注入：value 属性-->
        <property name="name" value="蔡徐坤"></property>
        <!-- 2、对象属性注入: ref 属性-->
        <property name="address" ref="address"></property>
        <!-- 3、数组属性注入：array 子标签-->
        <property name="books">
            <array>
                <value>红楼梦</value>
                <value>西游记</value>
                <value>三国演义</value>
                <value>水浒传</value>
            </array>
        </property>
        <!-- 4、集合 list 属性注入:list 标签-->
        <property name="hobbies">
            <list>
                <value>打篮球</value>
                <value>唱跳</value>
                <value>Rap</value>
            </list>
        </property>
        <!-- 5、集合 map 属性注入：map 标签，内部使用 entry 标签（表示实体）-->
        <property name="card">
            <map>
                <entry key="身份证" value="12345678987654"></entry>
                <entry key="银行卡" value="00000000000000"></entry>
            </map>
        </property>
        <!-- 6、集合 set 属性注入：set 标签-->
        <property name="games">
            <set>
                <value>LOL</value>
                <value>CSGO</value>
                <value>阴阳师</value>
            </set>
        </property>
        <!-- 7、null 属性注入：null 标签-->
        <property name="wife">
            <null></null>
        </property>
        <!-- 8、配置类 Properties 属性注入：props 标签，里面使用 prop 标签-->
        <property name="info">
            <props>
                <prop key="driver">mysql.jdbc.cj.driver</prop>
                <prop key="url">jdbc://localhost:3306?spring</prop>
                <prop key="username">root</prop>
                <prop key="password">123456</prop>
            </props>
        </property>
    </bean>
</beans>
```

## 扩展方式注入

`p 命名空间`注入：p 实际上就是 property，对应 set方法 的属性注入。需要依赖于第三方约束：

```xml
 xmlns:p="http://www.springframework.org/schema/p"
```

`c 命名空间`注入：c 实际上就是 construct-args（`因此需要有有参构造器`），对应 set方法 的构造器注入，需要依赖于第三方约束：

```xml
xmlns:c="http://www.springframework.org/schema/c"
```

具体使用：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:p="http://www.springframework.org/schema/p"
       xmlns:c="http://www.springframework.org/schema/c"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd">

    <!--p命名空间注入，可以直接注入属性的值：property-->
    <bean id="user" class="com.example.pojo.User" p:name="蔡徐坤" p:age="30"/>

    <!--c命名空间注入，通过构造器注入：constructor-args-->
    <bean id="user2" class="com.kuang.pojo.User" c:name="IKun" c:age="22"/>

</beans>
```

> 小`提示`：获取 bean 时可以指定 class 对象，避免强转：
>
> ```java
> User user = context.getBean("userService", User.class);
> ```

## Bean 的作用域

> 可以通过比较获取的对象的 hashcode 值来比较是否是同一个对象。

1、单例模式（Spring 默认机制，一般都是单例模式）：此处显式设置为单例模式。

```xml
<bean id="user2" class="com.example.pojo.User" c:name="蔡徐坤" c:age="22" scope="singleton"/>
```

2、原型模式：每次从容器中 getBean 的时候，都会产生一个新对象！

```xml
<bean id="user2" class="com.example.pojo.User" c:name="蔡徐坤" c:age="22" scope="prototype"/>
```

3、其余模式：request、session、application、websocket，这些只会在 web 开发中使用到。

# Bean 的自动装配

上面的依赖注入都是`手动装配`的实现，实际上 Spring 还可以实现自动装配。

​		自动装配是 Spring 满足 bean 依赖一种方式，Spring 会在上下文中自动寻找，并自动给 bean 装配属性。

> Spring 中有三种`装配`的方式：
>
> 1）在` xml `配置文件中显式的配置：手动装配（就是上面的方式）
>
> 2）在` java `代码中显式配置：Spring 的新特性，需要在 Java 中写一个 config `配置类`。
>
> 3）隐式的`自动装配` bean [重要方式]

## xml 自动装配

1、创建项目，以一个人有一只猫、一只狗作为示例。

1）手动注入到容器方式：

```xml
<bean id="cat" class="com.example.pojo.Cat"></bean>
<bean id="dog" class="com.example.pojo.Dog"></bean>
<bean id="person" class="com.example.pojo.Person">
    <property name="name" value="蔡徐坤1号"></property>
    <property name="cat" ref="cat"></property>
    <property name="dog" ref="dog"></property>
</bean>
```

2）通过 ByType 方式自动注入到容器方式：会自动在容器上下文中，会在对象该`属性类型相同`的对应的 beanId 进行匹配。

​		ByType 的时候，需要保证`所有 bean 的 class 唯一`（不能过多定义该类型对象），并且这个 bean 需要和自动注入的属性的类型一致！

```xml
<bean id="person" class="com.example.pojo.Person" autowire="byType">
    <property name="name" value="蔡徐坤2号"></property>
</bean>
```

3）通过 ByName 方式自动注入到容器方式：会自动在容器上下文中，会在对象自己` set 方法`后面的值对应的 beanId 进行匹配。

​		ByName 的时候，需要保证`所有 bean 的 id 唯一`，并且这个 bean 需要和自动注入的属性的 set 方法的值一致！

```xml
<bean id="person" class="com.example.pojo.Person" autowire="byName">
    <property name="name" value="蔡徐坤3号"></property>
</bean>
```

4）测试代码：

```java
public class MyTest05 {
    public static void main(String[] args) {
        ApplicationContext context = new ClassPathXmlApplicationContext("ApplicationContext.xml");
        Person person1 = context.getBean("person1", Person.class);
        Person person2 = context.getBean("person2", Person.class);
        Person person3 = context.getBean("person3", Person.class);
        person1.getCat().shout();
        person1.getDog().shout();
        person2.getCat().shout();
        person2.getDog().shout();
        person3.getCat().shout();
        person3.getDog().shout();
    }
}
```

## 注解自动装配

上面的方式是通过 xml 配置文件进行自动装配，但是如果写习惯了就很容易忽略，因此可以考虑使用利用`注解`进行自动装配。

jdk1.5 支持的注解，Spring2.5 支持注解。

### @Autowired

1、配置文件导入注解约束（context 约束），同时开启注解方式支持：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
	        https://www.springframework.org/schema/beans/spring-beans.xsd
	        http://www.springframework.org/schema/context
	        https://www.springframework.org/schema/context/spring-context.xsd">
		
		<!-- 开启注解的支持 -->
        <context:annotation-config></context:annotation-config>
</beans>
```

2、配置文件注入：

```xml
<bean id="cat" class="com.example.pojo.Cat"></bean>
<bean id="dog" class="com.example.pojo.Dog"></bean>
<bean id="person" class="com.example.pojo.Person"></bean>
```

3、修改需要自动导入的实体类（Person）代码，加上自动注入注解：@Autowired

```java
@Data
public class Person {
    private String name;
    @Autowired
    private Dog dog;
    @Autowired
    private Cat cat;
}
```

需要`注意`：这种方式实际上就是根据 id 来匹配，id 不能随便写，需要跟该对象（Person）对应的 set 方法后面的值一致。

> `@Autowired` 注解：
>
> 直接在`属性`上使用即可！也可以在 `set方法` 上使用。
>
> 使用注意：使用 Autowired 我们就可以不用编写 set 方法（底层是通过反射实现的），前提是你这个自动配置的属性在 IOC（Spring）容器中存在（`已经手动注入了该类`），且 @Autowired 先通过 byType 的方式实现，再通过 byName 的方式实现。
>
> >  科普：@Nullable 注解标记某个字段，表示该字段可以为 null。
>
> @Autowired 注解源码：
>
> ```java
> @Target({ElementType.CONSTRUCTOR, ElementType.METHOD, ElementType.PARAMETER, ElementType.FIELD, ElementType.ANNOTATION_TYPE})
> @Retention(RetentionPolicy.RUNTIME)
> @Documented
> public @interface Autowired {
>     boolean required() default true;
> }
> ```
>
> 表示该注解有一个属性：required，且默认为 true，表示`不允许该字段为 null`。
>
> ```java
> //如果显式定义了 Autowired 的 required 属性为 false，说明这个对象可以为null。
> @Autowired(required = false)
> private Cat cat;
> ```

### @Qualifier

​		如果 @Autowired 自动装配的环境比较复杂，自动装配无法通过一个注解 @Autowired 完成的时候（`比如 IOC容器 存在多个该类的对象注入时，或是名称 name 无法一致时`），我们可以`使用 @Qualifier(value = “xxx”) 去配合 @Autowired `的使用，指定一个唯一的 bean 对象注入到 IOC 容器。

配置文件：

```xml
<bean id="cat111" class="com.example.pojo.Cat"></bean>
<bean id="cat222" class="com.example.pojo.Cat"></bean>
<bean id="dog111" class="com.example.pojo.Dog"></bean>
<bean id="dog222" class="com.example.pojo.Dog"></bean>
<bean id="person" class="com.example.pojo.Person"></bean>
```

如果不使用 @Qualifier(value = “xxx”) 注解指定，则会抛出异常：

```cmd
Caused by: org.springframework.beans.factory.NoUniqueBeanDefinitionException: No qualifying bean of type 'com.example.pojo.Dog' available: expected single matching bean but found 2: dog111,dog222
```

对 Person 实体类进行处理，利用 @Qualifier(value = “xxx”) 注解指定 bean：

```java
@Data
public class Person {
    private String name;
    
    @Autowired
    @Qualifier(value = "dog111")
    private Dog dog;
    
    @Autowired
    @Qualifier(value = "cat111")
    private Cat cat;
}
```

### @Resource

@Resource 是 Java 的原生注解，兼容了 @Autowired 通过`名字`查找，如果名字查找不到，就会根据` 类 `去查找。

1）先根据名字查找：dog 是否存在。

2）再根据 类：com.example.pojo.Cat 去查找是否存在。

`注意`：如果出现两个名称都不对，但是 都是同一个类时，也会查找不到。

​		例如这种情况，也是查找不到的：

```xml
<bean id="cat111" class="com.example.pojo.Cat"></bean>
<bean id="cat222" class="com.example.pojo.Cat"></bean>
<bean id="dog111" class="com.example.pojo.Dog"></bean>
<bean id="dog222" class="com.example.pojo.Dog"></bean>
```

​		但是如果是下面这种情况，就算属性名是 cat 和 dog，也是可以找到：

```xml
<bean id="cat111" class="com.example.pojo.Cat"></bean>
<bean id="dog111" class="com.example.pojo.Dog"></bean>
```

同时 @Resource 注解也是可以使用其 name 属性进行指定 bean：

```java
@Data
public class Person {
    private String name;

    @Resource(name = "dog111")
    private Dog dog;

    @Resource(name = "cat222")
    private Cat cat;
}
```

`实际上一般不会出现在 IOC 容器中注入多个相同类的 bean 的情况`。

> @Resource 和 @Autowired的`区别`：
>
> 1）都是用来自动装配的，都可以放在属性字段上。
>
> 2）@Autowired `默认通过 byType` 的方式实现，再通过 byName 的方式实现，而且必须要求这个属性对象在 IOC 容器中存在。
>
> 3）@Resource `默认通过 byName` 的方式实现，再通过 byType 的方式实现，而且必须要求这个属性对象在 IOC 容器中存在。
>
> 4）`默认的执行顺序不同`。

# Spring 注解开发

`注意`：在 Spring4 之后，要使用注解开发，必须要保证 `aop` 的包导入了，同时和注解自动给装配一样，需要`导入注解约束`，`配置注解支持`。

`<context:annotation-config/>` 配置是开启注解的支持，该配置的主要作用是`“激活”已声明的 bean`，即“激活”spring容器内配置的bean。

​		该配置对 @Component、@Controller、@Service、@Repository 注解，即没有在 spring 容器注册过的 bean 无效。

```xml
<!-- 开启注解的支持 -->
<context:annotation-config></context:annotation-config>
```

`<context:component-scan/>` 配置包含了<context-annotation-config /> 配置的作用，该配置可以扫描 base-package 指定包下 @Component、@Controller、@Service、@Repository注解，并将被注解的 bean 注册到 spring容器 内，使之生效。（`同时包含注册的作用`）

```xml
<context:component-scan base-package="com.example.pojo"></context:component-scan>
```

需要注意的是：

1）当这两个配置同时配置时，`<context-annotation-config />`将失效，以 `<context:component-scan base-package="" />`为准。

2）@Component、@Controller、@Service、@Repository 这些注解本身并不具有声明注册 bean 的功能，在没有`<context:component-scan/>`扫描解析之前是没有任何作用的。

## Bean 注入

1、创建项目，完善包结构：pojo、dao、service、controller 包。

2、编写实体类 User 类：

```java
@Data
public class User {
    private String name = "蔡徐坤";
}
```

以前的装配方式：

```xml
<bean id="user" class="com.example.pojo.User"></bean>
```

使用注解进行装配：相当于 配置文件中的 bean 标签。

```java
@Component
@Data
public class User {
    private String name;
}
```

`@Component`：组件，用于类上，表示此类已经`被 spring 管理`，即已经注入了此 bean 对象到 IOC 容器，默认的 bean 名称为`类名小写`。

## 属性注入

​		属性注入使用 `@Value` ：相当于 配置文件中的 property 属性，即相当于  <property name="name" value="唱跳 Rap 篮球的蔡徐坤"/>。

```java
@Component
@Data
public class User {
    @Value("唱跳 Rap 篮球的蔡徐坤")
    private String name;
}
```

## 衍生注解

1、@Component 有几个衍生注解，我们在 web 开发中，会按照 mvc 三层架构分层，而其也对应有 @Component 相应的衍生注解：

​	1）dao 层：@Repository 标注。

​	2）service 层：@Service 标注。

​	3）controller 层：@Controller 标注。

这四个注解功能都是一样的，`都是代表将某个类注册到 Spring 中，装配 Bean 到 IOC 容器`。（`需要注意开启包扫描`）

2、自动装配注解：【见 5.2 注解自动装配】

## 作用域注解

```java
@Scope("singleton") 	//单例模式
```

放在 `类` 上面，属性值可以用 value，也可以用 scopeName。

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Scope {
    @AliasFor("scopeName")
    String value() default "";

    @AliasFor("value")
    String scopeName() default "";

    ScopedProxyMode proxyMode() default ScopedProxyMode.DEFAULT;
}
```

> 总结：（`注意 需要开启注解的支持！！！`）
>
> `xml 更加万能`，适用于任何场合，维护简单方便。
>
> `注解`不是在本类里面则使用不了，维护相对复杂。
>
> `最佳实践`：xml 用来管理 bean，注解只负责完成属性的注入。

# Spring 配置类

可以完全不使用 Spring 的 xml 配置了（`完全抛弃配置文件`），全权交给 Java 来做。（实际上还是 注解）====> springboot 里面非常常见。

> `JavaConfig` 是 Spring 的一个子项目，在Spring4之后，它成为了一个核心功能。

使用 Java 配置类的方式进行 Spring 的配置设置：加上一个 `@Configuration`，表示此类为 `配置类`。

```java
//这个也会让 spring 容器托管，注册到容器中，因为他本身就包含了 @Component，@Configuration代表这是一个配置类，就和 applicationContext.xml 一样。
@Configuration  //类似于加上了 beans 标签
@ComponentScan("com.example.pojo")
public class ApplicationContextConfig {

    @Bean
    public User getUser(){
        return new User();
    }
}
```

实体类：

```java
//bean 的名字默认类名的小写 user
@Component
@Data
public class User {

    @Value("唱跳 Rap 篮球的蔡徐坤")
    private String name;
}
```

此处就有一套对应关系：

1）@ComponentScan 和 @Component 搭配使用，表示注入扫描到的包里面的 加了 @Component 注解的类，并将其都注入到 IOC 容器。

2）@Configuration 就相当于以前的 beans 标签，同时这个类本身也会让 spring 容器托管，注册到容器中，因为他本身就包含了 @Component 注解，@Configuration 代表这是一个配置类，`就和 applicationContext.xml 一样`。

3）@Bean 注解表示注入一个 bean，就相当于 xml 文件中的 bean 标签，这个`方法的名字就是 bean 的 id 属性`（因此使用时就是使用这个方法名），返回值类型就是 class 属性，而 返回内容就是注入到 IOC 容器的对象。

测试：使用 AnnotationConfigApplicationContext 对象获取容器。注意`需要传入配置类的 class 对象`。

```java
public class MyTest01 {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ApplicationContextConfig.class);
        User user = context.getBean("getUser", User.class);
        System.out.println(user.getName());
    }
}
```

# 代理模式

`代理模式是 Spring 面向切面编程 AOP 的底层`。代理模式分为静态代理和动态代理。

![在这里插入图片描述](https://img-blog.csdnimg.cn/10027a5493094858a8adcaa255eb7a91.png)

## 静态代理

角色分析：

1）抽象角色：一般会使用接口或者抽象类来解决。

2）真实角色：被代理的角色。（房东）

3）代理角色：代理别人的角色，里面处理一些附属业务。（中介）

4）客户：访问代理对象的人。

抽象角色：租房的接口，房东和中介都租房。

```java
//租房共同接口：房东和代理都出租房子
public interface Rent {
    public void rent();
}
```

真实角色：房东，`不想带人看房、签合同等等流程`。

```java
//真实角色：房东
public class Host implements Rent{

    @Override
    public void rent() {
        System.out.println("房东出租房子");
    }
}
```

代理角色：中介，负责带人看房，签合同，收中介费等服务，同时也需要`提供租房的服务`。

```java
//代理角色：中介(中介有一些附属业务：看房、签合同、收中介费)
public class Proxy implements Rent{
    //中介必须先找房东商讨
    //代理角色第一件事就是找到真实角色（代理真实角色），用组合而非继承。
    private Host host;

    public Proxy(){

    }

    public Proxy(Host host){
        this.host = host;
    }

    //房东不想带人看房
    @Override
    public void rent() {
        seeHouse();
        host.rent();   //代理的体现,调用的还是 host 的 rent 方法。
        contract();
        fare();
    }

    public void seeHouse(){
        System.out.println("中介带人看房");
    }

    public void contract(){
        System.out.println("签租赁合同");
    }

    public void fare(){
        System.out.println("收中介费");
    }
}
```

客户：客户和房东没有交流，和中介进行租房交流，因此`中介的租房方法调用房东租房的接口`即可。

```java
//客户
public class Client {
    public static void main(String[] args) {
        //房东租房子
        Host host = new Host();
        //中介代理房东
        Proxy proxy = new Proxy(host);
        //中介来出租房子，客户就拿到房东的房子了。
        proxy.rent();
    }
}
```

这样一来：房东就只负责提供房子出租即可，中间流程都可以不做。

> 代理模式的好处：`耦合性降低`。
>
> 1）可以使真实角色的操作更加纯粹，不用去关注一些公共的业务。（只提供租房）
>
> 2）公共业务交给代理角色，实现业务分工。（处理其余事务）
>
> 3）公共业务发生扩展时，方便集中管理。
>
> 代理模式的缺点：一个真实角色就会产生一个代理角色：`代码量会翻倍，开发效率变低`。（中介要增加业务员）

深入理解：（AOP 的实现机制）

![在这里插入图片描述](https://img-blog.csdnimg.cn/f8213f914cb14b0d970879c9d182dd5b.png)

​		就比如原来的业务情况下，需要新增业务：每个方法调用时写入执行日志，这个时候就需要对每个业务 service 里面的`每个实现方法都增加日志设置`，但是如果使用代理，同样实现 业务service 接口，直接在代理中新增日志方法，然后每个方法调用（此处并没有减少代码量），这样就`不用修改原来纯粹的业务代码`，也实现了增加的日志业务。

> 改动原有的业务代码是企业开发中的大忌！

## 动态代理

​		静态代理会使代码量翻倍，类变多，这个时候就应该想到利用`反射`，动态代理都是使用反射。

1、动态代理和静态代理角色一样。

2、动态代理的`代理类是动态生成`的，不是我们直接写好的（不是写死的）。

3、动态代理分为`两大类：基于 接口 的动态代理、基于 类 的动态代理`。

​	1）基于接口实现案例：`JDK 动态代理`。

​	2）基于类实现案例：cglib 。

​	3）基于 java 字节码实现案例：javasist。

4、主要使用两个类：`Proxy（代理），InvocationHandler（调用处理程序）`

​	1）Proxy 这个`类`用来生成动态`代理实例`。

- Proxy 提供了`创建动态代理类和实例`的静态方法。（创建动态代理）

​	2）InvocationHandler `接口`用来处理业务：处理程序并返回一个结果。

			- `每一个代理实例都有一个关联的调用处理程序`。（必须实现这个接口，利用它来执行）
			- `方法调用将分派到其调用处理程序的 invoke 方法`。(`核心控制位置`，以后添加什么方法，就直接可以在此处加入即可)

用是动态代理方式再实现添加 日志需求：

1）编写自动生成代理类，同时代理对应对象的类：（可以当作工具类来使用）

```java
//自动生成代理类
public class ProxyInvocationHandler implements InvocationHandler {

    //被代理的接口
    private Object target;

    public void setTarget(Object target){
        this.target = target;
    }

    //生成得到代理类
    public Object getProxy(){
        return Proxy.newProxyInstance(this.getClass().getClassLoader(), //哪个类
                target.getClass().getInterfaces(), //要代理哪个接口
                this);  //处理程序
    }

    //处理代理实例，并返回结果
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        //动态代理的本质，就是使用反射机制实现
        // method：要执行的目标对象的方法
        Object result = method.invoke(target, args);
        return result;
    }
}
```

2）测试：

```java
public class Client {
    public static void main(String[] args) {
        //真实角色
        service01Impl service = new service01Impl();
        //动态生成代理角色(此时还没有代理角色)
        ProxyInvocationHandler pih = new ProxyInvocationHandler();
        //通过调用程序处理角色来处理我们要调用的接口对象
        //设置代理对象
        pih.setTarget(service);
        //动态生成代理类
        service01 proxy = (service01) pih.getProxy();
        //执行方法
        proxy.add();
    }
}
```

3）此时在添加日志，就直接可以在 生成代理类 ProxyInvocationHandler 里面添加即可：（不管执行什么方法，invoke 方法都会触发）

```java
//处理代理实例，并返回结果
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        log(method.getName());
        //动态代理的本质，就是使用反射机制实现
        Object result = method.invoke(target, args);
        return result;
    }

    public void log(String method){
        System.out.println("[debug] 执行方法：" + method);
    }
```

> 动态代理特有有点：
>
> 1）一个动态代理类可以代理多个类，只要这些类实现了同一个接口即可。
>
> 2）一个动态代理类代理的一个接口，一般就是对应的一类业务。

代理模式有点类似于：`将灵魂注入躯壳，最开始是没有真实实现，后面通过 set 注入接口实现的对象。`

# AOP 思想

`AoP`(aspect oriented programming)：`面向切面编程`。通过预编译的方式和运行期`动态代理`实现程序功能的统一维护的一种技术。面向对象的一种延续。

![在这里插入图片描述](https://img-blog.csdnimg.cn/937c6a9303824af5b809f523d14ffe54.png)

​		本来的业务基础（add、sub、mul、div）上，要加一个日志处理（前置日志和后置日志），`但是不能改变原有的业务逻辑`。

1）用底层源码的方式，就是手动使用动态代理模式实现（上面讲到的方式）。

2）`用 Spring 的方式怎么做呢？`

## AOP 作用

AOP 在 Spring 中的作用：`提供声明式事务，允许用户自定义切面`。

![在这里插入图片描述](https://img-blog.csdnimg.cn/6fe35bd460a4483796f53088384adc42.png)

1）`横切关注点`：跨越引用程序多个模块的方法或功能。即与我们业务逻辑无关但又需要关注的部分，就是横切关注点，如`日志，安全，缓存，事务`等。。

2）`切面`：横切关注点被模块化的特殊对象，即，它是一个`类`。（BeforeLog 类：实现 Log 接口的类）

3）`通知`：切面必须要完成的工作，即，它是类中的一个`方法`。（Log 里面的方法）

4）`目标`：`被通知对象`。（就是`接口`或者方法）

5）`代理`：向目标对象对应通知之后创建的对象。（生成的`代理类`）

6）`切入点`：切面通知执行的“地点”的定义。（`执行的位置`）

7）`连接点`：与切入点匹配的执行点。（`执行的位置`）

​		程序是纵向开发，但是开发完后，比如想加一个`日志功能`，如何使用 aop 实现呢？

## AOP 实现

> 方式一：使用 spring 原生的 api 接口实现：

1）导入 AOP 织入包：

```xml
<dependencies>
    <dependency>
        <groupId>org.aspectj</groupId>
        <artifactId>aspectjweaver</artifactId>
        <version>1.9.4</version>
    </dependency>
</dependencies>
```

2）UserService 接口：

```java
public interface UserService {
    void add(String str);
    void delete();
    void update();
    void select();
}
```

3）UserServiceImpl 实现：

```java
public class UserServiceImpl implements UserService{
    @Override
    public void add(String str) {
        System.out.println("增加" + str);
    }

    @Override
    public void delete() {
        System.out.println("删除");
    }

    @Override
    public void update() {
        System.out.println("修改");
    }

    @Override
    public void select() {
        System.out.println("查找");
    }
}
```

4）日志实现类：

前置日志 BeforeLog：

```java
public class BeforeLog implements MethodBeforeAdvice {

    /**
     * 前置日志的实现
     * @param method 要执行的目标对象的方法
     * @param args  该执行方法的参数
     * @param target 目标对象，也就是代理的对象
     * @throws Throwable
     */
    @Override
    public void before(Method method, Object[] args, Object target) throws Throwable {
        System.out.println(target.getClass().getName() + " 类的 " + method.getName());
    }
}
```

后置日志 AfterLog：

```java
public class AfterLog implements AfterReturningAdvice {

    @Override
    public void afterReturning(Object returnValue, Method method, Object[] args, Object target) throws Throwable {
        System.out.println(target.getClass().getName() + " 类的 " + method.getName() + " 方法被执行了,返回值为：" + returnValue);
    }
}
```

5）applicationContext.xml 配置文件注入 bean，同时创建切入点，并插入 日志。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
	        https://www.springframework.org/schema/beans/spring-beans.xsd
	        http://www.springframework.org/schema/context
	        https://www.springframework.org/schema/context/spring-context.xsd
            http://www.springframework.org/schema/aop
	        https://www.springframework.org/schema/aop/spring-aop.xsd">

    <!--注册 bean -->
    <bean id="userService" class="com.example.service.UserServiceImpl"></bean>
    <bean id="beforeLog" class="com.example.log.BeforeLog"></bean>
    <bean id="afterLog" class="com.example.log.AfterLog"></bean>

    <!--方式一：使用 spring 原生的 api 接口实现-->
    <aop:config>
        <!--定义切入点，id 为切入点标记，expression 表达式：描述切入点的位置（目标），以及执行方法限制-->
        <!-- execution(要执行的位置！ *  *  *  * *) 第一个 * 表示方法类型-->
        <aop:pointcut id="pointcut" expression="execution(* com.example.service.UserServiceImpl.*(..))"/>
        <!--执行环绕增强(就是将日志插入到对应的切入点(方法))-->
        <aop:advisor advice-ref="beforeLog" pointcut-ref="pointcut"></aop:advisor>
        <aop:advisor advice-ref="afterLog" pointcut-ref="pointcut"></aop:advisor>
    </aop:config>
</beans>
```

6）测试：

```java
public class MyTest {
    public static void main(String[] args) {
        ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
        //注意：动态代理代理的是 "接口"，而不是具体的实现类。
        UserService userService = context.getBean("userService", UserService.class);
        userService.add("啦啦啦");
    }
}
```

上面的例子发现：service 做的是很纯粹的业务逻辑，需要加日志直接加，再通过 spring 定位到切入点，插入执行即可。

> 方式二：通过自定义类实现 AOP。

1）自定义 切入点 类：MyPointCut

```java
public class MyPointCut {
    public void before(){
        System.out.println("========方法执行前========");
    }

    public void after(){
        System.out.println("========方法执行后========");
    }
}
```

2）applicationContext.xml 配置文件注入 bean，同时创建切入点，并插入 日志。

```xml
<!--注册 bean -->
<bean id="userService" class="com.example.service.UserServiceImpl"></bean>
<bean id="log" class="com.example.log.MyPointCut"></bean>
<!-- 方式二：自定义类实现 aop-->
<aop:config>
    <!--aop:aspect 就是定义一个切面，ref 就是要引入的类 -->
    <aop:aspect ref="log">
        <!-- 定义切入点，id 为切入点标记，expression 表达式：描述切入点的位置，以及执行方法限制 -->
        <aop:pointcut id="pointcut" expression="execution(* com.example.service.UserServiceImpl.*(..))"/>
        <!-- 通知（方法）：具体切面上执行的方法定义-->
        <aop:before method="before" pointcut-ref="pointcut"></aop:before>
        <aop:after method="after" pointcut-ref="pointcut"></aop:after>
    </aop:aspect>
</aop:config>
```

> 方式三：使用注解方式实现 AOP。

1）自定义一个类充当切面：使用 @Aspect 注解标注该类为切面。

```java
//标注这个类是一个切面
@Aspect
public class AnnotationPointCut {
    //注解内容就是切入点
    @Before("execution(* com.example.service.UserServiceImpl.*(..))")
    public void before(){
        System.out.println("========方法执行前========");
    }

    @After("execution(* com.example.service.UserServiceImpl.*(..))")
    public void after(){
        System.out.println("========方法执行后========");
    }

    //在环绕增强中，我们可以给定一个参数，代表我们要获取处理的切入点
    //ProceedingJoinPoint 连接点对象
    @Around("execution(* com.example.service.UserServiceImpl.*(..))")
    public void around(ProceedingJoinPoint pj) throws Throwable {
        Signature signature = pj.getSignature();//获得签名
        System.out.println(signature);
        //执行方法
        System.out.println("环绕前");
        Object proceed = pj.proceed();
        System.out.println("环绕后");
    }
}
```

2）配置文件注入 bean，同时开启注解支持：

```xml
<bean id="annotationPointCut" class="com.example.aspect.AnnotationPointCut"></bean>
<!--开启注解支持-->
<aop:aspectj-autoproxy></aop:aspectj-autoproxy>
```

3）测试结果：

```cmd
void com.example.service.UserService.add(String)
环绕前
========方法执行前========
增加啦啦啦
========方法执行后========
环绕后
```

执行顺序：环绕前 —— before —— 方法执行 —— after —— 环绕后。

说明 proceed 方法执行时才会去调用 beafore 和 after 方法。

```
Object proceed = pj.proceed();
```

# Spring 整合 Mybatis

导入相关 jar 包：junit、mybatis、mysql、spring相关包、aop织入包、`mybatis-spring整合包`、`spring-jdbc`（spring操作数据库）。

注意事项：`maven 的资源导出`问题。

1、导入依赖，预防资源导出问题：

```xml
<dependencies>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.13.2</version>
    </dependency>
    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis</artifactId>
        <version>3.5.6</version>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.27</version>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.24</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>5.3.17</version>
    </dependency>
    <!-- spring 连接数据库需要的包-->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-jdbc</artifactId>
        <version>5.3.10</version>
    </dependency>
    <dependency>
        <groupId>org.aspectj</groupId>
        <artifactId>aspectjweaver</artifactId>
        <version>1.9.4</version>
    </dependency>
    <!-- spring 整合 mybatis 的包：注意版本对应关系-->
    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis-spring</artifactId>
        <version>2.0.6</version>
    </dependency>
</dependencies>

<build>
    <resources>
        <resource>
            <directory>src/main/java</directory>
            <includes>
                <include>**/*.properties</include>
                <include>**/*.xml</include>
            </includes>
            <filtering>false</filtering>
        </resource>
        <resource>
            <directory>src/main/resources</directory>
            <includes>
                <include>**/*.properties</include>
                <include>**/*.xml</include>
            </includes>
            <filtering>false</filtering>
        </resource>
    </resources>
</build>
```

## Mybatis 环境搭建

​		完善项目结构目录：mapper(dao)、service、utils、pojo 等。

1、编写 jdbc 连接配置文件：`jdbc.properties `

```properties
driver=com.mysql.cj.jdbc.Driver
url=jdbc:mysql://localhost:3306/mybatis?useSSL=true&useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
username=root
password=123456
```

2、编写 mybatis 核心配置文件：`mybatis-config.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<!--configuration核心配置文件-->
<configuration>
    <!-- 引入 jdbc 连接配置文件-->
    <properties resource="jdbc.properties"></properties>
    <!-- 配置别名，包配置方式默认为类名-->
    <typeAliases>
        <package name="com.example.pojo"/>
    </typeAliases>

    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="${driver}"/>
                <property name="url" value="${url}"/>
                <property name="username" value="${username}"/>
                <property name="password" value="${password}"/>
            </dataSource>
        </environment>
    </environments>

    <!-- 注册 UserMapper.xml-->
    <mappers>
        <mapper class="com.example.mapper.UserMapper"/>
    </mappers>
</configuration>
```

3、实体类：`User`

```java
@Data
public class User {
    private int id;
    private String name;
    private String password;
}
```

4、编写 mybatis 连接工具类，获取 SqlSession 对象：`MybatisUtils`

```java
public class MybatisUtils {
    private static SqlSessionFactory sqlSessionFactory;

    //创建 SqlSessionFactory 对象
    static {
        try {
            InputStream inputStream = Resources.getResourceAsStream("mybatis-config.xml");
            sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    //创建 SqlSession 对象,同时开启自动提交事务。
    public static SqlSession getSqlSession(){
        return sqlSessionFactory.openSession(true);
    }
}
```

## Mybatis-Spring

​		MyBatis-Spring 会帮助你将 MyBatis 代码无缝地整合到 Spring 中。它将`允许 MyBatis 参与到 Spring 的事务管理`之中，创建映射器 mapper 和 `SqlSession` 并注入到 bean 中，以及将 Mybatis 的异常转换为 Spring 的 `DataAccessException`。 最终，可以做到应用代码不依赖于 MyBatis，Spring 或 MyBatis-Spring。

1、导入 jar 包依赖：mybatis-spring

```xml
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis-spring</artifactId>
    <version>2.0.7</version>
</dependency>
```

2、要和 Spring 一起使用 MyBatis，需要在 Spring 应用上下文中定义至少两样东西：一个 `SqlSessionFactory` 和至少一个数据映射器类。

同时需要注意的是：`SqlSessionFactory` 需要一个 `DataSource`（数据源），可以是任意的数据源。

1）编写 jdbc 数据库连接信息配置文件：`jdbc.properties`（使用的是 mysql 8）

```properties
# 此文件用于配置 jdbc 的连接信息和数据库的连接设置。
driver=com.mysql.cj.jdbc.Driver
url=jdbc:mysql://localhost:3306/mybatis?useSSL=true&useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
username=root
password=123456
```

2）编写 spring 整合 mybatis 的配置文件：`spring-mybatis.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       https://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/context
       https://www.springframework.org/schema/context/spring-context.xsd">
    <!-- 此文件用于将 spring 和 mybatis 结合起来，包含一些结合的信息-->


    <!-- DataSource 数据源:使用 spring 的数据源替换 mybatis 的配置（c3p0、dbcp、druid） -->
    <!-- 这里使用 spring 提供的 jdbc 数据源：因此需要导入依赖：spring-jdbc-->
    <!-- 引入 jdbc 配置文件，local-override="true" 表示设置本地配置覆盖系统配置（必须设置）。-->
    <!-- 原因：spring 默认会优先加载使用系统环境变量，此时，username 实际上指的是当前计算机的用户名。而不是取值配置文件中定义的 username。-->
    <context:property-placeholder ignore-unresolvable="true" location="classpath:jdbc.properties" local-override="true"/>
    <!-- 配置数据源 -->
    <bean id="datasource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
        <property name="driverClassName" value="${driver}"/>
        <property name="url" value="${url}"/>
        <property name="username" value="${username}"/>
        <property name="password" value="${password}"/>
    </bean>

    <!-- SqlSessionFactory 对象：实际上就是 mybatis 的配置文件-->
    <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <!-- 绑定 数据源 datasource -->
        <property name="dataSource" ref="datasource"></property>
        <!-- 绑定 mybatis 的配置文件的地址 -->
        <property name="configLocation" value="classpath:mybatis-config.xml"></property>
        <!-- 注册 mapper 文件-->
        <property name="mapperLocations" value="com/example/mapper/*.xml"></property>
    </bean>

    <!-- 配置 SqlSession 对象：在 Spring 中已经是 SqlSessionTemplate -->
    <bean id="sqlSession" class="org.mybatis.spring.SqlSessionTemplate">
        <!-- SqlSessionTemplate 没有 set 方法注入，只能使用 构造器注入(源码中发现)-->
        <constructor-arg index="0" ref="sqlSessionFactory"></constructor-arg>
    </bean>
</beans>
```

> `spring-mybatis.xml `配置文件说明：
>
> 1）此配置文件只包含 spring 和 mybatis 整合的一些配置，单独的配置仍然在原来的配置文件。
>
> 2）根据官方说明以及以前对 mybatis 的使用，spring 整合 mybatis 至少需要 SqlSessionFactory  对象，因此将 SqlSessionFactory 对象注入 spring 的 IOC 容器，（`实际上此 bean 就相当于把 mybatis 注入了 spring 的 IOC 容器，此 bean 中可以定义 mybatis 的所有设置，包括注册 mapper 文件`），同时此处还需要将原来的 mybatis 的配置文件 `mybatis-config.xml` 引入到 Spring IOC 容器。
>
> ​		但是需要注意的是：不推荐将所有的 mybatis 配置都放到 spring 里面设置，不利于维护。
>
> 3）当配置 SqlSessionFactory 时，其有一个属性是 `数据源`必须配置，由于之前导入的 spring-jdbc 依赖，可以直接使用 jdbc 的数据源：先将 datasource 注入 IOC 容器，方便 SqlSessionFactory 通过引用获取到。
>
> ​		配置数据源时，需要将 jdbc 连接配置文件引入：使用` location `指定 jdbc 连接配置文件。
>
> ```xml
> <context:property-placeholder ignore-unresolvable="true" location="classpath:jdbc.properties" local-override="true"/>
> ```
>
> > 此处需要注意：必须设置 `local-override="true"`属性，表示设置本地配置覆盖系统配置。
> >
> > `原因`：spring 默认会优先加载使用`系统环境变量`，此时，username 实际上指的是当前`计算机的用户名`。而不是取值配置文件中定义的 username。
>
> 4）参照官方的用法，为了完全去掉 mybatis 的工具类：MybatisUtils，同时需要获取到 `SqlSessionTemplate` 对象（和原来的 SqlSession 对象一样使用），在源码中发现 ，SqlSessionTemplate `没有 set 方法`，因此只能使用 `构造器注入`注入到 IOC 容器。
>
> ​		注意：`SqlSessionTemplate 是线程安全的`。

3、Mybatis 配置文件：`mybatis-config.xml.`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<!-- 此文件是 mybatis 单独的配置文件：一般只用于设置setting -->
<configuration>
    <!-- mybatis 设置-->
    <settings>
        <!-- 驼峰转换 -->
        <setting name="mapUnderscoreToCamelCase" value="true"/>
        <!-- 日志设置 -->
        <setting name="logImpl" value="STDOUT_LOGGING"/>
    </settings>
    <!-- 实体类的映射别名设置 -->
    <typeAliases>
        <package name="com.example.pojo"/>
    </typeAliases>

</configuration>
```

​		经过整合后， `mybatis 配置文件只需要编写一些 自身特有的配置信息设置即可`。

4、Spring 配置文件：`applicationContext.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       https://www.springframework.org/schema/beans/spring-beans.xsd">
    <!-- Spring 核心配置文件：总揽全局的配置文件，用此文件去连接 spring-mybatis 整合配置文件以及 后续的 mvc 配置文件。-->

    <!-- 导入 spring 结合 mybatis 的配置文件-->
    <import resource="classpath:spring-mybatis.xml"></import>

    <!-- 注入 userMapper 对象-->
    <bean id="userMapper" class="com.example.mapper.impl.UserMapperImpl">
        <property name="sqlSession" ref="sqlSession"></property>
    </bean>
</beans>
```

​		经过整合后，Spring 核心配置文件是`总揽全局`的配置文件，用此文件去`连接 spring-mybatis 配置文`件以及后续的` mvc 配置文件`，同时只做一些 spring 自身特有的一些配置：例如对象的注入等。

5、注意：经过整合，`需要对 Mapper 单独编写实现类`，因为只是有实现这个类，才能将其实现类注入 IOC 容器进行使用。

UserServiceImpl：运用 组合 的理念，通过 set 方式注入。

```java
public class UserMapperImpl implements UserMapper {
    // mybatis 中所有操作都靠这个 sqlSession，而在 spring 中，使用的是 sqlSessionTemplate 对象
    private SqlSessionTemplate sqlSession;

    // set 方法，注入 IOC 空间时需要使用
    public void setSqlSession(SqlSessionTemplate sqlSessionTemplate){
        this.sqlSession = sqlSessionTemplate;
    }

    @Override
    public List<User> getUserList() {
        return sqlSession.getMapper(UserMapper.class).getUserList();
    }
}
```

6、测试：直接使用 applicationContext.xml 配置文件即可，此时` mybatis 已经完全被 spring 托管`。

```java
public class Test01 {
    @Test
    public void test1(){
        ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
        UserMapper userMapper = context.getBean("userMapper", UserMapper.class);
        List<User> userList = userMapper.getUserList();
        for (User user : userList) {
            System.out.println(user);
        }
    }
}
```

> mybatis 日志乱码问题：
>
> ​		是由于指定的 VFS 没有找到，mybatis 启用了默认的 DefaultVFS，然后由于 DefaultVFS 的内部逻辑，从而导致了reader entry 乱码。
>
> 解决办法：导入 jboss-vfs 依赖。
>
> ```xml
> <dependency>
>     <groupId>org.jboss</groupId>
>     <artifactId>jboss-vfs</artifactId>
>     <version>3.2.15.Final</version>
> </dependency>
> ```

总结：现在的业务很纯粹，业务类就只做业务内的事。



扩展：另一种整合的方式（利用 `SqlSessionDaoSupport`），了解即可。

​		`SqlSessionDaoSupport` 是一个抽象的支持类，用来为你提供 `SqlSession`。调用 `getSqlSession()` 方法你会得到一个 `SqlSessionTemplate`，之后可以用于执行 SQL 方法，就像下面这样：

```java
public class UserMapper2Impl extends SqlSessionDaoSupport implements UserMapper2 {
    //使用这种方式就不需要注入 SqlSessionTemplate，但是需要注入 SqlSessionFactory
    @Override
    public List<User> getUserList() {
        SqlSession sqlSession = this.getSqlSession();
        return sqlSession.getMapper(UserMapper2.class).getUserList();
    }
}
```

​		在这个类里面，通常更倾向于使用 `MapperFactoryBean`，因为它不需要额外的代码。但是，如果你需要在 DAO 中做其它非 MyBatis 的工作或需要一个非抽象的实现类，那么这个类就很有用了。

​		`SqlSessionDaoSupport` 需要通过属性设置一个 `sqlSessionFactory` 或 `SqlSessionTemplate`。如果两个属性都被设置了，那么 `SqlSessionFactory` 将被忽略。(即`也可以手动注入注入 SqlSessionTemplate`)

```xml
<!-- 注入 userMapper2 对象-->
<bean id="userMapper2" class="com.example.mapper.impl.UserMapper2Impl">
    <property name="sqlSessionFactory" ref="sqlSessionFactory"></property>
</bean>
```

# 声明式事务

事务：`要么都成功，要么都失败`。

事务 ACID 原则：原子性、一致性、隔离性、持久性。

> 发现：现在的代码并没有显式的抛出异常，不太好直接在代码中捕获异常进行显式手动的回滚事务（也不推荐这种方式），如何解决呢？		
>
> ​		使用 MyBatis-Spring 的其中一个主要原因是它允许 MyBatis 参与到 Spring 的事务管理中，而不是给 MyBatis 创建一个新的专用事务管理器，MyBatis-Spring 借助了 Spring 中的 `DataSourceTransactionManager` 来实现事务管理。一旦配置好了 Spring 的事务管理器，你就可以在 Spring 中按你平时的方式来配置事务。并且支持 `@Transactional` 注解和 AOP 风格的配置。在事务处理期间，一个单独的 `SqlSession` 对象将会被创建和使用。`当事务完成时，这个 session 会以合适的方式提交或回滚`。

> 声明式事务：AOP 【交由容器管理事务】
>
> 编程式事务：需要在代码中，进行事务的管理 【需要改变代码：手动 try】

Spring 的事务管理器：在 spring 的配置文件（applicationContext.xml）中创建一个  `DataSourceTransactionManager` 数据源事务管理器对象。

```xml
<!-- 配置事务管理器 -->
<bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
    <constructor-arg ref="datasource" />
</bean>
```

> 注意：为事务管理器指定的 `DataSource` 必须和用来创建 `SqlSessionFactoryBean` 的是同一个数据源，否则事务管理器就无法工作了。

​		抛弃官方的方式（在注入 sqlSessionFactory 同时将事务管理器注入），而`结合 AOP 实现事务的织入`：

​		导入事务 和 aop 的约束，同时配置事务管理器，再将事务管理器利用 aop 横切织入 Spring：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xmlns:tx="http://www.springframework.org/schema/tx"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       https://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/aop
       https://www.springframework.org/schema/aop/spring-aop.xsd
       http://www.springframework.org/schema/tx
       https://www.springframework.org/schema/tx/spring-tx.xsd">
    
    <!-- 导入 spring 结合 mybatis 的配置文件-->
    <import resource="classpath:spring-mybatis.xml"></import>

    <!-- 注入 userMapper 对象-->
    <bean id="userMapper" class="com.example.mapper.impl.UserMapperImpl">
        <property name="sqlSession" ref="sqlSession"></property>
    </bean>
    
<!-- 配置事务通知, transactionManager 是固定的 spring 默认提供的 -->
    <tx:advice id="txAdvice" transaction-manager="transactionManager">
        <!-- 给哪些方法配置事务 -->
        <!-- propagation 用来配置事务的传播特性：默认 REQUIRED（一般都这个）， -->
        <tx:attributes>
            <tx:method name="add" propagation="REQUIRED"/>
            <tx:method name="delete" propagation="REQUIRED"/>
            <tx:method name="update" propagation="REQUIRED"/>
            <tx:method name="query" read-only="true"/>
            <!-- 真实开发一般只写 * 这个就够了 -->
            <tx:method name="*" propagation="REQUIRED"/>
        </tx:attributes>
    </tx:advice>

    <!-- 结合 aop 实现事物的织入-->
    <aop:config>
        <aop:pointcut id="txPointCut" expression="execution(* com.example.mapper.*.*(..))"/>
        <!-- 织入txAdvice事务管理器，execution 配置包下的所有方法都会编织上事务-->
        <!-- 环绕增强 -->
        <aop:advisor advice-ref="txAdvice" pointcut-ref="txPointCut"></aop:advisor>
    </aop:config>
</beans>
```

> 扩展补充：spring中的七种事务传播属性：（propagation 属性设置）
>
> `required（依赖）`：支持当前事务，如果当前没有事务，就新建一个事务 【`默认也是常用的`】
> supports（支持）：支持当前事务，如果当前没有事务，就以非事务的方式执行。
> mandatory（强制）：支持当前事务，如果当前没有事务，就抛出异常。
> required_new：新建事务，如果当前存在事务，把当前事务挂起。
> not_supported：以非事务方式执行操作，如果当前存在事务，就把当前事务挂起。
> never：以非事务方式执行，如果当前存在事务，则抛出异常。
> nested（嵌套）：支持当前事务，如果当前事务存在，则执行一个嵌套事务，如果当前没有事务，就新建一个事务。

为什么需要事务？

1）如果不配置事务，可能存在数据提交不一致的情况。

2）如果我们不在 spring 中去配置声明式事务，我们就需要在代码中手动配置事务（手动提交回滚）。

3）事务在项目的开发中十分重要，涉及到数据的一致性和完整性问题。
