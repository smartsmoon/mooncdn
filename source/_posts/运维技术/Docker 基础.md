---
title: Docker 的基本使用
date: 2022-05-20 00:00:00
type:
comments:
tags: 
  - Docker
  - 项目部署
categories: 
  - 运维技术
description: 主要讲述 Docker、Docker0、Docker compose 的基本使用
swiper_index: 2
keywords: Docker
cover: https://w.wallhaven.cc/full/e7/wallhaven-e7dy9w.jpg
top_img: https://w.wallhaven.cc/full/e7/wallhaven-e7dy9w.jpg
---

# Docker 概述

## Docker 来由

​		Docker 为什么会出现呢？

一个系统，需要经历：`开发 到 上线`，起码需要两套`环境`，同时还需要`配置`。

这个时候就`开发和运维`之间可能出现一个问题：开发人员在自己电脑上可以运行，但是运维人员却运行不了，为什么呢？如何解决呢？===> `开发学运维`。

​		举例：一个项目环境： jar + (Redis MySQL JDK ES 等) 

1、以前的部署方式：

​		每一个机器都要部署环境(集群Redis、ES、Hadoop…)，费事费力，开发负责开发 jar 包，运维负责项目运行部署，同时不能跨平台。

2、现在使用 `docker` 部署：`项目带上环境`进行部署，开发打包部署上线。

​		docker流程：jar 包（环境） — 打包项目带上环境（镜像） — ( Docker仓库：商店）—— 下载我们发布的镜像 — 直接运行

​		Docker的思想就来自于`集装箱`。核心思想：`隔离`

`隔离`：将应用打包装箱，每个箱子是互相隔离的，通过隔离机制，可以`将服务器利用到极致`。

![](https://pic1.imgdb.cn/item/63369ced16f2c2beb16ba63e.png)

## Docker 历史

​		dotcloud 公司开发，最初是做一些 pass 的云计算服务（LXC 容器化技术），后来将容器化技术命名为 `docker` ，同时进行`开源`（Go 语言）。

在容器化技术出来之前，使用虚拟机技术（笨重），虚拟机也属于虚拟化技术，Docker 容器技术，也是一种`虚拟化技术`，但是 docker 确能做到`轻巧`。

> Docker 官网：`https://www.docker.com/`。
>
> 官方仓库：`https://hub.docker.com/`，用于搜寻镜像。

## Docker 作用

虚拟化技术比较：比较Docker和虚拟机技术的不同。

1）传统虚拟机，虚拟出一套硬件，运行一个完整的操作系统，然后在这个系统上安装和运行软件。

2）`容器化技术`（Docker），容器内的应用`直接运行在宿主机的内核`之上，容器是没有自己的内核的，也没有虚拟我们的硬件，非常轻便。但`每个容器间是互相隔离`，每个容器内都有一个属于自己的文件系统，互不影响。`极大利用宿主机的资源`

`问题`：那么，Docker 为什么比 VM 快？

​		Dokcer 有着比虚拟机更少的`抽象层`。由于 docker 不需要 Hypervisor 实现硬件资源虚拟化，运行在 docker 容器上的程序直接使用的都是实际物理机的硬件资源。因此在CPU、内存利用率上 docker 将会在效率上有明显优势。

​		同时，docker 利用的是宿主机的内核，vm 需要是 Guest OS（就是 centos 操作系统）。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719100837873.png)

## DevOps

​		`DevOps`：开发和运维。

四个特点：

1）应用更快速的交付和部署。传统是通过一堆帮助文档来安装程序，而 Docker 则是打包镜像发布测试一键运行。

2）更便捷的升级和扩缩容。Docker 部署应用就和搭积木一样，项目打包为一个镜像，服务器A性能不够，直接在服务器B 上运行一套。

3）更简单的系统运维。在容器化之后，我们的开发，测试环境都是高度一致的，不会出现运行不一致情况。

4）更高效的计算资源利用。Docker是`内核级别的虚拟化`，可以在一个物理机上可以运行很多的容器实例，服务器的性能可以被压榨到极致。

## Docker 架构

​		Docker 架构图：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210112223441225.png)

1）`镜像（image)`：就像 `模板`，通过模板来创建容器，通过这个镜像可以创建多个容器。

​		举例：Tomcat 镜像 ==> run ==> 容器（Tomcat01、Tomcat02）（最终服务运行或者项目运行就是在容器中的）

2）`容器(container)`：Docker 利用容器技术，独立运行一个或者一组应用，通过镜像来创建的。（可以把这个容器理解为就是一个简易的 Linux 系统）

3）`仓库(repository)`：存放镜像的地方。仓库分为公有仓库和私有仓库。Docker Hub是国外的，需要配置镜像加速。

## HelloDocker 原理

![在这里插入图片描述](https://img-blog.csdnimg.cn/2021071908571839.png)

`Docker 底层原理`：

​		Docker 是一个 `Client-Server 结构`的系统，Docker 的守护进程运行在主机上。通过 Socket 从客户端访问，Docker-Server 接收到 Docker-Client 的指令，就会执行这个命令。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719092624997.png)

# Docker 使用

## 帮助信息命令

```shell
docker version 		 # 显示 docker 的版本信息。
docker info 		 # 显示 docker 的系统信息，包括镜像和容器的数量。
docker 命令 --help    # 帮助命令（万能命令）
```

命令帮助文档地址：`https://docs.docker.com/engine/reference/commandline/docker/`。

## 镜像命令

1、`docker images` 查看所有本地主机上的镜像。

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ nginx]# docker images
REPOSITORY    TAG       IMAGE ID       CREATED        SIZE
hello-world   latest    feb5d9fea6a5   8 months ago   13.3kB

# REPOSITORY	镜像的仓库源
# TAG	镜像的标签（版本）
# IMAGE ID	镜像的 ID
# CREATED	镜像的创建时间
# SIZE	镜像的大小
```

```shell
-a，-all 	# 表示列出所有的镜像。
-f，-quiet	# 表示只显示镜像的 ID。
```

2、`docker search` 搜索镜像。

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ nginx]# docker search mysql
NAME                           DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
mysql                          MySQL is a widely used, open-source relation…   12687     [OK]       
mariadb                        MariaDB Server is a high performing open sou…   4864      [OK]       
percona                        Percona Server is a fork of the MySQL relati…   579       [OK]       
phpmyadmin                     phpMyAdmin - A web interface for MySQL and M…   550       [OK]       
bitnami/mysql                  Bitnami MySQL Docker Image                      71                   [OK]
```

```shell
-f		# 根据条件过滤搜索结果
docker search mysql -f=stars=3000		# 搜索收藏数为 3000 以上的 mysql 镜像
```

3、`docker pull` 拉取下载镜像。

```shell
# docker pull 镜像名[:tag] 	拉取指定版本 tag 的镜像，如果不写 tag，默认拉取最新的
[root@iZ8vb0l7sqdpurpvy5e77xZ nginx]# docker pull mysql
Using default tag: latest		# 不写 tag 表示拉取最新版本
latest: Pulling from library/mysql		# 下面是分层下载的过程
c1ad9731b2c7: Pull complete 
54f6eb0ee84d: Pull complete 
cffcf8691bc5: Pull complete 
89a783b5ac8a: Pull complete 
6a8393c7be5f: Pull complete 
af768d0b181e: Pull complete 
810d6aaaf54a: Pull complete 
2e014a8ae4c9: Pull complete 
a821425a3341: Pull complete 
3a10c2652132: Pull complete 
4419638feac4: Pull complete 
681aeed97dfe: Pull complete 
Digest: sha256:548da4c67fd8a71908f17c308b8ddb098acf5191d3d7694e56801c6a8b2072cc		# 签名，防伪标志
Status: Downloaded newer image for mysql:latest		
docker.io/library/mysql:latest		# 真实地址
# docker pull mysql 等价于：docker pull docker.io/library/mysql:latest

# 拉取指定版本的 mysql（必须在dockerhub 存在的）
[root@iZ8vb0l7sqdpurpvy5e77xZ nginx]# docker pull mysql:5.7
5.7: Pulling from library/mysql
c1ad9731b2c7: Already exists 
54f6eb0ee84d: Already exists 
cffcf8691bc5: Already exists 
89a783b5ac8a: Already exists 
6a8393c7be5f: Already exists 
af768d0b181e: Already exists 
810d6aaaf54a: Already exists 
81fe6daf2395: Pull complete 
5ccf426818fd: Pull complete 
68b838b06054: Pull complete 
1b606c4f93df: Pull complete 
Digest: sha256:7e99b2b8d5bca914ef31059858210f57b009c40375d647f0d4d65ecd01d6b1d5
Status: Downloaded newer image for mysql:5.7
docker.io/library/mysql:5.7
# 根据上面的下载过程就体现了 分层下载的优势：已经存在的包就不用下载了
```

4、`docker rmi` 删除镜像

```shell
# 根据镜像名称删
[root@iZ8vb0l7sqdpurpvy5e77xZ nginx]# docker rmi mysql:5.7
Untagged: mysql:5.7
Untagged: mysql@sha256:7e99b2b8d5bca914ef31059858210f57b009c40375d647f0d4d65ecd01d6b1d5
Deleted: sha256:2a0961b7de03c7b11afd13fec09d0d30992b6e0b4f947a4aba4273723778ed95
Deleted: sha256:2fbd454d39f146da1c0747174089b983c1cf1da7a062384e5a71a94f540141ab
Deleted: sha256:60ce6f6a8d71e66bd7ca1dae1f84a5faedfb993c1a0f352b90597b73eb94d56e
Deleted: sha256:226a653f6ee6b0184d7a6304f29976dc89b0e54e2eec2027d0e3cf87cbe8f2af
Deleted: sha256:218468cc1e9e25a831221617115da837798856793eb7decb3b089c8a1b5bd98f

# 根据镜像 ID 删
docker rmi feb5d9fea6a5
# 删除多个镜像
docker rmi 镜像id 镜像id 镜像id 镜像id
# 删除全部镜像
docker rmi -f $(docker images -aq)
```

```shell
-f		# 参数表示强制删除，就算该镜像有容器在运行
```

可以根据 `镜像名称` 删，也可以根据`镜像 ID` 删除。

## 容器命令

​		`有了镜像才可以创建容器`。以 下载一个 centos 镜像为案例。

```shell
docker pull centos
```

1、`docker run [-options] image` 创建容器并启动，并设置参数。

1）基本命令：

```shell
docker run [-options] image

# 常用参数选项
--name		# 指定启动后容器的名称，例如 tomcat01，用来区分具体的容器
-d			# 以后台方式运行，类似于之前的 nohup
-it			# 使用交互方式运行，进入容器查看内容
-p			# 指定容器的端口
	# 几种方式：
	-p ip：主机端口：容器端口
	-p 主机端口:容器端口（最常用）
	-p 容器端口
	容器端口
	
-P			# 随机指定端口
```

测试使用：

```shell
# 启动并进入容器
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker run -it centos /bin/bash
# 此时发现 root 后面的主机名变成了镜像名 
[root@da547f060a6b /]# 
# 查看容器内的 centos
[root@da547f060a6b /]# ls
bin  dev  etc  home  lib  lib64  lost+found  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var


# 从容器中退回主机，并停止容器
[root@da547f060a6b /]# exit
exit
```

2、`docker ps` 列出所有运行的容器。

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker ps
CONTAINER ID   IMAGE     COMMAND       CREATED             STATUS                         PORTS     NAMES
da547f060a6b   centos    "/bin/bash"   About an hour ago   Exited (0) About an hour ago             frosty_banzai

# 常用参数选项
无参数		# 列出当前正在运行的容器
-a		  # 列出所有容器
-n=m	  # 显示最近 m 个容器
-q		  # 只显示容器 ID
```

3、`docker rm` 删除容器

```shell
# 删除指定容器，不能删除正在运行的容器
docker rm 容器ID
# 删除所有容器
docker rm -f $(docker ps -aq)
# 删除所有容器
docker ps -a -q | xargs docker rm
```

4、退出容器命令

```shell
# 从容器中退回主机，并停止容器
exit
# 从容器中退回主机，不停止容器
ctrl + p + q
```

5、启动和停止容器

```shell
# 启动容器
docker start 容器ID
# 重启容器
docker restart 容器ID
# 停止容器
docker stop 容器ID
# 强制停止容器
docker kill 容器ID
```

## 进阶命令

1、后台启动容器，不直接进去：

```shell
docker run -d centos
```

​		此命令启动容器，发现启动的 centos 自动停止了，为什么呢？

> 常见的坑：docker 后台启动的话，就必须要有一个前台进程，docker 发现没有前台应用，就会自动停止。
>
> 例如 nginx，容器启动后发现自己没有提供服务，就会立刻停止 “自杀”。

2、查看日志

```shell
docker logs -tf [--tail numbers] 容器ID
# 注意：该容器需要是启动状态
-tf		# 显示带时间戳的日志
--tail numbers	# 要显示的日志条数
```

一般情况查看日志：

```shell
docker logs -f 容器ID
```

3、查看容器中的进程信息

```shell
docker top 容器ID

[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker top b44b5d08542e
UID     PID       PPID     C      STIME               TTY                 TIME                CMD
root   3679834   3679814   0      19:44               pts/0               00:00:00            /bin/bash
```

4、查看镜像的元数据（`里面的配置后面会用到`）

```shell
docker inspect 容器ID
```

## `容器进阶操作`

1、进入当前正在运行的容器：（`通常容器都是使用后台方式运行的，需要进入容器，修改一些配置`）

```shell
docker exec -it 容器id bashShell
# -it 表示交互模式
# bashshell 表示使用的命令行，一般使用 /bin/bash 
# 方式一：进入后开启新的终端（常用）
docker exec -it 容器id /bin/bash
# 方式二：进入容器正在执行的终端
docker attach 容器id
```

2、容器内文件拷贝到容器外主机上：

```shell
docker cp 容器id:容器内路径   目的的主机路径
```

测试使用：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# cd /home
# 查看主机文件
[root@iZ8vb0l7sqdpurpvy5e77xZ home]# cd gaozheng
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# ls
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# ls
# 查看当前运行的容器
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# docker ps
CONTAINER ID   IMAGE     COMMAND       CREATED             STATUS             PORTS     NAMES
b44b5d08542e   centos    "/bin/bash"   About an hour ago   Up About an hour             optimistic_banzai
# 进入容器
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# docker exec -it b44b5d08542e /bin/bash
[root@b44b5d08542e /]# ls
bin  dev  etc  home  lib  lib64  lost+found  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var
[root@b44b5d08542e /]# cd /home
[root@b44b5d08542e home]# ls
# 创建测试文件
[root@b44b5d08542e home]# touch test.java
[root@b44b5d08542e home]# ls
test.java
# 退出容器
[root@b44b5d08542e home]# exit
exit
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# docker ps
CONTAINER ID   IMAGE     COMMAND       CREATED             STATUS             PORTS     NAMES
b44b5d08542e   centos    "/bin/bash"   About an hour ago   Up About an hour             optimistic_banzai
# 拷贝容器内文件到容器外主机上
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# docker cp b44b5d08542e:/home/test.java /home/gaozheng
# 查看结果：拷贝成功
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# ls
test.java
```

## 命令汇总

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210720092439814.png)

