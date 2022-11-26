---
title: Netty 进阶实战
date: 2022-03-05 00:00:00
type:
comments:
tags: 
  - Netty
  - 网络编程
categories: 
  - Java 开发
description: 
keywords: Netty
swiper_index: 4
cover: https://w.wallhaven.cc/full/x8/wallhaven-x8xo1d.jpg
top_img: https://w.wallhaven.cc/full/x8/wallhaven-x8xo1d.jpg
---

## 单元测试使用

`[案例]`  Netty 网络编程主要就是 handler 编程，那么如何对编写的 handler 进行测试呢？=====> `单元测试 Embedded`

​	Embedded 是特殊的 Channel 实现，主要针对 ChannelHandler 的单元测试。通过 `writeInbound` 和 `readInbound` 测试入站的消息通信，通过 `readOutbound` 和 `writeOnbound` 方法来测试出站的消息通信，write 方法都会返回 boolean 值，表示使用 write 方法向入站/出站处理器写入数据，read 方法能够读取到，那么就返回 true，否则返回 false。

![单元测试](https://pic1.imgdb.cn/item/6336e98a16f2c2beb1bae671.png)

1）测试消息切割的入站 Handler：将传入的数据按照 handler 里面设定的固定的长度进行切割，如果传入的字节数不够，writeInbound 返回 false，readInbound 读取不到数据。

需要测试的解码器 FixedLengthFrameDecoder，用于分割数据长度。

```java
//ByteToMessageDecoder 是一个入站处理器，处理入站字节，并将它们解码为消息
public class FixedLengthFrameDecoder extends ByteToMessageDecoder {
    private final int frameLength;

    //指定要生成的帧的长度(切分的字节数)
    public FixedLengthFrameDecoder(int frameLength) {
        if (frameLength <= 0) {
            throw new IllegalArgumentException(
                "frameLength must be a positive integer: " + frameLength);
        }
        this.frameLength = frameLength;
    }

    //分割传入的字节
    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception {
        //检查是否有足够的字节可以被读取，以生成下一个帧
        while (in.readableBytes() >= frameLength) {
            //从 ByteBuf 中读取一个新帧
            ByteBuf buf = in.readBytes(frameLength);
            //将该帧添加到已被解码的消息列表中
            out.add(buf);
        }
    }
}
```

进行单元测试读取和写入的结果。

```java
@Test
void testFramesDecoded() {
    ByteBuf buf = Unpooled.buffer();
    for (int i = 0; i < 9; i++) {
        buf.writeByte(i);  //往 buf 写入 9 个字节
    }
    ByteBuf input = buf.duplicate();

    //限定切分的字节大小
    EmbeddedChannel channel = new EmbeddedChannel(new FixedLengthFrameDecoder(3));
    ConstantUtils.printMessage(channel.writeInbound(input.readBytes(1)));;   //使用 writeInbound 测试写入数据写入 1 个 false
    ConstantUtils.printMessage(channel.writeInbound(input.readBytes(1)));;   //使用 writeInbound 测试写入数据写入 1 个 false
    ConstantUtils.printMessage(channel.writeInbound(input.readBytes(1)));;   //使用 writeInbound 测试写入数据写入 1 个 true
    ConstantUtils.printMessage(channel.writeInbound(input.readBytes(6)));;   //使用 writeInbound 测试写入数据写入 6 个 true
    channel.finish();

    ByteBuf read = channel.readInbound();   //读取所生成的消息，并且验证是否有3帧，其中每帧 3 字节
    ConstantUtils.printMessage(buf.readSlice(3).equals(read));  // 和源数据进行对比
    read.release();

    read = channel.readInbound();
    ConstantUtils.printMessage(buf.readSlice(3).equals(read));  // 和源数据进行对比
    read.release();
    read = channel.readInbound();
    ConstantUtils.printMessage(buf.readSlice(3).equals(read));  // 和源数据进行对比
    read.release();
    ConstantUtils.printMessage(channel.readInbound());  //继续读取验证是否读完了
    buf.release();
}
```

2）测试出站编码处理器的功能：此处主要就是将数据进行绝对值处理。

```java
//扩展 MessageToMessageEncoder 以将一个消息编码为另外一种格式
public class AbsIntegerEncoder extends MessageToMessageEncoder<ByteBuf> {
    @Override
    protected void encode(ChannelHandlerContext channelHandlerContext, ByteBuf in, List<Object> out) throws Exception {
        //检查是否有足够的字节用来编码,int为4个字节
        while (in.readableBytes() >= 4) {
            //从输入的 ByteBuf 中读取下一个整数，并且计算其绝对值
            int value = Math.abs(in.readInt());
            //将该整数写入到编码消息的 List 中
            out.add(value);
        }
    }
}
```

```java
@Test
void testFramesEncoded() {
    //创建一个 ByteBuf，并且写入 9 个负整数
    ByteBuf buf = Unpooled.buffer();
    for (int i = 1; i < 10; i++) {
        buf.writeInt(i * -1);
    }

    //创建一个 EmbeddedChannel，并安装一个要测试的 AbsIntegerEncoder
    EmbeddedChannel channel = new EmbeddedChannel(new AbsIntegerEncoder());
    //写入 ByteBuf，判断 readOutbound() 方法将会产生数据
    ConstantUtils.printMessage(channel.writeOutbound(buf));
    //将该 Channel 标记为已完成状态
    channel.finish();

    // 读取所产生的消息，并判断编码效果
    for (int i = 1; i < 10; i++) {
        ConstantUtils.printMessage((channel.readOutbound()).equals(i));
    }
    ConstantUtils.printMessage(channel.readOutbound()); //判断是否还有数据
}
```

3）测试异常处理：只允许最大的帧的字节大小为设定的值。

```java
//扩展 ByteToMessageDecoder以将入站字节解码为消息
public class FrameChunkDecoder extends ByteToMessageDecoder {
    private final int maxFrameSize;

    //指定将要产生的帧的最大允许大小
    public FrameChunkDecoder(int maxFrameSize) {
        this.maxFrameSize = maxFrameSize;
    }

    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception {
        int readableBytes = in.readableBytes();
        if (readableBytes > maxFrameSize) {
            //如果该帧超出允许的大小，则丢弃它并抛出一个 TooLongFrameException……
            in.clear();
            throw new TooLongFrameException();
        }
        //否则，从 ByteBuf 中读取一个新的帧
        ByteBuf buf = in.readBytes(readableBytes);
        //将该帧添加到解码 读取一个新的帧消息的 List 中
        out.add(buf);
    }
}
```

```java
@Test
public void testFramesException() {
    //创建一个 ByteBuf，并向它写入 9 字节
    ByteBuf buf = Unpooled.buffer();
    for (int i = 0; i < 9; i++) {
        buf.writeByte(i);
    }
    ByteBuf input = buf.duplicate();

    //创建一个 EmbeddedChannel，并向其安装允许一个帧最大为3字节的 FrameChunkDecoder
    EmbeddedChannel channel = new EmbeddedChannel(new FrameChunkDecoder(3));
    //向它写入 2 字节，判断是否会产生一个有效帧
    ConstantUtils.printMessage(channel.writeInbound(input.readBytes(2)));
    try {
        //写入一个 4 字节大小的帧，判断是否会产生一个有效帧，并捕获预期的 TooLongFrameException
        channel.writeInbound(input.readBytes(4));
    } catch (TooLongFrameException e) {
        e.printStackTrace();
    }
    // 写入剩余的2字节，判断是否会产生一个有效帧
    ConstantUtils.printMessage(channel.writeInbound(input.readBytes(3)));
    //将该 Channel 标记为已完成状态
    channel.finish();

}
```

## UDP 协议

`[理论]`  UDP 是面向`无连接`的通讯协议，通讯时不需要接收方确认，属于`不可靠`的传输，但是正因为不需要建立连接，所以`传输速度快`，但是容易丢失数据。

> DNS 就是使用 UDP 为主， TCP 为辅。

`[理论]`  UDP 的报文是由 `报文首部（8 byte）`+ 数据部分 组成，报文首部则是由：

1）源端口（2 byte）：在需要对方回信时选用，不需要时可用全 0。

2）目的端口（2 byte）：目的端口号，这在终点交付报文时必须要使用到。

3）长度（2 byte）：UDP 用户数据包的长度，其最小值是 8 byte（也就是仅有报文首部）。

4）校验和（2 byte）：用来检测 UDP 用户数据报在传输中是否有错，有错就丢弃。

`[理论]`  UDP 在 Netty 也提供了相关的支持，UDP 支持`单播`（发送到某个ip 和 port 确定的主机），同样还支持`广播`（发送到某个子网里面的所有主机）。在 Netty 中对 Channel 抽象成为 `DatagramChannel`，同时发送的数据也需要包装成 `DatagramPacket` 再进行发送。

1）基于 UDP 的`单播模式`的实现：发送端和接收端。

​	发送端主要就是发送问题，同时处理接收端的响应信息。

```java
public class UdpQuestionSide {
    public final static String QUESTION = "想不想骂老李狗?";

    public static void main(String[] args) throws Exception {
        new UdpQuestionSide().start(UdpAnswerSide.ANSWER_PORT);
    }

    public void start(int port) throws Exception{
        EventLoopGroup eventLoopGroup = new NioEventLoopGroup();
        try {
            Bootstrap bootstrap = new Bootstrap();
            bootstrap.group(eventLoopGroup)
                    .channel(NioDatagramChannel.class)      //表示使用 UDP 通信模式
                    .handler(new QuestionHandler());
            // 获取 channel
            Channel channel = bootstrap.bind(0).sync().channel();
            // 由于不需要建立连接，则直接向对端写即可,写的是 UDP 的报文
            channel.writeAndFlush(new DatagramPacket(
                    Unpooled.copiedBuffer(QUESTION, StandardCharsets.UTF_8),
                    new InetSocketAddress("127.0.0.1", port)    //单播模式下需要指定具体应答方的主机
            )).sync();  //确保一定写完
            //由于不知道接收端是否接收，需要等待 15s 再关闭通道
            if (channel.closeFuture().await(15000)){
                System.out.println("等待超时，正在关闭通道 ......");
            }
        }finally {
            eventLoopGroup.shutdownGracefully();
        }
    }
}
```

```java
public class QuestionHandler extends SimpleChannelInboundHandler<DatagramPacket> {

    //接收应答端的报文
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, DatagramPacket msg) throws Exception {
        //获得应答数据，DatagramPacket 提供了 content 方法取得报文里面读的数据部分
        String response = msg.content().toString(StandardCharsets.UTF_8);
        if (response.startsWith(UdpAnswerSide.ANSWER)){     // 判断是不是那个响应
            System.out.println(response);
            ctx.close();
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }
}
```

​		接收端需要接收到发送端发送过来的报文数据，并作出响应信息 DatagramPacket 的封装。

```java
public class UdpAnswerSide {
    public static final int ANSWER_PORT = 8080;
    public final static String ANSWER = "当然想骂了，你这不是废话吗？";

    public static void main(String[] args) throws InterruptedException {
        new UdpAnswerSide().run(ANSWER_PORT);
    }

    private void run(int port) throws InterruptedException {
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            //由于 UDP 是无连接的，没有接收连接的说法，因此不使用 ServerBootstrap
            Bootstrap bootstrap = new Bootstrap();
            bootstrap.group(group).channel(NioDatagramChannel.class).handler(new AnswerHandler());
            ChannelFuture future = bootstrap.bind(port).sync();
            System.out.println("应答端服务已启动......");
            future.channel().closeFuture().sync();
        }finally {
            group.shutdownGracefully();
        }
    }
}
```

```java
public class AnswerHandler extends SimpleChannelInboundHandler<DatagramPacket> {
    //对端传过来的是一个个的 UDP 报文，因此此处便是拆解报文
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, DatagramPacket packet) throws Exception {
        String request = packet.content().toString(StandardCharsets.UTF_8);     //获取数据部分
        if (UdpQuestionSide.QUESTION.equals(request)){
            String answer = UdpAnswerSide.ANSWER;
            System.out.println("接收到请求，请求内容为：" + request);
            //重新拼凑一个 DatagramPacket 向对端响应
            ctx.writeAndFlush(new DatagramPacket(
                    Unpooled.copiedBuffer(answer, StandardCharsets.UTF_8),
                    packet.sender()     // 获取对端的地址信息:UDP的报文上携带了
            ));
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        ctx.close();
        cause.printStackTrace();
    }
}
```

​		测试结果发现能够正常进行消息的通信，在 UDP 中不存在服务端和客户端的概念，是没有建立连接的，两端都可能需要发送消息，同时都是使用 UDP 的数据报文 DatagramPacket 来封装消息。

2）基于 UDP 的`广播模式`的实现：广播端和事件监视器，也就是同一个内容一次向多个主机发送，以日志举例。

​	日志的相关实体类：LogMessage

```java
public class LogMessage {
    public static final byte SEPARATOR = (byte) ':';
    private final InetSocketAddress source; //日志的源地址
    private final String msg;   //日志内容
    private final long msgId;   //日志id
    private final long time;    //日志消息的发送时间

    //用于传入消息的构造函数
    public LogMessage(String msg) {
        this(null, msg,-1,System.currentTimeMillis());
    }

    //用于传出消息的构造函数
    public LogMessage(InetSocketAddress source, long msgId, String msg) {
        this(source,msg,msgId,System.currentTimeMillis());
    }

    public LogMessage(InetSocketAddress source, String msg, long msgId, long time) {
        this.source = source;
        this.msg = msg;
        this.msgId = msgId;
        this.time = time;
    }
	// getter setter and toString methods
}
```

​	模拟日志生成的类：LogConstant。

```java
public class LogConstant {
    public final static int MONITOR_SIDE_PORT = 9998;
    private static final String[] LOG_INFOS = {
            "20180912:peter-machine:啦啦啦，德玛西亚",
            "20180913:deer-machine:痛！太痛了！",
            "20180914:king-machine:哈萨克"
    };
    private final static Random r = new Random();
    //产生模拟日志
    public static String getLogInfo(){
        return LOG_INFOS[r.nextInt(LOG_INFOS.length - 1)];
    }
}
```

​	广播端启动程序，发送到某端口进行广播，需要设置广播模式。

```java
//广播端：发送生成的模拟日志
public class LogEventBroadcaster {
    public static void main(String[] args) throws Exception {
        //创建并启动一个新的广播端的实例，广播统一写成 255.255.255.255 表示广播地址
        new LogEventBroadcaster().start(new InetSocketAddress("255.255.255.255", LogConstant.MONITOR_SIDE_PORT));
    }

    //远端地址通过传入方式:传入广播地址
    public void start(InetSocketAddress remoteAddress) throws Exception {
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap bootstrap = new Bootstrap();
            //引导该 NioDatagramChannel（无连接的）
            bootstrap.group(group).channel(NioDatagramChannel.class)
                    .option(ChannelOption.SO_BROADCAST,true)    //设置通信选项为广播模式
                    .handler(new LogEventEncoder(remoteAddress));
            //绑定 Channel
            Channel ch = bootstrap.bind(0).sync().channel();
            System.out.println("广播端准备发送消息 ......");
            long count = 0;

            while (true){   //模拟不停的发送日志
                LogMessage logMessage = new LogMessage(null, ++count, LogConstant.getLogInfo());
                ch.writeAndFlush(logMessage);
                System.out.println("发送消息:" + logMessage.toString());
                TimeUnit.SECONDS.sleep(2);
            }
        }finally {
            group.shutdownGracefully();
        }
    }
}
```

​		广播端消息发送的编码器，将信息编码为 DatagramPacket 报文。

```java
//编码器继承 ChannelOutboundHandlerAdapter：将实际的日志实体类 LogMessage 编码为 DatagramPacket
public class LogEventEncoder extends MessageToMessageEncoder<LogMessage> {
    private final InetSocketAddress remoteAddress;

    //LogEventEncoder 创建了即将被发送到指定的 InetSocketAddress 的 DatagramPacket 消息
    public LogEventEncoder(InetSocketAddress remoteAddress) {
        this.remoteAddress = remoteAddress;
    }
    @Override
    protected void encode(ChannelHandlerContext channelHandlerContext, LogMessage logMessage, List<Object> out) throws Exception {
        //网络通信中消息发送都需要基于字节数组
        byte[] logs = logMessage.getMsg().getBytes(StandardCharsets.UTF_8);
        ByteBuf buf = channelHandlerContext.alloc().buffer(8*2 + logs.length + 1);   // 通过分配器拿到 ByteBuf，并规定容量
        buf.writeLong(logMessage.getTime());    //时间
        buf.writeLong(logMessage.getMsgId());   //日志时间
        buf.writeByte(LogMessage.SEPARATOR);    //分隔符
        buf.writeBytes(logs);   //日志的具体内容
        out.add(new DatagramPacket(buf, remoteAddress));
    }
}
```

​	监听端（接收端）启动程序，监听该端口的消息接收，注意设置广播模式和端口重用（本地测试需要）。

```java
//日志接收端
public class LogEventMonitor {
    public static void main(String[] args) throws InterruptedException {
        //注意这里不能指定 127.0.0.1，因为是广播端使用的是广播地址 255.255.255.255
        new LogEventMonitor().start(new InetSocketAddress(LogConstant.MONITOR_SIDE_PORT));
    }

    private void start(InetSocketAddress address) throws InterruptedException {
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap bootstrap = new Bootstrap();
            bootstrap.group(group).channel(NioDatagramChannel.class)
                    .localAddress(address)  //指明本地监听端口
                    .option(ChannelOption.SO_BROADCAST, true)   //设置套接字 SO_BROADCAST 表示通信选项为广播模式
                    .option(ChannelOption.SO_REUSEADDR, true)   //设置在一台应用程序上启动多个服务监听同一个端口（端口重用机制）
                    .handler(new ChannelInitializer<Channel>() {
                        @Override
                        protected void initChannel(Channel channel) throws Exception {
                            ChannelPipeline pipeline = channel.pipeline();
                            pipeline.addLast(new LogEventDecoder());    //对接收到的消息进行解码为 LogMessage
                            pipeline.addLast(new LogEventHandler());    //实际的业务处理,此处直接打印
                        }
                    });
            //绑定 Channel 监听，但需要注意 DatagramChannel 是无连接的
            Channel channel = bootstrap.bind().syncUninterruptibly().channel();
            System.out.println("日志监听端启动......");
            channel.closeFuture().sync();
        } finally {
            group.shutdownGracefully();
        }
    }
}
```

​	接收端需要对收到的 UDP 报文进行解码成 LogMessage 格式。

```java
//解码：将 DatagramPacket 解码为实际的日志实体类 LogMessage
public class LogEventDecoder extends MessageToMessageDecoder<DatagramPacket> {
    @Override
    protected void decode(ChannelHandlerContext channelHandlerContext, DatagramPacket packet, List<Object> out) throws Exception {
        //编码时放入的是 ByteBuf，因此解码拿到的内容也是 ByteBuf，同时解码时需要按照编码对应顺序拆包
        ByteBuf data = packet.content();
        long sendTime = data.readLong();
        long msgId = data.readLong();
        byte sep = data.readByte();
        int readerIndex = data.readerIndex();   //获取读索引的当前位置,就是分隔符的索引+1,提取日志消息需要从读索引开始，到最后
        String message = data.slice(readerIndex , data.readableBytes()).toString(StandardCharsets.UTF_8);
        System.out.println("收到消息的内容是：");
        System.out.println(sendTime + " [" + msgId + "] " + sep + message);

        //构建一个新的 LogMsg 对象，并且将它添加到已经解码的消息的列表中，用于后面的 handler 使用
        LogMessage event = new LogMessage(packet.sender(), msgId, message);
        //作为本handler的处理结果，交给后面的handler进行处理
        out.add(event);
    }
}
```

​	解码后的报文传递给后面的业务 handler 进行处理，此处业务就是打印。

```java
public class LogEventHandler extends SimpleChannelInboundHandler<LogMessage> {
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, LogMessage msg) throws Exception {
        //创建 StringBuilder，并且构建输出的字符串
        StringBuilder builder = new StringBuilder();
        builder.append(msg.getTime());
        builder.append(" [");
        builder.append(msg.getSource().toString());
        builder.append("] ：[");
        builder.append(msg.getMsgId());
        builder.append("] ：");
        builder.append(msg.getMsg());
        //打印 LogMsg 的数据
        System.out.println("LogEventHandler " + builder.toString());
    }
}
```

​		测试时启动两个日志监听端，再启动日志发送端，发现能够起到广播的作用。断开其中一个监听端，再重启，发现能够继续接收到消息，而断开期间的消息并没有顺利接收，也说明了 UDP 是无连接不可靠的。广播模式一般适用于局域网内部的消息通信。

​		实际上，当局域网内部的广播端发送 UDP 报文时，局域网内部的所有接收端都会收到报文，没有配置广播设置的主机会先拿到报文进行解析发现不是自己的报文时才会丢弃（解析完才丢弃，因此会影响主机性能），配置了对应 handler 的服务接收到成功解析后就不会丢弃。（`组播` 底层也是基于 UDP ，可以做到指定某些机器接收报文，其余机器直接就不用接收解析）

`[问题]`  现在发现 UDP 是无连接的，接收端中断一下就会丢包，并不会像 TCP 一样重复发送，怎么解决 UDP 的丢包问题呢？

​		借鉴 TCP 的解决方案（三次握手、中断重传等等机制），使用 `基于 UDP 的数据传输协议： UDT` 来防止丢包问题，UDT 主要用于高速广域网上的`海量数据`传输。UDT 是基于 UDP 在应用层来实现拥塞控制、带宽估计等等控制算法，因此是一个`应用层协议`。（目前 Java 没有开源的基于 UDT 的实现架构）

## 服务器推送

​		服务器推送的作用就是进行网络应用时不需要一遍遍的刷新。Htpp 协议是单向无状态的（只允许客户端向服务端发请求，每一个客户端请求都是独立的新的），这就带来了麻烦，引入扫码登陆技术时，服务端如何知道`手机已经扫码从而进行响应`呢？毕竟服务端是不能向客户端发送请求验证的。

​		服务器推送按照出现时间长短，分为 ajax 短轮询、Comet 技术 和 WebSocket 技术。

1、服务器推送技术之 `ajax 短轮询`。在前端 Js 部分设置定时器，每隔一段时间向服务器请求一次，进行轮询查询状态，但这种方式会给服务端一定的压力，同时由于每一次的请求服务端都需要应答会消耗带宽，造成资源的浪费，最重要的就是数据的同步并不及时会有一定延时。

客户端：

```js
<%@ page language = "java" contentType= "text/html; charset=UTF-8" pageEncoding= "UTF-8" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>服务器时间</title>
</head>
<body>
<h1>服务器时间</h1>
<div>
    <div>
        <h2>服务器当前时间为：</h2>
        <div style="color:#F00"><b><p id="serverTime">  </p></b></div>
    </div>
</div>
<script type="text/javascript" src="assets/js/jquery-1.9.1.min.js"></script>
<script type="text/javascript">
    showTime();
    function showTime(){
        $.get("showTime",function (data) {
            console.log(data);
            $("#serverTime").html(data);
        })
    }
    setInterval(showTime, 1000);
</script>
</body>
</html>
```

服务端：

```java
@Controller
public class ShowTimeController {

    private static Logger logger = LoggerFactory.getLogger(ShowTimeController.class);

    @RequestMapping("/time")
    public String normal(){
        return "showtime";
    }

    @RequestMapping(value="/showTime",produces = "text/html;charset=UTF-8")
    @ResponseBody
    public String getTime(){
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return formatter.format(new Date());
    }
}
```

2、服务端推送技术之 `Comet 技术`。Comet 技术是基于 HTTP 长连接、无须在浏览器端安装插件的 `服务器推` 技术，器分为两种方式：

​	1）`基于 ajax 的长轮询方式`。也就是客户端发起请求后，服务端并不是马上响应，而是等待服务器有新内容时才会返回响应告诉客户端数据来了，同时关闭这个连接，创建新的连接获取数据信息。其实现方式主要有：基于 Servlet3 里面的`异步任务`（麻烦，此处不实现）、Spring 封住好的 `DeferedResult` 实现。

​	长轮询方式响应过后会暂时断开连接，如果在此期间有数据要发送，那么就会有延时。

客户端：

```js
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>新闻推送</title>
</head>
<body>
<h1>每日头条</h1>
<div>
    <div>
        <h2>每日头条新闻实时看</h2>
        <div style="color:#F00"><b><p id="realTimeNews">  </p></b></div>
    </div>
    <hr>
</div>
<script type="text/javascript" src="assets/js/jquery-1.9.1.min.js"></script>
<script type="text/javascript">
    longLoop();
    function longLoop() {
        $.get("realTimeNews",function (data) {
            console.log(data);
            $("#realTimeNews").html(data);
            longLoop();
        })
    }
</script>
</body>
</html>
```

服务端：

```java
@Controller
@RequestMapping(produces="text/html;charset=UTF-8")
/*记得要在WebInitializer中增加servlet.setAsyncSupported(true);*/
public class PushNewsController {
    private ExecutorService executorService = Executors.newFixedThreadPool(1);

    @RequestMapping("/pushnews")
    public String news(){
        return "pushNews";
    }

    @RequestMapping(value="/realTimeNews")
    @ResponseBody
    // 在 WebInitializer 中要加上 servlet.setAsyncSupported(true);
    public DeferredResult<String> realtimeNews(HttpServletRequest request){
        final DeferredResult<String> dr = new DeferredResult<String>();		//避免线程安全问题，每次 new 一个新的 DeferredResult
        executorService.submit(new Runnable() {		//使用线程池提交任务，异步实现
            @Override
            public void run() {
                try {
                    Thread.sleep(3000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                int index = new Random().nextInt(Const.NEWS.length);
                dr.setResult(Const.NEWS[index]);
            }
        });
        return dr;
    }
}


public class Const {
    public static final String[] NEWS = {
            "震惊！美国总统看到后都惊呆了！",
            "整个X国X洲都慌了：X公司X亿收购了这家企业",
    };
}
```

​	2）`基于长连接的服务器推模型 SSE（Server-sent-events）`，也就是服务器推送事件。客户端发起请求后，服务端并不是马上响应，而是等待服务器有新内容时才会返回响应到客户端，同时还会在应答报文里面告诉客户端，服务端会马上推送很多数据给客户端，让客户端不要关闭连接（`接下来发送的是流信息` ，数据不断），因此这个连接就保持着，一定那服务端有新数据就会马上直接可以推送给客户端。SSE 是基于浏览器实现的，也是 H5 时代出现的，只支持文本。

​	SSE 的方式实际上类似服务端在向客户端不停的发起请求，一旦客户端发起请求，那么这个 SSE 的推送过程就会断掉，就是一个全新的通信过程。

客户端：

```js
<%@ page language = "java" contentType= "text/html; charset=UTF-8" pageEncoding= "UTF-8" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>贵金属期货</title>
</head>
<body>
<h1>贵金属期货</h1>
<div>
    <div>
        <h2>贵金属列表</h2>
    </div>
    <div>
        <h2 id="hint"></h2>
    </div>
    <hr>
    <div>
        <div><p>黄金</p><p id="c0" style="color:#F00"></p><b><p id="s0">历史价格：</p></b></div>
        <div><p>白银</p><p id="c1" style="color:#F00"></p><b><p id="s1">历史价格：</p></b></div>
        <div><p>铂</p><p id="c2" style="color:#F00"></p><b><p id="s2">历史价格：</p></b></div>
        <div><p>铱</p><p id="c3" style="color:#F00"></p><b><p id="s3">历史价格：</p></b></div>
    </div>
    <hr>

</div>
<script type="text/javascript" src="assets/js/jquery-1.9.1.min.js"></script>
<script type="text/javascript">

    function showPrice(index,data){
        $("#c"+index).html("当前价格："+data);
        var s = $("#s"+index).html();
        $("#s"+index).html(s+data+" ");
    }

	//通过 EventSource 拿到 SSE 的相关对象
    if(!!window.EventSource){
        var source = new EventSource('needPrice');
        //收到消息时的处理事件
        source.onmessage=function (e) {
            var dataObj=e.data;
            var arr = dataObj.split(',');
            $.each(arr, function (i, item) {
                showPrice(i,item);
                });
            $("#hint").html("");
        };
		//打开连接时的处理事件
        source.onopen=function (e) {
            console.log("Connecting server!");
        };
		//出现错误时的处理事件
        source.onerror=function () {
            console.log("error");
        };

    }else{
        $("#hint").html("您的浏览器不支持SSE！");
    }
</script>
</body>
</html>
```

第一种服务端的实现：

```java
@Controller
public class NobleMetalController {

    private static Logger logger = LoggerFactory.getLogger(NobleMetalController.class);

    @RequestMapping("/nobleMetal")
    public String stock(){
        return "nobleMetal";
    }

	//注意需要告诉浏览器发送的是事件流 text/event-stream
    @RequestMapping(value="/needPrice",produces="text/event-stream;charset=UTF-8" )
    @ResponseBody
    public String push(){
        Random r = new Random();
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return makeResp(r);

    }

    //业务方法，生成贵金属的实时价格
	//凡是通过 SSE 发送到客户端的数据必须遵循一定的格式：[field]:value
	//field 有四种类型：data(数据，最后面需要加\n)、id、event、retry(表示多久可以重试)
    private String makeResp(Random r){
        StringBuilder stringBuilder = new StringBuilder("");
        stringBuilder.append("retry:2000\n")
                .append("data:")
                .append(r.nextInt(100)+50+",")
                .append(r.nextInt(40)+35)
                .append("\n\n");	//表示数据发送完毕
        return stringBuilder.toString();
    }
}
```

​		但是经过测试发现还是会产生很多请求，因为 `return makeResp(r)` 会将结果交给 Tomcat，但是 Tomcat 接收到 return 后主动关闭 Http 连接，但是 retry 又会让这个请求自动重连，因此就会看到浏览器在不断向服务器发送新的请求。

第二种服务端的实现：通过 response 拿到输出流，使用输出流直接将数据写回浏览器客户端。

```java
@Controller
public class NobleMetalController {

    private static Logger logger = LoggerFactory.getLogger(NobleMetalController.class);

    @RequestMapping("/nobleMetalr")
    public String stockr(){
        return "nobleMetalAlso";
    }

    @RequestMapping(value="needPricer")
    public void pushRight(HttpServletResponse response){
        response.setContentType("text/event-stream");	//必须配置
        response.setCharacterEncoding("utf-8");
        Random r = new Random();
        try {
            PrintWriter pw = response.getWriter();
            int i = 0;
            while(i<10){
                if(pw.checkError()){
                    System.out.println("客户端断开连接");
                    return;
                }
                Thread.sleep(1000);
                pw.write(makeResp(r));
                pw.flush();
                i++;
            }
            System.out.println("达到阈值，结束发送.......");
            pw.write("data:stop\n\n");
            pw.flush();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

3、`WebSocket 技术`。是 H5 的协议，适合于对数据的`实时性`要求比较强的场景，如通信、直播、共享桌面，特别适合于客户与服务频繁交互的情况下，如实时共享、多人协作等平台。SSE 基于现有的通信协议 Http 就能实现（只支持文本的传输），而 WebSocket 属于全新的服务器推送协议（`支持消息文本或二进制数据`），但也说明其后端需要单独实现，不能使用原来的统一模板，同时也不是所有浏览器都支持。

| 比较项 |                    短轮询                    |                 长轮询                 |             SSE              |                       WebSocket                        |
| :------------: | :------------------------------------------: | :------------------------------------: | :--------------------------: | :----------------------------------------------------: |
|   浏览器支持度   |                     最高                     |                  很高                  |     中(IE和Edge均不支持)     |                 中(早期的浏览器不支持)                 |
|     实时性       |                     最低                     |                  较高                  |             很高             |                          很高                          |
| 代码实现复杂度   |                    最容易                    |                 较容易                 |             容易             |                         最复杂                         |
|    连接性质      |                    短连接                    |                 长连接                 |            长连接            |                         长连接                         |
|      适用        | 需要服务极大量或极小量的用户，实时性要求不高 | 准实时性的应用，比较关注浏览器的兼容性 | 实时，基本都是`文本交互`的应用 | 实时，需要支持`多样化的用户数据类型`的应用或者是原生程序 |

## WebSocket 概述

​		WebSocket 本身是一个 TCP 连接，建立后的连接是 `全双工` 的，客户端和服务端都能向对端发送请求，需要先借助 Http 协议来完成一部分 `握手（应用层的握手）`，是为了确认客户端和服务端支持 WebSocket 的程度，然后才会升级成 WebSocket 协议。

![](https://pic1.imgdb.cn/item/6336e94a16f2c2beb1baa143.png)

`[理论]` WebSocket 建立的握手过程。

​		当决定升级成 WebSocket 协议时，客户端发送给服务端的报文会包括：

```shell
Connection：Upgrade	# 表示现在决定升级，升级到什么则由 Upgrade 字段决定
Upgrade：websocket
Sec-WebSocket-Version：13		# 升级到 websocket 的哪个版本，常用 13 版本
Sec-WebSocket-Key：xxxxxxxxx		# 加密运算的随机字符串 ssh 摘要
Sec-WebSocket-Extensions：xxx	
```

​		当服务端收到这个请求报文后，服务端也会在响应报文携带参数，然后将密文数据进行处理发送给客户端。

```shell
Connection：Upgrade
Upgrade：websocket
Sec-WebSocket-Accept：xxxxxxxxx
Sec-WebSocket-Extensions：xxx
```

​		此时客户端和服务端的握手就完成了，后面的客户端和服务端的通信就全部使用 websocket 协议来进行。

`[理论]` WebSocket 是个规范，在实际的实现中有 HTML5 规范中的 `WebSocket API（原生）` 和 WebSocket 的子协议 `STOMP`。

`[实现]`  STOMP 在 Spring 中的实现：基于 STOMP 协议在 SpringBoot 项目中实现网页版的聊天室。

​		STOMP：也就是简单（流）文本定向消息协议。STOMP 协议的前身是专为消息中间件设计的 `TTMP` 协议（一个简单的基于文本的协议），是属于消息队列的一种协议，和 AMQP 和 JMS 等平级。STOMP 的简单性恰巧可以用于定义 websocket 的消息体格式，STOMP 协议很多 MQ 都已支持，如 RabbitMq 等。类似于消息队列， STOMP 中也有生产者和消费者的概念。`STOMP 是基于帧的协议` 

> 如果需要使用 STOMP，那么浏览器前端页面需要引入 Js 文件：`sockjs.min.js`、`stomp.min.js` 和 `jquery.js`。

​	实现思路：首先需要建立连接，服务端需要一个类似地址的地方（`EndPoint`）接受连接。进而浏览器订阅消息，单聊和群聊订阅不同消息。然后客户端向服务端发送请求，Spring 后端使用 `@MessageMapping` 注解来接受 WebSocket 请求，请求的处理结果再交给 `消息代理`，消息代理根据不同订阅发送给各个客户端。

0）Pom 文件引入 lombok、thymeleaf 和 websocket 依赖。

1）Html 页面，引入三个 Js 文件，绘制基本的页面样式。

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
<meta charset="utf-8">
<meta name="aplus-terminal" content="1">
<meta name="apple-mobile-web-app-title" content="">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta name="format-detection" content="telephone=no, address=no">
<title>聊天</title>
<style type="text/css">
    /* css 样式（省略）*/
</style>
</head>
<body>
<div>
    <div style="float:left;width:47%">
        <p>请选择你是谁：
        <select id="selectName" onchange="stompQueue();">
            <option value="1">请选择</option>
            <option value="Mark">Mark</option>
            <option value="James">James</option>
            <option value="Lison">Lison</option>
            <option value="Peter">Peter</option>
            <option value="King">King</option>
        </select>
        </p>
        <div class="chatWindow">
            <p style="color:darkgrey">群聊：</p>
            <section id="chatRecord1" class="chatRecord">
                <div id="mass_div" class="mobile-page">

                </div>
            </section>
            <section class="sendWindow">
                <textarea name="sendChatValue" id="sendChatValue" class="sendChatValue"></textarea>
                <input type="button" name="sendMessage" id="sendMassMessage" class="sendMessage" onclick="sendMassMessage()" value="发送">
            </section>
        </div>
    </div>


    <div style="float:right; width:47%">
        <p>请选择你要发给谁：
        <select id="selectName2">
            <option value="1">请选择</option>
            <option value="Mark">Mark</option>
            <option value="James">James</option>
            <option value="Lison">Lison</option>
            <option value="Peter">Peter</option>
            <option value="King">King</option>
        </select>
        </p>
        <div class="chatWindow">

            <p style="color:darkgrey">单聊：</p>
            <section id="chatRecord2" class="chatRecord">
                <div id="alone_div"  class="mobile-page">

                </div>
            </section>
            <section class="sendWindow">
                <textarea name="sendChatValue2" id="sendChatValue2" class="sendChatValue"></textarea>
                <input type="button" name="sendMessage" id="sendAloneMessage" class="sendMessage" onclick="sendAloneMessage()" value="发送">
            </section>
        </div>
    </div>
</div>

<!-- 独立JS -->
<script th:src="@{sockjs.min.js}"></script>
<script th:src="@{stomp.min.js}"></script>
<script th:src="@{jquery.js}"></script>
<script th:src="@{wechat_room.js}"></script>
</body>
</html>
```

​	其中引入的 wechat_room.js 内容为，用于实现前端逻辑。

```js
var stompClient = null;

//加载完浏览器后调用 connect（），打开通道
$(function(){
    connect();	//打开双通道
})

//强制关闭浏览器时调用 websocket.close（）,进行正常关闭
window.onunload = function() {
    if(stompClient != null) {
        stompClient.disconnect();
    }
    console.log("Disconnected ......");
}

//打开通道，建立连接
function connect(){
    var socket = new SockJS('/endpointMark'); 		 // 指明连接 SockJS 的 endpoint 名称为 "endpointMark"
    stompClient = Stomp.over(socket);				// 获取 STMOP 子协议的 WebSocket 客户端
    stompClient.connect({},function(frame){			// 使用客户端连接 WebSocket 服务端
        console.log('Connected:' + frame);
        stompTopic();		//订阅接收广播信息
    });
}

//广播消息的订阅接收消息（一对多）
function stompTopic(){
    //通过 stompClient.subscribe 订阅目标(destination)发送的消息（接收广播信息）
    stompClient.subscribe('/mass/getResponse',function(response){
        var message=JSON.parse(response.body);
        // 展示广播的接收的内容接收：前端操作将文本显示到页面上
        var response = $("#mass_div");
        var userName=$("#selectName").val();
        if(userName==message.name){
            response.append("<div class='user-group'>" +
                "          <div class='user-msg'>" +
                "                <span class='user-reply'>"+message.chatValue+"</span>" +
                "                <i class='triangle-user'></i>" +
                "          </div>" +userName+
                "     </div>");
        }else{
            response.append("     <div class='admin-group'>"+
                message.name+
                "<div class='admin-msg'>"+
                "    <i class='triangle-admin'></i>"+
                "    <span class='admin-reply'>"+message.chatValue+"</span>"+
                "</div>"+
                "</div>");
        }
    });
}

//群发消息
function sendMassMessage(){
    var postValue={};
    var chatValue=$("#sendChatValue");
    var userName=$("#selectName").val();
    postValue.name=userName;
    postValue.chatValue=chatValue.val();
    //postValue.userId="0";
    if(userName==1||userName==null){
        alert("请选择你是谁！");
        return;
    }
    if(chatValue==""||userName==null){
        alert("不能发送空消息！");
        return;
    }
    stompClient.send("/massRequest",{},JSON.stringify(postValue));
    chatValue.val("");
}

//单独发送消息
function sendAloneMessage(){
    var postValue={};
    var chatValue=$("#sendChatValue2");
    var userName=$("#selectName").val();
    var sendToId=$("#selectName2").val();
    var response = $("#alone_div");
    postValue.name=userName;	//发送者姓名
    postValue.chatValue=chatValue.val();	//聊天内容
    postValue.userId=sendToId;	//发送给谁
    if(userName==1||userName==null){
        alert("请选择你是谁！");
        return;
    }
    if(sendToId==1||sendToId==null){
        alert("请选择你要发给谁！");
        return;
    }
    if(chatValue==""||userName==null){
        alert("不能发送空消息！");
        return;
    }
    //发送请求 aloneRequest
    stompClient.send("/aloneRequest",{},JSON.stringify(postValue));
    response.append("<div class='user-group'>" +
        "          <div class='user-msg'>" +
        "                <span class='user-reply'>"+chatValue.val()+"</span>" +
        "                <i class='triangle-user'></i>" +
        "          </div>" +userName+
        "     </div>");
    chatValue.val("");
}

//单独消息的订阅（1对1）
function stompQueue(){
    var userId=$("#selectName").val();
    // 通过 stompClient.subscribe 订阅目标(destination)发送的消息（队列接收信息）
    stompClient.subscribe('/user/' + userId + '/alone',
        function(response){
        var message=JSON.parse(response.body);
        // 展示一对一的接收的内容接收
        var response = $("#alone_div");
        response.append("     <div class='admin-group'>"+
            message.name+
            "<div class='admin-msg'>"+
            "    <i class='triangle-admin'></i>"+
            "    <span class='admin-reply'>"+message.chatValue+"</span>"+
            "</div>"+
            "</div>");
    });
}
```

服务端定义一个请求的实体类和一个响应的实体类。

```java
@Data
public class ChatRoomRequest {
    private String name;    //发送者姓名
    private String chatValue;   //发送内容
    private String userId;  //发送者id
}

@Data
public class ChatRoomResponse {
    private String name;    //接收者姓名
    private String chatValue;   //具体的内容
}
```

webmvc 配置信息：`WebMvcConfig` 

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        //设置 Thymeleaf 视图跳转到 wechat_room.html 页面
        registry.addViewController("/chatroom").setViewName("/wechat_room");
    }
}
```

WebSocket 的配置类：`WebSocketConfig` 配置请求入口和跨域，注册消息代理。

```java
@Configuration
@EnableWebSocketMessageBroker    //开启WebSocket支持
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    //注册一个 EndPoint 用于接收请求
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        //注册STOMP协议的节点(endpoint),并映射指定的url,添加一个访问端点 “/endpointMark”,客户端打开双通道时需要的url。
        registry.addEndpoint("/endpointMark")   //添加访问节点
                //.setAllowedOrigins("*")
                .setAllowedOriginPatterns("*")     //设置允许所有的域名跨域访问
                .withSockJS();      //指定使用 SockJS 协议
    }

    //注册消息代理
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        //相当于代理哪些主题
        registry.enableSimpleBroker("/mass", "/user");
        registry.setUserDestinationPrefix("/user/");     //配置单聊消息主题请求的前缀
    }
}
```

后端服务器的接收请求并进行处理，分别对单聊和群聊的请求进行处理。

```java
@Controller
public class StompController {

