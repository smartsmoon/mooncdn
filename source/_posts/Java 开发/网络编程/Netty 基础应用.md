---
title: Netty 基础应用
date: 2022-02-27 00:00:00
type:
comments:
tags: 
  - Netty
  - 网络编程
categories: 
  - Java 开发
description: 
keywords: Netty
cover: https://w.wallhaven.cc/full/9d/wallhaven-9dx8md.jpg
top_img: https://w.wallhaven.cc/full/9d/wallhaven-9dx8md.jpg
---

## Netty 组件详述

`[理论]` 了解 Netty 的基本组件。

​	1）Channel：是对 Socket 的相关抽象，提供了网络 Socket 通信的基本属性和方法，同时 Netty 也进行了一些加强的高级特性。

​		Channel 的生命周期：ChannelRegistered（注册）、ChannelActive（已经和远程建立连接）、ChannelInactive（Channel 关闭后，取消和 EventLoop 注册关系的取消）、ChannelUnregistered（未注册：未注册到 EventLoop）。而 `Channel 的这些变化就是事件`，就需要使用 Handler 进行处理，每一个 Channel 都有一个 ChannelPipeline，进行业务代码的实现。

​	2）EventLoop：EventLoop 都有一个自己独属的线程，因此可以把 EventLoop 就直接理解成一个线程，Channel 需要注册到 EventLoop 上，在整个生命周期上使用 EventLoop `反复处理 IO 事件`，每一个 EventLoop 内部都有一个 Selector。

​		在执行某个任务（读写）时，会先判定`执行这个任务的线程和当前 EventLoop 里面的线程是不是同一个`，如果不是同一个，就把这个任务放到 EventLoop 专属的`队列`中（因此`不推荐将一些阻塞式的业务放在 EventLoop 里面的线程进行处理`，可以放在业务处理的线程池处理），如果是同一个就直接执行。那么 EventLoop 中就是又有线程又有队列，也就是 SingleThreadPool 单线程的线程池。

> ​	业务线程中准备向网络上 Channel 读写数据，但每一个 Channel 都有一个对应的 EventLoop 来处理事件，则此时就可能执行读写事件的线程是业务线程，而并不是 EventLoop 里面的线程。
>
> ​	之前实现 NIO 的时候，提供了 SendMessage 方法向外写数据，这个方法是由 main 线程执行，就可以说 main 线程尝试通过 Channel 向网络上写数据，但是在 Netty 中，每个 Channel 都注册在一个 EventLoop 中（挂钩），那么按道理说，这个 Channel 的所有网络读写都应该由 EventChannel 里面的线程来进行实现，那么这个 sendMessage 是业务线程（main）在直接往网络上写，那么在 Netty 此时就会将这个任务放进 EventLoop 的队列中。

​	一个 EventLoop 可以负责多个 Channel（一对多），也就是一个线程可以同时处理多个 Channel 上发生的读写事件。例如 NIO 通信框架中一个线程既可以处理 连接的 serverSocketChannel ，也可以处理读写的 SocketChannel。

​	3）EventLoopGroup：EventLoop 使用时和具体的线程关联（因此可以理解成一个线程），EventLoopGroup 可以理解成线程组。

`[总结]`  一个 EventLoopGroup 包含一个或者多个 EventLoop，一个 EventLoop 在它的生命周期内只和一个 Thread 绑定，所有由 EventLoop 处理的 I/O 事件都将在它专有的 Thread 上被处理（如果不是这个线程则会进入其队列），一个 Channel 在它的生命周期内只注册于一个 EventLoop，一个 EventLoop 可能会被分配给一个或多个 Channel。

------

`[理论]` 开发人员的角度的 Netty 核心就是 ChannelHandler，是所有处理 `入站(读)和出站(写)` 数据的应用程序逻辑的组件，Netty 以`适配器类（避免重写）`的形式提供了大量默认的ChannelHandler 实现（Http、Ssl、WebSocket 等），帮助简化应用程序处理逻辑的开发过程。ChannelHandl 接口本身方法简洁，但其有两个重要子接口：`ChannelInboundHandler`（入站）  和 `ChannelOutboundHandler`（出站），这两个接口都提供了很多事件监听的处理方法。

> ​	ChannelOutboundHandler 接口是出站使用的 Handler 接口，但是为什么也提供了 `read` 方法呢？这里的 `Outbound` 不仅仅是指向通道 Channel 上写数据，当业务部分向 Channel 发起请求读取更多的数据时就是 read 操作，这也是一个出站操作。

​		Netty 为了避免当使用 Handler 时重写所有的方法，因此使用了很多默认的适配器类，当使用时一般都是使用这些适配器类，例如 Netty 基本概述中服务端的处理器 Handler 就是实现的 `ChannelInboundHandlerAdapter` 。在实际开发中使用比较多的就是：ChannelHandlerAdapter、ChannelInboundHandlerAdapter 和 ChannelOutboundHandlerAdapter 三个。

`[问题]` 为什么还需要使用 ChannelHandlerAdapter 呢？ 因为有一些业务逻辑既需要入站操作，也需要出站操作。

`[问题]` 为什么之前的案例中使用的是 SimpleChannelInboundHandler 呢？（`责任链模式`：保证自己的责任）

​		回想在使用 NIO 的时候，首先创建的是 `Buffer`，Netty 底层如果使用 NIO 模型为基础，则肯定也是需要一个 Buffer 的，利用 Buffer 来中转。但是如此多的读写的 Buffer 如果不释放则会造成 `内存泄露` 问题，局部变量可以在执行完后自动回收，但是有一个附着在 Selector 上的 Buffer 就存在内存泄露的问题。而使用 Netty 时如果确定数据已经写到对方并传递（完成了整个流程），则 Netty 会自动进行 Buffer 的释放，但是如果重写了 write 方法，但是写出数据时不将数据向后传递（ 没有将 buffer 传递），就需要手动释放 Buffer，否则就还会内存泄漏。读数据时也是一样如果不将读取到的数据向后传递给其他的 Handler 或者业务代码，同样需要手动释放 Buffer，由于读数据比写数据常用，Netty 就专门提供了 SimpleChannelInboundHandler 来做这件事。