命令汇总：

```shell
attach    Attach to a running container                                  #当前shell下attach连接指定运行镜像
build     Build an image from a Dockerfile                               #通过Dockerfile定制镜像
commit    Create a new image from a containers changes                   #提交当前容器为新的镜像
cp          Copy files/folders from a container to a HOSTDIR or to STDOUT  #从容器中拷贝指定文件或者目录到宿主机中
create    Create a new container                                         #创建一个新的容器，同run 但不启动容器
diff      Inspect changes on a containers filesystem                     #查看docker容器变化
events    Get real time events from the server                           #从docker服务获取容器实时事件
exec      Run a command in a running container                           #在已存在的容器上运行命令
export    Export a containers filesystem as a tar archive                #导出容器的内容流作为一个tar归档文件(对应import)
history   Show the history of an image                                   #展示一个镜像形成历史
images    List images                                                    #列出系统当前镜像
import    Import the contents from a tarball to create a filesystem image  #从tar包中的内容创建一个新的文件系统映像(对应export)
info      Display system-wide information                                #显示系统相关信息
inspect   Return low-level information on a container or image           #查看容器详细信息
kill      Kill a running container                                       #kill指定docker容器
load      Load an image from a tar archive or STDIN                      #从一个tar包中加载一个镜像(对应save)
login     Register or log in to a Docker registry                        #注册或者登陆一个docker源服务器
logout    Log out from a Docker registry                                 # 从当前Docker registry退出
logs      Fetch the logs of a container                                  # 输出当前容器日志信息
pause     Pause all processes within a container                         # 暂停容器
port      List port mappings or a specific mapping for the CONTAINER     #查看映射端口对应的容器内部源端口
ps        List containers                                                #列出容器列表
pull      Pull an image or a repository from a registry                  #从docker镜像源服务器拉取指定镜像或者库镜像
push      Push an image or a repository to a registry                    #推送指定镜像或者库镜像至docker源服务器
rename    Rename a container                                             #重命名容器
restart   Restart a running container                                    #重启运行的容器
rm        Remove one or more containers                                  #移除一个或者多个容器
rmi       Remove one or more images                                      #移除一个或多个镜像(无容器使用该镜像才可以删除，否则需要删除相关容器才可以继续或者-f强制删除)
run       Run a command in a new container                               #创建一个新的容器并运行一个命令
save      Save an image(s) to a tar archive                              #保存一个镜像为一个tar包(对应load)
search    Search the Docker Hub for images                               #在docker hub中搜索镜像
start     Start one or more stopped containers                           #启动容器
stats     Display a live stream of container(s) resource usage statistics  #统计容器使用资源
stop      Stop a running container                                       #停止容器
tag       Tag an image into a repository                                 #给源中镜像打标签
top       Display the running processes of a container                   #查看容器中运行的进程信息
unpause   Unpause all processes within a container                       #取消暂停容器
version   Show the Docker version information                            #查看容器版本号
wait      Block until a container stops, then print its exit code        #截取容器停止时的退出状态值
```

## 端口暴露问题

​		某些服务中（nginx），容器内的端口需要映射到容器外的端口上，如何映射呢？通过设置 `-p` 参数，那流程又是什么呢？

![在这里插入图片描述](https://img-blog.csdnimg.cn/2021072014364032.png)

​		例如启动 nginx 容器时，设置端口映射：` -p 3344:80` ，则将容器内的 80 端口映射到了主机上的 3344 端口，如果防火墙放行了 3344 端口，安全组也放行了 3344 端口，那么通过外网就也能访问到 容器内的 nginx。

## 部署 Nginx

```shell
# 搜索镜像：建议使用 dockerhub 搜索详细内容
docker search nginx

# 拉取镜像
docker pull nginx

# 启动镜像
docker run -d --name nginx01 -p 3344:80 nginx
# -d 表示后台启动
# --name 表示容器名称
# -p 表示设置映射端口，3344 是主机端口，80 是容器内的 nginx 端口（默认 80）

# 测试本地访问 nginx 服务
curl localhost:3344

# 测试结果显示：
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# curl localhost:3344
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>

# 此时启动成功，开放防火墙和安全组后外网也能访问到
# 进入容器内查看 nginx
docker exec -it nginx01 /bin/bash
# 查看 nginx 相关文件
root@5eb335726b53:/# whereis nginx
nginx: /usr/sbin/nginx /usr/lib/nginx /etc/nginx /usr/share/nginx
root@5eb335726b53:/# cd /etc/nginx
root@5eb335726b53:/etc/nginx# ls
conf.d	fastcgi_params	mime.types  modules  nginx.conf  scgi_params  uwsgi_params
```

> ​		`问题`：现在的方式每次修改 nginx 的配置文件都需要进入容器的内部，十分麻烦，那么如何在容器外部提供一个映射文件，达到在容器外修改配置文件，容器内自动同步修改的效果呢？=====> `数据卷技术`
>
> ​		根据 `4.1` 数据卷技术，需要在启动时设置：`-v /home/nginx:/usr/nginx`即可。

## 部署 Tomcat

​		选择 Tomcat 9.0 版本。

```shell
# 官方方式：使用完后立马自动删除镜像（仅测试时使用）
docker run -it --rm tomcat:9.0

# dockerhub 搜寻镜像
# 拉取镜像
docker pull tomcat:9.0
# 启动 tomcat9
docker run -d --name tomcat9 -p 3355:8080 tomcat:9.0
# 启动后，发现访问成功，但是没有欢迎页面
# 进入 tomcat9
docker exec -it tomcat9 /bin/bash
# 查看webapps目录文件
cd webapps
ls
# 发现此文件目录为空！
```

> ​		镜像版的 Tomcat 默认是最小的镜像，所有不必要的文件都被剔除了，因此没有欢迎页面，同时还有一些基础的 linux 命令不能使用，`镜像只保证 tomcat 的基本使用`，是阉割版的。如何解决呢？
>
> ​		发现存在 webapps.dist 目录，此目录下有原先的 ROOT 文件夹等欢迎页面，因此可以进入容器将 此目录下的文件拷贝到原 webapps 目录下。
>
> ```shell
> # 进入容器
> docker exec -it tomcat9 /bin/bash
> # 进入 webapps.dist 文件夹
> root@70c149998eb6:/usr/local/tomcat# cd webapps.dist/
> root@70c149998eb6:/usr/local/tomcat/webapps.dist# ls
> ROOT  docs  examples  host-manager  manager
> # 复制文件
> cp -r webapps.dist/* webapps
> ```

> `问题`：部署项目必须进入容器内部十分麻烦，如何`在容器外不提供一个映射路径 webapps，达到在外部放置项目，就自动同步到内部的技术`？===> `数据卷技术`

## 部署 ES 和 Kibana

> 需要注意的是：ES暴露的端口很多，且十分耗费内存，同时 ES 的数据需要放到安全目录（`挂载`）。

```shell
# 下载 ES 并启动，暴露端口 9200 和 9300，-e "discovery.type=single-node"是集群中配置单机节点
docker run -d --name es -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:7.6.2

# 运行发现并没有成功启动 ES：
# 因此查看启动日志
docker logs -f es
# 发现报错信息：内容大致就是内存问题 ====> ES 非常耗费内存
OpenJDK 64-Bit Server VM warning: Option UseConcMarkSweepGC was deprecated in version 9.0 and will likely be removed in a future release.
OpenJDK 64-Bit Server VM warning: INFO: os::commit_memory(0x00000000d4cc0000, 724828160, 0) failed; error='Not enough space' (errno=12)
# There is insufficient memory for the Java Runtime Environment to continue.
# Native memory allocation (mmap) failed to map 724828160 bytes for committing reserved memory.
# An error report file with more information is saved as:
# logs/hs_err_pid1.log

# 那么如何解决呢？	======> 环境配置修改：限制内存，设置运行环境参数
# 1、先删除之前的未能成功启动的镜像
docker rm es
# 2、启动新的 es ，同时设置内存限制
docker run -d --name es -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e ES_JAVA_OPTS="-Xms64m -Xmx512m"  elasticsearch:7.6.2
# 3、发现成功启动
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker ps 
CONTAINER ID   IMAGE                 COMMAND                  CREATED         STATUS         PORTS                                                                                  NAMES
0323c75fccb6   elasticsearch:7.6.2   "/usr/local/bin/dock…"   4 seconds ago   Up 3 seconds   0.0.0.0:9200->9200/tcp, :::9200->9200/tcp, 0.0.0.0:9300->9300/tcp, :::9300->9300/tcp   es
# 4、检查运行情况
curl localhost:9200
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# curl localhost:9200
{
  "name" : "0323c75fccb6",
  "cluster_name" : "docker-cluster",
  "cluster_uuid" : "A2Mux9ntSCWJlUD_mFvihg",
  "version" : {
    "number" : "7.6.2",
    "build_flavor" : "default",
    "build_type" : "docker",
    "build_hash" : "ef48eb35cf30adf4db14086e8aabd07ef6fb113f",
    "build_date" : "2020-03-26T06:34:37.794943Z",
    "build_snapshot" : false,
    "lucene_version" : "8.4.0",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
# 此时证明运行成功

# 检查 CPU 状态
docker stats
# 发现占用内存已经受到限制
CONTAINER ID   NAME      CPU %     MEM USAGE / LIMIT   MEM %     NET I/O         BLOCK I/O        PIDS
0323c75fccb6   es        0.18%     386MiB / 7.627GiB   4.94%     2.83kB / 984B   85.3MB / 862kB   46
```

> 那么如何`使用 kibana 连接 ES `呢？
>
> 1）容器内部互相隔离，则`直接通过 localhost:port 连接并不现实`。
>
> 2）Linux 存在内网 IP，则可以通过 kibana ------> 内网地址 -------> ES ======> `Docker 网络原理`（后续说明）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210720172452779.png)

## portainer 可视化

​		`portainer`：是 Docker 图形化`界面管理`工具，提供一个后台面板供我们操作。（后续更推荐使用 Rancher）

```shell
# 运行如下命令即可 打开可视化服务
docker run -d -p 8080:9000 --restart=always -v /var/run/docker.sock:/var/run/docker.sock --privileged=true portainer/portainer
# -d 后台运行
# -p 指定运行端口，8080 为主机端口，9000 为内部映射端口
# -v 挂载
# --privileged 授权
# portainer/portainer 安装控制面板
```

访问测试：`http://8.142.92.222:10001/`，即可看到可视化面板。（第一次加载会很慢）

注意：平时并不会使用。

# Docker 镜像

​		镜像是一种轻量级、可执行的独立软件包，用来打包软件运行环境和基于运行环境开发的软件，它包含运行某个软件所需的所有内容，包括`代码、运行时库、环境变量和配置文件`。======> 所有的应用，直接打包 docker 镜像，就可以直接跑起来。

如何得到镜像：

- 从远程仓库下载
- 朋友拷贝给你
- 自己制作一个镜像 `DockerFile`

## 镜像加载原理

> ​		`UnionFS（联合文件系统）`：Union文件系统（UnionFS）是一种`分层`、轻量级并且高性能的文件系统，它支持对文件系统的修改作为一次提交来一层层的叠加，同时可以将不同目录挂载到同一个虚拟文件系统下（unite several directories into a single virtual filesystem）。`Union 文件系统是 Docker 镜像的基础`。镜像可以`通过分层来进行继承`，基于基础镜像（没有父镜像），可以制作各种具体的应用镜像。
>
> ​		特性：一次同时加载多个文件系统，但从外面看起来，只能看到一个文件系统，联合加载会把文件系统叠加起来，这样最终的文件系统包含所有底层的文件和目录。(`共用的就不需要重复下载`)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210721144206155.png)

docker 的镜像实际上由一层一层的文件系统组成，这种层级的文件系统 UnionFS。系统启动需要引导加载。

​		`bootfs`（boot file system）主要包含 bootloader 和 kernel，bootloader 主要是引导加载 kernel，Linux 刚启动时会加载 bootfs 文件系统，在 Docker 镜像的最底层是 bootfs。这一层与我们电箱的 Linux/Unix 系统是一样的，包含 boot 加载器和内核。当 boot 加载完成之后整个内核就都在内存中了，此时内存的使用权已由 bootfs 转交给内核，此时系统也会卸载 bootfs。

​		`rootfs`（root file system），在 bootfs 之上。包含的就是典型 Linux 系统中的 /dev，/proc，/bin，/etc 等标准目录和文件。rootfs 就是各种不同的操作系统发行版，比如 Ubuntu，Centos 等等。

​		而 Docker 底层直接用主机的的 kernel，自己只需要提供 rootfs 就可以了。由此可见对于不同的 Linux 发行版， boots 基本是一致的， rootfs 会有差別，因此不同的发行版可以公用 bootfs。因此 docker 启动才是非常快的。

> `总结：`docker 使用联合文件系统，底层使用主机的启动引导，只需要提供不同的 rootfs，就可以搭建一个新的 linux 系统。

## 分层结构

​		Docker 采用`分层结构`（下载镜像时可以看出分层下载），分层结构可以资源共享，多个镜像都从相同的 Base 镜像构建而来，那么宿主机只需在磁盘上保留一份 base 镜像，同时内存中也只需要加载一份 base 镜像，这样就可以为所有的容器服务了，而且镜像的`每一层都可以被共享`。`“千层饼”`结构，就相当于`后面的层都可以使用之前已经下载的资源`，而不需要重新下载完整的包。

查看镜像分层方式：

```shell
docker image inspect redis:latest
```

举例：该镜像当前已经包含3个镜像层，第一层 Ubuntu Linux 16.04，当再添加第二 python 镜像层时，`镜像始终是保持当前所有镜像的组合`，不需要下载之前下载过的文件，只需要下载第一层没有的文件：文件4、5、6，以此类推。

