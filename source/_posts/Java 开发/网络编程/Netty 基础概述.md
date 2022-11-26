---
title: Netty 基本概述
date: 2022-02-25 00:00:00
type:
comments:
tags: 
  - Netty
  - 网络编程
categories: 
  - Java 开发
description: 
keywords: Netty
cover: https://w.wallhaven.cc/full/j3/wallhaven-j36yxq.jpg
top_img: https://w.wallhaven.cc/full/j3/wallhaven-j36yxq.jpg
---

​	`Netty` 是由 JBOSS 提供的一个 Java 开源框架，解决网络通信的一系列问题的一个框架，屏蔽了底层和上层的很多复杂的操作（例如半包粘包问题、建立连接后的具体读写等等）。Netty 提供`异步`（NIO）的、事件驱动的网络应用程序框架和工具，用以快速开发高性能、高可靠性的网络服务器和客户端程序。

> Netty 版本问题：全文使用 `Netty 4.1.28` 版本依赖，Netty 5 底层使用的伪 AIO，性能更好，但是问题很大已经停止开发。

Netty 虽然屏蔽了 NIO 底层的复杂细节，但还是有一些核心组件：

1）`EventLoop(Group)`：线程（线程池/组）

2）`Channel`：网络通讯连接的抽象，负责具体的网络通信，类似于 NIO 模型中的 SocketChannel。

3）`事件`：在 Netty 中所有的连接和处理都可以当作一个事件，例如连接、读、写事件。

4）`ChannelHandler`：事件处理器。ChannelPipeline 是事件处理器的容器，包含多个事件处理器，例如 Https 报文验证、解密等多个处理器。

5）`ChannelFuture`：由于 Netty 中所有的操作都是异步的，不需要按顺序执行，但是执行结果需要记录，此组件就是保存异步方法的执行结果的容器。

`[案例]`  编写一个基本的 Netty 程序初步了解。

服务端：需要注意的是 Netty 所有的操作都是异步的，因此需要合适的阻塞等待服务器关闭（服务端一般不会关闭 ServerChannel ）。

```java
//基于 Netty 的服务器端
public class EchoServer {
    private final int port;

    public EchoServer(int port) { this.port = port;}

    public static void main(String[] args) throws InterruptedException {
        int port = 9999;
        EchoServer echoServer = new EchoServer(port);
        System.out.println("服务器即将启动......");
        echoServer.start();
        System.out.println("服务器关闭......");
    }

    public void start() throws InterruptedException {
        final EchoServerHandler serverHandler = new EchoServerHandler();
        //线程组，反应器 Reactor 模式希望处理逻辑分开
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            //服务端启动必备：会完成一些初始化和引导性工作
            ServerBootstrap boot = new ServerBootstrap();
            boot.group(group)   //指定使用的线程组
                    .channel(NioServerSocketChannel.class) // 指定使用 NIO 的通信模式
                    .localAddress(new InetSocketAddress(port))  //指定监听端口:监听本地本口
                    //配置相关的 Handler（可能有多个，因此使用 ChannelInitializer，而不是直接使用 new ChannelHandler）
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        //装载 Handler
                        @Override
                        protected void initChannel(SocketChannel socketChannel) throws Exception {
                            //使用 pipeline 将事件处理器加入到 事件处理器的容器
                            socketChannel.pipeline().addLast(serverHandler);
                        }
                    });
            // 异步绑定到服务器
            // 但是 Netty 里面的操作都是异步处理的，bind 可能还没执行完，强制改为同步使其阻塞到 bind 完成
            // 但是现在还是有问题，bind 完成后程序还是结束了，因此需要 ChannelFuture 来进行处理使其继续阻塞
            ChannelFuture future = boot.bind().sync();
            // Netty 里面的所有的操作都会返回一个 ChannelFuture
            future.channel().closeFuture().sync();  //阻塞当前线程，直到服务器的 ServerChannel 被关闭
            // ServerChannel 一般是不关闭的，特别是在服务端，除非是服务器需要重启
        } finally {
            group.shutdownGracefully().sync();  //关闭线程组
        }
    }
}
```