    @Autowired
    private SimpMessagingTemplate template;     // Spring实现的一个发送模板类

    // 消息群发，接受发送至自 massRequest 的请求
    @MessageMapping("/massRequest")
    @SendTo("/mass/getResponse")     //表示群聊消息需要发送到订阅 /mass/getResponse 的位置
    public ChatRoomResponse mass(ChatRoomRequest chatRoomRequest){
        System.out.println("name = " + chatRoomRequest.getName());  //发送给谁
        System.out.println("chatValue = " + chatRoomRequest.getChatValue());    //发送内容
        ChatRoomResponse response = new ChatRoomResponse();     //封装一个响应给前端
        response.setName(chatRoomRequest.getName());
        response.setChatValue(chatRoomRequest.getChatValue());
        return response;
    }

    // 单独聊天，接受发送至自 aloneRequest 的请求
    @MessageMapping("/aloneRequest")
    // @SendToUser 往往需要和安全模式结合，此处不使用
    public ChatRoomResponse alone(ChatRoomRequest chatRoomRequest){
        System.out.println("SendToUser = " + chatRoomRequest.getUserId()    //发送给谁
                +" FromName = " + chatRoomRequest.getName()     //从哪里发送过来
                +" ChatValue = " + chatRoomRequest.getChatValue());     //发送内容
        ChatRoomResponse response = new ChatRoomResponse();
        response.setName(chatRoomRequest.getName());
        response.setChatValue(chatRoomRequest.getChatValue());
        //使用 SimpMessagingTemplate 来发送消息：拼装出 /user/userId/alone
        this.template.convertAndSendToUser(chatRoomRequest.getUserId()+"", "/alone", response);
        return response;
    }
}
```

​		启动 SpringBoot 的启动类，打开三个浏览器窗口，访问 `http://localhost:8080/chatroom` 进入聊天页面，此时进行聊天测试，测试过程中观察请求 `websocket` 的请求头和响应信息，寻找发现 Connection 字段确实是 `Upgrade`，版本号也是 13 表示升级，另外几个字段也能成功看到。