![在这里插入图片描述](https://img-blog.csdnimg.cn/2021072115154375.png)

主要目的：`分层复用`、`资源复用`。

特点：Docker 镜像都是只读的，当容器启动时，一个新的`可写层`（自己的东西）被加载到镜像的顶部，这一层就是我们通常说的容器层，容器之下的都叫镜像层。例如 Tomcat 原本的镜像就是镜像层，而我们后面`加的 war 包或者其他环境` + 原本的 Tomcat 镜像 合成新的容器。

## 提交镜像

提交容器成为一个新的可使用的副本：

```shell
docker commit -m="提交的描述信息" -a="作者" 容器ID 目标镜像名:[tag]
```

实战测试：打包一个新的 Tomcat 镜像，让其 webapps 内部有欢迎页面。

```shell
# 1、启动原本默认的 Tomcat
docker run -d -p 10001:8080 tomcat

# 默认的tomcat 是没有webapps应用，官方的镜像默认webapps下面是没有文件的，欢迎页面在 webapps.dist 目录下
# 2、进入容器内部
docker exec -it 容器ID /bin/bash
# 3、拷贝文件到 webapps
cp -r webapps.dist/* webapps

# 4、提交自己修改的镜像（注意新的镜像名全部小写字母）
docker commit -a="gaozheng" -m="新版本Tomcat" 676a90063c04 tomcat_high:1.0
# 5、查看镜像
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker images
REPOSITORY            TAG       IMAGE ID       CREATED         SIZE
tomcat_high           1.0       595dd9d97756   6 seconds ago   684MB	# 发现新的镜像已经提交成功，版本 1.0，比原来的大 4M
tomcat                9.0       bce48a218e94   8 days ago      680MB
tomcat                latest    c795915cb678   8 days ago      680MB
nginx                 latest    0e901e68141f   8 days ago      142MB
portainer/portainer   latest    12b0b8dced14   3 weeks ago     75.4MB
centos                latest    5d0da3dc9764   8 months ago    231MB
elasticsearch         7.6.2     f29a1ee41030   2 years ago     791MB

# 测试检查新的镜像
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker run -d -p 10001:8080 --name tomcat tomcat_high:1.0
c777ce34b4361b9c08945d8a80a2b04be8ff334296151e203d4bc8ada9d57936
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker ps
CONTAINER ID   IMAGE             COMMAND             CREATED         STATUS         PORTS                                         NAMES
c777ce34b436   tomcat_high:1.0   "catalina.sh run"   3 seconds ago   Up 2 seconds   0.0.0.0:10001->8080/tcp, :::10001->8080/tcp   tomcat
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker exec -it tomcat /bin/bash
root@c777ce34b436:/usr/local/tomcat# ls
BUILDING.txt	 LICENSE  README.md	 RUNNING.txt  conf  logs	    temp     webapps.dist
CONTRIBUTING.md  NOTICE   RELEASE-NOTES  bin	      lib   native-jni-lib  webapps  work
root@c777ce34b436:/usr/local/tomcat# cd webapps
root@c777ce34b436:/usr/local/tomcat/webapps# ls
ROOT  docs  examples  host-manager  manager
# 发现新的镜像的 webapps 目录已经有了 欢迎页面文件
```

# 容器数据卷

​		Docker 理念：将应用和环境打包成一个镜像。但是如果数据都在容器中，那么我们容器删除，数据就会丢失 ===> `数据需要持久化`。

举例：MySQL 数据库的数据需要能够存储在本地。=====>  `数据卷技术`：数据共享，将容器产生的数据同步到本地。

> 数据卷技术的实现：容器之间、容器和主机文件系统隔离，需要使用`目录的挂载`，将我们容器内的目录，挂载到主机 Linux 目录上。
>
> ![在这里插入图片描述](https://img-blog.csdnimg.cn/20210721201603322.png)
>
> 总结：容器的`持久化`和`同步`操作，容器间也是可以`数据共享`的（`挂载到同一个目录`）。

## 数据卷使用

​		数据卷技术的挂载如何实现呢？=====> `-v` 挂载

```shell
-v 主机目录:容器内目录
--volume 主机目录:容器内目录
```

以 centos 卷目录挂载示例：

​		注意：`主机挂载的目录需要不存在`。

```shell
# 启动 centos 并挂载目录
docker run -it -v /home/gaozheng/ceshi:/home --name centos centos /bin/bash
# 查看 centos 容器的详情（关注挂载位置设置）
docker inspect centos
```

![](D:\NoteBook\核心笔记\Linux\image\docker 挂载.png)

发现挂载成功，已经配置，进行以下测试：

1）进入 centos 容器内部创建文件，查看外部是否同步。

2）关闭容器，主机创建文件，测试容器内是否新增该文件。

3）删除容器，查看容器外文件是否消失。

```shell
# 测试（1）
# 容器内创建 love.txt 文件
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# docker exec -it centos /bin/bash
[root@f16f608d2067 /]# cd /home
[root@f16f608d2067 home]# ls
[root@f16f608d2067 home]# touch love.txt
[root@f16f608d2067 home]# ls
love.txt

# 主机查看挂载目录文件
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# cd /home/gaozheng/ceshi
[root@iZ8vb0l7sqdpurpvy5e77xZ ceshi]# ls
love.txt

# 测试（2）
# 关闭容器
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# docker stop centos
centos
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
# 主机增加文件
[root@iZ8vb0l7sqdpurpvy5e77xZ ceshi]# touch test111.txt
[root@iZ8vb0l7sqdpurpvy5e77xZ ceshi]# ls
love.txt  test111.txt
# 启动容器
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# docker restart centos
centos
# 进入容器内部查看
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# docker exec -it centos /bin/bash
[root@f16f608d2067 /]# cd /home
[root@f16f608d2067 home]# ls
love.txt  test111.txt
# 发现文件自动同步

# 测试（3）
# 删除容器
docker rm -f centos
# 主机查看文件目录
[root@iZ8vb0l7sqdpurpvy5e77xZ ceshi]# ls
love.txt  test111.txt
# 发现并没有消失
```

同步规则：`不管容器是否是运行状态，主机和容器的挂载文件都是保持同步的`（相当于是`同一个目录位置`）。=======> `双向绑定`

## MySQL 案例

实例：部署一个 MySQL，但 MySQL 数据肯定需要持久化，放在主机上，就需要通过挂载。

```shell
# 拉取 MySQL5.7 镜像
docker pull mysql:5.7

# 运行容器，需要做数据挂载
# 注意：安装启动 mysql，需要配置密码
# 官方用法：docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:tag

# 启动容器
docker run -d -p 10001:3306 -v /home/mysql/conf:/etc/mysql/conf.d -v /home/mysql/data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 --name mysql01 mysql:5.7
# -d 后台运行
# -p 端口映射
# -v 数据卷挂载
# -e 环境配置
# --name 容器名称
```

启动后，使用 navicat 测试连接：发现`连接成功`。

![](https://pic1.imgdb.cn/item/63369d2d16f2c2beb16bea46.png)

检查数据文件：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ data]# ls
auto.cnf    ca.pem           client-key.pem  ibdata1      ib_logfile1  mysql               private_key.pem  server-cert.pem  sys
ca-key.pem  client-cert.pem  ib_buffer_pool  ib_logfile0  ibtmp1       performance_schema  public_key.pem   server-key.pem
```

`当容器删除后，挂载到本地的数据卷依旧没有丢失`。

## 挂载方式

​		挂载方式分为：`具名挂载` 和 `匿名挂载`。

1、匿名挂载：不指定`主机`上的映射文件位置。

```shell
# -v 容器内的目录位置
docker run -d --name nginx01 -v /etc/nginx nginx

# 查看所有卷 volume 的情况
docker volume ls
[root@iZ8vb0l7sqdpurpvy5e77xZ data]# docker volume ls
# 测试效果：后面的就是匿名的卷 volume
DRIVER    VOLUME NAME
local     2d6f03c8c5dc2b97631990bd8d322664d8c4cc5ec51a04dfc6c7c4030fbf992a
local     5d9cdeab3888e3a84d5e0f8a4a477082514e1db5406b4043651bee09df818de3
local     6c5417becd49af474d2a8ab3061645706f4b45dcfebde4fdeb56fb253c969581
local     44dfa0647e01c741d0f97e6d5b1487efa9253d7fcf7411f96d4cc306bac7b4cd
# 这种就是匿名挂载，我们在 -v 只写了容器内的路径，没有写容器外的路径！
```

2、具名挂载

```shell
# -v 主机目录位置：容器内目录位置
docker run -d --name nginx02 -v juming-nginx:/etc/nginx nginx

[root@iZ8vb0l7sqdpurpvy5e77xZ home]# docker volume ls
DRIVER    VOLUME NAME
local     2d6f03c8c5dc2b97631990bd8d322664d8c4cc5ec51a04dfc6c7c4030fbf992a
local     5d9cdeab3888e3a84d5e0f8a4a477082514e1db5406b4043651bee09df818de3
local     6c5417becd49af474d2a8ab3061645706f4b45dcfebde4fdeb56fb253c969581
local     44dfa0647e01c741d0f97e6d5b1487efa9253d7fcf7411f96d4cc306bac7b4cd
local     juming-nginx
```

查看详细信息：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ home]# docker volume inspect juming-nginx
[
    {
        "CreatedAt": "2022-06-06T14:01:57+08:00",
        "Driver": "local",
        "Labels": null,
        "Mountpoint": "/var/lib/docker/volumes/juming-nginx/_data",
        "Name": "juming-nginx",
        "Options": null,
        "Scope": "local"
    }
]
```

所有的 docker 容器内的卷，没有指定目录的情况下都是在 `/var/lib/docker/volumes/xxx/_data`

我们通过具名挂载可以方便的找到我们的 一个卷，`大多数情况使用的是 具名挂载`

```shell
# 如何确定是具名挂载还是匿名挂载，还是指定路径挂载！
-v 容器内路径         	# 匿名挂载
-v 卷名:容器内路径        # 具名挂载
-v /宿主机路径:容器路径   # 指定路径挂载！
```

拓展：

```shell
# 通过 -v 容器内路径： ro rw 改变读写权限
ro readonly  	# 只读
rw readwrite 	# 可读可写

# 一旦设置了容器权限，容器对我们挂载出来的内容就有限定了！
docker run -d -P --name nginx05 -v juming:/etc/nginx:ro nginx
docker run -d -P --name nginx05 -v juming:/etc/nginx:rw nginx
# ro 只要看到ro就说明这个路径只能通过宿主机来操作，容器内部是无法操作！
```

## DockerFile 挂载

测试在创建镜像的时候就进行数据卷的挂载

​		`Dockerfile` 就是用来构建 docker 镜像的构建文件：命令脚本手动构建镜像。

1、`/home/gaozheng` 用于存放测试的脚本文件和映射数据卷位置。

2、创建一个 dockerFile 文件，名字随意，建议使用 dockerfile 命名。（dockerfile01）

```shell
FROM centos

VOLUME ["/volume01", "/volume02"]

CMD echo "------end------"
CMD /bin/bash
```

3、构建镜像

```shell
# 注意
# 1、命令最后的那个点 .
# 2、镜像名前面不能有 /
# 3、dockerfile 建议使用全路径
docker build -f /home/gaozheng/dockerfile01 -t gaozheng/centos .

[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# docker build -f /home/gaozheng/dockerfile01 -t gaozheng-centos .
Sending build context to Docker daemon  6.144kB
Step 1/4 : FROM centos
 ---> 5d0da3dc9764
Step 2/4 : VOLUME ["/volume01", "/volume02"]
 ---> Running in 19bba0050263
Removing intermediate container 19bba0050263
 ---> 7ba109a7121b
Step 3/4 : CMD echo "------end------"
 ---> Running in 3f934f2d2490
Removing intermediate container 3f934f2d2490
 ---> bd49f0821c30
Step 4/4 : CMD /bin/bash
 ---> Running in b6d2b2c138b5
Removing intermediate container b6d2b2c138b5
 ---> 4ef680cee27a
Successfully built 4ef680cee27a
Successfully tagged gaozheng-centos:latest

# 查看当前镜像，出现 gaozheng/centos
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# docker images
REPOSITORY            TAG       IMAGE ID       CREATED         SIZE
gaozheng-centos       latest    4ef680cee27a   4 seconds ago   231MB
tomcat_high           1.0       595dd9d97756   4 hours ago     684MB
```

4、启动自己构建的镜像后，进入其中发现：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210722153212255.png)

5、根据上图可知，则主机上一定有一个位置和容器内进行同步的目录。

查看数据卷挂载的路径：可以通过在内部创建文件进行测试。

```shell
docker inspect 容器ID

"Mounts": [
            {
                "Type": "volume",
                "Name": "adbd313822d6e2267b7116c14a92c82f14f892e94a601c28348d79cd6b8249ea",
                "Source": "/var/lib/docker/volumes/adbd313822d6e2267b7116c14a92c82f14f892e94a601c28348d79cd6b8249ea/_data",
                "Destination": "volume02",
                "Driver": "local",
                "Mode": "",
                "RW": true,
                "Propagation": ""
            },
            {
                "Type": "volume",
                "Name": "57bcdecf0e157033888c0371c4f030845fa37ced9d50996c2ac8b56daaa09c97",
                "Source": "/var/lib/docker/volumes/57bcdecf0e157033888c0371c4f030845fa37ced9d50996c2ac8b56daaa09c97/_data",
                "Destination": "volume01,",
                "Driver": "local",
                "Mode": "",
                "RW": true,
                "Propagation": ""
            }
        ],
```

这种方式使用的十分多，因为我们通常会构建自己的镜像，假设构建镜像时候没有挂载卷，要手动镜像挂载 -v 卷名：容器内路径。

## 数据卷容器

假设需求：多个 centos 需要共享数据。

```shell
--volumes-from
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/img_convert/509123ae482041b594dff90c81dd799c.png)

```shell
# 启动 centos01 父容器
docker run -it --name centos01 gaozheng-centos

# 启动 centos02，并绑定数据卷到 centos01
docker run -it --name centos02 --volumes-from centos01 gaozheng-centos

# 测试：在 centos01 中的 volume01 目录创建文件 centos01Build，在 centos 02 是否可以拿到？
[root@3573ac0b9e0b /]# cd volume01
[root@3573ac0b9e0b volume01]# ls
[root@3573ac0b9e0b volume01]# touch centos01Build
# CTRL + P + Q
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# docker exec -it centos02 /bin/bash
[root@38d1c9649e8c /]# cd volume01
[root@38d1c9649e8c volume01]# ls
centos01Build
```

被实现数据同步的容器（父容器）就叫做：`数据卷容器`。

当该数据卷容器被删除后，其余容器里面的文件依旧存在。（`备份机制`：`拷贝`而非共享）

案例：多个 MySQL 实现数据共享

```shell
docker run -d -p 3306:3306 -v /home/mysql/conf:/etc/mysql/conf.d -v /home/mysql/data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 --name mysql01 mysql:5.7
docker run -d -p 3307:3306 -e MYSQL_ROOT_PASSWORD=123456 --name mysql02 --volumes-from mysql01 mysql:5.7
# 这个时候，可以实现两个容器数据同步！
```

> `结论`：容器之间的`配置信息`的传递，数据卷容器的生命周期持续到没有容器使用为止，但是一旦持久化到了本地，这个时候，本地的数据是不会删除的。

# DockerFile

​		dockerfile 是用来`构建 docker 镜像`的文件，是一个命令参数脚本。官方镜像都是基础包，很多功能没有，`通常会搭建自己的镜像`。

## DockerFile 构建过程

​		DockerFile 是一个脚本文件，首先需要了解 Docker 脚本的规则：

1）每个保留关键字(指令）都是必须是大写字母。

2）执行从上到下顺序。

3）\# 表示注释。

4）每一个指令都会创建提交一个新的镜像层，并提交。

`DockerFile`：面向开发，构建文件，定义了一切的步骤，源代码，`发布项目的必须`。

`DockerImages`：通过 DockerFile 构建生成的镜像，最终发布和运行的产品。

`Docker容器`：容器就是镜像运行起来提供服务。

​		DockerFile ------> DockerImages --------> Docker 容器

![在这里插入图片描述](https://img-blog.csdnimg.cn/c40a1beeb33140e687c92a3ef54a0680.png)

## DockerFile 指令

```shell
FROM             # 基础镜像，一切从这里开始构建，例如 centos
MAINTAINER        # 镜像是谁写的， 姓名 + 邮箱（官方标准）
RUN             # 镜像构建的时候需要运行的命令
ADD             # 步骤，tomcat镜像，这个tomcat压缩包！添加内容 添加同目录
WORKDIR         # 镜像的工作目录
VOLUME             # 挂载的目录
EXPOSE             # 保留端口配置，-p 设置

CMD             # 指定这个容器启动的时候要运行的命令，只有最后一个会生效，可被替代。
ENTRYPOINT         # 和 cmd 类似，指定这个容器启动的时候要运行的命令，可以追加命令。
ONBUILD         # 当构建一个被继承 DockerFile 这个时候就会运行 ONBUILD 的指令，触发指令。（了解）
COPY             # 类似ADD，将我们文件拷贝到镜像中
ENV             # 构建的时候设置环境变量！ES，MySQL 使用到了
```

## 实战 centos 镜像

​		Docker Hub中 99% 镜像都是从这个基础镜像过来的`FROM scratch` , 然后配置需要的软件和配置来进行的构建。

​		本次实战创建自己的 centos 系统镜像，以上面的图为参考，同时增加官方 centos 没有的`命令依赖`。

官方的 centos 镜像：

![在这里插入图片描述](https://img-blog.csdnimg.cn/1e323c4feaf9415cbc0a79e7e2418c90.png)

1、创建自己的 centos 的 dockerfile 文件：dockerfile-centos

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# cat dockerfile-centos 
FROM centos:7
MAINTAINER gaozheng<1963885633@qq.com>
# 设置工作目录：一进入容器就到工作目录（官方的镜像默认工作目录是根目录）
ENV MYPATH /home/gaozheng/myCentos
WORKDIR $MYPATH

# 安装一些官方没有的命令
RUN yum -y install vim
RUN yum -y install net-tools

# 暴露默认端口
EXPOSE 80

# 输出信息
CMD echo $MYPATH
CMD echo "------构建镜像完毕"
# 默认控制台
CMD /bin/bash
```

2、构建镜像

```shell
docker build -f /home/gaozheng/dockerfile-centos -t centos-gaozheng:1.0 .
# -f 指定 dockerfile 文件
# -t 指定镜像名称
```

```shell
# 检查镜像构建完成
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# docker images
REPOSITORY            TAG       IMAGE ID       CREATED              SIZE
centos-gaozheng       1.0       de22ed9a477e   About a minute ago   601MB
```

3、运行这个镜像

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# docker run -it --name centos centos-gaozheng:1.0
[root@c7a0bd585b55 myCentos]# ls
# 发现当前处于设定的工作目录
[root@c7a0bd585b55 myCentos]# pwd
/home/gaozheng/myCentos
[root@c7a0bd585b55 myCentos]# vim test.txt
[root@c7a0bd585b55 myCentos]# ifconfig
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.17.0.2  netmask 255.255.0.0  broadcast 172.17.255.255
        ether 02:42:ac:11:00:02  txqueuelen 0  (Ethernet)
        RX packets 25  bytes 2191 (2.1 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
# 发现 vim 和 ifconfig 命令可以使用了，在官方基础上做了增强
```

4、查看自定义镜像的`构建过程`：

```shell
# 查看镜像的构建过程
docker history 镜像ID/镜像名:tag
```

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# docker history centos-gaozheng:1.0
IMAGE          CREATED          CREATED BY                                      SIZE      COMMENT
de22ed9a477e   15 minutes ago   /bin/sh -c #(nop)  CMD ["/bin/sh" "-c" "/bin…   0B        
d58a71b14d95   15 minutes ago   /bin/sh -c #(nop)  CMD ["/bin/sh" "-c" "echo…   0B        
2b1814b52c42   15 minutes ago   /bin/sh -c #(nop)  CMD ["/bin/sh" "-c" "echo…   0B        
4270becf57b3   15 minutes ago   /bin/sh -c #(nop)  EXPOSE 80                    0B        
3c8a3388efb8   15 minutes ago   /bin/sh -c yum -y install net-tools             171MB     
c23449816b96   15 minutes ago   /bin/sh -c yum -y install vim                   226MB     
42af61bb10e2   15 minutes ago   /bin/sh -c #(nop) WORKDIR /home/gaozheng/myC…   0B        
62f9150d0f0b   15 minutes ago   /bin/sh -c #(nop)  ENV MYPATH=/home/gaozheng…   0B        
1a0bb47491bc   15 minutes ago   /bin/sh -c #(nop)  MAINTAINER gaozheng<19638…   0B        
eeb6ee3f44bd   8 months ago     /bin/sh -c #(nop)  CMD ["/bin/bash"]            0B        
<missing>      8 months ago     /bin/sh -c #(nop)  LABEL org.label-schema.sc…   0B        
<missing>      8 months ago     /bin/sh -c #(nop) ADD file:b3ebbe8bd304723d4…   204MB
```

通过这个命令来`研究别人的镜像的构建`。

> CMD 和 ENTRYPOINT 区别：
>
> ```shell
> # 注意 cmd 只有最后一条命令会生效
> CMD             # 指定这个容器启动的时候要运行的命令，只有最后一个会生效，可被替代。
> ENTRYPOINT         # 指定这个容器启动的时候要运行的命令，可以追加命令
> ```

1）测试 CMD 命令：

```shell
# 编写 dockerfile 文件
$ vim dockerfile-test-cmd
FROM centos
CMD ["ls","-a"]
# 构建镜像
$ docker build -f dockerfile-test-cmd -t cmd-test:0.1 .
# 运行镜像，发现 ls -a 命令生效
$ docker run cmd-test:0.1
.
..
.dockerenv
bin
......
dev

# 想`追加`一个命令 -l 成为ls -al
$ docker run cmd-test:0.1 -l
docker: Error response from daemon: OCI runtime create failed:container_linux.go:349: starting container process caused "exec: \"-l\":executable file not found in $PATH": unknown.
ERRO[0000] error waiting for container: context canceled
# 原因：cmd 命令的情况下 -l 替换了 CMD["ls","-l"]。 -l 不是命令所有报错

# 那么如何解决呢？=====> 只能写一条完整的命令使其覆盖执行
$ docker run cmd-test:0.1 ls -l
```

2）测试 ENTRYPOINT 命令：

```shell
# 编写dockerfile文件
$ vim dockerfile-test-entrypoint
FROM centos
ENTRYPOINT ["ls","-a"]
$ docker run entrypoint-test:0.1
.
..
.dockerenv
bin
dev
etc
home
lib
lib64
......
lost+found

# 发现：我们的命令，是直接拼接在我们得 ENTRYPOINT 命令后面的（追加方式）
$ docker run entrypoint-test:0.1 -l
total 56
drwxr-xr-x 1 root root 4096 May 16 06:32 .
drwxr-xr-x 1 root root 4096 May 16 06:32 ..
-rwxr-xr-x 1 root root 0 May 16 06:32 .dockerenv
lrwxrwxrwx 1 root root 7 May 11 2019 bin -> usr/bin
drwxr-xr-x 5 root root 340 May 16 06:32 dev
drwxr-xr-x 1 root root 4096 May 16 06:32 etc
drwxr-xr-x 2 root root 4096 May 11 2019 home
lrwxrwxrwx 1 root root 7 May 11 2019 lib -> usr/lib
lrwxrwxrwx 1 root root 9 May 11 2019 lib64 -> usr/lib64 
........
```

## 实战 Tomcat 镜像

1、准备镜像文件：准备 `tomcat 压缩包 和 jdk压缩包` 到当前目录，编写好 README 。

2、编写 dockerfile 脚本：`命名为 Dockerfile（官方命名`，build 时会自动寻找这个文件，不需要指定）。

```shell
# 从 centos7 开始构建
FROM centos:7
# 配置构建者信息
MAINTAINER gaozheng<1963885633@qq.com>

# 复制 readme 文件到容器内
COPY readme.txt /usr/local/readme.txt
# add 命令添加的东西会自动解压，解压到 /usr/local
ADD jdk-8u311-linux-x64.tar.gz /usr/local/
ADD apache-tomcat-8.5.72.tar.gz /usr/local/

# 下载 vim 命令工具
RUN yum -y install vim

# 配置工作目录
ENV MYPATH /usr/local
WORKDIR $MYPATH

# 配置环境变量（类似于 windows 安装 jdk 和 tomcat 时的配置）
ENV JAVA_HOME /usr/local/jdk1.8.0_311
ENV CLASSPATH $JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
ENV CATALINA_HOME /usr/local/apache-tomcat-8.5.72
ENV CATALINA_BASE /usr/local/apache-tomcat-8.5.72
ENV PATH $PATH:$JAVA_HOME/bin:$CATALINA_HOME/lib:$CATALINA_HOME/bin

# 暴露端口 8080
EXPOSE 8080

# 配置 tomcat 在容器启动时自动启动
CMD /usr/local/apache-tomcat-8.5.72/bin/startup.sh && tail -F /usr/local/apache-tomcat-8.5.72/bin/logs/catalina.out
```

3、构建镜像：由于命名为 Dockerfile，则不需要指定 Dockerfile 目录

```shell
docker build -t tomcat-gaozheng
```

4、显示镜像：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# docker images
REPOSITORY            TAG       IMAGE ID       CREATED              SIZE
tomcat-gaozheng       latest    472f0f0c1970   About a minute ago   810MB
centos-gaozheng       1.0       de22ed9a477e   2 hours ago          601MB
```

5、启动镜像，构建容器

```shell
docker run -d -p 10001:8080 --name tomcat-gaozheng -v /home/gaozheng/build/tomcat/test:/usr/local/apache-tomcat-8.5.72/webapps/test -v /home/gaozheng/build/tomcat/tomcat-log/:/usr/local/apache-tomcat-8.5.72/logs tomcat-gaozheng
# 端口映射 10001：8080
# name：tomcat-gaozheng
# webapps 文件目录挂载
# 日志文件挂载
```

6、进入容器查看文件：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# docker exec -it tomcat-gaozheng /bin/bash
[root@23a64bda4137 local]# ls
apache-tomcat-8.5.72  bin  etc  games  include  jdk1.8.0_311  lib  lib64  libexec  readme.txt  sbin  share  src
[root@23a64bda4137 local]# cd apache-tomcat-8.5.72/
[root@23a64bda4137 apache-tomcat-8.5.72]# ls
BUILDING.txt  CONTRIBUTING.md  LICENSE  NOTICE  README.md  RELEASE-NOTES  RUNNING.txt  bin  conf  lib  logs  temp  webapps  work
[root@23a64bda4137 apache-tomcat-8.5.72]# cd webapps
[root@23a64bda4137 webapps]# ls
ROOT  docs  examples  host-manager  manager  test
# 发现 tomcat 的webapps 目录下欢迎页面存在（使用的时本地的压缩包），同时还存在 test 文件夹
```

7、容器外部测试访问：

```shell
curl localhost:10001
```

测试远程外网访问：访问 `http://8.142.92.222:10001`，发现出现 Tomcat 的欢迎页面。

8、发布项目（由于做了数据卷的挂载，只需要将项目放到`主机上的 /home/gaozheng/build/tomcat/test` 文件夹即可）

​		编写一个基本的项目：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ test]# mkdir WEB-INF
[root@iZ8vb0l7sqdpurpvy5e77xZ test]# cd WEB-INF/
[root@iZ8vb0l7sqdpurpvy5e77xZ WEB-INF]# ls
[root@iZ8vb0l7sqdpurpvy5e77xZ WEB-INF]# vim web.xml
[root@iZ8vb0l7sqdpurpvy5e77xZ WEB-INF]# cd ..
[root@iZ8vb0l7sqdpurpvy5e77xZ test]# vim index.jsp
[root@iZ8vb0l7sqdpurpvy5e77xZ test]# ls
index.jsp  WEB-INF
```

web.xml 文件：

```xml
<web-app 
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
	xmlns="http://xmlns.jcp.org/xml/ns/javaee" 
	xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee 
						http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd" 
	id="WebApp_ID" version="4.0">
</web-app>
```

index.jsp 页面：

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Hello DockerFile</title>
</head>
<body>
Hello World!<br/>
<%
    out.println("你的 IP 地址 " + request.getRemoteAddr());
	System.out.println("-----这是我自己的Tomcat 镜像搭建------")
%>
</body>
</html>
```

访问测试：发现成功访问到。

![](D:\NoteBook\核心笔记\Linux\image\dockerfile镜像.png)

9、查看日志：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ tomcat]# cd tomcat-log/
[root@iZ8vb0l7sqdpurpvy5e77xZ tomcat-log]# ls
catalina.2022-06-06.log  host-manager.2022-06-06.log  localhost_access_log.2022-06-06.txt
catalina.out             localhost.2022-06-06.log     manager.2022-06-06.log
[root@iZ8vb0l7sqdpurpvy5e77xZ tomcat-log]# cat catalina.out 
06-Jun-2022 13:13:03.608 INFO [main] org.apache.catalina.startup.VersionLoggerListener.log Server version name:   Apache Tomcat/8.5.72
06-Jun-2022 13:13:03.610 INFO [main] org.apache.catalina.startup.VersionLoggerListener.log Server built:          Oct 1 2021 15:15:33 UTC
06-Jun-2022 13:13:03.610 INFO [main] org.apache.catalina.startup.VersionLoggerListener.log Server version number: 8.5.72.0
06-Jun-2022 13:13:03.610 INFO [main] org.apache.catalina.startup.VersionLoggerListener.log OS Name:               Linux
06-Jun-2022 13:13:03.610 INFO [main] org.apache.catalina.startup.VersionLoggerListener.log OS Version:            4.18.0-193.28.1.el8_2.x86_64
06-Jun-2022 13:13:03.610 INFO [main] org.apache.catalina.startup.VersionLoggerListener.log Architecture:          amd64
06-Jun-2022 13:13:03.610 INFO [main] org.apache.catalina.startup.VersionLoggerListener.log Java Home:             /usr/local/jdk1.8.0_311/jre
...........................
```

## 发布镜像

### 发布到 DockerHub

1、在DockerHub 注册一个账号 gaozheng1998（密码 gaozheng1998） ，并登录。

2、在服务器主机上提交镜像：

```shell
# 登录 docker
docker login -u gaozheng1998 -p gaozheng1998

