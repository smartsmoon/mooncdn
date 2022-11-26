---
title: Java 原生网络编程
date: 2022-01-20 00:00:00
type:
comments:
tags: 
  - BIO
  - NIO
  - RPC
categories: 
  - Java 开发
description: 
keywords: 网络编程
cover: https://w.wallhaven.cc/full/l8/wallhaven-l899ql.png
top_img: https://w.wallhaven.cc/full/l8/wallhaven-l899ql.png
---

​		Java 网络编程中经常会出现 `Socket`，那么这个 Socket 是什么呢？

​		Socket 是应用层与 TCP 协议族通信的中间软件抽象层，是一组接口（`门面模式`），通信双方通过 Socket 进行通信，而不需要了解底层的具体实现。可以理解为：Socket 就是 `应用服务 和 底层 TCP/IP 协议族具体实现的中间层`，提供接口供上层业务应用使用，而底层的具体实现则不需要关心（例如底层 TCP 的三次握手的具体实现等）。实际开发中，两个应用进行通信，就直接使用 Socket 建立连接。

​		TCP 使用主机的 IP 地址加上主机上设定的端口号作为底层TCP连接的断点，这个端点就是 `套接字`（Socket）。例如 A 和 B 进行通信，二者分别产生出 Socket ，A的 Socket 和B的 ServerSocket 进行通信，类似于水管相连。

​		而 Java 基于 Socket 的编程的基础抽象类：InetAddress 类（IP地址）、NetworkInterface 类（表示物理硬件与虚拟接口的信息）

1、InetAddress 类（IP地址）：实际开发中使用较少，用于唯一定位一台网络上的主机。

```java
InetAddress address = InetAddress.getByName(“www.baidu.com”);
//此时 address = 14.215.177.38，表示百度的其中一个主机是 14.215.177.38
```

​		那么这个 `getByName()` 方法是怎么通过域名拿到主机 IP 呢？ ===> `DNS 域名解析`

> 此方法如果传入 IP地址，则会返回其域名，如果找不到就会将 IP 地址原封不动放进去，即返回该 IP 地址。

`[拓展]` 拿到某个域名的所有主机 IP 地址：`getAllByName(“域名”) `。

2、NetworkInterface 类（表示物理硬件与虚拟接口的信息）：可以将本机的网络适配器都找出来，当然不止网络适配器信息，还有很多物理接口信息。

`[问题]` 那么服务端、客户端想要实现网络通信，应该关注哪些方面的实现呢？

​		网络通信使用 Socket 实现，客户端使用 Socket 即可，`服务端则是使用 ServerSocket 产生具体的 Socket `来完成对某个对应的客户端 Socket 之间建立连接通信。（服务端需要和多个主机的多个 Socket 建立连接，只有一个 Socket 当然是不行的）

​		而具体的实现则需要关注几个问题：如何连接？如何读取网络数据？如何写出网络数据？

# BIO 编程

​		BIO ：阻塞式网络开发，是一个实现网络通信的方式的框架。下图框架表示两个线程，每个线程和一个单独的客户端 Client `通过 Socket 进行连接`。