`[实现]` 实现基于原生 WebSocket 的 API 的网页群聊聊天室应用。

1）使用原生的 WebSocket 前端页面只需要引入 `jquery.js` 简化 Js 操作即可，同时前端页面也需要进行修改。

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
<meta charset="utf-8">
<meta fromName="aplus-terminal" content="1">
<meta fromName="apple-mobile-web-app-title" content="">
<meta fromName="apple-mobile-web-app-capable" content="yes">
<meta fromName="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta fromName="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta fromName="format-detection" content="telephone=no, address=no">
<title>WebSocket原生API实现微信聊天</title>
<style type="text/css">
    /* css 样式 */
</style>
</head>
<body>
<div>
    <div style="float:left;width:99%">
        <p>请选择你是谁：
        <select id="selectName" onchange="changeUser();">
            <option value="1">请选择</option>
            <option value="Mark">Mark</option>
            <option value="James">James</option>
            <option value="Lison">Lison</option>
            <option value="Peter">Peter</option>
            <option value="King">King</option>
        </select>
        </p>
        <div class="chatWindow">
            <p style="color:darkgrey">群聊：</p>
            <section id="chatRecord1" class="chatRecord">
                <div id="mass_div" class="mobile-page">

                </div>
            </section>
            <section class="sendWindow">
                <textarea fromName="sendChatValue" id="sendChatValue"
                          class="sendChatValue"></textarea>
                <input type="button" fromName="sendMessage"
                       id="sendMassMessage" class="sendMessage"
                       onclick="sendMassMessage()" value="发送">
            </section>
        </div>
    </div>

