---
title: SpringBoot 降低版本问题
type:
comments:
tags: 
  - maven
  - SpringBoot
categories: 
  - 奇思淫巧
description: 
keywords: 版本依赖
cover: https://w.wallhaven.cc/full/zy/wallhaven-zygeko.jpg
top_img: https://w.wallhaven.cc/full/zy/wallhaven-zygeko.jpg
---



问题重现：当做项目时发现 SpringCloud 版本不好和 SpringBoot 版本兼容时，需要调整 SpringBoot 的版本，而直接调整版本号出现报错。

初始创建项目时，SpringBoot 默认版本为 2.7.4 ，现在需要将版本降为 `2.1.8.RELEASE` 版本 ？

1、修改版本号为：`2.1.8.RELEASE` ：

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.1.8.RELEASE</version>
    <relativePath/> <!-- lookup parent from repository -->
</parent>
```

2、此时就需要注意，原来的测试类导入的是 `junit.jupiter` 工具的 api，此时就需要修改测试类，使用原来的 junit 测试。

```java
import org.junit.Test;

@SpringBootTest
@RunWith(SpringRunner.class)
public class ShopCouponApplicationTests {

    @Test
    public void contextLoads() {

    }
}
```

3、使用测试类进行测试。