![](https://pic1.imgdb.cn/item/6336ba4b16f2c2beb18afc07.png)

根据一个洗脚店的案例实现一个 BIO 通信模型：

1）服务端：根据上图可知，服务端采用线程内部产生 Socket 供远程 Client 连接的方式（实现`伪异步`）。

```java
public class Server {
    public static void main(String[] args) throws IOException {
        //创建 serverSocket，表示洗脚店开张大吉
        ServerSocket serverSocket = new ServerSocket();
        //绑定某个地址，表示该洗脚店在这个地址开张大吉（在该端口进行监听）
        serverSocket.bind(new InetSocketAddress(10001));
        System.out.println("server is started......");

        /*
         * 此时只来一个用户，肯定不能关门，因此使用循环(洗脚中心肯定有多个员工：多个socket 进行通信)
         * 来一个用户就需要启动一个线程（类似于开一个房间）,在线程内开一个 socket（员工）
         * 此时 Thread 线程内部就是一个线程的具体实现，但是需要一个 socket，怎么来呢？====> 前台接待去叫员工
         * accept() 方法就是用于产生 socket，其内部已经和客户端建立连接，底层不需要我们关注。
         * 因此后面就只需要和客户端直接实现具体的通信即可 run 方法（具体怎么按摩：socket -> socket）
         */
        while (true){
            new Thread(new ServerTask(serverSocket.accept()),"东 1-1").start();
        }
    }

    /**
     * 由于 Thread 内部并不接收 socket 参数，但是里面又需要一个 socket 进行通信（员工进行按摩）
     * 因此需要实现一个 Runnable 接口，内部定义一个 socket
     */
    private static class ServerTask implements Runnable{
        private Socket socket = null;
        public ServerTask(Socket socket){
            this.socket = socket;
        }

        @Override
        public void run() {
            //现在具体洗脚流程就在 run 方法内部，按摩手法就是输入输出流
            try {
                // 输入流数据来源于客户端,但是这个输入流是从本地员工（socket）来的，通过员工输出手法洗脚
                ObjectInputStream inputStream = new ObjectInputStream(socket.getInputStream());
                //输出流数据就是输送到客户端,输出流也是通过本地员工（socket）发送到客人身上
                ObjectOutputStream outputStream = new ObjectOutputStream(socket.getOutputStream());
                //具体洗脚过程中会不停按摩，身体互动（进行通信）
                //接收用户的按摩感觉：从输入流中读取
                String freed = inputStream.readUTF();
                System.out.println("接收到用户的感受：" + freed);
                //为了礼貌，脑子里想着：谢谢您的欣赏,还得说出去让用户听到（flush），不然可能投诉不礼貌
                outputStream.writeUTF("谢谢您的欣赏!");
                outputStream.flush();
            } catch (IOException e) {
                e.printStackTrace();
            }finally {
                try {
                    socket.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```

​		这种方式有一个问题：就是线程不能够复用（相当于员工按摩一个客人就下班了），实际应该使用线程池让线程可以复用。

2）客户端：客户端由于只需要一个连接即可，使用 `new Socket()` 进行绑定到服务器对应端口，而后进行通信即可。

```java
public class Client {
    public static void main(String[] args) throws IOException {
        //客户应该先有一双脚（socket）才行,同时也得有感觉才行（输入输出流）
        Socket socket = null;
        ObjectInputStream inputStream = null;
        ObjectOutputStream outputStream = null;
        //那么脚（socket）就应该去洗脚店的地址才能进行按摩(街道 127.0.0.1，门牌号 10001)
        InetSocketAddress socketAddress = new InetSocketAddress("127.0.0.1", 10001);
        socket = new Socket();
        //脚就应该走到这个 洗脚店（地址建立连接）
        socket.connect(socketAddress);

        //此时就享受服务(注意此处的顺序，必须先创建输出流，再创建输入流)
        outputStream = new ObjectOutputStream(socket.getOutputStream());
        inputStream = new ObjectInputStream(socket.getInputStream());

        //进行按摩，说出自己的感受
        outputStream.writeUTF("感觉还挺爽!");
        outputStream.flush();

        //接收服务器（洗脚店员工），不然我就可能因为员工不礼貌就投诉
        System.out.println(inputStream.readUTF());

        inputStream.close();
        outputStream.close();
        socket.close();
    }
}
```

通过上面的案例实现发现：`BIO 就是基于输入输出流实现的网络通信`，同时还是阻塞式（同步）。

# RPC 框架

## RPC 框架概述

当服务很少情况下，使用 BIO 这种单线程方式可能比较好完成。

当服务情况稍多，可以考虑使用多线程，每个线程执行总系统的一部分任务实现。

但是如果服务过多呢，例如 千万级流量分布式，那么该怎么办呢？ ====> `RPC 框架思想`。

RPC ：`远程过程调用`，是通过网络从远程计算机程序上请求服务，将中间过程封装，让客户端实现调用远程方法和调用本地方法一样。RPC 是一种思想，可以在传输层（TCP）实现，也能在应用层（Http）实现，还可以用消息队列实现，实现方式多种多样。

> `RPC 是一种思想`，但是 HTTP 是一种具体的网络协议，二者没有可比性，同时 RPC 实现方式多样，不能说它是属于哪一层。

![](https://pic1.imgdb.cn/item/6336ba6316f2c2beb18b1487.png)

那么实现一个 RPC 框架需要解决哪些问题呢？

​	1）通信问题：使用 BIO 实现数据的传递和交流。

​	2）代理问题：调用者不关心具体的调用，调用者只需要结果，具体的实现由代理的对象来负责解决，而不是通过本身直接实现。代理模式就是通过代理来访问目标对象，可以在目标对象实现的基础上增加额外的功能操作，即扩展目标对象的功能，此处需要扩展的就是：`通过网络访问远程服务`。

> 代理模式分为 静态代理 和 动态代理，但静态代理有一个类就必须创建对应的代理类，过于麻烦，`一般 RPC 都是使用动态代理模式`。

​	3）序列化问题：网络通信传递的都是字节，因此必须序列化，使 JavaBean 能够转变为字节传输，而在接收端则需要进行反序列化。

> 使用 JDK 的序列化机制即可：implement Serializable（性能很差），实际开发中一般使用自行实现的序列化方式。

​	4）服务实例化：登记的服务在系统中可能就是一个名称，需要使用`反射机制`来获取实际执行的对象实例。

## RPC 框架基本实现

`[问题]` 以 SpringBoot 实现一个自定义的 RPC 远程调用框架：使用客户端调用远程的发送短信服务 sms。（可以`类比 Dubbo 的操作过程实现`）

1、服务端：包含服务端存根 和 RPC 框架服务端。

​	1）服务端存根：实体类 UserInfo。

```java
//客户端存根：实体类，需要实现序列化
public class UserInfo implements Serializable {

    private final String name;
    private final String phone;

    public UserInfo(String name, String phone) {
        this.name = name;
        this.phone = phone;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }
}
```

​	2）服务端存根：接口存根 SendSms。

```java
public interface SendSms {
    boolean sendMail(UserInfo userInfo);
}
```

​	3）构建 RPC 框架的服务端部分：构建通信 Socket 监听端口后，将服务注册到本地注册中心，同时需要注意每个任务都是 Runnable（而每个任务里面就具体的获取客户端传来的请求进行服务处理的具体实现），Runnable 里就根据需求就需要提供 Socket 继续通信，提供注册中心获取服务。

```java
// RPC 框架的服务端部分
@Service
public class RpcServerFrame {
    @Autowired
    private RegisterService registerService;

    //启动服务端的该端口的服务
    public void startService(String serviceName, int port, Class<?> serviceImpl) throws IOException {
        ServerSocket serverSocket = new ServerSocket(); //服务端后面使用 ServerSocket 产生 Socket
        serverSocket.bind(new InetSocketAddress(port));
        System.out.println("RPC Server on " + port + " is Running");
        registerService.regService(serviceName, serviceImpl);  //服务启动时将本地服务注册到容器
        try {
            while (true){
                new Thread(new ServerTask(serverSocket.accept(), registerService)).start();
            }
        } finally {
            serverSocket.close();
        }

    }

    //具体的获取客户端传来的请求进行服务处理的具体实现：肯定就需要Socket，
    private static class ServerTask implements Runnable{
        private Socket socket;
        private RegisterService registerService;

        public ServerTask(Socket client, RegisterService registerService) {
            this.socket = client;
            this.registerService = registerService;
        }

        @Override
        public void run() {
            //使用 BIO 模型进行通信的实现
            try {
                ObjectOutputStream outputStream = new ObjectOutputStream(socket.getOutputStream());
                ObjectInputStream inputStream = new ObjectInputStream(socket.getInputStream());
                String serviceName = inputStream.readUTF(); //读取客户端传过来的服务名
                String methodName = inputStream.readUTF();  //读取客户端传过来的方法名
                Class<?>[] paramTypes = (Class<?>[]) inputStream.readObject();  //获取客户端传过来的参数类型集合（多个）
                Object[] params = (Object[]) inputStream.readObject();    //获取客户端传过来的具体参数值（多个）
                // 从本地的注册中心获取具体的服务实例模板，再通过反射获取具体的实现实例：服务的实例化问题的解决
                Class<?> serviceClass = registerService.getLocalService(serviceName);
                if (serviceClass == null) throw new ClassNotFoundException(serviceName + " not found!");
                Method method = serviceClass.getMethod(methodName, paramTypes);
                //通过 Class 模板获取实例，使用 invoke 执行具体的方法获取返回结果
                Object result = method.invoke(serviceClass.newInstance(), params);
                //将服务执行结果返回给调用者（客户端）的 Socket
                outputStream.writeObject(result);
                outputStream.flush();
            } catch (Exception e) {
                e.printStackTrace();
            }finally {
                try {
                    socket.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```

​		那么短信服务怎么对外提供呢？ ====> 引入本地服务的注册中心 RegisterService，把本地可以提供的服务存储供使用。

```java
// 服务注册到本地,本地提供一个服务注册需要存放的容器 serviceCache
@Service
public class RegisterService {
    private static final Map<String,Class<？>> serviceCache = new ConcurrentHashMap<>();

    // 根据服务名称注册服务,由于本地确认可能会提供各种服务，因此可以将泛型指定为通配符 ？
    public void regService(String serviceName,Class<？> serviceImpl){
        serviceCache.put(serviceName,serviceImpl);
    }

    // 根据服务名称获取服务
    public Class<？> getLocalService(String serviceName){
        return serviceCache.get(serviceName);
    }
}
```

​	而发送邮件的具体实现则是在服务端进行了实现：

```java
//发送短信的具体实现：客户端想调用的实现就是这个
public class SendSmsImpl implements SendSms {

    @Override
    public boolean sendMail(UserInfo userInfo) {
        System.out.println("Having Send Message：" + userInfo.getName() +" 到[" + userInfo.getPhone() + "] 邮箱");
        return true;
    }
}
```

​	4）给RPC 框架服务提供一个启动入口，让整个服务可以启动向外提供远程服务（调用 startService 方法）。

```java
//RPC 的服务端启动入口，提供服务
@Service
public class SmsRpcServer {
    @Autowired
    private RpcServerFrame rpcServerFrame;

    //使用 @PostConstruct 注解保证 SpringBoot 初始化完毕后执行
    @PostConstruct
    public void server() throws IOException {
        int port = 8778;

        /*
         * startService 方法解析：在指定的端口启动指定服务，同时指定其具体实现类
         * SendSms.class.getName() 短信服务接口
         * port 启动端口
         * SendSmsImpl.class 短信服务的具体实现
         */
        rpcServerFrame.startService(SendSms.class.getName(), port, SendSmsImpl.class);
    }
}
```

2、客户端：同样提供客户端存根 和 RPC 的客户端部分。

​	1）客户端的 RPC 框架类 RpcClientFrame，利用动态代理将对服务器的调用全部隐藏起来，对调用者而言就只是一个提供服务的代理对象。

```java
//RPC 框架的客户端部分：主要用于产生代理对象
@Service
public class RpcClientFrame {
    // 远程服务的代理对象（代理的对象应该是各种各样的,因此泛型指定 T），参数为客户端要调用的的服务:远程的接口，因为客户端并没有具体实现。
    public static<T> T getRemoteProxyObject(final Class<T> serviceInterface){
        InetSocketAddress addr = new InetSocketAddress("127.0.0.1",8778);   // 获得远程服务的一个网络地址
        //使用动态代理产生一个代理对象，由这个代理对象通过网络进行实际的服务调用
        return (T) Proxy.newProxyInstance(serviceInterface.getClassLoader(),
                new Class<?>[]{serviceInterface},
                new ServiceProxy(serviceInterface, addr));
    }
}
```

​	2）动态代理对象的产生需要一个实现了 InvocationHandler 对象，而具体的业务则是在此对象的 invoke 方法中执行（也就是调用远程服务：发送服务名、方法名、参数类型、参数值等），因此便需要调用的接口（通过接口获取服务名），同时还需要连接的服务器地址。

```java
//动态代理需要的类，并在此类的 invoke 方法执行拓展业务（调用远程服务）
@SuppressWarnings("all")
public class ServiceProxy implements InvocationHandler {
    private Class<?> serviceInterface;
    private InetSocketAddress addr;

    public ServiceProxy(Class<?> serviceInterface, InetSocketAddress addr) {
        this.serviceInterface = serviceInterface;
        this.addr = addr;
    }

    //具体的调用的实现
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        Socket socket = null;
        ObjectOutputStream outputStream = null;
        ObjectInputStream inputStream = null;
        try {
            socket = new Socket();
            socket.connect(addr);   // 本地socket连接到远程的服务器的socket
            outputStream = new ObjectOutputStream(socket.getOutputStream());

            //写出到服务器需要的信息：服务名、方法名、参数类型、参数值
            outputStream.writeUTF(serviceInterface.getName());
            outputStream.writeUTF(method.getName());
            outputStream.writeObject(method.getParameterTypes());
            outputStream.writeObject(args);
            outputStream.flush();

            //接收服务器端的返回结果 result
            inputStream = new ObjectInputStream(socket.getInputStream());
            System.out.println(serviceInterface + " remote exec success!");
            return inputStream.readObject();
        } finally {
            if(inputStream!=null) inputStream.close();
            if(outputStream!=null) outputStream.close();
            if(socket!=null) socket.close();
        }
    }
}
```

​	3）还需要将这些相关的对象注入到 Spring 的 Bean 空间（代理对象：实际的实现类）。

```java
@Configuration
public class BeanConfig {
    @Autowired
    private RpcClientFrame rpcClientFrame;

    @Bean
    public SendSms getSmsService() throws Exception{
        return rpcClientFrame.getRemoteProxyObject(SendSms.class);
    }
}
```

​	4）客户端测试类进行测试，调用 `sendMail()` 方法，查看结果。

```java
@SpringBootTest
class RpcClientApplicationTests {

    @Autowired
    private SendSms sendSms;

    @Test
    void contextLoads() {
        UserInfo userInfo = new UserInfo("蔡徐坤", "Ikun@qq.com");
        System.out.println(sendSms.sendMail(userInfo) ? "发送成功" : "发送失败");
    }

}
```

3、先启动服务端，再运行客户端测试类，结果发现：

```shell
# 启动服务端，服务端打印：
RPC Server on 8778 is Running

# 客户端测试类调用方法测试打印：
interface com.example.remote.SendSms remote exec success!
发送成功

# 此时服务端打印：
Having Send Message：蔡徐坤 到[Ikun@qq.com] 邮箱
```

​	此时便相当于是`客户端调用的代理类的方法进行了发送邮件的实现`，而代理类是通过网络调用了远程的服务，即实现了 RPC 的远程方法调用。

`[问题]` 但是此时还是存在问题，如果此时有多个服务，便需要传入多个地址进行选择性的调用，过于麻烦？

## RPC 框架优化

`[优化]` 基于 Dubbo 的实现，添加一个注册中心。（实际也是一个 RPC 的远程调用，就是只提供两个服务：服务注册 和 服务发现）

1、RPC 框架注册中心：

​	1）实体类 RemoteService 记录服务的 IP 和端口。

```java
//服务提供者的相关信息：host 和 ip
public class RemoteService implements Serializable {
    private final String host;
    private final int port;

    public RemoteService(String host, int port) {
        this.host = host;
        this.port = port;
    }

    public String getHost() {
        return host;
    }

    public int getPort() {
        return port;
    }
}
```

​	2）通过 Socket 进行网络通信，处理请求的具体实现：服务注册还是服务发现。

```java
//处理服务请求的任务，其实无非就是两种服务：服务注册 和 服务发现(都需要使用 Socket 进行网络通信)
public class ServerTask implements Runnable{
    private Socket client;

    public ServerTask(Socket client){
        this.client = client;
    }

    @Override
    public void run() {
        try {
            ObjectOutputStream outputStream = new ObjectOutputStream(client.getOutputStream());
            ObjectInputStream inputStream = new ObjectInputStream(client.getInputStream());
            boolean serviceMode = inputStream.readBoolean();
            if (serviceMode){   //返回 true 表示是查询服务请求
                String serviceName = inputStream.readUTF();
                Set<RemoteService> serviceList = RegisterCenter.getService(serviceName);
                outputStream.writeObject(serviceList);
                outputStream.flush();
                System.out.println("Provide " + serviceName + " success!");
            }else { //返回 false 表示是注册服务请求
                String serviceName = inputStream.readUTF();
                String serviceHost = inputStream.readUTF();
                int servicePort = inputStream.readInt();
                RegisterCenter.registerService(serviceName, serviceHost, servicePort);
                outputStream.writeBoolean(true);
                outputStream.flush();
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                client.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

​	3）服务注册中心：设定一个存放服务的容器，提供注册和发现两种操作，并启动这个注册中心。

```java
//服务注册中心,服务提供者在提供服务时都需要现在此注册中心中登记自己的信息
@Service
public class RegisterCenter {
    // 一个服务可能有多个地址服务端提供，因此 value 是一个集合
    private static final Map<String, Set<RemoteService>> serviceCenter = new HashMap<>();
    private int port;   //注册中心监听端口

    //HashMap 是一个线程不安全的集合，考虑到多个服务同时注册时可能会产生问题，因此需要加锁
    public static synchronized void registerService(String serviceName, String host,int port){
        //获得当前服务的已有地址集合,里面可能已经存在该服务
        Set<RemoteService> serviceVoSet = serviceCenter.get(serviceName);
        if(serviceVoSet == null){
            //已有地址集合为空，新增集合
            serviceVoSet = new HashSet<>();
            serviceCenter.put(serviceName,serviceVoSet);
        }
        serviceVoSet.add(new RemoteService(host,port));
        System.out.println("服务已注册["+serviceName+"]，" + "地址["+host+"]，端口["+port+"]");
    }

    //获取服务提供者,返回所有提供该服务的服务端
    public static Set<RemoteService> getService(String serviceName){
        return serviceCenter.get(serviceName);
    }

    //启动注册中心这个服务
    public void startService() throws IOException {
        ServerSocket serverSocket = new ServerSocket();
        serverSocket.bind(new InetSocketAddress(port));
        System.out.println("RegisterCenter on:" + port + " is Running!");
        try{
            while(true){
                new Thread(new ServerTask(serverSocket.accept())).start();
            }
        }finally {
            serverSocket.close();
        }
    }

    //采用异步方式初始化启动这个注册中心
    @PostConstruct
    public void init() {
        this.port = 9999;
        new Thread(new Runnable() {
            public void run() {
                try{
                    startService();
                }catch(IOException e){
                    e.printStackTrace();
                }
            }
        }).start();
    }
}
```

​	此时注册中心已经实现，同时监听 9999 端口，当注册服务时会将服务端的 IP 和端口放入注册中心，当获取服务时会将所有提供该服务的服务端拿到。

2、原来的服务端只向本地注册，此时有了注册中心就需要向远程同时添加注册信息，告诉注册中心此 IP 和端口的服务端能够提供哪些服务。

​	1）修改原先的本地注册中心，添加注册到远程中心的代码：

```java
@Service
public class RegisterService {
    private static final Map<String,Class<?>> serviceCache = new ConcurrentHashMap<>();

    // 根据服务名称注册服务
    public void regService(String serviceName, String host, int port, Class<?> serviceImpl) throws Throwable{
        //登记到远程注册中心
        Socket socket = null;
        ObjectOutputStream output = null;
        ObjectInputStream input = null;
        try {
            socket = new Socket();
            socket.connect(new InetSocketAddress("127.0.0.1",9999));    //此时便需要连接到注册中心
            output = new ObjectOutputStream(socket.getOutputStream());
            output.writeBoolean(false); // false 表示是注册服务
            output.writeUTF(serviceName);
            output.writeUTF(host);
            output.writeInt(port);
            output.flush();
            input = new ObjectInputStream(socket.getInputStream());
            if(input.readBoolean()){
                System.out.println("服务["+serviceName+"]注册成功!");
            }
            // 同时也需要放入本地的注册中心,因为需要存储该服务的实现
            serviceCache.put(serviceName,serviceImpl);
        }catch (IOException e) {
            e.printStackTrace();
        }  finally {
            if (socket!=null) socket.close();
            if (output!=null) output.close();
            if (input!=null) input.close();
        }
        
    }

    // 根据服务名称获取服务
    public Class<?> getLocalService(String serviceName){
        return serviceCache.get(serviceName);
    }
}
```

​	2）修改原来的 RPC 框架服务端服务端 RpcServerFrame，对注册添加 host 和 port 配置：

```java
public void startService(String serviceName, String host, int port, Class<?> serviceImpl) throws Throwable {
    ......
        registerService.regService(serviceName, host, port, serviceImpl);  //服务启动时将本地服务注册到容器
    ......
}
```

​	3）修改原来的 RPC 启动入口，让端口随机，多启动几份。

```java
@Service
public class SmsRpcServer {
    @Autowired
    private RpcServerFrame rpcServerFrame;

    //使用 @PostConstruct 注解保证 SpringBoot 初始化完毕后执行
    @PostConstruct
    public void server() throws Throwable {
        Random r = new Random();
        int port = 8778 + r.nextInt(100);
        String host = "127.0.0.1";
        rpcServerFrame.startService(SendSms.class.getName(), host, port, SendSmsImpl.class);
    }
}
```

​	4）启动第一个服务端1 测试：

```shell
# 服务端1 打印：
RPC Server on 8872 is Running
服务[com.example.remote.SendSms]注册成功!

# 注册中心打印：
服务已注册[com.example.remote.SendSms]，地址[127.0.0.1]，端口[8872]
```

​	再启动一个服务端2 测试：

```shell
# 服务端2 打印：
RPC Server on 8840 is Running
服务[com.example.remote.SendSms]注册成功!

# 注册中心打印：
服务已注册[com.example.remote.SendSms]，地址[127.0.0.1]，端口[8872]
服务已注册[com.example.remote.SendSms]，地址[127.0.0.1]，端口[8840]
```

​	测试结果发现：两个服务都在注册中心中注册成功。

3、原来的客户端远程调用的服务端地址是固定的，此时便应该连到注册中心，从注册中心获取对应服务的地址：host 和 IP，再调用到对应的服务端。

​	1）修改 RPC 框架的客户端代理地址，应该通过网络通信从远程获取。（本地也需要一个类 RemoteService 用来接收获取到的服务地址的封装）

```java
@Service
public class RpcClientFrame {
    private static Random r = new Random();
    // 远程服务的代理对象（代理的对象应该是各种各样的,因此泛型指定 T），参数为客户端要调用的的服务:远程的接口，因为客户端并没有具体实现。
    public static<T> T getRemoteProxyObject(final Class<T> serviceInterface) throws Exception {
        InetSocketAddress addr = getServiceAddress(serviceInterface.getName());  //从远程注册中心获取 host 和 IP
        //使用动态代理产生一个代理对象，由这个代理对象通过网络进行实际的服务调用
        return (T) Proxy.newProxyInstance(serviceInterface.getClassLoader(),
                new Class<?>[]{serviceInterface},
                new ServiceProxy(serviceInterface, addr));
    }

    // 根据服务名从远程注册中心获取所需服务的地址
    private static InetSocketAddress getServiceAddress(String serviceName) throws Exception {
        Socket socket = null;
        ObjectOutputStream output = null;
        ObjectInputStream input = null;
        List<InetSocketAddress> serviceAddressList = new ArrayList<>(); //记录查询到了所有提供该服务的主机信息
        try{
            socket = new Socket();
            socket.connect(new InetSocketAddress("127.0.0.1",9999));    //连接到远程注册中心
            output = new ObjectOutputStream(socket.getOutputStream());
            output.writeBoolean(true);  //此次是获取服务请求 true
            output.writeUTF(serviceName);
            output.flush();

            input = new ObjectInputStream(socket.getInputStream());
            Set<RemoteService> serviceAddress = (Set<RemoteService>)input.readObject();
            for(RemoteService serviceVo : serviceAddress){
                String host = serviceVo.getHost();//获得服务提供者的IP
                int port = serviceVo.getPort();//获得服务提供者的端口号
                InetSocketAddress serviceAddr = new InetSocketAddress(host,port);
                serviceAddressList.add(serviceAddr);
            }
            //此时便获取到了所有的能够提供该服务的主机信息
            System.out.println("获得服务[" + serviceName + "]提供者的地址列表[" + serviceAddressList + "]，准备调用.");
        }finally{
            if (socket!=null) socket.close();
            if (output!=null) output.close();
            if (input!=null) input.close();
        }
        //使用随机轮询的方式完成负载均衡的效果
        InetSocketAddress address = serviceAddressList.get(r.nextInt(serviceAddressList.size()));
        System.out.println("本次选择了服务主机为：" + address);
        return address;
    }
}
```

​	2）利用测试类调用远程服务进行测试：结果发现 8872 服务端接收到请求调用。总共执行四次发现 8872 接收三次，8840 接收一次。（`随机轮询`）

> 目前成熟的 RPC 解决方案：
>
> 1、Dubbo 是 Alibaba 基于 TCP 实现的 RPC 框架，和 Spring 框架可以无缝集成。
>
> 2、SpringCloud 基于 HTTP 实现的远程服务调用。
>
> ​	HTTP 协议更标准、更规范，适用于各种语言的调用，SpringCloud 更注重全面性，而 Dubbo 更关注 RPC 的专项治理（但现在 Alibaba 也结合 Dubbo 实现了一套专属的新的微服务架构：Spring Cloud Alibaba，也是非常全面）

# NIO 编程

## NIO 基本流程

​		NIO 模型：`No-Blocking IO`，非阻塞式通信模型，是对 BIO 性能的优化，目前服务端领域使用最多的 IO 通信模型。

> NIO 和 BIO 区别：
>
> 1）BIO 面向流，中间没有缓冲；NIO 面向缓冲实现，读的数据先读到缓冲区，再读出来处理，写数据也相同（灵活、速度快）
>
> 2）BIO 线程阻塞，对线程消耗大；NIO 非阻塞，线程在没有任务时可以完成其他任务。

`[拓展]` 就一次网络读写而言，BIO 更快，BIO 只有一次系统调用，而 NIO 有两次。 ===> 系统调用会导致操作系统用户态和内核态的切换。

​		使用 NIO 的主要原因是能够实现 `多路复用`，BIO 虽然引入线程池的概念，但是也意味着每个任务都需要分配一个线程来执行。但 NIO 非阻塞可以用一个线程管理多个网络通信通道（多路复用）。

​		对应 BIO 模型服务端的 ServerSocket，NIO 也有类似的概念：`ServerSocketChannel`（接收客户端的请求，建立实际的网络通信通道）。同时 NIO 的还有三大核心组件：

1）Selector：选择器，也叫轮询代理器，通过选择器来选择具体的通道 Channel。（`怎么管理多个通道`）

2）Channel：通信的通道。

3）Buffer：缓冲区

三者的关系可以通过下图 NIO 模型解释（以一个客户端线先连接再发送数据场景为例）：

![](https://pic1.imgdb.cn/item/6336ba7b16f2c2beb18b3045.png)

​		此时如果又来了一个客户端 Client2 也要连接服务器，同时原先的 Client1 也有数据发送，那么此时 Selector 中就有两个事件：Client2 导致的连接事件 和 Client1 导致的读取事件，此时 Selector 就会将连接事件发送给 ServerSocketChannel 接收连接，同时产生新的 SocketChannel2 并注册自己的读取事件，同时 Selector 也会将 Client1 导致的读取事件通知给原先的 SocketChannel1。=====> 实现了`多路复用`。

​		而这个关注事件怎么区分呢？Java 中将其抽象为 `SelectionKey` 类，表示其属于哪类事件：接受连接、连接、读取、写入。事件注册的时候都会创建一个 SelectionKey ，将 SocketChannel 和 Selector 建立连接。

1）接受连接事件：OP_ACCEPT （ServerSocketChannel 只关注这个事件，isAcceptable 方法判断是不是接受连接事件）

2）请求连接事件：OP_CONNECT（只有客户端才会监听此种事件）

3）读取事件：OP_READ（使用 isReadable 方法判断是不是读事件）

4）写出事件：OP_WRITE

## NIO 缓存 

​		NIO 的缓存 Buffer 具有三个重要的属性：`Capacity 容量`、`Position 位置`、`Limit 限制`。Capacity 表示该缓存能够存储的字节大小，Position 表示当前可写入或读取的位置，最大值可为 Capacity - 1，Limit 表示最大能读取或写入的数据位置。

1）`写模式`下，Position 位于 Buffer 的空闲的起始位置，Limit 位于Capacity - 1 位置。

2）`读模式`下，Position 位于上一次读取的位置处，而 Limit 位于缓冲区中数据的截至处。

![](https://pic1.imgdb.cn/item/6336ba8d16f2c2beb18b42b4.png)

​		Buffer 的实现类有很多，在开发中一般使用 ByteBuffer 就足够，同时 Buffer 既可以在堆上分配，也可以在直接内存上分配（堆外的内存）。

> ​		直接内存就是把内存对象分配在 `JVM 的堆以外的内存`，这些内存直接受操作系统管理（而不是虚拟机），这样做的结果就是能够在一定程度上减少垃圾回收对应用程序造成的影响。分配时速度较慢，使用时速度快，但是没有 JVM 直接帮助管理内存，容易发生内存溢出。

1）JVM 堆上分配缓存空间：

```java
ByteBuffer buffer = ByteBuffer.allocate(200000);
```

2）直接内存分配缓存空间：

```java
ByteBuffer buffer = ByteBuffer.allocateDirect(200000);
```

​	需要注意的是：对 Buffer 的操作都是围绕字节数组来操作的，当写入数据完毕后如果需要读取数据，则需要调用 `flip() 方法，将写模式切换为读模式`，此函数的主要作用就是将 Buffer 的属性 Position 和 Limit 的位置安排到指定位置。

验证 flip() 操作前后的属性位置变化：

```java
public class BufferMethod {
    public static void main(String[] args) {
        System.out.println("------Test get and put-------------");
        ByteBuffer buffer = ByteBuffer.allocate(32);
        buffer.put((byte) 'a')//0
                .put((byte) 'b')//1
                .put((byte) 'c')//2
                .put((byte) 'd')//3
                .put((byte) 'e')//4
                .put((byte) 'f');//5
        System.out.println("before flip()" + buffer);
        // 转换为读取模式
        buffer.flip();
        System.out.println("before get():" + buffer);
        System.out.println((char)buffer.get());
        System.out.println("after get():" + buffer);
    }
}
```

打印结果：

```shell
------Test get and put-------------
before flip()java.nio.HeapByteBuffer[pos=6 lim=32 cap=32]
before get():java.nio.HeapByteBuffer[pos=0 lim=6 cap=32]
a
after get():java.nio.HeapByteBuffer[pos=1 lim=6 cap=32]		# 读取过后 position 位置也会发生变化：到没有读取的数据的位置
```

## 实现 NIO 

​		实现一个 NIO 的网络通信模型：

1、NIO 的通信服务端（主启动类），具体实现位于 NioServerHandler 类。

```java
//NIO 通信服务端
public class NioServer {
    private static NioServerHandler serverHandler;

    public static void main(String[] args) {
        serverHandler = new NioServerHandler(Constant.DEFAULT_PORT);    //实例化
        new Thread(serverHandler, "Server").start();    //此处是将监听事件作为一个单独的线程运行监听的
    }
}
```

2、NIO 服务端事件监听处理的具体实现：

```java
// NIO 通信服务端处理的具体实现
public class NioServerHandler extends Thread{
    private volatile boolean started;
    // 服务端使用 ServerSocketChannel 监听连接事件
    private ServerSocketChannel serverSocketChannel;
    // NIO 的选择器 Selector
    private Selector selector;

    //指定服务端监听的端口号,IP 默认本地
    public NioServerHandler(int port){
        try {
            selector = Selector.open(); // 创建选择器的实例
            serverSocketChannel = ServerSocketChannel.open();   // 创建 SocketChannel 实例
            serverSocketChannel.configureBlocking(false);   // 设置通道为非阻塞模式 NIO ：not blocking
            serverSocketChannel.socket().bind(new InetSocketAddress("127.0.0.1", port));    //绑定端口地址
            // 向 Selector 中进行注册 "接受连接" 事件
            serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);
            started = true;
            System.out.println("服务器已启动，监听端口：" + port);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void run() {
        //不断获取相关的事件：需要不停监听，永不停歇的进行监听
        while (started){
            try {
                // select 是一个阻塞式方法，表示有事件出现才会返回,超时时间 1000ms（每1s检测一次事件）
                selector.select(1000);
                Set<SelectionKey> selectionKeys = selector.selectedKeys();  //返回当前 selector 里面的事件集
                Iterator<SelectionKey> iterator = selectionKeys.iterator();
                while (iterator.hasNext()){
                    //selector 里面有相关的事件时，需要进行处理
                    SelectionKey key = iterator.next();
                    iterator.remove();  //此处是将此次拿到的事件从 Selector 中移除这个事件，避免重复消费（并不是取消监听这个事件）
                    handleInput(key);   //对事件进行处理
                }
                // selector.selectNow();// 非阻塞式方法，此处不使用
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    //对监听到的事件进行处理：总共四种事件(此处只处理 isAcceptable 和 isReadable 事件)
    private void handleInput(SelectionKey key) throws IOException {
        if (key.isValid()){ //判断是否有效
            if (key.isAcceptable()){
                //获取当前 key 的 socketChannel,由于接受连接事件的channel 确定为 ServerSocketChannel，因此直接强转
                ServerSocketChannel ssc = (ServerSocketChannel)key.channel();
                //产生真正进行网络读写的 SocketChannel
                SocketChannel sc = ssc.accept();
                sc.configureBlocking(false);
                System.out.println("产生 SocketChannel 对象，成功建立连接");
                //再向 Selector 中注册事件：读取事件
                sc.register(selector, SelectionKey.OP_READ);
            }
            if (key.isReadable()){
                //SocketChannel 关注读事 件
                SocketChannel sc = (SocketChannel) key.channel();
                //此时就将网络上的数据 "写入" 到 Buffer(注意这个位置实际是写到 buffer，buffer 此时是写模式)
                ByteBuffer buffer = ByteBuffer.allocate(1024);
                int readBytes = sc.read(buffer);//从通道读取数据写入到 buffer，返回读取的字符数
                if (readBytes > 0){
                    //后续处理业务从 buffer 读取数据，但是从写模式需要切换到读模式
                    buffer.flip();
                    byte[] bytes = new byte[buffer.remaining()];    //剩下多少数据没读就申请多少数据
                    buffer.get(bytes);  //get 是从 buffer 读取数据写入到字节数组
                    String message = new String(bytes, StandardCharsets.UTF_8);
                    System.out.println("服务器收到消息：" + message);
                    //响应客户端一条消息
                    String responseMessage = "Hello,老李狗,Now is" + new Date(System.currentTimeMillis()).toString();
                    //通过现在的这个 SocketChannel 将消息写到客户端
                    responseWrite(sc, responseMessage);
                }else if (readBytes < 0){
                    key.cancel();//表示没有读取到数据，通道应该关闭，此时便取消继续监听 read 事件
                    sc.close();
                }
            }
        }
    }

    private void responseWrite(SocketChannel sc, String responseMessage) throws IOException {
        //将数据转变为 byte 数组，将 byte 数组写入到 buffer
        byte[] bytes = responseMessage.getBytes(StandardCharsets.UTF_8);
        ByteBuffer buffer = ByteBuffer.allocate(bytes.length);
        buffer.put(bytes);
        //再将 buffer 切换为读模式，从 buffer 里面读取数据并写入到 channel
        buffer.flip();
        sc.write(buffer);
    }
}
```

注意：针对 Buffer 的位置可以发现，当客户端数据发送过来时，SocketChannel 首先接收到，此后便会经历几个过程：

​	1）读取 SocketChannel 中的数据，写入到 `接收 Buffer`，此时 Buffer 处于`写模式`。	`socketChannel.read(buffer)`

​	2）切换写模式为读模式，后续业务代码从 Buffer 中读取。	`buffer.flip()`

​	3）读取 Buffer 中的数据，放入到一个字节数组 bytes，此时 Buffer 为`读模式`。	`buffer.get(bytes)`

​	4）将业务执行的响应信息 bytes，写入到 `发送 Buffer`，此时 Buffer 处于`写模式`。	`buffer.put(byte)`

​	5）切换写模式为读模式，后续业务代码从 Buffer 中读取。	`buffer.flip()`

​	6）再将 Buffer 中的数据读取出来，写入到 SocketChannel 中，此时 Buffer 处于`读模式`。	`socketChannel.write(buffer)`

这几个方法的读取 和 写入的关系容易混淆，write 和 read 方法的调用者想要的操作才是这个方法的实际含义，参数则表示是从哪里进行读或写。

> remove 函数 和 cancel 函数的区别：
>
> remove 函数是将此次拿到的事件从 Selector 中移除这个事件，避免重复消费。 ===> 读取事件也是可以不停发送数据进而产生的。
>
> ​		例如如果发送消息字节数 1500 字节，Buffer 大小 1024，则读取一次后必须移除以此触发的读取事件，否则还会读最开始的 1024 字节重复消费。同时这个函数又不会直接取消监听这个事件，当通道中还有 476 字节数据没有读取，则读取事件就会再次触发，进而读取这些数据。
>
> cancel 函数是通过 SelectionKey 直接取消监听这个事件，以后都不会监听这个 Channel 的读取事件。

3、NIO 客户端的主启动类（应用层）：

```java
//NIO 通信客户端
public class NioClient {
    private static NioClientHandler clientHandler;

    public static void start(){
        clientHandler = new NioClientHandler(Constant.DEFAULT_IP, Constant.DEFAULT_PORT);
        new Thread(clientHandler, "client").start();
    }

    //向服务端发送消息
    public static boolean sendMessage(String message) throws Exception {
        clientHandler.sendMessage(message);
        return true;
    }

    public static void main(String[] args){
        start();
        Scanner scanner = new Scanner(System.in);
        while (true) {
            try {
                if (!NioClient.sendMessage(scanner.next())) break;
            } catch (Exception e) {
                e.printStackTrace();
            }
            ;
        }
    }
}
```

4、NIO 客户端的事件具体实现：

```java
//客户端处理通信的具体实现
public class NioClientHandler extends Thread{
    private String host;
    private int port;
    private volatile boolean started;
    private Selector selector;
    private SocketChannel socketChannel;

    public NioClientHandler(String ip, int port){
        this.host = ip;
        this.port = port;
        try {
            selector = Selector.open();
            socketChannel = SocketChannel.open();
            socketChannel.configureBlocking(false);
            // 具体的注册则需要根据连接时间来看是注册哪种事件：连接 还是 读取，因此在 run 方法内部实现
            started = true;
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void run() {
        //client 客户端直接发起连接
        try {
            doConnect();
        } catch (IOException e) {
            e.printStackTrace();
            System.exit(1);
        }

        //遍历 Select 中的事件，进行监听分别处理
        while (started){
            try {
                selector.select(1000);  //每隔 1s 唤醒一次
                Set<SelectionKey> keys = selector.selectedKeys();
                Iterator<SelectionKey> iterator = keys.iterator();
                SelectionKey key = null;
                while (iterator.hasNext()){
                    key = iterator.next();
                    iterator.remove();
                    try {
                        handleInput(key);
                    }catch (Exception e){
                        if(key != null){
                            key.cancel();
                            if(key.channel() != null){
                                key.channel().close();
                            }
                        }
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                System.exit(1);
            }
        }
        // selector关闭后会自动释放里面管理的资源
        if(selector != null)
            try{
                selector.close();
            }catch (Exception e) {
                e.printStackTrace();
            }
    }

    //具体的事件处理方法
    private void handleInput(SelectionKey key) throws IOException {
        if (key.isValid()){ //判断是否有效
            SocketChannel sc = (SocketChannel) key.channel();
            if (key.isConnectable()){    //连接事件的处理,连接完成则注册读取事件
                if(sc.finishConnect()) socketChannel.register(selector, SelectionKey.OP_READ);
                else System.exit(1);    //如果建立连接失败表示连接出问题，客户端退出
            }
            if (key.isReadable()){
                ByteBuffer buffer = ByteBuffer.allocate(1024);
                int readBytes = sc.read(buffer);
                if (readBytes > 0){
                    buffer.flip();
                    byte[] bytes = new byte[buffer.remaining()];
                    buffer.get(bytes);
                    String message = new String(bytes, StandardCharsets.UTF_8);
                    System.out.println("客户端收到消息：" + message);
                }else if (readBytes < 0){
                    key.cancel();
                    sc.close();
                }
            }
        }
    }

    public void doConnect() throws IOException {
        // NIO 非阻塞模式，此处是非阻塞连接，connect 返回 boolean，这个连接过程可能比较慢，可能需要重试
        if (socketChannel.connect(new InetSocketAddress(host, port)))
            //如果已经连接成功，则注册 read 事件
            socketChannel.register(selector, SelectionKey.OP_READ);
        else socketChannel.register(selector, SelectionKey.OP_CONNECT);
    }

    //写数据对外暴露的API
    public void sendMessage(String msg) throws Exception{
        byte[] bytes = msg.getBytes();
        ByteBuffer writeBuffer = ByteBuffer.allocate(bytes.length);
        writeBuffer.put(bytes);
        writeBuffer.flip();
        socketChannel.write(writeBuffer);
    }
}
```

5、测试证明能够实现通信，且底层使用的 NIO 模型实现。

```shell
# 客户端发送消息
你好呀
# 客户端接收到的响应消息
客户端收到消息：Hello,老李狗,Now isWed Jul 06 12:57:47 CST 2022

# 服务端此时状态
服务器已启动，监听端口：8888
产生 SocketChannel 对象，成功建立连接
服务器收到消息：你好呀
```

## NIO 问题分析

1、如果 Buffer 大小不够一次将客户端发送过来的数据全部接收过来，那么服务端每次都只是接收了完整数据的一部分，服务端该怎么处理呢？

​		如果手动处理 NIO 数据报的`半包粘包问题`是非常复杂的过程，Netty 已经进行了实现。Java 的网络框架就是 Netty 的天下，其他的框架都是使用 Netty 的相似原理，Netty 已经足够应付基本所有的网络通信。Buffer 大小 1024，如果数据信息大于 1024 时，一次也只会读取 1024，剩下的下次读（不停监听）至于具体如何组合成需要的信息则涉及网络通信的半包粘包化处理（实际开发使用 Netty 即可，其已经进行了解决）。

2、为什么客户端和服务端都没有监听 “写事件” ？	如果关注写事件，会产生什么问题呢？

​	1）原先响应信息的服务端的是采用写入到 Channel ，而后客户端读取，现在修改为：服务端采用写事件将数据写出。

```java
public class NioServerHandlerWriteable extends Thread{
    ......
    private void handleInput(SelectionKey key) throws IOException {
        System.out.println("current key has things:" + key.interestOps());  //当前通道的事件集
        ..........
            if (key.isWritable()){
                SocketChannel sc = (SocketChannel) key.channel();
                //此时便不能重新 new 一个 buffer，因为不是一个 Buffer 要写出的数据就不存在，得通过参数将响应信息传递过来才行
                ByteBuffer buffer = (ByteBuffer) key.attachment();
                if (buffer.hasRemaining()){
                    int count = sc.write(buffer);
                    System.out.println("write:" + count + " byte,and remaining " + buffer.hasRemaining() + " byte");
                }
            }
        }
    }

    private void responseWrite(SocketChannel sc, String responseMessage) throws IOException {
        ........
        //将 buffer 附着在这个key 上，方法跳转时就可以获取到这个响应信息
        sc.register(selector, SelectionKey.OP_WRITE | SelectionKey.OP_READ).attach(buffer);   //如果只注册写事件，会将原来注册的读事件覆盖掉
    }

}
```

​	2）启动测试发现：

```shell
# 服务端打印：这个 16 = 1<<4 表示 accept 事件
服务器已启动，监听端口：8888
current key has things:16
产生 SocketChannel 对象，成功建立连接
```

​	客户端发送消息：老李狗

```shell
# 服务端不停打印：5 = 1 + 1 << 2 ，表示读事件和写事件
current key has things:5
```

​	不停打印就是因为只要当`发送缓冲区有空闲位置时 Selector 时就会一直不停产生写事件`，也就导致不停触发写事件，那么如何解决呢？`空闲时就取消监听写事件`。

```java
if (key.isWritable()){
    SocketChannel sc = (SocketChannel) key.channel();
    //此时便不能重新 new 一个 buffer，因为不是一个 Buffer 要写出的数据就不存在，得通过参数将响应信息传递过来才行
    ByteBuffer buffer = (ByteBuffer) key.attachment();
    if (buffer.hasRemaining()){
        int count = sc.write(buffer);
        System.out.println("write:" + count + " byte,and remaining " + buffer.hasRemaining() + " byte");
    }else {
        //取消对写事件的注册，也就是保留 OP_READ，此时便不会出现不停监听的情况。
        key.interestOps(SelectionKey.OP_READ);
    }
}
```

> 如何和之前一样使用 cancel 来取消注册，则会将该 SocketChannel 所有监听的事件都取消掉，因此使用 `interestOps`。

其主要原理图为：

![](https://pic1.imgdb.cn/item/6336baa016f2c2beb18b57da.png)

# Reactor 模式

​		Reactor 模式：反应器模式，”反应“ 也就是 ”倒置“、控制逆转。具体事件处理程序不调用反应器，而向反应器注册一个事件处理器，表示自己对某些事件感兴趣，该事件来了，具体事件处理程序通过事件处理器对某个指定的事件发生做出反应。

​		这种控制逆转又称为 `“好莱坞法则”`，可以理解为：不要调用我， 而是我来调用你。（NIO 模型中 Selector 和 SocketChannel 的关系）

​		`[举例]`：Tom 去做大保健，跟前台说只想要 100 号技师，但是现在 100号技师不在，因此前台就说等 100 号技师上班了，就通知 Tom（把 100号技师预约上了），同时 Tom 告诉前台说只想在 999 号房间一条龙服务，等 999号房间空出来，前台通知 Tom 将 999 房间占住。这个案例中，前台就是反应器（Selector），Tom 就是具体的事件处理程序（SocketChannel 里的业务），100号技师上班 和 999号房间空闲就是 Tom 监听的事件（事件）。

1、单线程的 Reactor 模式。

![](https://pic1.imgdb.cn/item/6336bab016f2c2beb18b66c4.png)

​		Reactor 的单线程模式的单线程主要是针对于 I/O 操作而言，也就是所有的 I/O 的 accept()、read()、write()以及 connect()操作都在一个线程上完成的。单线程 Reactor 模式中，不仅 I/O 操作在该 Reactor 线程上，连非 I/O 的业务操作也在该线程上进行处理了，这可能会大大延迟 I/O 请求的响应。所以我们应该将非 I/O 的业务逻辑操作从 Reactor 线程上卸载，以此来加速 Reactor 线程对 I/O 请求的响应。

2、单线程 Reactor，工作者线程池模式。

![](https://pic1.imgdb.cn/item/6336babe16f2c2beb18b7595.png)

​		添加了一个工作者线程池，将非 I/O 操作从 Reactor 线程中移出转交给工作者线程池来执行，提高 Reactor 线程的 I/O 响应，但所以的 I/O 操作依旧由一个 Reactor 来完成，包括 I/O 的 accept()、read()、 write() 以及 connect() 操作。当高负载、大并发或大数据量场景时，此种方案也无法满足需要：

1）一个 NIO 线程同时处理成百上千的链路，性能上无法支撑，即便 CPU 负荷达到 100%，也无法满足海量消息的读取和发送。

2）当 NIO 线程负载过重之后，处理速度将变慢，这会导致大量客户端连接超时，超时之后往往会进行重发，这更加重了 NIO 线程的负载，最终会导致大量消息积压和处理超时， 成为系统的性能瓶颈。

3、多 Reactor 线程模式。

​		Reactor 同样使用线程池，其中的每一个线程 Reactor 都会有自己的 Selector、线程和分发的事件循环逻辑。mainReactor 可以只有一个，但 subReactor 一般会有多个。mainReactor 线程主要负责接收客户端的连接请求，然后将接收到的 SocketChannel 传递给 subReactor，由 subReactor 来完成和客户端的通信。

​		可以理解为：mainReactor 负责连接，而多个 subReactor 负责具体的连接后的 IO 操作。

![](https://pic1.imgdb.cn/item/6336bac816f2c2beb18b80f6.png)

​		所以的 I/O 操作(包括，I/O 的 accept()、read()、write()以及 connect()操作)依旧还是在 Reactor 线程(mainReactor 线程 或 subReactor 线程)中完成的。Thread Pool(线程池)仅用来处理非 I/O 操作的逻辑。只不过多 Reactor 线程模式将“接受客户端的连接请求”和“与该客户端的通信”分在了两个Reactor线程来完成。同时在高并发情况下还可以配置多个 SubReactor 线程，在多核的操作系统中这能大大提升应用的负载和吞吐量。

​		`Netty 服务端就使用了 ”多 Reactor 线程模式“`。
