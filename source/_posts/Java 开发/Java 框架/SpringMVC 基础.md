---
title: SpringMVC 使用浅解
date: 2021-06-03 00:00:00
type:
comments:
tags: 
  - SpringMVC
  - SSM 框架
categories: 
  - Java 开发
description: 
keywords: SpringMVC
cover: https://w.wallhaven.cc/full/l3/wallhaven-l3eolq.jpg
top_img: https://w.wallhaven.cc/full/l3/wallhaven-l3eolq.jpg
---

# SpringMVC 初识

SSM 框架：Mybatis + Spring + SpringMVC

重点：`SpringMVC的执行流程（理论）`，以及 SSM 框架的整合（实践）。

## 回顾 MVC	

MVC：模型（Model：service、dao）、视图（View：JSP）、控制器（Controller：Servlet）（`控制器的底层都是 Servlet`）软件设计规范。

> 前端，数据传输，实体类 三者关系：
>
> ​		假设 User 实体类包含：username、password、birthday 等 20 个属性，但是 用户登录逻辑只需要：username 和 password 即可，这个时候不可能将这两个属性放进 User 实体类封装成一个单独的对象（其他属性全 null），这个时候怎么解决呢？====>  `单独封装出 vo 对象解决`。
>
> ​		Pojo 实体类可以分为：vo（视图层对象）、dto（数据传输对象）等等。

最典型的 MVC 就是 JSP + Servlet + JavaBean 的模式。

## Model  时代演进

`Model 1 时代`：就是分为两层，视图层 和 模型层，JSP 直接处理请求，进行转发和重定向。

​		缺点：JSP 职责不惮以，不便于维护。

`Model 2 时代`：三层架构：模型、视图、控制器。

1）用户发请求。

2）Servlet 接收请求数据，并调用对应的业务逻辑方法 Service。

3）业务处理完毕，返回更新后的数据给 Servlet。

4）Servlet 转向到 JSP（`请求转发、重定向`），由JSP来渲染页面。

5）响应给前端更新后的页面。