> ​		实际 Netty 内部有缺省的 Handler，一个 header ，一个 tail，当最后一个 handler 出错时就会出现将错误信息传递给业务代码，同时`最后一个 tail handler 也会对 buffer 进行释放`。

```java
@Override
public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
    boolean release = true;
    try {
        if (acceptInboundMessage(msg)) {
            @SuppressWarnings("unchecked")
            I imsg = (I) msg;
            channelRead0(ctx, imsg);	//此处调用的就是 channelRead0 方法
        } else {
            release = false;
            ctx.fireChannelRead(msg);	//向后面的 Handler 传递
        }
    } finally {
        if (autoRelease && release) {
            ReferenceCountUtil.release(msg);	//释放资源
        }
    }
}
```

​	因此使用这个适配器时，读取数据代码只需要重写 `channelRead0` 方法即可，因此读取数据时最前面的 Handler 一般使用 SimpleChannelInboundHandler  。

> 避免内存泄漏：读取到的数据要么要么向后传递，要么就自己释放。

​		ChannelPipeline 提供了 ChannelHandler 链的`容器`，并定义了用于在该链上传播入站和出站事件流的各种 API（添加、删除、事件流动等）。服务端和客户端建立一个连接，则就会有一个 Channel，这个 Channel 就会有一个所属的 ChannelPipeline ，就会根据定义的 Handler 将各种 Handler 加入到 ChannelPipeline 中去，多个 ChannelPipeline 可以加入同一个 ChannelHandler（但是不建议，因为可能会产生线程安全问题）。

`[问题]`  注意在之前的 Netty 案例中客户端添加 ChannelHandler 时添加的是 `ChannelInitializer`，点进源码发现这个也是一个 ChannelHandler，里面再 new 了一个新的 ChannelHandler，那么这个每次读写会不会就都会创建一个新的呢？那么 ChannelPipeline 里面的 Handler 岂不是会越来越多？

​		实际上并不会，ChannelInitializer 这个 ChannelHandler 的作用就是每次执行任务时都会流经这个，但是里面的 ChannelHandler 会`动态的增减`，这是为了业务的弹性。例如当需要做网站限流时，白天需要限流但是晚上并不需要，就可以通过 ChannelInitializer 动态调整。

​		当 ChannelHandler 被添加到 ChannelPipeline 时，它将会被分配到一个 `ChannelHandlerContext ` 中，代表了 ChannelHandler 和 ChannelPipeline 之间的绑定，用于维护两者之间的关系。（可以理解成 ChannelPipeline 这个链表的 Node）内部的 Hander 职责单一，关系靠外部的 Context 来进行维护。

![](D:\NoteBook\核心笔记\网络编程\image\ChannelHandler.png)

​		此时出站和入站的 Handler 都位于这一个双向链表中，Netty 会自动检测这个 Node 是出站还是入站的处理Handler，进而往后传递。

> 读写数据时使用 fireXXXX 方法来进行 handler 处理的传递。

`[问题]`  为什么不用两个链表？	可能是因为有的处理器既处理入站也处理出站，同时也能节约资源。

`[问题]` 发现 ChannelHandlerContext 提供的方法和 Channel 或 ChannelPipeline 提供的方法有很多重复的。（事件的传播）

```java
ctx.writeAndFlush();	// 可以直接使用某个 ctx 直接调用 write 则就从当前的 channelHandler 开始处理
ctx.channel().write();	// 意味着数据的处理从第一个出站 handler 开始处理，也就是所有的出站 handler 都要处理一次
ctx.pipeline().write();	// 意味着数据的处理从第一个出站 handler 开始处理，也就是所有的出站 handler 都要处理一次
```

​		这样设计是为了`灵活安全`的处理读写业务请求。例如 http 解密失败，此时如果调用 channel 或 pipeline 的 write 方法，则所有的出站 Handler 都要处理一遍，但由于每个 Handler只处理单一的业务，此时流经其他的 handler 可能还会出问题，但是如果使用 ctx 直接写就可以直接写出去。

`[理论]` 在之前的案例中使用的是 NIO 通信模式，那么 Netty 支持哪些内置通信传输模式呢？

1）NIO  通信模型。

2）Epoll：也是基于 NIO 的通信，Netty 中使用 JNI 进行相关驱动的，只能用在 linux 系统。（调整较大，使用比较少）

3）OIO：内部就是 BIO 通信模型。

4）Local：Jvm 管道通信，本地传输。

5）Embedded：单元测试，可以测试单个的 ChannelHandler 的使用。

`[理论]` 客户端和服务端的启动引导是不相同的，服务端使用 ServerBootstrap 可以传入多个 EventLoopGroup（反应器模式的多个线程组），而客户端使用 Bootstrap 且只能传入一个 EventLoopGroup。

> `TCP 协议规定`：当服务端接收 TCP 请求前，需要进行三次握手连接，但服务端每次只能处理一个连接，剩余连接就需要进入可连接队列（等待队列），等待队列满时就会提示无法连接，当连接完成后，他们又都会进入已连接队列。在 `ChannelOption` 中可以设置 `SO_BACKLOG`，这个里面就存储了可连接队列。

`[分析]`  分析配置通道的属性 ChannelOption 的参数（都是操作系统级别 TCP / IP 通信的参数），可能会调整到的参数主要有：

1）SO_BACKLOG：TCP 可连接队列的大小。

2）SO_REUSEADDR：地址复用机制。当某个端口应用出现问题时，释放端口后，马上需要重启这个端口的应用可以避免端口被占用。

3）SO_REVBUF：接收缓冲区的大小，注意是操作系统级别的，并不是 NIO 里的应用级别的缓存。

4）SO_SNDBUF：发送缓冲区的大小，注意是操作系统级别的，并不是 NIO 里的应用级别的缓存。

5）SO_LINGER：网络连接结束时需要调用 close 方法，但是发送缓冲区可能还有数据没发送完，使用此参数告诉操作系统需要等待数据发送完毕再结束资源。

`[理论]`  ByteBuf 组件的了解。

​		网络数据的基本单位是字节，Java NIO 提供了 `ByteBuffer` 作为它的字节容器，但是这个类使用起来过于复杂，而且也有些繁琐。Netty 抽象出 ByteBuf 来取代 ByteBuffer，并进行了强大的实现，既解决了 JDK API 的局限性，又为网络应用程序的开发者提供了更好的 API。（`读写索引的分离`）