</div>
<script th:src="@{jquery.js}"></script>
<script type="text/javascript">
    var socket;
    if (typeof (WebSocket) == "undefined") {
        console.log("遗憾：您的浏览器不支持WebSocket");
    } else {
        console.log("恭喜：您的浏览器支持WebSocket");

    }

    //群发消息
    function sendMassMessage(){
        var userName=$("#selectName").val();
        if(userName==1||userName==null){
            alert("请选择你是谁！");
            return;
        }
        var chatValue=$("#sendChatValue");
        if(chatValue==""||userName==null){
            alert("不能发送空消息！");
            return;
        }
        socket.send(chatValue.val());
        chatValue.val("");
    }

    function changeUser(){
        if (socket!=null){
            socket.close();
        }
        var toUserId=$("#selectName").val();
        if(toUserId==1||toUserId==null){
            return;
        }
        //指定要连接的服务器地址与端口建立连接
        //ws对应http、wss对应https。
        socket = new WebSocket("ws://localhost:8080/ws/asset?toUserId="+toUserId);
        //连接打开事件
        socket.onopen = function() {
            console.log("Socket 已打开");
        };
        //收到消息事件
        socket.onmessage = function(msg) {
            //展示广播的接收的内容接收
            var response = $("#mass_div");
            var dataObj=msg.data;
            var arr = dataObj.split('@^');
            var sendUser;
            var acceptMsg;
            $.each(arr, function (i, item) {
                if(i==0){
                    sendUser = item;
                }else{
                    acceptMsg = item;
                }
            });
            if(toUserId==sendUser){
                response.append("<div class='user-group'>" +
                    "          <div class='user-msg'>" +
                    "                <span class='user-reply'>"+acceptMsg+"</span>" +
                    "                <i class='triangle-user'></i>" +
                    "          </div>" +toUserId+
                    "     </div>");
            }else{
                response.append("     <div class='admin-group'>"+
                    sendUser+
                    "<div class='admin-msg'>"+
                    "    <i class='triangle-admin'></i>"+
                    "    <span class='admin-reply'>"+acceptMsg+"</span>"+
                    "</div>"+
                    "</div>");
            }
        };
        //连接关闭事件
        socket.onclose = function() {
            console.log("Socket已关闭");
        };
        //发生了错误事件
        socket.onerror = function() {
            alert("Socket发生了错误");
        }

        //窗口关闭时，关闭连接
        window.unload=function() {
            socket.close();
        };
    }