[root@iZ8vb0l7sqdpurpvy5e77xZ tomcat-log]# docker login -u gaozheng1998 -p gaozheng1998
WARNING! Using --password via the CLI is insecure. Use --password-stdin.
WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded
```

3、提交镜像：

```shell
docker push 镜像名:tag

# 直接 push 会被拒绝
[root@iZ8vb0l7sqdpurpvy5e77xZ tomcat-log]# docker push tomcat-gaozheng
Using default tag: latest
The push refers to repository [docker.io/library/tomcat-gaozheng]
80c6f89de9c4: Preparing 
51c23c1501c0: Preparing 
84ecaa5f6aa8: Preparing 
730d3dc62dc7: Preparing 
174f56854903: Preparing 
denied: requested access to the resource is denied

# 此时是由于没有加版本号（同时建议加上个人信息，放在镜像名上，且需要和注册的账号保持一致）
# 原镜像名
[root@iZ8vb0l7sqdpurpvy5e77xZ gaozheng]# docker images
REPOSITORY            TAG       IMAGE ID       CREATED              SIZE
tomcat-gaozheng       latest    472f0f0c1970   About a minute ago   810MB
# 修改镜像名
[root@iZ8vb0l7sqdpurpvy5e77xZ tomcat-log]# docker tag tomcat-gaozheng gaozheng1998/tomcat:1.0
# 修改后镜像名
[root@iZ8vb0l7sqdpurpvy5e77xZ tomcat-log]# docker images
REPOSITORY            TAG       IMAGE ID       CREATED          SIZE
gaozheng1998/tomcat   1.0       472f0f0c1970   40 minutes ago   810MB
tomcat-gaozheng       latest    472f0f0c1970   40 minutes ago   810MB
# 此时再进行提交（镜像名:版本号），便没有问题了
[root@iZ8vb0l7sqdpurpvy5e77xZ tomcat-log]# docker push gaozheng1998/tomcat:1.0
The push refers to repository [docker.io/gaozheng1998/tomcat]
80c6f89de9c4: Pushing [==========>                                        ]  49.37MB/226.1MB
51c23c1501c0: Pushed 
84ecaa5f6aa8: Pushing [====>                                              ]   31.4MB/365.3MB
730d3dc62dc7: Pushed 
174f56854903: Pushing [========>                                          ]  36.41MB/203.9MB
```

提交的时候也是按照镜像的层级来提交的！

### 发布到阿里云容器服务

1、登录阿里云官网，进入容器镜像服务。

2、创建个人版实例，进入实例，创建命名空间。

![](https://pic1.imgdb.cn/item/63369d7b16f2c2beb16c3d57.png)

3、创建镜像仓库。

![](https://pic1.imgdb.cn/item/63369d9616f2c2beb16c58ea.png)

4、浏览阿里云信息，根据提示提交镜像。（参考官方文档即可）

![](https://pic1.imgdb.cn/item/63369da616f2c2beb16c69e1.png)

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ tomcat-log]# docker tag 472f0f0c1970 registry.cn-zhangjiakou.aliyuncs.com/gaozheng-test/gaozheng-test2022:1.0
[root@iZ8vb0l7sqdpurpvy5e77xZ tomcat-log]# docker push registry.cn-zhangjiakou.aliyuncs.com/gaozheng-test/gaozheng-test2022:1.0
The push refers to repository [registry.cn-zhangjiakou.aliyuncs.com/gaozheng-test/gaozheng-test2022]
80c6f89de9c4: Pushing [>                                                  ]  3.275MB/226.1MB
51c23c1501c0: Pushing [========>                                          ]  2.621MB/14.78MB
84ecaa5f6aa8: Pushing [>                                                  ]  2.751MB/365.3MB
730d3dc62dc7: Pushed 
174f56854903: Pushing [=>                                                 ]  4.875MB/203.9MB
```