​	ByteBuf 针对读写操作`维护了两个不同的索引`，其 API 名称以 read 或者 write 开头的 ByteBuf 方法，将`会推进其对应的索引`，而 API 名称以 set 或者 get 开头的操作则不会推进索引，类似于 NIO 原生 ByteBuffer 的绝对读和相对读。`读索引 readerIndex 和 写索引 writeIndex 都是从 0 开始的`。

​	ByteBuf 的实现主要有几种实现：

1）JVM 内存的堆上产生就是堆缓冲区，分配与释放非常快，但实际网络读写比较慢。

2）JVM 直接内存上产生就是直接缓冲区，分配和释放比较昂贵，每次分配和释放都需要向操作系统申请，但实际网络读写速度较快。

3）复合缓冲区：是一种思想，将两部分包装成一个视图，操作时单独操作，发送时 Netty 会自动视作整体发送。（避免内存拷贝）

`[问题]`  那么如何拿到 ByteBuf 的实例呢？

1）通过 ctx 获取到 ByteBufAllocator 分配器，进而拿到对应的实例：默认使用池化技术拿到实例。

```java
ctx.alloc();		//获取到分配器的实例（默认是池化的）
ByteBuf heapBuffer(int initialCapacity);
ByteBuf directBuffer(int initialCapacity);
CompositeByteBuf compositeBuffer(int maxNumComponents);
```

2）通过 Unpooled工具类拿到实例，实际也是通过分配器实现：使用非池化技术拿到实例，同时还提供一些转化的 API 方法。

ByteBuf 提供了很多可用的 API ，主要包括：随机访问/顺序访问/读写操作、`可丢弃字节/可读字节/可写字节`、索引管理、查找操作、派生缓冲区、引用计数 等。

## 粘包半包问题

`[问题]` TCP 发生粘包半包的问题的原因有哪些呢？Netty 如何解决 TCP 粘包半包问题？

​		TCP 是不知道上层的业务的数据包是如何切分的，这就会导致应用层发送了两个数据包，可能是一个一个发送到对端（没问题），也可能两个一起发送或是部分发送，这也就导致了粘包半包问题。这个解决办法应该是由应用层来实现，来区分多个数据包。

1）应用程序写入数据的字节大小大于套接字发送缓冲区的大小。====> 必然出现分包。

2）进行 MSS（最大报文段：以太网是 1460 byte） 大小的 TCP 分段。

3）以太网的 payload 大于 MTU（最大传输单元：以太网上限定1500 byte）进行 IP 分片。

经过这么多层的经历，可能就会产生分段或分片，特别 IP 分片在中间路由器也进行了分片，是不可控制的，也就产生了粘包半包问题（基本必然发生）。

那么如何解决呢，也就是发送的报文中间如何分隔呢？最常见的方式主要有三个：

1）增加一个分隔符，并需要告诉 Netty 分隔符是什么，最常见消息分隔符就是`回车换行符`，Netty 也专门提供了 handler 使用这个方法解决粘包半包问题。

```java
// 客户端和服务端都需要添加 LineBasedFrameDecoder 解码设置 1024
ch.pipeline().addLast(new LineBasedFrameDecoder(1024));
```

​	但是如果发送的文本本身带有回车换行符，那么应该怎么办呢？ ====> 自定义相关的分隔符，此处使用 `@~` 作为分隔符测试。

服务端代码：

```java
public class DelimiterEchoServer {
    public static final String DELIMITER_SYMBOL = "@~";     // 分隔符的设定
    public static final int PORT = 9997;

    public static void main(String[] args) throws InterruptedException {
        DelimiterEchoServer delimiterEchoServer = new DelimiterEchoServer();
        System.out.println("Server is running ......");
        delimiterEchoServer.start();
    }

    private void start() throws InterruptedException {
        final DelimiterServerHandler serverHandler = new DelimiterServerHandler();
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            serverBootstrap.group(group)
                    .channel(NioServerSocketChannel.class)
                    .localAddress(PORT)
                    .childHandler(new ChannelInitializerImp());
            ChannelFuture future = serverBootstrap.bind().sync();
            System.out.println("server is run,wait client to connect.......");
            future.channel().closeFuture().sync();
        } finally {
            group.shutdownGracefully().sync();
        }
    }

    private static class ChannelInitializerImp extends ChannelInitializer<Channel> {
        @Override
        protected void initChannel(Channel ch) throws Exception {
            ByteBuf delimiter = Unpooled.copiedBuffer(DELIMITER_SYMBOL.getBytes(StandardCharsets.UTF_8));
            ch.pipeline().addLast(new DelimiterBasedFrameDecoder(1024, delimiter));
            ch.pipeline().addLast(new DelimiterServerHandler());
        }
    }
}
```

```java
public class DelimiterServerHandler extends ChannelInboundHandlerAdapter {
    private AtomicInteger counter = new AtomicInteger(0);

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        ByteBuf message = (ByteBuf) msg;
        String request = message.toString(StandardCharsets.UTF_8);
        System.out.println("Server accept[" + request + "] and the counter = " + counter.incrementAndGet());
        //使用自己定义的分隔符：@~
        String response = "hello," + request + ". welcome to Netty Server!" + DelimiterEchoServer.DELIMITER_SYMBOL;
        ctx.writeAndFlush(Unpooled.copiedBuffer(response.getBytes(StandardCharsets.UTF_8)));
    }

    // 服务端读取完成网络数据后的处理
    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        ctx.writeAndFlush(Unpooled.EMPTY_BUFFER).addListener(ChannelFutureListener.CLOSE);
    }

    // 发生异常后的处理
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }
}
```

客户端代码：