</script>
</body>
</html>
```

2）配置 webmvc 的视图跳转控制。

3）配置 WebSocket 的数据监视组件。

```java
@Component
@SuppressWarnings("all")
@ServerEndpoint(value = "/ws/asset")    //将此类定义成一个 WebSocket 服务器端，同时设置访问地址
public class WebSocketServer {
    private static Logger log = LoggerFactory.getLogger(WebSocketServer.class);
    private static final AtomicInteger onlineCount = new AtomicInteger(0);  // 统计在线用户数
    // 线程安全Set，用来存放每个浏览器客户端对应的 Session 对象。
    private static CopyOnWriteArraySet<Session> sessionSet = new CopyOnWriteArraySet<Session>();
    // 线程安全Map，用来存放每个浏览器客户端 sessionId 和用户名的对应关系。
    private static ConcurrentHashMap<String,String> sessionMap = new ConcurrentHashMap<>();

    @OnOpen     //连接建立成功调用的方法,需要将用户信息放入本地缓存
    public void onOpen(Session session) {
        //将用户session，session和用户名对应关系放入本地缓存
        sessionSet.add(session);
        //从 session 中获取请求信息
        Map<String, List<String>> pathParameters = session.getRequestParameterMap();
        String userId = pathParameters.get("toUserId").get(0);
        sessionMap.put(session.getId(),userId);     //sessionId 和用户名对应关系存储
        log.info("有连接加入，当前连接数为：{}", onlineCount.incrementAndGet());     //在线用户数增加
        try {
            //群发：通知所有用户有新用户上线
            broadCastInfo("系统消息@^用户["+userId+"]加入群聊。");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @OnClose    //连接关闭调用的方法,需要将用户信息从本地缓存移除
    public void onClose(Session session) {
        //将用户session，session和用户名对应关系从本地缓存移除
        sessionSet.remove(session);
        Map<String, List<String>> pathParameters = session.getRequestParameterMap();
        String userId = sessionMap.get(session.getId());
        sessionMap.remove(session.getId());
        int cnt = onlineCount.decrementAndGet();    //在线用户数减少
        log.info("有连接关闭，当前连接数为：{}", cnt);
        try {
            //群发：通知所有用户有用户下线
            broadCastInfo("系统消息@^用户["+userId+"]退出群聊。");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @OnMessage      //收到客户端消息后调用的方法
    public void onMessage(String message, Session session) {
        log.info("来自客户端{}的消息：{}", sessionMap.get(session.getId()),message);
        if(message.startsWith("ToUser:")){
            //这里可以实现一对一聊天 sendMessageAlone();
        }else{
            //实现群聊
            String msger = sessionMap.get(session.getId());
            try {
                broadCastInfo(msger+"@^"+message);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    @OnError      //出现错误时的处理
    public void onError(Session session, Throwable error) {
        log.error("发生错误：{}，Session ID： {}", error.getMessage(), session.getId());
        error.printStackTrace();
    }

    //发送消息的基础方法
    public static void basicSendMessage(Session session, String message) {
        try {
            session.getBasicRemote().sendText(message);
        } catch (IOException e) {
            log.error("发送消息出错：{}", e.getMessage());
            e.printStackTrace();
        }
    }

    //群发消息:实际就是遍历所有用户都发送一遍
    public static void broadCastInfo(String message) throws IOException {
        for (Session session : sessionSet) {
            if(session.isOpen()){
                basicSendMessage(session, message);
            }
        }
    }

    //指定 Session 发送消息
    public static void sendMessageAlone(String sessionId, String message) throws IOException {
        Session session = null;
        for (Session s : sessionSet) {
            if(s.getId().equals(sessionId)){
                session = s;
                break;
            }
        }
        if(session!=null){
            basicSendMessage(session, message);
        }
        else{
            log.warn("没有找到你指定ID的会话：{}", sessionId);
        }
    }
}
```

​		启动主启动类，发现一样实现群聊聊天室的功能。

`[实现]`  Netty 官方提供的基于 Netty 实现的 WebSocket 范例服务端部分，客户端使用浏览器。

​		WebSocket 的定义实际上是比较复杂的，其定义了`数据帧`的概念，包括二进制数据帧、文本类型数据帧、关闭连接请求数据帧、心跳有关的ping 和 pong 帧、续传的帧这六种，Netty 对这六种数据帧都有对应的实现，并且提供了对应的 handler 实现。

1）服务端的启动类。

```java
public class WebSocketServer {
    //Netty 提供的所有和客户端通信的集合 DefaultChannelGroup，用来保存所有已经连接的 WebSocket Channel，群发和一对一功能可以用上
    private final static ChannelGroup channelGroup = new DefaultChannelGroup(ImmediateEventExecutor.INSTANCE);
    static final boolean SSL = false;   //是否启用ssl
    // 通过ssl访问端口为 8443，否则为 8080
    static final int PORT = Integer.parseInt(System.getProperty("port", SSL? "8443" : "8080"));

    public static void main(String[] args) throws Exception {
        // SSL 配置
        final SslContext sslCtx;
        if (SSL) {
            SelfSignedCertificate ssc = new SelfSignedCertificate();
            sslCtx = SslContextBuilder.forServer(ssc.certificate(), ssc.privateKey()).build();
        } else {
            sslCtx = null;
        }
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    //服务端的 handler 的实现：就应该处理 websocket 所有相关的报文
                    .childHandler(new WebSocketServerInitializer(channelGroup, sslCtx));
            Channel ch = b.bind(PORT).sync().channel();     //服务端监听本地端口
            System.out.println("打开浏览器访问： " + (SSL? "https" : "http") + "://127.0.0.1:" + PORT + '/');
            ch.closeFuture().sync();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }
}
```

2）服务端的 handler 的装配，需要注意 WebSocket 升级前需要利用 HTTP 进行握手。

```java
//定义服务端需要用到的所有 handler，利用 http 建立连接，后面用来处理 websocket 所有相关报文
public class WebSocketServerInitializer extends ChannelInitializer<SocketChannel> {
    private static final String WEBSOCKET_PATH = "/websocket";  //websocket 访问路径
    private final ChannelGroup group;
    private final SslContext sslCtx;

    public WebSocketServerInitializer(ChannelGroup group, SslContext sslCtx) {
        this.group = group;
        this.sslCtx = sslCtx;
    }

    @Override
    protected void initChannel(SocketChannel ch) throws Exception {
        ChannelPipeline pipeline = ch.pipeline();
        if (sslCtx != null) {
            pipeline.addLast(sslCtx.newHandler(ch.alloc()));
        }
        //利用 http 建立连接需要使用的 http 的 handler：编解码器和聚合器
        pipeline.addLast(new HttpServerCodec());    //对 http 请求报文作入站处理，对 http 响应报文作出站处理
        pipeline.addLast(new HttpObjectAggregator(65536));  //聚合器
        // 提供对 WebSocket 数据的压缩传输
        pipeline.addLast(new WebSocketServerCompressionHandler());
        //对 WebSocket 的支持，当握手成功后会触发 pipeline 中用户自定义事件
        pipeline.addLast(new WebSocketServerProtocolHandler(WEBSOCKET_PATH, null,true));
        //浏览器客户端访问的时候展示 index 页面:提供发送消息和接收消息的可视化显示(页面采用后端生成直接写往浏览器)
        pipeline.addLast(new ProcessWsIndexPageHandler(WEBSOCKET_PATH));
        //对 WebSocket 的数据进行处理：群发的支持
        pipeline.addLast(new ProcessWsFrameHandler(group));
    }
}
```

3）生成浏览器页面的方法。

```java
public class MakeIndexPage {
    private static final String NEWLINE = "\r\n";

    public static ByteBuf getContent(String webSocketLocation) {
        return Unpooled.copiedBuffer(
                "<html><head><title>Web Socket Test</title></head>"
                        + NEWLINE +
                        "<body>" + NEWLINE +
                        "<script type=\"text/javascript\">" + NEWLINE +
                        "var socket;" + NEWLINE +
                        "if (!window.WebSocket) {" + NEWLINE +
                        "  window.WebSocket = window.MozWebSocket;" + NEWLINE +
                        '}' + NEWLINE +
                        "if (window.WebSocket) {" + NEWLINE +
                        "  socket = new WebSocket(\"" + webSocketLocation + "\");"
                        + NEWLINE +
                        "  socket.onmessage = function(event) {" + NEWLINE +
                        "    var ta = document.getElementById('responseText');"
                        + NEWLINE +
                        "    ta.value = ta.value + '\\n' + event.data" + NEWLINE +
                        "  };" + NEWLINE +
                        "  socket.onopen = function(event) {" + NEWLINE +
                        "    var ta = document.getElementById('responseText');"
                        + NEWLINE +
                        "    ta.value = \"Web Socket opened!\";" + NEWLINE +
                        "  };" + NEWLINE +
                        "  socket.onclose = function(event) {" + NEWLINE +
                        "    var ta = document.getElementById('responseText');"
                        + NEWLINE +
                        "    ta.value = ta.value + \"Web Socket closed\"; "
                        + NEWLINE +
                        "  };" + NEWLINE +
                        "} else {" + NEWLINE +
                        "  alert(\"Your browser does not support Web Socket.\");"
                        + NEWLINE +
                        '}' + NEWLINE +
                        NEWLINE +
                        "function send(message) {" + NEWLINE +
                        "  if (!window.WebSocket) { return; }" + NEWLINE +
                        "  if (socket.readyState == WebSocket.OPEN) {" + NEWLINE +
                        "    socket.send(message);" + NEWLINE +
                        "  } else {" + NEWLINE +
                        "    alert(\"The socket is not open.\");" + NEWLINE +
                        "  }" + NEWLINE +
                        '}' + NEWLINE +
                        "</script>" + NEWLINE +
                        "<form onsubmit=\"return false;\">" + NEWLINE +
                        "<input type=\"text\" name=\"message\" " +
                        "value=\"Hello, World!\"/>" +
                        "<input type=\"button\" value=\"Send Web Socket Data\""
                        + NEWLINE +
                        "       onclick=\"send(this.form.message.value)\" />"
                        + NEWLINE +
                        "<h3>Output</h3>" + NEWLINE +
                        "<textarea id=\"responseText\" " +
                        "style=\"width:500px;height:300px;\"></textarea>"
                        + NEWLINE +
                        "</form>" + NEWLINE +
                        "</body>" + NEWLINE +
                        "</html>" + NEWLINE, CharsetUtil.US_ASCII);
    }
}
```

4）对 http 请求，将 index 的页面返回给前端的处理器。

```java
//对http请求，将index的页面返回给前端
public class ProcessWsIndexPageHandler extends SimpleChannelInboundHandler<FullHttpRequest> {
    private final String websocketPath;
    public ProcessWsIndexPageHandler(String websocketPath) { this.websocketPath = websocketPath; }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, FullHttpRequest req) throws Exception {
        // 处理错误或者无法解析的http请求
        if (!req.decoderResult().isSuccess()) {
            sendHttpResponse(ctx, req, new DefaultFullHttpResponse(HTTP_1_1, BAD_REQUEST));
            return;
        }

        //只允许Get请求
        if (req.method() != GET) {
            sendHttpResponse(ctx, req, new DefaultFullHttpResponse(HTTP_1_1, FORBIDDEN));
            return;
        }

        // 发送index页面的内容
        if ("/".equals(req.uri()) || "/index.html".equals(req.uri())) {
            //生成WebSocket的访问地址，写入index页面中
            String webSocketLocation = getWebSocketLocation(ctx.pipeline(), req, websocketPath);
            System.out.println("WebSocketLocation:["+webSocketLocation+"]");
            //生成index页面的具体内容,并送往浏览器
            ByteBuf content = MakeIndexPage.getContent(webSocketLocation);
            FullHttpResponse res = new DefaultFullHttpResponse(HTTP_1_1, OK, content);
            res.headers().set(HttpHeaderNames.CONTENT_TYPE, "text/html; charset=UTF-8");
            HttpUtil.setContentLength(res, content.readableBytes());
            sendHttpResponse(ctx, req, res);
        } else {
            sendHttpResponse(ctx, req, new DefaultFullHttpResponse(HTTP_1_1, NOT_FOUND));
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }

    /*发送应答*/
    private static void sendHttpResponse(ChannelHandlerContext ctx, FullHttpRequest req, FullHttpResponse res) {
        // 错误的请求进行处理 （code<>200).
        if (res.status().code() != 200) {
            ByteBuf buf = Unpooled.copiedBuffer(res.status().toString(), StandardCharsets.UTF_8);
            res.content().writeBytes(buf);
            buf.release();
            HttpUtil.setContentLength(res, res.content().readableBytes());
        }

        // 发送应答.
        ChannelFuture f = ctx.channel().writeAndFlush(res);
        //对于不是长连接或者错误的请求直接关闭连接
        if (!HttpUtil.isKeepAlive(req) || res.status().code() != 200) {
            f.addListener(ChannelFutureListener.CLOSE);
        }
    }

    /*根据用户的访问，告诉用户的浏览器，WebSocket的访问地址*/
    private static String getWebSocketLocation(ChannelPipeline cp, HttpRequest req, String path) {
        String protocol = "ws";
        if (cp.get(SslHandler.class) != null) {
            protocol = "wss";
        }
        return protocol + "://" + req.headers().get(HttpHeaderNames.HOST)
                + path;
    }
}
```

5）WebSocket 的数据处理的核心 handler。

```java
//由于这是最后一个 handler，实现对数据的处理，继承 SimpleChannelInboundHandler 更方便
public class ProcessWsFrameHandler extends SimpleChannelInboundHandler<WebSocketFrame> {
    private final ChannelGroup group;
    public ProcessWsFrameHandler(ChannelGroup group) { this.group = group; }

    //还是以聊天室举例，因此发送的都是文本消息
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, WebSocketFrame message) throws Exception {
        if (message instanceof TextWebSocketFrame){     // TextWebSocketFrame 表示文本帧
            String request = ((TextWebSocketFrame) message).text();
            //先往自己所在的客户端浏览器写一份原始的自己发的内容,并支持中文
            ctx.writeAndFlush(new TextWebSocketFrame(request.toUpperCase(Locale.CHINA)));
            //群发的实现：通过 group，里面存放了所有连接的 channel,内容则是帧Frame里面的字符串(发送的那个用户就会被发两遍)
            group.writeAndFlush(new TextWebSocketFrame(
                    "client[" + ctx.channel().id() + "] say:" + request.toUpperCase(Locale.CHINA)
            ));
        }else {
            throw new UnsupportedOperationException("不支持非文本类型......");
        }
    }

    //处理用户自定义的事件：当握手成功后对 WebSocket 进行支持时会触发用户自定义事件
    @Override
    public void userEventTriggered(ChannelHandlerContext ctx, Object event) throws Exception {
        //假如需要实现功能：当某人进来时提示xxx用户加入群聊(event 就是握手完成事件)
        if (event == WebSocketServerProtocolHandler.ServerHandshakeStateEvent.HANDSHAKE_COMPLETE){
            //群发通知xxx用户加入群聊
            group.writeAndFlush(new TextWebSocketFrame(
                    "client[" + ctx.channel().id() + "] is login......"
            ));
            group.add(ctx.channel());
        }
    }
}
```

`[案例]`  上面的客户端是使用浏览器的页面，那么使用 Netty 搭建客户端呢？

1）客户端的启动类。

```java
public class WebSocketClient {
    static final String URL = System.getProperty("url", "ws://127.0.0.1:8080/websocket");
    static final String SURL = System.getProperty("url", "wss://127.0.0.1:8443/websocket");

    public static void main(String[] args) throws Exception {
        URI uri = new URI(URL);
        String scheme = uri.getScheme() == null? "ws" : uri.getScheme();
        final String host = uri.getHost() == null? "127.0.0.1" : uri.getHost();
        final int port = uri.getPort();
        if (!"ws".equalsIgnoreCase(scheme) && !"wss".equalsIgnoreCase(scheme)) {
            System.err.println("Only WS(S) is supported.");
            return;
        }
        final boolean ssl = "wss".equalsIgnoreCase(scheme);
        final SslContext sslCtx;
        if (ssl) {
            sslCtx = SslContextBuilder.forClient().trustManager(InsecureTrustManagerFactory.INSTANCE).build();
        } else {
            sslCtx = null;
        }

        EventLoopGroup group = new NioEventLoopGroup();
        try {
            // Connect with V13 (RFC 6455 aka HyBi-17). You can change it to V08 or V00.
            // If you change it to V00, ping is not supported and remember to change
            // HttpResponseDecoder to WebSocketHttpResponseDecoder in the pipeline.
            final WebSocketClientHandler handler = new WebSocketClientHandler(
                    WebSocketClientHandshakerFactory.newHandshaker(uri, WebSocketVersion.V13, null, true, new DefaultHttpHeaders()));

            Bootstrap b = new Bootstrap();
            b.group(group).channel(NioSocketChannel.class)
                    .handler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) {
                            ChannelPipeline p = ch.pipeline();
                            if (sslCtx != null) {
                                p.addLast(sslCtx.newHandler(ch.alloc(), host, port));
                            }
                            p.addLast(new HttpClientCodec())    //http协议为握手必须
                                    .addLast(new HttpObjectAggregator(8192))
                                    .addLast(WebSocketClientCompressionHandler.INSTANCE)    //支持WebSocket数据压缩
                                    .addLast(handler);
                        }
                    });

            //连接服务器
            Channel ch = b.connect(uri.getHost(), port).sync().channel();
            //等待握手完成
            handler.handshakeFuture().sync();
            BufferedReader console = new BufferedReader(new InputStreamReader(System.in));
            while (true) {
                String msg = console.readLine();
                if (msg == null) {
                    break;
                } else if ("bye".equals(msg.toLowerCase())) {
                    ch.writeAndFlush(new CloseWebSocketFrame());
                    ch.closeFuture().sync();
                    break;
                } else if ("ping".equals(msg.toLowerCase())) {
                    WebSocketFrame frame = new PingWebSocketFrame(Unpooled.wrappedBuffer(new byte[] { 8, 1, 8, 1 }));
                    ch.writeAndFlush(frame);
                } else {
                    WebSocketFrame frame = new TextWebSocketFrame(msg);
                    ch.writeAndFlush(frame);
                }
            }
        } finally {
            group.shutdownGracefully();
        }
    }
}
```

2）客户端的处理器，进行 TCP 的握手，处理 WebSocket 的报文。

```java
public class WebSocketClientHandler extends SimpleChannelInboundHandler<Object> {
    //负责和服务器进行握手
    private final WebSocketClientHandshaker handshaker;
    //握手的结果
    private ChannelPromise handshakeFuture;

    public WebSocketClientHandler(WebSocketClientHandshaker handshaker) {
        this.handshaker = handshaker;
    }

    public ChannelFuture handshakeFuture() {
        return handshakeFuture;
    }

    //当前Handler被添加到ChannelPipeline时，new 出握手的结果的实例，以备将来使用
    @Override
    public void handlerAdded(ChannelHandlerContext ctx) {
        handshakeFuture = ctx.newPromise();
    }

    //通道建立，进行握手
    @Override
    public void channelActive(ChannelHandlerContext ctx) {
        handshaker.handshake(ctx.channel());
    }

    //通道关闭
    @Override
    public void channelInactive(ChannelHandlerContext ctx) {
        System.out.println("WebSocket Client disconnected!");
    }

    //读取数据
    @Override
    public void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
        Channel ch = ctx.channel();
        //握手未完成，完成握手
        if (!handshaker.isHandshakeComplete()) {
            try {
                handshaker.finishHandshake(ch, (FullHttpResponse) msg);
                System.out.println("WebSocket Client connected!");
                handshakeFuture.setSuccess();
            } catch (WebSocketHandshakeException e) {
                System.out.println("WebSocket Client failed to connect");
                handshakeFuture.setFailure(e);
            }
            return;
        }

        //握手已经完成，升级为了websocket，不应该再收到http报文
        if (msg instanceof FullHttpResponse) {
            FullHttpResponse response = (FullHttpResponse) msg;
            throw new IllegalStateException(
                    "Unexpected FullHttpResponse (getStatus=" + response.status() +
                            ", content=" + response.content().toString(StandardCharsets.UTF_8) + ')');
        }

        //处理 websocket 报文
        WebSocketFrame frame = (WebSocketFrame) msg;
        if (frame instanceof TextWebSocketFrame) {
            TextWebSocketFrame textFrame = (TextWebSocketFrame) frame;
            System.out.println("WebSocket Client received message: " + textFrame.text());
        } else if (frame instanceof PongWebSocketFrame) {
            System.out.println("WebSocket Client received pong");
        } else if (frame instanceof CloseWebSocketFrame) {
            System.out.println("WebSocket Client received closing");
            ch.close();
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        if (!handshakeFuture.isDone()) {
            handshakeFuture.setFailure(cause);
        }
        ctx.close();
    }
}
```

## 私有协议实现

​	通信协议从广义上区分，可以`分为公有协议和私有协议`。由于私有协议的灵活性，它往往会在某个公司或者组织内部使用，按需定制，也因为如此，升级起来会非常方便，灵活性好。`绝大多数的私有协议一般都是应用层协议`，其传输层都基于TCP/IP，所以利用 Netty 的 NIO TCP 协议栈可以非常方便地进行私有协议的定制和开发（使用 UDP 的话，那些存在的问题就需要在应用层另外实现）。私有协议本质上是厂商内部发展和采用的标准，除非授权，其他厂商一般无权使用该协议。私有协议也称非标准协议，就是未经国际或国家标准化组织采纳或批准，由某个企业自己制订，协议实现细节不愿公开，只在企业自己生产的设备之间使用的协议，私有协议具有封闭性、垄断性、排他性等特点。

​	自定义的私有网络协议的设计功能：使用基于 Netty 的 `NIO 通信`框架(基于原生的 NIO 操作过于复杂)，提供高性能的异步通信能力，同时需要提供消息的`编解码框架`(网络传递通常是 JavaBean)，可以在框架层面实现 JavaBean 的`序列化和反序列化`，而不需要业务代码考虑单独实现，同时提供基于 IP 地址的`白名单`接入认证机制，网络安全的基本实现(本地缓存)，链路的有效性校验机制（keep-alive `心跳保活机制`：检测对端连接和业务服务的正常），提供链路的`断连重连`机制。

![](https://pic1.imgdb.cn/item/6336e96016f2c2beb1bab89e.png)

`[注意项]`  此设计的网络协议并不会对所有的功能都进行实现，同时还有一些注意点：

1）链路建立问题：客户端和服务端三次握手成功后，发送握手请求报文，服务端这边会对 IP 地址校验，同时一个 IP 只允许使用一个连接。

2）可靠性问题：实现心跳机制，当心跳断开时，能实现重连，同时当旧连接断开时，需要将其从缓存中清除，允许重新登陆保护。

`[实现]` 基本框架的搭建。

0）创建 pojo.network 包，此包表示网络的基本规定信息。

1）消息类型的实体类：枚举类型。

```java
//消息的类型
public enum MessageType {
    SERVICE_REQ((byte) 0),          // 业务请求消息
    SERVICE_RESP((byte) 1),         // 业务应答消息
    ONE_WAY((byte) 2),              // 无需应答的业务请求消息
    LOGIN_REQ((byte) 3),            // 登录请求消息
    LOGIN_RESP((byte) 4),           // 登录响应消息
    HEARTBEAT_REQ((byte) 5),        // 心跳请求消息
    HEARTBEAT_RESP((byte) 6);       // 心跳应答消息

    private byte value;
    private MessageType(byte value) { this.value = value; }
    public byte value() { return this.value; }
}
```

2）网络数据报`消息头`的实体类：

```java
@Data
public final class MessageHeader {
    private int crcCode = 0xabef0101;   // CRC 校验
    private int length;                 // 消息长度
    private long sessionID;             // 会话ID
    private byte type;                  // 消息类型
    private byte priority;              // 消息优先级
    private Map<String, Object> attachment = new HashMap<String, Object>(); // 附件
}
```

3）网络消息数据报的消息封装：包括消息头和消息体。

```java
@Data
public final class NetworkMessage {
    private MessageHeader messageHeader;
    private Object messageBody;    //消息体，考虑可能是各种格式
}
```

4）常量工具类 NetworkConstants 以及打印工具类 ConstantUtils。

```java
public final class NetworkConstants {
    public static final String REMOTE_IP = "127.0.0.1";
    public static final int REMOTE_PORT = 8989;
}

public class ConstantUtils {
    public static final String ANSI_GREEN = "\u001B[32m";
    public static final String ANSI_WHITE = "\u001B[37m";
    public static final String ANSI_BLACK = "\u001B[30m";
    public static final String ANSI_RESET = "\u001B[0m";
    
    public static String getTime(){
        Date date = new Date();
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
        String dataString = simpleDateFormat.format(date);
        return dataString;
    }
    public static void printMessage(Object message){
        String printMessage = getTime() + ANSI_GREEN + " [" + Thread.currentThread().getName() + "] " + ANSI_RESET + message;
        System.out.println(printMessage);
    }
}
```

`[实现]` 之前使用过 Protocol 和 messagePack 序列化机制，现在使用 `Kryo 序列化`（只支持 Java ）的相关机制的实现，使用更加方便。

1）创建 Kryo 的序列化工厂，注册相关 Class。

```java
public class KryoFactory {
    public static Kryo createKryo() {
        Kryo kryo = new Kryo();
        kryo.setRegistrationRequired(false);
        kryo.register(Arrays.asList("").getClass(), new ArraysAsListSerializer());
        kryo.register(GregorianCalendar.class, new GregorianCalendarSerializer());
        kryo.register(InvocationHandler.class, new JdkProxySerializer());
        kryo.register(BigDecimal.class, new DefaultSerializers.BigDecimalSerializer());
        kryo.register(BigInteger.class, new DefaultSerializers.BigIntegerSerializer());
        kryo.register(Pattern.class, new RegexSerializer());
        kryo.register(BitSet.class, new BitSetSerializer());
        kryo.register(URI.class, new URISerializer());
        kryo.register(UUID.class, new UUIDSerializer());
        UnmodifiableCollectionsSerializer.registerSerializers(kryo);
        SynchronizedCollectionsSerializer.registerSerializers(kryo);
        kryo.register(HashMap.class);
        kryo.register(ArrayList.class);
        kryo.register(LinkedList.class);
        kryo.register(HashSet.class);
        kryo.register(TreeSet.class);
        kryo.register(Hashtable.class);
        kryo.register(Date.class);
        kryo.register(Calendar.class);
        kryo.register(ConcurrentHashMap.class);
        kryo.register(SimpleDateFormat.class);
        kryo.register(GregorianCalendar.class);
        kryo.register(Vector.class);
        kryo.register(BitSet.class);
        kryo.register(StringBuffer.class);
        kryo.register(StringBuilder.class);
        kryo.register(Object.class);
        kryo.register(Object[].class);
        kryo.register(String[].class);
        kryo.register(byte[].class);
        kryo.register(char[].class);
        kryo.register(int[].class);
        kryo.register(float[].class);
        kryo.register(double[].class);
        return kryo;
    }
}
```

2）创建序列化器，进行二进制码流的相关读写。

```java
public class KryoSerializer {
    private static Kryo kryo = KryoFactory.createKryo();
    public static void serialize(Object object, ByteBuf out) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Output output = new Output(baos);
        kryo.writeClassAndObject(output, object);
        output.flush();
        output.close();

        byte[] b = baos.toByteArray();
        try {
            baos.flush();
            baos.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        out.writeBytes(b);
    }

    public static Object deserialize(ByteBuf out) {
        if (out == null) {
            return null;
        }
        Input input = new Input(new ByteBufInputStream(out));
        return kryo.readClassAndObject(input);
    }
}
```

3）编码器调用序列化器。

```java
// 编码：将 JavaBean 转化为 byte 二进制数据流
public class KryoEncoder extends MessageToByteEncoder<NetworkMessage> {
    @Override
    protected void encode(ChannelHandlerContext ctx, NetworkMessage message, ByteBuf out) throws Exception {
        KryoSerializer.serialize(message, out);
        ctx.flush();
    }
}
```

4）解码器调用序列化器。

```java
//解码：将 byte 二进制流转化为 Message
public class KryoDecoder extends ByteToMessageDecoder {
    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception {
        Object obj = KryoSerializer.deserialize(in);
        out.add(obj);
    }
}
```

`[实现]` 服务端的具体的响应消息方面的处理器实现。

1）服务端的启动类。

```java
public class NettyServer {
    public static void main(String[] args) throws Exception {
        new NettyServer().start();
    }

    public void start() throws Exception {
        //配置服务端的 NIO 线程组
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        ServerBootstrap b = new ServerBootstrap();
        b.group(bossGroup, workerGroup).channel(NioServerSocketChannel.class)
                .option(ChannelOption.SO_BACKLOG, 1024)
                .childHandler(new ServerInit());
        // 绑定端口，同步等待成功
        b.bind(NetworkConstants.REMOTE_PORT).sync();
        ConstantUtils.printMessage("Netty server start : " + (NetworkConstants.REMOTE_IP + " : " + NetworkConstants.REMOTE_PORT));
    }
}
```

 2）服务端的 handler

```java
public class ServerInit extends ChannelInitializer<SocketChannel> {
    @Override
    protected void initChannel(SocketChannel socketChannel) throws Exception {
        ChannelPipeline pipeline = socketChannel.pipeline();
        //pipeline.addLast(new LoggingHandler(LogLevel.INFO));
        //粘包半包问题解决有三种方式：1）长度固定；2）分隔符；3）消息头包含消息体长度,
        //此处并没有使用消息头的长度信息，而是在整个消息的前面加 2 byte表示长度信息
        pipeline.addLast(new LengthFieldBasedFrameDecoder(65535, 0, 2, 2, 0));
        pipeline.addLast(new LengthFieldPrepender(2));  //响应回去的消息报文的消息头也需要加上 2byte 的长度信息
        //序列化处理的 handler:编码解码以及序列化和反序列化
        pipeline.addLast(new KryoDecoder());
        pipeline.addLast(new KryoEncoder());
        //检测链路是否空闲，处理心跳超时的检测，超过 15s 没有处理就会抛出异常，而这个异常就会被 LoginAuthRespHandler 里面的处理异常的 handler 所接收
        pipeline.addLast(new ReadTimeoutHandler(15));
        //额外实现功能需要的处理器handler
        pipeline.addLast(new LoginAuthRespHandler());  //登陆白名单检查的 handler
        pipeline.addLast(new HeartBeatRespHandler());    //心跳检查的 handler,但是需要注意心跳超时机制的处理:ReadTimeoutHandler
        pipeline.addLast(new ServiceHandler());     //业务处理的 handler
    }
}
```

3）服务端的响应登陆握手认证处理器 handler。

```java
//类说明：登录检查的 handler
public class LoginAuthRespHandler extends ChannelInboundHandlerAdapter {
	//用本地缓存以检查用户是否重复登录的缓存，使一个 ip 只能登陆一次，而这个 map 就是表示当前登录的 ip
    private static Map<String, Boolean> nodeCheck = new ConcurrentHashMap<>();
    //用户登录的白名单，后续可以实现从数据库等地方读取
    private String[] whiteList = { "127.0.0.1"};

    @Override//处理用户发过来的相关登录信息，实际客户端发过来的消息就是 NetworkMessage
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
		NetworkMessage message = (NetworkMessage) msg;
		ConstantUtils.printMessage("enter loginAuth channelRead method......");
		//判定是不是握手认证请求，也就是判断请求的消息类型是不是登录认证请求类型，就应该做实际的校验
		if(message.getMessageHeader() != null && message.getMessageHeader().getType() == MessageType.LOGIN_REQ.value()){
			ConstantUtils.printMessage("has accepted loginAuth request......");
			String nodeIndex = ctx.channel().remoteAddress().toString();	//对端的IP地址
			NetworkMessage loginResp = null;
			//在本地的缓存中检查是重复登陆则直接拒绝
			if (nodeCheck.containsKey(nodeIndex)) {
				ConstantUtils.printMessage("repeating login，please refuse login......");
				loginResp = buildResponse((byte) -1);
			} else {
				//如果是第一次登陆，则检查用户是否在白名单中，在则允许登录，并写入缓存，不在则同样不处理
				InetSocketAddress address = (InetSocketAddress) ctx.channel().remoteAddress();
				String ip = address.getAddress().getHostAddress();
				boolean isOK = false;
				for (String WIP : whiteList) {
					if (WIP.equals(ip)) {
						isOK = true;	//如果在白名单里面那么就修改 isOK = true
						break;
					}
				}
				//判断是否存在，允许登录则 loginResp = (NetworkMessage)0
				if (isOK){
					ConstantUtils.printMessage("白名单检验通过，允许登录......");
					loginResp = buildResponse((byte) 0);
					//已经登陆的缓存中保存当前登录IP
					nodeCheck.put(nodeIndex, true);
				}else {
					ConstantUtils.printMessage("白名单检验拒绝，拒绝登录......");
					loginResp = buildResponse((byte) -1);
				}
			}
			System.out.println("The login response is : " + loginResp + " body [" + loginResp.getMessageBody() + "]");
			//直接将报文响应回客户端，不会往后继续传递，则此处就需要释放 buf 等，避免内存泄露
			ctx.writeAndFlush(loginResp);
			ReferenceCountUtil.release(msg);
		}else{
			//如果不是登录认证请求类型，则需要将请求往后传递，其他 handler 处理
			ctx.fireChannelRead(msg);
		}
    }

    //构造一个响应的消息 NetworkMessage
    private NetworkMessage buildResponse(byte result) {
		NetworkMessage message = new NetworkMessage();
		MessageHeader myHeader = new MessageHeader();
		myHeader.setType(MessageType.LOGIN_RESP.value());
		message.setMessageHeader(myHeader);
		message.setMessageBody(result);
		return message;
    }

    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
		cause.printStackTrace();
        //如果出现异常，则需要删除当前登录的IP缓存，避免后面重连出错
		nodeCheck.remove(ctx.channel().remoteAddress().toString());
		ctx.close();
		ctx.fireExceptionCaught(cause);		//异常后面可能会接受处理，因此向后传递
    }
}
```

4）服务端的心跳响应处理器 handler。

```java
//心跳处理 handler
public class HeartBeatRespHandler extends ChannelInboundHandlerAdapter {
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
		NetworkMessage message = (NetworkMessage) msg;
		//判定是不是心跳请求 HEARTBEAT_REQ 消息
		if(message.getMessageHeader() != null && message.getMessageHeader().getType() == MessageType.HEARTBEAT_REQ.value()){
			NetworkMessage heartBeatResp = buildHeatBeat();
			ctx.writeAndFlush(heartBeatResp);	//给客户端应答，表示服务端还正常，同时写出消息，因此也需要释放资源
			ReferenceCountUtil.release(msg);
		}else{
			ctx.fireChannelRead(msg);
		}
    }