# Docker 网络

​		Docker 网络：也叫 `Docker0`。

查看基本 IP：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# ip address
# lo：本地回环地址 127.0.0.1
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
# eth0：阿里云内网地址 172.21.218.169
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 00:16:3e:16:99:95 brd ff:ff:ff:ff:ff:ff
    inet 172.21.218.169/20 brd 172.21.223.255 scope global dynamic noprefixroute eth0
       valid_lft 301453785sec preferred_lft 301453785sec
    inet6 fe80::216:3eff:fe16:9995/64 scope link 
       valid_lft forever preferred_lft forever
# docker0：docker 生成的网卡 172.17.0.1
3: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default 
    link/ether 02:42:a1:41:ea:ce brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
       valid_lft forever preferred_lft forever
    inet6 fe80::42:a1ff:fe41:eace/64 scope link 
       valid_lft forever preferred_lft forever
```

`问题`：docker 是如何处理容器网络访问的呢？

## 主机容器通信

> 测试：使用一个 Tomcat 容器测试`容器外能不能 ping 通 容器内`呢？

```shell
# 拉取 tomcat 镜像并启动
docker run -d  -p 10001:8080 --name tomcat tomcat

# 进入 tomcat 容器，并打印 ip 地址
docker exec -it tomcat ip addr
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker  exec -it tomcat ip addr
# lo：本地回环地址 127.0.0.1
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
# eth0@if111 地址是 docker 分配的
110: eth0@if111: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    link/ether 02:42:ac:11:00:02 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever

# 那么 linux 主机能不能 ping 通容器内部呢？ ======> 可以 ping 通
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# ping 172.17.0.2
PING 172.17.0.2 (172.17.0.2) 56(84) bytes of data.
64 bytes from 172.17.0.2: icmp_seq=1 ttl=64 time=0.052 ms
64 bytes from 172.17.0.2: icmp_seq=2 ttl=64 time=0.055 ms
64 bytes from 172.17.0.2: icmp_seq=3 ttl=64 time=0.055 ms