```java
public class DelimiterEchoClient {
    private final String host;

    public DelimiterEchoClient(String host) { this.host = host; }

    public void start() throws InterruptedException {
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            final Bootstrap b = new Bootstrap();;/*客户端启动必须*/
            b.group(group)
                    .channel(NioSocketChannel.class)
                    .remoteAddress(new InetSocketAddress(host,DelimiterEchoServer.PORT))
                    .handler(new ChannelInitializerImp());
            ChannelFuture f = b.connect().sync();
            System.out.println("connected to server .......");
            f.channel().closeFuture().sync();
        } finally {
            group.shutdownGracefully().sync();
        }
    }

    private static class ChannelInitializerImp extends ChannelInitializer<Channel> {

        @Override
        protected void initChannel(Channel ch) throws Exception {
            ByteBuf delimiter = Unpooled.copiedBuffer(DelimiterEchoServer.DELIMITER_SYMBOL.getBytes(StandardCharsets.UTF_8));
            ch.pipeline().addLast(new DelimiterBasedFrameDecoder(1024, delimiter));
            ch.pipeline().addLast(new DelimiterClientHandler());
        }
    }

    public static void main(String[] args) throws InterruptedException {
        new DelimiterEchoClient("127.0.0.1").start();
    }
}
```

```java
public class DelimiterClientHandler extends SimpleChannelInboundHandler<ByteBuf> {
    private AtomicInteger counter = new AtomicInteger(0);
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, ByteBuf msg) throws Exception {
        System.out.println("client Accept["+msg.toString(StandardCharsets.UTF_8)
                +"] and the counter is:"+ counter.incrementAndGet());
    }

    // 连接成功后的事件
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        ByteBuf msg = null;
        String request = "老李" + DelimiterEchoServer.DELIMITER_SYMBOL;   //使用定义的分隔符
        for (int i = 0; i < 10; i++) {
            msg = Unpooled.buffer(request.length());    //拿到 ByteBuf
            msg.writeBytes(request.getBytes(StandardCharsets.UTF_8));
            ctx.writeAndFlush(msg);
        }
    }

    /*** 发生异常后的处理*/
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }
}
```

​		此时就会发现也能够实现消息分割发送，且并未产生半包粘包问题，适用于`文本协议（FTP 等）`。

> 如果需要使用默认的回车换行符，则就是将分隔符换成 `System.getProperty("line.separator")` ，再修改解码器为 `LineBasedFrameDecoder` 即可。

2）消息定长发送。

​		消息定长发送的设置实际就是在 ChannelInitializerImp 中加上一些 Netty 预定义好的 handler，主要需要修改 initChannel 方法，其余位置略做更改。

```java
//服务端解码：解码长度是客户端消息的长度 FixedLengthEchoClient.REQUEST.length() 表示客户端消息的长度
ch.pipeline().addLast(new FixedLengthFrameDecoder(FixedLengthEchoClient.REQUEST.length()));
ch.pipeline().addLast(new FixedLengthServerHandler());
// 客户端解码：解码长度是服务端响应消息的长度 FixedLengthEchoServer.RESPONSE.length() 表示服务端应答消息的长度
ch.pipeline().addLast(new FixedLengthFrameDecoder(FixedLengthEchoServer.RESPONSE.length()));
ch.pipeline().addLast(new FixedLengthClientHandler());
```

​		但是此时消息就需要先手动实现长度固定（数据不够补足），或者一开始就将消息长度固定（此处测试使用固定的消息），因此这种方式`过于死板`，适用于服务端和客户端已经约定好数据长度的情况。

3）消息分为消息头和消息体，消息头中带上字段，告诉 Netty 消息的长度。（`使用最多的一种`，但是比较复杂，后续结合实战使用）

`[理论]` 网络数据的传递两端可能是不同的操作系统或平台，对数据的解析是不相同的，因此规定网络上的数据都是用 01 的二进制字节数据，那么应用程序拿到数据后怎么样才能得到自己需要的数据呢（`解码`）？同时本地的对象或其他数据如何才能变成 01 二进制字节发送（`编码`）呢？======> 编解码器框架

1）解码器：将二进制的字节解码成真实的消息，或是把消息类型解码为另外一种格式等等操作。（ https 消息 ---> 密文 ----> 明文）

​	Netty 提供两个经常使用的解码器主要是 `MessageToMessageDecoder` 和  `ByteToMessageDecoder` 。

​	Netty 是一个异步框架，数据一次可能传输并不完整，则解码应该等待数据都接收过来再进行解码，即在完整数据传输过来之前，应该把已经传输过来的数据在内存中保存好，但是又有可能会把内存撑爆，因此进行`解码前应该判定接收的数据有多大`。同时 Netty 还提供一个单独的类：`TooLongFrameException`，也就是数据量太大时应该进行相关异常的抛出。

```java
public class TooLongExceptionSample extends ByteToMessageDecoder {
    private static final int MAX_SIZE = 1024;   //定义解码数据的阈值

    @Override
    protected void decode(ChannelHandlerContext channelHandlerContext, ByteBuf byteBuf, List<Object> list) throws Exception {
        int readable = byteBuf.readableBytes();
        if (readable > MAX_SIZE) {
            channelHandlerContext.close();//传入数据太多表示可能出现问题，一般会选择关闭通信
            throw new TooLongFrameException("too many data translation");
        }
    }
}
```

2）编码器：将消息编码为字节或是将消息编码为消息等操作。

​		Netty 提供两个经常使用的编码器主要是 `MessageToByteEncoder` 和  `MessageToMessageEncoder` 。

`[问题]`  有没有一种情况是编码是同一种算法，那么写两个就会比较麻烦，类似于`对称加密`，相当于编码和解码是一套，这时就可以写在一起吧？

​		Netty 提供了编码和解码可以写在一起的编解码器 `ByteToMessageCodec`，这个里面的方法就是又有编码又有解码，但是一般情况还是分开写会更好，解耦、清晰，且具有更好的可扩展性，遵循业务职责单一。

`[理论]` 可以发现这些编解码器都是抽象类，不同的协议则都需要单独实现，这样会很麻烦。实际上 Netty 内置了很多的实现了各种协议的编解码器。

`[案例]`  实现一个基于 Netty 的 Http Web 服务器，注意需要把 Http 协议内的东西进行解码成规定内容，但是Netty 已经包装好了，可以直接使用。

1）实现一个服务端的启动类。