    //构建请求响应的消息报文:心跳报文的响应没有消息体，只需要确认还是连接的报文即可
    private NetworkMessage buildHeatBeat() {
		NetworkMessage message = new NetworkMessage();
		MessageHeader myHeader = new MessageHeader();
		myHeader.setType(MessageType.HEARTBEAT_RESP.value());
		message.setMessageHeader(myHeader);
		return message;
    }

}
```

5）服务端的业务处理的 handler，当前只是做简单的打印。

```java
//业务处理的具体 handler
public class ServiceHandler extends SimpleChannelInboundHandler<NetworkMessage> {
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, NetworkMessage msg) throws Exception {
        ConstantUtils.printMessage(msg);
    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) throws Exception {
        ConstantUtils.printMessage(ctx.channel().remoteAddress()+" 主动断开了连接!");
    }
}
```

`[实现]`  客户端的请求 handler 的具体实现。

1）服务端的启动类。

```java
//实际的 client 客户端
public class ClientStart {
    public static void main(String[] args) throws InterruptedException {
        NettyClient nettyClient = new NettyClient();
        new Thread(nettyClient).start();    //客户端线程启动
        while(!nettyClient.isConnected()){
            synchronized (nettyClient){
                //引入等待和通知相关的机制，此处没有连接上则会等待连接，连接好后会通知此处从而结束死循环
                nettyClient.wait();
            }
        }
        System.out.println("network socket has prepared................");
        Scanner scanner = new Scanner(System.in);
        while (true) {
            String msg = scanner.next();
            if (msg == null) {
                break;
            } else if ("q".equals(msg.toLowerCase())) {
                nettyClient.close();
                while(nettyClient.isConnected()){
                    synchronized (nettyClient){
                        nettyClient.wait();
                    }
                }
                scanner.close();
                System.exit(1);
            } else if ("user".equals(msg.toLowerCase())) {
                User user = new User();
                user.setUserName("蔡徐坤");
                user.setAge(20);
                user.setId("NO:IKUN1");
                user.setUserContact(new UserContact("蔡徐坤:唱跳 Rap 篮球", "133928343"));
                nettyClient.send(user);
            }else {
                nettyClient.send(msg);
            }
        }
    }
}
```

2）客户端线程的任务。

```java
//客户端的启动类:发送握手请求、定时发送心跳、发送业务数据（每一个单独的客户端都是一个线程的任务）
//真实的客户端实际上是 ClientStart ，而具体线程内的操作（任务）则是 NettyClient，是一个异步的操作
public class NettyClient implements Runnable{
    //负责重连的线程池:单独的线程进行重连,如果使用原先的线程进行连接可能会死循环不停连接
    private ScheduledExecutorService executor = Executors.newScheduledThreadPool(1);
    private Channel channel;
    private EventLoopGroup group = new NioEventLoopGroup();