![img](https://img-blog.csdnimg.cn/20210907224659842.png)

​		优点：便于维护，职责分明。

## 回顾 Servlet

1、创建一个 Servlet 子项目，导入依赖：junit、servlet-api、jsp-api、jstl 依赖包。

准备工作：替换 web.xml 配置文件的头部约束为 Tomcat 对应版本，避免后面使用报错（从 Tomcat 里面文件的项目拷贝）。

```xml
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
                   http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">
    
</web-app>
```

2、编写一个 Servlet ，处理用户请求。

```java
public class HelloServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("utf-8");
        resp.setCharacterEncoding("utf-8");
        resp.setContentType("text/html;charset=utf-8");

        String method = req.getParameter("method");
        if("add".equals(method)){
            System.out.println("执行了 add 操作");
            req.setAttribute("message", "add");
        }
        if ("delete".equals(method)){
            System.out.println("执行了 delete 操作");
            req.setAttribute("message", "delete");
        }
        req.getRequestDispatcher("/WEB-INF/jsp/hello.jsp").forward(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doGet(req, resp);
    }
}
```

3、web.xml 配置文件注册编写的 Servlet。

```xml
<servlet>
    <servlet-name>HelloServlet</servlet-name>
    <servlet-class>com.example.servlet.HelloServlet</servlet-class>
</servlet>
<servlet-mapping>
    <servlet-name>HelloServlet</servlet-name>
    <url-pattern>/hello</url-pattern>
</servlet-mapping>
```

4、新建 hello.jsp 页面，用于测试跳转。

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Title</title>
</head>
<body>
    <h1>欢迎进入 servlet </h1>
    <h2>${message}</h2>
</body>
</html>
```

5、配置 Tomcat，进行请求的测试。

```javascript
localhost:8080/user?method=add
localhost:8080/user?method=delete
```

MVC 框架体现：

1）将 url 映射到 java 类或 java 类的方法 。

2）封装用户提交的数据。

3）处理请求--调用相关的业务处理--封装响应数据 。

4）将响应的数据进行渲染 ， jsp / html 等表示层数据。

## SpringMVC 初识

SpringMVC 的特点：

1）轻量级，简单易学，简洁灵活。

2）高效 , 基于`请求响应`的MVC框架：Servlet

3）与Spring兼容性好，无缝结合。（可以将 SpringMVC 需要用到的 bean 注入到  IOC 容器中）

4）`约定大于配置`。

5）功能强大：`RESTful`、数据验证、格式化、本地化、主题等。

​		Spring 的 web 框架围绕 `DispatcherServlet  [ 调度Servlet ]` 设计。DispatcherServlet 的作用是`将请求分发到不同的处理器 Servlet`。从Spring 2.5开始，使用 Java 5 或者以上版本的用户可以采用`基于注解形式`进行开发。

# DispatcherServlet

DispatcherServlet：`请求转发调度器`，将请求分发到不同的处理器。

​		Spring MVC框架以请求为驱动 , 围绕一个中心 Servlet 分派请求及提供其他功能，`DispatcherServlet 是一个实际的 Servlet` (它继承自 HttpServlet 基类)。（主要方法： doService，详细解释在 SpringBoot）

请求原理图：

![img](https://img-blog.csdnimg.cn/20210908190742138.png)

​		当发起请求时被前置的控制器（`调度器`）拦截到请求，根据请求参数生成代理请求，找到请求对应的实际控制器（`handler`），控制器处理请求，创建数据模型，访问数据库，将模型响应给中心控制器，控制器使用模型与视图渲染视图结果，将结果返回给中心控制器，再将结果返回给请求者。

## 执行原理

![图片](https://mmbiz.qpic.cn/mmbiz_png/uJDAUKrGC7KwPOPWq00pMJiaK86lF6BjIbmPOkY8TxF6qvGAGXxC7dArYcr8uJlWoVC4aF4bfxgCGCD8sHg8mgw/)

​		示意：图为 SpringMVC 的一个较完整的流程图，实线表示 SpringMVC 框架提供的技术，不需要开发者实现，`虚线表示需要开发者实现`。

执行流程：

​	1）DispatcherServlet 表示前置控制器，是`整个 SpringMVC 的控制中心`。用户发出请求，DispatcherServlet 接收所有请求并拦截请求（手动配置）。

> 假设请求：`http://localhost:8080/SpringMVC/hello`：表示请求位于服务器 localhost:8080 上的 SpringMVC 站点的 hello 控制器。

​	2）HandlerMapping 为`处理器映射`。DispatcherServlet `自行调用` HandlerMapping，HandlerMapping 根据请求 url 在配置文件中`查找对应的 Handler`。

```xml
<!--Handler-->
<bean id="/hello" class="com.example.controller.HelloController"/>
```

​	3）HandlerExecution 表示具体的 Handler ，其主要作用是根据 url 查找控制器，如上 url 被查找控制器应该是：hello。

​	4）HandlerExecution 将解析后的信息传递给 DispatcherServlet，如解析控制器映射等。（`此时找到了 hello 控制器 `）

​	5）HandlerAdapter 表示`处理器适配器`，其按照特定的规则去执行 Handler，`根据 hello 控制器 去找对应的控制器的类`。（hello 的控制器可能有几个，需要`根据适配器找到具体的类`）

```xml
<!--    添加 处理器适配器-->
<bean class="org.springframework.web.servlet.mvc.SimpleControllerHandlerAdapter"/>
```

​	6）Handler 让具体的 Controller 执行。（`找到 HelloController`，并让其执行）

​	7）Controller 将具体的执行信息返回给 HandlerAdapter，即：ModelAndView。

​	8）HandlerAdapter 将视图逻辑名或模型传递给 DispatcherServlet。

​	9）DispatcherServlet 自行调用视图解析器 (ViewResolver) 来解析 HandlerAdapter 传递的逻辑视图名。

	- 获取 ModelAndView 里面的数据。
	- 解析 ModelAndView 里面的视图名字。
	- 拼接视图名字，找到对应的视图：`/WEB-INF/jsp/hello.jsp`
	- 将`数据渲染`到这个视图上。（这个阶段渲染的视图）

```xml
<!--视图解析器:DispatcherServlet给他的ModelAndView-->
<bean class="org.springframework.web.servlet.view.InternalResourceViewResolver" id="InternalResourceViewResolver">
    <!--前缀-->
    <property name="prefix" value="/WEB-INF/jsp/"/>
    <!--后缀-->
    <property name="suffix" value=".jsp"/>
</bean>
```

​	10）视图解析器将解析的逻辑视图名传给 DispatcherServlet。

​	11）DispatcherServlet 根据视图解析器解析的视图结果，调用具体的视图。

​	12）最终视图呈现给用户。

## Hello SpringMVC

​		此处是第二次在理解基础上重新编写 springmvc Hello 代码。

1、在 `web.xml` 中配置 DispatcherServlet ，配置方式和一般的 Servlet 一样，只不过 DispatcherServlet 是 Spring 自带的，同时还需要绑定 SpringMVC 的配置文件（实际上就是 Spring 的配置文件）。

​		DispatchServlet 是 springmvc 的核心（`请求分发器，也叫前端控制器` ）

> `/` 和 `/*` 的区别：
>
> `/` 是匹配所有的请求，但是不会去匹配 jsp 页面。
>
> `/*` 是匹配所有的请求，但是会匹配 jsp 页面。
>
> ​		原因：JSP 页面是一个完善的页面，应该直接返回给用户，如果使用的是 `/*` ，就会在请求 JSP 页面时会去经过 DispatcherServlet ，之后会到视图解析器，`会拼接上 前缀和后缀`，而且会不停的嵌套，这样就进入死循环。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">

  <!-- 配置 DispatchServlet：这个是 springmvc 的核心（请求分发器，也叫前端控制器）-->
  <servlet>
    <servlet-name>springmvc</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <!-- DispatchServlet 必须绑定 SpringMVC 的配置文件（实际上就是 Spring 的配置文件）-->
    <init-param>
      <param-name>contextConfigLocation</param-name>
      <!-- 配置文件命名推荐使用：[servletName]-servlet.xml-->
      <param-value>classpath:springmvc-servlet.xml</param-value>
    </init-param>
    <!-- 启动级别：1，表示服务器一启动，有些请求就启动了-->
    <load-on-startup>1</load-on-startup>
  </servlet>
  <servlet-mapping>
    <servlet-name>springmvc</servlet-name>
    <url-pattern>/</url-pattern>
  </servlet-mapping>
</web-app>
```

2、在 resources 目录下创建 springmvc 的配置文件：`springmvc-servlet.xml`（就是 spring 的头部约束），配置处理器，映射器，视图解析器。

> 这个地方使用 Spring 的 BeanNameUrlHandlerMapping，需要根据 bean 的名字来寻找 处理器，因此需要配置具体的处理器注入 IOC 容器。（`后面不用`）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd">
<!-- SpringMVC 配置文件：实际上就是 Spring 的配置文件 -->

<!-- 根据原理流程：需要配置处理器映射器和处理器适配器（真实开发时可以自动配置） -->
<!-- 配置处理器映射器：实际很多种，这个地方使用 Spring 的 BeanNameUrlHandlerMapping，需要根据 bean 的名字来寻找 处理器，因此下面还需要配置处理器 -->
    <bean class="org.springframework.web.servlet.handler.BeanNameUrlHandlerMapping"/>
<!-- 配置处理器适配器：实际很多种，这个地方使用 SimpleControllerHandlerAdapter -->
    <bean class="org.springframework.web.servlet.mvc.SimpleControllerHandlerAdapter"/>
<!-- 配置视图解析器（很重要）,也有很多种：例如 Thymeleaf、Freemarker-->
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver" id="internalResourceViewResolver">
        <!-- 设置拼接路径的前缀和后缀 -->
        <property name="prefix" value="/WEB-INF/jsp/"></property>
        <property name="suffix" value=".jsp"></property>
    </bean>

<!-- Handler 注入区域，BeanNameUrlHandlerMapping 会根据 bean 的名字（name）来寻找处理器-->
    <bean name="/hello" class="com.example.controller.HelloController"></bean>
</beans>
```

3、编写控制器 Controller ，要么`实现 Controller 接口`，要么增加`注解`（需要开启包扫描）；需要返回一个 `ModelAndView`：封装数据，封装视图。

```java
public class HelloController implements Controller {

    @Override
    public ModelAndView handleRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {
        //创建 ModelAndView 模型和视图 对象
        ModelAndView mv = new ModelAndView();
        //封装数据到 ModelAndView 中
        mv.addObject("message","HelloSpringMVC!");
        //封装视图到 ModelAndView 中,进入视图解析器时会自己拼接全路径
        mv.setViewName("hello");
        return mv;
    }
}
```

4、编写前端页面，显示 ModelAndView 封装的数据。

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Title</title>
</head>
<body>
    <h1>222</h1>
<h2>${message}</h2>
</body>
</html>
```

> 这种方法虽然相对于 Servlet 有了一定的改进，代码量也变少，但是实际开发并不会这样写。======> `注解`才是实际开发。

## 注解版 SpringMVC 初识

1、静态资源过滤问题解决：

```xml
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

2、配置 web.xml ，`头约束必须是 4.0 版本`，同时配置 DispatchServlet，绑定 SpringMVC 配置文件 `springmvc-servlet.xml` 。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">

  <!-- 配置 DispatchServlet：这个是 springmvc 的核心（请求分发器，也叫前端控制器）-->
  <servlet>
    <servlet-name>springmvc</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <!-- DispatchServlet 必须绑定 SpringMVC 的配置文件（实际上就是 Spring 的配置文件）-->
    <init-param>
      <param-name>contextConfigLocation</param-name>
      <!-- 配置文件命名推荐使用：[servletName]-servlet.xml-->
      <param-value>classpath:springmvc-servlet.xml</param-value>
    </init-param>
    <!-- 启动级别：1，表示服务器一启动，有些请求就启动了-->
    <load-on-startup>1</load-on-startup>
  </servlet>
  <servlet-mapping>
    <servlet-name>springmvc</servlet-name>
    <url-pattern>/</url-pattern>
  </servlet-mapping>
</web-app>
```

（重点）SpringMVC 配置文件 `springmvc-servlet.xml` ：固定文件。

1）开启自动扫描包，让指定包下的注解能够生效。

```xml
<!-- 开启注解自动扫描包，让指定包下的注解生效,由 IOC容器 统一管理 -->
<context:component-scan base-package="com.example.controller"/>
```

2）让 SpringMVC 不处理静态资源：css、js、html、mp3 等等静态资源（默认资源过滤）。

```xml
<mvc:default-servlet-handler></mvc:default-servlet-handler>
```

3）配置 annotation-driven 自动完成上述`处理器映射器和处理器适配器`的注入（DefaultAnnotationHandlerMapping 和 AnnotationMethodHandlerAdapter）

```xml
<!-- 支持 mvc 注解驱动，在spring中一般采用 @RequestMapping 注解来完成映射关系，要想使 @RequestMapping注解生效，
        必须向上下文中注册 DefaultAnnotationHandlerMapping 和一个 AnnotationMethodHandlerAdapter 实例，
       这两个实例分别在类级别和方法级别处理。
       而 annotation-driven 配置帮助我们自动完成上述两个实例的注入。
    -->
<mvc:annotation-driven></mvc:annotation-driven>
```

因此，总的配置文件为：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/context
       https://www.springframework.org/schema/context/spring-context.xsd
       http://www.springframework.org/schema/mvc
       https://www.springframework.org/schema/mvc/spring-mvc.xsd">
    <!-- SpringMVC 配置文件：实际上就是 Spring 的配置文件 -->
    <!-- 开启注解自动扫描包，让指定包下的注解生效,由 IOC容器 统一管理 -->
    <context:component-scan base-package="com.example.controller"/>
    <mvc:default-servlet-handler></mvc:default-servlet-handler>
    <mvc:annotation-driven></mvc:annotation-driven>

    <!-- 配置视图解析器（很重要）-->
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver" id="internalResourceViewResolver">
        <!-- 设置拼接路径的前缀和后缀 -->
        <property name="prefix" value="/WEB-INF/jsp/"></property>
        <property name="suffix" value=".jsp"></property>
    </bean>
</beans>
```

3、创建 Controller：

```java
@Controller
@RequestMapping("/HelloController") //站点
public class HelloController2 {

    // 以前的 ModelAndView 变成了 Model 和 View 分开
    // Model 负责封装数据，而 View 直接通过返回值返回。
    @RequestMapping("/hello")
    public String hello(Model model){
        //通过 Model 对象封装数据：可以在 JSP 页面中取出并渲染。
        model.addAttribute("message", "啦啦啦德玛西亚");

        //这个返回字符串，则 return 的字符串就直接会被视图解析器处理。
        return "hello";
    }
}
```

1）@Controller 是为了让 Spring IOC 容器初始化时自动扫描到此类，将其加入到 IOC 容器。（@Component 注解一样的）

2）@RequestMapping 是为了映射请求路径，这里因为类与方法上都有映射所以访问时应该是` /HelloController/hello`，在具体的类里面标注，就相当于找到了 该 url 的对应的处理器。

3）以前的 ModelAndView 变成了 Model 和 View 分开，Model 负责封装数据，而 View 直接通过返回值 String 返回就会经过视图解析器：方法返回的结果是视图的名称 hello，加上配置文件中的前后缀变成 `/WEB-INF/jsp/hello.jsp`。

<h3 style="color:pink">总结：</h3>

​		使用 SpringMVC 必须配置的三个要素：`处理器映射器、处理器适配器、视图解析器`，通常，我们只需要`手动配置视图解析器`，而处理器映射器和处理器适配器只需要`开启注解驱动`即可，从而省去了大段的 xml 配置。

​		未来的编码工作基本都是基于注解来实现的。

# 常用注解解析

## Controller

​		控制器 Controller：提供访问应用程序的复杂性为（就是原来的 Servlet），通常通过接口或是`注解`定义实现。控制器负责`解析用户的请求并将其转换为一个模型`，返回给 DispatcherServlet ，进而进入视图解析器。

1、实现 Controller 接口实现

Controller 是一个接口，在 org.springframework.web.servlet.mvc 包下，接口中只有一个方法：`handleRequest` 。实现此接口的类获得`控制器`功能。

1）需要在 SpringMVC 配置文件中注册请求的 bean；name 对应请求路径，class 对应处理请求的类。

```xml
<bean name="/test" class="com.example.controller.ControllerTest"/>
```

2）在 SpringMVC 配置文件中开启 注解扫描，开启 mvc 驱动，否则就需要单独配置 处理器映射器 和 处理器适配器。（`在实现 Controller 的方式时，不需要配这些，因为处理器映射器 和 处理器适配器 是由默认的`）

```xml
<!-- 开启注解自动扫描包，让指定包下的注解生效,由 IOC容器 统一管理 -->
<context:component-scan base-package="com.example.controller"/>
<mvc:default-servlet-handler></mvc:default-servlet-handler>
<mvc:annotation-driven></mvc:annotation-driven>
```

3）需要注意：`一个控制器中只能有一个方法`，如果要多个方法则需要定义多个Controller；定义的方式比较麻烦；=======》`推荐使用注解方式实现`

2、注解 @Controller 实现

`@Controller `注解类型用于声明 Spring 类的实例是一个控制器（用 @Component 也可以）。

1）要使用注解，则`必须开启 Spring 的包扫描`，保证Spring能找到你的控制器。

```xml
<!-- 自动扫描指定的包，下面所有注解类交给IOC容器管理 -->
<context:component-scan base-package="com.kuang.controller"/>
```

2）用 ControllerTest2 类来做测试：

```java
@Controller
public class ControllerTest2{

    //映射访问路径
    @RequestMapping("/test2")
    public String index(Model model){
        //Spring MVC会自动实例化一个Model对象用于向视图中传值
        model.addAttribute("msg", "ControllerTest2");
        //返回视图位置
        return "test";
    }
}
```

> `注意`：@Controller 表示这个类被 Spring 接管，已经`注入 IOC 容器`。同时，被这个注解的类，如果`方法的返回值是 String`，并且有具体的页面可以跳转，那么`都会被视图解析器解析`。

## RequestMapper

​		`@RequestMapping` 注解用于映射 url 到控制器类或一个特定的处理程序方法。可用于类或方法上。用于`类`上，表示类中的所有响应请求的方法都是以该地址作为`父路径`，用于方法上。就是直接映射到具体的处理程序。

​		区别就只是：是否需要加上 父路径（也就是类上面注解的路径）。

## RestFul 风格

​		Restful 就是一个`资源定位及资源操作的风格`，不是标准也不是协议，只是一种`风格`。基于这个风格设计的软件可以更简洁，更有层次，更易于实现缓存等机制。======> `简洁、高效、安全`

Restful 效果：使用 POST（添加）、DELETE（删除）、PUT（修改）、GET（查询），使用不同请求方法对`同一请求资源`进行操作，实现不同的效果：

1、`http://127.0.0.1/item/1` ：查询操作，GET 方式

2、`http://127.0.0.1/item` ：新增操作，POST 方式

3、`http://127.0.0.1/item` ：更新操作，PUT 方式

4、`http://127.0.0.1/item/1` ：删除操作，DELETE 方式

### @PathVariable 注解

`@PathVariable` 注解经常在 RestFul 风格的请求上使用：让方法参数的值对应绑定到一个 URI `模板变量`上。

例如：

```java
@Controller
public class RestFulController {

    //映射访问路径
    @RequestMapping("/commit/{p1}/{p2}")
    public String index(@PathVariable int p1, @PathVariable int p2, Model model){
        int result = p1+p2;
        // Spring MVC会自动实例化一个Model对象用于向视图中传值
        model.addAttribute("msg", "结果："+result);
        // 返回视图
        return "test";
    }
}
```

​		RestFul 风格实际上就是使用 `路径变量`，那么路径变量有哪些优点呢？

1）使路径变得更加简洁，清晰。

2）获得参数更加方便，框架会自动进行类型转换。

3）通过路径变量的类型可以约束访问参数，如果类型不一样，则访问不到对应的请求方法，如这里访问是的路径是 /commit/1/a ，则`路径与方法不匹配`，而不会是参数转换失败。（`只有参数类型和 url 地址都一致时才会找到对应的请求方法`）

### method 属性

使用 `method 属性`指定请求类型：用于`约束请求的类型`，收窄请求范围。

> method 可选项：GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE, TRACE等。
>
> ```java
> // 映射访问路径,必须是Get请求
> @RequestMapping(value = "/hello", method = {RequestMethod.GET})
> public String index2(Model model){
>    model.addAttribute("msg", "hello!");
>    return "test";
> }
> ```
>
> 需要注意的是：浏览器所有的`地址栏请求`默认都会是 HTTP `GET` 类型的，可以使用 postman 进行测试其他请求方式。

<h3 style="color:pink">总结：</h3>

Spring MVC 的 `@RequestMapping` 注解能够处理 HTTP 请求的方法，比如 GET, PUT, POST, DELETE 以及 PATCH。

> 小提示：方法级别的 @RequestMapping 注解变体有：@GetMapping、@PostMapping 等。
>
> ```java
> @GetMapping == @RequestMapping(method =RequestMethod.GET) 
> ```

# 页面跳转方式

1、通过 ModelAndView 对象实现跳转页面。

​		`ModelAndView` 对象 ：可以根据 view 的名称 , 和视图解析器跳转到指定的页面。

页面真实路径：`{视图解析器前缀} + viewName + {视图解析器后缀}`

2、通过 Servlet 的 API 实现跳转页面。

​		通过设置 ServletAPI , 不需要视图解析器，直接利用 request 和 response 对象进行操作转发和重定向。

1）通过 HttpServletResponse 进行输出。

```java
@RequestMapping("/result/t1")
public void test1(HttpServletRequest req, HttpServletResponse rsp) throws IOException {
    rsp.getWriter().println("Hello,Spring BY servlet API");
}
```

2）通过 HttpServletResponse 实现重定向。

```java
@RequestMapping("/result/t2")
public void test2(HttpServletRequest req, HttpServletResponse rsp) throws IOException {
    rsp.sendRedirect("/index.jsp");
}
```

3）通过 HttpServletRequest 实现请求转发。

```java
@RequestMapping("/result/t3")
public void test3(HttpServletRequest req, HttpServletResponse rsp) throws Exception {
    req.setAttribute("msg","/result/t3");
    req.getRequestDispatcher("/WEB-INF/jsp/test.jsp").forward(req,rsp);
}
```

3、通过 SpringMVC 的方式实现请求转发。

1）不利用 视图解析器 实现请求转发和重定向。

- 请求转发：使用 `/` 或是 `forward`

  - 使用 `/` 表示请求转发到该地址（注意必须写 `/`）。

    ```java
    @RequestMapping("/rsm/t1")
    public String test1(){
        return "/WEB-INF/jsp/test.jsp";
    }
    ```

  - 需要注意：使用`根路径下的地址的 jsp`（没有视图解析器就没有拼接 url 的过程）

  - 使用 forward 也可以实现。

    ```java
    @RequestMapping("/rsm/t2")
    public String test2(){
        return "forward:/test.jsp";
    }
    ```

- 重定向：使用 `redirect`

  - 使用 `redirect:/` 实现，必须要写 `/`

    ```java
    @RequestMapping("/rsm/t3")
    public String test3(){
        return "redirect:/index.jsp";
    }
    ```

2）利用 视图解析器 实现请求转发和重定向。

​		如果配置了视图解析器，则返回字符串默认就是请求转发的方式，使用重定向的方式的话，直接加 `redirect`即可，但需要`注意路径问题`（需要写`/`）。

```java
@Controller
public class ResultSpringMVC2 {
    @RequestMapping("/rsm2/t1")
    public String test1(){
        //转发
        return "test";
    }

    @RequestMapping("/rsm2/t2")
    public String test2(){
        //重定向
        return "redirect:/index.jsp";
        //return "redirect:hello.do"; // hello.do为另一个请求
    }
}
```

# 数据处理

<span style="color:pink">问题一</span>：如何处理前端提交数据呢（`请求参数`）？

1）提交的参数名称 和 处理方法的参数名 一致时：直接接收就可以。

举例浏览器访问 URL ：`http://localhost:8080/hello?name=蔡徐坤`

```java
@RequestMapping("/hello")
public String hello(String name){
    System.out.println(name);
    return "hello";
}
```

2）提交的参数名称 和 处理方法的参数名 不一致时：使用 `@RequestParam` 注解(`推荐不管一致与否，都加上`)。

举例浏览器访问 URL ：`http://localhost:8080/hello?name=蔡徐坤`

```java
@RequestMapping("/hello")
public String hello(@RequestParam("name") String username){
    System.out.println(username);
    return "hello";
}
```

3）如果前端提交的是一个对象：要求提交的`表单域 和 对象的属性名一致`  , 参数使用对象即可。

举例：实体类属性为 id、name、age。表单提交 URL为 `http://localhost:8080/mvc04/user?name=蔡徐坤&id=1&age=15`

```java
@RequestMapping("/user")
public String user(User user){
    System.out.println(user);
    return "hello";
}
```

控制台打印：

```cmd
User { id=1, name='蔡徐坤', age=15 }
```

`注意`：如果表单提交的是对象的话，前端传递的参数名和对象属性名必须一致（前后端会进行`匹配`），否则传递到后端就是 `null`。



<span style="color:pink">问题二</span>：后端数据如何传递到前端进行显示呢？

1）通过 `ModelAndView` 对象进行数据的封装。

```java
public class ControllerTest implements Controller {

    public ModelAndView handleRequest(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws Exception {
        //返回一个模型视图对象
        ModelAndView mv = new ModelAndView();
        mv.addObject("msg","ControllerTest1 执行了");
        mv.setViewName("test");
        return mv;
    }
}
```

2）通过 `ModelMap` 对象进行数据的封装。

```java
@RequestMapping("/test")
public String hello(@RequestParam("username") String name, ModelMap model){
    // 封装要显示到视图中的数据
    // 相当于req.setAttribute("name",name);
    model.addAttribute("name",name);
    System.out.println(name);
    return "test";
}
```

3）通过 `Model `对象进行数据的封装。

```java
@RequestMapping("/test")
public String hello(@RequestParam("username") String name, Model model){
    //封装要显示到视图中的数据
    //相当于req.setAttribute("name",name);
    model.addAttribute("msg",name);
    System.out.println(name);
    return "test";
}
```

> 三者对比：
>
> 1）Model 只有寥寥几个方法只适合用于储存数据，简化了新手对于 Model 对象的操作和理解；
>
> 2）ModelMap 继承了 LinkedMap ，除了实现了自身的一些方法，同样的继承 LinkedMap 的方法和特性；
>
> 3）ModelAndView 可以在储存数据的同时，可以进行设置返回的逻辑视图，进行控制展示层的跳转。

# 乱码问题

​		测试发现，当表单提交数据到后端，后端再返回前端 JSP 后，可能会出现乱码，这又该如何解决呢？（`Java 后端乱码问题`）

以前乱码问题在 Servlet 中可以通过过滤器进行解决，而 SpringMVC 也提供了`过滤器`，可以在 `web.xml` 中进行配置。

`默认的过滤器`：一般使用这个即可。

```xml
<filter>
    <filter-name>encoding</filter-name>
    <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
    <init-param>
        <param-name>encoding</param-name>
        <param-value>utf-8</param-value>
    </init-param>
</filter>
<filter-mapping>
    <filter-name>encoding</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```

但是，当`请求为 get 方式或是 post 时，会发现，支持并不好`。因此需要进一步处理：

1、修改 Tomcat 的 server.xml 配置文件：设置编码。

```xml
<Connector URIEncoding="utf-8" port="8080" protocol="HTTP/1.1"
          connectionTimeout="20000"
          redirectPort="8443" />
```

2、解决 idea 控制台乱码问题：在 idea 的 tomcat 设置页面上的 vm-options 属性处填入：

```cmd
-Dfile.encoding=UTF-8
```

3、`自定义过滤器`：解决 get 和 post 请求全部乱码的过滤器。

​		这种自定义过滤器的方法在 servlet 中已经使用过，但是此处对其进一步实现，过滤效果更好。（此种方法来自网上大佬）

1）先定义一个 request 的包装增强类：MyRequest

```java
//自定义request对象，HttpServletRequest的包装类
public class MyRequest extends HttpServletRequestWrapper {

    private HttpServletRequest request;
    //是否编码的标记
    private boolean hasEncode;
    //定义一个可以传入HttpServletRequest对象的构造函数，以便对其进行装饰
    public MyRequest(HttpServletRequest request) {
        super(request);// super必须写
        this.request = request;
    }

    // 对需要增强方法 进行覆盖
    @Override
    public Map getParameterMap() {
        // 先获得请求方式
        String method = request.getMethod();
        if (method.equalsIgnoreCase("post")) {
            // post请求
            try {
                // 处理post乱码
                request.setCharacterEncoding("utf-8");
                return request.getParameterMap();
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
            }
        } else if (method.equalsIgnoreCase("get")) {
            // get请求
            Map<String, String[]> parameterMap = request.getParameterMap();
            if (!hasEncode) { // 确保get手动编码逻辑只运行一次
                for (String parameterName : parameterMap.keySet()) {
                    String[] values = parameterMap.get(parameterName);
                    if (values != null) {
                        for (int i = 0; i < values.length; i++) {
                            try {
                                // 处理get乱码
                                values[i] = new String(values[i]
                                        .getBytes("ISO-8859-1"), "utf-8");
                            } catch (UnsupportedEncodingException e) {
                                e.printStackTrace();
                            }
                        }
                    }
                }
                hasEncode = true;
            }
            return parameterMap;
        }
        return super.getParameterMap();
    }

    //取一个值
    @Override
    public String getParameter(String name) {
        Map<String, String[]> parameterMap = getParameterMap();
        String[] values = parameterMap.get(name);
        if (values == null) {
            return null;
        }
        return values[0]; // 取回参数的第一个值
    }

    //取所有值
    @Override
    public String[] getParameterValues(String name) {
        Map<String, String[]> parameterMap = getParameterMap();
        String[] values = parameterMap.get(name);
        return values;
    }
}
```

2）编写自定义过滤器：GenericEncodingFilter

```java
public class GenericEncodingFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        //处理response的字符编码
        HttpServletResponse response=(HttpServletResponse) servletResponse;
        response.setContentType("text/html;charset=UTF-8");

        // 转型为与协议相关对象
        HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;
        // 对request包装增强
        HttpServletRequest myRequest = new MyRequest(httpServletRequest);
        filterChain.doFilter(myRequest, servletResponse);
    }

    @Override
    public void destroy() {

    }
}
```

3）配置文件 web.xml 进行注册：

```xml
<!-- 配置 自定义过滤器-->
<filter>
    <filter-name>encodingFilter</filter-name>
    <filter-class>com.example.filter.GenericEncodingFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>encodingFilter</filter-name>
    <url-pattern>/</url-pattern>
</filter-mapping>
```

​		get、post 方法进行测试发现均无乱码出现。

# JSON 交互

> 前后端分离时代：
>
> 后端部署后端，提供服务接口。
>
> 前端单独部署。

## JSON 概念

​		JSON (JavaScript Object Notation, JS 对象标记) 是一种轻量级的`数据交换格式`。JSON 采用完全独立于编程语言的文本格式来`存储和表示数据`，具有简洁和清晰的层次结构，易于阅读和编写，同时也易于机器解析和生成，并能够有效地提升网络传输效率。

​		对 Java 来说，就是一个字符串。

任何 JavaScript 支持的类型都可以通过 JSON 来表示，例如字符串、数字、对象、数组等。JSON 的要求和语法格式：

1）对象表示为键值对，数据由逗号分隔。

2）花括号保存对象，方括号保存数组。

​		`JSON 键值对`是用来保存 JavaScript 对象的一种方式，和 JavaScript 对象的写法也大同小异，键/值对组合中的键名写在前面并用双引号 " " 包裹，使用冒号 : 分隔，然后紧接着值，示例：

```javascript
{"name": "QinJiang"}
{"age": "3"}
{"sex": "男"}
```

> JSON 和 js 对象的区别：JSON 是 JavaScript 对象的字符串表示法，它使用文本表示一个 JS 对象的信息，本质是一个字符串。
>
> JSON ：本质是一个字符串。
>
> ```js
> var json = '{"a": "Hello", "b": "World"}';
> ```
>
> js 对象：本质是一个对象，键名也是可以使用引号包裹。
>
> ```js
> ar obj = {a: 'Hello', b: 'World'};
> ```

Json 和 JavaScript 对象的转换：

1）Json 字符串转 JavaScript 对象，使用 parse 函数：

```js
var obj = JSON.parse('{"a": "Hello", "b": "World"}');
```

2）JavaScript 对象转换为JSON字符串，使用 stringify 函数：

```js
var json = JSON.stringify({a: 'Hello', b: 'World'});

```

代码测试：新建 index1.html。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
</body>
<script type="text/javascript">
    var user = {
        name:"蔡徐坤",
        hobby:"唱跳Rap打篮球",
        sex:"女"
    }

    // 对象转 json
    var jsonStr = JSON.stringify(user);
    console.log(jsonStr);
	// 结果：'{"name":"蔡徐坤","hobby":"唱跳Rap打篮球","sex":"女"}'
    //json 转 对象
    var temp = JSON.parse(jsonStr);
    console.log(temp.name,temp.hobby,temp.sex);
    // 结果：'蔡徐坤' '唱跳Rap打篮球' '女'
</script>
</html>
```

## Controller 处理 JSON

​		Java 后端处理 JSON 可以使用 工具类：`Jackson`(目前最好的 json 解析工具)。

1、导入 Jackson 的依赖包：

```xml
<!-- https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-core -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.9.8</version>
</dependency>
```

2、编写 实体类 User：

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private String name;
    private int age;
    private String sex;
}
```

3、编写 controller 进行测试：`@ResponseBody 表示返回值并不是页面，而是单纯的字符串`。

```java
@Controller
public class UserController {

    @RequestMapping(value = "/json", produces = "application/json;charset=utf-8")
    @ResponseBody
    public String getJson() throws JsonProcessingException {
        //ObjectMapper:jackson的对象映射器，用来解析数据
        ObjectMapper mapper = new ObjectMapper();
        User user = new User("蔡徐坤", 35, "女");
        //将我们的对象解析成为 json 格式
        String str = mapper.writeValueAsString(user);
        //由于 @ResponseBody 注解，这里会将str转成 json 格式返回，十分方便
        return str;
    }
}
```

> 内容解释：
>
> 1）@ResponseBody：将返回值的 string 转为 json 格式，同时`不经过视图解析器`，而是会直接以`字符串`方式返回。
>
> 2）`produces = "application/json;charset=utf-8"` 设置 json 数据传到前端，避免出现乱码。（produces 用于设置文本类型和编码）
>
> 3）ObjectMapper 对象：jackson 的对象映射器，用来解析数据，使用 writeValueAsString 方法将对象转成 Json 字符串。

但实际上，Spring 和 Jackson 搭配有 Json 专有的统一乱码处理方式：`springmvc-servlet.xml 配置`添加一段消息 StringHttpMessageConverter 转换配置。

```xml
<mvc:annotation-driven>
    <mvc:message-converters register-defaults="true">
        <bean class="org.springframework.http.converter.StringHttpMessageConverter">
            <constructor-arg value="UTF-8"/>
        </bean>
        <bean class="org.springframework.http.converter.json.MappingJackson2HttpMessageConverter">
            <property name="objectMapper">
                <bean class="org.springframework.http.converter.json.Jackson2ObjectMapperFactoryBean">
                    <property name="failOnEmptyBeans" value="false"/>
                </bean>
            </property>
        </bean>
    </mvc:message-converters>
</mvc:annotation-driven>
```

<span style="color:pink">注意事项：</span>

1、Json 格式返回的统一解决方案：@RestController 注解

​		在类上直接使用 `@RestController` 注解，里面所有的方法都只会返回 Json 字符串了，都不会经过视图解析器，不需要在每一个方法上都添加 @ResponseBody 注解，在前后端分离开发中，一般都使用 @RestController 。

2、当需要传递到前端的 Json 数据是一个集合又会是怎么样呢？

​		增加新的方法进行测试：（以 list 进行测试）

```java
@RequestMapping(value = "/jsonList", produces = "application/json;charset=utf-8")
@ResponseBody
public String getJsonList() throws JsonProcessingException {
    List<User> users = new ArrayList<>();
    ObjectMapper mapper = new ObjectMapper();
    User user1 = new User("蔡徐坤1", 35, "女");
    User user2 = new User("蔡徐坤2", 35, "男");
    User user3 = new User("蔡徐坤3", 35, "女");
    User user4 = new User("蔡徐坤4", 35, "男");
    users.add(user1);
    users.add(user2);
    users.add(user3);
    users.add(user4);
    String result = mapper.writeValueAsString(users);
    return result;
}
```

​		测试结果：实际上这是个字符串。

```cmd
[
    {
        "name": "蔡徐坤1",
        "age": 35,
        "sex": "女"
    },
    {
        "name": "蔡徐坤2",
        "age": 35,
        "sex": "男"
    },
    {
        "name": "蔡徐坤3",
        "age": 35,
        "sex": "女"
    },
    {
        "name": "蔡徐坤4",
        "age": 35,
        "sex": "男"
    }
]
```

3、如果需要输出时间对象 Json 字符串：

```java
@RequestMapping(value = "/jsonTime", produces = "application/json;charset=utf-8")
@ResponseBody
public String getTime() throws JsonProcessingException {
    Date date = new Date();
    return new ObjectMapper().writeValueAsString(date);
}
```

此时发现输出一个：`1653313075583`，这是时间戳：代表 1970年1月1日 到当前日期的毫秒数。（`Jackson 默认是会把时间转成timestamps形式`）

因此需要自定义时间格式，注入到 ObjectMapper 对象中，让其 先将时间进行转化格式，再转化为 Json 字符串：

```java
@RequestMapping(value = "/jsonTimeSimple", produces = "application/json;charset=utf-8")
@ResponseBody
public String getTimeSimple() throws JsonProcessingException {
    ObjectMapper mapper = new ObjectMapper();
    //禁用时间戳的方式
    mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    //自定义日期格式对象
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    //指定 ObjectMapper 里面时间的格式
    mapper.setDateFormat(sdf);

    Date date = new Date();
    return mapper.writeValueAsString(date);
}
```

测试结果：`"2022-05-23 21:38:45"`。

> 封装成工具类使用：以后使用直接 `JsonUtils.getJson()` 即可。
>
> ```java
> public class JsonUtils {
> 
>     //获取默认格式的 json 字符串，不传入时间格式，采用默认时间格式
>     public static String getJson(Object object) {
>         return getDateJson(object,"yyyy-MM-dd HH:mm:ss");
>     }
> 
>     // 获取默认格式的 json 字符串，当传入时间格式时，时间转化为对应格式
>     public static String getJson(Object object,String dateFormat) {
>         ObjectMapper mapper = new ObjectMapper();
>         //不使用时间差的方式
>         mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
>         //自定义日期格式对象
>         SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);
>         //指定日期格式
>         mapper.setDateFormat(sdf);
>         try {
>             return mapper.writeValueAsString(object);
>         } catch (JsonProcessingException e) {
>             e.printStackTrace();
>         }
>         return null;
>     }
> }
> ```

## FastJson

​	`Fastjson` 是阿里开发的一款专门用于 Java 开发的包，可以方便的实现：

1）Json 对象 与 JavaBean 对象的转换。

2） JavaBean 对象 与 json 字符串的转换。

3）实现 json对象 与 json 字符串的转换。

FastJson 依赖：（注意 2022 年 5 月 24 日发现 FastJson 1.2.80 之前版本存在反序列化漏洞）

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.83</version>
</dependency>
```

> FastJson 三个主要类：
>
> 1、JSONObject ：代表 Json 对象，JSONObject实现了Map接口，猜想 JSONObject 底层操作是由 `Map` 实现的。
>
> 2、JSONArray：代表 Json 对象数组，内部是用 `List` 接口中的方法来完成操作的。
>
> 3、JSON：代表 JSONObject 和 JSONArray 的转化，
>
> 主要是实现 Json 对象，Json 对象数组，Javabean 对象，Json 字符串之间的相互转化。

代码测试：

```java
public class FastJsonDemo {
    public static void main(String[] args) {
        //创建一个对象
        User user1 = new User("秦疆1号", 3, "男");
        User user2 = new User("秦疆2号", 3, "男");
        User user3 = new User("秦疆3号", 3, "男");
        User user4 = new User("秦疆4号", 3, "男");
        List<User> list = new ArrayList<User>();
        list.add(user1);
        list.add(user2);
        list.add(user3);
        list.add(user4);

        System.out.println("*******Java对象 转 JSON字符串*******");
        String str1 = JSON.toJSONString(list);
        System.out.println("JSON.toJSONString(list)==>"+str1);
        String str2 = JSON.toJSONString(user1);
        System.out.println("JSON.toJSONString(user1)==>"+str2);

        System.out.println("\n****** JSON字符串 转 Java对象*******");
        User jp_user1=JSON.parseObject(str2,User.class);
        System.out.println("JSON.parseObject(str2,User.class)==>"+jp_user1);

        System.out.println("\n****** Java对象 转 JSON对象 ******");
        JSONObject jsonObject1 = (JSONObject) JSON.toJSON(user2);
        System.out.println("(JSONObject) JSON.toJSON(user2)==>"+jsonObject1.getString("name"));

        System.out.println("\n****** JSON对象 转 Java对象 ******");
        User to_java_user = JSON.toJavaObject(jsonObject1, User.class);
        System.out.println("JSON.toJavaObject(jsonObject1, User.class)==>"+to_java_user);
    }
}
```

# 整合 SSM 

SSM：Mybatis + Spring + SpringMVC，以书城项目为例`整合 SSM 框架`。

## 搭建项目基本框架

1、数据库设计

```sql
CREATE DATABASE `ssmbuild`;

USE `ssmbuild`;

DROP TABLE IF EXISTS `books`;

CREATE TABLE `books` (
`bookID` INT(10) NOT NULL AUTO_INCREMENT COMMENT '书id',
`bookName` VARCHAR(100) NOT NULL COMMENT '书名',
`bookCounts` INT(11) NOT NULL COMMENT '数量',
`detail` VARCHAR(200) NOT NULL COMMENT '描述',
KEY `bookID` (`bookID`)
) ENGINE=INNODB DEFAULT CHARSET=utf8

INSERT  INTO `books`(`bookID`,`bookName`,`bookCounts`,`detail`)VALUES
(1,'Java',1,'从入门到放弃'),
(2,'MySQL',10,'从删库到跑路'),
(3,'Linux',5,'从进门到进牢');
```

2、搭建项目，解决静态资源编译导出问题，导入依赖：junit、MySQL 驱动、连接池、Servlet、Jsp、Mybatis、Mybatis-Spring、Spring。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>ssmBuild</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
    </properties>
    <dependencies>
        <!-- junit 测试 -->
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13.2</version>
        </dependency>
        <!-- mysql 驱动 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.27</version>
        </dependency>
        <!-- C3P0 数据库连接池(之前是 dbcp 连接池) -->
        <dependency>
            <groupId>com.mchange</groupId>
            <artifactId>c3p0</artifactId>
            <version>0.9.5.5</version>
        </dependency>
        <!-- Servlet 和 JSP -->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>servlet-api</artifactId>
            <version>2.5</version>
        </dependency>
        <dependency>
            <groupId>javax.servlet.jsp</groupId>
            <artifactId>jsp-api</artifactId>
            <version>2.1</version>
        </dependency>
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>jstl</artifactId>
            <version>1.2</version>
        </dependency>
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>3.5.6</version>
        </dependency>
        <!-- spring 整合 mybatis-->
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis-spring</artifactId>
            <version>2.0.6</version>
        </dependency>
        <!-- spring 相关设置 -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
            <version>5.3.17</version>
        </dependency>
        <!-- Spring 数据源设置-->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-jdbc</artifactId>
            <version>5.3.10</version>
        </dependency>
        <!-- lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.24</version>
        </dependency>
    </dependencies>


    <!-- 设置资源过滤 -->
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
</project>
```

3、建立项目基本结构：mapper、service、controller、pojo、utils，同时创建配置文件：

1）mybatis 配置文件：mybatis-config.xml，制作一些简单的事：`配置包别名 和 映射 mapper 文件，以及 设置`。

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
       PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
       "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
	<!-- 设置默认日志 -->
    <settings>
        <setting name="logImpl" value="STDOUT_LOGGING"/>
    </settings>
    <!-- 配置别名 -->
    <typeAliases>
        <package name="com.example.pojo"/>
    </typeAliases>
</configuration>
```

2）spring 配置文件：applicationContext.xml

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

</beans>
```

3）MySQL 数据库连接配置文件：jdbc.properties（8.0 MySQL）

```properties
driver=com.mysql.cj.jdbc.Driver
url=jdbc:mysql://localhost:3306/ssmBuild?useSSL=true&useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
username=root
password=123456
```

4、编写测试 mapper，完善项目可能的功能。

1）编写实体类：Books

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Books {
    private int bookID;
    private String bookName;
    private int bookCounts;
    private String detail;
}
```

2）编写对应的 mapper 接口：BooksMapper 

```java
public interface BooksMapper {
    List<Books> getBooksList();
}
```

3）编写 mapper 接口的实现配置：BooksMapper.xml 

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.BooksMapper">
    <select id="getBooksList" resultType="Books">
        select * from books
    </select>
</mapper>
```

4）将 mapper 注册到 mybatis 配置文件：mybatis-config.xml

```xml
<!-- 注册 mapper 文件-->
<mappers>
    <mapper resource="com/example/mapper/BooksMapper.xml"></mapper>
</mappers>
```

5）编写对应的 service 业务层接口：BooksService 

```java
public interface BooksService {
    List<Books> getBooksList();
}
```

6）编写 service 的实现：BooksServiceImpl （`未注入到 IOC 容器时的方式`）

```java
public class BooksServiceImpl implements BooksService {

    private BooksMapper booksMapper;

    //使用 set 方式方便 spring 管理
    public void setBooksMapper(BooksMapper booksMapper) {
        this.booksMapper = booksMapper;
    }

    @Override
    public List<Books> getBooksList() {
        return booksMapper.getBooksList();
    }
}
```

至此，项目基本结构已经创建好，此时就要考虑`使用 Spring 来将 Mybatis 整合`。

## Spring 整合 Mybatis

1、编写 Spring 整合 Mybatis 的配置文件：`spring-mybatis.xml`（实际就是一个 `spring 子配置文件`）

​		注意：此处使用的是 C3P0 连接池，不是之前的 dbcp 连接池。

1）引入数据库文件，得到数据库连接信息。（import 只能导入 spring 的配置文件）

2）配置数据库连接池，设置数据源。

> dbcp：半自动化操作，不能自动连接。
>
> c3p0：自动化操作，自动加载配置文件，并且可以自动设置到对象中。

3）配置 数据库操作对象：`SqlSessionFactory 对象`，将其注入到 IOC 容器。

4）配置扫描 Dao 接口包，动态实现 Dao 接口注入到 spring 容器中。（`新增`）`避免直接使用 mapper 的实现类`。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       https://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/context
       https://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/mvc https://www.springframework.org/schema/mvc/spring-mvc.xsd">
    <!-- 此文件用于将 spring 和 mybatis 结合起来，包含一些结合的信息-->
    <!-- 引入数据库配置文件 -->
    <context:property-placeholder location="classpath:jdbc.properties" local-override="true"></context:property-placeholder>
    <!-- 配置数据库连接池：使用 c3p0 数据源 -->
    <bean id="dataSource" class="com.mchange.v2.c3p0.ComboPooledDataSource">
        <property name="driverClass" value="${driver}"></property>
        <property name="jdbcUrl" value="${url}"></property>
        <property name="user" value="${username}"></property>
        <property name="password" value="${password}"></property>
        <!-- c3p0 可选的一些选项（一般数据源没有）-->
        <property name="maxPoolSize" value="30"/>
        <property name="minPoolSize" value="10"/>
        <!-- 关闭连接后不自动commit：采用 Spring 的事务管理器管理事务 -->
        <property name="autoCommitOnClose" value="false"/>
        <!-- 获取连接超时时间 -->
        <property name="checkoutTimeout" value="10000"/>
        <!-- 当获取连接失败重试次数 -->
        <property name="acquireRetryAttempts" value="2"/>
    </bean>

    <!-- 配置 SqlSessionFactory 数据库生产对象：SqlSessionFactoryBean-->
    <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <!-- 需要注入 datasource -->
        <property name="dataSource" ref="dataSource"></property>
        <!-- 绑定配置 mybatis 的配置文件-->
        <property name="configLocation" value="classpath:mybatis-config.xml"></property>
    </bean>

    <!-- 配置扫描 mapper 接口，动态实现 mapper 接口注入到 spring 容器中，避免直接使用 mapper 的实现类 -->
    <!-- 取代了原来的 sqlSessionTemplate 的注入操作 -->
    <bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
        <!-- 注入 sqlSessionFactory，目前 sqlSessionTemplate 已过时 -->
        <property name="sqlSessionFactoryBeanName" value="sqlSessionFactory"></property>
        <!-- 配置要扫描的 mapper 包，这样之后 mapper 的实现类就不需要了（反射）-->
        <property name="basePackage" value="com.example.mapper"></property>
    </bean>
</beans>
```

2、Spring 整合 Service 层，同时配置事务：`spring-service.xml`

1）开启包扫描，使 service 层注解生效 @Service。

2）将 BookServiceImpl 注入到 IOC 容器，实际上可以使用注解。

3）配置 Spring 默认的事务管理器，注入数据库连接池（需要注入使用的连接池）。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       https://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/context
       https://www.springframework.org/schema/context/spring-context.xsd">

    <!-- 扫描 service 相关的包，让注解 @Service 生效-->
    <context:component-scan base-package="com.example.service"></context:component-scan>

    <!-- 将 service 类注入到 Spring IOC 容器：可以使用 配置 或是 注解 @Service,此处使用 注解 -->
    <!--<bean id="BooksServiceImpl" class="com.example.service.impl.BooksServiceImpl">
        <property name="booksMapper" ref="bookMapper"></property>
    </bean>-->

    <!-- 配置事务管理器 ：默认 aop 横切插入-->
    <bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <!-- 注入数据库连接池，使用 mybatis 里面注册的那个-->
        <property name="dataSource" ref="dataSource"></property>
    </bean>
    
    <!-- 结合 aop 事务支持：事务增强 -->
    <!-- 配置事务通知 -->
    <tx:advice id="txAdvice" transaction-manager="transactionManager">
        <!-- 给哪些方法添加事务 -->
        <tx:attributes>
            <tx:method name="*" propagation="REQUIRED"/>
        </tx:attributes>
    </tx:advice>
    <!-- 配置事务切入 -->
    <aop:config>
        <aop:pointcut id="txPointcut" expression="execution(* com.example.mapper..*.*(..))"/>
        <aop:advisor advice-ref="txAdvice" pointcut-ref="txPointcut"></aop:advisor>
    </aop:config>
</beans>
```

此处 service 的注入使用注解，因此 修改 Service 实现：BooksServiceImpl：

```java
@Service("BookService")
public class BooksServiceImpl implements BooksService {

    //组合 mapper 层
    @Autowired
    private BooksMapper booksMapper;

    //使用 set 方式方便 spring 管理
    public void setBooksMapper(BooksMapper booksMapper) {
        this.booksMapper = booksMapper;
    }

    @Override
    public List<Books> getBooksList() {
        return booksMapper.getBooksList();
    }

    @Override
    public boolean addBooks(Books books) {
        int result = booksMapper.addBooks(books);
        return result > 0 ? true : false;
    }

    @Override
    public boolean deleteBooksById(int booksId) {
        int result = booksMapper.deleteBooksById(booksId);
        return result > 0 ? true : false;
    }

    @Override
    public boolean updateBooks(Books books) {
        int result = booksMapper.updateBooks(books);
        return result > 0 ? true : false;
    }

    @Override
    public Books getBooksById(int booksId) {
        return booksMapper.getBooksById(booksId);
    }
}
```

## Spring 整合 mvc

1、web 配置文件 `web.xml`文件配置 Servlet调度器 `DispatcherServlet`，加载 总的配置文件 `applicationContext.xml`，同时开启默认的编码过滤器。

> 如果后续 Tomcat 启动报错：`找不到 CharacterEncodingFilter 类`，检查 jar 包的导入问题：Project Structure ---> Artifacts ----> 检查该项目下WEB-INF目录下 lib 目录是否存在，存在检查 jar 包，不存在则新建 lib 目录，导入所有需要的 jar 包。
>
> 注意：`此处 springmvc 加载总配置文件`，报错问题后续解释。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">

    <!-- 引入 Servlet 调度器：DispatcherServlet -->
    <servlet>
        <servlet-name>DispatcherServlet</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <!-- 加载相关配置文件（总配置文件）-->
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:applicationContext.xml</param-value>
        </init-param>
        <!-- 设置运行级别 1，和 Tomcat 一起启动 -->
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>DispatcherServlet</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>

    <!-- 配置 spring 默认的过滤器 -->
    <filter>
        <filter-name>CharacterEncodingFilter</filter-name>
        <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
        <init-param>
            <param-name>encoding</param-name>
            <param-value>utf-8</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>CharacterEncodingFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>

    <!-- 为了安全：配置 session 过期时间：15min-->
    <session-config>
        <session-timeout>15</session-timeout>
    </session-config>
</web-app>
```

2、编写 Spring 整合 mvc 的配置文件：`spring-mvc.xml`（就是之前的 `springmvc-servlet.xml`）（实际就是一个 `spring 子配置文件`）

1）开启 SpringMVC 注解驱动：提供注解支持，自动注册 RequestMappingHandlerMapping 与 RequestMappingHandlerAdapter。

2）过滤静态资源默认 servlet 配置。

3）配置 jsp 显示 ViewResolver 视图解析器。

4）扫描 web 相关的 bean，使注解生效。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
   http://www.springframework.org/schema/beans/spring-beans.xsd
   http://www.springframework.org/schema/context
   http://www.springframework.org/schema/context/spring-context.xsd
   http://www.springframework.org/schema/mvc
   https://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <!-- 配置 springmvc -->
    <!--开启 springmvc 注解驱动 @Controller 等，如果使用 json，还需要配置 json 解析-->
    <mvc:annotation-driven></mvc:annotation-driven>
    <!-- 静态资源过滤，避免拦截 -->
    <mvc:default-servlet-handler></mvc:default-servlet-handler>

    <!-- 配置 jsp 页面的视图解析器-->
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="prefix" value="/WEB-INF/jsp/"></property>
        <property name="suffix" value=".jsp"></property>
    </bean>

    <!-- 扫描 web 相关的 bean：controller，使此包下的注解生效 -->
    <context:component-scan base-package="com.example.controller"></context:component-scan>
</beans>
```

## 请求和页面

1、至此，所有的配置文件编写完成，但是并没有整合到一起，通过 Spring 的主配置文件：`applicationContext.xml` 来`整合`所有的配置文件：

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
    
    <!-- 引入 其他包进行合并配置文件 -->
    <import resource="spring-mybatis.xml"></import>
    <import resource="spring-service.xml"></import>
    <import resource="spring-mvc.xml"></import>

</beans>
```

2、控制器编写：BooksController 。（@Qualifier("BookService") 可省略）

```java
@Controller
@RequestMapping("/book")
public class BookController {

    @Autowired
    @Qualifier("BookService")
    private BooksService booksService;

    //查询全部书籍返回页面
    @RequestMapping("/books")
    public String books(Model model){
        List<Books> booksList = booksService.getBooksList();
        model.addAttribute("books", booksList);
        return "bookList";
    }
}
```

3、修改首页欢迎页样式，添加超链接 index.jsp：

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE HTML>
<html>
<head>
  <title>首页</title>
  <style type="text/css">
    a {
      text-decoration: none;
      color: black;
      font-size: 18px;
    }
    h3 {
      width: 180px;
      height: 38px;
      margin: 100px auto;
      text-align: center;
      line-height: 38px;
      background: deepskyblue;
      border-radius: 4px;
    }
  </style>
</head>
<body>
<h3>
  <a href="${pageContext.request.contextPath}/book/books">点击进入列表页</a>
</h3>
</body>
</html>
```

3、编写对应的跳转视图：书籍列表页面 bookList.jsp

```jsp
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>书籍列表</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- 引入 Bootstrap：会导致页面加载缓慢 -->
    <link href="https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

<div class="container">
    <%-- 栅格系统块级元素都是浮动的，clearfix 清除浮动 --%>
    <div class="row clearfix">
        <div class="col-md-12 column">
            <div class="page-header">
                <h1>
                    <small>书籍列表 —————— 显示所有书籍</small>
                </h1>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-4 column">
            <a class="btn btn-primary" href="${pageContext.request.contextPath}/book/toAddBooksPage">新增</a>
        </div>
    </div>

    <div class="row clearfix">
        <div class="col-md-12 column">
            <table class="table table-hover table-striped">
                <thead>
                    <tr>
                        <th>书籍编号</th>
                        <th>书籍名字</th>
                        <th>书籍数量</th>
                        <th>书籍详情</th>
                        <th>操作</th>
                    </tr>
                </thead>

                <tbody>
                    <%-- 从 list 里面遍历出来进行显示 --%>
                    <c:forEach var="book" items="${books}">
                        <tr>
                            <td>${book.bookID}</td>
                            <td>${book.bookName}</td>
                            <td>${book.bookCounts}</td>
                            <td>${book.detail}</td>
                            <td>
                                <a href="${pageContext.request.contextPath}/book/toUpdateBookPage/${book.bookID}">更改</a> |
                                <a href="${pageContext.request.contextPath}/book/del/${book.bookID}">删除</a>
                            </td>
                        </tr>
                    </c:forEach>
                </tbody>
            </table>
        </div>
    </div>
</div>
```

> 出现问题时，例如 500 ServletException：bean 找不到？那如何排错呢？（`上面的代码并不会出现这个问题`）
>
> 1）查看配置文件或注解上 bean 是否注入成功。
>
> 2）Junit 测试底层代码是否有问题（注意加载`总配置文件`）。
>
> ```java
> public class MyTest {
>     @Test
>     public void test(){
>         ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
>         BooksService bookService = context.getBean("BookService", BooksService.class);
>         List<Books> booksList = bookService.getBooksList();
>         for (Books books : booksList) {
>             System.out.println(books);
>         }
>     }
> }
> ```
>
> 3）问题不是底层代码问题，而是 spring 出现问题。
>
> 此时测试直接 new 一个 service 对象：（理论上能成功，但实际上还是有问题）
>
> ```java
> private BooksService booksService = new BooksServiceImpl();
> ```
>
> 继续报错：500 NullPointException 空指针异常，但是 Junit 测试结果是有结果的，说明 `springmvc 整合的时候没有调到 service 层的 bean`。
>
> - 第一种可能性：applicationContext.xml 里面没有注入 bean。（配置文件未合并）
> - 第二种可能性：web.xml 也绑定过配置文件，`检查 其绑定的配置文件是否是 总配置文件 applicationContext.xml`。
>
> 此时便确定能够拿到 bean。

4、其他功能实现：

Controller：

```java
@Controller
@RequestMapping("/book")
public class BookController {

    @Autowired
    @Qualifier("BookService")
    private BooksService booksService;

    //查询全部书籍返回页面
    @RequestMapping("/books")
    public String books(Model model){
        List<Books> booksList = booksService.getBooksList();
        model.addAttribute("books", booksList);
        return "bookList";
    }

    @RequestMapping("/toAddBooksPage")
    public String toAddBooksPage(){
        return "addBook";
    }

    @RequestMapping("/addBook")
    public String addBook(Model model, Books books){
        boolean flag = booksService.addBooks(books);
        if (flag) return "redirect:/book/books";
        else {
            model.addAttribute("message", "添加失败");
            return "redirect:/book/toAddBooksPage";
        }
    }


    @RequestMapping("/toUpdateBookPage/{id}")
    public String toUpdateBookPage(Model model, @PathVariable("id") int bookId){
        Books booksById = booksService.getBooksById(bookId);
        model.addAttribute("book", booksById);
        return "updateBook";
    }

    @RequestMapping("/updateBook")
    public String updateBook(Model model, Books books){
        boolean flag = booksService.updateBooks(books);
        if (flag) return "redirect:/book/books";
        else {
            model.addAttribute("message", "修改失败");
            return "redirect:/book/toUpdateBookPage/{" + books.getBookID() + "}";
        }
    }

    @RequestMapping("/del/{id}")
    public String delBook(@PathVariable("id") int bookId, Model model){
        boolean flag = booksService.deleteBooksById(bookId);
        if (flag) return "redirect:/book/books";
        else {
            model.addAttribute("message", "修改失败");
            return "redirect:/book/books";
        }
    }
}
```

新增功能页面：addBook.jsp

```jsp
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<html>
<head>
    <title>新增书籍</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- 引入 Bootstrap -->
    <link href="https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container">

    <div class="row clearfix">
        <div class="col-md-12 column">
            <div class="page-header">
                <h1>
                    <small>新增书籍</small>
                </h1>
            </div>
        </div>
    </div>
    ${message}
    <form action="${pageContext.request.contextPath}/book/addBook" method="post">
        书籍名称：<input type="text" name="bookName"><br><br><br>
        书籍数量：<input type="text" name="bookCounts"><br><br><br>
        书籍详情：<input type="text" name="detail"><br><br><br>
        <input type="submit" value="添加">
    </form>

</div>
```

修改功能页面：updateBook.jsp

```jsp
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>修改信息</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- 引入 Bootstrap -->
    <link href="https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container">

    <div class="row clearfix">
        <div class="col-md-12 column">
            <div class="page-header">
                <h1>
                    <small>修改信息</small>
                </h1>
            </div>
        </div>
    </div>
    ${message}
    <form action="${pageContext.request.contextPath}/book/updateBook" method="post">
        <input type="hidden" name="bookID" value="${book.bookID}"/>
        书籍名称：<input type="text" name="bookName" value="${book.bookName}"/>
        书籍数量：<input type="text" name="bookCounts" value="${book.bookCounts}"/>
        书籍详情：<input type="text" name="detail" value="${book.detail}"/>
        <input type="submit" value="提交"/>
    </form>
</div>
```

> 前端页面的编写：可以使用 `可视化布局` 例如：bootstrap 可视化布局。

增加需求：根据书籍名称查找书籍

controller：

```java
@RequestMapping("/queryBook")
public String queryBookByName(Model model, String queryBookName){
    if ("".equals(queryBookName.trim()) || queryBookName.length() <= 0){
        return "redirect:/book/books";
    }
    queryBookName = "%" + queryBookName + "%";
    System.err.println(queryBookName);
    Books book = booksService.getBookByName(queryBookName.trim());

    List<Books> list = new ArrayList<>();
    list.add(book);
    model.addAttribute("books", list);
    return "bookList";
}
```

前端页面：

```jsp
<div class="col-md-4 column">
    <%-- 查询书籍 --%>
    <form action="${pageContext.request.contextPath}/book/queryBook" method="get" class="form-inline">
        <input type="text" name="queryBookName" class="form-control" placeholder="请输入书籍名称">
        <input type="submit" value="查询" class="btn btn-primary">
    </form>
</div>
```

mapper 文件：mapper.xml 

```xml
<select id="getBookByName" resultType="com.example.pojo.Books" parameterType="string">
    select * from books where bookName like #{bookName}
</select>
```

# Ajax 技术

​		`Ajax 技术`：Asynchronous JavaScript and XML（`异步的 JavaScript 和 XML`），是一种在无需重新加载整个网页的情况下，能够更新`网页局部`的技术，是一种用于创建更好更快以及`交互性更强`的 Web 应用程序的技术。

​		举例：百度的搜索框。

## 伪造 Ajax

​		Html 中有一个类似于 Ajax 无刷新页面的效果的组件：iframe，可以实现页面不刷新，但是中间显示页面变化。（`局部刷新`）

```html
<!DOCTYPE html>
<html>
<head lang="en">
   <meta charset="UTF-8">
   <title>kuangshen</title>
</head>
<body>

<script type="text/javascript">
   window.onload = function(){
       var myDate = new Date();
       document.getElementById('currentTime').innerText = myDate.getTime();
  };

   function LoadPage(){
       var targetUrl =  document.getElementById('url').value;
       console.log(targetUrl);
       document.getElementById("iframePosition").src = targetUrl;
  }

</script>

<div>
   <p>请输入要加载的地址：<span id="currentTime"></span></p>
   <p>
       <input id="url" type="text" value="https://www.baidu.com/"/>
       <input type="button" value="提交" onclick="LoadPage()">
   </p>
</div>

<div>
   <h3>加载页面位置：</h3>
   <iframe id="iframePosition" style="width: 100%;height: 500px;"></iframe>
</div>

</body>
</html>
```

Ajax 的作用：

1）注册时，输入用户名自动检测用户是否已经存在。

2）登陆时，提示用户名密码错误。

3）删除数据行时，将 ID 发送到后台，后台在数据库中删除，数据库删除成功后，在页面 DOM 中将数据行也删除。

## JQuery.ajax

> JS原生Ajax：`XMLHttpRequest  对象`，Ajax的核心是 XMLHttpRequest对象(XHR)。XHR 为向服务器发送请求和解析服务器响应提供了接口，能够以异步方式从服务器获取新数据，但直接使用`原生的 XHR 对象 过于复杂`。
>
> 因此使用 JQuery 封装好的 Ajax 即可。

​		通过 JQuery AJAX 方法，能够使用 HTTP Get 和 HTTP Post 从远程服务器上请求`文本`、`HTML`、`XML` 或 `JSON` ， 同时您能够`把这些外部数据直接载入网页的被选元素中`。但 JQuery 不是生产者，而是搬运工，其本质就是 XMLHttpRequest，只是对他进行了封装，方便调用！

​		`关键点`：Ajax 把页面跳转的主动权交给了前端。

> `JQuery.ajax()` 参数说明：
>
> 1）`url`：请求地址。
>
> 2）`type`：请求方式（get 或 post），1.9 版本后使用 method 属性。
>
> 3）`data`：请求参数。
>
> 4）headers：请求头。
>
> 5）`contentType`：即将发送信息至服务器的内容编码类型 (默认: "application/x-www-form-urlencoded; charset=UTF-8")。
>
> 5）`async`：是否异步。
>
> 7） success：成功之后执行的回调函数(全局)。
>
> 8）error：失败之后执行的回调函数(全局)。

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE HTML>
<html>
<head>
  <title>首页</title>
  <style type="text/css">
    a {
      text-decoration: none;
      color: black;
      font-size: 18px;
    }
    h3 {
      width: 180px;
      height: 38px;
      margin: 100px auto;
      text-align: center;
      line-height: 38px;
      background: #93cee2;
      border-radius: 4px;
    }
  </style>
  <script src="${pageContext.request.contextPath}/statics/js/jquery-3.6.0.js"></script>
</head>
<body>
<h3>
  <a href="${pageContext.request.contextPath}/book/books">点击进入列表页</a>
</h3>
  <%-- 测试：失去焦点触发一次 --%>
  用户名:<input type="text" id="txtName" onblur="test()">
</body>
<script>
  function test(){
    $.ajax({
      url: "${pageContext.request.contextPath}/test",
      data: {
        name: $("#txtName").val()
      },
      success:function (data, status){
        console.log(data);
        console.log(status);
      },
      error:function (message){
        console.log(message);
      }
    });
  }
</script>
</html>
```

测试 TestController：

```java
@RestController
public class TestController {

    @RequestMapping("/test")
    public void test(String name, HttpServletResponse response) throws IOException {
        if ("admin".equals(name)){
            response.getWriter().print("true");
        }else {
            response.getWriter().print("false");
        }
    }
}
```

> 需要注意：如果一直提示 JQuery 找不到，则是 静态资源未通过过滤，被 Springmvc 所拦截。
>
> 1）配置 mvc 放行静态资源：
>
> ```xml
> <!-- 静态资源过滤，避免拦截：检测请求的内容是否为静态资源，是就放过，否就交给servlet -->
> <mvc:default-servlet-handler></mvc:default-servlet-handler>
> ```
>
> 2）如果仍未解决，单独设置放行资源：
>
> ```xml
> <!-- 指定放行路径 -->
> <mvc:resources mapping="/js/**" location="/statics/js/"></mvc:resources>
> ```
>
> 3）删掉项目的 target 文件夹，重新运行 Tomcat，清除浏览器缓存。

测试案例：传递 Books 数据到前端显示。

前端页面：

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE HTML>
<html>
<head>
  <title>首页</title>
  <style type="text/css">
    a {
      text-decoration: none;
      color: black;
      font-size: 18px;
    }
    h3 {
      width: 180px;
      height: 38px;
      margin: 100px auto;
      text-align: center;
      line-height: 38px;
      background: #93cee2;
      border-radius: 4px;
    }
  </style>
  <script src="${pageContext.request.contextPath}/statics/js/jquery-3.6.0.js"></script>
</head>
<body>
<h3>
  <a href="${pageContext.request.contextPath}/book/books">点击进入列表页</a>
  <button id="getContent" >点击获取列表页(Ajax 版本)</button>
</h3>
<table width="80%" align="text">
  <tr>
    <th>书籍编号</th>
    <th>书籍名字</th>
    <th>书籍数量</th>
    <th>书籍详情</th>
  </tr>
  <tbody id="content">

  </tbody>
</table>
</body>
<script>

  $("#getContent").click(function (){
    $.post('${pageContext.request.contextPath}/getBookList.do', function (data){
        console.log(data);
        let html = "";
        for (let i = 0; i < data.length; i++) {
          html += "<tr>" +
                  "<td>" + data[i].bookID + "</td>" +
                  "<td>" + data[i].bookName + "</td>" +
                  "<td>" + data[i].bookCounts + "</td>" +
                  "<td>" + data[i].detail + "</td>" +
                  "</tr>";
        }
        $("#content").html(html);
      }
    )
  });

</script>
</html>
```

后端 controller 就是获取全部书籍，以 List 返回，返回时`由于加了 @RestController 注解，会被封装成 Json 格式，因此需要配置 Json 解析`，否则就会报错：

```cmd
406 错误，无法解析
```

这时需要导入 FastJson.jar 依赖：（注意看 lib 目录是否导入成功）

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.83</version>
</dependency>
```

并修改 mvc 配置文件驱动，增加 Json 配置：

```xml
<mvc:annotation-driven>
    <mvc:message-converters register-defaults="true">
        <!-- 配置Fastjson支持 -->
        <bean class="com.alibaba.fastjson.support.spring.FastJsonHttpMessageConverter">
            <property name="supportedMediaTypes">
                <list>
                    <value>application/json</value>
                    <value>text/html;charset=UTF-8</value>
                </list>
            </property>
        </bean>
    </mvc:message-converters>
</mvc:annotation-driven>
```

## 实时登录验证

​		登陆时的输入框如何做到的实时失去焦点即进行验证呢？

UserController：

```java
@RequestMapping("/login")
public String login(String username, String password){
    String message = "";
    if (username != null){
        if ("admin".equals(username)){
            message = "登陆成功";
        }else {
            message = "用户名输入错误";
        }
    }

    if (password != null){
        if ("123456".equals(password)){
            message = "登陆成功";
        }else {
            message = "密码输入错误";
        }
    }

    return message;
}
```

前端页面：login.jsp

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Title</title>
</head>
<script src="${pageContext.request.contextPath}/statics/js/jquery-3.6.0.js"></script>
<body>
    <p>
        用户名:<input type="text" id="name" onblur="testUsername()"/>
        <span id="userInfo"></span>
    </p>
    <p>
        密码:<input type="text" id="pwd" onblur="testPassword()"/>
        <span id="pwdInfo"></span>
    </p>
</body>
<script>
    function testUsername(){
        let username = $("#name").val();
        $.post({
            url: '${pageContext.request.contextPath}/login',
            data: {
                username: username
            },
            success:function (data){
                console.log(data)
                if (data === "登陆成功"){
                    $("#userInfo").css("color", "green");
                }else {
                    $("#userInfo").css("color", "red");
                }
                $("#userInfo").html(data);
            }
        })
    }

    function testPassword(){
        let password = $("#pwd").val();
        $.post({
            url: '${pageContext.request.contextPath}/login',
            data: {
                password: password
            },
            success:function (data){
                if (data === "登陆成功"){
                    $("#pwdInfo").css("color", "green");
                }else {
                    $("#pwdInfo").css("color", "red");
                }
                $("#pwdInfo").html(data);
            }
        })
    }
</script>
</html>
```

# 拦截器

SpringMVC 的处理器拦截器类似于 Servlet 开发中的 过滤器 Filter，用于对处理器进行预处理和后处理。`拦截器是 AOP 思想`。（横切进去的）

`过滤器`：是 servlet 规范中的一部分，任何 Java web 工程都可以使用，在 url-pattern 中配置了 `/*` 之后，可以对所有要访问的资源进行拦截。

`拦截器`：拦截器是 SpringMVC 框架的，只有使用了 SpringMVC 框架的工程才能使用，拦截器只会拦截访问的控制器方法， 如果访问的是 jsp、html、css、image、js这些静态资源，则并不会进行拦截。

自定义拦截器：`实现 HandlerInterceptor` 接口即可。（以登录拦截为例）

​		`需求分析`：登陆页面有一个提交表单的动作，判断用户名和密码是否正确，如果正确则向 session 中存入用户信息，返回登陆成功。后续页面跳转操作，需判断用户是否登录（是否有 session 信息），如果登录则放行，如果未登录则重定向到登录页面。

1、编写一个 HandlerInterceptor 接口的实现类，表示自定义拦截器。

```java
public class LoginInterceptor implements HandlerInterceptor {
    //前置操作：在请求处理的方法之前执行，如果返回 true 则放行执行下一个拦截器，如果返回 false 就不执行下一个拦截器就直接在此处被拦截。
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("前置操作");
        //判断什么情况没登陆：session
        HttpSession session = request.getSession();
        //登陆页面需要放行
        if (request.getRequestURI().contains("login")) return true;
        //session 里面有用户登录信息，则放行
        if (session.getAttribute("user") != null) return true;
        request.getRequestDispatcher("/WEB-INF/jsp/login.jsp").forward(request, response);
        return false;
    }
    //后置操作：在请求处理方法执行之后执行。
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {

    }

    //清理操作：在 DispatcherServlet 处理后执行，做清理工作
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {

    }
}
```

2、在 springmvc 配置文件注册拦截器。

```xml
<!-- 注册拦截器 -->
    <mvc:interceptors>
        <mvc:interceptor>
            <mvc:mapping path="/**"/>
            <bean class="com.example.interceptor.LoginInterceptor"/>
        </mvc:interceptor>
    </mvc:interceptors>
```

> 配置拦截器，path 表示拦截的请求：`/**` 表示拦截所有请求。bean 表示用 LoginInterceptor 来进行过滤。
>
> 实际上就是利用` aop 思想`。（可以使用 aop 来手动添加）

3、编写测试的 controller。

```java
@Controller
@RequestMapping("/user")
public class LoginController {

    //跳转到登陆页面进行登录
    @RequestMapping("/toLoginPage")
    public String toLoginPage(){
        return "login";
    }

    @RequestMapping("/login.do")
    public String login(String username, String password, HttpSession session){
        // 登陆时保存用户信息
        session.setAttribute("user", username);
        return "bookList";
    }

    @RequestMapping("/logout.do")
    public String logout(HttpSession session){
        //退出登录时销毁 session 信息
        session.removeAttribute("user");
        return "login";
    }
}
```

4、登陆页面：login.jsp 位于 WEB-INF/jsp 目录下，保证安全，通过请求跳进去。

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
   <title>Title</title>
</head>

<h1>登录页面</h1>
<hr>

<body>
<form action="${pageContext.request.contextPath}/user/login">
  用户名：<input type="text" name="username"> <br>
  密码：<input type="password" name="pwd"> <br>
   <input type="submit" value="提交">
</form>
</body>
```

5、登陆成功跳转页面：跳转到之前的书籍列表页面 bookList。

```jsp
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>书籍列表</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- 引入 Bootstrap：会导致页面加载缓慢 -->
    <link href="https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

<div class="container">
    <%-- 栅格系统块级元素都是浮动的，clearfix 清除浮动 --%>
    <div class="row clearfix">
        <div class="col-md-8 column">
            <div class="page-header">
                <h1>
                    <small>书籍列表 —————— 显示所有书籍${user}</small>
                </h1>
            </div>
        </div>

        <div class="col-md-4 column">
            <a href="${pageContext.request.contextPath}/user/logout.do" class="btn btn-primary">注销</a>
        </div>
    </div>

    <div class="row">
        <div class="col-md-4 column">
            <a class="btn btn-primary" href="${pageContext.request.contextPath}/book/toAddBooksPage">新增</a>
        </div>
        <div class="col-md-4 column">
            <%-- 查询书籍 --%>
            <form action="${pageContext.request.contextPath}/book/queryBook" method="get" class="form-inline">
                <input type="text" name="queryBookName" class="form-control" placeholder="请输入书籍名称">
                <input type="submit" value="查询" class="btn btn-primary">
            </form>
        </div>
    </div>

    <div class="row clearfix">
        <div class="col-md-12 column">
            <table class="table table-hover table-striped">
                <thead>
                    <tr>
                        <th>书籍编号</th>
                        <th>书籍名字</th>
                        <th>书籍数量</th>
                        <th>书籍详情</th>
                        <th>操作</th>
                    </tr>
                </thead>

                <tbody>
                    <%-- 从 list 里面遍历出来进行显示 --%>
                    <c:forEach var="book" items="${books}">
                        <tr>
                            <td>${book.bookID}</td>
                            <td>${book.bookName}</td>
                            <td>${book.bookCounts}</td>
                            <td>${book.detail}</td>
                            <td>
                                <a href="${pageContext.request.contextPath}/book/toUpdateBookPage/${book.bookID}">更改</a> |
                                <a href="${pageContext.request.contextPath}/book/del/${book.bookID}">删除</a>
                            </td>
                        </tr>
                    </c:forEach>
                </tbody>
            </table>
        </div>
    </div>
</div>
```

# 文件上传与下载

## 文件上传

​		文件上传是项目开发中最常见的功能之一 ，springMVC 可以很好的支持文件上传，但是 `SpringMVC 上下文中默认没有装配 MultipartResolver`，因此默认情况下其不能处理文件上传工作。如果想使用 Spring 的文件上传功能，则需要在上下文中`配置 MultipartResolver`。

​		根据之前的 JavaWeb 理论，文件上传前端表单要求：将表单的 method 设置为 `POST`，并`将enctype设置为multipart/form-data`，只有在这样的情况下，浏览器才会把用户选择的文件以二进制数据发送给服务器。

​		Spring MVC 为文件上传提供了直接的支持，这种支持是用即插即用的 `MultipartResolver` 实现的。

> Spring MVC 使用 Apache Commons FileUpload 技术实现了一个 MultipartResolver 实现类：`CommonsMultipartResolver`。因此，SpringMVC 的文件上传还需要依赖 Apache Commons FileUpload 的组件。

1、导入依赖包：commons-fileupload，Maven 会自动帮我们导入他的依赖包 commons-io 包。

```xml
<!--文件上传-->
<dependency>
   <groupId>commons-fileupload</groupId>
   <artifactId>commons-fileupload</artifactId>
   <version>1.3.3</version>
</dependency>
```

2、配置 bean：multipartResolver。（`这个bena的id必须为：multipartResolver ， 否则上传文件会报400的错误`）

```xml
<!--文件上传配置-->
<bean id="multipartResolver"  class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
   <!-- 请求的编码格式，必须和 jSP 的 pageEncoding 属性一致，以便正确读取表单的内容，默认为 ISO-8859-1 -->
   <property name="defaultEncoding" value="utf-8"/>
   <!-- 上传文件大小上限，单位为字节（10485760=10M） -->
   <property name="maxUploadSize" value="10485760"/>
   <property name="maxInMemorySize" value="40960"/>
</bean>
```

> CommonsMultipartFile 的 常用方法：
>
> 1）String getOriginalFilename()：获取上传文件的原名。
>
> 2）InputStream getInputStream()：获取文件流。
>
> 3）void transferTo(File dest)：将上传文件保存到一个目录文件中。

3、前端测试页面

```jsp
<form action="${pageContext.request.contextPath}/upload" enctype="multipart/form-data" method="post">
 <input type="file" name="file"/>
 <input type="submit" value="上传">
</form>
```

4、Controller 控制器处理请求：

方式一：利用原生的 IO 流。

```java
@Controller
public class FileController {
   //@RequestParam("file") 将name=file控件得到的文件封装成CommonsMultipartFile 对象
   //批量上传CommonsMultipartFile则为数组即可
   @RequestMapping("/upload")
   public String fileUpload(@RequestParam("file") CommonsMultipartFile file , HttpServletRequest request) throws IOException {

       //获取文件名 : file.getOriginalFilename();
       String uploadFileName = file.getOriginalFilename();

       //如果文件名为空，直接回到首页！
       if ("".equals(uploadFileName)){
           return "redirect:/index.jsp";
      }
       System.out.println("上传文件名 : "+uploadFileName);

       //上传路径保存设置,可以使用 uuid
       String path = request.getServletContext().getRealPath("/upload");
       //如果路径不存在，创建一个
       File realPath = new File(path);
       if (!realPath.exists()){
           realPath.mkdir();
      }
       System.out.println("上传文件保存地址："+realPath);

       InputStream is = file.getInputStream(); //文件输入流
       OutputStream os = new FileOutputStream(new File(realPath,uploadFileName)); //文件输出流

       //读取写出
       int len=0;
       byte[] buffer = new byte[1024];
       while ((len=is.read(buffer))!=-1){
           os.write(buffer,0,len);
           os.flush();
      }
       os.close();
       is.close();
       return "redirect:/index.jsp";
  }
}
```

方式二：采用file.Transto 来保存上传的文件。

```java
@RequestMapping("/upload2")
public String  fileUpload2(@RequestParam("file") CommonsMultipartFile file, HttpServletRequest request) throws IOException {

   //上传路径保存设置
   String path = request.getServletContext().getRealPath("/upload");
   File realPath = new File(path);
   if (!realPath.exists()){
       realPath.mkdir();
  }
   //上传文件地址
   System.out.println("上传文件保存地址："+realPath);

   //通过CommonsMultipartFile的方法直接写文件（注意这个时候）
   file.transferTo(new File(realPath +"/"+ file.getOriginalFilename()));

   return "redirect:/index.jsp";
}
```

## 文件下载

1、设置 response 响应头

2、读取文件 -- InputStream

3、写出文件 -- OutputStream

4、执行操作

5、关闭流 （先开后关）

> 只需要修改下载路径就可以实现复用了。

```java
@RequestMapping(value="/download")
public String downloads(HttpServletResponse response ,HttpServletRequest request) throws Exception{
   //要下载的图片地址
   String  path = request.getServletContext().getRealPath("/upload");
   String  fileName = "基础语法.jpg";

   //1、设置response 响应头
   response.reset(); //设置页面不缓存,清空buffer
   response.setCharacterEncoding("UTF-8"); //字符编码
   response.setContentType("multipart/form-data"); //二进制传输数据
   //设置响应头
   response.setHeader("Content-Disposition",
           "attachment;fileName="+URLEncoder.encode(fileName, "UTF-8"));

   File file = new File(path,fileName);
   //2、 读取文件--输入流
   InputStream input=new FileInputStream(file);
   //3、 写出文件--输出流
   OutputStream out = response.getOutputStream();

   byte[] buff =new byte[1024];
   int index=0;
   //4、执行 写出操作
   while((index= input.read(buff))!= -1){
       out.write(buff, 0, index);
       out.flush();
  }
   out.close();
   input.close();
   return null;
}
```

前端页面：

```jsp
<a href="/download">点击下载</a>
```