```java
public class HttpServer {
    public static final int port = 6789;
    private static EventLoopGroup group = new NioEventLoopGroup();
    private static ServerBootstrap serverBootstrap = new ServerBootstrap();

    // Netty 创建全部都是实现自 AbstractBootstrap
    public static void main(String[] args) throws InterruptedException {
        try {
            serverBootstrap.group(group).
                    channel(NioServerSocketChannel.class).
                    childHandler(new ServerHandlerInit()); //设置过滤器和处理器
            ChannelFuture channelFuture = serverBootstrap.bind(port).sync();
            ConstantUtils.printMessage("server has running, port = [" + port + "]");
            channelFuture.channel().closeFuture().sync();   //监听服务器关闭
        }finally {
            group.shutdownGracefully().sync();  //关闭 EventLoopGroup，释放所有资源
        }
    }
}
```

2）实现这里的 childHandler 里面的处理器链，将需要的处理器添加进来。

```java
public class ServerHandlerInit extends ChannelInitializer<SocketChannel> {
    @Override
    protected void initChannel(SocketChannel ch) throws Exception {
        ChannelPipeline ph = ch.pipeline();
        //前面的字符串是对 handler 取名字
        ph.addLast("decoder", new HttpRequestDecoder());    //定义接收客户端请求的解码器并加入到 ChannelPipeline
        ph.addLast("encoder", new HttpResponseEncoder());   //定义响应回去客户端的编码器并加入到 ChannelPipeline
        // http 请求包括消息头和消息体，消息体可能会分块发送，Netty 已经有了聚合器可以对请求报文组合成一个完整的报文再往后传递
        ph.addLast("aggregator" ,new HttpObjectAggregator(10 * 1024 * 1024)); //限制报文的最大长度为 10M
        //将应答报文进行压缩，Netty 同样支持将应答给客户端的报文进行压缩（非必要）
        ph.addLast("compressor", new HttpContentCompressor());
        //具体处理业务的 handler,应该实现入站 handler
        ph.addLast("serviceHandler", new ServiceHandler());
    }
}
```

3）实现里面的处理请求的具体业务代码，是一个入站的处理器 handler。

> 注：ConstantUtils 是自己封装的一个常量和打印的工具类。

```java
public class ServiceHandler extends ChannelInboundHandlerAdapter {

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        ConstantUtils.printMessage("Connection has success!");
        super.channelActive(ctx);
    }

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        //需要注意的是此时数据已经解码并聚合成了一个完整的 Http 请求报文
        String result = "";
        FullHttpRequest httpRequest = (FullHttpRequest) msg;    //将消息数据强转成请求报文的类
        ConstantUtils.printMessage(httpRequest.headers());
        try {
            // 获取请求路径、消息体、请求方式
            String requestUrl = httpRequest.uri();
            String requestBody = httpRequest.content().toString(StandardCharsets.UTF_8);
            HttpMethod requestMethod = httpRequest.method();
            ConstantUtils.printMessage("received http request url = [" + requestUrl + "],type = " + requestMethod);
            // 对请求的路径进行判断
            if (!"/test".equalsIgnoreCase(requestUrl)){
                result = "非法请求：[" + requestUrl + "]";
                this.responseMessage(ctx, result, HttpResponseStatus.BAD_REQUEST);
                return;
            }
            if (HttpMethod.GET.equals(requestMethod)){
                ConstantUtils.printMessage("Accept get request，requestBody = [" + requestBody + "]");
                result = "GET request, response: server has accept";
                responseMessage(ctx, result, HttpResponseStatus.OK);
                return;
            }
            if (HttpMethod.POST.equals(requestMethod)){
                ConstantUtils.printMessage("Accept post request，requestBody = [" + requestBody + "]");
                result = "POST request, response: server has accept";
                responseMessage(ctx, result, HttpResponseStatus.OK);
            }
        }catch (Exception e) {
            ConstantUtils.printMessage("Has Happen Exception!");
            e.printStackTrace();
        } finally {
            ctx.close();
        }
    }

    // 应答消息的具体实现，设置响应的信息
    public void responseMessage(ChannelHandlerContext ctx, String context, HttpResponseStatus status){
        FullHttpResponse response = new DefaultFullHttpResponse(
                HttpVersion.HTTP_1_1,
                status,
                Unpooled.copiedBuffer(context, StandardCharsets.UTF_8));
        response.headers().set(HttpHeaderNames.CONTENT_TYPE, "text/plain;charset=UTF-8");
        ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);   //监听消息发送完毕再执行关闭动作
    }
}
```

​		此时启动服务端，通过浏览器发送请求 `http://loclhost:6789/test`，发现基于 Netty 的简单 Web 服务器搭建成功，可以进行请求的处理。

`[问题]`  如果需要 Https 的 SSL 支持又该怎么办呢？Netty 也提供了可以直接使用的 `SSLContext` 可以使用。

1）修改服务端的启动类，加上 SSL 认证处理。

```java
public class HttpServer {
    public static final int port = 6789;
    private static EventLoopGroup group = new NioEventLoopGroup();
    private static ServerBootstrap serverBootstrap = new ServerBootstrap();
    private static final boolean SSL = true;   // 表示是否开启 SSL 通信模式

    // Netty 创建全部都是实现自 AbstractBootstrap
    public static void main(String[] args) throws Exception {
        SelfSignedCertificate ssc = new SelfSignedCertificate();    // 获取签名
        final SslContext sslContext = SSL ? SslContextBuilder.forServer(ssc.certificate(), ssc.privateKey()).build() : null;
        try {
            serverBootstrap.group(group).
                    channel(NioServerSocketChannel.class).
                    childHandler(new ServerHandlerInit(sslContext)); //设置过滤器和处理器
            ChannelFuture channelFuture = serverBootstrap.bind(port).sync();
            ConstantUtils.printMessage("server has running, port = [" + port + "]");
            channelFuture.channel().closeFuture().sync();   //监听服务器关闭
        }finally {
            group.shutdownGracefully().sync();  //关闭 EventLoopGroup，释放所有资源
        }
    }
}
```

2）修改处理器链，此时就应该加上一个新的 ssl 处理器。