    private volatile boolean userClose = false;//表示是否用户主动关闭连接的标志值
    private volatile boolean connected = false;//表示连接是否成功关闭的标志值
    public boolean isConnected() { return connected; }

    //使用ip和端口连接服务器
    public void connectServer(String host, int port) throws InterruptedException {
        try {
            Bootstrap bootstrap = new Bootstrap();  //启动必备
            bootstrap.group(group).channel(NioSocketChannel.class)
                    .handler(new ClientInit());   //handler 装配
            ChannelFuture future = bootstrap.connect(new InetSocketAddress("127.0.0.1", 9999)).sync();  //发起连接
            channel = future.sync().channel();  //拿到 channel，因为后面用户主动关闭和断线重连需要使用
            ConstantUtils.printMessage("client success connection server： host = [" + host + "] port = " + port);
            synchronized (this){
                this.connected = true;  //连接成功后修改连接状态标志位
                System.out.println("=============================");
                this.notifyAll();   //连接成功则唤醒之前ClientStart的main线程，使其进行业务代码的实现
            }
            future.channel().closeFuture().sync();  //关闭事件上阻塞
        } finally {
            // 出现问题则需要换线程连接，但是当用户主动关闭时就不需要断线重连
            if(!userClose){ //非正常关闭，有可能发生了网络问题，需要进行重连
                System.out.println("need waiting network repeat connection......");
                //重连直接调用 connect 方法则会造成递归死循环，因此需要放到另一个线程去做
                executor.execute(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            //操作系统对端口的释放是需要一定的时间的，给操作系统足够的时间，去释放相关的资源，避免重启时端口并没有释放
                            TimeUnit.SECONDS.sleep(1);
                            connectServer(NetworkConstants.REMOTE_IP, NetworkConstants.REMOTE_PORT);
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }
                });
            }else{  //用户主动关闭，则清空连接缓存，关闭资源，修改标志位
                channel = null;
                group.shutdownGracefully().sync();
                synchronized (this){
                    this.connected = false;
                    this.notifyAll();   //关闭后也需要通知ClientStart的main线程，进行其下一轮判断
                }
            }
        }
    }

    @Override
    public void run() {
        try {
            connectServer(NetworkConstants.REMOTE_IP, NetworkConstants.REMOTE_PORT);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    //具体的业务的方法接口:发送的消息可能是实体类，也可能是字符串或是其他对象，此处将其封装消息报文
    public void send(Object message) {
        if(channel == null || !channel.isActive()){
            throw new IllegalStateException("has not success connection,please wait a litter......");
        }
        NetworkMessage msg = new NetworkMessage();
        MessageHeader myHeader = new MessageHeader();
        myHeader.setType(MessageType.SERVICE_REQ.value());  //设置消息类型为业务请求消息
        msg.setMessageHeader(myHeader);
        msg.setMessageBody(message);
        channel.writeAndFlush(msg);
    }

    public void close() {
        userClose = true;
        channel.close();
    }
}
```

3）客户端的 handler 装载。

```java
public class ClientInit extends ChannelInitializer<SocketChannel> {
    @Override
    protected void initChannel(SocketChannel socketChannel) throws Exception {
        ChannelPipeline pipeline = socketChannel.pipeline();
        //粘包半包问题：使用消息头带消息长度的方式
        pipeline.addLast(new LengthFieldBasedFrameDecoder(65535, 0, 2, 2, 0));
        pipeline.addLast(new LengthFieldPrepender(2));
        //序列化处理的 handler:编码解码以及序列化和反序列化
        pipeline.addLast(new KryoDecoder());
        pipeline.addLast(new KryoEncoder());
        //处理心跳超时的检测，超过 15s 没有处理就会抛出异常，而这个异常就会被 HeartBeatReqHandler 里面的处理异常的 handler 所接收
        pipeline.addLast(new ReadTimeoutHandler(15));
        //额外需要的处理器单独实现,没有设置业务的 handler
        pipeline.addLast(new LoginAuthReqHandler());  //发送握手请求的 handler
        pipeline.addLast(new HeartBeatReqHandler());  //心跳检查的 handler,但是需要注意心跳超时机制的处理:ReadTimeoutHandler
    }
}
```

4）客户端的登录握手请求 handler。

```java
//发出登录握手请求的handler
public class LoginAuthReqHandler extends ChannelInboundHandlerAdapter {

    @Override   //通道连接成功后发起握手认证请求
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        ConstantUtils.printMessage("send loginAuth request......");
        NetworkMessage loginReqMessage = buildLoginReq();
        System.out.println(loginReqMessage);
        ctx.writeAndFlush(loginReqMessage); //发出认证请求
    }

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        NetworkMessage message = (NetworkMessage) msg;
        //需要对服务端对认证的响应信息进行处理,判断是认证应答报文时就需要解析响应，不是就直接传递到后面的 handler
        if(message.getMessageHeader() != null && message.getMessageHeader().getType() == MessageType.LOGIN_RESP.value()){
            byte loginResult = (byte) message.getMessageBody();
            if (loginResult != (byte) 0){
                ConstantUtils.printMessage("握手失败......");
                //表示握手失败，则关闭连接
                ctx.close();
            }else {
                ConstantUtils.printMessage("Login is ok: " + message);
                ctx.fireChannelRead(msg);   //向后传递，不能直接调用 release 方法释放，因为心跳请求的发送前提是握手成功
            }
        } else {
            //如果不是登陆握手的响应报文，则向后传递，让其他 handler 处理
            ctx.fireChannelRead(msg);
        }
    }

    private NetworkMessage buildLoginReq() {
        NetworkMessage message = new NetworkMessage();
        MessageHeader myHeader = new MessageHeader();
        myHeader.setType(MessageType.LOGIN_REQ.value());
        message.setMessageHeader(myHeader);
        return message;
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        ctx.fireExceptionCaught(cause);
    }
}
```

5）客户端的心跳请求发送的 handler。

```java
//心跳请求的 handler
public class HeartBeatReqHandler extends ChannelInboundHandlerAdapter {
    private volatile ScheduledFuture<?> heartBeat;
    @Override   //此时 channelRead 时需要判断是否通过握手认证，通过则发送心跳的消息
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        NetworkMessage message = (NetworkMessage) msg;
        //判定握手的应答，如果握手成功才会发起心跳请求
        if(message.getMessageHeader() != null && message.getMessageHeader().getType() == MessageType.LOGIN_RESP.value()){
            //定时发出心跳请求:Netty 提供了定时机制,需要提供任务和定时频率（也可以用定时器）
            heartBeat = ctx.executor().scheduleAtFixedRate(new HeartBeatReqHandler.HeartBeatTask(ctx), 0, 5, TimeUnit.SECONDS);
            //此时处理完了认证握手报文，就可以将认证请求报文释放
            ReferenceCountUtil.release(msg);
            //如果是心跳响应报文，那么就可以直接接收到向后传递
        }else if(message.getMessageHeader() != null && message.getMessageHeader().getType() == MessageType.HEARTBEAT_RESP.value()){
            //如果服务端发过来的是心跳的应答消息，就应该释放报文，表示接收到
            ConstantUtils.printMessage("收到来自服务器的心跳报文......");
            ReferenceCountUtil.release(msg);
        }else { //其他报文（业务报文）则向后传递处理即可
            ctx.fireChannelRead(msg);
        }
    }

    //心跳任务
    private class HeartBeatTask implements Runnable {
        private final ChannelHandlerContext ctx;
        public HeartBeatTask(ChannelHandlerContext ctx) { this.ctx = ctx; }

        @Override
        public void run() {
            //拼凑出心跳的应答报文发送给对端表示当前连接正常即可
            NetworkMessage heatBeatMessage = buildHeatBeat();
            ctx.writeAndFlush(heatBeatMessage);
        }

        //生成心跳请求的报文 HEARTBEAT_REQ
        private NetworkMessage buildHeatBeat() {
            NetworkMessage message = new NetworkMessage();
            MessageHeader myHeader = new MessageHeader();
            myHeader.setType(MessageType.HEARTBEAT_REQ.value());
            message.setMessageHeader(myHeader);
            return message;
        }
    }

    @Override   //发生异常（心跳超时）则需要将这个定时任务清除
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        if (heartBeat != null) {
            heartBeat.cancel(true);
            heartBeat = null;
        }
        ctx.fireExceptionCaught(cause);
    }
}
```

如果需要检查报文的传递，可以通过 Netty 提供的 `LoggingHandler` 处理 handler 来打印详细的报文信息，只需要加到客户端个服务端的 initChannel 开头即可。

```java
pipeline.addLast(new LoggingHandler(LogLevel.INFO));
```