```java
// 因为需要的是 ChannelHandler，但直接实现 ChannelHandler 重写方法过多，
// 因此使用适配者模式，由于此次主要实现读取网络数据，因此继承 ChannelInboundHandlerAdapter
public class EchoServerHandler extends ChannelInboundHandlerAdapter {

    /**
     * 读取客户端传过来的数据，并响应数据回去
     * @param ctx
     * @param msg 对端传过来的数据
     * @throws Exception
     */
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        //ByteBuf 可以理解为 NIO 里面的 ByteBuffer 缓冲区
        ByteBuf in = (ByteBuf)msg;
        System.out.println("Server accept:" + in.toString(StandardCharsets.UTF_8));
        ctx.writeAndFlush(in);  //回传数据
        ctx.close();    //关闭连接
    }

    /**
     * 发生异常时的处理程序
     * @param ctx
     * @param cause
     * @throws Exception
     */
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }
}
```

客户端：客户端使用 handler 即可，因为客户端的 socket 只需要一个即可，二服务端是可能和多个客户端连接的，因此是 childHandler。

```java
//基于 Netty 的客户端
public class EchoClient {
    private final int port;
    private final String host;

    public EchoClient(int port, String host){
        this.host = host;
        this.port = port;
    }

    public void start() throws InterruptedException {
        final EchoServerHandler serverHandler = new EchoServerHandler();
        //线程组，反应器 Reactor 模式希望处理逻辑分开
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            //客户端启动必备：会完成一些初始化和引导性工作
            Bootstrap boot = new Bootstrap();
            boot.group(group)   //指定使用的线程组
                    .channel(NioSocketChannel.class) // 指定使用 NIO 的通信模式
                    .remoteAddress(new InetSocketAddress(host, port))  //连接远程的服务器IP 和 port
                    //客户端通信的 socket 和 handler 一一对应，只需要一个同服务端通信即可，因此使用 handler，而不是 childHandler
                    .handler(new ChannelInitializer<SocketChannel>() {
                        //装载 Handler
                        @Override
                        protected void initChannel(SocketChannel socketChannel) throws Exception {
                            //使用 pipeline 将事件处理器加入到 事件处理器的容器
                            socketChannel.pipeline().addLast(new EchoClientHandler());
                        }
                    });
            // 客户端连接远程的服务器，而不是绑定，也需要阻塞等待连接完成
            ChannelFuture future = boot.connect().sync();
            // Netty 里面的所有的操作都会返回一个 ChannelFuture
            future.channel().closeFuture().sync();  //阻塞当前线程，直到client的 channel 被关闭
        } finally {
            group.shutdownGracefully().sync();  //关闭线程组
        }
    }

    public static void main(String[] args) throws InterruptedException {
        new EchoClient(9999, "127.0.0.1").start();
    }
}
```

```java
public class EchoClientHandler extends SimpleChannelInboundHandler<ByteBuf> {

    /**
     * 表示读取到网络数据后进行业务处理
     * @param ctx
     * @param msg 服务端回传的消息
     * @throws Exception
     */
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, ByteBuf msg) throws Exception {
        System.out.println("Client accept:" + msg.toString(StandardCharsets.UTF_8));
    }

    /**
     * 最开始的消息当然是客户端发出，那么应该在哪个方法里面实现呢？====> channelActive
     * 表示 Channel 活跃（连接）后，进行相关业务处理内容
     * @param ctx
     * @throws Exception
     */
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        // Unpooled 是 Netty 的一个工具类，产生一个 ByteBuf，此处是从字符串中产生
        ctx.writeAndFlush(Unpooled.copiedBuffer("Hello,Netty!", StandardCharsets.UTF_8));
    }
}
```

验证结果，发现可以成功实现通信。

```shell
# 客户端：
Client accept:Hello,Netty!
# 服务端：
服务器即将启动......
Server accept:Hello,Netty!
```

`[问题]`  此示例是基于 NIO 的 Netty 框架，那么考虑能不能使用之前基于 NIO 的通信客户端（请看 Java 原生网络编程）来和此处的服务端连接呢？

​		当然是可以的，不过可能会出现问题，因为代码中只有一个 EchoServerHandler 处理器，在 Netty 内部 Handler 默认是不支持共享的，如果需要成功连接需要在 handler 上加上注解：`@ChannelHandler.Sharable`，表示此 handler 设置共享，或者还可以每次都 new 一个新的 handler。（默认是一个 handler 是只支持一个 client 客户端的）