```java
public class ServerHandlerInit extends ChannelInitializer<SocketChannel> {
    private final SslContext sslContext;
    public ServerHandlerInit(SslContext sslContext) {this.sslContext = sslContext;}

    @Override
    protected void initChannel(SocketChannel ch) throws Exception {
        ChannelPipeline ph = ch.pipeline();
        if (sslContext != null){
            ph.addLast("ssl", sslContext.newHandler(ch.alloc()));
        }
        //前面的字符串是对 handler 取名字
        ph.addLast("decoder", new HttpRequestDecoder());    //定义接收客户端请求的解码器并加入到 ChannelPipeline
        ph.addLast("encoder", new HttpResponseEncoder());   //定义响应回去客户端的编码器并加入到 ChannelPipeline
        // http 请求包括消息头和消息体，消息体可能会分块发送，Netty 已经有了聚合器可以对请求报文组合成一个完整的报文再往后传递
        ph.addLast("aggregator" ,new HttpObjectAggregator(10 * 1024 * 1024)); //限制报文的最大长度为 10M
        //将应答报文进行压缩，Netty 同样支持将应答给客户端的报文进行压缩（非必要）
        ph.addLast("compressor", new HttpContentCompressor());
        //具体处理业务的 handler,应该实现入站 handler
        ph.addLast("serviceHandler", new ServiceHandler());
    }
}
```

​	此时再通过原来的 http 访问请求会抛出异常 `NotSslRecordException`，不能访问，`改用 https` 访问可以成功访问。

`[案例]`  实现一个基于 Netty 的 Http 的客户端，客户端也是需要实现编解码的。

​	注：由于没有真实的证书，只能使用没有 SSL 校验的客户端和服务端进行校验。

1）编写启动类，添加 handler。

```java
public class HttpClient {
    public static final String HOST = "127.0.0.1";
    public void connect(String host, int port) throws Exception {
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap bootstrap = new Bootstrap();
            bootstrap.group(group)
                    .channel(NioSocketChannel.class)
                    .option(ChannelOption.SO_KEEPALIVE, true)
                    .handler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline().addLast(new HttpClientCodec());   // 编解码器
                            // http 请求包括消息头和消息体，消息体可能会分块发送，Netty 已经有了聚合器可以对请求报文组合成一个完整的报文再往后传递
                            ch.pipeline().addLast("aggregator" ,new HttpObjectAggregator(10 * 1024 * 1024)); //限制报文的最大长度为 10M
                            // 服务端进行了压缩，客户端就需要解压
                            ch.pipeline().addLast("decompressor", new HttpContentDecompressor());
                            // 具体处理业务的 handler,应该实现入站 handler
                            ch.pipeline().addLast("serviceHandler", new ClientHandler());
                        }
                    });
            ChannelFuture channelFuture = bootstrap.connect(host, port).sync();
            channelFuture.channel().closeFuture().sync();
        }finally {
            group.shutdownGracefully();
        }
    }

    public static void main(String[] args) throws Exception {
        HttpClient client = new HttpClient();
        client.connect(HOST, HttpServer.port);
    }
}
```

2）编写具体的业务处理 handler，需要建立连接后发送请求，同时处理响应回来的报文，因此使用 ChannelInboundHandlerAdapter。

```java
public class ClientHandler extends ChannelInboundHandlerAdapter {

    //连接建立就发送请求
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        //设置 Url
        URI url = new URI("/test");
        String message = "hello";
        // 拼装 Http 请求
        DefaultFullHttpRequest request = new DefaultFullHttpRequest(
                HttpVersion.HTTP_1_1,
                HttpMethod.POST,
                url.toASCIIString(),
                Unpooled.wrappedBuffer(message.getBytes(StandardCharsets.UTF_8)));  //设置发送消息体
        request.headers()
                .set(HttpHeaderNames.HOST, HttpClient.HOST)
                .set(HttpHeaderNames.CONNECTION, HttpHeaderValues.KEEP_ALIVE)
                .set(HttpHeaderNames.CONTENT_LENGTH, request.content().readableBytes());
        ctx.writeAndFlush(request);     // 发送 http 请求
    }

    //处理应答报文数据
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        FullHttpResponse httpResponse = (FullHttpResponse) msg;
        ConstantUtils.printMessage("request status = [" + httpResponse.status() + "]");
        ConstantUtils.printMessage("response header = [" + httpResponse.headers() + "]");
        ByteBuf content = httpResponse.content();
        ConstantUtils.printMessage("response content:{" + content.toString(StandardCharsets.UTF_8) + "}");
        httpResponse.release();     //这里自行处理了报文，没有传递到后面的 handler，则需要释放资源
    }
}
```

​		结果验证发现能够成功发送请求，并拿到响应数据：

```shell
2022-07-16 09:07:10 [nioEventLoopGroup-2-1] request status = [200 OK]
2022-07-16 09:07:10 [nioEventLoopGroup-2-1] response header = [DefaultHttpHeaders[content-type: text/plain;charset=UTF-8, content-length: 41]]
2022-07-16 09:07:10 [nioEventLoopGroup-2-1] response content:{POST request, response: server has accept}
```

`[理论]`  至于空闲的连接与超时的问题，在 TCP 中提供了 keepalive 的方案，但是时间太久（2小时），因此往往会自己单独实现`心跳机制`，在 Netty 中也提供了处理连接与超时问题的 handler：`IdleStateHandler`，空闲分为读空闲 `ReadTimeoutHandler` 和写空闲 `WriteTimeoutHandler` 的处理器。

## 通信序列化问题

`[理论]`  网络通信的序列化问题。在之前的自己实现的 RPC 框架中使用的是 JDK 的序列化机制（网络上传递的都是二进制数据），实现是比较差的，同时不能跨语言（只能在 JDK 内部用），其他的序列化方式也有一定的问题。Netty 内置的 `Marshalling（JBoss）` 和 `Protocol Buffers（alibaba）`。

`[案例]`  测试使用 Netty 内置的 `Protocol Buffers` 实现序列化将 Person 类进行传输。

0）Pom 文件添加依赖：

```xml
<dependency>
    <groupId>com.google.protobuf</groupId>
    <artifactId>protobuf-java</artifactId>
    <version>3.6.1</version>
</dependency>
```

1）JavaBean 实体类的 Person：

```java
public class Person {
    String name;
    int id;
    String email;
}
```

2）使用 google 的 protocol buffer compiler 生成 PersonProto 类。

3）编写客户端启动类：

