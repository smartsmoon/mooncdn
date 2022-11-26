---
title: 多线程和 JUC 编程
date: 2022-05-30 00:00:00
updated: 2022-05-31 00:00:00
type:
comments:
tags: 
  - Java
  - 多线程
categories: 
  - Java 开发
description: 
swiper_index: 3
keywords: Java 多线程
cover: https://w.wallhaven.cc/full/zy/wallhaven-zyxvqy.jpg
top_img: https://w.wallhaven.cc/full/zy/wallhaven-zyxvqy.jpg
---

# Java 线程初识

 `[引问]` 什么是线程，什么是进程，什么是程序？

​	程序：指令和数据的有序集合，其本身没有任何运行的含义，是一个静态的概念。

​	进程：程序的依次执行过程，是一个动态的概念，是`系统资源分配的单位`。

​	线程：线程是CPU调度和执行的单位，是独立的执行路径。Java 默认有多个线程（main、gc 等）初始化就会运行。一个进程可以有多个线程。

> `注意：`很多多线程场景是模拟出来的，真正的多线程是指有多个CPU，即多核，如服务器。如果是模拟出来的多线程，即在一个CPU的情况下，在同一个时间点，CPU只能执行一个代码，因为切换的很快，所以就有同时执行的错局。

需要注意：`main()` 线程称为主线程，为系统的入口，用于执行整个程序。

```shell
# 程序运行时本身就具有几个线程：主线程、GC线程(垃圾回收机制)。
# 在一个进程中,如果开辟了多个线程,线程的运行是由调度器（CPU）安排调度的，线程 start 表示能够调度，但并不意味着就会马上运行。
# 对同一份资源操作时可能会存在资源抢夺的问题,需要加入并发控制。（安全问题的解决）
# 线程会带来额外的开销，如 CPU 调度时间，并发控制开销。
# 每个线程在自己的工作内存交互，内存控制不当会造成数据不一致。(可能会出现线程安全问题)
```

`[理论]` Java 线程的创建有几种方式：

​	1）继承 Thread 类，重写 run 方法，调用 start() 方法启动。

​	2）实现 Runnable 接口，重写 run 方法，调用 start() 方法启动。（避免单继承局限性，灵活方便，方便同一个对象被多个线程使用）

​	3）实现 Callable 接口，重写 call 方法（需要抛出异常），一般搭配线程池一起使用。

`[理论]` 线程的五大状态。