# 发现一个奇特之处：docker 本身地址是 172.17.0.1（类似于生活中路由器的地址），给 tomcat 容器分配的是 172.17.0.2，二者在同一网段
```

> 此处使用 ipaddr 时可能会有问题：
>
> ```shell
> [root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker exec -it tomcat ip addr
> OCI runtime exec failed: exec failed: container_linux.go:380: starting container process caused: exec: "ip": executable file not found in $PATH: unknown
> ```
>
> ​		这是由于 docker 内部的 tomcat 容器是精简版的，并没有 ip addr 命令可以使用。=====> `安装 iproute2 工具`。
>
> ```shell
> # 1、进入容器内部
> docker  exec -it tomcat /bin/bash
> # 2、安装工具
> apt install -y iproute2
> # 3、发现下载不成功：是由于镜像过慢导致，因此需要更改系统镜像配置
> # 进入配置文件
> cd /etc/apt
> # 查看目录信息
> ls
> cat sources.list
> # 备份
> mkdir cat sources.list.backup
> cp sources.list ./sources.list.backup
> cd ../
> # 以覆盖+追加的方式替换掉sources.list文件
> echo 'deb https://mirrors.aliyun.com/debian bullseye main'>sources.list
> echo 'deb https://mirrors.aliyun.com/debian-security bullseye-security main'>>sources.list
> echo 'deb https://mirrors.aliyun.com/debian bullseye-updates main'>>sources.list
> # 执行一下更新命令：
> apt-get update -y
> # 执行下载 iproute2命令：
> apt install -y iproute2
> ```

`发现`：

1）只要安装了 docker，就会有一个网卡 `docker0`，采用的桥接模式，使用的是 veth-pair 技术。

2）当我们启动一个 docker 容器时，docker 就会给该容器分配一个 ip。

3）再次查看 ip addr 发现多了一个地址 `111: vethb003a6f@if110`，和该容器内部的那个 ip 有一定关系。

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 00:16:3e:16:99:95 brd ff:ff:ff:ff:ff:ff
    inet 172.21.218.169/20 brd 172.21.223.255 scope global dynamic noprefixroute eth0
       valid_lft 301452124sec preferred_lft 301452124sec
    inet6 fe80::216:3eff:fe16:9995/64 scope link 
       valid_lft forever preferred_lft forever
3: docker0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    link/ether 02:42:a1:41:ea:ce brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
       valid_lft forever preferred_lft forever
    inet6 fe80::42:a1ff:fe41:eace/64 scope link 
       valid_lft forever preferred_lft forever
111: vethb003a6f@if110: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master docker0 state UP group default 
    link/ether ea:7e:3b:85:26:c4 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet6 fe80::e87e:3bff:fe85:26c4/64 scope link 
       valid_lft forever preferred_lft forever
```

> 发现容器启动时分配的网卡都是一对一对的：容器内 110: eth0@if111，容器外 111: vethb003a6f@if110
>
> 这就是 veth-pair 技术的体现：veth-pair 就是一对的虚拟设备接口，因此都是成对出现，一端连着协议，一端彼此相连。
>
> 正因为有这个特性，veth-pair 就能充当一个桥梁，连接各种虚拟网络设备。
>
> 举例：上面`主机分配的是 111，容器内部分配的 110，而 110 和 111 又通过接口进行了绑定，因此可以 ping 通`。

## 容器间通信

​		此时再启动一个 tomcat，那么两个 tomcat 之间可以直接 ping 通吗？

```shell
# 启动tomcat02
docker run -d  -P --name tomcat02 tomcat

# 检查 ip addr，发现又分配了一对新的 ip
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# ip addr
......
113: veth7d69004@if112: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master docker0 state UP group default 
    link/ether 12:0a:61:f7:d6:6f brd ff:ff:ff:ff:ff:ff link-netnsid 1
    inet6 fe80::100a:61ff:fef7:d66f/64 scope link 
       valid_lft forever preferred_lft forever
       
```

进入容器内部，检查 ip 发现 tomcat02 ip为：172.17.0.3，和 tomcat 172.17.0.2，以及主机 docker 路由 172.17.0.1 都处于同一个网段。

因此：`容器和容器间都是可以 ping 通的`。

![在这里插入图片描述](https://img-blog.csdnimg.cn/cce22e1584b349f69aa07c6a01ad9d1e.png)

> `备注`：上图为网络简图，对应自己的网络 ip 关系为：
>
> 1）264: veth2d06abc@if263 对应 113: veth7d69004@if112
>
> 2）261: eth0@if262 对应 110: eth0@if111
>
> 3）以此类推 . . . . . . 

结论：

1）tomcat01 和 tomcat02公用一个路由器，docker0。

所有的容器不指定网络的情况下，都是 docker0 路由的，docker 会给我们的容器分配一个默认的可用ip（最多 65535 个）。

![在这里插入图片描述](https://img-blog.csdnimg.cn/16e851ba1eb142059cb0461d5ecc2f30.png)

小结： `Docker使用的是Linux的桥接`，`宿主机是一个 Docker 容器的网桥 docker0`

![在这里插入图片描述](https://img-blog.csdnimg.cn/690de016b877403296c0ec5edd23e370.png)

Docker 中的所有的网络接口都是虚拟的 =====> 虚拟的转发效率高，只要容器删除，对应网桥一对就消失。

## 容器互联

思考：我们编写了一个微服务，database url=ip: ，项目不重启，但数据库 ip 地址换了，我们希望可以处理这个问题，可以通过服务名字来进行访问容器？

即`直接通过网路，直接通过服务名，而不通过 IP 直接就 ping 通`，如何做到呢？	======》 `--link`技术

> `解决 docker 容器内部没有 ifconfig 或 ping 命令`：ping 命令的使用需要安装，而阉割版的并没有安装。
>
> ```shell
> apt-get update
> apt install net-tools
> ```
>
> 此种方法可以解决 ifconfig 命令（查看 ip addr 地址）的使用，但是 ping 命令安装由于镜像再次出现问题。===> `配置镜像`。
>
> ```shell
> # 进入配置文件
> cd /etc/apt
> # 查看目录信息
> ls
> cat sources.list
> # 备份
> mkdir cat sources.list.backup
> cp sources.list ./sources.list.backup
> cd ../
> # 以覆盖+追加的方式替换掉sources.list文件
> echo 'deb https://mirrors.aliyun.com/debian bullseye main'>sources.list
> echo 'deb https://mirrors.aliyun.com/debian-security bullseye-security main'>>sources.list
> echo 'deb https://mirrors.aliyun.com/debian bullseye-updates main'>>sources.list
> ```
>
> 再进行 ping 命令工具的安装：
>
> ```shell
> apt install iputils-ping
> ```

```shell
# 直接通过 tomcat ping tomcat02 的服务名
docker exec -it tomcat ping tomca02
# 发现报错信息：
tomca02: Name or service not known

# 运行一个 tomcat03 同时使用 --link 到 tomcat 上
docker run -d -P --name tomcat03 --link tomcat tomcat
# 再次用 tomcat03 ping tomcat ，发现可以 ping 通
docker exec -it tomcat03 ping tomcat 
PING tomcat (172.17.0.4) 56(84) bytes of data.64 bytes from tomcat (172.17.0.2): icmp_seq=1 ttl=64 time=0.115 ms64 bytes from tomcat02 (172.17.0.3): icmp_seq=2 ttl=64 time=0.080 ms
# 再用 tomcat ping tomcat03 ，发现 ping 不通？反向并不能 ping 通 =====> 需要重启 tomcat 并设置 --link 连接到 tomcat03 上才行
```

探究：

```shell
# 使用 docker network inspect 命令可以查看 docker 的网络互连情况
docker network inspect
# 查看某个容器具体的情况配置：
docker inspect tomcat03
```

发现：实际上 `--link` 原理就是在该容器内的 `hosts 配置文件中加入了 服务名映射成地址的配置`。

![在这里插入图片描述](https://img-blog.csdnimg.cn/ac76669d0bae4229914b73e2ffdf98a9.png)

注意：现在使用 Docker已经不建议使用 –link了，而`推荐使用自定义网络`，不使用 docker0 =====> docker0 问题：不支持容器名连接访问。

## 自定义网络

​		`容器互联`方式：--link 和 自定义网络。

```shell
# 查看网络设置帮助信息
docker network --help
# 查看所有的当前网络
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker network ls
NETWORK ID     NAME      DRIVER    SCOPE
288ccd8ca3a1   bridge    bridge    local
23b1f23a2f96   host      host      local
8e93e74e8004   none      null      local
```

> 网络模式：
>
> 1）桥接（bridge）默认的设置：自己创建的也使用桥接模式
>
> 2）不配置网络（none）
>
> 3）和宿主共享网络（host）
>
> 4）docker 内还提供了 container 模式：容器内网络联通（不建议使用，局限很大）

原来的启动方式：

```shell
docker run -d -P --name tomcat01 tomcat
```

实际上此处是省略了网络默认参数（等价于）：

```shell
docker run -d -P --name tomcat01 --net bridge tomcat

# docker0 特点：默认，域名不能访问。 --link 可以打通连接，但是很麻烦，一般不会使用
```

自定义网络：`create`

```shell
# --driver bridge，默认的，桥接
# --subnet 192.168.0.0/16  子网，65535 个：192.168.0.2 ~ 192.168.255.255
# --gateway 192.168.0.1  网关，相当于路由器地址
docker network create --driver bridge --subnet 192.168.0.0/16 --gateway 192.168.0.1 mynet

[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker network ls
NETWORK ID     NAME      DRIVER    SCOPE
288ccd8ca3a1   bridge    bridge    local
23b1f23a2f96   host      host      local
c616824ae5a6   mynet     bridge    local
8e93e74e8004   none      null      local

# 查看自己网络的配置
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker network inspect mynet
[
    {
        "Name": "mynet",
        "Id": "c616824ae5a61e76502dfe2a9835fd9e163854311894f471c260f632954f1fef",
        "Created": "2022-06-07T13:23:38.461668942+08:00",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "192.168.0.0/16",
                    "Gateway": "192.168.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {},
        "Options": {},
        "Labels": {}
    }
]
```

之后的服务便可以放在自己的网络里面，例如测试启动 tomcat，使用自己的网络：

```shell
# 启动 tomcat-net-01
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker run -d -P --name tomcat-net-01 --net mynet tomcat
7c7679fa22912920c31bf69e870b4d3d4ab40ee9e06b1e816ec97ae7ac3b3dd3
# 启动 tomcat-net-02
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker run -d -P --name tomcat-net-02 --net mynet tomcat
7c57392ad52f5a429a5cd1e41468e8c9e03881773a346b4223203f7efd920b5e
# 再查看网络，发现自己的网络下有两个容器
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker network inspect mynet
[
    {
        "Name": "mynet",
        "Id": "c616824ae5a61e76502dfe2a9835fd9e163854311894f471c260f632954f1fef",
        "Created": "2022-06-07T13:23:38.461668942+08:00",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "192.168.0.0/16",
                    "Gateway": "192.168.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        # 具体的容器实例，分配的 IP 是之前使用的。
        "Containers": {
            "7c57392ad52f5a429a5cd1e41468e8c9e03881773a346b4223203f7efd920b5e": {
                "Name": "tomcat-net-02",
                "EndpointID": "a32d75da1f219aab73a2be733029096e5f2149ddf26edc20076b6746e1e8566d",
                "MacAddress": "02:42:c0:a8:00:03",
                "IPv4Address": "192.168.0.3/16",
                "IPv6Address": ""
            },
            "7c7679fa22912920c31bf69e870b4d3d4ab40ee9e06b1e816ec97ae7ac3b3dd3": {
                "Name": "tomcat-net-01",
                "EndpointID": "f7fd34737778a32a0d1246bbdd3def0cb33fef8b71fbd3ee1a9c96ec95259a60",
                "MacAddress": "02:42:c0:a8:00:02",
                "IPv4Address": "192.168.0.2/16",
                "IPv6Address": ""
            }
        },
        "Options": {},
        "Labels": {}
    }
]
```

此时便可以是直接 ping 通其他的容器：

1）通过 IP ping，可以 ping 通。

```shell
docker exec -it tomcat-net-01 ping 192.168.0.3
```

2）直接通过容器名称 ping，可以 ping 通。

```shell
docker exec -it tomcat-net-01 ping tomcat-net-02
```

现在不使用 --link 就可以使用容器名称访问。	======> 自定义网络已经维护好了对应的关系，因此`推荐使用这种方式`。

> 优点之处：
>
> - redis ： 不同的集群使用不同的网络，保证集群是安全和健康的。
> - mysql：不同的集群使用不同的网络，保证集群是安全和健康的。
>
> ![在这里插入图片描述](https://img-blog.csdnimg.cn/6184a7c2d3b3460983a5463dafb0f05f.png)

## 网络联通

​		现在已经有两个网络：默认的 docker0、自己定义的 mynet，那么不同的网络内的应用怎么 ping 通呢？====> `直接连是不可能的`（ping 不通，`不同网段`）

这个时候就希望 `docker0 里面具体的应用` 和 mynet 联通（因为正常情况两个网络直接进行联通是不可能的），此时就需要使用到 `connect` 操作。

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker network --help

Usage:  docker network COMMAND

Manage networks

Commands:
  # connect 操作就可以实现一个网络内部容器联通到另一个网络
  connect     Connect a container to a network
  create      Create a network
  disconnect  Disconnect a container from a network
  inspect     Display detailed information on one or more networks
  ls          List networks
  prune       Remove all unused networks
  rm          Remove one or more networks

Run 'docker network COMMAND --help' for more information on a command.
```

测试：联通 docker0 网络里的 tomcat01 联通到 mynet。

```shell
# 启动一个默认网络（docker0）的 tomcat 容器
docker run -d -P --name tomcat01 tomcat

# 直接 ping 另一个网络里面的容器 （ping 不通）
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker exec -it tomcat01 ping 192.168.0.2
PING 192.168.0.2 (192.168.0.2) 56(84) bytes of data.
--- 192.168.0.2 ping statistics ---
53 packets transmitted, 0 received, 100% packet loss, time 53254ms

# 联通 tomcat01 和 mynet
docker network connect mynet tomcat01

# 再次查看 mynet 内部的容器信息
docker network inspect mynet
......
"Containers": {
            "6b1f8aa8ff7ffeb8ffd47a2134943ad641bb90709ddbb3f3d2bee397e195d7b0": {
                "Name": "tomcat01",
                "EndpointID": "2612fb3b4ac0bd1c67ee5106d33f9bd74694cbf1822cc95d31186145d31a442e",
                "MacAddress": "02:42:c0:a8:00:04",
                "IPv4Address": "192.168.0.4/16",
                "IPv6Address": ""
            },
            "7c57392ad52f5a429a5cd1e41468e8c9e03881773a346b4223203f7efd920b5e": {
                "Name": "tomcat-net-02",
                "EndpointID": "a32d75da1f219aab73a2be733029096e5f2149ddf26edc20076b6746e1e8566d",
                "MacAddress": "02:42:c0:a8:00:03",
                "IPv4Address": "192.168.0.3/16",
                "IPv6Address": ""
            },
            "7c7679fa22912920c31bf69e870b4d3d4ab40ee9e06b1e816ec97ae7ac3b3dd3": {
                "Name": "tomcat-net-01",
                "EndpointID": "f7fd34737778a32a0d1246bbdd3def0cb33fef8b71fbd3ee1a9c96ec95259a60",
                "MacAddress": "02:42:c0:a8:00:02",
                "IPv4Address": "192.168.0.2/16",
                "IPv6Address": ""
            }
        },
......
# 发现联通之后直接将 tomcat01 放到了 mynet 网络下 ======> 一个容器有两个 IP ：类似于阿里云服务器，一个公网 IP，一个私网 IP

# 再次 ping 测试，ping 通
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker exec -it tomcat01 ping 192.168.0.2
PING 192.168.0.2 (192.168.0.2) 56(84) bytes of data.
64 bytes from 192.168.0.2: icmp_seq=1 ttl=64 time=0.138 ms
64 bytes from 192.168.0.2: icmp_seq=2 ttl=64 time=0.078 ms
......
--- 192.168.0.2 ping statistics ---
6 packets transmitted, 6 received, 0% packet loss, time 5079ms
```

`结论`：假设要跨网络操作别人，就需要使用 docker network connect 连通。

# Redis 集群

​		实战测试：搭建一个分片的 Redis 集群（一主一从，主机宕机从机顶替），需要一个 redis 的单独网卡（网络）。

![在这里插入图片描述](https://img-blog.csdnimg.cn/5d90a471e0a34f2bafd51a05be204bf9.png)

1、搭建 redis 集群：

```shell
# 创建 redis 单独的网络
docker network create redis --subnet 172.38.0.0/16

# redis 是需要设置配置文件的，利用脚本一次性配置六个redis配置文件（直接命令行执行）
for port in $(seq 1 6);\
do \
mkdir -p /mydata/redis/node-${port}/conf
touch /mydata/redis/node-${port}/conf/redis.conf
cat << EOF >> /mydata/redis/node-${port}/conf/redis.conf
port 6379
bind 0.0.0.0
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
cluster-announce-ip 172.38.0.1${port}
cluster-announce-port 6379
cluster-announce-bus-port 16379
appendonly yes
EOF
done
# 此时六个 redis 的配置文件已经配置
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# cd /mydata/redis
[root@iZ8vb0l7sqdpurpvy5e77xZ redis]# ls
node-1  node-2  node-3  node-4  node-5  node-6

# 创建 redis 容器
# -p 6371:6379 -p 16671:16379 端口映射
# --name redis-1 容器名
# -v 挂载数据卷
# --net 设置自己的 redis 网络
docker run -p 6371:6379 -p 16671:16379 --name redis-1 \
-v /mydata/redis/node-1/data:/data \
-v /mydata/redis/node-1/conf/redis.conf:/etc/redis/redis.conf \
-d --net redis --ip 172.38.0.11 redis:5.0.9-alpine3.11 redis-server /etc/redis/redis.conf

docker run -p 6376:6379 -p 16676:16379 --name redis-6 \
-v /mydata/redis/node-6/data:/data \
-v /mydata/redis/node-6/conf/redis.conf:/etc/redis/redis.conf \
-d --net redis --ip 172.38.0.16 redis:5.0.9-alpine3.11 redis-server /etc/redis/redis.conf


# 也可以通过脚本运行六个redis 容器
for port in $(seq 1 6);\
docker run -p 637${port}:6379 -p 1667${port}:16379 --name redis-${port} \
-v /mydata/redis/node-${port}/data:/data \
-v /mydata/redis/node-${port}/conf/redis.conf:/etc/redis/redis.conf \
-d --net redis --ip 172.38.0.1${port} redis:5.0.9-alpine3.11 redis-server /etc/redis/redis.conf

# 检查启动情况
[root@iZ8vb0l7sqdpurpvy5e77xZ conf]# docker ps
CONTAINER ID   IMAGE                    COMMAND                  CREATED              STATUS              PORTS                                                                                      NAMES
88f54f6d602f   redis:5.0.9-alpine3.11   "docker-entrypoint.s…"   3 seconds ago        Up 2 seconds        0.0.0.0:6376->6379/tcp, :::6376->6379/tcp, 0.0.0.0:16676->16379/tcp, :::16676->16379/tcp   redis-6
5befb3e34787   redis:5.0.9-alpine3.11   "docker-entrypoint.s…"   26 seconds ago       Up 25 seconds       0.0.0.0:6375->6379/tcp, :::6375->6379/tcp, 0.0.0.0:16675->16379/tcp, :::16675->16379/tcp   redis-5
614913cf587d   redis:5.0.9-alpine3.11   "docker-entrypoint.s…"   About a minute ago   Up 59 seconds       0.0.0.0:6374->6379/tcp, :::6374->6379/tcp, 0.0.0.0:16674->16379/tcp, :::16674->16379/tcp   redis-4
a692733820e6   redis:5.0.9-alpine3.11   "docker-entrypoint.s…"   About a minute ago   Up About a minute   0.0.0.0:6373->6379/tcp, :::6373->6379/tcp, 0.0.0.0:16673->16379/tcp, :::16673->16379/tcp   redis-3
d9acd17b3d86   redis:5.0.9-alpine3.11   "docker-entrypoint.s…"   2 minutes ago        Up 2 minutes        0.0.0.0:6372->6379/tcp, :::6372->6379/tcp, 0.0.0.0:16672->16379/tcp, :::16672->16379/tcp   redis-2
c827cb1cbedc   redis:5.0.9-alpine3.11   "docker-entrypoint.s…"   3 minutes ago        Up 3 minutes        0.0.0.0:6371->6379/tcp, :::6371->6379/tcp, 0.0.0.0:16671->16379/tcp, :::16671->16379/tcp   redis-1

# 创建集群，注意 redis 里面没有 bash 命令，只有 sh 命令
# 1、进入redis-1
[root@iZ8vb0l7sqdpurpvy5e77xZ conf]# docker exec -it redis-1 /bin/sh
/data # ls
appendonly.aof  nodes.conf
# appendonly.aof 为 aof 持久化配置
# nodes.conf 为节点配置

# 2、创建集群
/data # redis-cli --cluster create 172.38.0.11:6379 172.38.0.12:6379 172.38.0.13:6379 172.38.0.14:6379 172.38.0.15:6379 172.38.0.16:6379 --cluster-replicas 1
>>> Performing hash slots allocation on 6 nodes...
Master[0] -> Slots 0 - 5460
Master[1] -> Slots 5461 - 10922
Master[2] -> Slots 10923 - 16383
Adding replica 172.38.0.15:6379 to 172.38.0.11:6379
Adding replica 172.38.0.16:6379 to 172.38.0.12:6379
Adding replica 172.38.0.14:6379 to 172.38.0.13:6379
M: 0231dff34b823d8dde232677ec64fe1558771b7d 172.38.0.11:6379
   slots:[0-5460] (5461 slots) master
M: 1b23cb1f6ce963ce9a348f6982c2e33cd0488bc5 172.38.0.12:6379
   slots:[5461-10922] (5462 slots) master
M: 6cef12e5bd1836dda4951321b7599f01bc60bfec 172.38.0.13:6379
   slots:[10923-16383] (5461 slots) master
S: 4d2d9a42da3629aee577770857df04d0fc733136 172.38.0.14:6379
   replicates 6cef12e5bd1836dda4951321b7599f01bc60bfec
S: 982a6a404d29df12eab71d2a05d4d1d0c248af88 172.38.0.15:6379
   replicates 0231dff34b823d8dde232677ec64fe1558771b7d
S: a9ca8b55cc795f2a0f5e6dd20e8183287a068b47 172.38.0.16:6379
   replicates 1b23cb1f6ce963ce9a348f6982c2e33cd0488bc5
Can I set the above configuration? (type 'yes' to accept): yes
>>> Nodes configuration updated
>>> Assign a different config epoch to each node
>>> Sending CLUSTER MEET messages to join the cluster
Waiting for the cluster to join
...
>>> Performing Cluster Check (using node 172.38.0.11:6379)
M: 0231dff34b823d8dde232677ec64fe1558771b7d 172.38.0.11:6379
   slots:[0-5460] (5461 slots) master
   1 additional replica(s)
S: a9ca8b55cc795f2a0f5e6dd20e8183287a068b47 172.38.0.16:6379
   slots: (0 slots) slave
   replicates 1b23cb1f6ce963ce9a348f6982c2e33cd0488bc5
M: 1b23cb1f6ce963ce9a348f6982c2e33cd0488bc5 172.38.0.12:6379
   slots:[5461-10922] (5462 slots) master
   1 additional replica(s)
S: 982a6a404d29df12eab71d2a05d4d1d0c248af88 172.38.0.15:6379
   slots: (0 slots) slave
   replicates 0231dff34b823d8dde232677ec64fe1558771b7d
S: 4d2d9a42da3629aee577770857df04d0fc733136 172.38.0.14:6379
   slots: (0 slots) slave
   replicates 6cef12e5bd1836dda4951321b7599f01bc60bfec
M: 6cef12e5bd1836dda4951321b7599f01bc60bfec 172.38.0.13:6379
   slots:[10923-16383] (5461 slots) master
   1 additional replica(s)
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
# 此时证明集群创建成功
```

2、redis 集群的使用：

```shell
# 连接到集群客户端
/data # redis-cli -c
# 查看集群信息
127.0.0.1:6379> cluster info
cluster_state:ok
cluster_slots_assigned:16384
cluster_slots_ok:16384
cluster_slots_pfail:0
cluster_slots_fail:0
cluster_known_nodes:6
cluster_size:3		# 集群主机数量
cluster_current_epoch:6
cluster_my_epoch:1
cluster_stats_messages_ping_sent:287
cluster_stats_messages_pong_sent:303
cluster_stats_messages_sent:590
cluster_stats_messages_ping_received:298
cluster_stats_messages_pong_received:287
cluster_stats_messages_meet_received:5
cluster_stats_messages_received:590
# 查看集群节点信息：三主三从
127.0.0.1:6379> cluster nodes
0231dff34b823d8dde232677ec64fe1558771b7d 172.38.0.11:6379@16379 myself,master - 0 1654582806000 1 connected 0-5460
a9ca8b55cc795f2a0f5e6dd20e8183287a068b47 172.38.0.16:6379@16379 slave 1b23cb1f6ce963ce9a348f6982c2e33cd0488bc5 0 1654582807596 6 connected
1b23cb1f6ce963ce9a348f6982c2e33cd0488bc5 172.38.0.12:6379@16379 master - 0 1654582808596 2 connected 5461-10922
982a6a404d29df12eab71d2a05d4d1d0c248af88 172.38.0.15:6379@16379 slave 0231dff34b823d8dde232677ec64fe1558771b7d 0 1654582807000 5 connected
4d2d9a42da3629aee577770857df04d0fc733136 172.38.0.14:6379@16379 slave 6cef12e5bd1836dda4951321b7599f01bc60bfec 0 1654582808000 4 connected
6cef12e5bd1836dda4951321b7599f01bc60bfec 172.38.0.13:6379@16379 master - 0 1654582808596 3 connected 10923-16383
# 目前集群都是正常的

# 插入数据测试
127.0.0.1:6379> set a "b"
-> Redirected to slot [15495] located at 172.38.0.13:6379
OK
172.38.0.13:6379> set aa "bb"
-> Redirected to slot [1180] located at 172.38.0.11:6379
OK
172.38.0.11:6379> set aaa "bbb"
-> Redirected to slot [10439] located at 172.38.0.12:6379
OK
# 插入数据被分发到各个主机
```

3、redis 高可用性测试：

```shell
# 停止 172.38.0.13:6379 的 redis 容器
docker stop redis-3

# 此时测试能否得到 key=a 的值
127.0.0.1:6379> get a
-> Redirected to slot [15495] located at 172.38.0.14:6379
"b"
# 发现从机 redis-4 顶替了主机 redis-3
# 此时查看节点信息，发现 redis-3处于：fail 状态，同时 redis-4 变成了 master
127.0.0.1:6379> cluster nodes
0231dff34b823d8dde232677ec64fe1558771b7d 172.38.0.11:6379@16379 myself,master - 0 1654583289000 1 connected 0-5460
a9ca8b55cc795f2a0f5e6dd20e8183287a068b47 172.38.0.16:6379@16379 slave 1b23cb1f6ce963ce9a348f6982c2e33cd0488bc5 0 1654583289495 6 connected
1b23cb1f6ce963ce9a348f6982c2e33cd0488bc5 172.38.0.12:6379@16379 master - 0 1654583289997 2 connected 5461-10922
982a6a404d29df12eab71d2a05d4d1d0c248af88 172.38.0.15:6379@16379 slave 0231dff34b823d8dde232677ec64fe1558771b7d 0 1654583290498 5 connected
# redis-4 变成了 master
4d2d9a42da3629aee577770857df04d0fc733136 172.38.0.14:6379@16379 `master` - 0 1654583289000 7 connected 10923-16383
# redis-3处于：fail 状态
6cef12e5bd1836dda4951321b7599f01bc60bfec 172.38.0.13:6379@16379 `master,fail` - 1654583239508 1654583238507 3 connected
```

# Boot 项目打包镜像

1、构建 SpringBoot 项目：demo，当前版本：2.7.0 版本，编写一个基本的 controller，本地测试：

```java
@RestController
public class HelloController {

    @RequestMapping("/hello")
    public String hello(){
        return "Hello,Dockerfile";
    }
}
```

2、利用 IDEA 的 maven 工具栏打包，或者使用命令打包：

```shell
mvn package
```

同时，将 jar 包命令行运行测试，验证成功启动。

```shell
java -jar demo-0.0.1-SNAPSHOT.jar
```

3、编写 Dockerfile 文件，此时需要在 IDEA 中装一个插件：Docker （默认已安装），此时在根目录下创建文件 Dockerfile，会有一个专属图标。

```shell
# 发布时只发布 jar 包 和 Dockerfile 文件
FROM java:8
# 复制 jar 包并重命名
COPY *.jar /demo.jar
CMD ["--server.port=8080"]
EXPOSE 8080
# 执行命令
ENTRYPOINT ["java","-jar","demo.jar"]
```

4、上传 Dockerfile 脚本文件和 jar 包到服务器 `/home/gaozheng/idea`目录（只需要这两个文件），再进行镜像的构建。

```shell
# 查看文件
[root@iZ8vb0l7sqdpurpvy5e77xZ idea]# ls
demo-0.0.1-SNAPSHOT.jar  Dockerfile
# 构建镜像
[root@iZ8vb0l7sqdpurpvy5e77xZ idea]# docker build -t gaozheng/hellodemo:1.0 .
Sending build context to Docker daemon  17.61MB
Step 1/5 : FROM java:8
8: Pulling from library/java
..................
Successfully built a9deee2d9e96
Successfully tagged gaozheng/hellodemo:1.0

# 查看镜像
[root@iZ8vb0l7sqdpurpvy5e77xZ idea]# docker images
REPOSITORY           TAG                IMAGE ID       CREATED         SIZE
gaozheng/hellodemo   1.0                a9deee2d9e96   7 seconds ago   661MB
java                 8                  d23bdf5b1b1b   5 years ago     643MB

```

5、发布运行

```shell
# 启动容器
[root@iZ8vb0l7sqdpurpvy5e77xZ idea]# docker run -d -p 10001:8080 --name gaozheng-hello-demo gaozheng/hellodemo:1.0
0aaf1f30627d8a08ccb1e75209e8dc39534f20bf2d06013da4e1e5b44668738d
[root@iZ8vb0l7sqdpurpvy5e77xZ idea]# docker ps
CONTAINER ID   IMAGE                    COMMAND                  CREATED         STATUS         PORTS                                         NAMES
0aaf1f30627d   gaozheng/hellodemo:1.0   "java -jar demo.jar …"   4 seconds ago   Up 2 seconds   0.0.0.0:10001->8080/tcp, :::10001->8080/tcp   gaozheng-hello-demo
# 访问测试：证实项目部署成功
root@iZ8vb0l7sqdpurpvy5e77xZ idea]# curl localhost:10001/hello
Hello,Dockerfile
```

本地测试访问远程：

![](D:\NoteBook\核心笔记\Linux\image\docker部署项目.png)

因此，以后可以直接`交付 镜像 `即可，但是微服务一次部署很多 jar 包（镜像），那该怎么解决呢？有没有一键部署方案呢？ =====> `Docker Compose`

# Docker Compose

​		之前的`单个服务`的部署方式：Dockerfile -------> build --------> run ，需要手动操作，构建、运行。但是一个整体的微服务项目包含很多个微服务模块，同时每个模块之间还有依赖关系，这又该怎么解决呢？`不可能一个个部署`！ ========> `Docker Compose 高效的管理容器，定义运行多个容器`。

1）使用 `Yaml` 作为配置文件，定义、运行多个容器的工具。

2）所有的环境（开发、测试等）都可以使用 Compose。

3）使用三步骤：Dockerfile(保证程序在任何位置能够运行)、docker-compose.yml 配置服务(容器)、docker-compose up 命令启动。

总结：`批量容器编排`。

> 注意：Docker Compose 是 Docker 官方开源的项目，需要单独进行安装。

## 安装 Compose

1、下载 Compose，等待下载完毕：

```shell
# 官网下载地址 github
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
# 镜像下载地址：建议使用
curl -L https://get.daocloud.io/docker/compose/releases/download/1.29.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
```

2、文件授权，未授权时文件夹为白色，授权后变为绿色：

```shell
# 实际上就是一个二进制文件，由于放在 bin 目录，全局可以使用
sudo chmod 777 /usr/local/bin/docker-compose
# 或者：chmod +x /usr/local/bin/docker-compose
```

3、安装检查：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ bin]# docker-compose version
docker-compose version 1.29.2, build 5becea4c
docker-py version: 5.0.0
CPython version: 3.7.10
OpenSSL version: OpenSSL 1.1.0l  10 Sep 2019
```

## 快速开始

​		官方应用体验：python 的计数器应用，使用 redis 记录。

1、`/home`下创建存放文件夹：

```shell
mkdir composetest
cd composetest
```

2、编写一个 python 脚本文件：`app.py`

```py
import time

import redis
from flask import Flask

app = Flask(__name__)
cache = redis.Redis(host='redis', port=6379)

def get_hit_count():
    retries = 5
    while True:
        try:
            return cache.incr('hits')
        except redis.exceptions.ConnectionError as exc:
            if retries == 0:
                raise exc
            retries -= 1
            time.sleep(0.5)

@app.route('/')
def hello():
    count = get_hit_count()
    return 'Hello World! I have been seen {} times.\n'.format(count)
```

3、创建一个依赖包文件：`requirements.txt`

```txt
flask
redis
```

4、创建 Dockerfile 脚本文件：`Dockerfile`

```shell
# syntax=docker/dockerfile:1
# 设置基本环境包
FROM python:3.7-alpine
WORKDIR /code
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
RUN apk add --no-cache gcc musl-dev linux-headers
COPY requirements.txt requirements.txt
# 安装依赖包
RUN pip install -r requirements.txt
# 暴露端口
EXPOSE 5000
# 拷贝当前目录
COPY . .
# 执行命令： flask run
CMD ["flask", "run"]
```

5、编写 `docker-compose.yaml` 配置文件

```yaml
version: "3.9"
# 包含服务：web 和 redis
services:
  web:
  	# 通过 dockerfile 文件构建镜像方式
    build: .
    ports:
      - "5000:5000"
  redis:
    # 通过官方镜像
    image: "redis:alpine"
```

6、当前文件夹下执行 `docker-compose up`启动。

```shell
docker-compose up
# 后台运行
docker-compose up -d 
```

![img](https://kuangstudy.oss-cn-beijing.aliyuncs.com/bbs/2021/06/17/kuangstudy4aef27a5-1b11-4e7a-baeb-67e5ed689af4.png)

7、检查运行测试效果：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# curl localhost:5000
Hello World! I have been seen 1 times.
```

7、当前文件夹下执行 `docker-compose dowm` 或 `docker-compose stop` 停止所有服务。

```shell
docker-compose down
docker-compose stop
```

## 执行流程

1、创建网络：composetest_default（默认创建的）

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker network ls
NETWORK ID     NAME                  DRIVER    SCOPE
288ccd8ca3a1   bridge                bridge    local
35e6cb23a378   composetest_default   bridge    local
23b1f23a2f96   host                  host      local
8e93e74e8004   none                  null      local
```

此时查看该网络内部细节发现：web 和 redis 两个容器已经添加到了该网络内，因此可以实现`通过域名访问`。（`项目部署的关键`）

> 当未来部署多个微服务时，项目内部的依赖关系需要通过`服务名（域名）`进行访问，以避免在重启容器时，某些容器 IP 发生变化，导致系统不可用。而此处的创建默认网络，`实现容器之间互联`，则保证了`通过域名访问到具体的服务（容器）`。（Docker 网络原理）
>
> 例如，10 个实例都需要连接 mysql:3306 容器，这个时候就应该写成 mysql 作为连接，而`不是具体的 IP `。

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker network inspect composetest_default
[
    {
        "Name": "composetest_default",
        "Id": "35e6cb23a37864bf4dbe2fb0116359bba7f7622ca16f34dc8496c9ab2e997002",
        "Created": "2022-06-07T16:00:09.792363205+08:00",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": null,
            "Config": [
                {
                    "Subnet": "172.18.0.0/16",
                    "Gateway": "172.18.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": true,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "1ba4b5a536e4fb8a85db06a76be18548afd7ce97052a4897274272119f4628da": {
                "Name": "composetest_redis_1",
                "EndpointID": "ea8d7f077431723b98a75b0cd6b9632118190fb8e1df31e73a63166667277822",
                "MacAddress": "02:42:ac:12:00:02",
                "IPv4Address": "172.18.0.2/16",
                "IPv6Address": ""
            },
            "7087704e057a8e56ee41de9026d6f3d25ffe619d9cd5f776de3e150249cb5999": {
                "Name": "composetest_web_1",
                "EndpointID": "64a4f9398c244361312498f11dac1de41afc71916b2dd474a42d3441f264d26c",
                "MacAddress": "02:42:ac:12:00:03",
                "IPv4Address": "172.18.0.3/16",
                "IPv6Address": ""
            }
        },
        "Options": {},
        "Labels": {
            "com.docker.compose.network": "default",
            "com.docker.compose.project": "composetest",
            "com.docker.compose.version": "1.29.2"
        }
    }
]

```

2、执行 docker-compose.yml 文件：对容器进行编排。

3）启动所有的服务。

```shell
Creating composetest_web_1 ...
Creating composetest_redis_1 ...
Creating composetest_web_1 ... done
Creating composetest_redis_1 ... done
```

启动后检查 images 发现出现 dockerfile 里面定义的镜像，同时

> 那么这个容器名（`composetest_web_1、composetest_redis_1`）怎么来的呢？

文件夹名：composetest

services 名称：web、redis

名称最后的数字 1 是`集群`的副本数量，现实项目中不可能只有一个实例，往往都是弹性的，以求达到高可用。

## Yaml 规则

​	Yaml 配置文件是 Docker Compose 的核心。主要可以分为三层：`版本`、`服务`、`其他配置`。

```shell
version: "3.9" 		# 版本
services：	# 服务
  web：
   # 服务配置
   images：
   bulid：
   ports:
   network：
   depends_on:
   ...
  redis:
   ...
  mysql：
   ...
# 其他配置：网络配置、数据卷配置、全局规则等
networks:
  frontend:
  backend:
volumes:
  db-data:
configs：
```

参考文档：`https://docs.docker.com/compose/compose-file/compose-file-v3/`。

## WP博客测试

以 WordPress 博客开源项目（`https://docs.docker.com/samples/wordpress/`）为例，实战部署测试。

1、创建一个项目文件夹：`/home/my_wordpress`

2、创建 docker-compose.yaml 文件。

```shell
# 版本
version: "3.9"
# 服务  
services:
  # 服务 db
  db:
    # 使用镜像 mysql:5.7
    image: mysql:5.7
    # 挂载数据卷，db_data 具体位置在下面其他配置处定义
    volumes:
      - db_data:/var/lib/mysql
    # 总是开机重启
    restart: always
    # 环境配置
    environment:
      MYSQL_ROOT_PASSWORD: somewordpress
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
  
  # 服务 wordpress
  wordpress:
    # 依赖于 db 服务，即指定 db 服务先启动
    depends_on:
      - db
    # 使用镜像 wordpress:latest
    image: wordpress:latest
    # 挂载数据卷，wordpress_data
    volumes:
      - wordpress_data:/var/www/html
    # 端口映射到 8000
    ports:
      - "8000:80"
    restart: always
    # 环境配置
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_NAME: wordpress
      
# 其他设置
# 数据卷指定，此处不做持久化，只是单纯测试，因此不指定
volumes:
  db_data: {}
  wordpress_data: {}
```

> **备注**：
>
> - docker 卷`db_data`并`wordpress_data`持久化 WordPress 对数据库的更新，以及已安装的主题和插件。
> - WordPress Multisite 仅适用于端口`80`和`443`。

3、构建项目

```shell
docker-compose up [-d]
```

配置登陆信息后即可进入后台首页：

![](https://pic1.imgdb.cn/item/63369ddd16f2c2beb16ca191.png)

## 实战测试

1、创建一个 Springboot 项目，导入  web 和 redis 依赖，同时创建测试使用的 controller：

```java
@RestController
public class HelloController {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @GetMapping("/hello")
    public String hello(){
        Long views = redisTemplate.opsForValue().increment("views");
        return "Hello, World and Docker-Compose" + views;
    }

}
```

2、修改配置文件：

```properties
server.port=8000
spring.redis.host=redis
```

3、编写 Dockerfile 脚本文件：

```shell
FROM java:8

COPY *.jar /app.jar
# 此处指定的优先级高于配置文件内部
CMD ["--server.port=8080"]

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app.jar"]
```

4、编写 docker-compose.yml 文件：

```shell
version: '3.8'
services:
  composedemo:
    build: .
    image: composedemo
    depends_on:
      - redis
    ports:
    - "10001:8080"
  redis:
    image: "redis:alpine"
```

5、上传 jar 包、Dockerfile 文件、docker-compose.yml 文件到服务器指定目录：`/home/mycomposedemo`。

6、通过 docker-compose 启动项目：

```shell
docker-compose up [-d]
# 当项目需要重新部署打包重构镜像时：
docker-compose up [-d] --build
```

7、访问测试：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# curl localhost:10001/hello
Hello, World and Docker-Compose1
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# curl localhost:10001/hello
Hello, World and Docker-Compose2
# 远程浏览器用外网访问同样可行（10001 端口已开启）
```

# Docker Swarm

> ​		首先准备`四台`服务器，并且提前`安装 Docker 环境以及 Docker-Compose 环境`。`双主双从`集群（实际中最少三主）
>
> |    服务器IP    |  服务器密码  |  备注   |
> | :------------: | :----------: | :-----: |
> |  8.142.92.222  | Lifunian7980 | leader  |
> | 39.103.191.179 | Lifunian7980 | manager |
> |  120.55.57.73  | Lifunian7980 | worker  |
> | 180.76.226.31  | lishuang142! | worker  |

Swarm 官方文档地址：`https://docs.docker.com/engine/swarm/`。Docker Engine 1.12 引入了 swarm 模式，使您能够创建由一个或多个 Docker 引擎组成的集群，称为 swarm。swarm 由一个或多个节点组成：在 swarm 模式下运行 Docker Engine 1.12 或更高版本的物理或虚拟机。

有两种类型的节点：`manager (管理节点)和 workers (工作节点)`。

![img](https://kuangstudy.oss-cn-beijing.aliyuncs.com/bbs/2021/06/19/kuangstudyf9fae70c-4de3-45d3-8a3a-de3434f85d38.png)

根据上图可知：管理节点之间可以通信，工作都在管理节点上，使用 `Raft 一致性算法`。

## 搭建集群

查看 swarm 帮助信息：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker swarm --help
Usage:  docker swarm COMMAND
Manage Swarm
Commands:
  ca          Display and rotate the root CA
  init        Initialize a swarm
  join        Join a swarm as a node and/or manager
  join-token  Manage join tokens
  leave       Leave the swarm
  unlock      Unlock swarm
  unlock-key  Manage the unlock key
  update      Update the swarm
Run 'docker swarm COMMAND --help' for more information on a command.
```

1、将主机服务器 docker 初始化进入 swarm：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker swarm init --advertise-addr 8.142.92.222
Swarm initialized: current node (5vefz3g851f7b6i17nbjo2reb) is now a manager.

To add a worker to this swarm, run the following command:

    docker swarm join --token SWMTKN-1-1txhank8lmnwb4ocsv87gde0l537b958bkaasdgscrzu1w5hqf-987kduzk8e8ndu8e0b2f54lpc 8.142.92.222:2377

To add a manager to this swarm, run 'docker swarm join-token manager' and follow the instructions.
```

由于使用的四台服务器不在一个私网的网段，因此需要`使用 公网 IP 地址`。

得到两个新的命令：（`添加节点`）

```shell
# 将工作节点加入到这个 swarm
docker swarm join --token SWMTKN-1-1txhank8lmnwb4ocsv87gde0l537b958bkaasdgscrzu1w5hqf-987kduzk8e8ndu8e0b2f54lpc 8.142.92.222:2377
# 添加管理节点到这个 swarm
docker swarm join-token manager
```

2、将从机2 作为`工作节点`加入到 swarm

```shell
[root@iZbp18eahm3m5ku28w2qyeZ ~]# docker swarm join --token SWMTKN-1-26qfjclcsbfe8vi5jnawnzda4tklrxkl5cidk5bb9dfbb8rzvf-2ove01vlyytwbhh9u0vux5xgl 8.142.92.222:2377
This node joined a swarm as a worker.
```

3、将 从机1 作为`主节点`加入到这个 swarm：

```shell
# 8.142 主机获取主节点 token
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker swarm join-token manager
To add a manager to this swarm, run the following command:

    docker swarm join --token SWMTKN-1-1txhank8lmnwb4ocsv87gde0l537b958bkaasdgscrzu1w5hqf-41cw4wb6de0l8ba2oessfai0j 8.142.92.222:2377
```

```shell
# 从机1 执行此语句加入集群变成主节点
 docker swarm join --token SWMTKN-1-26qfjclcsbfe8vi5jnawnzda4tklrxkl5cidk5bb9dfbb8rzvf-0qhzksjitnp8jnav170prnv9u 8.142.92.222:2377
```

4、将从机 4 作为 `工作节点`加入到 swarm

```shell
docker swarm join --token SWMTKN-1-26qfjclcsbfe8vi5jnawnzda4tklrxkl5cidk5bb9dfbb8rzvf-2ove01vlyytwbhh9u0vux5xgl 8.142.92.222:2377
```

5、由于服务器限制，暂时无法解决不同网段的`网络联通`问题

​		目前出现的问题：`加入管理节点时报错，加入工作节点时没问题`。（防火墙、安全组已检查，端口已开放）

因此，此处暂时使用`一主两从`的集群方式来做测试：

```shell
# 检查集群节点状态：一主两从，状态 Ready
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker node ls
ID                            HOSTNAME                  STATUS    AVAILABILITY   MANAGER STATUS   ENGINE VERSION
icmrv81c3nswe0vozo60bfqq8 *   iZ8vb0l7sqdpurpvy5e77xZ   Ready     Active         Leader           20.10.14
6s0w9xkom9vsdn61m8isgy46e     iZ8vb45xejetxupwfn3mj8Z   Ready     Active                          20.10.17
5ei1b070trmw23rkrmbqqvkgz     iZbp18eahm3m5ku28w2qyeZ   Ready     Active                          20.10.17
```

## Raft 一致性协议

​		目前集群是`双主双从`模式，那么假设一个节点宕机，另外节点是否可用？

`Raft 协议`：保证大多数节点存活才可以用，集群至少三台，则三台的话宕机一台即不可用。

测试：

1）假设一个管理节点宕机，发现另一台主节点不可用 ====> 整个集群不可用

```shell
docker node ls
```

2）如果将从 docker节点 离开集群，集群信息会看到此节点 down 的状态。

```shell
# 离开集群操作
docker swarm leave
```

3）再将工作节点转变成主节点加入集群 ===> 三主一从后，再停掉一台管理节点，集群仍能够使用。

`因此`：为了达到集群可用，若三个管理节点，必须 > 1台存活的管理节点才可以正常使用。

## 弹性集群

以前是通过 `docker run` 或是 `docker-compose up` 来启动容器，但是这都是`单机版`的。

现在使用 swarm 集群，就都变成了服务：`docker service`，模式变成了：容器 ====> 服务（redis 服务） =====> 副本（redis 的10个副本）

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker service

Usage:  docker service COMMAND

Manage services

Commands:
  create      Create a new service
  inspect     Display detailed information on one or more services
  logs        Fetch the logs of a service or task
  ls          List services
  ps          List the tasks of one or more services
  rm          Remove one or more services
  rollback    Revert changes to a service's configuration
  scale       Scale one or multiple replicated services
  update      Update a service

Run 'docker service COMMAND --help' for more information on a command.
```

包含功能：创建服务、动态扩展服务、动态更新发布 等。

目前比较火的`灰度发布(金丝雀发布)`便可以使用 docker 的 swarm 实现。

```shell
# 启动对比
docker run 		# 容器启动，不具备扩缩容器功能
docker service	# 具有扩缩容器功能，滚动更新
```

测试实现`动态扩缩容`：（注意下面的命令`在 swarm 集群中才可以使用`）

1）启动一个 nginx `服务`，检查状态。

```shell
# 启动 nginx 服务，端口 8888
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker service create -p 10001:80 --name my-nginx nginx
c2f1nm3t5sh6e2ue9xiysr37k
overall progress: 1 out of 1 tasks 
1/1: running   [==================================================>] 
verify: Service converged

# 检查启动的所有服务
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker service ls
ID             NAME       MODE         REPLICAS   IMAGE          PORTS
c2f1nm3t5sh6   my-nginx   replicated   1/1        nginx:latest   *:10001->80/tcp
# 发现该服务只有一个副本 1/1

# 检查 my-nginx 服务状态
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker service ps my-nginx
ID             NAME         IMAGE          NODE                      DESIRED STATE   CURRENT STATE            ERROR     PORTS
rbjcbq7ri9qw   my-nginx.1   nginx:latest   iZ8vb45xejetxupwfn3mj8Z   Running         Running 10 minutes ago

# 查看具体信息
docker service inspect my-nginx

# 寻找该副本具体位于哪个服务器的 docker 内，发现位于服务器2-工作节点？	=====> 随机分配

# 突然增加访问量时，一个 nginx 不够用了，怎么办呢？
# 更新服务，创建新的副本
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker service update --replicas 3 my-nginx
my-nginx
overall progress: 3 out of 3 tasks 
1/3: running   [==================================================>] 
2/3: running   [==================================================>] 
3/3: running   [==================================================>] 
verify: Service converged
# 再次检查服务副本数，发现变成了 3，同时也是随机分配在了各个服务器上（本地测试是每个服务器上一个）
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker service ls
ID             NAME       MODE         REPLICAS   IMAGE          PORTS
c2f1nm3t5sh6   my-nginx   replicated   3/3        nginx:latest   *:10001->80/tcp

# 此时在远程通过IP:PORT 访问 nginx 进行测试：发现每个 IP 都可以直接访问到 nginx 的欢迎页面(注意开启安全组 10001 端口) =======> 集群是一个整体
```

根据上面情况测试：那么是不是可以直接扩展 10 个 nginx 副本呢？=====> `当然可以`。

那么如何减少副本数量呢？

```shell
docker service update --replicas 1 my-nginx
```

同时还可以通过 scale 来进行动态扩缩容：

```shell
# 扩容
docker service scale my-nginx=10
# 缩容
docker service scale my-nginx=1
```

删除服务：

```shell
docker service rm 服务名/ID
```

## Swarm 概念

​		Swarm：集群的管理和编排，利用 docker 可以初始化 swarm 集群，其他节点通过命令加入。（管理节点、工作节点）

![img](https://kuangstudy.oss-cn-beijing.aliyuncs.com/bbs/2021/06/19/kuangstudy482fb06d-6be2-4ac5-8304-f9b1ed90f84f.png)

1）`Node`：就是一个 docker 节点，多个节点组成一个网络集群。

2）`Service`：任务，可以在管理节点或者工作节点来运行，是 swarm 的核心，用户访问的就是 Service 。

3）`Task`：可以理解为一个个的副本，每个副本里面就跑着具体的容器。

![img](https://kuangstudy.oss-cn-beijing.aliyuncs.com/bbs/2021/06/19/kuangstudy9954898a-3e89-4e12-b87c-0e4e67dbff20.png)

> Swarm 运行机制和原理：命令 ----> 管理节点 ------> api --------> 调度 -----> 工作节点（创建 Task 容器维护创建）
>
> ​		scheduler 调度器根据内部的算法和压力来对具体的副本进行分配（管理节点）

![img](https://kuangstudy.oss-cn-beijing.aliyuncs.com/bbs/2021/06/19/kuangstudy8a76dba3-b2ad-4b57-9e87-87b76329885f.png)

# 其他功能

## Docker Stack

​		docker-compose ：单机部署项目。而在集群中部署项目就需要使用 `Docker Stack`。

```shell
# 单机启动 wordpress
docker-compose up -d wordpress.yaml

# 集群启动 wordpress，更像 k8s 的方式
docker stack deploy wordpress.yaml

# 示例配置文件：
version: "3.9"
services:
  service1:
    image: "registry.cn-guangzhou.aliyuncs.com/lengcz_pub/test1:1.0"
    deploy:
      replicas: 2
    ports:
      - "8080:8080"

  service2:
    image: "registry.cn-guangzhou.aliyuncs.com/lengcz_pub/test2:1.0"
    deploy:
      replicas: 4
    ports:
      - "8081:8081"
```

## Docker  Secret

​		`Docker Secret`：安全配置，密码加密，证书设置。

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker secret --help
Usage:  docker secret COMMAND
Manage Docker secrets
Commands:
  create      Create a secret from a file or STDIN as content
  inspect     Display detailed information on one or more secrets
  ls          List secrets
  rm          Remove one or more secrets

Run 'docker secret COMMAND --help' for more information on a command.
```

## Docker Config

​		`Docker Config`：Docke 统一配置。

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ ~]# docker config --help

Usage:  docker config COMMAND

Manage Docker configs

Commands:
  create      Create a config from a file or STDIN
  inspect     Display detailed information on one or more configs
  ls          List configs
  rm          Remove one or more configs

Run 'docker config COMMAND --help' for more information on a command.
```