```java
public class ProtoBufClient {
    public void connect(int port, String host) throws Exception {
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap b = new Bootstrap();
            b.group(group)
                    .channel(NioSocketChannel.class)
                    .option(ChannelOption.TCP_NODELAY, true)
                    .handler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        public void initChannel(SocketChannel ch) throws Exception {
                            // 给消息的请求头里面加一个消息长度，由 netty 自动计算，解决粘包半包问题
                            ch.pipeline().addLast(new ProtobufVarint32LengthFieldPrepender());
                            // Netty 内置的负责编码解码，序列化（对 handler 里面要写往对端的数据进行序列化的相关编码）
                            ch.pipeline().addLast(new ProtobufEncoder());
                            ch.pipeline().addLast(new ProtoBufClientHandler());
                        }
                    });
            ChannelFuture f = b.connect(host, port).sync();
            f.channel().closeFuture().sync();
        } finally {
            group.shutdownGracefully();
        }
    }

    public static void main(String[] args) throws Exception {
        int port = 8080;
        new ProtoBufClient().connect(port, "127.0.0.1");
    }
}
```

4）客户端具体业务的实现，并将 Person 进行序列的发送。

```java
public class ProtoBufClientHandler extends ChannelInboundHandlerAdapter {
    @Override
    public void channelActive(ChannelHandlerContext ctx) {
       ConstantUtils.printMessage("Preparing to make data........");
       //对 Person 进行序列化
       PersonProto.Person.Builder builder = PersonProto.Person.newBuilder();
       builder.setName("蔡徐坤");
       builder.setId(1);
       builder.setEmail("IKUN@basketball.com");
       ConstantUtils.printMessage("sent the data .......");
       ctx.writeAndFlush(builder.build());
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }
}
```

5）服务端启动类，并添加对应的具体 handler。

```java
public class ProtoBufServer {
    public void bind(int port) throws Exception {
        //多线程 Reactor 模式
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .option(ChannelOption.SO_BACKLOG, 100)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        public void initChannel(SocketChannel ch) {
                        // 客户端发送时加了消息长度，因此服务端收到的消息需要去除消息长度部分，同时根据这个消息长度读取实际的数据，Netty 内部已经实现
                            ch.pipeline().addLast(new ProtobufVarint32FrameDecoder());
                            // 客户端的数据进行了序列化，因此服务端需要进行反序列化（注意只能反序列化一个类）
                            ch.pipeline().addLast(new ProtobufDecoder(PersonProto.Person.getDefaultInstance()));
                            ch.pipeline().addLast(new ProtoBufServerHandler());
                }
            });
            ChannelFuture f = b.bind(port).sync();
            ConstantUtils.printMessage("Server init start in port [" + port +"] ......");
            f.channel().closeFuture().sync();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }

    public static void main(String[] args) throws Exception {
        int port = 8080;
        new ProtoBufServer().bind(port);
    }
}
```

> 客户端和服务端的处理要相对应，序列化和反序列化（只能序列化一个类：因此实践中真实使用需要单独设置消息的格式），加消息长度和去掉消息长度。
>

6）服务端的具体处理业务 handler。

```java
public class ProtoBufServerHandler  extends ChannelInboundHandlerAdapter {

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        //进入这个 handler 时，序列化和长度属性的去除已经做完，现在已经是业务的报文
        PersonProto.Person request = (PersonProto.Person)msg;
        ConstantUtils.printMessage("Server Accept:[" + request.getName() + "]");
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        if(cause instanceof IOException){
            ConstantUtils.printMessage("remote client has disconnect the connection!");
        }
        ctx.close();
    }
}
```

`[案例]` 使用第三方的序列化工具来实现 User （User 内部包含对象属性 UserContact） 序列化的传输到对端。（以 `MessagePack` 为例）

0）Pom 文件添加依赖：

```xml
<dependency>
    <groupId>org.msgpack</groupId>
    <artifactId>msgpack</artifactId>
    <version>0.6.12</version>
</dependency>
```

​		此时就考虑到需要将 User 对象从 JavaBean 转成字节数字传输，同时还需要将字节数组能转回来，由于是第三方，Netty 内部并没有实现编码器和解码器，都需要手动实现，在编码器和解码器内部进行序列化和反序列化。

User 对象和 UserContact 对象的 JavaBean：MessagePack 提供的注解 `@Message`，表明这是一个需要序列化的实体类。

```java
@Message
public class User {
    private String id;
    private String userName;
    private int age;
    private UserContact userContact;
    // get 和 set 方法、toString 方法 等
}

//
@Message
public class UserContact {
    private String mail;
    private String phone;
	// get 和 set 方法、toString 方法 等
}
```

1）编写编码器 Handler。

```java
// 基于 messagePack 的编码同时序列化的 handler
public class MsgPackEncoder extends MessageToByteEncoder<User> {
    @Override
    protected void encode(ChannelHandlerContext channelHandlerContext, User user, ByteBuf byteBuf) throws Exception {
        MessagePack messagePack = new MessagePack();
        // 将 user 编码成字节数组，并进行序列化
        byte[] raw = messagePack.write(user);
        byteBuf.writeBytes(raw);    //将数据写到 ByteBuf
    }
}
```

2）编写解码器 Handler，应该扩展自 MessageToMessageDecoder，实现 decode 方法。

```java
// 基于 messagePack 的解码同时反序列化的 handler
public class MsgPackDecoder extends MessageToMessageDecoder<ByteBuf> {
    //一个Buffer 里面解码出来的东西可能有多个，因此用 List
    @Override
    protected void decode(ChannelHandlerContext channelHandlerContext, ByteBuf message, List<Object> out) throws Exception {
        final int length = message.readableBytes();     //获取数据长度
        // 将网络上的二进制数据写入到字节数组,此时还没有进行反序列化
        final byte[] array = new byte[length];
        message.getBytes(message.readerIndex(), array, 0, length);
        // 进行反序列化
        MessagePack messagePack = new MessagePack();
        User user = messagePack.read(array, User.class);
        //将数据传递给后面的 handler 进行处理
        out.add(user);
    }
}
```

3）客户端的启动类以及需要的 handler 配置。