![在这里插入图片描述](https://img-blog.csdnimg.cn/2021021613070834.png)

1、创建状态：new Thread() 。

2、就绪状态：调用 start() 方法后，线程进入就绪状态，但并不意味着马上调度执行，`需要等待 CPU 调度`。

3、运行状态：cpu 调度该线程执行，进入运行状态，才会执行线程体的代码块。

4、阻塞状态：当调用`sleep()，wait()` 或是同步锁定方法时，线程进入`阻塞状态`，阻塞时间解除后，`重新进入就绪状态`，等待调度。

5、死亡状态：线程由于外部干预或是执行完毕。（需要注意的是，线程一旦进入死亡状态后，就不能再次启动）

`[理论]` 线程的一般常用方法。

1、`setPriority()`：设置线程的优先级，但仍然是 cpu 调度，优先级高不一定先执行，只是说可能性大一些。

2、`join`：线程插队，表示需要等待此插队线程终止后才会继续向下执行。

3、`yield`：静态方法，表示线程礼让，线程由 “运行状态” 进入到 “就绪状态”，重新等待 CPU 的调度，但并`不一定礼让成功`。

4、`sleep`：静态方法，表示让线程休眠，进入就绪状态，并不会释放锁，会抛出异常 InterruptedException。实际上企业并不会使用 sleep，而会使用 TimeUnit。

5、`interrupt`：中断线程，一般不会使用，`已弃用`，需要单独编写停止方法，一般使用标志位来判断线程中断从而进入收尾工作。

6、`isAlive`：检查线程是否存活。

7、还有一些其他的方法：`getState()` 获取线程当前状态，`getPriority()` 获取线程的优先级等等。

> 需要注意的是：不推荐使用 JDK 提供的 `stop()`、`destroy()` 方法【已废弃】，推荐让线程自己停止下来：利用执行次数，使用标志位进行终止。
>

`[问题]`  守护线程 daemon 的说明。

线程分为 `用户线程` 和 `守护线程`。虚拟机必须确保用户线程执行完毕，但并不用等待守护线程执行完毕，因为守护线程相当于一直在后台运行，可以用来做后台操作日志、监控内存、垃圾回收（GC 垃圾回收）等。

设置线程为守护线程：daemon 属性默认为 false，表示属于用户线程。

```
thread.setDaemon(true);
```

# Java 线程模型

`[问题]`：Java 当中的线程和操作系统 OS 的线程是什么关系呢？ ====> `Java 的线程模型`：Java 线程的本质。

​		Java 线程底层调用的是 `start0` 这个本地方法，这个方法是在 C++ 内部定义和实现，JVM 实例化一个 JavaThread 的 C ++ 对象，来操作 linux 系统的底层的 `pthread_create` 方法，以此来创建线程，因此 Java 创建的线程都是在 OS 底层实际创建的线程。

![](D:\NoteBook\核心笔记\多线程原理详解\Java线程创建本质.png)

​		查看 linux 底层对核心方法 `pthread_create` 函数的解释：

```shell
man pthread_create

NAME
       pthread_create - create a new thread
SYNOPSIS
       #include <pthread.h>
       int pthread_create(pthread_t *thread, const pthread_attr_t *attr, void *(*start_routine) (void *), void *arg);
        # 参数1：传出参数，调用之后会传出被创建线程的id，定义 pthread_t pid; 继而 取地址&pid
        # 参数2：线程属性，一般默认 null 就行
        # 参数3：线程的启动后的主体函数（方法），也就是启动后会调用的真实函数（重要参数）
        # 参数4：主体函数的参数
```

​		因此：实际上 Java 的线程创建底层调用本地方法 start0 方法，进而实例化一个 C++ 对象：JavaThread，进而判断 OS 系统 ，如果是 linux 系统，就会通过 JavaThread 来调用和 start0 对应的 C++ 函数： JVM_StartThread ，进而调用 linux 底层的 pthread_create 创建一个新的线程，同时此方法还会定义一个内部方法 start_routine，方法内部调用 `run()` 方法（方法名在 JVM 内部写死），因此 Java 线程启动时真正执行的是 run() 方法，因此必须编写 run() 方法。

`[问题]` 为什么 start() 方法是进入就绪状态，而不是直接启动线程呢？

​		此时根据 Java 创建线程的本质就可以知道，Java 创建线程调用的是操作系统 OS 的创建线程方法，创建出的是一个实际的 OS 级别的线程，而 OS 的线程是由操作系统 CPU 来调度的，因此是就绪状态，具体调用则需要看 CPU 的时间片调度。而如果 Java 创建线程是 Java 自己的方法，那么就是由 JVM 虚拟机来调度的，那么就可能会直接进入启动状态。

`[问题]` 为什么 JVM 源码不直接调用 linux 底层的 pthread_create  方法创建线程，还需要实例化一个 C++ 的 JavaThread 对象来间接操作？

​		JVM 源码不直接调用 linux 底层的 pthread_create 方法，而是定义一个 C++ 的 JavaThread 对象通过 C++ 来操作 OS 线程，C++ 也是面向对象的语言，方便 C++ 内部封装方法进行管理和操作，例如 sleep 方法、park 方法、yield 方法等 （如果直接调用就会只返回一个线程 id ，不方便进行管理）。例如 JVM 底层还有很多线程 GC 等需要对象进行管理。

`[问题]` start_routine 分析？

​		start_routine 方法就是 JVM 底层的 C++ 调用 OS 内核创建线程时的主体函数方法，为了实现线程逻辑的自定义，JVM 采用 start_routine 方法内部调用 run 方法的形式（回调函数固定写死为 run，这也就是为什么 Thread 线程必须写 run 方法的原因），这样就能够实现自定义的线程内部任务实现。

`[总结]` Java 的线程模型就是：Java 的线程是和和操作系统的线程一一对应的。（Go 语言就是协程，并非线程）

​		因此JVM 几乎把所有对线程的操作都交给了操作系统内核，因此经常会说在 Java 中需要谨慎使用线程：因为对用户线程的大部分操作都会映射到内核线程上，引起 CPU 的上下文频繁切换（用户态和内核态的切换），同时由于内核为每个线程都映射调度实体，如果系统中出现大量线程可能会对系统性能有影响。

> 在 Java 中，基本我们说的线程（Thread）实际上应该叫作 “用户线程”，而对应到操作系统，还有另外一种线程叫作 “内核线程”。

# 线程同步问题

​		当同一个对象(`资源`)被多个线程同时操作，就可能会出现 `线程同步安全` 问题。例如上万人同时抢票的问题，如果不对人进行同步的控制，抢票的人可能就会拿到同一张票。

`[问题]`  线程同步问题的出现以及解决办法分析。

​		由于同一进程的`多个线程共享同一块存储空间`，带来了便利，但同时也会产生冲突。为了保证数据在方法中被访问的正确性，在访问时便需要引入一定的机制来保证相同数据在同一时刻只能被某一个线程进行操作。Java 引入了`锁机制` 。当一个线程获得锁时，独占资源，其他线程必须等待，使用完后释放锁即可。但需要注意的是多线程竞争下，加锁、释放锁会导致比较多的`上下文切换和调度延时`，引发性能问题，特别是如果一个优先级低的线程先拿到锁，会导致 `优先级倒置`，引发性能问题(等待时间过久)。

线程不安全的实例：

1）多人买票的例子，会买到负数张票。

2）两个人用同一账户取钱，超出总金额仍能取出。

3）Java 存在一个线程不安全的集合：ArrayList，在循环插入时，可能会出现实际插入数据数目不对。（由于索引的覆盖，同一时间多个线程插入到同一个索引）

`[案例]` ArrayList 测试利用1000个线程插入1000条数据，实际只存入了 448 条数据：

```java
public class ArrayList_test {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            new Thread(() -> {
               list.add(Thread.currentThread().getName());
            }).start();
        }
        System.out.println("size = " + list.size());
    }
}
```

`[问题]` Java的线程对应 OS 级别的线程，那么OS 级别有哪些方法可以实现锁（同步）呢？

 	OS 级别实现锁（同步）的方法主要有：互斥量、自旋锁、信号量。

​	1）`互斥量`：pthread_mutex_t ，也就是互斥锁。 ===> 发生竞争时拿不到锁就睡眠。

​	2）`自旋锁`：pthread_spinlock_t 。 ===> 发生竞争时拿不到锁就会空转：OS 内核空转。

​	3）`信号量`：和 Java 里面的 Semaphore 类似，相当于有一个标志的设定。

面试问题：`synchronized` 是不是一把自旋锁呢？

​		此处所说的 ”自旋锁“ 一般是指 JVM 层次对线程的控制是不是`自旋`。但是分析 synchronized 需要从两个层面分析：

​	1）synchronized 在底层操作系统 OS 级别使用的不是自旋锁，而是 `Mutex` 互斥锁。

​	2）synchronized 在 JVM 源码（C++）内部`获取锁`的时候没有自旋。（膨胀过程中的死循环是等待另一个线程对锁膨胀，而不是自旋等待锁的释放从而获取锁）

​		因此 synchronized 就不是自旋锁。

1、OS 级别的 mutex 互斥量，`由 mutex 实现的锁就是互斥锁`，同时底层是 mutex 实现的锁就是重量锁。

```shell
man pthread_mutex_init

NAME
       pthread_mutex_init ? destroy and initialize a mutex
SYNOPSIS
       #include <pthread.h>
       int pthread_mutex_init(pthread_mutex_t *restrict mutex, const pthread_mutexattr_t *restrict attr);
       pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
```

​	查看底层 C++ 的代码可以发现，操作系统 OS 级别上的加锁：pthread_mutex_lock，操作系统级别上的解锁：pthread_mutex_unlock。

> synchronized 关键字实现的同步（锁）`底层就是以互斥量 mutex 实现`，因此 synchronized 是互斥锁，同时也是`重量锁`。

`[问题]` 那么为什么底层以 mutex 实现的锁就是重量锁（10）呢？

​		因为 mutex 互斥量的特点是拿不到锁就进入睡眠 sleep() ，而睡眠就会发生`系统调用`，导致 CPU 上下文切换，由用户态进入内核态，再由内核态切回来。

​		操作系统存在`虚拟地址映射技术（MMU：每一个进程运行中使用的地址并不是真实物理地址，而是 CPU 分配的虚拟地址，MMU 将虚拟地址映射到真实的物理地址上）`，而 MMU 就会将线程的存储映射划分为几块，其中一块是内核映射地址，当发生系统调用（ sleep 方法）时，系统调用被 MMU 映射到内核的空间上，此时 CPU 就会进入内核态，此时还需要保存 CPU 寄存器里原来用户态的指令位，当系统调用执行完后，又会还原回来，又进入用户态。 =====> `一次系统调用的过程发生了两次 CPU 上下文切换`

> CPU 有四种不同的执行级别 0-3，linux 只使用了其中的0级和3级分别来表示内核态和用户态， 所谓的内核态和用户态其实仅仅是CPU的一个`权限`而已。

​		而 ReentrantLock 整个JVM 层面源码中没有发生任何系统调用，整个实现都是在 JVM 层面实现的，同时如果拿不到锁还会进入自旋反复拿锁，只有确定拿不到锁了才会调用 park 函数（重量锁）进入睡眠，避免进入内核态，因此效率比 synchronized 更高。（ReentrantLock 就是一个在平台 JVM 级别的自旋锁）

2、OS 级别的 spin 自旋锁，`由 pthread_spinlock_t 实现的锁就是 OS 级别的自旋锁`，拿不到时并不会像互斥锁一样进入 sleep，而是会在原地自旋，不停尝试拿锁，等待锁释放后，如果此时 CPU 调度到此线程就能够成功拿到锁。（Java 目前似乎没有底层调用 spin 的锁 ）

3、OS 级别的信号量（暂时不了解）

`[问题]` 如何实现一个 Java 级别的自定义的锁呢？	

​		`锁`实际上就是一个 Java 的对象里面用了一个变量来标识当前锁是否处于自由状态。加锁就是改变这个对象当中的这个变量 status 为 1，而解锁就是把这个变量 status 的值改为0。如果加锁成功就正常返回，如果加锁不成功就死循环（自旋）或者阻塞（睡眠）。

​	1）CASLock 对象：实现加锁解锁过程方法。

```java
@SuppressWarnings("all")
public class CASLock {
    private volatile int status = 0;  //锁的状态标识，默认为0表示无锁
    // 获取 Unsafe 对象，getUnsafe 被设计成只能从引导类加载器（bootstrap class loader）加载。
    private static final Unsafe unsafe = getUnsafe();

    //定义一个变量来记录 status 的地址,因为 CAS 需要的是一个地址
    private static long valueOffset = 0;

    static {
        try {
            //初始化获取 status 在内存中的偏移量（也就是地址）
            valueOffset = unsafe.objectFieldOffset(CASLock.class.getDeclaredField("status"));
        } catch (Exception ex) { throw new Error(ex); }
    }

    //实现 CAS 操作：判断 status 是否能等于 except，如果等于则修改为 newValue，修改成功则返回 true，否则返回 false
    public boolean compareAndSet(int except,int newValue){
        //如果 valueOffset==except 那么就将成 valueOffset 这个地址的变量的值改成 newValue
        return unsafe.compareAndSwapInt(this, valueOffset, except, newValue);
    }

    //加锁过程
    public void lock(){
        //判断 status==0?,等于0 则改变成为1,具体操作通过 CAS 完成，保证原子性(不会被打断)
        while(!compareAndSet(0,1)){
            System.out.println("等待拿锁自旋中......");
        }
        System.out.println("当前有线程拿到锁~~~~~~");
    }

    //解锁过程:将 status 重置
    public void unlock(){
        status = 0;
    }

    //通过反射获取 Unsafe 对象
    public static Unsafe getUnsafe() {
        try {
            Field field = Unsafe.class.getDeclaredField("theUnsafe");
            field.setAccessible(true);
            return (Unsafe)field.get(null);

        } catch (Exception e) {}
        return null;
    }
}
```

​	2）测试加 CASLock 前后，两个线程对 k 各加 10000 次的结果：

```java
//用两个线程对 sum 值进行递增，使用自定义的 CASLock 解决同步问题
public class TestCASLock {
    Thread t1;
    Thread t2;
    CASLock casLock = new CASLock();
    int k = 0;

    public static void main(String[] args) throws InterruptedException {
        new TestCASLock().start();
    }

    private void start() throws InterruptedException {
        t1 = new Thread(() -> {sum();},"t1");
        t2 = new Thread(() -> {sum();},"t2");
        t1.start();
        t2.start();

        t1.join();
        t2.join();
        System.out.println("主线程执行完毕 k = " + k);
    }


    public void sum(){
        casLock.lock();
        for (int i = 0; i <= 9999; i++) {
            k = k + 1;
        }
        casLock.unlock();
    }
}
```

​	3）不加锁时，执行结果是13562，加锁后结果一定为 20000。

​		这是因为如果不加锁，同时 k = k + 1 操作并不是原子性，编译后的汇编指令是几条，可能 t1 执行 k + 1 后，并没有将数据赋值给 k 时，t2 来拿到了 k ，这样的话 t1 和 t2 同时对当前 k 执行加1操作，赋值回去时会导致 k 只加了 1，而并不是 2。加锁过后，t1 拿到锁，对 k 进行加 1 时，此时 t2 拿不到锁，会一直自旋，并不会去拿 k 值。（保证 k = k + 1 操作过程不会被打断）

> CAS ：比较并交换，是一条原生的 CPU 指令，是操作系统级别的指令，因此并不会被编译成几条指令，就不会有同步问题。

`[问题]` synchronized 关键字锁的是什么呢？

1、当非静态对象时，Java 一般认为锁住的是对象。

```java
public void sum(){
    synchronized (user){
        for (int i = 0; i <= 9999; i++) {
            k = k + 1;
        }
    }
}
```

​	从结果来看，锁的似乎是 synchronized 中的代码块，但是`将这里的 user 理解为一把锁的话`，那么 synchronized 锁的就是一个对象。例如上面的 CASLock 中 casLock.lock() 是给 casLock 上锁，改变的是 casLock 的状态。因此此处就可以说 `synchronized 是给 user 上锁`，那么究竟改变了 user 对象的什么东西呢？

​	这个对象可以是空的，因此改变的肯定不是对象属性。一个对象是由 `对象头（一定有）、实例数据、对齐填充数据` 组成。

1）查看一个对象的大小：引入 jol-core 依赖，提供 ClassLayout 类能够解析实例，并提供格式化输出查看。（高版本无法查看具体的位信息）

```xml
<dependency>
    <groupId>org.openjdk.jol</groupId>
    <artifactId>jol-core</artifactId>
    <version>0.9</version>
</dependency>
```

2）测试打印 user 的对象组成：User 只有一个 String 类型的 name 属性。

```java
public class TestJol {
    static User user = new User();
    public static void main(String[] args) {
        System.out.println(ClassLayout.parseInstance(user).toPrintable());
    }
}
```

```shell
com.example.pojo.User object internals:
 OFFSET  SIZE               TYPE DESCRIPTION                          VALUE
      0     4               (object header)                           01 00 00 00 (00000001 00000000 00000000 00000000) (1)
      4     4               (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)
      8     4               (object header)                           43 c1 00 f8 (01000011 11000001 00000000 11111000) (-134168253)
     12     4   		   java.lang.String User.name                 null
Instance size: 16 bytes
Space losses: 0 bytes internal + 0 bytes external = 0 bytes total
```

​		可以看出：一个对象占 16 字节，`前 12 字节（96 bit）为对象头`，后 4 字节为实例数据，没有对齐填充数据。

​		根据 JVM 官方的规范，一个对象头应该包括 type（类型）、GC state（分代年龄和是否被 GC 标记）、synchronization state（是否被加了 synchronized，加了则表示此时的状态：锁状态信息）、identity hashcode（hashcode 信息）

![](D:\NoteBook\核心笔记\多线程原理详解\对象的具体内容.png)

> 分带年龄可以进行验证，但是需要设置 JVM 运行内存大小，否则可能太大不会发生变化，每次经过 from -> to 的过程，分代年龄就会加1，最大 15。

​		查看前 25 bit 发现是被使用的，那么 JDK 源码为什么说 前 25 bit 是 usused 呢？此时再调用 user 对象的 hashcode 方法打印 hashcode 值，发现 hashcode 值和利用 jol 打印的对象信息是倒置的，这是为什么呢？ =====> `小端存储`，因此hashcode值是倒置的，同时 usused 应该是最后的 25 bit，检查确实是全0。

```shell
hashcode = 49 47 68 42
com.example.pojo.User object internals:
 OFFSET  SIZE               TYPE DESCRIPTION                          VALUE
      0     4               (object header)                           01 42 68 47 (00000001 01000010 01101000 01000111) (1198014977)
      4     4               (object header)                           49 00 00 00 (01001001 00000000 00000000 00000000) (73)
      8     4               (object header)                           43 c1 00 f8 (01000011 11000001 00000000 11111000) (-134168253)
     12     4   		   java.lang.String User.name                 null
Instance size: 16 bytes
Space losses: 0 bytes internal + 0 bytes external = 0 bytes total
# 此时检查 unused 发现前 25 位确实是全0未用到，后 31 bit 存储是 hashcode
```

> 小端存储：高字节存储在高地址，低字节存储在低地址，因此是`按字节倒置存储`的。

`分代年龄`：4 bit，表示该对象在幸存区之间的存活代数。

`偏向标识`：1 bit，表示这个锁是否可偏向，1 代表可偏向，0 代表不可偏向。

`锁的状态`：2 bit，表示当前锁的状态，01 代表无锁或者偏向锁（区别在于是否有 tid），00 代表轻量锁，10 代表重量锁，11 代表 GC 标记。

> 注意测试偏向锁时需要将偏向延迟关闭：（IDEA 配置 JVM 参数）
>
> ```options
> -XX:BiasedLockingStartupDelay=0
> ```

​	测试过程还发现：`当一个对象计算了 hashcode 后，偏向标识始终为 0 表示不可偏向`，这是因为当对象加上了偏向锁后，对象头的前 54 bit（原来的 unused 和 hashcode 的一部分）会存储线程的 tid，因此计算 hashcode 后的对象是没办法加偏向锁的。

`[总结]` 锁的过程：（下列分析建立在偏向锁打开情况下）`锁的膨胀过程`。

1）对象一开始没有计算 hashcode 时是处于`无锁可偏向状态（101）`，如果计算了 hashcode 则变成`无锁不可偏向状态（001）`。

2）没有计算 hashcode 情况下，第一次被线程持有时变为`偏向锁可偏向状态（101）`。

3）如果这个线程再对其进行加锁时，仍然是`偏向锁可偏向状态（101）`。

4）如果此时另一个线程和这个线程交替执行（前一个线程已经把锁释放，不存在资源竞争）来加这个对象锁时，就会变成`轻量锁状态（00）`。

> ​		当膨胀成轻量锁或是重量锁后，偏向表示已经不存在了，前 62 bit 都变成一个指向线程栈中的一个地址，但原先的那些信息其实还是存在的，例如分代年龄信息。（因此已经没有偏向不偏向的问题）

5）如果此时另一个线程和这个线程存在资源竞争要来加这个对象锁时，就会变成`重量锁状态（10）`。

![](D:\NoteBook\核心笔记\多线程原理详解\对象头变化.png)

```java
@SuppressWarnings("all")
public class TestJol {
    static User user = new User();
    public static void main(String[] args) throws InterruptedException {
        //System.out.println(Integer.toHexString(user.hashCode()));
        Thread t1 = new Thread(() -> {testLock();}, "t1");
        Thread t2 = new Thread(() -> {testLock();}, "t2");
        t1.start();
        t1.join();  //join 等待 t1 执行完释放锁：不存在资源竞争
        t2.start();
        System.out.println("主程序执行完成!");
    }

    public static void testLock(){
        synchronized (user){
            System.out.println("currentThread() = " + Thread.currentThread().getName());
            System.out.println(ClassLayout.parseInstance(user).toPrintable());
        }
    }
}
```

`[面试题]` synchronized 是不是重量锁？

​		如果是同一个线程加锁（包括重入）则是偏向锁，如果是交替执行则是轻量锁，如果是资源竞争才是底层使用 pthread_mutex_t 实现的重量锁，因此 synchronized 不一定是重量锁。

# CAS 简述

`[问题]`  如果对之前的两个线程同时操作某一个 int 类型的变量不加 Lock 和 syncronized  ，如何保持原子性使其不会发生线程安全问题呢？

​		根据编译文件的汇编语句可知，执行 count++ 操作时实际上是三个操作：获取值、计算值、写回数据，并不是一个原子性的操作，会被其他线程打断整个过程的进行，因此会发生线程安全问题。因此，可以使用 `原子类(java.util.concurrent.atomic 包)` 进行操作，来解决原子性问题（`底层使用的 CAS 操作`）。

​		使用 `AtomicInteger` 代替原来的 int 类型（实际就是封装的 int 类型），利用其 `getAndIncrement` 实现加1操作。这些类的底层都直接和操作系统挂钩，是直接在内存中修改值 。 

`[理论]` 什么是 CAS 呢？`核心就是 “原子操作”`。

​		CAS：`Compare And Swap 比较并交换`，使用 `cmpxchg` 这个 CPU 级别的原语指令调用（硬件保证原子性），但是`并没有访问内核态地址空间`，不会进行系统调用。Java 本地方法(JNI)的出现，使得 Java 程序能够越过 JVM 直接调用本地方法。 `CAS 操作包含三个操作数 —— 内存位置（V）、预期原值（A）和新值(B)`。 如果内存位置的值与预期原值相匹配，那么处理器会自动将该位置值更新为新值 。否则，处理器不做任何操作。无论哪种情况， 它都会在 CAS 指令之前返回该位置的值；`整个过程都是不可打断的`，所以CAS是一个原子操作；主要是利用 CPU 的CAS指令，同时借助 JNI 来完成 Java 的非阻塞算法。

```java
//一个封装好的 CAS 操作函数：compareAndSet
public final boolean compareAndSet(int expect, int update) {
    return unsafe.compareAndSwapInt(this, valueOffset, expect, update);
}
// expect 表示期望值
// update 表示更新值
```

​	使用 CAS 来实现50个线程操作变量但是并不会产生同步问题：（原来的问题和使用 synchronized 的情况（可以实现但效率低）不做演示）

```java
public interface Account {
    //查询
    Integer query();
    //获取
    void acquire(Integer i);
}
```

```java
public class AccountCas implements Account{
    private AtomicInteger balance;      // AtomicInteger 内部自带 cas 操作的 api

    public AccountCas(int balance){
        this.balance=new AtomicInteger(balance);
    }

    @Override
    public Integer query() {
        return this.balance.get();
    }

    @Override
    public void acquire(Integer i) {
        while (true){
           int current = balance.get(); //拿到当前的值
           int next = current - i;  //next 表示取钱后的值应该是多少，但此时 balance=current
           //balance == current ？ balance = next : break;
           if (balance.compareAndSet(current, next)) break;
        }
    }
}
```

​	测试：发现测试结果一直是 0，线程安全问题得到解决。

```java
public class TestCAS {
    public static void main(String[] args) throws InterruptedException {
        Account account = new AccountCas(10000);
        List<Thread> ts = new ArrayList<>();
        for (int i = 0; i < 500; i++) {
            ts.add(new Thread(() -> {
                account.acquire(20);
            }, "t" + i));
        }
        for (Thread t : ts) {
            t.start();
        }
        for (Thread t : ts) {
            t.join();
        }
        System.out.println(account.query());
    }
}
```

​		通过上面发现，compareAndSet 操作过程中，如果另外的线程将 balance 改变了，那么就不会进行赋值操作，会直接中断进行下一个循环重新取值再比较交换，以此种方式来让线程安全。

`[案例]` 利用 CAS 自定义一个简单的 CASLock 锁。

```java
public class CASLock {
    private volatile int status = 0;  //锁的状态标识，默认为0表示无锁
    // 获取 Unsafe 对象，getUnsafe 被设计成只能从引导类加载器（bootstrap class loader）加载。
    private static final Unsafe unsafe = getUnsafe();

    //定义一个变量来记录 status 的地址,因为 CAS 需要的是一个地址
    private static long valueOffset = 0;

    static {
        try {
            //初始化获取 status 在内存中的偏移量（也就是地址）
            valueOffset = unsafe.objectFieldOffset(CASLock.class.getDeclaredField("status"));
        } catch (Exception ex) { throw new Error(ex); }
    }

    //实现 CAS 操作：判断 status 是否能等于 except，如果等于则修改为 newValue，修改成功则返回 true，否则返回 false
    public boolean compareAndSet(int except,int newValue){
        //如果 valueOffset==except 那么就将成 valueOffset 这个地址的变量的值改成 newValue
        return unsafe.compareAndSwapInt(this, valueOffset, except, newValue);
    }

    //加锁过程
    public void lock(){
        //判断 status==0?,等于0 则改变成为1,具体操作通过 CAS 完成，保证原子性(不会被打断)
        while(!compareAndSet(0,1)){
            System.out.println("等待拿锁自旋中......");
        }
        System.out.println("当前有线程拿到锁~~~~~~");
    }

    //解锁过程:将 status 重置
    public void unlock(){
        status = 0;
    }

    //通过反射获取 Unsafe 对象
    public static Unsafe getUnsafe() {
        try {
            Field field = Unsafe.class.getDeclaredField("theUnsafe");
            field.setAccessible(true);
            return (Unsafe)field.get(null);

        } catch (Exception e) {}
        return null;
    }
}
```

`[分析]`  从上面能够发现一个特别的类：`Unsafe 类`。Java 无法直接操作内存，但是 Java 可以调用 native 方法，进而调用到底层的 C++ 代码，让 C++ 代码来操作内存，相当于就是 Java 的后门，而这个类就是一个可以调用到底层 C++ 的代码的内，进而操作内存。

​		当原子类调用 getAndIncrement() 方法时，底层实际调用 unsafe 类的 `getAndAddInt()` 方法，而这个就是获取内存中的地址进行操作，效率高，且编译后只有一条指令，保证了操作的原子性。但是需要注意的是只有单条语句保证原子性，`两条 CAS 语句是不保证原子性的`，还是需要使用锁同步。

```java
public final int getAndIncrement() {
    return unsafe.getAndAddInt(this, valueOffset, 1);
}

public final int getAndAddInt(Object var1, long var2, int var4) {
    int var5;
    do {
        var5 = this.getIntVolatile(var1, var2);
    } while(!this.compareAndSwapInt(var1, var2, var5, var5 + var4));

    return var5;
}
```

​		同时在 CAS 使用中还可能会出现 `ABA 问题`（狸猫换太子），A 线程拿到 A = 1，执行 cas(1,2)，但他并不知道 B 线程执行 cas(1,3) 后再执行 cas(3,1) 。这样最后的结果虽然并没有问题，但是如果数据并没有修改回来呢？那就会出问题，导致两个个线程执行的结果出现问题，这也证明了多条 CAS 指令并不能保证原子性。这里的现象虽然最终结果正确，但是并不知道这个结果已经是被处理过，那么如何才能知道这个结果被修改过呢？ ====> 原子引用（带版本号的原子操作，类似于 SQL 里面使用乐观锁机制）。

```java
public class CASDemo {
    public static void main(String[] args) {
        AtomicInteger atomicInteger = new AtomicInteger(2020); 
        
        // ==============捣乱的线程======
        System.out.println(atomicInteger.compareAndSet(2020, 2021));
        System.out.println(atomicInteger.get());

        System.out.println(atomicInteger.compareAndSet(2021, 2020));
        System.out.println(atomicInteger.get());

        // ==============期望的线程======
        System.out.println(atomicInteger.compareAndSet(2020, 6666));
        System.out.println(atomicInteger.get());

    }
}
```

`[理论]`  原子引用是解决 ABA 问题的一种方式，类似于 SQL 语句中的乐观锁思想，使用带版本号的原子操作实现。

​		使用 `AtomicStampedReference` 代替原来的 AtomicInteger 原子类。

```java
// initialRef 初始值
// initialStamp 时间戳（版本号）
public AtomicStampedReference(V initialRef, int initialStamp) {
     pair = Pair.of(initialRef, initialStamp);
}
```

`[案例]` 使用原子引用测试其他线程将结果修改后是否会被察觉导致修改失败。

```java
public class CASDemo02 {
    public static void main(String[] args) {
        // AtomicStampedReference   注意：如果泛型是一个包装类，注意对象的引用问题
        // 正常在业务操作，这里比较的都是一个对象
        AtomicStampedReference<Integer> atomicStampedReference = new AtomicStampedReference<>(1, 1);

        new Thread(() -> {
            // 获得最新的版本号
            int stamp = atomicStampedReference.getStamp();
            System.out.println("a1 版本号=>" + stamp);
            // 保证测试的时候进来的版本号同一个
            try {
                TimeUnit.SECONDS.sleep(2);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            // 修改后同时更新版本号
            System.out.println("线程A："+ atomicStampedReference.compareAndSet(1, 2,
                    atomicStampedReference.getStamp(), atomicStampedReference.getStamp() + 1));
            // 修改完时的版本号
            System.out.println("a2 版本号=>" + atomicStampedReference.getStamp());

            System.out.println("线程A："+ atomicStampedReference.compareAndSet(2, 1,
                    atomicStampedReference.getStamp(), atomicStampedReference.getStamp() + 1));
            System.out.println("a3 版本号=>" + atomicStampedReference.getStamp());
        }, "a").start();

        //乐观锁的原理相同
        new Thread(() -> {
            // 获得最新的版本号
            int stamp = atomicStampedReference.getStamp();
            System.out.println("b1 版本号=>" + stamp);
            // 保证测试的时候进来的版本号同一个
            try {
                TimeUnit.SECONDS.sleep(2);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println("线程B："+ atomicStampedReference.compareAndSet(1, 5, stamp,
                    stamp + 1));
            // 获取修改完时当前的版本号
            System.out.println("b2 版本号=>" + atomicStampedReference.getStamp());
        }, "b").start();
    }
}
```

`[注意]`  Integer 包装类使用了`对象缓存机制`，默认范围是 -128~-127，推荐使用静态工厂方法 valueOf 来获取对象实例，而不是直接使用 new，因为 valueOf 使用缓存，而 new 一定会创建新的对象分配新的内存空间。（实际工作上，一般使用的是对象，对对象进行比较交换）

> Alibaba 开发手册说明：
>
> ![在这里插入图片描述](https://img-blog.csdnimg.cn/e306f9ff0f384d329891b470faa7e877.png)

# 公平锁和非公平锁

`[问题]` synchronized 是公平锁还是非公平锁呢？

​		1）使用 synchronized 时，来查看10个线程阻塞时再拿到锁的顺序和过程：

```java
@SuppressWarnings("all")
public class TestSync {
    //定义一把锁
    private static Object lock = new Object();

    public static void main(String[] args) throws InterruptedException {
        //线程的数量
        int N = 10;
        Thread[] threads = new Thread[N];
        for(int i = 0; i < N; ++i){
            threads[i] = new Thread(new Runnable(){
                public void run() {
                    //判断标准：这里打印的结果是无序则表示是非公平锁，有序则公平锁 ？？？ ====> 实际是错误的结论
                    //发现打印结果是倒序，由于底层的线程排队的队列是 C++ 实现的，因此几乎无法分析。 ===> 分析 ReentrantLock 的源码
                    //通过看 ReentrantLock 的源码的队列实现，而 synchronized 的 C++ 队列的实现就是倒着来的
                    synchronized(lock){
                        System.out.println(Thread.currentThread().getName() + " get synch lock!");
                        try {
                            Thread.sleep(200);
                        } catch (InterruptedException e) {
                            // TODO Auto-generated catch block
                            e.printStackTrace();
                        }
                    }
                }

            });
        }

        //main线程可以得到锁，持有了锁
        synchronized(lock){
            for(int i = 0; i < N; ++i){
                //启动所有的线程，但这些线程都拿不到锁，因为锁当前是被main线程持有
                threads[i].start();
                Thread.sleep(200);
            }
        }
    }
}
```

​		2）由于 synchronized 底层肯定是存在一个容器用来存放阻塞的队列，经过上面测试结果是`倒序拿到锁的`，但是由于底层是 C++ 代码实现，因此考虑使用`使用 Java 层面的 ReentrantLock 来分析 Java 的队列实现`，从而联想到 C++ 层面队列的实现。

```java
@SuppressWarnings("all")
public class TestReentrantLock {
    private static ReentrantLock lock = new ReentrantLock();

    public static void main(String[] args) throws InterruptedException {
        int N = 10;
        Thread[] threads = new Thread[N];
        for (int i = 0; i < N; ++i) {
            threads[i] = new Thread(new Runnable() {
                public void run() {
                    lock.lock();
                    System.out.println(Thread.currentThread().getName() + " lock!");
                    try {
                        Thread.sleep(20);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    lock.unlock();
                }

            });
        }
        lock.lock();
        for (int i = 0; i < N; ++i) {
            threads[i].start();
            Thread.sleep(200);
        }
        lock.unlock();
    }
}
```

​		测试结果发现：使用 ReentrantLock 的 lock 方法替代 sync 关键字，发现结果是`顺序拿到锁`。同时 `new ReentrantLock(true/false) ` 创建不管是公平锁还是非公平锁（ReentrantLock 底层可以选择使用公平锁还是非公平锁），`结果都是顺序拿到锁`。

`[总结]` 所谓的公平锁或是非公平锁，是在加锁的时候进行抢锁的过程不同：如果抢锁失败，则会进入队列（并未睡眠），这个时候还会不甘心，进行自旋去获取锁，如果再失败才会睡眠。当`线程阻塞进入队列睡眠后`，后面拿锁的过程就不再区分公平锁还是非公平锁，都会排队按顺序拿锁。

​	公平锁：第一次加锁时，并不会尝试加锁，而是会检查一个特殊队列（`AbstractQueuedSynchronizer`：AQS）里面有没有线程在排队，如果有线程在里面排队，则会先进入队列（并没有排队），此时还会再次检查自己是否有拿到锁的资格（就是检查是否在队列头部），如果有则拿到锁，如果没有则进入睡眠才排队。

> `AQS 是一个双向链表`，会存放进入休眠状态的线程。AQS 主要属性如下：
>
> ```java
> private transient volatile Node head; //AQS 队列首
> private transient volatile Node tail;//AQS 队列尾
> private volatile int state;	//锁状态，加锁成功则为1，重入+1，解锁则为0
> private transient Thread exclusiveOwnerThread;	//AQS 父类属性，用于记录当前线程
> ```

公平锁和非公平锁的区别：在锁被释放时，非公平锁来了会直接抢锁，而公平锁则会先进入队列再检查获取锁的资格。

`[分析]`  非公平锁加锁过程：一开始就进行 CAS 尝试加锁，此时拿不到锁，执行 acquire 方法。

```java
final void lock() {
    if (compareAndSetState(0, 1))
        setExclusiveOwnerThread(Thread.currentThread());
    else
        acquire(1);
}
```

```java
public final void acquire(int arg) {
    if (!tryAcquire(arg) && acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

​	进入 acquire 方法后会调用 tryAcquire 方法，进而调用 nonfairTryAcquire 方法：

```java
final boolean nonfairTryAcquire(int acquires) {
    //记录当前线程
    final Thread current = Thread.currentThread();
    int c = getState();
    //判断是否有人持有锁
    if (c == 0) {
        if (compareAndSetState(0, acquires)) {
            setExclusiveOwnerThread(current);
            return true;
        }
    }
    //判断重入锁
    else if (current == getExclusiveOwnerThread()) {
        int nextc = c + acquires;
        if (nextc < 0) // overflow
            throw new Error("Maximum lock count exceeded");
        setState(nextc);
        return true;
    }
    //直接返回 false，没有拿到锁
    return false;
}
```

​	没有拿到锁时回到 acquire 方法，`!tryAcquire(arg) = true`，继续执行：

```java
acquireQueued(addWaiter(Node.EXCLUSIVE), arg);
//Node.EXCLUSIVE 就是 null
```

​	而 addWaiter 就相当于是生成一个线程的 Node：

​		Node 节点的主要属性：

```java
volatile Node prev;
volatile Node next;
volatile Thread thread;
```

​		形成队列的过程：

```java
private Node addWaiter(Node mode) {
    // 以当前线程生成一个 Node 节点，传入的 mode = null
    Node node = new Node(Thread.currentThread(), mode);
    // AQS 队尾赋值临时变量 pred
    Node pred = tail;
    if (pred != null) {
        node.prev = pred;
        if (compareAndSetTail(pred, node)) {
            pred.next = node;
            return node;
        }
    }
    // 
    enq(node);
    return node;
}
```

​	将 Node 传入 acquireQueued 方法：

```java
final boolean acquireQueued(final Node node, int arg) {
    boolean failed = true;
    try {
        boolean interrupted = false;	//表示打断，暂时理解为无意义
        // 之前没拿到锁情况下此时进入自旋
        for (;;) {
            final Node p = node.predecessor();	// 拿到当前线程节点的上一个节点
            if (p == head && tryAcquire(arg)) {	// 判断上一个节点是否是 head ，如果是 head，则再次尝试获取锁，如果不是则不尝试解锁（&& 连接）
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return interrupted;
            }
            // 再次加锁失败，shouldParkAfterFailedAcquire 只有当每个线程第一次进来时返回 true，后面再进这个方法一直返回 false 进入睡眠
            if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
```

`[分析]`  公平锁加锁过程：公平锁并不会一开始就直接加锁，而是调用 tryAcquire 尝试加锁。

```java
final void lock() {
    acquire(1);	//区别1：不会直接加锁
}

public final void acquire(int arg) {
    if (!tryAcquire(arg) && acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

​	调用 tryAcquire 尝试加锁，进入公平锁的 tryAcquire 方法：

```java
protected final boolean tryAcquire(int acquires) {
    //获取当前线程
    final Thread current = Thread.currentThread();
    int c = getState();
    //判断是否锁被人持有
    if (c == 0) {
        //公平锁会判断队列还有没有线程排队，没有线程排队才会加锁（区别2）
        if (!hasQueuedPredecessors() && compareAndSetState(0, acquires)) {
            setExclusiveOwnerThread(current);
            return true;
        }
    }
    //判断重入
    else if (current == getExclusiveOwnerThread()) {
        int nextc = c + acquires;
        if (nextc < 0)
            throw new Error("Maximum lock count exceeded");
        setState(nextc);
        return true;
    }
    //有人持有，且不是重入时直接返回 false
    return false;
}
```

​	如果假设此时锁没有人持有 state = 0，则执行 hasQueuedPredecessors（）方法，判断队列中有没有线程排队。

```java
public final boolean hasQueuedPredecessors() {
    Node t = tail;
    Node h = head;
    Node s;	//实例化一个 空的节点
    //head == tail 时直接返回 false ===> 没线程排队
    //head ！= tail 时，有线程排队，判断后面，如果 head.next == null 
    return h != t && ((s = h.next) == null || s.thread != Thread.currentThread());
}

//第一次加锁时，haed 和 tail 都为 null，未形成队列，head == tail，则直接返回 false，表示没线程排队。
```

​	1）如果是第一次加锁，则 hasQueuedPredecessors（）返回 false，则执行 compareAndSetState(0, acquires) 加锁，并加锁成功，则执行：

```java
setExclusiveOwnerThread(current);	//设置当前持有锁的线程是当前线程
return true;

protected final void setExclusiveOwnerThread(Thread thread) {
    exclusiveOwnerThread = thread;
}
```

​	此时整个流程加锁成功，返回 return，回到 acquire 方法，就不会进入 if 代码体，则整个加锁流程完毕。

`[总结]` 公平锁第一次加锁时，AQS 队列甚至都不需要初始化就加锁成功。

​	2）如果是第二次加锁：`t1 持有锁，t2 来加公平锁` 场景，此时 state = 1，拿不到锁，同时也不是重入，则直接返回 false，回到 acquire 方法执行：

​		先看 addWaiter 方法：传入参数 mode = null。

```java
private Node addWaiter(Node mode) {
    //以当前线程生成一个 Node 节点，传入的 mode = null,这个构造函数内部将 node 的next指向 mode = null，将 thread 属性设为 t2
    Node node = new Node(Thread.currentThread(), mode);
    //此时 AQS 的 tail = null
    Node pred = tail;
    if (pred != null) {
        node.prev = pred;
        if (compareAndSetTail(pred, node)) {
            pred.next = node;
            return node;
        }
    }
    //此时 pred = null，则执行 enq（node）
    enq(node);
    //下面的函数执行完毕后，将 node的 pre 修改，此处就直接返回当前拿锁的线程 t2
    return node;
}

//enq 方法：形成队列的过程 node 代表自己线程的那个节点{thread：t2；next = null；pre = null}
private Node enq(final Node node) {
    for (;;) {
        //此时 tail = null
        Node t = tail;
        if (t == null) {
//此时 t = null，此时cas 判断head == null ？如果是 null 则将head 指向一个空 Node，并将 tail 指向 head，也就是指向那个空 Node，此时队列就形成了
            if (compareAndSetHead(new Node()))
                tail = head;
        } else {
//这是一个死循环，第二次 t ！= null，而是等于那个匿名 Node，此时 node 连接到那个匿名空Node。
            node.prev = t;
//此时 tail = t = 空 Node，那么将 tail 修改指向成 node
            if (compareAndSetTail(t, node)) {
               //此时 t 就是那个匿名Node，现在就将匿名空Node 连接到 node 上，此时双向链表就形成了
                t.next = node;
                return t;	//返回那个匿名空 Node
            }
        }
    }
}
```

​	第二次加锁时，此时双向链表形成（`也说明了此时进入了队列但并没有睡眠`），再返回到看外层方法 acquireQueued，这个参数 node 就是当前要加锁的线程 t2。

```java
// addWaiter 方法还是添加节点
final boolean acquireQueued(final Node node, int arg) {
    boolean failed = true;
    try {
        boolean interrupted = false;	//判断打断，不用关心
        for (;;) {
            final Node p = node.predecessor();	//获取上一个节点
            if (p == head && tryAcquire(arg)) {	// 上一个节点是 head 时，再次尝试获取锁 tryAcquire
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return interrupted;
            }
            //如果还是获取不到锁则进入park 睡眠
            if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
```

​	3）第三次加锁时，此时 t1 线程还没有释放锁，t3 来尝试加公平锁，此时 state=1，t3 拿不到锁，也不是重入，则直接返回false，执行 addWaiter 方法，将 t3 加入队列，返回后执行 acquireQueued 方法发现 node.pred != head，则直接执行 shouldParkAfterFailedAcquire 进行 park 睡眠。

​	公平锁第一次拿到锁时甚至都没有初始化队列出来（AbstractQueuedSynchronizer 的 head 和 tail 都是空），当第二个线程进来肯定拿不到锁，就会和 head 和 tail 连接起来，（最前面是一个空 node）形成一个双向链表，但此时并没有排队，只是加入到了队列，此时就会看排在前面的线程是不是 head，如果是那么当前线程就会企图获取锁（再次 tryAquire 获取锁：自旋），如果不是则当前线程就会进入休眠排队等候。

`[总结]`  基于 AQS 框架实现的 ReentrantLock 锁，不管是公平锁还是非公平锁：

​	1）如果 线程1 和线程 2 交替执行，则一直保持第一次拿到锁的状态：即不会初始化队列。

​	2）如果是资源竞争情况，则第二个线程就会初始化队列，同时如果当前线程前面一个线程是 head，还会自旋再次尝试拿锁。

​	3）如果是第三个线程，拿不到锁会直接加入到队列，如果当前线程前面的线程不是 head 线程，则不会自旋，会直接进入队列休眠排队。

![](D:\NoteBook\核心笔记\多线程原理详解\image\公平锁和非公平锁加锁过程.png)

当`线程之间是交替执行时`，如果希望线程按顺序执行，则使用公平锁。而非公平锁可能会直接获取到锁，则会打乱执行顺序。

> 此处非公平锁也是顺序执行为什么呢？因为这里的线程都阻塞了，都进入队列进行排队，而`进入队列后唤醒就一定是要排队的`。=> 进入队列则永久都会排队。

​		此时便可以根据上面的判断标准来判断 synchronized 是公平锁还是非公平锁呢？ `看 C++ 代码中入队前是否有抢锁的操作` 分析具体过程。

`[问题]` 为什么 synchronized 的临界区代码发生异常会导致锁释放呢？

​		因为代码编译后的 Javac 级别的汇编中，synchronized 修饰的临界区代码，前面会加 `monitorenter` 指令，结束时会加 `monitorexit` 将锁释放。而当临界区代码出现异常时，会直接调用 `goto` 指令，从而调用另外的 `monitorexit` 指令，同样将锁释放。（这是 JVM 级别的汇编指令）

# 锁的膨胀过程

`[分析]` 分析 synchronized 的加锁过程（C++）层面：（以之前的那个 user 锁对象案例为例）=====> `锁的膨胀过程`

​	1）当执行 `monitorenter` 指令（也就是`刚添加 synchronized 关键字修饰`还未到上锁逻辑）时，JVM 会在 main 线程的栈帧（线程私有栈）中产生一个对象：`LockRecord`（C++ 层面实际叫做 BasicObjectLock 对象，Java 行业一般称作 LockRecord ），这个对象里面的 `Object ref` 属性指向加锁的对象（user），但此时 LockRecord 里面的 `displayedHead`是空的，当前的锁对象 user 的 mark word 此时为 `101 可偏向无锁`的状态，内部代码继续向下执行。

​	2）此时第一个线程 t1开始加锁（一定是偏向锁），会在栈帧中生成一个 lock record，并将其 ref 指向锁对象。判断是否支持偏向，支持偏向则判断当前线程 id 是不是自己，此时不是自己，再判断是不是可偏向，判断是否过期（未发生批量重偏向时不会过期），此时就会在内存中生成一个 mark word = 101 的匿名偏向，再创建一个偏向自己的 mark word = tid + 101 。再判断是不是匿名偏向：利用 CAS 操作判断当前锁对象的对象头中的 mark word 是不是 那个匿名偏向的 mark word，如果是，则修改为 那个偏向自己的 mark word = tid + 101，此时偏向锁加锁成功。如果在 CAS 之前对象头的 mark word 被其他线程修改了，那么就 CAS 失败，准备膨胀成轻量锁。

![](D:\NoteBook\核心笔记\多线程原理详解\image\场景一.png)

​	3）当t1 将锁释放，该线程 t1 再次拿锁时，也就是第二次加锁，此时直接进行对象头中线程的比对，进行基本的判断的位运算，就能直接拿到偏向锁，因此效率高（比第一次还高）。

![](D:\NoteBook\核心笔记\多线程原理详解\image\场景二.png)

​	4）偏向锁释放锁时直接将 lock record 清除即可（不考虑重入的情况）。

> 需要注意的是：偏向锁在将锁释放后，里面依然记录的是该线程 tid + 101，表示偏向该线程，等此线程再次来加锁就直接对比 tid 即可，因此效率高。

​	5）t1 再次释放锁，清除 lock record 后，t2 来加锁，判断是不是偏向自己，肯定不是，则此时就会`进行锁的偏向撤销`将对象头改成 001 无锁，（C++ 层面的slow_enter 函数）之后拿到对象头中的 mark word = 001，此时判断是不是无锁，此时肯定是无锁，则将 lock record 里面的 displayedHead 设置成这个 mark word = 001，此时利用 CAS 操作判断对象头的 mark word 和 lock record 里面的是不是相同，如果相同则将锁对象的对象头的 mark word 改成一个指向 lock word 的指针+00，完成轻量锁的加锁。

![](D:\NoteBook\核心笔记\多线程原理详解\image\场景三.png)

​	6）轻量锁的释放就是将对象头中的锁状态 00 恢复成 lock record 中记录的 001，再将 lock record 清除。

​	7）当 t2 释放锁，另一个线程 t3 来加锁时，此时已经是无锁状态001，会利用 CAS 操作判断当前锁是不是无锁状态（CAS 条件：只有当无锁状态时，才会成功加上轻量锁（这也就是为什么轻量锁会在锁释放之后将锁的状态置为`001 不可偏向无锁状态` ===> 底层原理设计的需要，轻量锁解锁时都会将 mark word 重置为无锁状态））。`如果是无锁状态`，则产生一个无锁状态的 mark word 的值 001，CAS 操作成功，将这个值放入到 displayedHead，然后将锁对象的对象头的 mark word 前面存放一个指针，这个指针指向 LockRecord，而后两位则表示 00 轻量锁状态。

![](D:\NoteBook\核心笔记\多线程原理详解\image\场景四.png)

​	8）`如果不是无锁状态`，则说明此时有线程持有锁，判断里面的 lock record 是不是自己，是自己则表示当前对象头里面都是mark word = 00，此时就是锁的重入，就会在栈帧中产生一个 lock record，里面的 displayedHead 是 null，加锁成功。

![](D:\NoteBook\核心笔记\多线程原理详解\image\场景五.png)

> ​	不管是偏向锁还是轻量锁，都有这个 lock record 对象，实际上偏向锁和轻量锁在加锁过程中的性能差别不大，但是偏向锁在解锁时直接将 lock record 置空释放即可（重入时重入几次就释放几个 lock record 对象），而轻量锁在释放时需要将 lock record 的记录还原，同时将锁对象的对象头还原成无锁101。
>
> ​	所以偏向锁和轻量锁的性能差距是体现在解锁过程。

​	9）如果当 t3 将要进行 CAS 操作但还没做时，此时 mark word 里面存放的是 001，但此时 t4 来了，先一步完成轻量锁的加锁过程，将 mark word 里面的值改成了 `指针（指向 lock record）+ 00`，此时 mark word 里面的值就不满足轻量锁加锁条件，CAS 失败，重入判断也会失败，那么就会执行 monitorenter 方法开始膨胀，变为重量锁。重量锁的加锁过程就和 ReentrantLock 的非公平锁差不多（AQS 换成了 ObjectMonitor 这个 C++ 对象），利用两个队列来管理拿锁阻塞的线程：WaitSet 队列 和 EntryList 队列。  `重量锁释放之后对象头状态还是 010`。

`[总结]` 锁膨胀的流程图：

![](http://assets.processon.com/chart_image/62c7e1d16376890771bc5741.png)

`[问题]` JVM 为什么默认是有偏向延迟的，禁用了偏向锁 4s ？

​		因为偏向锁升级为轻量锁是需要经历锁的撤销和膨胀的， JVM 认为自己启动的时候内部线程（例如 GC）不可能是偏向锁的，因此禁用偏向锁，但因为 JVM 估计 4s 后自己的内部线程已经启动完成，此时就不会禁用偏向，后面要不要使用偏向锁就是用户自己决定。（大部分项目都会将偏向锁关闭）

`[问题]` 前一个轻量锁释放锁后，轻量锁的加锁过程中对象头和 lock record 是怎么变化的？

![](D:\NoteBook\核心笔记\多线程原理详解\image\轻量锁的对象头变化.png)

# 重偏向和撤销

​		前面提到偏向锁的判断时还有一个`是否过期`，那么这个是否过期是什么呢？怎么样才会过期？偏向锁在加锁成功时会将mark word 改成 tid + epoch + 101，这个 epoch 就是一个过期标识。

1、测试 t2 线程对19个新的 user 添加到 list 后，进行依次加锁：

```java
public class TestEpoch {
    public static void main(String[] args) {
        List<User> users = new ArrayList<>();
        new Thread(() -> {
            for (int i = 0; i < 19; i++) {
                //注意这里每次都是 new 一个新的对象
                User user = new User();
                users.add(user);
                synchronized (user){
                    System.out.println(i);
                    System.out.println(ClassLayout.parseInstance(user).toPrintable());
                }
            }
        }, "t2").start();
    }
}
```

​		结果发现这 19 个都是偏向锁 101。

2、此时再引入一个 t3， 从 list 中拿到 user 并进行加锁：

```java
public class TestEpoch {
    static Thread t3;
    public static void main(String[] args) {
        List<User> users = new ArrayList<>();

        new Thread(() -> {
            for (int i = 0; i < 19; i++) {
                //注意这里每次都是 new 一个新的对象
                User user = new User();
                users.add(user);
                synchronized (user){
                    System.out.println(i);
                    System.out.println(ClassLayout.parseInstance(user).toPrintable());
                }
            }
            System.out.println("===============================================================");
            LockSupport.unpark(t3);
        }, "t2").start();

        t3 = new Thread(() -> {
            LockSupport.park();
            for (int i = 0; i < 19; i++) {
                User user = users.get(i);
                System.out.println(ClassLayout.parseInstance(user).toPrintable());
                synchronized (user){
                    System.out.println(i);
                    System.out.println(ClassLayout.parseInstance(user).toPrintable());
                }
                System.out.println(ClassLayout.parseInstance(user).toPrintable());
            }
        }, "t3");
        t3.start();
    }
}
```

​		发现 t3 线程里刚拿出来 user 都是偏向锁（偏向 t2）101，加锁后都是轻量锁 000，释放锁后都是无锁 001。（验证了轻量锁释放变001），同时能够发现这里有个很大的性能问题就是`需要对这 19 个 user 锁依次进行撤销`，每次拿到偏向锁，进行偏向撤销，升级拿到轻量锁，解锁，恢复 001。如何解决呢？

​		JVM 认为当对一个`类`的对象偏向撤销达到 20 次时，就会认为这把锁偏向有问题，应该重偏向给此时的线程（本来不到达 20 次时应该是不可偏向的轻量锁），例如此处会认为应该重偏向给 t3。

​	将循环次数改成 30 进行验证发现：t2 线程都是 101 偏向 t2 的锁。而 t3 线程：前19个是 101（偏向 t2）- 00（轻量锁）- 001（释放轻量锁的无锁状态），第20 个开始后面都是就是 101（偏向 t3） - 101（偏向 t3） - 101（偏向 t3），直到 30。

​		这就叫`批量重偏向`，20次开始后面`该类 new 的对象`拿锁时直接从原来的 t2 偏向 t3。（这个 20 次是 JVM 规定的）====> 这也算`锁的降级`。

​		沿用之前的 19 次加锁，如果在最后再 new User() ，查看对象头信息就会发现此时 User 的对象是可以偏向的 101（因为默认就是可以偏向的）。当 30 次时时，如果在最后再 new User() ，查看对象头信息就会发现此时 User 的对象也是可以偏向的 101（因为已经发生了批量重偏向，就会认为 User 的对象还是可以偏向的）。

3、如果再引入 t4 线程，还是从 list 中拿对象加锁：

```java
@SuppressWarnings("all")
public class TestEpoch {
    static Thread t3;
    static Thread t4;
    static int loopFlag = 40;
    public static void main(String[] args) throws InterruptedException {
        List<User> users = new ArrayList<>();

        new Thread(() -> {
            for (int i = 0; i < loopFlag; i++) {
                //注意这里每次都是 new 一个新的对象
                User user = new User();
                users.add(user);
                synchronized (user){
                    System.out.println(i);
                    System.out.println(ClassLayout.parseInstance(user).toPrintable());
                }
            }
            System.out.println("===============================================================");
            LockSupport.unpark(t3);
        }, "t2").start();

        t3 = new Thread(() -> {
            LockSupport.park();
            for (int i = 0; i < loopFlag; i++) {
                User user = users.get(i);
                System.out.println(ClassLayout.parseInstance(user).toPrintable());
                synchronized (user){
                    System.out.println(i);
                    System.out.println(ClassLayout.parseInstance(user).toPrintable());
                }
                System.out.println(ClassLayout.parseInstance(user).toPrintable());
            }
            System.out.println("===============================================================");
            LockSupport.unpark(t4);
        }, "t3");
        t3.start();

        t4 = new Thread(() -> {
            LockSupport.park();
            for (int i = 0; i < loopFlag; i++) {
                User user = users.get(i);
                System.out.println(ClassLayout.parseInstance(user).toPrintable());
                synchronized (user){
                    System.out.println(i);
                    System.out.println(ClassLayout.parseInstance(user).toPrintable());
                }
                System.out.println(ClassLayout.parseInstance(user).toPrintable());
            }
        }, "t4");
        t4.start();
        t4.join();
        System.out.println(ClassLayout.parseInstance(new User()).toPrintable());
    }
}
```

​		此时就会发现：

​	1）t2 线程全部都是 101 偏向锁。

​	2）t3 的前 19 次都是 101-00-001，第 20次之后都是 101-101-101（偏向 t3）。

​	3）t4 的前 19 次都是 001（从 list 拿出来的）-00-001，第 20 次开始是 101（偏向 t3）-00-001，第 40 次开始是 101- 00 - 001。

​	4）最后的那个 new User 对象头变成了 001 不可偏向的无锁。

> 注意，t4 的对象也是从 list 中拿出来的，状态是接着 t3 的。

​		再加一个 t4 时，前 20 次由于拿出来的 user 本身就是 001，不用进行偏向撤销，但第 20 次开始拿出的 user 是 101 偏向锁，由于当前线程 t3 ，而此时锁对象偏向 t2，因此又会进行偏向撤销，再次撤销 20 次后，JVM 认为这个对象设置的有问题，因为这个`类的对象撤销次数已经达到了 40 次` = 20 + 20，`此时就会将该类 new 出来的对象都永远设置为不可偏向`。（40次是 JVM 默认规定）

![](D:\NoteBook\核心笔记\多线程原理详解\image\JVM 底层锁撤销和重偏向说明.png)



​		具体的对象中的对象头信息在原来的`类中都有一份原件`，当锁的实例对象发生第 20 次撤销时，`类中的 epoch 值就会改变`，而实例对象中的 epoch 和类中的 epoch 不一样，则就认为过期了，此时就需要重偏向，将偏向变为当前线程。

# Wait 和 Notify

​		线程通信可以理解为`生产者消费者模式`问题，其主要函数就是 wait 等待 和 notify 唤醒方法，线程通信主要实现的方案有：管程法（设置数据缓冲区）、信号灯法（设置信号标志位）。

1）`wait()`：表示让当前线程等待，直到其他线程通知，与 sleep 不同，`wait 等待时会释放锁`。

2）`wait(long timeout)`：表示线程等待，但是指定等待的超时时间，单位毫秒数。

3）`notify()`：随机唤醒一个处于等待状态的线程。

4）`notifyAll()`：唤醒同一个对象上所有调用 wait() 方法的线程，优先级高的线程优先调度。

> 注意：这些方法都是 Object 类的方法，但是都只能在同步方法或是同步代码块中使用，否则会抛异常。

​		![](D:\NoteBook\核心笔记\多线程原理详解\image\ObjectMonitor 对象.png)

1、WaitSet 和 Blocked 队列的区别。

​	1）持有锁的线程发现条件不满足，调用 wait，即可进入 WaitSet 变为 WAITING 状态。而 BLOCKED 拿不到锁时调用 park() 方法阻塞后进入的等待队列。

​	2）两者都不占用 CPU 时间片， BLOCKED 线程会在当前持有锁的线程释放锁时`自动唤醒按顺序拿锁`，WAITING 线程会在持有锁的线程调用 notify 或 notifyAll 时唤醒，但唤醒后并不意味者立刻获得锁，而是进入EntryList 排队重新竞争。

2、二者和 sleep 的区别。

​	相同点：三者的线程状态相同，都会阻塞，`进入内核态`。

​	1）wait 是普遍对象的方法，任何对象都可以直接调用，但 sleep 是 Thread 的静态方法，通过 Thread.sleep() 调用。

​	2）wait 必须配合 synchronized 关键字一起使用，如果一个对象没有获取到锁直接调用 wait 会抛出异常，但 sleep 可以直接使用。

> 必须一起使用是因为如果没有 synchronized 关键字就没有 ObjectMonitor 对象，就没有 WaitSet 队列，因此调用时就会抛出异常。
>
> `注意`：只要调用了 wait ，就会产生 ObjectMonitor 对象，这个锁就会升级为重量锁。（调用 sleep 则并不会升级成重量锁）

​	3）wait 只能通过 notify（notifyAll） 主动唤醒、等待时间超时主动唤醒或是通过打断 interrupt ， 而 sleep 只能通过打断主动叫醒。

​	4）线程 wait 是会主动释放锁，但 sleep 在阻塞的阶段是不会释放锁。

`[案例分析]` 某公司 Boss 需要架构师 Jack 加班，加班的前提就是拿到钥匙（锁），但是 Jack 加班有个条件就是获得加班补贴，另外还有十个程序猿自愿加班。

​	分析：每个人（线程）加班都需要钥匙（锁 key），则每个人开始加班都需要拿到钥匙（锁）。

1）Jack 线程先拿到锁，if 判断是否拿到加班补贴（条件），条件没有则使用 sleep(5000) 等待，10个程序猿拿到锁加班完成，释放锁，同时老板在 5s 内准备好了加班补贴，Jack 就开始加班。此种情况下使用 sleep 并不会将锁释放，而且就算条件满足了也需要重复判断，将锁一直拿着会严重影响效率，如果 Boss 也需要锁，那么就算条件满足也无法满足 Jack 的条件，和之前的逻辑甚至是冲突。

2）抛弃使用 sleep ，使用 key.wait() 让 Jack 线程沉睡，此时就会将锁释放，让 Boss 或者其他线程拿到 key 完成任务，当 Boss 准备好了条件，再使用 key.notify() 将 Jack 线程唤醒执行，此时便没有问题，也不会影响效率。

3）如果还有一个 Rose 也被 Boss 要求加班，但是 Rose 的条件是一套 SKⅡ，此时再使用 wait 和 notify 就无法实现，因为 `notify 是随机唤醒一个 wait 的线程`，如果满足了 Jack 的条件确将 Rose 唤醒，那么 Rose 无法加班，反而 Jack 还会一直一直沉睡。

4）可以使用 `notifyAll 将所有 wait 的线程唤醒`，可以解决上面的问题，但是没满足条件的那个也会直接结束，如果 Boss 先满足 Jack 的需要，此时还没满足 Rose，但是 Rose 已经被唤醒不等待满足了，后面 Boss 再想满足也没办法了。

5）最终方案：使用 wait + notifyAll 的方案，但是将之前的 if 判断换为 while（类似于自旋），唤醒所有线程，但是不满足条件的线程会重新进入 wait。

```java
@SuppressWarnings("all")
public class TestSleep {
    static boolean isMoney = false; //判断女朋友是否分配
    static boolean isSKⅡ = false; //判断女朋友是否分配
    static Object key = new Object();   //钥匙

    public static void main(String[] args) throws InterruptedException {
        new Thread(() -> {
            synchronized (key) {    //拿到办公室的钥匙
                System.out.println("现在加班补贴准备好了吗？" + isMoney);
                while (!isMoney){
                    System.out.println("没有补贴，没有动力，不想加班");
                    try {
                        key.wait();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                System.out.println("老板叫醒我干啥？补贴到了？" + isMoney);
                if (isMoney){
                    System.out.println("有补贴了，加班写代码");
                }else{
                    System.out.println("没补贴，不加班了，下班回家");
                }
            }
        },"Jack").start();

        new Thread(() -> {
            synchronized (key) {    //拿到办公室的钥匙
                System.out.println("现在 SKⅡ 准备好了吗？" + isSKⅡ);
                while (!isSKⅡ){
                    System.out.println("没有 SKⅡ，没有动力，不想加班");
                    try {
                        key.wait();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                System.out.println("老板叫醒我干啥？isSKⅡ到了？" + isSKⅡ);
                if (isSKⅡ){
                    System.out.println("有 SKⅡ 了，加班写代码");
                }else{
                    System.out.println("没 SKⅡ，不加班了，下班回家");
                }
            }
        },"Rose").start();

        for (int i = 1; i <= 10; i++) {
            new Thread(() -> {
                synchronized (key) {
                    System.out.println("屌丝开始加班");
                }
            }, "屌丝" + i + "号").start();
        }

        Thread.sleep(1000);
        new Thread(() -> {
            synchronized (key) {
                isSKⅡ = true;
                System.out.println("带来一个 SKⅡ!");
                key.notifyAll();
            }
        }, "boss").start();
    }
}
```

> wait() 方法可以带 ms 参数，表示阻塞超时时间，时间到了就会自动唤醒，还可以使用 nanos 参数（纳秒）。
>
> ```java
> key.wait(5000);		// 超时时间 5000 ms
> key.wait(5000, 50);		// 超时时间 6000 ms! （很特别的设计）
> ```

# synchronized 关键字

​		本节主要说明 synchronized 关键字的使用和优化（锁清除 和 锁粗化）。

## synchronized 使用

`[理论]` Synchronized 同步的三种方式。`Java 里面所说的锁，锁的都是对象`。

1）Synchronized 位于方法上：Synchronized 锁的就是 this，也就是该类对象本身，或者说调用这个方法的对象。

2）Synchronized 位于代码块：Synchronized 位于代码块时如果指定 this，则效果和位于方法上相同，但是如果`指定锁某个具体对象`，那就完全不同。

3）Synchronized 还可以锁某个 `static` 修饰的类，则代表锁的是这个类的 Class 模板，并不是锁的具体对象。

`[问题]` Synchronized 锁的 8 个问题：`八锁现象`，详细描述 Synchronized 锁使用时的对象说明。

 问题一：标准情况下，修饰的都是方法，两个线程先打印发短信，还是打电话呢？

​		优先执行发短信，由于两个方法都是 synchronized 修饰的同步方法，但是锁的是方法的调用者，是同一个对象，因此共用一把锁。发短信方法拿到了锁，休眠了 4s，但是并没有释放锁，因此必须等到发短信线程释放锁。

```java
public class Test1 {
    public static void main(String[] args) {
        Phone phone = new Phone();
        
        new Thread(() -> {
            phone.send();
        }, "A").start();
        
        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        
        //问题1
        new Thread(() -> {
            phone.call();
        }, "B").start();
    }
}

class Phone {
    // synchronized 锁的对象是方法的调用者
    //两个方法用的是同一个锁，谁先拿到谁执行！
    public synchronized void send() {
        try {
            TimeUnit.SECONDS.sleep(4);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("发短信");
    }

    public synchronized void call() {
        System.out.println("打电话");
    }
    
     
}
```

问题三：hello 普通方法，两个线程先打印发短信 还是先说 Hello world  1、发短信 2、Hello world；========> Hello world √

​		发短信方法拿到了锁，休眠了，但是 hello 方法并没有 synchronized 修饰，并不是同步方法，不受锁的影响。

问题四：有两个对象，类里面两个方法都是同步方法，先 发短信？还是 打电话？ ======> 打电话 √

​		两个对象，synchronized 锁住的是不同的调用者，互相不受影响，打电话只休眠 1s，发短信休眠 4s。

```java
public class Test2 {
    public static void main(String[] args) {
        //两个对象,两个调用者，两把锁
        Phone2 phone1 = new Phone2();
        Phone2 phone2 = new Phone2();
        //锁的问题
        new Thread(() -> {
            phone1.send();
        }, "A").start();
        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        new Thread(() -> {
            phone2.call();
        }, "B").start();
        
        new Thread(() -> {
            phone2.hello();
        }, "C").start();
    }
}

class Phone2 {
    //synchronized 锁的对象是方法的调用者
    public synchronized void send() {
        try {
            TimeUnit.SECONDS.sleep(4);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("发短信");
    }
    
    //这里没有锁！不是同步方法，不受锁的影响
    public void hello() {
        System.out.println("Hello World");
    }

    public synchronized void call() {
        System.out.println("打电话");
    }
}
```

问题五：两个静态的同步方法，只有一个对象 先打印 发短信 打电话 =======> 发短信

​		两个静态方法，在类加载的时候就有了，因此两个 同步方法 锁的都是 Class 模板，并不是具体的对象。

问题六：两个对象，两个静态的同步方法，先打印 发短信 打电话 =======> 发短信

​		两个静态方法，在类加载的时候就有了，虽然是两个对象，但是他们的 Class 模板是一个，因此发短信拿到了锁就会先执行。

```java
public class Test3 {
    public static void main(String[] args) {
        //两个对象的class类模板只有一个 static 锁的是class
        Phone3 phone1 = new Phone3();
        Phone3 phone2 = new Phone3();
        //锁的问题
        new Thread(() -> {
            phone1.send();
        }, "A").start();
        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        new Thread(() -> {
            phone2.call();
        }, "B").start();
    }
}

class Phone3 {
    //synchronized 锁的对象是方法的调用者
    //static静态方法
    //类一加载就有了！class模板
    public static synchronized void send() {
        try {
            TimeUnit.SECONDS.sleep(4);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("发短信");
    }

    public static synchronized void call() {
        System.out.println("打电话");
    }
}
```

问题七：1个静态的同步方法，1个普通的同步方法，一个对象，先打印 ？发短信 ？======> 打电话

​		因为这两个同步方法拿到的锁不是同一个，静态方法拿到 Class模板 的锁，而普通方法拿到的是 对象 的锁。

问题八：1个静态的同步方法，1个普通的同步方法，二个对象，先打印 发短信 ======> 打电话

​		因为这两个同步方法拿到的锁不是同一个，静态方法拿到 Class模板 的锁（注意虽然是两个对象，但是此处拿到的仍然是 Class模板 的锁），而普通方法拿到的是 对象 的锁。

```java
public class Test4 {
    public static void main(String[] args) {
        //两个对象的class类模板只有一个 static 锁的是class
        Phone4 phone1 = new Phone4();
        Phone4 phone2 = new Phone4();
        //锁的问题
        new Thread(() -> {
            phone1.send();
        }, "A").start();
        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        new Thread(() -> {
            phone2.call();
        }, "B").start();
    }
}

class Phone4 {
    //静态同步方法 锁的是class类模板
    public static synchronized void send() {
        try {
            TimeUnit.SECONDS.sleep(4);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("发短信");
    }

    //普通的同步方法 锁的调用者
    public synchronized void call() {
        System.out.println("打电话");
    }
}
```

​		因此，根据上面的八个问题可知，使用 new 出来的对象，调用方法，锁的是 对象，但是使用 static 修饰时，锁的是 Class 唯一的模板。(每个类只有一个 Class 类)。

## synchronized 优化

> 可以使用 JMH 进行代码运行效率，JMH 测试时间更加精准，会有预热，同时使用多轮运行测试。

​	1、`锁消除`：如果锁对象是一个方法内初始化出来的局部变量，则每次该方法运行都是对不同的对象加锁，Jit （即时编译器）就会认为此处不需要加锁，就会将这里的锁在编译时去掉，就不会影响代码的性能。而如果这个锁对象是一个全局变量，则  synchronized 关键字就会影响代码的性能。（ `synchronized 的优化`）

```java
public void b(){
    Object o = new Object();
    synchronized (o){
        i++;
    }
}
```

​	2、start（）只是表示该线程能够被调度，但并不一定能够马上调度到，具体调度是看 CPU。

​	3、如果两个线程锁的是不同的东西（static 锁的是 Class 类模板，写在方法上锁的是 this 当前类的实例，指定具体对象则锁的该对象），则相互无关，多个线程都是正常执行。如果 synchronized 关键字位于 static 内部，则不能锁 this ，可以锁 static 对象或是当前类的 Class 模板。

​	4、synchronized 锁的不是对象的引用，而是`锁的堆中具体的对象`，当该引用变成另一个对象时，就相当于锁的是另一个对象。

​	5、不要以字符串作为锁定的对象：`字符串内容相同的两个引用在常量池中对应的是同一个对象`。

​	6、对于一个容器，写入方法需要加同步，但是读取方法则需要根据项目需要来确定（允许脏读？），不允许脏读则读取方法也需要加锁。例如存钱需要 2s，则此时还没存入的时候有人查询发现没钱，这就是脏读现象。====> `读方法要不要加同步需要根据实际情况判断`

​	7、synchronized 是支持锁的重入的，同时子类调用父类方法也是可以支持重入的（父类和子类锁 this 时认为是同一个对象，因此是重入）。

​	8、synchronized 内部发生异常时如果 catch 捕获则不会释放锁，如果没有 catch 捕获则程序的Java层面的汇编会调用goto指令跳转调用 monitorexit 指令。

`[问题]` 下面这个案例 t1 线程能够停止吗？为什么？（网上都是确定为`可见性问题`，但实际上有缓存一致性，这种说法是有问题的）

```java
public class Test03 {
    boolean running = true;

    public void test(){
        System.out.println("test start ...");
        while (running){
            
        }
        System.out.println("test end ...");
    }

    public static void main(String[] args) {
        Test03 demo = new Test03();
        new Thread(demo :: test,"t1").start();
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        demo.running = false;
    }
}
```

​	但是在 while 循环里，里面随便加一行语句，t1 就能停止（说明不是可见性问题，也不是刷新主存的问题）。此问题实际上是 happenBefore 优化：JVM 认为 while 循环里面什么都没有，就会优化代码：定义局部变量接收全局变量 running，使用 局部变量来判断循环停止，而如果里面存在代码，JVM 则不会进行优化。

`[总结]` Java 并不存在可见性问题。解决办法之一是加 `volatile` 关键字禁止指令重排，但没办法解决原子性，因此无法替代 synchronized 。

`[问题]` AtomicXXX 类的连续调用能否构成原子性呢？ ===> 不能，因为单条 AtomicXXX 类的操作是原子性，但是多条 AtomicXXX `操作之间`就不是原子性。

​		多条 AtomicXXX 操作之间并不是同步，CPU 还是可能会将时间片给其他线程操作， AtomicXXX 类只能保证`单条 CAS 操作是原子性`。

`[面试题]` 实现一个容器，提供两个方法：add 和 size。写两个线程，线程1添加10个元素到容器中，线程2实现监控元素的个数，个数到5时，线程2提示并结束。

​	分析：使用 synchronized  对两个方法加锁，先启动 t2 线程 wait 释放锁，再启动 t1 到 5 时 notify 唤醒 t2，但是 add 循环没结束并不会释放锁，size 方法需要等待循环结束才能拿到锁。因此考虑使用两个 wait 和 notify 相互唤醒，当 add 5 时，wait t1，t2 就能拿到锁，执行完毕再唤醒 t1。

```java
public class Test03 {
    volatile List<Object> lists = new ArrayList();
    public void add(Object o) {
        lists.add(o);
    }
    public int size() {
        return lists.size();
    }
    public static void main(String[] args) {
        Test03 c = new Test03();
        Object lock = new Object();
        new Thread(() -> {
            synchronized (lock) {
                System.out.println("t2启动");
                if (c.size() != 5) {
                    try {
                        lock.wait();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                System.out.println("t2 结束");
                lock.notify();
            }
        }, " t2").start();

        new Thread(() -> {
            System.out.println("t1 启动");
            synchronized (lock) {
                for (int i = 0; i < 10; i++) {
                    c.add(new Object());
                    System.out.println("add " + i);
                    if (c.size() == 5) {
                        lock.notify();
                        try {
                            lock.wait();//要释放锁，T2才能得到锁得以执行
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                    try {
                        TimeUnit.SECONDS.sleep(1);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        }, "t1").start();
    }
}
```

​	优化：使用 `CountDownLatch` 的 await 和 countdown 方法替代 wait 和 notify 方法，CountDownLatch 不涉及锁定，当 count 的值为零时 await 的线程继续运行，相当于是`发令枪`，运动员线程调用 await 等待，计数到0开始运行，当不涉及同步，只是涉及线程通信的时候，用 synchronized 加 wait，notify 就显得太重。

`[面试题]` 三个线程循环打印 a b c 顺序，打印三次。

1）使用 join 使 t2 先打印a，再 t1 后打印 b。

2）使用 synchronized + wait + notify 使 t2 先打印a，再 t1 后打印 b。

```java
public class Test05 {
    static final Object lock = new Object();
    static boolean flag = false;

    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            synchronized (lock) {
                while (!flag){
                    try {
                        lock.wait();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                System.out.print("b");
            }
        }, "t1");

        Thread t2 = new Thread(() -> {
            synchronized (lock) {
                System.out.print("a");
                flag = true;
                lock.notify();
            }
        }, "t2");
        t1.start();
        t2.start();
    }
}
```

​	t1 先执行打印则会 wait 等待 t2 执行打印 a，修改 flag 再重新获取到 flag 进而打印 b。

3）使用 LockSupport 的 park + unpark 使 t2 先打印a，再 t1 后打印 b。

```java
public class Test06 {
    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            LockSupport.park();
            System.out.println("b");
        }, "t1");
        t1.start();
        new Thread(() -> {
            System.out.println("a");
            LockSupport.unpark(t1);
        }, "t2").start();
    }
}
```

4）题目要求：使用条件实现题目中的描述问题。

```java
public class Test07 {
    public static void main(String[] args) {
        WaitNotify waitNotify = new WaitNotify();
        new Thread(() -> {
            try {
                waitNotify.print("a", 1, 2);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }, "t1").start();

        new Thread(() -> {
            try {
                waitNotify.print("b", 2, 3);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }, "t2").start();

        new Thread(() -> {
            try {
                waitNotify.print("c", 3, 1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }, "t3").start();
    }

    static class WaitNotify{
        int flag = 1; //当前应该打印的线程标识
        /**
         * 每次进来的线程会判断是不是正确的顺序线程，以此打印对应的符号
         * @param content 待打印内容
         * @param waitFlag 当前等待的标志
         * @param nextFlag 下一个应该打印的线程标志
         * @throws InterruptedException
         */
        public void print(String content,int waitFlag,int nextFlag) throws InterruptedException {
            for (int i = 0; i <4 ; i++) {
                synchronized (this){
                    while (flag!= waitFlag){
                        //不成立的则 wait
                        this.wait();
                    }
                    System.out.print(content);
                    flag= nextFlag;
                    this.notifyAll();
                }
                if(waitFlag==3){    //打印格式
                    System.out.println();
                }
            }
        }
    }
}
```

# 保护性暂停模式

​	当某个结果需要在多线程之间传递，则可以将这些线程关联到一个对象 `GuardedObject`。（`Join 和 Future 的原理`）

1、创建一个 GuardedObject 对象，提供设置值和获取值的操作，而这个 Object response 就代表在线程之间传递的数据。

```java
public class GuardedObject {
    private Object response;
    Object lock = new Object();
    public Object getResponse(){	//获取值
        synchronized (lock) {
            System.out.println("主线程 获取 response 如果为 null 则 wait");
            while (response == null) {
                try {
                    lock.wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
        return response;
    }

    public void setResponse(Object response) {	//设置值
        synchronized (lock) {
            this.response = response;
            lock.notifyAll();
        }
    }
}
```

2、设置模拟数据库的操作：

```java
public class Operate {
    public static String dbOprate(){
        try {
            TimeUnit.SECONDS.sleep(4);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return "result";
    }
}
```

3、测试主线程和线程 t1 之间的值传递：

```java
public class TestGuarded {
    public static void main(String[] args) {
        GuardedObject guardedObject = new GuardedObject();

        new Thread(() -> {
            String result = Operate.dbOprate();
            System.out.println("t1 设置值完成!");
            guardedObject.setResponse(result);
        },"t1").start();

        System.out.println("主线程等待（wait）t1 set");
        //有没有实现超时？
        Object response = guardedObject.getResponse();
        System.out.println("获取返回结果：" + response);
    }
}
```

4、此时 main 线程需要等待 t1 执行完设置值才能继续拿取值，能不能像 join 一样设置一种 `超时机制` 呢，如果超时 main 线程就不等待获取值。那么此时就是对get 方法设置一个等待时间。

​	1）初始方案，此种方案虽然能够实现超时，但是如果等待过程被其他线程 notifyAll() 唤醒，则还没到超时时间就会停止 getResponse 方法，不合理。

```java
public Object getResponse(long millis){
    synchronized (lock) {
        System.out.println("主线程 获取 response 如果为null则wait");
        while (response == null) {
            try {
                lock.wait(millis);  //如果不 break 则超时后还是会进入循环继续 wait
                break;
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
    return response;
}
```

​	2）因此需要在被打断时判断是否到了等待时间，如果没有到则还需要进入循环重新 wait。

```java
public class GuardedObjectTimeOut {
    private Object response;
    Object lock = new Object();

    public Object getResponse(long millis){//获取值
        synchronized (lock) {
            long begin = System.currentTimeMillis();    //开始时间
            long timePassed = 0;    //经历时间
            System.out.println("主线程 获取 response 如果为null则 wait");
            while (response == null) {
                long waitTime = millis - timePassed;    //还应该 wait 的时间
                System.out.println("main 判断如果没有结果则 wait [" + waitTime + "] ms");
                if (waitTime <= 0){ //说明已经到了超时时间
                    System.out.println("时间超时，不再获取数据");
                    break;
                }
                try {
                    lock.wait(waitTime);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                //如果被提前唤醒，则需要记录当前已经 wait 的时间：timePassed
                timePassed = System.currentTimeMillis() - begin;
                System.out.println("此次被唤醒，已经 wait " + timePassed + " ms");
            }
        }
        return response;
    }

    public void setResponse(Object response) {//设置值
        synchronized (lock) {
            this.response = response;
            lock.notifyAll();
        }
    }
}
```

​		此种方法就是参考 join 的超时设置的源码来实现的。

# 死锁问题

​		死锁问题：让一个线程同时获取多把锁时就可能会产生死锁。

`死锁 `产生的必要条件为四个条件，而避免死锁方法就是破解其中一个条件。

1）互斥条件：一个资源只能被一个进程使用。

2）请求与保持条件：一个进程因请求资源而阻塞时，对已获得的资源保持不放（阻塞时不释放锁 sleep）。

3）不剥夺条件：进程已获得的资源，在末使用完之前，不能强行剥夺。

4）循环等待条件：若干进程之间形成一种头尾相接的循环等待资源关系。

```java
public class LockTest {
    //定义两把锁对象
    static Object x = new Object();
    static Object y = new Object();
    public static void main(String[] args) {
        new Thread(()->{
            //获取x的锁
            synchronized (x){
                log.debug("locked x");
                try {
                    TimeUnit.SECONDS.sleep(1);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                //未释放 x 的锁时就想获取 y 的锁
                synchronized (y){
                    log.debug("locked x");
                    log.debug("t1---------");
                }
            }

        },"t1").start();

        new Thread(()->{
            synchronized (y){
                log.debug("locked y");
                try {
                    TimeUnit.SECONDS.sleep(2);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                synchronized (x){
                    log.debug("locked x");
                    log.debug("t2---------");
                }
            }
        },"t2").start();
    }
}
```

​		此处就可以将请求另一个锁的代码放到已有锁的外面，则要拿到下一个锁必须释放现在的锁，便不会形成死锁。

> `活锁`：互相谦让`锁`，在相反的方向修改同一个对象，实质是没有锁。
>
> 例如 count ，一个增加 1，一个 减1，那么可能就会产生活锁，虽然没有定义锁，但是代码会一直不停止。

`[问题]` 死锁问题的排查。

1）使用 jps - l 定位进程号：

![在这里插入图片描述](https://img-blog.csdnimg.cn/e3e9bbb1b7b041d0bf035021a62a01ba.png)

2、使用 jstack + 进程号找到死锁问题的出现位置。

![在这里插入图片描述](https://img-blog.csdnimg.cn/b452b179c5fa4af48e28081aec58d61a.png)

问题排查方式：日志 和 堆栈信息。

# ReentrantLock 锁

​		程序员常说的 `JUC` 就是 `java.util .concurrent` 工具包的简称，这是一个处理线程的工具包，since JDK1.5 开始出现，主要包括 `java.util .concurrent. atomic` 和 `java.util .concurrent.locks` 两个包。起源于 Doug Lea 认为 synchronized 效率过低，因此引入 `显式同步锁对象 Lock` 来实现线程同步，since 1.5 版本被收录进 JDK，代表就是 `ReentrantLock 可重入锁`。

ReentrantLock 使用方法：

```java
ReentrantLock lock = new ReentrantLock();	//定义锁对象
lock.lock(); 	// 加锁
try{
    //临界区代码
} finally {
    lock.unlock();	//解锁
}
```

> 为避免发生不明异常导致锁没有释放，因此使用 ReentrantLock 一般都会将临界区代码写在 try- finally 控制块。（synchronized 遇到异常自动释放）

ReentrantLock 主要特点有：（一般说 Lock 对象就是指 ReentrantLock 可重入锁）

​	1）可打断（synchronized 不能打断），支持重入。

```java
lock.lockInterruptibly();	//此方法加锁过程才能够被打断，lock.lock 加锁过程不可被打断
t1.interrupt();		//打断 t1 加锁过程
```

> 打断后是由异常进行响应的，如果不手动设置获取锁就不会继续获取锁。
>
> 唤醒后则会从 WaitSet 进入 AQS 队列（类似于 synchronized 中的 EntryList ） 一定会试图去获取锁。

​	2）可以设置超时时间，可以设置为公平锁和非公平锁。（synchronized 为非公平锁，且不可以设置超时时间）。

```java
lock.tryLock(2, TimeUnit.SECONDS)		//此方法获取锁可以设置拿锁的超时时间，超时时间到了没拿到锁就直接取消拿锁，不设置参数则只尝试一次拿锁。
```

​	3）支持设置条件等待队列：线程条件不满足时 wait 后进入对应条件的 WaitSet 中。（synchronized 放到统一的 WaitSet 中）

`[案例]` Jack 和 Rose 的获取锁的条件不同的案例再现更新版：使用 ReentrantLock 设置多条件等待队列。

```java
public class Test04 {
    static final ReentrantLock lock = new ReentrantLock();
    static boolean isSKⅡ = false;
    static boolean isMoney = false;
    static Condition waitForMoney = lock.newCondition();
    static Condition waitForSKⅡ = lock.newCondition();

    public static void main(String[] args) throws InterruptedException {
        new Thread(() -> {
            try {
                lock.lock();
                System.out.println("询问有没有加班补贴:" + isMoney);
                while (!isMoney) {
                    System.out.println("没有加班补贴，去补贴等待室休息");
                    try {
                        waitForMoney.await();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                System.out.println("加班补贴来了，良心企业啊! 拿到钥匙进去加班");
            }finally {
                lock.unlock();
            }
        }, "Jack").start();

        new Thread(() -> {
            try {
                lock.lock();
                System.out.println("询问有没有 SKⅡ:" + isSKⅡ);
                while (!isSKⅡ) {
                    System.out.println("没有 SKⅡ，去 SKⅡ等待室休息");
                    try {
                        waitForSKⅡ.await();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                System.out.println(" SKⅡ来了，良心企业啊! 拿到钥匙进去加班");
            }finally {
                lock.unlock();
            }
        }, "Rose").start();

        Thread.sleep(1000);
        new Thread(() -> {
            try {
                lock.lock();
                isMoney = true;
                System.out.println("Boss 送来了加班补贴!");
                waitForMoney.signal();  //随机叫醒 waitForMoney 队列一个线程

                isSKⅡ = true;
                System.out.println("Boss 送来了 SKⅡ!");
                waitForSKⅡ.signal();    ////随机叫醒 waitForSKⅡ 队列一个线程
            }finally {
                lock.unlock();
            }
        }, "boss").start();
    }
}
```

> 实质就是有`多个 WaitSet 等待队列`，使用 signal 将指定 WaitSet 的队列中的线程随机唤醒一个，signalAll 唤醒该队列的所有线程。

`[案例]` 实现顺序打印的 ReentrantLock 版本。

```java
public class Test08 {
    static ReentrantLock lock = new ReentrantLock();
    static Condition conditionA = lock.newCondition();
    static Condition conditionB = lock.newCondition();
    static Condition conditionC = lock.newCondition();
    static int flag = 0;
    static int printLoop = 10;
    public static void main(String[] args) {
        new Thread(() -> {
            lock.lock();
            try {
                for (int i = 0; i < printLoop; i++) {
                    while(flag % 3 != 0){
                        //flag=1，2 时 conditionA
                        conditionA.await();
                    }
                    //flag = 0,3 时打印 A
                    flag++;
                    System.out.print("A");
                    conditionB.signal();    //唤醒 B
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }finally {
                lock.unlock();
            }
        }, "t1").start();

        new Thread(() -> {
            lock.lock();
            try {
                for (int i = 0; i < printLoop; i++) {
                    while(flag % 3 != 1){
                        //flag=2，3 时 conditionB
                        conditionB.await();
                    }
                    //flag=1 时打印
                    flag++;
                    System.out.print("B");
                    conditionC.signal();
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }finally {
                lock.unlock();
            }
        }, "t2").start();

        new Thread(() -> {
            lock.lock();
            try {
                for (int i = 0; i < printLoop; i++) {
                    while(flag % 3 != 2){   //flag=2，3 时 conditionB
                        conditionC.await();
                    }
                    flag++;
                    System.out.print("C");
                    conditionA.signal();
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }finally {
                lock.unlock();
            }
        }, "t3").start();
    }
}
```

# AQS 框架

​		AQS 全称是 `AbstractQueuedSynchronizer` 抽象队列同步器，是一个阻塞式锁的相关的同步器工具的`框架`。

​	1）AQS 使用变量 `volatile state` 属性来表示锁的状态，子类实现使用 `getState` 和  `compareAndSetState（CAS）` 来改变这个状态变量 state。

```java
private volatile int state;
```

​	2）支持独占锁（ReentrantLock）和 共享锁（ReentrantReadWriteLock）。

> 独占锁：只有一个持有锁的线程能够访问资源。
>
> 共享锁：可以允许多个线程同时持有锁访问资源。

​	3）AQS 内部维护了一个等待队列，类似于 synchronized 关键字中的 MonitorObject 对象 的 EntryList 队列。（AQS属性 head 和 tail 构成双向链表）。

```java
private transient volatile Node head;
private transient volatile Node tail;
```

​	4）条件变量来实现等待、唤醒机制，支持多个条件变量，类似于 MonitorObject 的 WaitSet 队列。

​	5）AQS 的父类 AbstractOwnableSynchronizer 内部维护了变量  `Thread exclusiveOwnerThread` 用来记录当前持有锁的线程。

```java
private transient Thread exclusiveOwnerThread;
protected final void setExclusiveOwnerThread(Thread thread) {
    exclusiveOwnerThread = thread;
}
protected final Thread getExclusiveOwnerThread() {
    return exclusiveOwnerThread;
}
```

基于这些定义，可以利用 AQS 框架实现：

1）实现`阻塞获取锁 acquire`，拿不到锁就阻塞（睡眠），等待锁被释放。

2）实现`非阻塞尝试获取锁 tryAcquire`，拿不到锁也不会阻塞，而是会直接放弃获取锁。

3）实现获取锁`超时机制` tryAcquire(timeout, timeUnit)，超时直接放弃获取锁。

4）实现通过`打断`来取消获取锁，但需要使用 lock.lockInterruptibly() 加锁。

5）实现独占锁和共享锁，实现条件不满足的时候等待，同时支持多个条件队列。

实现自定义的 AQS 框架：（`ReentrantLock 就是基于这个框架，只不过 ReentrantLock 使用了两个 AQS：公平锁和非公平锁`）

​	1）AQS 框架实现：extends AbstractQueuedSynchronizer

```java
//定义一个同步器，这是一个工具，是为锁 MyLock 服务的
public class MyAQS extends AbstractQueuedSynchronizer {
    /**
     * 父类有 acquire 方法用于实现阻塞式获取锁（已经实现不需要重写），但是父类的 tryAcquire 方法并没有实现具体的逻辑，需要自己实现。
     * @param arg 用于重入，此处暂时不考虑重入的情况。
     * @return 加锁的结果
     */
    @Override
    protected boolean tryAcquire(int arg) {
        if (super.getState() == 0){
            //没有锁则拿到锁，调用父类的 CAS 操作
            boolean updateFlag = super.compareAndSetState(0, 1);
            if (updateFlag) {
                //修改 AQS 中当前持有锁的线程的记录
                super.setExclusiveOwnerThread(Thread.currentThread());
                return true;
            }
        }
        return false;
    }

    //主要实现释放锁，实际释放是 release 方法
    @Override
    protected boolean tryRelease(int arg) {
        if (super.getState() == 0) throw new IllegalMonitorStateException("当前没有线程持有此锁");
        super.setState(0);
        super.setExclusiveOwnerThread(null);
        return true;
    }

    //判断这个锁有没有被人持有,state > 0 就表示锁被持有
    @Override
    protected boolean isHeldExclusively() {
        return !(super.getState() == 0);
    }

    //条件支持
    public Condition newCondition(){
        return new ConditionObject();
    }
}
```

​	2）使用定义好的 AQS 框架，构建自己的锁，继承 Lock 。

```java
//自定义的 AQS 实现的锁，继承 Lock 即可
public class MyLock implements Lock {
    MyAQS myAQS = new MyAQS();

    // 阻塞式加锁
    @Override
    public void lock() {
        myAQS.acquire(1);
    }

    // 非阻塞式加锁
    @Override
    public boolean tryLock() {
        return myAQS.tryAcquire(1);
    }
    
    // 释放锁调用 release 方法
    @Override
    public void unlock() {
        myAQS.release(1);
    }
	
    //...... 其他需要重写的方法 ......
    
    public static void main(String[] args) throws InterruptedException {
        MyLock myLock = new MyLock();
        Thread t1 = new Thread(() -> {
            myLock.lock();
            System.out.println("t1 线程");
            myLock.unlock();
        },"t1");
        t1.start();

        myLock.lock();
        System.out.println("main 线程");
        TimeUnit.SECONDS.sleep(2);
        myLock.unlock();
    }
}
```

​		和此处的 myLock 类似，ReentrantLock 是基于 Sync 类实现的，而 `Sync extends AbstractQueuedSynchronizer` 就是基于 AQS 实现的。

`[分析]`  分析 ReentrantLock 独占锁。

1、非公平锁的加锁流程：见 ”公平锁和非公平锁“ 章分析。

2、公平锁的加锁流程：见 ”公平锁和非公平锁“ 章分析。

`[附加问题分析]`  分析 AQS 队列中的线程唤醒。

​		上面的 ReentrantLock 分析还存在一个遗留问题：公平锁和非公平锁最后拿锁操作都是调用 `acquireQueued` 方法。（重点分析）

```java
final boolean acquireQueued(final Node node, int arg) {
    boolean failed = true;
    try {
        boolean interrupted = false;
        for (;;) {
            // p 表示获取 AQS 队列中当前线程的前一个 Node 线程
            final Node p = node.predecessor();
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return interrupted;
            }
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
```

​	此时就会发现，当后面的线程（第二个拿不到锁的线程）进入队列判断发现 p != head，就会准备调用 `shouldParkAfterFailedAcquire` 表示加锁失败之后是否应该进入睡眠，按理论应该是需要 park 的，为什么没有直接 park 呢？ReentrantLock 的 AQS 队列的一个设计原则就有当前线程进入睡眠时，需不需要唤醒下一个线程的原则，当前线程进入队列时肯定是位于最后，那么肯定就不需要唤醒下一个线程，但是当前线程肯定就应该在沉睡前告诉当前线程的前一个线程上需要唤醒当前线程，如何实现呢? =====> `修改上一个线程的唤醒标志位` 用来表示上一个线程需要唤醒下一个线程操作。

​	那么这个标志位实际就是每个线程 Node 节点都有的 `waitStatus` 。因此每个线程 Node 实际主要的属性包括：

```java
//唤醒标识，默认为 0 表示不需要唤醒（当后面一个线程未修改前一个节点的 waitStatus 就会使用默认的 0，表示是最后一个节点不需要唤醒下一个节点）
volatile int waitStatus;
volatile Node prev;	//前一个节点
volatile Node next;	//后一个节点
volatile Thread thread;	//此节点的线程
```

​		那么 shouldParkAfterFailedAcquire 的具体逻辑就应该是`第一次进来时修改上一个节点的 waitStatus 标志位`，然后返回 acquireQueued 由于循环再次尝试获取锁（自旋）再次失败，再次调用 shouldParkAfterFailedAcquire 返回 false，进而返回调用 parkAndCheckInterrupt 方法进行 park。

```java
private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
        int ws = pred.waitStatus;	//获取上一个节点的 waitStatus 此时为 0
        if (ws == Node.SIGNAL)	// 判断 waitStatus == -1 ？不成立
            return true;
        if (ws > 0) {	//不会大于0
            do {
                node.prev = pred = pred.prev;
            } while (pred.waitStatus > 0);
            pred.next = node;
        } else { 
            // 等于 0 的情况，此时就将 pred 的 ws 改成 -1（表示需要唤醒下一个节点）
            compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
        }
        return false;
    }
```

​		非公平锁的拿不到锁的整个 park 过程进行了多次自旋就是为了尽量避免 park 进入内核态，影响效率。

`[附加问题分析]`  分析 interrupted 有什么用呢？每个线程都会都一个标记表示打断状态，默认为 false，被打断后就会变成 true 状态。

```java
// acquireQueued 方法定义 interrupted
boolean interrupted = false;
```

1）当加锁使用 lock 时，在打断之后，内部将打断标记 interrupted 改为 false 清除掉，`然后什么都没有做`，再次判断能否加锁，不能加锁就再次 park。（这样就营造了假象：用户看着似乎 lock 并没有打断，实际是打断后重新 park）

```java
if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
    interrupted = true;
```

2）当加锁使用 lockInterruptibly 时，在打断之后将响应了一个异常：InterruptedException，并会清除打断标记。

```java
if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
    throw new InterruptedException();
```

3）使用 sleep、park、join 进入阻塞状态，此时也可以使用 t.interrupt() 来打断某个线程。

```java
// 判断当前线程的打断标记
t1.isInterrupted()
```

​		为什么 sleep 、park、join 的线程被打断后会清除打断标记呢？

​		因为正常线程调用 interrupt 是不能被打断的，实际上只是修改一下打断标记，并`没有对打断进行响应`，具体的逻辑可以根据打断标记来判断进行业务处理，最后也是需要清除打断标记。而 `sleep、park、join 的线程能够响应这个打断`，因此响应完后就应该清除打断标记回到最初状态。

`[附加问题分析]`  条件变量原理分析 await 方法 和 signal 方法。

1）await 方法源码：就是创建一个新的队列将当前线程封装 Node 放到队列中，因此可以有多个条件。

```java
public final void await() throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    Node node = addConditionWaiter();	//创建一个新的队列 ConditionObject
    int savedState = fullyRelease(node);
    int interruptMode = 0;
    while (!isOnSyncQueue(node)) {
        LockSupport.park(this);
        if ((interruptMode = checkInterruptWhileWaiting(node)) != 0)
            break;
    }
    if (acquireQueued(node, savedState) && interruptMode != THROW_IE)
        interruptMode = REINTERRUPT;
    if (node.nextWaiter != null) // clean up if cancelled
        unlinkCancelledWaiters();
    if (interruptMode != 0)
        reportInterruptAfterWait(interruptMode);
}
```

​		而这个 ConditionObject 对象就是一个新的队列，主要属性：

```java
private transient Node firstWaiter;
private transient Node lastWaiter;
```

2）signal 方法源码：主要就是将 WaitSet 中的线程转移到 AQS 队列，准备加锁。

```java
public final void signal() {
    if (!isHeldExclusively())
        throw new IllegalMonitorStateException();
    Node first = firstWaiter;	//拿到第一个 waiter
    if (first != null)
        doSignal(first);
}

private void doSignal(Node first) {
    do {
        if ( (firstWaiter = first.nextWaiter) == null)
            lastWaiter = null;
        first.nextWaiter = null;
        //transferForSignal 就是将这个 firstWaiter 转移到等待队列 AQS
    } while (!transferForSignal(first) &&  (first = firstWaiter) != null);
}
```

3、分析 ReentrantLock 独占锁的解锁流程：t1 持有锁，t2 当前在 park，然后 t1 释放锁，唤醒 t2。

```java
public final boolean release(int arg) {
    if (tryRelease(arg)) {	//当 tryRelease 返回 true 时就说明解锁了
        Node h = head;		// 获取 AQS 的 head
        if (h != null && h.waitStatus != 0)	//此时 h 不为0，ws 为 -1
            unparkSuccessor(h);	//ws ！= 0 就说明要唤醒下一个线程
        return true;
    }
    return false;
}

protected final boolean tryRelease(int releases) {
    int c = getState() - releases;	//拿到当前锁状态的 state，解锁一次就减1
    if (Thread.currentThread() != getExclusiveOwnerThread()) 	//判断当前线程是不是持有锁的线程，一般不会发生解锁线程不是持有锁的线程
        throw new IllegalMonitorStateException();
    boolean free = false;
    if (c == 0) {	// 重入的时候这个 c ！= 0
        free = true;
        setExclusiveOwnerThread(null);	//将当前持有锁线程的变量置为 null
    }
    setState(c); //设置 state 状态，没有重入就是设置为 0
    return free;
}

private void unparkSuccessor(Node node) {
    int ws = node.waitStatus;	//传入的 AQS 的 head
    if (ws < 0)	//此时 head.ws = -1
        compareAndSetWaitStatus(node, ws, 0);	// CAS 操作将 head 里面的 ws 改回 0，防止此时其他线程又让 head 唤醒一次
    Node s = node.next;	// 拿到head的下一个线程（待唤醒的线程）
    if (s == null || s.waitStatus > 0) {	//此时 s ！= null，判断 s.ws = 0，if语句块不进
        // 什么情况为 null 呢？就是被打断时或是被取消了
        s = null;
        for (Node t = tail; t != null && t != node; t = t.prev)
            if (t.waitStatus <= 0)
                s = t;
    }
    if (s != null)	//s ！=null 成立，执行唤醒s.next 也就是 head 的后一个节点（当前有效的第一个线程）
        LockSupport.unpark(s.thread);
}
```

> 重入加锁几次就需要解锁几次，每次 unlock 只会释放一次，给 state - 1。

​		此时 t2 就被唤醒，在原来 park 的位置往下执行，再次尝试加锁 tryAcquire，加锁成功（设置相关信息），此时就将 head 设置为当前唤醒节点，把当前节点里面的 thread = null，当前节点的 prev 上一个节点置空，再将原来的 head 的 next 也置空，这样此时原来的 head 空节点就彻底从 AQS 队列出去，让 GC 回收。

```java
final boolean acquireQueued(final Node node, int arg) {
    boolean failed = true;	// failed 不用考虑（极端情况）
    try {
        boolean interrupted = false;
        for (;;) {
            final Node p = node.predecessor();
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return interrupted;
            }
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}

private void setHead(Node node) {
    head = node;
    node.thread = null;
    node.prev = null;
}
```

此时的 head 就是原来的 head 的下一个节点，原来的 head 等待 GC 回收，因此 `AQS 队列的 head 始终是一个空节点`。

![](D:\NoteBook\核心笔记\多线程原理详解\image\AQS 队列唤醒.png)

`[分析]`  条件锁的唤醒流程（条件锁会单独形成条件队列）

​		模拟：t1 使用条件锁使用 wait 在 WaitSet 队列中阻塞，t4 加锁 sleep 沉睡 5s 没有释放锁，再把 t1 唤醒，t2 和 t3 一样使用一般的可重入锁加锁，启动主线程，观察情况？那么怎么执行顺序呢？====> 执行完成顺序：t4、t2、t3、t1 ，因为`条件队列唤醒后还需要进入正常阻塞队列等待拿锁`。

![](D:\NoteBook\核心笔记\多线程原理详解\image\signal 方法.png)

# ReadWriteLock 锁

​		读写锁是 Lock 特别的一种锁，一般是指可重入读写锁 `ReentrantReadWriteLock`，其特点是：

1、`读读并发`：读锁和读锁之间可以并发执行，可以同时拿到同一把锁。

2、`读写互斥`：读锁和写锁之间互斥，不能同时拿到同一把锁。

3、`写写互斥`：写锁和写锁之间互斥，不能同时拿到同一把锁。

4、读写锁的读锁不支持条件：不能够生成多个条件队列 wait。

​	读锁条件直接调用父类的方法，会直接抛出异常。

5、读写锁支持重入，但是只支持降级（write ----> read），不支持升级（read -----> write）：如果先获取 read 锁，再直接锁的体内重入获取 write ，则会卡在加写锁拿不到 write，但是如果先获取 write 锁，则可以在内部继续重入获取 read 锁。

> ​	升级问题：会产生`死锁`现象。内部不支持这样写，因为有可能 t1 刚拿到读锁还未拿写锁时，t2 和 t3 来了拿到了读锁，此时 t1 就拿不到其内部重入的写锁了（读写互斥），因此此时 t1 就会等 t2 和 t3 释放锁，而此时 t2 执行后也要准备拿写锁，会等 t1 和 t3 释放锁......，因此便产生了死锁。
>
> ​	降级问题：t1 拿到写锁，此时其他线程就都拿不到锁（不管是读锁还是写锁）：读写互斥、写写互斥，此时内部就能够支持再拿到重入的读锁，避免在释放写锁再获取读锁的过程中被其他线程拿到锁修改数据（场景：写入数据后想马上读取数据）。
>

`[案例代码]` 实现一个缓存，细粒度的控制实现多个线程读数据，只有一个线程写数据。（`map 线程不安全`：不加锁情况下肯定会出现问题）

```java
//自定义缓存
public class MyCache {
    private volatile Map<String, Object> map = new HashMap<>();
    //读写锁：更加细粒度的控制。
    private ReentrantReadWriteLock readWriteLock = new ReentrantReadWriteLock();

    //写的时候希望只有一个线程写
    public void put(String key, Object value){
        readWriteLock.writeLock().lock();
        try {
            System.out.println(Thread.currentThread().getName() + "写入：" + key);
            map.put(key, value);
            System.out.println(Thread.currentThread().getName() + "写入完毕");
        }catch (Exception e){
            e.printStackTrace();
        }finally {
            readWriteLock.writeLock().unlock();
        }
    }

    //读的时候多个线程可以读：但是要防止读的时候，同时有线程写入，防止脏读，因此也需要加锁
    public void get(String key){
        readWriteLock.readLock().lock();
        try {
            System.out.println(Thread.currentThread().getName() + "读取：" + key);
            Object o = map.get(key);
            System.out.println(Thread.currentThread().getName() + "读取成功");
        }catch (Exception e){
            e.printStackTrace();
        }finally {
            readWriteLock.readLock().unlock();
        }
    }
}
```

`[场景模拟]`  t1 拿到写锁（write），5s 后释放锁，t2 此过程拿不到读锁（read）会一直阻塞，t3 也是读锁，t4 也是写（write）锁。（顺序启动线程）

​	1）当 t1 拿到锁时，t2 和 t3 谁拿的到锁？ ====> 都拿不到：读写互斥。

​	2）当 t1 释放锁后，t2 和 t3 谁拿到锁呢？ =====> 都能拿到：读读共享并发。

​	3）当 t1 睡眠时，t4 拿得到锁吗？ ====> 拿不到锁：写写互斥。

​	4）阻塞顺序是怎么样呢？=====> t2 、t3 、t4。

​	5）t1 释放锁后，t2 和 t3 会拿到锁，那么 t4 能同时拿到锁吗？=====> t4 拿不到锁，t4 是写锁，必须等 t2 和 t3 释放锁才能拿到锁。

​	6）特殊地，如果 t5 也是读锁，那么 t5 会不会和 t2 和 t3 一起执行呢？ ====> `t5 不会和 t2 和 t3 一起执行`，读读并发要求连续的读锁，不然并不遵循读读共享，（中间不能有写锁或是其他锁）===> `连续读锁并发，否则会互斥`。（后面有具体的验证原因）

![](D:\NoteBook\核心笔记\多线程原理详解\image\读读并发解释.png)

`[分析]`  分析写锁的上锁流程。(读写锁 ReentrantReadWriteLock 也是基于 AQS 框架)

​	调用 acquire 方法，调用 tryAcquire 方法，成功加锁的逻辑就在此函数中，当加锁失败时，就会调用 acquireQueued(addWaiter(Node.EXCLUSIVE), arg) 方法进入 AQS 是否形成队列的判断，分为公平锁和非公平锁的区别，后面部分就是和之前相同。

```java
// acquire 函数
public final void acquire(int arg) {
    if (!tryAcquire(arg) && acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}

// tryAcquire 函数：注意场景此处是要加写锁！！！
protected final boolean tryAcquire(int acquires) {
    //获取当前线程，
    Thread current = Thread.currentThread();
    // ReentrantReadWriteLock 初始化时有一个属性 sync 是 AQS 的子类，可以是公平锁或非公平锁，默认非公平锁，表示锁的状态，默认是 0
    int c = getState();	// 因为读写锁是同一把锁（同一个对象），所以为了表示读写锁的区别，锁的前16位表示读锁状态，后16位写锁状态
    // 获取写锁状态
    int w = exclusiveCount(c);
    // 表示有人上了锁（有可能是 w ，r），此时应该判断是否重入（除了重入，其余一律返回false），但是重入也有两种：升级 false 和降级 true
    if (c != 0) {
        //1、判断当前锁是什么锁？ w =0 表示这把锁没上过写锁，只能是读锁，而当前自己是来上写锁的，那就是升级！（因此会失败 false）
        //2、此时如果 w ！= 0，进入第2个判断，表示这把锁当前可能上了写锁，也可能上了读写锁，判断是否重入，如果不是重入则失败
        // getExclusiveOwnerThread 获取当前拿到锁的线程，如果是 current 则表示重入，如果不是 current 则不是重入直接 false
        if (w == 0 || current != getExclusiveOwnerThread())
            return false;
        //3、如果重入了，将state 后16位 + 1，判断重入次数
        if (w + exclusiveCount(acquires) > MAX_COUNT)
            throw new Error("Maximum lock count exceeded");
        //4、 如果没有超出重入最大次数，则把 w + 1，返回 true
        setState(c + acquires);
        return true;
    }
    //5、正常情况下就是当前这个例子第一次加锁（能够进入这个状态说名当前锁是自由状态的）
    // writerShouldBlock 判断队列中是否有人排队，如果有人排队，需要判断是否是公平锁，公平锁则进入排队，非公平锁就不排队
    // 如果是非公平，不管队列有没有人排队，直接抢锁 compareAndSetState(c, c + acquires)
	// 如果是公平锁，则会看队列有没有排队，如果没有人排队，返回 writerShouldBlock() = false，不用排队，直接 CAS 加锁
    // 如果有人排队则表示需要排队，返回 writerShouldBlock() = true，后面加锁过程就不执行，执行 return false 表示加锁失败
    if (writerShouldBlock() ||
        !compareAndSetState(c, c + acquires))
        return false;
    // 设置当前持有锁的线程为自己
    setExclusiveOwnerThread(current);
    return true;
}
```

> 需要注意的是：读写锁的锁状态 `state = r w`（各16位表示，可以理解为 r 表示加读锁次数，w 表示加写锁次数）。

![](D:\NoteBook\核心笔记\多线程原理详解\image\写锁的加锁过程.png)

`问题`  从上面分析发现只有非公平锁才会看队列有没有线程排队，那么为什么会出现队列中有线程排队但是锁状态又是 state = 0 呢？

​		当前 state = 0（没人拿锁），进入 writerShouldBlock() 公平锁的方法，如果当前锁刚好被前一个线程释放，还未唤醒队列中的线程，此时就获取 state 进行判断，就会发现没有人持有锁的情况下队列中还是有线程。

`[分析]`  分析写锁的解锁流程。

```java
public final boolean release(int arg) {
    if (tryRelease(arg)) {	//释放锁成功
        Node h = head;
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h);	//修改双端队列的指针指向和信息，并唤醒下一个节点
        return true;
    }
    return false;	//释放锁成功
}

// tryRelease 方法
protected final boolean tryRelease(int releases) {
    //判断当前锁是否有线程持有，没有则抛出异常 releases = 1
    if (!isHeldExclusively())
        throw new IllegalMonitorStateException();
    //有人持有锁，则 state - 1，表示写锁释放一个
    int nextc = getState() - releases;
    // 判断后16位 w 是否等于 0 ====> 判断重入
    boolean free = exclusiveCount(nextc) == 0;
    if (free)
        //如果等于 0，表示不是重入，则直接将锁的当前持有者置空 null
        setExclusiveOwnerThread(null);
    // 状态值更新 
    setState(nextc);
    return free;
}

public final boolean release(int arg) {
    if (tryRelease(arg)) {	
        Node h = head;
        if (h != null && h.waitStatus != 0) 
            unparkSuccessor(h);
        return true;
    }
    return false;
}
```

![](D:\NoteBook\核心笔记\多线程原理详解\image\写锁的解锁流程.png)

`[分析]`  分析读锁的加锁流程。（注意此时是加读锁）

```java
public void lock() {
    sync.acquireShared(1);
}

public final void acquireShared(int arg) {
    if (tryAcquireShared(arg) < 0)	// tryAcquireShared 加锁失败返回 -1，加锁成功返回 > 0 的数值
        doAcquireShared(arg);
}

protected final int tryAcquireShared(int unused) {
    //获取当前线程
    Thread current = Thread.currentThread();
    //获取锁的状态值
    int c = getState();
    //1、若 c != 0，则 exclusiveCount 获取后 16位，判断是否上了写锁（因为读读并发上了读锁也还能加读锁）
    // 如果 exclusiveCount == 0 表示没有上写锁，返回 false，直接不进 if 块，则直接可能性有：读锁重入 和 读锁并行
    // 如果 exclusiveCount != 0 表示上了写锁，返回 true ，执行后面的判断（此时表示已经写锁）
    //2、判断 etExclusiveOwnerThread() != current 由于当前线程是加读锁，则一定返回 false 则表示是重入降级
    if (exclusiveCount(c) != 0 && getExclusiveOwnerThread() != current)
        return -1;
    //第一个判断给出两种不 return 的结果：1）普通并发读锁（包括前面没锁）；2）重入加读锁（重入可能就有无限种组合：读读并发）
    // 第二个判断建立在有线程加写锁基础上，此时加读锁不 return 就只可能是 1）重入降级
    int r = sharedCount(c);	//得到r的上锁次数
    //4、此处 readerShouldBlock 判断是否需要阻塞，不考虑极端情况则不阻塞，返回 false，可以恒定认为此判断成立
    //5、执行 r < MAX_COUNT 检查重入次数返回 true，compareAndSetState(c, c + SHARED_UNIT)，表示设置 state 加锁
    if (!readerShouldBlock() && r < MAX_COUNT && compareAndSetState(c, c + SHARED_UNIT)) {
        //此时加锁已经成功，但是为什么不直接返回呢？ ====> 重入或降级锁的可能性很多
        .......
    }
    return fullTryAcquireShared(current);
}
```

​		当 compareAndSetState(c, c + SHARED_UNIT) 时已经加锁成功了，但是现在还有三种可能性：1）普通并发读锁；2）读锁重入；3）写锁降级加读锁。因为重入可能性很多，例如如果此时 state = 6_0 表示加了 6 次读锁，0 次写锁，那么可能性可能是 t1 ~ t6 各加一次读锁，也能使其中某些线程重入加读锁，那么应该记录当前已经拿锁的线程是重入第几次，但是目前 AQS 里面已经没地方存，此时便可以将其存储在 map（thread，num），或者存储在 ThreadLocal 中。此时读写锁开发者便是将其存储在 ThreadLocal 中，但是做了一些特殊的处理。

```java
if (!readerShouldBlock() && r < MAX_COUNT && compareAndSetState(c, c + SHARED_UNIT)) {
    if (r == 0) { //r 表示加锁之前的值r，r == 0 表示所有线程第一次给锁加读锁，之前没有线程加过读锁
        // 但实际上此处的第一次是有歧义的，当第二个线程来加锁时，就会将第二个线程也当成第一个线程一样，因此实际上可以直接理解成某个具体的线程第一次加读锁
        // 因此后面如果另一个线程 tf 来加锁，则此时 r = 0，又会重置这些参数
        firstReader = current;	//如果是第一个线程第一次加读锁，则把这个线程赋值给 firstReader 全局变量（tf线程加锁过程）
        firstReaderHoldCount = 1;		//记录当前线程的加锁次数，return 1 ,加锁完毕
    } else if (firstReader == current) {	// 如果 firstReader == current，表示之前这个线程已经加过读锁（重入）
        firstReaderHoldCount++;		// 加锁次数计数器++，return 1 结束
    } else {
        //此时说明 r != 0 且 current != firstReader，说明当前来的线程并不是之前加锁的线程，并且之前没有释放锁
        //HoldCounter 也是记录加锁状态的，可以理解为一个 map，cachedHoldCounter 开始为null
        HoldCounter rh = cachedHoldCounter;
        if (rh == null || rh.tid != getThreadId(current))
            //readHolds 在加锁时就已经实例化了，get() 方法初始化一个 rh，赋值给 cachedHoldCounter
            cachedHoldCounter = rh = readHolds.get();
        else if (rh.count == 0)
            readHolds.set(rh);
        //rh的 count + 1，但因为 cachedHoldCounter 和 rh 指向同一个对象，则 cachedHoldCounter 的count 也会加1
        rh.count++;
    }
    return 1;
}
```

1）此时第一个线程 tf 来加读锁（也是整个系统的第一次加读锁），全局变量 firstReader 记录当前加锁线程，同时使用 firstReaderHoldCount 记录次数。

2）tf 未释放锁，而是重入，此时 r != 0，firstReaderHoldCount+1 即可。

3）tf 将锁释放，ts 线程来加锁，此时由于 tf 线程已经释放，系统会将 ts 当成整个系统的第一个线程，还是完成 firstReader = ts，计数器回归 1。

4）ts 没有将锁释放，t3（tn） 来加读锁，此时 r = 1（被 ts 持有），此时 current = t3 != firstReader（当前等于 ts），就会进入最下面的 else 块（主要逻辑）。

```java
//HoldCounter 也是记录加锁状态的，可以理解为一个 map，两个属性为：count 和 tid（就是记录线程的简单信息），初始 cachedHoldCounter = null
HoldCounter rh = cachedHoldCounter;
// rh 此时就是 null，if 成立调用 readHolds.get() 方法
if (rh == null || rh.tid != getThreadId(current))
    // readHolds 的初始化：readHolds = new ThreadLocalHoldCounter();===> 实例化一个 ThreadLocal<HoldCounter>
    //readHolds 在加锁时就已经实例化了，get() 方法初始化一个 rh，赋值给 cachedHoldCounter
    cachedHoldCounter = rh = readHolds.get();
else if (rh.count == 0)
    readHolds.set(rh);
//rh的 count + 1，但因为 cachedHoldCounter 和 rh 指向同一个对象，则 cachedHoldCounter 的count 也会加 1
rh.count++；
```

```java
// readHolds.get() 方法
public T get() {
    // 拿到当前线程
    Thread t = Thread.currentThread();
    // 拿到当前线程的 ThreadLocalMap 存储空间，因为从头到尾都没有往这个 map 里面存这个线程的东西，这个map 就是空的
    // getMap 方法：获取 ThreadLocal.ThreadLocalMap threadLocals 对象，默认为 null（当前并未向里面存储信息）;
    ThreadLocalMap map = getMap(t);
    if (map != null) {
        ThreadLocalMap.Entry e = map.getEntry(this);
        if (e != null) {
            @SuppressWarnings("unchecked")
            T result = (T)e.value;
            return result;
        }
    }
    // map 为null，就直接调用 setInitialValue 在 threadlocalmap 记录信息
    return setInitialValue();
}
```

​		此时设计思想就体现出来了提高性能，在全局变量存了一份 t3（tn）的线程加锁信息，同时还利用 get 方法里面的 setInitialValue 方法向 threadMap 也存了一份，一共两份，当再来一个 tn1 加锁时，就会直接将 cachedHoldCounter 信息修改为 tn1 的线程加锁信息。因为都存储到 ThreadLocalMap 全局变量里面的话，后面获取就会耗费性能。当 tn1 来加锁时，tn1 的 threadlocalmap 初始是空的，会直接调用 setInitialValue 方法，此时就会将 tn1 的信息加入到 ThreadLocalMap 中，同时 tn1 的加锁信息又会添加到 cachedHoldCounter 中，使其一直维持最后一个加锁的线程的加锁的信息（加锁次数、线程id）。

![](D:\NoteBook\核心笔记\多线程原理详解\image\读锁加锁的巧妙处理.png)

> ​		相当于 AQS一直维持了第一个线程和最后一个线程的加锁信息在缓存中，第一个线程 tf 的加锁信息在 firstReader 中，最后一个线程加锁信息在cachedHoldCounter中，而中间的线程加锁信息都维持在各自的 ThreadLocal 中。====> `提高性能`：不需要每次都必须从 ThreadLocalMap 拿来影响效率。
>
> `ThreadLocal 可以理解为一个单独一块的 map`，用于存放加锁的信息，读取速度肯定就没有 类中的全局变量 cachedHoldCounter 快。

![](D:\NoteBook\核心笔记\多线程原理详解\image\读锁加锁流程.png)

​		如果加锁失败，调用 doAcquireShared 方法，由于拿不到锁时就会 park ，唤醒后就会从这里开始执行，那么读锁唤醒之后是如何`连续唤醒`的呢？

```java
private void doAcquireShared(int arg) {
    //Node 的 nextWait 属性是一个 Node 对象，用于记录是否是共享锁，如果等于 SHARED 对象（就是一个标志位，static 的不可修改）则就是共享锁
    //后面通过判断 nextWait == shared 来判断是不是共享的
    final Node node = addWaiter(Node.SHARED);		//addWaiter 方法内部调用 enq 方法，和之前差不多就是构建双向链表。
    boolean failed = true;
    try {
        boolean interrupted = false;
        for (;;) {
            //获取当前前一个节点线程
            final Node p = node.predecessor();
            if (p == head) {
                //此时便可以拿到锁，读锁此时加锁就会成功 r > 0
                int r = tryAcquireShared(arg);
                if (r >= 0) {
                    // 此函数就会判断当前节点的 nextWait 属性是不是 shared 属性，如果是，则也会一起叫醒，
                    // 同时也会继续向后判断其 nextwait 属性是不是 shared 。======> 解释了之前的读读并发只能在连续时成立
                    setHeadAndPropagate(node, r);
                    p.next = null; // help GC
                    if (interrupted)
                        selfInterrupt();
                    failed = false;
                    return;
                }
            }
            if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
                // 线程唤醒后就是从此处再开始执行，则就会再次进入 for 循环
                interrupted = true;
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}

// setHeadAndPropagate 方法判断连续的 park 的线程节点是不是能够共享的
private void setHeadAndPropagate(Node node, int propagate) {
    Node h = head; // Record old head for check below
    setHead(node);
    if (propagate > 0 || h == null || h.waitStatus < 0 ||
        (h = head) == null || h.waitStatus < 0) {
        Node s = node.next;
        if (s == null || s.isShared())	//此时就是判断某个节点是不是 shared 节点
            doReleaseShared();
    }
}

// isShared 方法判断是不是 shared 属性
final boolean isShared() {
    return nextWaiter == SHARED;	//通过对比 nextWaiter 属性是不是 shared 节点判断
}
```

`[分析]`  简要分析读锁的解锁流程原理。

```java
public void unlock() {
    sync.releaseShared(1);
}

public final boolean releaseShared(int arg) {
    if (tryReleaseShared(arg)) {
        doReleaseShared();
        return true;
    }
    return false;
}

protected final boolean tryReleaseShared(int unused) {
    //获取当前线程
    Thread current = Thread.currentThread();
    //判断此时的 firstReader 是不是当前线程（firstReader 始终记录最新的第一个加读锁并未释放的线程）
    if (firstReader == current) {
        // 判断是否重入 = 1 表示非重入，则此时就将 firstReader 置空，表示清除标志位
        if (firstReaderHoldCount == 1)
            firstReader = null;
        else
            firstReaderHoldCount--;
    } else {
        //如果 firstReader ！= current，则表示此时不止一个读锁加锁
        HoldCounter rh = cachedHoldCounter;	//此时从线程内部的全局变量缓存拿到最后一个线程的信息
        if (rh == null || rh.tid != getThreadId(current))
            rh = readHolds.get();
        int count = rh.count;	//获取加锁次数
        if (count <= 1) {
            readHolds.remove();	//一次就直接移除
            if (count <= 0)	//说明压根没有拿到锁但是要解锁就抛出异常
                throw unmatchedUnlockException();
        }
        --rh.count;	//多次加速就需要一次次的解锁
    }
    
    // 设置线程的状态 state，同时将连续的读锁一个个都释放，唤醒的并发读锁都需要一次释放
    for (;;) {
        int c = getState();
        int nextc = c - SHARED_UNIT;
        if (compareAndSetState(c, nextc))
            return nextc == 0;
    }
}

//如果解锁成功，则需要不停的向后比较唤醒，读锁多个被唤醒则都需要将他们从队列中剔除
private void doReleaseShared() {
        for (;;) {
            Node h = head;
            if (h != null && h != tail) {
                int ws = h.waitStatus;
                if (ws == Node.SIGNAL) {
                    if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                        continue;            
                    unparkSuccessor(h);
                }
                else if (ws == 0 && !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                    continue;                
            }
            if (h == head)                   
                break;
        }
    }
```

# JUC 辅助类

##  StampedLock

​		ReentrantReadWriteLock 性能已经非常好，但是底层还是有很多的 CAS 操作加锁，而使用 `StampedLock` 这个高性能的读写锁来进行读锁的上锁操作并没有过多的 CAS 操作和过多的判断影响性能。StampedLock 被称作 `乐观读锁`，即读操作获取锁时，实际是不加锁，直接返回一个值（版本号：戳），然后执行临界区的时候才验证这个值，相同才进行操作（乐观锁的操作），如果不相同，也就是被其他线程修改了再升级为类似于读写锁的读锁：ReentrantReadWriteLock. readLock 进行同步控制。（`实际上不存在锁的概念`）

基本操作：

```java
long stamp = lock.tryOptimisticRead();  //开启乐观读（初始化版本号）
stamp = lock.readLock();		//升级为读锁
stamp_w = lock.writeLock();		//定义写锁
```

`[案例]` 定义数据容器，用 StampedLock 实现容器的读写的线程安全同步。

```java
//定义数据容器，利用 StampedLock 进行控制读写（不支持重入和条件）
public class DataContainer {
    private int i;
    private long stamp_w;

    public DataContainer(int i){
        this.i = i;
        this.stamp_w = 0;
    }

    public void setI(int i) {
        this.i = i;
    }

    private final StampedLock lock = new StampedLock();

    public int read() throws InterruptedException {
        long stamp = lock.tryOptimisticRead();  //开启乐观读（初始化版本号）
        System.out.println("StampedLock 初始版本号：" + stamp);
        TimeUnit.SECONDS.sleep(1);
        if (lock.validate(stamp)) { //检验版本号,未失效则直接返回
            System.out.println("StampedLock 当前版本号 stamp = " + stamp +", 当前数据 i = " + i);
            return i;
        }
        System.out.println("验证版本号发现被改变 stamp_w = " + stamp_w);
        //版本号失效则需要将 stamp 升级成读写锁
        try {
            //锁的升级也会改变版本号
            stamp = lock.readLock();
            System.out.println("升级之后的加锁成功 stamp = " + stamp);
            TimeUnit.SECONDS.sleep(1);
            System.out.println("升级读锁完毕 stamp = " + stamp + ", 此时获取数据 i = " + i);
            return i;
        } finally {
            System.out.println("升级锁后需要解锁,解锁时 stamp = " + stamp);
            lock.unlockRead(stamp);
        }
    }

    public void write(int i) throws InterruptedException {
        //写锁的加锁就是使用 CAS 加锁
        stamp_w = lock.writeLock();
        System.out.println("写锁加锁成功,改变 stamp_w = " + stamp_w);
        try {
            TimeUnit.SECONDS.sleep(5);
            this.i = i;
        } finally {
            System.out.println("写锁释放时，当前版本号 stamp = " + stamp_w + ", 数据 i = " + i);
            lock.unlockWrite(stamp_w);
        }
    }
}
```

```java
public class Test {
    public static void main(String[] args) {
        DataContainer container = new DataContainer(1);
        new Thread(() -> {
            try {
                System.out.println("当前线程：" + Thread.currentThread().getName());
                container.read();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }, "t1").start();

        new Thread(() -> {
            try {
                System.out.println("当前线程：" + Thread.currentThread().getName());
                container.read();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }, "t2").start();

        new Thread(() -> {
            try {
                System.out.println("当前线程：" + Thread.currentThread().getName());
                container.write(10);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }, "t3").start();
    }
}
```

1）版本号 stamp 在初始定义一个值，在锁升级后会改变一次，在加写锁时也会改变。

2）StampedLock 支持读读并发，同时支持`乐观锁的模式：读写不互斥 和 写读不互斥`，但是能够提高并发度。

> 验证版本号过后的代码还是存在线程安全问题，只有当升级读锁后才会读写互斥。

3）StampedLock 不支持重入，也不支持条件队列等待。（因此不能替代 ReentrantReadWriteLock）

## Semaphore

`samephore`：限制对资源访问的`线程上限`，而不是资源的上限。（也是基于 AQS 框架，也有公平锁和非公平锁的两种具体实现）

`[案例]` 洗浴店的手牌相当于享受服务的许可，张三享受服务前必须获取到手牌，服务完之后就需要归还手牌。按 samephore 思想来说，只能限制手牌（客人：线程）的数量，并不能限制按摩师（资源）的数量。 

基本用法案例：三个停车位，六辆车抢车位。

```java
public class TestSemaphore {
    public static void main(String[] args) {
        //限制线程数量上限，可类比为停车位 （三个车位），用来限流，默认为非公平锁的实现
        Semaphore semaphore = new Semaphore(3);

        for (int i = 1; i <= 6; i++) {
            new Thread(() -> {
                try {
                    semaphore.acquire(); // 通过 acquire() 获取许可，也就是占用车位
                    System.out.println(Thread.currentThread().getName() + "抢到车位");
                    TimeUnit.SECONDS.sleep(2);
                    System.out.println(Thread.currentThread().getName() + "离开车位");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    semaphore.release();    //通过 release 释放许可，也就是归还车位
                }
            },String.valueOf(i)).start();
        }
    }
}
```

1）非公平锁获取许可的实现：

```java
// acquire -----> acquireSharedInterruptibly -----> nonfairTryAcquireShared
final int nonfairTryAcquireShared(int acquires) {
    for (;;) {
        //获取当前的 state 许可剩余量
        int available = getState();
        //减去当前需要占用一个许可
        int remaining = available - acquires;
        //判断还有剩余的许可可用吗？没有剩余，remaining 则直接返回 -1，还有剩余，则执行 CAS 给与许可
        if (remaining < 0 || compareAndSetState(available, remaining))
            return remaining;
    }
}


public final void acquireSharedInterruptibly(int arg) throws InterruptedException {
    if (Thread.interrupted()) throw new InterruptedException();
    if (tryAcquireShared(arg) < 0) doAcquireSharedInterruptibly(arg);	//返回 -1 小于 0，执行 doAcquireSharedInterruptibly，执行 addWaiter方法形成队列，入队 park。
}

```

2）公平锁的获取许可的实现，只是比非公平锁多一个判断 AQS 队列中是否有线程排队的区别。

## CountDownLatch

`CountDownLatch`：`倒计时锁`，某个线程 x 需要等待倒计时为 0 时才执行（`发令枪`），调用 await 阻塞，调用 countDown 倒计时减1。

基本语法：

```java
//初始化对象，给一个初始值
CountDownLatch latch = new CountDownLatch(3);
//x线程调用 await 阻塞，等待计数器为0的时候才会停止阻塞
latch.await();
//其他线程调用 countDown() 对计数器-1
latch.countDown();
```

CountDownLatch 和 join 的区别：join 也是等待某线程执行完。

1）本质区别：join 无法和线程池一起使用，线程池里面的线程是内部维护的，拿不到明确的线程来 join。

2）join 是等待某个线程执行完毕之后才执行，但 CountDownLatch 可以在某个线程还未完全执行完时（但是调用 countDown 到了 0）开始执行。

`[案例]`：你去洗浴中心，有四个技师（洗脚、按摩、陪聊、采耳），要享受需要先等待她们都准备完成才能开始登上人生巅峰。而四个技师就是四个线程，四个线程通过线程池创建执行，每个人的准备时间不一样，每个人准备完毕后 countdown - 1，countdown 到 0 时，主线程才执行，也就是准备完毕开始技师服务。

```java
public class TestCountDownLatch {
    public static void main(String[] args) throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(4);
        List<String> list = new ArrayList<>();
        list.add("Angel");  //洗脚
        list.add("Baby");   //采耳
        list.add("Rose");   //陪聊
        list.add("Joyce");  //按摩
        AtomicInteger i= new AtomicInteger();
        // 线程池的创建时使用 newFixedThreadPool 能够指定线程的名称
        ExecutorService executorService = Executors.newFixedThreadPool(4, (runnable)->{
                    return new Thread(runnable, list.get(i.getAndIncrement()));
        });
        Random random = new Random();
        for (int j = 0; j <4 ; j++) {   // 四个任务的并行执行
            int temp = j;
            executorService.submit(()->{
                for (int k = 0; k < 100 ; k++) {
                    try {
                        TimeUnit.MILLISECONDS.sleep(random.nextInt(100));
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    String process = Thread.currentThread().getName() + "(" + k + "%)";   // 准备进度的显示格式化
                    list.set(temp, process);    // 存放四个线程的准备进度
                    System.out.print("\r" + Arrays.toString(list.toArray()));
                }
                latch.countDown();
            });
        }
        latch.await();  // 休息等待技师准备完毕
        System.out.println("\n 成功登上人生巅峰...");
        executorService.shutdown();
    }
}
```

## CyclicBarrier

​		`CyclicBarrier`：`重复栅栏`（重复的 countdownlatch ），语法和 countdownlatch 差不多。

基本语法：

```java
// 初始化一个 cyclicBarrier 计数器为 2
CyclicBarrier cyclicBarrier = new CyclicBarrier(2);
// await 会阻塞，并将 CyclicBarrier 计数器减 1。
cyclicBarrier.await();
```

和 countdownlatch 的区别：

1）CyclicBarrier 可以重复执行，CountDownLatch 不能从 0 重置为初始值，而 CyclicBarrier 相当于到 0 后可以重置计数器。

2）CyclicBarrier 初始构造方法可以直接提供一个阻塞的线程，用来汇总，等待计数器。

```java
public class TestCyclicBarrier {
    public static void main(String[] args) {
        AtomicInteger i= new AtomicInteger();
        CyclicBarrier cyclicBarrier = new CyclicBarrier(2,()->{
            System.out.println("t1 t2 结束了.......");
        });
        ExecutorService service = Executors.newFixedThreadPool(2);
        for (int j = 0; j <2 ; j++) {
            service.submit(()->{
                System.out.println("start......");
                try {
                    TimeUnit.SECONDS.sleep(1);
                    System.out.println("working......");
                    cyclicBarrier.await();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
            service.submit(()->{
                System.out.println("start......");
                try {
                    TimeUnit.SECONDS.sleep(3);
                    System.out.println("working......");
                    cyclicBarrier.await();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }
        service.shutdown();
    }
}
```

## ConcurrentHashMap

ArrayList：底层以`数组 Object[]`实现，数组存满则扩容。

LinkedList：底层以`双向链表 (存储first 和 last)`实现，每个元素都是 Node。

Map：底层实现是 ArrayList 和 LinkedList 的组合，把 ArrayList 里面的 `Object[]` 换成了一个个的 LinkedList 的头节点 Node。

![](D:\NoteBook\核心笔记\多线程原理详解\image\HashMap实现.png)

`[问题]`  ConcurrentHashMap 初始化时指定的初始容量 32 时，那么实际的初始容量是多少呢？

```java
public ConcurrentHashMap(int initialCapacity) {
    if (initialCapacity < 0) throw new IllegalArgumentException();
    //这里就可以看到 cap = tableSizeFor(initialCapacity + (initialCapacity >>> 1) = tableSizeFor（32 + 32/2 + 1） = tableSizeFor（49）
    int cap = ((initialCapacity >= (MAXIMUM_CAPACITY >>> 1)) ? MAXIMUM_CAPACITY : tableSizeFor(initialCapacity + (initialCapacity >>> 1) + 1));
    this.sizeCtl = cap;
}
//tableSizeFor 就是取某个数的最近最大的2的幂次方，49 的最大最近2的幂次方就是 64
```

​	对于 ConcurrentHashMap，如果指定初始容量是 32，那么 Jdk 7 就是 32，但是 Jdk 8 的初始容量是 64。

`[理论]` 从上面发现一个变量 `sizeCtl`，这个是对整个 ConcurrentHashMap 的底层`数组`状态的显示。

```java
private transient volatile int sizeCtl;
```

1）当 sizeCtl 为 0 时，代表数组还没有初始化。

2）当 sizeCtl 为 正数 时，代表数组已经初始化，记录的是数组的扩容阈值，如果没有初始化，记录的是数组的初始容量。

3）当 sizeCtl 为 -1 时，代表数组正在初始化。

4）当 sizeCtl 为 非 -1 的负数 时，代表数组正在扩容。

`[分析]` 分析 ConcurrentHashMap 的 put 方法，调用了 putVal 方法。（具体流程图请看 processon 网站）

```java
// onlyIfAbsent 表示有重复值时覆盖与否，put 方法传入的是 false，表示覆盖（默认）
final V putVal(K key, V value, boolean onlyIfAbsent) {
    if (key == null || value == null) throw new NullPointerException();
    int hash = spread(key.hashCode());	// 拿到 key 的 hashcode，spread 计算得到正数（认为是一个随机值即可）
    int binCount = 0;
    for (Node<K,V>[] tab = table;;) {	//死循环,这个 table 就是表示真正表示数据的那个数组
        Node<K,V> f; int n, i, fh;
        if (tab == null || (n = tab.length) == 0)	//最初 table = null
            tab = initTable();	//初始化数组（注意：添加元素的时候才会初始化数组）
        else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            //如果这个 i 位置没有数据，就直接 new node 放入
            if (casTabAt(tab, i, null, new Node<K,V>(hash, key, value, null)))
                break; //此时数据插入完毕                 
        }
        //拿到 i 处链表的第一个 node 的 hash 是否等于 MOVED = -1 =====> 扩容（迁移完成的数据则会在此处放一个 MOVED 标志）
        //迁移过程中此处是不能放数据的，避免新数据放在了老数组里造成数据丢失
        else if ((fh = f.hash) == MOVED)
            tab = helpTransfer(tab, f);
        else {
            V oldVal = null;
            synchronized (f) {
                if (tabAt(tab, i) == f) {	//进一步校验是否 i 处被改变
                    if (fh >= 0) {	//说明数组里面存的是链表的 Node
                        binCount = 1;	//标志位
                        for (Node<K,V> e = f;; ++binCount) {	//拿到数组中当前 i 位置处的节点 node = f（该位置处链表的第一个节点）
                            K ek;
                            //判断 hash 值，判断 key 值是不是一样，判断 key 是不是 null，判断 key 是不是等于 ek（双重校验）
                            if (e.hash == hash && ((ek = e.key) == key || (ek != null && key.equals(ek)))) {
                                //循环判断 i 处链表的 node 是不是有 key = 给定的 key
                                oldVal = e.val;
                                if (!onlyIfAbsent)	//判断能不能覆盖
                                    e.val = value;	//能覆盖就替换
                                break;	//不能覆盖则不做操作
                            }
                            Node<K,V> pred = e;
                            if ((e = e.next) == null) {	//找到最后还是没发现 key 值 = 给定 key 的就 new node 加到链表尾部
                                pred.next = new Node<K,V>(hash, key, value, null);
                                break;
                            }
                        }
                    }
                    else if (f instanceof TreeBin) {	//说明数组里面存的是红黑树（暂时不考虑）
                        ...........................
                    }
                }
            }
            // 此时数据已经添加完成
            if (binCount != 0) {
                if (binCount >= TREEIFY_THRESHOLD)
                    treeifyBin(tab, i);
                if (oldVal != null)
                    return oldVal;
                break;
            }
        }
    }
    addCount(1L, binCount);
    return null;
}

// initTable 初始化数组的方法
private final Node<K,V>[] initTable() {
    Node<K,V>[] tab; int sc;
    while ((tab = table) == null || tab.length == 0) {	//最初肯定是 null
        // 判断 sizeCtl < 0，构造方法如果传入 32 此时 sizeCtl = 64 不成立，就算一开始不传入值，sizeCtl = 0，也不可能成立
        if ((sc = sizeCtl) < 0)	 Thread.yield(); 
        // U 代表 Unsafe，专门操作直接内存的，可以调用 CAS 操作
        //CAS 判断 sizeCtl 是否等于 sc ，如果相等则将 sc 改成 -1，返回 true（第一个线程进来会成立，第二个线程进来）
        else if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {
            try {
                
                if ((tab = table) == null || tab.length == 0) {
                    int n = (sc > 0) ? sc : DEFAULT_CAPACITY;
                    @SuppressWarnings("unchecked")
                    Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
                    table = tab = nt;
                    sc = n - (n >>> 2);
                }
            } finally {
                sizeCtl = sc;
            }
            break;
        }
    }
    return tab;
}
```

1）计数方式是有一个 basecount 存储总数，同时还有一个数组 counterCells 维护当前每个线程要加的数据个数，因此 Map 总体长度是 baseCount + 数组里面的合计长度。

2）数组扩容时，进行数据迁移到新数组时，拿到某个位置的链表时，会重新分配该位置处的链表里面的元素，并不会原封不动的迁移到新数组，也就是新扩容的数组位置并不一定是空的，可能会被其他位置的链表里面的数据填充。

# 线程补充说明

## 线程不安全集合

1、`CopyOnWriteArrayList `：由于多个线程同时对 ArrayList 进行插入数据，发现部分数据并没有插入成功（多个线程同时对一个资源进行抢夺，可能会发生某一时间多个线程同时对同一个索引处进行操作，造成数据的覆盖），就是因为 ArrayList 存在线程安全问题，甚至可能会发生异常（ConcurrentModificationException 并发修改异常）。那么应该如何解决呢？

1）使用 Vector 代替 ArrayList，但实际上 Vector 在 ArrayList 之前出来，是 JDK 官方故意设置 ArrayList 的线程不安全。

```java
List<String> list = new Vector<>();
```

2）使用集合的工具类，使其变安全同步：

```java
List<String> list = Collections.synchronizedList(new ArrayList<>());
```

3）JUC 专门设置的集合：

```java
List<System> list = new CopyOnWriteArrayList<>();
```

​		`CopyOnWrite写入时复制思想（COW）` 是计算机程序设计领域的一种优化策略。多个线程调用 list 写入的时候，可能会存在写入覆盖的问题，CopyOnWrite 就是在写入的时候还复制一份，写入后再放进去，可以避免覆盖造成数据问题。其核心思想是，如果有多个调用者（Callers）同时要求相同的资源（如内存或者是磁盘上的数据存储），他们会`共同获取相同的指针指向相同的资源`，直到某个调用者视图修改资源内容时，系统才会真正复制一份专用副本（private copy）给该调用者，而其他调用者所见到的最初的资源仍然保持不变。这过程对其他的调用者都是透明的（transparently）。此做法主要的优点是如果调用者没有修改资源，就不会有副本（private copy）被创建，因此多个调用者只是读取操作时可以共享同一份资源。`CopyOnWriteArrayList 底层使用的是 Lock 来进行同步，而 Vector 底层使用的是 synchronized ，但是 CopyOnWriteArrayList  只有写加锁读取并不加锁，因此效率更高`。

2、`CopyOnWriteArraySet`：由于 HashSet 也是不安全的，可能会发生异常（ConcurrentModificationException 并发修改异常），那么该如何解决呢？

1）使用集合的工具类，使其变安全：

```java
Set<String> set = Collections.synchronizedSet(new HashSet<>());
```

2）JUC 专门设置的 Set 集合：

```java
Set<String> set = new CopyOnWriteArraySet<>();
```

`[拓展]`  HashSet 的底层实现：是一个 HashMap，HashMap 本身就是线程不安全的。

```java
private static final Object PRESENT = new Object(); 
public HashSet(){
	map = new HashMap<>();
}
//add Set本质就是 map 利用Key是无法重复的
public boolean add(E e){
	return map.put(e,PRESENT) == null; 
}
```

3、`ConcurrentHashMap `：HashMap 也是线程不安全的，那么如何使用线程安全的 Map 结构呢？

`[拓展]`  企业工作不会直接 new HashMap 使用，甚至不会使用 HashMap：

```java
Map<String, String> map = new HashMap<>();
```

同时，HashMap 有两个重要的参数：加载因子 和 初始化容量。

默认加载因子：

```java
static final float DEFAULT_LOAD_FACTOR = 0.75f;
```

初始化容量：

```java
//默认是 2^4 = 16
static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // aka 16
//最大是 2^30
static final int MAXIMUM_CAPACITY = 1 << 30;
```

因此，HashMap 默认是等价于：

```java
Map<String, String> map = new HashMap<>(16, 0.75f);
```

同样，HashMap 是不安全的，可能会发生异常（ConcurrentModificationException 并发修改异常）。那么如何解决呢？

1）使用集合的工具类，使其变安全：

```java
Map<String, String> map = Collections.synchronizedMap(new HashMap<>());
```

2）JUC 专门设置的 Map 集合：ConcurrentHashMap 是 HashTable 的优化。

```java
Map<String, String> map = new ConcurrentHashMap<>();
```

## Callable 创建线程

![在这里插入图片描述](https://img-blog.csdnimg.cn/4330d50b8e0c4c19a443f3b9aec0bf65.png)

​		以前采用 实现 Runnable 的方式创建线程，实际上企业中并不会使用，因为 Runnable 没有返回值。

<span style="color:pink">Callable 创建线程的方式有返回值，同时还有泛型限制，泛型的参数就是等于调用 call 方法的返回值。</span>

问题：Thread 构造器参数只能接收 Runnable，那么怎么启动 callable ？

​		因此 Callable 是无法直接启动的，因此便需要一个 “中间人” 来挂上 Runnable，而这个中间人就是 “FutureTask”。FutureTask 是 Runnable 的实现类，而 FutureTask 又可以调用 Callable 线程。

```java
MyThread thread = new MyThread();
FutureTask futureTask = new FutureTask(thread); //适配类
new Thread(futureTask, "A").start();
```

```java
public class CallableTest {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        //new Thread(new Thread()).start(); 以前的启动方式
        //Thread 构造器参数只能接收 Runnable，那么怎么启动 callable ？
        new Thread().start();   //怎么启动callable
        MyThread thread = new MyThread();
        FutureTask futureTask = new FutureTask(thread); //适配类
        new Thread(futureTask, "A").start();
        String o = (String)futureTask.get();//获取Callable的返回结果
        System.out.println(o);
    }
}

//泛型 T = String，则 call方法返回 String 类型
class MyThread implements Callable<String> {
    @Override
    public String call() {
        System.out.println("call()");
        return "123";
    }
}
```

需要注意：futureTask.get() 方法可能会产生阻塞，需要放到最后一行，或者使用异步通信处理。同时，Callable 的返回结果会缓存。

## 阻塞队列

线程池中主要是使用阻塞队列，当写入数据时如果队列满了则等待或抛弃，当读取时如果队列是空的，则必须阻塞等待任务。

![](D:\NoteBook\核心笔记\多线程原理详解\image\Collect.png)

其中阻塞队列的主要方法有：

|   操作方式   | 有返回值，会抛出异常 | 有返回值，不抛出异常 | 阻塞等待（一直等待） |       超时等待（超时退出）       |
| :----------: | :------------------: | :------------------: | :------------------: | :------------------------------: |
|     添加     |        add()         |       offer()        |        put()         | offer(element, timeout,TimeUtil) |
|     删除     |       remove()       |        poll()        |        take()        |     poll( timeout,TimeUtil)      |
| 获取队首元素 |       element        |        peek()        |                      |                                  |

```java
public class Test {
    public static void main(String[] args) throws InterruptedException {
        test1();
        test2();
        test3();
        test4();
    }
   
    //有返回值，抛出异常的方法
    public static void test1(){
        ArrayBlockingQueue<String> queue = new ArrayBlockingQueue<>(3);

        System.out.println(queue.add("a"));
        System.out.println(queue.add("b"));
        System.out.println(queue.add("c"));

        //抛出异常：IllegalStateException: Queue full
        //System.out.println(queue.add("d"));
        System.out.println("==============");
        System.out.println(queue.remove());
        System.out.println(queue.remove());
        System.out.println(queue.remove());

        //抛出异常：NoSuchElementException
        //System.out.println(queue.remove());
    }

    
    // 有返回值，不抛出异常的方法
    public static void test2(){
        ArrayBlockingQueue<String> queue = new ArrayBlockingQueue<>(3);

        System.out.println(queue.offer("a"));
        System.out.println(queue.offer("b"));
        System.out.println(queue.offer("c"));

        System.out.println(queue.offer("d")); //返回 false
        System.out.println(queue.element());    //查看队首元素，查不到时，抛异常
        System.out.println(queue.peek());      //查看队首元素，查不到时，不抛异常

        System.out.println("==============");
        System.out.println(queue.poll());
        System.out.println(queue.poll());
        System.out.println(queue.poll());

        System.out.println(queue.poll());  //返回 null
    }

    public static void test3() throws InterruptedException {
        ArrayBlockingQueue<String> queue = new ArrayBlockingQueue<>(3);
        queue.put("a");
        queue.put("b");
        queue.put("c");
        queue.put("d"); //队列没有位置了，一直阻塞,程序不会停

        System.out.println(queue.take());
        System.out.println(queue.take());
        System.out.println(queue.take());
        System.out.println(queue.take());   //没有这个元素 ，一直阻塞,程序不会停
    }

    public static void test4() throws InterruptedException {
        ArrayBlockingQueue<String> queue = new ArrayBlockingQueue<>(3);
        queue.put("a");
        queue.put("b");
        queue.put("c");
        queue.offer("d", 2, TimeUnit.SECONDS); //队列没有位置了，一直阻塞,程序不会停

        System.out.println(queue.take());
        System.out.println(queue.take());
        System.out.println(queue.take());
        System.out.println(queue.poll(2, TimeUnit.SECONDS));   //没有这个元素 ，一直阻塞,程序不会停
    }
}
```

​		同时，还有一个特殊的阻塞队列：SynchronousQueue 同步队列，没有容量（最多放一个元素：进去一个元素，必须等待取出来之后，才能再往里面放入一个元素！），方法只有：put() 和 take()。

```java
/**
 * 同步队列
 * 和其他的BlockQueue不一样 SynchronousQueue 不存储元素
 * put 了一个元素，必须先从里面 take 取出来，否则不能 put 进去值
 */
public class SynchronousQueueDemo {
    public static void main(String[] args) {
        BlockingQueue<String> blockingQueue = new SynchronousQueue<>();//同步队列

        new Thread(() -> {
            try {
                System.out.println(Thread.currentThread().getName() + " put 1");
                blockingQueue.put("1");
                System.out.println(Thread.currentThread().getName() + " put 2");
                blockingQueue.put("2");
                System.out.println(Thread.currentThread().getName() + " put 3");
                blockingQueue.put("3");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }, "T1").start();

        new Thread(() -> {
            try {
                TimeUnit.SECONDS.sleep(3);
                System.out.println(Thread.currentThread().getName() + " => " + blockingQueue.take());
                TimeUnit.SECONDS.sleep(3);
                System.out.println(Thread.currentThread().getName() + " => " + blockingQueue.take());
                TimeUnit.SECONDS.sleep(3);
                System.out.println(Thread.currentThread().getName() + " => " + blockingQueue.take());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }, "T2").start();
    }
}
```

## 异步回调

异步回调 Future 设计的初衷：可以对将来的某个事件的结果进行建模。

```java
/**
 * 客户端服务器异步调用：Ajax
 * 异步执行，成功回调，失败回调
 * Java 使用 ：
 */
public class FutureDemo01 {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        //test1();
        test2();
    }

    //异步调用就是不耽误其他线程的执行
    //没有返回值的 runAsync 异步回调
    public static void test1() throws ExecutionException, InterruptedException {
        CompletableFuture<Void> completableFuture = CompletableFuture.runAsync(() -> {
            try {
                TimeUnit.SECONDS.sleep(2);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println(Thread.currentThread().getName());
        });

        System.out.println("111111");
        completableFuture.get();  //阻塞获取执行结果
    }

    public static void test2() throws ExecutionException, InterruptedException {
        //有返回结果的 supplyAsync 异步回调
        //ajax 成功返回值，失败就返回错误信息
        //
        CompletableFuture<Integer> completableFuture1 = CompletableFuture.supplyAsync(() -> {
            System.out.println(Thread.currentThread().getName());
            // 模拟错误
            // int i = 10 / 0;
            return 1024;
        });

        //成功和失败的返回情况
        System.out.println(completableFuture1.whenComplete((t, u) -> {
            System.out.println("t=" + t);   //正常的返回结果 1024，异常时 t = null
            System.out.println("u=" + u);   //当前为 null,当出现错误时，u 为异常信息
        }).exceptionally((e) -> {
            System.out.println(e.getMessage());
            return 233;
        }).get());
    }
}
```

​		类似于 Ajax 的效果，成功了返回成功结果，失败了返回异常信息。

## 生产者消费者问题

`[案例]`  基于 Synchronized 实现生产者和消费者问题的同步。

数据 Data：

```java
public class Data {
    private int num = 0;

    //生产者生产过程：
    public synchronized void increment() throws InterruptedException {
        while (num != 0){
            //等待消费者消费
            this.wait();
        }
        num++;
        System.out.println(Thread.currentThread().getName() + "-----生产了----》" + num);
        //生产完毕，提醒消费者消费
        this.notifyAll();
    }

    //消费者消费过程
    public synchronized void decrement() throws InterruptedException {
        while (num == 0){
            //等待生产者生产
            this.wait();
        }
        num--;
        System.out.println(Thread.currentThread().getName() + "-----消费了----》" + num);
        //消费完毕，提醒生产者生产
        this.notifyAll();
    }
}
```

主线程 main：

```java
public class Pro_ComDemo {
    public static void main(String[] args) {
        Data data = new Data();
        new Thread(() -> {
            for (int i = 0; i < 100; i++) {
                try {
                    data.increment();
                }catch (Exception e){
                    e.printStackTrace();
                }
            }
        }, "生产者").start();

        new Thread(() -> {
            for (int i = 0; i < 100; i++) {
                try {
                    data.decrement();
                }catch (Exception e){
                    e.printStackTrace();
                }
            }
        }, "消费者").start();
    }
}
```

<span style="color:pink">		目前一个生产者一个消费者是没问题的，但是，如果是四个线程同时抢夺资源 data，如果使用 if 进行判断会出现问题（“虚假唤醒”问题），因此，“线程等待” 需要出现在 while 循环中。此处使用的是while（ JDK 官方推荐）。</span>

![在这里插入图片描述](https://img-blog.csdnimg.cn/bb0a6bbe228a4571a483d49867a6b1c4.png)

`[案例]`  基于 ReentrantLock 实现生产者和消费者问题的同步。

​	在 JUC 中具备专门的条件等待队列，同时使用 await 和 signal 可以分别唤醒处于不同条件队列中阻塞的线程，更加具有灵活性，同时也能够比较精确的唤醒。

```java
//首先需要根据锁拿到一个 Condition 对象
condition = lock.newCondition();
// 对应等待方法：await()
condition.await();
//对应唤醒方法：signal()
condition.signal();
```

资源 DataLock：

```java
public class DataLock {
    private int num = 0;

    Lock lock = new ReentrantLock();
    Condition condition = lock.newCondition();

    //生产者生产过程：
    public void increment() throws InterruptedException {
        while (num != 0){
            //等待消费者消费
            condition.await();
        }
        try {
            lock.lock();
            num++;
            System.out.println(Thread.currentThread().getName() + "-----生产了----》" + num);
            //生产完毕，提醒消费者消费
            condition.signalAll();
        }catch (Exception e){
            e.printStackTrace();
        }finally {
            lock.unlock();
        }
    }

    //消费者消费过程
    public void decrement() throws InterruptedException {
        while (num == 0){
            //等待生产者生产
            condition.await();
        }
        try {
            num--;
            System.out.println(Thread.currentThread().getName() + "-----消费了----》" + num);
            //消费完毕，提醒生产者生产
            condition.signalAll();
        }catch (Exception e){
            e.printStackTrace();
        }finally {
            lock.unlock();
        }
    }
}
```

​		主线程中，四个线程的启动没有变化，但是会发现：此时的四个线程执行并没有规律，都是随机生产、随机消费。我们需要完成的是生产 1 生产，消费者 1 消费，生产者 2 生产，生产者 2 消费。======> 此时就是 Condition 的优异的体现。

`[案例]`  使用不同的条件队列来使 A、B、C 线程顺序执行：

DataLockCondition 资源类：

```java
public class DataLockCondition {
    private Lock lock = new ReentrantLock();
    private Condition condition1 = lock.newCondition();
    private Condition condition2 = lock.newCondition();
    private Condition condition3 = lock.newCondition();

    private int flag = 1;

    public void printA(){
        try {
            lock.lock();
            while (flag != 1){
                condition1.await();
            }
            flag = 2;
            System.out.println(Thread.currentThread().getName() + "=====》 AAAAAA");
            //唤醒 B 线程
            condition2.signal();
        }catch (Exception e){
            e.printStackTrace();
        }finally {
            lock.unlock();
        }
    }

    public void printB(){
        try {
            lock.lock();
            while (flag != 2){
                condition2.await();
            }
            flag = 3;
            System.out.println(Thread.currentThread().getName() + "=====》 BBBBBB");
            //唤醒 B 线程
            condition3.signal();
        }catch (Exception e){
            e.printStackTrace();
        }finally {
            lock.unlock();
        }
    }

    public void printC(){
        try {
            lock.lock();
            while (flag != 3){
                condition3.await();
            }
            flag = 1;
            System.out.println(Thread.currentThread().getName() + "=====》 CCCCCC");
            //唤醒 B 线程
            condition1.signal();
        }catch (Exception e){
            e.printStackTrace();
        }finally {
            lock.unlock();
        }
    }
}
```

ConditionDemo 主线程启动：

```java
public class ConditionDemo {
    public static void main(String[] args) {
        DataLockCondition data = new DataLockCondition();
        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    data.printA();
                }catch (Exception e){
                    e.printStackTrace();
                }
            }
        }, "A").start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    data.printB();
                }catch (Exception e){
                    e.printStackTrace();
                }
            }
        }, "B").start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    data.printC();
                }catch (Exception e){
                    e.printStackTrace();
                }
            }
        }, "C").start();
    }
}
```

# 线程池原理分析

## 自定义线程池

`[问题]`  为什么需要线程池呢？

​		因为经常创建、销毁和使用量特别大的资源时（并发情况下的线程），对性能影响很大。那么考虑可以使用`池化技术`，提前创建好多个线程，放入线程池，使用时获取，用完放回，那么就不需要反复的创建和销毁。使用线程池能够`提高响应速度`（减少创建新线程的时间），`降低资源消耗`（重复利用线程池中的线程，不需要每次都创建），同时也便于对`线程进行管理`(corePoolSize 核心线程数量、maximumPoolSize 最大线程数量、keepAliveTime 超时终止时间)。

> 池化技术：事先准备好资源（并不一定准备了就会启用），使用完就能放回，优化资源的使用。类似于线程池、连接池、对象池等等。

`[案例实现]`  利用 JDK 底层的线程池原理实现一个简单的线程池：线程池：ThreadPool，内部 coreSet 存放核心线程集合，int coreSize 存放线程数量限制，等待队列 queue（内部有锁，同时封装取出任务和装载任务功能）、submitTask 提交任务方法。提交任务后就需要一个单独的线程 Node 来进行处理，这个任务可能是刚开始提交直接进入线程池执行，也可能是线程池线程满了暂时放到等待队列等待。具体的 task 任务定义一个 CustomTask 类来表示，方便操作和区分。

1、自定义任务 task，实现 Runnable 接口，方便区分任务。

```java
//为了区分 task ，定义一个 task 类
public class CustomTask implements Runnable{
    private String taskName;

    public CustomTask(String taskName){
        this.taskName = taskName;
    }

    public String getTaskName() {
        return taskName;
    }

    @Override
    public void run() {
        System.out.println("[" + Thread.currentThread().getName()+ "]==========current task:" + taskName);
    }
}
```

2、定义一个线程池，里面应该有提交任务的功能。

```java
public class MyThreadPool{
    private HashSet<MyThreadNode> coreSet;  //核心线程集合
    private int coreSize;   //核心线程数
    private MyThreadPoolQueue queue;

    public MyThreadPool(int coreSize, int queueSize){
        this.coreSize = coreSize;
        this.coreSet = new HashSet<>();
        queue = new MyThreadPoolQueue(queueSize);
    }

    public MyThreadPoolQueue getQueue() {
        return queue;
    }

    //提交一个 Runnable 接口任务：提供具体任务执行（提交任务是单线程）
    public void submitTask(CustomTask target){
        //考虑当前线程池中的核心线程数是否达到上限
        if (coreSet.size() < coreSize){
            System.out.println("[" + Thread.currentThread().getName()+ "]当前线程池中还有空闲线程可用,可以创建线程");
            MyThreadNode node = new MyThreadNode(target, "thread" + (coreSet.size() + 1), this);
            coreSet.add(node);  //核心线程集合装填
            node.start();
        }else {
            System.out.println("[" + Thread.currentThread().getName()+ "]当前线程池核心线程达到上限，" + target.getTaskName() + "任务应该排队");
            queue.put(target);
        }
    }

    public void shutdown(MyThreadNode threadNode){
        coreSet.remove(threadNode);
    }
}
```

3、定义线程池内的线程对提交的任务的具体实现。

```java
public class MyThreadNode extends Thread{
    private CustomTask target;
    private MyThreadPool threadPool;
    private MyThreadPoolQueue queue;

    public MyThreadNode(CustomTask target, String threadName, MyThreadPool threadPool) {
        this.target = target;
        super.setName(threadName);
        this.threadPool = threadPool;
        this.queue = threadPool.getQueue();
    }

    /**
     * 线程执行完毕后不能直接结束，而是应该实现复用
     * 线程到这里执行有两种情况：
     *  1）直接线程池提供的任务.    target != null
     *  2）阻塞队列进来的任务.     (target = queue.poll()) != null
     */
    @Override
    public void run() {
        while (target != null || (target = queue.poll()) != null){
            System.out.println("[" + Thread.currentThread().getName()+ "]当前执行任务：" + target.getTaskName());
            target.run();
            target = null;  //自己执行完就删掉一个任务，避免重复执行
        }
    }
}
```

4、定义等待队列，当当前线程池中的线程都被占用时，此时应该将剩余任务放入等待队列。

```java
//线程满时需要将任务放到等待队列：使用双向链表
public class MyThreadPoolQueue {
    private int queueSize;
    private Deque<CustomTask> queue = new ArrayDeque<>();
    private Lock lock = new ReentrantLock();
    private Condition busyWaitSet = lock.newCondition();    //由于队列达到上限导致的条件队列
    private Condition emptyWaitSet = lock.newCondition();    //由于等待队列没有 task 导致的条件队列

    public MyThreadPoolQueue(int queueSize){
        this.queueSize = queueSize;
    }

    public void put(CustomTask task){
        lock.lock();
        try {
            //判断是否达到队列上限,达到上限时需要阻塞在这里，而不能直接丢弃，因此使用 while
            while (queue.size() == queueSize){
                System.out.println("[" + Thread.currentThread().getName()+ "]put 时等待队列已经达到上限");
                try {
                    busyWaitSet.await();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            System.out.println("[" + Thread.currentThread().getName()+ "]当前线程池等待队列并未达到上限，can put task:" + task.getTaskName());
            queue.addLast(task);
            emptyWaitSet.signal();  //有 task 进来时也需要将空闲条件导致的阻塞唤醒
        }finally {
            lock.unlock();
        }
    }

    public CustomTask poll(){
        lock.lock();
        try {
            System.out.println("[" + Thread.currentThread().getName()+ "]当前 poll 一个 task");
            //需要判断队列中是否有 task
            while (queue.isEmpty()) {
                System.out.println("[" + Thread.currentThread().getName()+ "]当前等待队列中没有 task，阻塞！");
                emptyWaitSet.await();
            }
            CustomTask task = queue.removeFirst(); //返回一个 task 并从等待队列中移除
            System.out.println("[" + Thread.currentThread().getName()+ "]can get a normal task:" + task.getTaskName());
            busyWaitSet.signal();    //当有任务取出后需要唤醒原来因为等待队列上限导致无法入队的 task
            return task;
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
        return null;
    }
}
```

5、测试提交五个任务，线程池大小 2，等待队列 2，此时剩余1个任务就会阻塞等待加入到等待队列。

```java
public class TestPool {
    public static void main(String[] args) {
        MyThreadPool threadPool = new MyThreadPool(2, 2);
        for (int i = 1; i <= 5; i++) {       // 提交五个任务 task
            threadPool.submitTask(new CustomTask("task" + i));
        }
    }
}
```

1）问题一：如果这个任务执行时间过久，task5 则一直没有放入到等待队列，更不可能让线程执行。那么如何实现超时呢，超时就直接不执行任务？则就是需要在队列的放入方法 put 中设置超时时间。

```java
public void tryPut(CustomTask task){
    lock.lock();
    try {
        long remainingTime = timeOut;
        //判断是否达到队列上限,达到上限时需要阻塞在这里，而不能直接丢弃，因此使用 while
        while (queue.size() == queueSize){
            System.out.println("[" + Thread.currentThread().getName()+ "]put 时等待队列已经达到上限");
            try {
                if (remainingTime <= 0) { //时间睡眠到了可以跳出循环
                    System.out.println("[" + Thread.currentThread().getName()+ "]阻塞超时，放弃执行任务！" + task.getTaskName());
                    return;
                }
                //awaitNanos 返回剩余需要睡眠的时间
                remainingTime = busyWaitSet.awaitNanos(remainingTime);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        System.out.println("[" + Thread.currentThread().getName()+ "]当前线程池等待队列并未达到上限，can put task:" + task.getTaskName());
        queue.addLast(task);
        emptyWaitSet.signal();  //有 task 进来时也需要将空闲条件导致的阻塞唤醒
    }finally {
        lock.unlock();
    }
}
```

​		此处实际上已经涉及到线程池的`拒绝策略问题`，可以使用 Spring 源码中常用的`策略者模式`来定义策略在此处使用此策略更具灵活性。

2）四种策略的实现并使用。

​		定义一个策略处理器接口：PolicyHandler，需要传入等待队列和当前来的执行任务。

```java
public interface PolicyHandler {
    public void handler(MyThreadPoolQueue queue, CustomTask task);
}
```

​		此时就需要其他代码，可以实现最外层初始化线程池的时候传入处理器的具体实现，即可实现根据用户自己定义拒绝策略。

```java
//1、修改队列中的当等候队列满了时修改成调用 handler 方法
public void tryPut(CustomTask task){
    lock.lock();
    try {
        // 判断是否达到队列上限,达到上限时需要阻塞在这里，而不能直接丢弃，因此使用 while
        while (queue.size() == queueSize){
            System.out.println("[" + Thread.currentThread().getName()+ "]put " + task.getTaskName() + " 时等待队列已经达到上限");
            System.out.println("=============准备调用拒绝策略================");
            handler.handler(this, task);
            return;
        }
        System.out.println("[" + Thread.currentThread().getName()+ "]当前线程池等待队列并未达到上限，can put task:" + task.getTaskName());
        queue.addLast(task);
        emptyWaitSet.signal();  // 有 task 进来时也需要将空闲条件导致的阻塞唤醒
    }catch (Exception e){
        e.printStackTrace();
    }finally {
        lock.unlock();
    }
}

//2、修改线程池内部逻辑，让 handler 的具体是实现通过用户传入
public MyThreadPool(int coreSize, int queueSize, PolicyHandler handler){
    this.coreSize = coreSize;
    this.coreSet = new HashSet<>();
    queue = new MyThreadPoolQueue(queueSize, 2000, handler);
}

//3、使用时传入具体实现拒绝逻辑到线程池初始化
//3.1 永远等待，没有超时问题：也就是 put 方法
public class TestPool {
    public static void main(String[] args) {
        MyThreadPool threadPool = new MyThreadPool(2, 2, (queue, task) -> {
            queue.put(task);    //拒绝策略1：一直 wait 等待前面任务被取走
            System.out.println(task + "已经被丢弃");     //拒绝策略2：没有执行直接丢弃
            task.run();     //拒绝策略3：都是 main 线程调用的，因此可以直接调用这个任务的 run 方法执行
            throw new RuntimeException("该线程池不支持如此多队列");     //拒绝策略4：直接抛出异常
        });
        for (int i = 1; i <= 5; i++) {       // 提交五个任务 task
            threadPool.submitTask(new CustomTask("task" + i));
        }
    }
}
```

3）问题二：现在线程池中的两个线程在没有任务的情况下还是会一直不停的等待，也应该设置超时，让线程池在没有任务的情况下终止。

```java
public CustomTask tryPoll(long pollTimeOut){
    lock.lock();
    try {
        System.out.println("[" + Thread.currentThread().getName()+ "]当前 poll 一个 task");
        //需要判断队列中是否有 task
        while (queue.isEmpty()) {
            System.out.println("[" + Thread.currentThread().getName()+ "]当前等待队列中没有 task，阻塞！");
            if (pollTimeOut <= 0){
                return null;
            }
            //等待时间超时返回 null,此时就应该终止线程池
            pollTimeOut = emptyWaitSet.awaitNanos(pollTimeOut);
        }
        CustomTask task = queue.removeFirst(); //返回一个 task 并从等待队列中移除
        System.out.println("[" + Thread.currentThread().getName()+ "]can get a normal task:" + task.getTaskName());
        busyWaitSet.signal();    //当有任务取出后需要唤醒原来因为等待队列上限导致无法入队的 task
        return task;
    } catch (InterruptedException e) {
        e.printStackTrace();
    } finally {
        lock.unlock();
    }
    return null;
}
```

## 线程池原理

​		JDK 5.0 开始提供了线程池相关 API ：`ExecutorService` 和 `Executors`。ExecutorService 是真正的线程池接口，其常用子类主要是 ThreadPoolExecutor 和 ScheduledExecutorService 两种。`Executors` 是 ExecutorService 的`生产工厂`，用于创建并返回不同类型的线程池。

​	`ThreadPoolExecutor` 使用一个 int 变量的高 3 位来表示线程池的状态，低 29 位来表示线程的数量。

1）RUNNING：线程池创建出来的初始状态，值状态 111（-1），表示能接受新任务，能执行等待队列中的阻塞任务。

2）SHUTDOWN：当调用 shutdown 方法时的状态，值状态 000（0），表示不能接受新任务，但能执行等待队列中的阻塞任务，也能执行正在执行的任务。

3）STOP：调用 shutdownNow 方法时的状态，值状态 001（1），表示不能接受新任务，打断正在进行的任务，丢弃等待队列中的阻塞任务。

4）TIDYING：表示中间状态，值状态 010（2），表示任务全部执行完，活动线程也没有了。

5）TERMINATED：表示终结状态，值状态 011（3），表示线程池终结。

`[问题]`  为什么使用一个变量表示两种数据呢？

​		因为如果是设置成两个变量分别表示线程池状态和线程的数量，发生改变时就算每个变量的修改都是 CAS 操作，但是两个 CAS 操作之间并不是线程安全的，为了安全考虑，则每次修改两个变量的值就都需要加锁。而如果使用一个变量来表示，则修改时只需要一条 CAS 指令即可，并不需要加锁，效率高。

`[分析]`  分析 ThreadPoolExecutor 的构造方法，具有七个参数可选。（`线程池的七大参数`）

```java
public ThreadPoolExecutor(
    int corePoolSize,		// 核心线程数
    int maximumPoolSize,	// 最大线程数（空闲线程数/应急线程）
    long keepAliveTime,		// 存活时间：空闲线程执行完任务后会等待一段时间死亡
    TimeUnit unit,			//存活时间的单位
    BlockingQueue<Runnable> workQueue,	// 任务等待的阻塞队列
    ThreadFactory threadFactory,		// 线程工厂，是一个接口，需要实现其 newThread 方法，主要为了给线程一个名称（有默认名称）
    RejectedExecutionHandler handler	//拒绝策略 handler，JDK 默认提供四种策略
)
```

`注意`：这里的空闲线程并不会一开始就使用，例如提交三个任务，task1 被 thread1 执行，task2 来时，thread1 被占用，task2 进入阻塞队列，当 task3 来时，thread1 被占用，阻塞队列也没有位置时，才会启动 thread2（空闲线程）来执行 task3，而 task2 则等待 thread1 或 thread2 再来执行。

```java
public class TestThreadExecutorPool {
    public static void main(String[] args) {
        AtomicInteger threadId = new AtomicInteger(0);
        ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(
                1, 2, 3, TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(1),
                (r) -> {return new Thread(r, "t" + threadId.incrementAndGet());},
                new ThreadPoolExecutor.AbortPolicy());

        for (int i = 1; i < 4; i++) {
            threadPoolExecutor.execute(new MyTask("task" + i));
        }
    }

    //表示任务
    static class MyTask implements Runnable{
        private String taskName;
        public MyTask(String taskName) {this.taskName = taskName;}
        @Override
        public void run() {
            System.out.println("[" + Thread.currentThread().getName() + "] 当前开始执行任务:[" + taskName + "]");
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println("任务执行完毕:[" + taskName + "]");
        }
    }
}
```

执行结果验证：发现 task1 被 t1 执行，task3 被 t2 执行。

```shell
[t1] 当前开始执行任务:[task1]
[t2] 当前开始执行任务:[task3]
任务执行完毕:[task1]
[t1] 当前开始执行任务:[task2]
任务执行完毕:[task3]
任务执行完毕:[task2]
```

`[问题]`  如果把上例中的任务数改成 4 会怎么样呢？

​	如果任务有四个，则第四个任务既不能执行也不能放入到阻塞队列中，会执行拒绝策略，直接抛出异常（此处写的拒绝策略是抛出异常）。

`[问题]`  超时时间和线程数量的说明？

​	当空闲线程使用时，工作线程数量会是核心线程数+当前存活的空闲线程数量；当空闲线程达到超时时间后进入会死亡，此时工作线程数量就会是核心线程数。

`[理论]`  线程池的工作方式。

​		线程池中刚开始没有线程，当一个任务提交给线程池后，线程池会创建一个新线程来执行任务，当线程数达到核心线程数上限，这时再加入任务，新加的任务会被加入等待队列当中（前提是有界队列），任务超过了队列大小时，会创建 maximumPoolSize - corePoolSize 数目的线程数目作为空闲线程来执行任务，如果线程到达 maximumPoolSize 仍然有新任务这时会执行拒绝策略。

`[理论]`  实际上并不会直接使用下列 Executors 创建特定类型的线程池的方式创建线程池，而是`使用工厂 Executors 方式来创建线程池`。（`线程池的三大方法`）

1）方式一：指定核心线程数，其他参数使用默认。此种情况比较适合任务量一直，相对耗时的任务（队列会阻塞）。

```java
//此种情况下，只有核心线程，没有空闲线程，且阻塞队列是无界的，可以放任意数量的任务。
public static ExecutorService newFixedThreadPool(int nThreads, ThreadFactory threadFactory) {
    return new ThreadPoolExecutor(nThreads, nThreads,
                                  0L, TimeUnit.MILLISECONDS,
                                  new LinkedBlockingQueue<Runnable>(),
                                  threadFactory);
}
ExecutorService service = Executors.newFixedThreadPool(3);
```

2）方式二：有缓存的线程池，全部使用默认的参数。适合执行短期异步任务，能够实现快速的线程复用（时间短就能复用，时间长就 new 新线程）。

```java
//核心线程数为 0，无数个空闲线程，存活时间 60s，队列使用同步队列（如果没有现成执行完task，则放一个就会 new 新线程取走 task）
public static ExecutorService newCachedThreadPool() {
    return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                  60L, TimeUnit.SECONDS,
                                  new SynchronousQueue<Runnable>());
}
ExecutorService service = Executors.newCachedThreadPool();
```

> `同步队列`：队列中只能存放一个 task，只有当这个 task 被线程取走后，才能继续向队列中放任务。

​		这是一个可根据需要创建新线程的线程池，如果现有线程没有可用的，则创建一个新线程并添加到池中，如果当前有被使用完但是还没销毁的线程，就复用该线程，并时刻终止并从缓存中移除那些已有 60s 未被使用的线程。因此，长时间保持空闲的线程池不会使用任何资源，这种线程池比较灵活。

3）方式三：全部使用默认的参数，核心线程 1，没有空闲线程，无界的阻塞队列。适合任务串行执行的任务。

```java
//多个任务排队执行，只有一个核心线程，没有空闲线程
public static ExecutorService newSingleThreadExecutor(ThreadFactory threadFactory) {
    return new FinalizableDelegatedExecutorService
        (new ThreadPoolExecutor(1, 1,
                                0L, TimeUnit.MILLISECONDS,
                                new LinkedBlockingQueue<Runnable>(),
                                threadFactory));
}
```

​		`串行执行任务`，类似于单线程执行任务，但是区别于单线程的任务执行失败而终止，此线程池会新建一个新线程，来继续执行剩下的任务，保证池的正常工作 （意思就是此线程池`始终会维持一个线程`来实现任务的顺序执行）。

`[理论]`  提交任务的四种方式说明。

1）方式一：提交任务，任务为 Runnable ，没有返回值。

```java
void execute(Runnable command);
```

2）方式二：提交任务，任务为 Callable 或 Runnable，有返回值，返回值为 Future。

```java
<T> Future<T> submit(Callable<T> task);

Future<String> future = service.submit(() -> {
    System.out.println("执行任务");
    return "success";
});
```

> 注意：`Future.get()` 可以获取任务返回值，但是这是一个阻塞方法。

3）方式三：批量执行任务，任务为 collection<Callable>，有返回值，返回值为 List<Future>。

```java
<T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks) throws InterruptedException;
```

4）方式四：执行任意一个，任务是 collection<Callable>，有返回值，返回值是任务的返回值类型 T。（执行一个成功就结束整套任务的执行）

```java
<T> T invokeAny(Collection<? extends Callable<T>> tasks) throws InterruptedException, ExecutionException;
```

`[理论]`  shutdown 和 stop 的说明对比。

1）shutdown 方法只会将线程池状态变为 SHUTDOWN，`不会接收新任务`，不会中断调用线程的执行，但对于已提交任务（即使在等待队列）也会执行完。

> ​		shutdown 线程并不会阻塞调用线程（main 线程）的执行，使用 awaitTermination 方法可以在线程池终结之前做一些收尾工作（回收工作）。
>
> ```java
> boolean awaitTermination(long timeout, TimeUnit unit) throws InterruptedException
> ```
>
> ​		此方法的参数表示超时时间，如果调用 shutdown 方法后超时时间之前线程已经终止了，则不会有任何问题，但是如果是超时时间到了，线程池还未进入终止状态（例如线程池内部产生了死锁），则就会强制终止。

2）shutdownNow 方法会将线程池状态变为 STOP，不会接收新任务，`会中断正在执行的任务`，并且将等待队列中的任务以 List 封装返回，但并不会执行。

------

​		ScheduledExecutorService 子类主要是用作定时任务执行，也是通过 Executors 工厂创建，能够提供对任务执行延时的控制。

`[理论]`  ScheduledExecutorService 线程池的延时任务提交方式。

1）方式一：使用 schedule 方法提交任务（Callable 或 Runnable），参数指定延时时间和单位，返回 ScheduledFuture 对象。

```java
// 创建线程池
ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(1);
// 提交定时方法
public ScheduledFuture<?> schedule(Runnable command, long delay, TimeUnit unit);
public <V> ScheduledFuture<V> schedule(Callable<V> callable, long delay, TimeUnit unit);
```

2）方式二：使用 scheduleAtFixedRate 方法提交任务（Callbale），参数指定延时时间、循环间隔执行时间以及时间单位，返回 ScheduledFuture 对象。

```java
public ScheduledFuture<?> scheduleAtFixedRate(Runnable command,  long initialDelay, long period, TimeUnit unit);
//经过 initialDelay 执行当前任务，后面每隔 period 时间再执行一次
```

​		但是这个方法会被任务内部的代码执行时间影响，如果任务内部执行时间超过 period ，则会按照任务执行完执行下一次，如果不超过 period 时间，则会等待 period 时间到了执行下一次。

3）方式三：使用 scheduleWithFixedDelay 方法提交任务（Runnable），参数指定延时时间、循环间隔执行时间以及时间单位，返回 ScheduledFuture 对象。

```java
public ScheduledFuture<?> scheduleWithFixedDelay(Runnable command, long initialDelay, long delay, TimeUnit unit);
```

​		和 scheduleAtFixedRate 不同，scheduleWithFixedDelay 会等待任务执行完后，再过 delay 时间才执行下一次任务。

`[案例]` 每周周三 08 点 00 分 00 秒执行任务：同步 redis 和 mysql 的数据。

```java
public class TestFactory {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(2);
        //需要考虑当前编码时间距离第一次执行任务的时间 和 下一次执行时间（周期）
        LocalDateTime currentTime = LocalDateTime.now();
        LocalDateTime targetTime = currentTime.withHour(8).withMinute(0).withSecond(0).with(DayOfWeek.WEDNESDAY);
        if (targetTime.compareTo(currentTime) < 0) targetTime = targetTime.plusWeeks(1);
        long initialDelay = Duration.between(currentTime, targetTime).toMillis();
        long delay = 1000 * 60 * 60 * 24 *7;
        scheduledExecutorService.scheduleWithFixedDelay(() -> {
            ConstantUtils.printMessage("redis sync");
            ConstantUtils.printMessage("mysql sync");
        },initialDelay, delay, TimeUnit.MICROSECONDS);
        ConstantUtils.printMessage("main end .....");
    }
}
```

------

`[问题]`  分析线程池的原理。

1、分析下面的代码，线程池中有 1 core，1 个空闲队列，等待队列有 5 个位置，那么 6 个任务会使用几个线程执行呢？

```java
public static void testPoolSize(){
    poolExecutor = new ThreadPoolExecutor(1, 2, 3, TimeUnit.SECONDS, new ArrayBlockingQueue<>(5));
    for (int i = 1; i <= 6; i++) {
        poolExecutor.execute(() -> {
            ConstantUtils.printMessage("worker thread size = " + poolExecutor.getPoolSize());
        });
    }
    poolExecutor.shutdown();
}
```

​	发现始终是一个核心线程来执行。在《并发编程的艺术》 书中说明当队列能够存放下任务数量时不会启用空闲救急线程。

2、如果将核心线程改成 0，将空闲线程和等待队列大小改为无限大， 结果发现还是一个线程执行，但是是空闲线程，此处没有写 shutdown 方法，但是任务执行完后，空闲线程销毁了，线程池也就停止了。那么为什么呢？

```java
public static void testIdePoolSize(){
    poolExecutor = new ThreadPoolExecutor(0, 1000, 3, TimeUnit.SECONDS, new ArrayBlockingQueue<>(10000));
    for (int i = 1; i <= 6; i++) {
        poolExecutor.execute(() -> {
            ConstantUtils.printMessage("worker thread size = " + poolExecutor.getPoolSize());
        });
    }
}
```

`[分析]`  主要分析为什么核心线程为 0，依旧能够执行任务？线程池核心线程为什么不会销毁，而空闲线程能够销毁？（分析源码）

![](D:\NoteBook\核心笔记\多线程原理详解\image\线程池原理.png)

`[结论]`  当核心线程不为 0 时，队列中有空闲时不会使用空闲线程，当核心线程为 0 时，队列中有空闲时也会启动`一个空闲线程`执行任务，避免任务不被执行。

## 线程池案例及优化

`[案例]`  以银行柜台办理业务为例来说明线程池的使用，此处使用的是 ThreadPoolExecutor 来创建线程池，同时说明线程池的四大拒绝策略。

![在这里插入图片描述](https://img-blog.csdnimg.cn/70f88b21de9f479abc3bb0c4aeddce95.png)

1）1，2 柜台最初开放（核心线程池大小），3、4 和 5 最初处于关闭。（一起称为最大线程池大小）

2）当候客区满员时，3、4 和 5 开放，此时达到最大并发量。（候客区就是阻塞队列）

3）而当候客区也满了，再来新的人就得要么走，要么等待阻塞队列释放一个资源。（这就是拒绝策略）

4）如果候客区没人，3、4 和 5 也没人办理业务，就会再关闭窗口。（超时不候释放）

```java
public class MyPool {
    public static void main(String[] args) {
        ExecutorService threadPool = new ThreadPoolExecutor(
                2,
                5,
                3,
                TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(3),
                Executors.defaultThreadFactory(),
                new ThreadPoolExecutor.AbortPolicy()    //银行满了，还有人进来，就不处理这个人，同时抛出异常.
        );
        try {
            //最大承载 = 队列容量 + 最大线程池大小
            for (int i = 1; i <= 8; i++) {
                threadPool.execute(() -> {
                    System.out.println(Thread.currentThread().getName());
                });
            }
        }catch (Exception e){
            e.printStackTrace();
        }finally {
            threadPool.shutdown();
        }
    }
}
```

`[理论]` 线程池的四大拒绝策略。

​	从线程池的参数可以直到，其中有一个线程池的拒绝策略问题，指的就是当线程池中线程都被占用，且等待队列也满的同时对于后来的任务进行的操作策略。

1）AbortPolicy：不处理，且抛出异常。

```java
new ThreadPoolExecutor.AbortPolicy()); //银行满了 还有人进来，不处理这个人的，并且抛出异常。
```

2）CallerRunsPolicy：主线程执行。

```java
new ThreadPoolExecutor.CallerRunsPolicy()); //哪来的去哪里！（主程序来的主程序执行）。
```

3）DiscardPolicy：直接丢掉任务。

```java
new ThreadPoolExecutor.DiscardPolicy()); //队列满了，丢掉任务，不会抛出异常。
```

4）DiscardOldestPolicy：竞争获取任务被执行的机会。

```java
new ThreadPoolExecutor.DiscardOldestPolicy()); //队列满了，尝试和最早的竞争，竞争失败直接丢掉，也不会抛出异常。
```

`[拓展]`  线程池内的线程个数如何选择呢，即线程池内的最大线程数如何定义？（调优问题）

1）针对 CPU 密集型：几核就定义为几个线程，可以保持 CPU 的效率最高。

2）针对 IO 密集型：需要判断程序十分耗 IO 的线程数，一般设置为其 2 倍大小。

# JMM 原理

## 并发问题

`[前置]`  CPU 内存和 IO 设备的了解。

​		CPU、内存、I/O 设备都在不断迭代，在这个快速发展的过程中，有一个核心矛盾一直存在，就是这三者的速度差异。CPU 和内存的速度差异可以形象地描述为：CPU快于内存快于 I/O 设备，程序里大部分语句都要访问内存，有些还要访问 I/O ，所以程序整体的性能取决于最慢的操作——读写 I/O 设备，也就是说单方面提高 CPU 性能是无效的。为了合理利用 CPU 的高性能，平衡这三者的速度差异，计算机体系结构、操作系统、编译程序都做出了贡献，主要体现为：`CPU 增加了缓存`，以均衡与内存的速度差异；操作系统增加了进程、线程，以`分时复用` CPU，进而均衡 CPU 与 I/O 设备的速度差异；`编译程序优化指令`执行次序，使得缓存能够得到更加合理地利用。

`[理论]`  可见性问题分析。

​		单核计算机所有的线程都是在一个 CPU 上的一个 core 上执行，CPU 缓存与内存的数据一致性容易解决。因为所有线程都是操作同一个 CPU 的同一个 core 的缓存，一个线程对缓存的写，对另外一个线程来说一定是可见的，一个线程对共享变量的修改，另外一个线程能够立刻看到。但是进入`多核`时代，每个 core 都有自己的 cache，这时 core 的缓存与内存的数据一致性就没那么容易解决了，当多个线程在不同的 core 上执行时，这些线程操作的是不同的 core 缓存。比如下图中，线程 t1 操作的是 core1 上的缓存，而线程 t2 操作的是 core2 上的缓存，这个时候线程 t1 对变量 x 的操作如果没有及时写回主存那么对于线程 t2 而言就不具备可见性了。

![](D:\NoteBook\核心笔记\多线程原理详解\image\可见性问题.png)

网上的流传着一个代码，很多都说是可见性问题，再来引用 `R大` 的解释：

```java
private static boolean flag = false; 
public static void main(String[] args) throws InterruptedException {
    new Thread(() -> {
        while (!flag) {

        }
        System.out.println("循环结束，flag 为:" + flag);
    }).start();
    System.out.println("main 线程启动");
    Thread.sleep(1000);
    flag = true;
    System.out.println("main 线程设置 flag 为:" + flag);
}
```

​		R 大认为最后是可见性问题，但并不是因为读取不一致导致，而是因为 Java 的指令优化导致的，如果 while 循环体中没写代码块，那么这个循环就不会停止，因为 Java 对其进行了编译优化：

```java
while (!flag) {
	while(true){
        
    }
}
```

​		因此就算后面将这个 flag 的值变为了 true，但是此时已经是在循环体内便不会停止。但是当我们在循环体内随便写一句代码，例如打印语句 sout，这个循环便可以停止，因此也说明了并不是由于读取不一致导致的，而是因为里面有代码块后，Java 并不会对其进行编译优化成循环嵌套的结构，也就能结束循环。

`[验证]`  试图验证 Java 的可见性问题。

```java
public class Test03 {
    public static void main(String[] args) {
        MyThread t = new MyThread();
        t.start();

        while (true){
            if (t.getFlag()){
                //ConstantUtils 类似于 sout
                ConstantUtils.printMessage("主线程进入循环......");
            }
        }
    }
}

class MyThread extends Thread{
    private boolean flag = false;

    @Override
    public void run() {
        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        this.flag = true;
        ConstantUtils.printMessage("flag = " + this.flag);
    }

    public boolean getFlag(){
        return this.flag;
    }
}
```

​	此时验证发现即使过了 1s 修改了 flag = true，但是依旧不会进入 if 判断语句块打印语句，修改代码将 if 块内加上 sout 后打印，发现此时便能够进入 if 语句块，这又是为什么呢？目前还不清楚，网上有人解释是因为 sout 打印语句加锁了（sout 源码确实加锁 synchronizer 了），而当一个线程进入 synchronizer 代码块后，线程获取到锁，会`清空本地内存`，然后从主内存中`拷贝共享变量的最新值`到本地内存作为副本，执行代码，又将修改后的副本值刷新到主内存中，最后线程释放锁。

​	但是此时我们还可以验证，在 if 块上面加上 for 循环 new Object()，此时也能够进入循环，这又是为什么呢？（`直接两次 new Object() 是不行的`）

```java
for (int i = 0; i < 2; i++) {
    new Object();
}
```

​		目前我还无法解释这个问题，有待验证 Java 的可见性到底是怎么样的。

------

`[理论]`  编译优化`（指令重排）`问题说明。

1、先看看 CPU 的调度以及线程的上下文切换情况：

```java
public class Test04 {
    // 新建几个静态变量
    public static int a = 0 , b = 0;
    public static int x = 0 , y = 0;
    public static void main(String[] args) throws Exception {
        int count = 0;
        while(true){
            count++;
            a = 0 ;
            b = 0 ;
            x = 0 ;
            y = 0 ;

            Thread t1 = new Thread(new Runnable() {
                @Override
                public void run() {
                    a = 1;
                    x = b;
                }
            });

            Thread t2 = new Thread(new Runnable() {
                @Override
                public void run() {
                    b = 1;
                    y = a;
                }
            });

            t1.start();
            t2.start();
            t1.join();
            t2.join();
            // 得到线程执行完毕以后 变量的结果。
            ConstantUtils.printMessage("第" + count + "次输出结果：i = " + x + " , j = " + y);
            //验证是否存在某个结果可能性
            if(x == 1 && y == 1){
                break;
            }
        }
    }
}
```

​	结果有几种可能性：

1）x = 0，y = 1 情况：t1 先启动将 a = 1， x = 0；t2 再启动 b = 1，y = a = 1。（直接理解情况下，但实际上会发生 CPU 线程的切换）

2）x = 1，y = 1 情况：t1 启动执行 a = 1，t2 执行 b = 1，y = a = 1，再 t1 执行 x = b = 1。

3）x = 1，y = 0 情况：t2 执行 b = 1，y = a = 0，t1 执行 a = 1，x = b = 1。

​	按此时的代码，a 和 b 总是起码有一个先执行的，那么就不可能发生 x = 0 同时 y = 0 的情况，`除非发生指令重排`，将 x 和 y 的赋值放在前面才可能：

```shell
t1:
x = b;
a = 1;

t2:
y = a;
b = 1;
# 可能发生 x = 0，y = 0 的情况下的指令顺序
```

​		结果验证让代码一直跑并多次尝试，直到某一次第 858407 轮出现 x = 0，y = 0 的情况，因此可以验证 Java 编译时具有编译优化（指令重排）的机制。

​		禁止指令重排可以使用 `volatile` 关键字修饰修改的变量，拒绝指令重排。

`[问题]`  那么为什么会发生指令重排的编译优化呢？`指令重排能够提高处理的速度`。

> Jvm 线程的工作内存：CPU 的二级缓存。

```java
//原来的指令：9 条
x = 3;	//load x ，set x，store x
y =4；	//load y ，set y，store y
x =x + 6;	//load x,set x,store x

//如果存在编译优化，指令重排: 7 条
x = 3;	//load x ，set x
x =x + 6;	//set x, store x
y =4；	//load y ，set y，store y
```

`[案例]`  单例模式中的双重校验问题。

1）线程安全的单例模式：能够保证线程安全，但是效率低，是串行执行 getInstance 方法。

```java
public synchronized static Test05 getInstance(){
        if (INSTANCE == null) INSTANCE = new Test05();
        return INSTANCE;
}
```

2）双重校验版本：有可能线程安全问题，但效率高。例如 1000 线程来 getInstance，第 t1 线程拿到锁后，t2 ~ t20 线程阻塞在这里，此时 t1 释放锁，那么 t21 往后的线程来 getInstance 时都不会去拿锁，而是直接返回 INSTANCE。

```java
public synchronized static Test05 getInstance(){
    if (INSTANCE == null) {
        synchronized (Test05.class){
            if (INSTANCE == null) {
                INSTANCE = new Test05();
            }
        }
    }
    return INSTANCE;
}
```

​	但是这种版本 `INSTANCE = new Test05()` 还是可能会发生指令重排，假设此语句包括三条指令：a 分配内存、b 初始化、c 地址赋值 ，那么如果发生指令重排，先分配内存，进行地址赋值给 INSTANCE，最后再进行初始化。这种情况下就可能会：t1 拿到锁，将地址赋值完成，此时 t2 来了判断外层的 INSTANCE == null ，发现不成立，直接 return INSTANCE，但是此时里面的所有变量和方法都是未进行初始化的。

解决办法：给 INSTANCE 加上 `volatile 关键字`，禁止指令重排。

> `注意`：synchronized 是能够维持原子性，但是还是可能会发生线程的切换，只是说保护的临界区的代码的结果不会被其他线程干扰。

------

`[理论]` 线程切换的说明：之前对一个 int count 变量使用 100 个线程加 1 循环 10000 次的案例就是验证这个问题，同时对 count 加上 volatile  关键字，结果发现 count 依旧不是 1000000 ，而是一直小于 1000000 ，为什么呢？volatile 保证了可见性，但是还是有`线程的切换`，多个线程拿到同一个 count，未写入时，都加 1，再放回去时是一样的值，因此最终结果一直是小于的，实际就是`不能保证原子性`。

​		解决办法：使用 AtomicInteger 代替原来的 int ，调用其 incrementAndGet 方法加 1，既能保证原子性也能保证可见性。

## JMM 内存模型

​		`JMM` 是指Java 内存模型，是一种虚拟的东西，是一种概念，一种约定（规则）。

​		导致可见性的原因是`缓存`的存在导致不能及时更新，导致有序性的原因是`编译优化`，那解决可见性、有序性最直接的办法就是`禁用缓存和编译优化`，但是这样问题虽然解决了，程序的性能下降了。合理的方案应该是`按需禁用缓存以及编译优化`，（`需`：happens-before 原则）也就是需要提供给程序员按需禁用缓存和编译优化的方法，这些方法包括 volatile、 synchronized 和 final 三个关键字，以及六项 Happens-Before 规则。

`[问题]`  为什么定义 Java 内存模型？（Java 内存模型是为了屏蔽 Java 应用程序在不同硬件上运行所带来的差异的问题，主要包含 volatile关键字、 synchronized 关键字（不能保证指令重排）和 final 三个关键字，以及六项 Happens-Before 规则）

​		Java 内存模型是个很复杂的规范，站在程序员的视角，本质上可以理解为：`Java 内存模型规范了 JVM 如何提供按需禁用缓存和编译优化的方法`。现代计算机体系大部是采用的对称多处理器的体系架构。每个处理器均有独立的寄存器组和缓存，多个处理器可同时执行同一进程中的不同线程，这里称为处理器的乱序执行。在 Java中，不同的线程可能访问同一个共享或共享变量。如果任由编译器或处理器对这些访问进行优化的话，很有可能出现无法想象的问题，这里称为编译器的重排序。除了处理器的乱序执行、编译器的重排序，还有内存系统的重排序。因此 Java 语言规范引入了Java 内存模型，通过定义多项规则对编译器和处理器进行限制 ，主要是针对可见性和有序性。 `Java 内存模型涉及的几个关键词：锁、volatile 关键字、final 修饰符与对象的安全发布`。第一是锁， 锁操作是具备 happens-before 关系的，解锁操作 happens-before 之后对同一把锁的加锁操作。实际上，在解锁的时候，JVM需要强制刷新缓存，使得当前线程所修改的内存对其他线程可见。第二是 volatile 字段，volatile 字段可以看成是一种不保证原子性的同步但保证可见性的特性，其性能往往是优于锁操作的。但是，频繁地访问 volatile 字段也会出现因为不断地强制刷新缓存而影响程序的性能的问题。第三是 final 修饰符，final 修饰的实例字段则是涉及到新建对象的发布问题。当一个对象包含 final 修饰的实例字段时，其他线程能够看到已经初始化的 final 实例字段，这是安全的。

`[理论]`  关于 Java 的 Happens-Before 原则。（Happens-Before 是一种原则，Jvm 规定要求实现成这个原则标准，但具体实现是很多方法的）

> A Happens-Before B 表示 A 的操作对 B 是可见的。

​	1）程序次序规则：在一个线程内，按照程序代码顺序，编写在前面的操作是 Happens-Before 编写在后面的操作。准确地说，应该是控制流顺序而不是程序代码顺序，因为要考虑分支、循环等结构，但是 `Happens-Before 原则是对结果负责`。 

> ​	例如对 a 和 b 定义，那么就称作：前一条语句是 Happens-Before 后面的语句的，也就是 a 对 b 是可见的。
>
> ```java
> int a = 1;
> int b;
> ```
>
> ​	但是 Jvm 又会发生指令重排，就无法保证 a 和 b 的顺序。（此处 a 和 b 没有直接联系，重排序是没有关系的）

​	2）一个 unlock 操作 Happens-Before 后面对 `同一个锁` 的 lock 操作，意思就是说后面的线程能够对前面加同一把锁线程的操作可见。

​	3）volatile 变量规则：对一个 volatile 变量的写操作 Happens-Before 后面对这个变量的读操作，但是 hotsport 如何实现这个规则是内存屏障实现的。

​	4）线程启动规则：线程 start() 方法前的操作 Happens-Before 此线程内的操作，意思就是此线程内启动前的操作对线程内是可见的。

​	5）线程终止规则：线程中的所有操作都 Happens-Before 对此线程的终止检测，可以通过 join() 方法结束、isAlive() 的返回值等手段检测到线程已经终止执行。

​	6）Happens-Before 原则具备传递性。

```java
public class Test05 {
    static int a = 0;
    static volatile boolean flag = false;

    public static void main(String[] args) throws InterruptedException {
        new Thread(() -> {
            a = 50;
            flag = true;
        }).start();
        TimeUnit.SECONDS.sleep(1);
        ConstantUtils.printMessage("a = " + a + ", flag = " + flag);
    }
}
```

​		a Happens-Before flag 操作，线程内的操作 Happens-Before start() 执行前的操作，而对于 volatile 变量，写操作 Happens-Before 读操作，因此线程内的 a 的操作代码也 Happens-Before 最后的 flag 和 a 的读操作。（因此有开发者会将定义的最后一个变量加 volatile 修饰，让前面的变量都具备可见性）

> 不定义在前面也不代表就不具备可见性，此处线程外的代码 Happens-Before 线程内的代码，因此本身也就具备可见性。

## volatile 关键字

​		`volatile` 保证可见性，并禁止指令重排，但是不保证原子性。

`指令重排`是指所编写的代码会被 JVM 编译器、CPU 或内存根据`数据之间的依赖性`进行合适的优化变更执行的次序，但有时候并不希望次序被变更。

> Java 中所有禁止指令重排的原因都是为了保证 `可见性` 。

指令重排有三个级别：编译器级别（字节码层级）、CPU 指令重排、内存级别引起的乱序。

1、编译器级别：也就是 JVM 字节码的层面就可以看到的重排。

2、CPU 级别指令重排：CPU 为了减少跟内存的交互，力图只跟寄存器交互进行优化而造成的重排（没有依赖关系情况下）。`硬件级别`

3、内存级别引起的乱序：mesi 规定（维持多核状态下的缓存一致的协议：异步的一致性同步方式）

> 查看 CPU 多少核：
>
> ```java
> Runtime.getRuntime().availableProcessors();
> ```
>

​	t2 线程占用 core2 运行，先将 a = 0 缓存进来自己的工作空间，此时发生上下文切换，t1 获得执行权（core1），由于 t2 已经缓存了 a，那么 t1 会直接从 t2 的工作空间获取 a，修改 a = 2，并从主存中缓存 b = 1，此时就需要将 a = 2 同步到 core2 （异步同步：先将 a = 2 放到 core1 的 store buffer，如果直接放回 core1 的缓存中则会导致数据不一致），此时再切换回 t2 的 core2 执行，就会从 core1 中拿 b = 1，但此时在 core2 中 a 还是等于 0。因此最后结果看起来是 b = 1 先执行，a = 2 处于半执行状态，还在 store buffer 中。

> 有了 mesi 为什么还有可见性问题？
>
> mesi 就是保证了缓存的一致性，但是 core 和 缓存之间还有一层 store buffer，因此线程之间并`没有立刻达到可见性`。
>
> 没有 store buffer 就没有可见性问题，但是这时只能`同步的`（异步的同步方式效率高，同步的同步方式需要等待回应才继续向下执行）更新其他 core 的相同变量数据，会影响效率，因此引入了 store buffer。

那么如何解决这个 store buffer 的问题呢？（立马可见性问题） ====> `内存屏障`

​		内存屏障可以理解成在两条指令之间加了一道墙，互相看不到，只有当将该数据 load 过来后才会执行让 b 更新数据。

`[问题]`  那么 volatile 关键字是如何禁用指令重排保证可见性的呢？

```java
volatile static int a；
a = 1;
```

​		1）加了 volatile 关键字后，在 JVM 层面的汇编语句是没有区别的，都是 pushstatic，但是在字段属性上是加上了一个`标识 0X0048[static volatile ]`，不加 volatile 关键字时是 `0X0008[ static ]`，CPU 操作时就会判断是否加了这个标识，`加了标识 0X0048 就会加上内存屏障`。

> IDEA 安装插件 jclasslib 后可以在 view 里面看到编译后的 JVM 字节码文件。

​		2）加 volatile 关键字前后，JVM 层面的汇编语句（字节码指令）是没区别，但是翻译成真正的汇编指令时，这个层级的汇编语句是`不一样`的。

​		如果加了 volatile 关键字，根据 jvm 底层源码，会执行 pushstatic 指令，该指令中，会先判断有没有被 volatile 修饰，再判断数据类型，数据类型确定并拿到其操作指针（内存地址），后会执行：`OrderAccess::storeload() ` 就是添加内存屏障（四种屏障级别，四种级别的力度不相同，当前 storeload 最高级别）。进而调用 fence() 方法，使用 C++ 的底层 volatile 关键字来`防止 gcc 优化无用的代码`（因为后面会使用` lock 指令`有一个空操作，用来锁总线：让需要异步同步数据的 core 没办法拿到总线，无法继续执行，反而是必须先来进行数据同步，同时锁住总线也能让`数据刷回主存`时只有一个线程 core 来进行操作，防止脏数据问题），因此实现了内存屏障。内存屏障可以简单理解成下图所示的禁止指令重排，但实际上远不止如此：

![在这里插入图片描述](https://img-blog.csdnimg.cn/2e1c7d29c00845ed85e2923d462a600a.png)

`[总结]`  JMM 要求加了 volatile 关键字后，需要实现一个 storeload 级别的内存屏障，在 hotsport 虚拟机上，使用的是 storeload 的方法，底层添加了 lock 的汇编指令，会去锁住总线，同时加上内存屏障，保证指令不重排，同时保证对共享变量的操作时是线程独占的，因此既保证了指令的有序性，又保证了可见性。

​		volatile 在单例模式里面使用的最多，特别是 `DLC懒汉式`。

`[理论]`  JMM 同步的约定规则：（`JMM 就是线程的工作内存和主内存之间的一种约定`）
1）线程解锁前，必须把共享变量立刻刷回主存。比如某个线程将主存上的变量拷贝到自己的工作空间后，用完了过后(可能会修改)，必须立即更新到主存上。

2）线程加锁前，必须读取主存中的最新值到工作内存中。

3）加锁和解锁是同一把锁。

![在这里插入图片描述](https://img-blog.csdnimg.cn/7934cad3400c4b17b10c66a1c044d97c.png)

​		JMM 内存交互操作有 8 种，虚拟机实现必须保证每一个操作都是原子的，不可在分的（对于 double 和 long 类型的变量来说，load、store、read 和 write 操作在某些平台上允许例外）。

1）lock （锁定）：作用于主内存的变量，把一个变量标识为线程独占状态。

2）unlock （解锁）：作用于主内存的变量，它把一个处于锁定状态的变量释放出来，释放后的变量才可以被其他线程锁定。

3）read （读取）：作用于主内存变量，它把一个变量的值从主内存传输到线程的工作内存中，以便随后的load动作使用。

4）load （载入）：作用于工作内存的变量，它把read操作从主存中变量放入工作内存中。

5）use （使用）：作用于工作内存中的变量，它把工作内存中的变量传输给执行引擎，每当虚拟机遇到一个需要使用到变量的值，就会使用到这个指令。

6）assign （赋值）：作用于工作内存中的变量，它把一个从执行引擎中接受到的值放入工作内存的变量副本中。

7）store （存储）：作用于主内存中的变量，它把一个从工作内存中一个变量的值传送到主内存中，以便后续的write使用。

8）write（写入）：作用于主内存中的变量，它把 store 操作从工作内存中得到的变量的值放入主内存的变量中。

`[问题]`  如果线程 B 拿到 Flag = true，后面在线程 A 还未刷回之前，对 Flag 进行了修改并刷回了主内存，但线程 A 此时并不知道主内存的值已经被修改？

![在这里插入图片描述](https://img-blog.csdnimg.cn/64a2a0f3c23c43d893969b10c4f31bfa.png)

# ForkJoin 实现

​	分支合并 `ForkJoin`：JDK 1.7出现，主要用于并行执行任务，分而治之，提高效率。（大数据下经常使用 MapReduce：大任务拆成小任务再合并）。

`[案例]`  将一亿数据分成四个线程执行，或者直接按照以前的单线程执行，两种方案哪种方案快呢？（可使用 jmh 测试）

​		大多数情况下是多个线程并行执行快，但是如果电脑 Cpu 性能好，那么二者时间就会很接近（因为内部会自己拆分任务）。但实际上对于单核计算机来说，多线程的并行执行并没有什么用，反而可能还会比单线程执行性能更差（上下文切换比较耗费性能）。

​		这里手动实现分治还是存在一些问题：每个任务的执行时间不同，但是这里某个任务执行完后会直接关闭。而 ForkJoin 优点就是：`分而治之`、`工作窃取`，充分利用线程的性能和 CPU 并行的特点。

`[理论]`  Forkjoin 的使用流程。

1）实例化一个 ForkJoinPool。

2）实现一个类表示任务，这个类需要继承 ForkJoinTask，而一般使用继承 RecursiveTask（继承了 ForkJoinTask，有返回值），重写 compute() 方法。

​		Forkjoin 实际考虑的是拆分的手段，主要就是对任务`利用一定的算法来进行拆分`，而后将结果合并。

3）启动任务执行：invoke 或者 submit 方法。

> 工作窃取的前提：线程中维护的都是双端队列，上下都可以取出任务。

`[案例]`  使用 Forkjoin 实现计算，每个任务最多使用 10000 个数计算。（此处使用的是二分查找的思想）

```java
public class Test02 extends RecursiveTask<Long> {

    private Long start;
    private Long end;
    private Long temp = 10000L;	//临界值

    public Test02(Long start, Long end){
        this.start = start;
        this.end = end;
    }

    //实际的计算方法，继承 RecursiveTask 后必须重写
    @Override
    protected Long compute() {
        if (end - start < temp){
            Long sum =0L;
            for (Long i = start; i < end; i++) {
                sum += i;
            }
            return sum;
        }else {
            //如果数据量过大，使用 forkjoin 递归
            long mid = (end - start) << 1 + start;
            Test02 task1 = new Test02(start, mid);
            task1.fork(); //拆分任务，将任务压入线程队列
            Test02 task2 = new Test02(mid + 1, end);
            task2.fork(); //拆分任务，将任务压入线程队列
            return task1.join() + task2.join();
        }
    }
}
```

`[案例]`  针对三种方法进行对比：1）普通直接计算；2）普通 forkjoin 计算；3）Stream 流式 reduce 计算（Jdk 1.8 并行流）。

```java
public class Test03 {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        test1();  // 7064ms
        test2();  // 4675ms
        test3();  // 251ms
    }

    //普通计算
    public static void test1(){
        long start = System.currentTimeMillis();
        Long sum = 0L;
        for (Long i = 1L; i < 10_0000_0000; i++) {
            sum += i;
        }
        long end = System.currentTimeMillis();
        System.out.println("sum=" + sum + ", 时间为：" + (end - start));
    }

    // 使用 forkjoin 的普通计算方式
    public static void test2() throws ExecutionException, InterruptedException {
        long start = System.currentTimeMillis();
        ForkJoinPool forkJoinPool = new ForkJoinPool();
        //调用之前定义的 Test02 上的 ForkJoinTask 对象
        ForkJoinTask<Long> task = new Test02(0L, 10_0000_0000L);

        ForkJoinTask<Long> submit = forkJoinPool.submit(task); //提交任务（执行任务）
        //forkJoinPool.execute(task); //执行任务，没有返回值
        Long sum = submit.get();
        long end = System.currentTimeMillis();
        System.out.println("sum=" + sum + ", 时间为：" + (end - start));
        forkJoinPool.shutdown();
    }

    //使用 stream 流式计算利用 reduce
    public static void test3(){
        long start = System.currentTimeMillis();
        // range:包前不包尾，半开区间
        // rangeClosed:包前包尾，闭区间
        // parallel:并行计算
        LongStream.rangeClosed(0L, 10_0000_0000L).parallel().reduce(0, Long::sum);
        long end = System.currentTimeMillis();
        System.out.println("sum=" + ", 时间为：" + (end - start));
    }
}
```

​	最后发现流式 reduce 计算效率比其他方法高几十倍（但 Stream 流式计算并不是适用所有场景）。
