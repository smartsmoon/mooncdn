---
title: EasyExcel使用
date: 2020-10-01
updated: 
cover: https://w.wallhaven.cc/full/8o/wallhaven-8o2dpj.png
tags: 
  - 插件使用
categories: 
  - Java 开发
description: “Alibaba公司出品的 EasyExcel 插件，在 POI 基础上封装实现，能够帮助快速操作 Excel 表格。”
keywords: EasyExcel 表格
---

## 简介和应用

​		Alibaba公司出品，在POI基础上封装实现。

​		Java领域解析、生成Excel比较有名的框架有Apache **poi**、jxl等。但他们都存在一个严重的问题就是

非常的耗内存。如果你的系统并发量不大的话可能还行，但是一旦并发上来后一定会OOM或 

者JVM频繁的full gc。

​		EasyExcel是阿里巴巴开源的一个excel处理框架，**以使用简单、节省内存著称**。EasyExcel能大大减

少占用内存的主要原因是在解析Excel时没有将文件数据一次性全部加载到内存中，而是从磁盘上一

行行读取数据，逐个解析。

​		EasyExcel采用一行一行的解析模式，并将一行的解析结果以观察者的模式通知处理（AnalysisEventListener）。

> 1、数据导入：减轻录入工作量
>
> 2、数据导出：统计信息归档
>
> 3、数据传输：异构系统之间数据传输

## 依赖管理

​		EasyExcel是在POI基础上封装实现的，因此需要引入POI和EasyExcel的依赖包。

```xml
<dependencies>
    <!--xls-->
    <dependency>
        <groupId>org.apache.poi</groupId>
        <artifactId>poi</artifactId>
    </dependency>

    <dependency>
        <groupId>org.apache.poi</groupId>
        <artifactId>poi-ooxml</artifactId>
    </dependency>

    <!-- https://mvnrepository.com/artifact/com.alibaba/easyexcel
                     easyExcel实际上是对poi的封装，还需引入poi依赖，父工程中已经引入-->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>easyexcel</artifactId>
        <version>2.1.1</version>
    </dependency>
</dependencies>
```

## 表格操作

> 测试环境：JDK8
>
> 测试软件：IDEA 2020
>
> 测试应用：SpringBoot项目测试类中进行测试。

### 实体类

> 需要定义表格对应实体类，用于封装表格每行数据。

举例： EasyExcelPojo

```java
@Data
public class EasyExcelPojo {

    //设置excel表头名称
    @ExcelProperty(value = "学生编号",index = 0)
    private Integer sno;

    @ExcelProperty(value = "学生姓名",index = 1)
    private String name;
}
```

### 写操作

举例： TestEasyExcel

```java
public class TestEasyExcel {

    public static void main(String[] args) {
        //设置写入文件夹地址和excel文件名称
        String fileName = "G:\\ideaProjects\\gulischool_parent\\TestEsayExcel.xlsx";
        /**
         * 实现写的操作
         * write方法：
         *  参数一 @fileName：文件路径及名称
         *  参数二 @className：实体类class
         */
        EasyExcel.write(fileName, EasyExcelPojo.class).sheet("学生列表").doWrite(getList());
    }

    /**
     * 用于构建实体类的 list 集合
     * @return list集合
     */
    public static List<EasyExcelPojo> getList(){
        List<EasyExcelPojo> data = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            EasyExcelPojo excelPojo = new EasyExcelPojo();
            excelPojo.setSno(i);
            excelPojo.setName("张三丰"+i);
            data.add(excelPojo);
        }
        return data;
    }
}
```

### 读操作

​		读操作不同于写操作，需要单独设置一个监听器。

> 监听器：ExcelListener，需要继承 AnalysisEventListener 类

```java
public class ExcelListener extends AnalysisEventListener<EasyExcelPojo> {
    //一行一行读取Excel内容
    @Override
    public void invoke(EasyExcelPojo easyExcelPojo, AnalysisContext analysisContext) {
        System.out.println("***"+easyExcelPojo);
    }
    //读取表头内容
    @Override
    public void invokeHeadMap(Map<Integer,String> headMap, AnalysisContext analysisContext) {
        System.out.println("表头"+headMap);
    }

    //读取完毕后执行
    @Override
    public void doAfterAllAnalysed(AnalysisContext analysisContext) {

    }
}
```

> 实际读方法是在监听器中进行操作，对表格数据中的数据进行存储或其他操作。

```java
public class TestEasyExcel {
    /**
     * 实现Excel读操作.此种方法，文件流会自动关闭
     */
    @Test
    public void easyExcelReadTest(){
        //设置读取文件夹地址和excel文件名称
        String fileName = "G:\\ideaProjects\\gulischool_parent\\TestEsayExcel.xlsx";
        //实现Excel读操作
        EasyExcel.read(fileName,EasyExcelPojo.class, new ExcelListener()).sheet().doRead();
    }
}
```