```java
public class Client {
    private final String host;

    public Client(String host) {
        this.host = host;
    }

    public void start() throws InterruptedException {
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            final Bootstrap b = new Bootstrap();
            b.group(group)
                    .channel(NioSocketChannel.class)
                    .remoteAddress(new InetSocketAddress(host, Server.PORT))
                    .handler(new ChannelInitializerImp());
            ChannelFuture f = b.connect().sync();
            ConstantUtils.printMessage("has connect to server ......");
            f.channel().closeFuture().sync();
        } finally {
            group.shutdownGracefully().sync();
        }
    }

    private static class ChannelInitializerImp extends ChannelInitializer<Channel> {
        @Override
        protected void initChannel(Channel ch) throws Exception {
            //粘包半包问题解决：告诉 Netty 计算数据报文长度并放入到请求头中，这个长度用 2byte 来存放
            ch.pipeline().addLast(new LengthFieldPrepender(2))
                    .addLast(new LineBasedFrameDecoder(1024))	//服务端的响应消息进行了分隔符方式解决发送的粘包半包问题
                    .addLast(new MsgPackEncoder())  //对数据进行编码序列化处理
                    .addLast(new ClientHandler(5));   //具体的业务处理
        }
    }

    public static void main(String[] args) throws InterruptedException {
        new Client("127.0.0.1").start();
    }
}
```

4）客户端的具体业务处理器：

```java
public class ClientHandler extends SimpleChannelInboundHandler<ByteBuf> {
    private final int sendNumber;
    public ClientHandler(int sendNumber) { this.sendNumber = sendNumber; }
    private AtomicInteger counter = new AtomicInteger(0);

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, ByteBuf msg) throws Exception {
        System.out.println("client Accept["+msg.toString(CharsetUtil.UTF_8)
                +"] and the counter is:"+counter.incrementAndGet());
    }

    //连接成功则开始发送数据
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        User[] users = makeUsers(); //生成一个 user 数组
        for(User user:users){
            System.out.println("Client Send user:"+user);
            ctx.write(user);    //发送数据
        }
        ctx.flush();    //等待都写入缓冲区再一次性发送
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }

    /*生成用户实体类的数组，以供发送*/
    private User[] makeUsers(){
        User[] users=new User[sendNumber];
        User user =null;
        for(int i = 0; i < sendNumber; i++){
            user=new User();
            user.setAge(i);
            String userName = "蔡徐坤 --->" + i;
            user.setUserName(userName);
            user.setId("No:" + (sendNumber - i));
            user.setUserContact(new UserContact(userName+"@IKUN.com","133"));
            users[i]=user;
        }
        return users;
    }
}
```

5）服务端的启动类以及需要的 handler 处理器。

```java
public class Server {
    public static final int PORT = 9995;

    public static void main(String[] args) throws InterruptedException {
        Server serverMsgPackEcho = new Server();
        ConstantUtils.printMessage("server prepare running ......");
        serverMsgPackEcho.start();
    }

    public void start() throws InterruptedException {
        final ServerHandler serverHandler = new ServerHandler();
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(group).channel(NioServerSocketChannel.class)
                    .localAddress(new InetSocketAddress(PORT))
                    .childHandler(new ChannelInitializerImp());
            ChannelFuture f = b.bind().sync();
            ConstantUtils.printMessage("server has run, and waiting for client to connect......");
            f.channel().closeFuture().sync();
        } finally {
            group.shutdownGracefully().sync();
        }
    }

    private static class ChannelInitializerImp extends ChannelInitializer<Channel> {
        @Override
        protected void initChannel(Channel ch) throws Exception {
            //将报文头处理扔掉报文长度，解决粘包半包问题
            ch.pipeline().addLast(new LengthFieldBasedFrameDecoder(65535,0, 2, 0, 2))
                    .addLast(new MsgPackDecoder())  //解码序列化问题
                    .addLast(new ServerHandler());  //业务处理的 handler
        }
    }
}
```

​		针对这个 LengthFieldBasedFrameDecoder 进行参数理解：（这个报文解码器方法是最常用的）

```java
public LengthFieldBasedFrameDecoder(
    int maxFrameLength,		//允许一次发送的最大报文长度，超过则抛出异常
    int lengthFieldOffset, 	//长度域的偏移量，报文里面跳过多少个字节后才到记录数据长度的字节
    int lengthFieldLength,	//长度域的长度，此处使用的是 2byte
    int lengthAdjustment, 	//长度的修正值，不需要修正那就是 0
    int initialBytesToStrip	//从数据帧中跳过的字节数，往后传递时需要丢弃的字节数，只会从头丢
) {
    this(
        maxFrameLength,
        lengthFieldOffset, lengthFieldLength, lengthAdjustment,
        initialBytesToStrip, true);
}
```

​	![](D:\NoteBook\核心笔记\网络编程\image\报文修正.png)

​		按照上图所示，如果原封不动传递到后面的 handler，那么这个参数就是（x，0，2，0，0），如果往后传递时需要去掉消息长度的字节，则参数就是（x，0，2，0，2）。如果长度域变成了 `0E` （包括长度域本身的值），则此时原封不动传递到后面的 handler，此时参数是（x，0，2，-2，0），需要丢掉长度域则参数就是（x，0，2，-2，2）。

`[案例]` 下面的报文传递时，LengthFieldBasedFrameDecoder 应该传递的参数应该是（x，1，2，1，3）

![](D:\NoteBook\核心笔记\网络编程\image\案例报文.png)

6）服务端业务处理以及相应的具体业务的实现。

```java
public class ServerHandler extends ChannelInboundHandlerAdapter {
    private AtomicInteger counter = new AtomicInteger(0);
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        //由于之前已经将报文进行处理，此时得到的报文已经是具体的报文数据
        User user = (User)msg;
        ConstantUtils.printMessage("Server accept [" + user + "] and the counter is:" + counter.incrementAndGet());
        // 响应信息：注意响应信息使用了分隔符解决粘包半包问题，客户端需要提供相应的处理器
        String resp = "Server process user:[" + user.getUserName() + "]" + System.getProperty("line.separator");
        ctx.writeAndFlush(Unpooled.copiedBuffer(resp.getBytes(StandardCharsets.UTF_8)));
        ctx.fireChannelRead(user);  //传递数据到下一个 handler
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }
}
```

​		启动服务端再启动客户端，客户端发现消息完整，服务端接收到并响应了正确的消息。
