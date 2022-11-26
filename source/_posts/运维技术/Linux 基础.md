---
title: Linux 的基本命令
date: 2022-05-21 00:00:00
type: linux
comments:
sticky: 9
tags: 
  - linux 
categories:
  - 运维技术
description: 
keywords: Linux 
swiper_index: 1
copyright_info: 此文章版权归 moon 所有，如有转载，请註明来自原作者
cover: https://w.wallhaven.cc/full/k7/wallhaven-k7mww1.jpg
top_img: https://w.wallhaven.cc/full/k7/wallhaven-k7mww1.jpg
---

# linux 简介

​		基于 `centos 7` 实现，`linux 一切皆文件`。Linux 能运行主要的 UNIX 工具软件、应用程序和网络协议。它支持 32 位和 64 位硬件。Linux 继承了Unix 以网络为核心的设计思想，是一个`性能稳定`的多用户网络操作系统。

​		Linux 的发行版说简单点就是将 Linux 内核与应用软件做一个打包。

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020122020104278.png)

​		今天各种场合都有使用各种 Linux 发行版，从嵌入式设备到超级计算机，并且在服务器领域确定了地位，通常`服务器使用 LAMP（Linux + Apache + MySQL + PHP）`或 `LNMP（Linux + Nginx+ MySQL +PHP）`组合。

windows 和 linux 对比：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201220202154232.png)

​		服务器上 linux 基本都是使用命令行。

# Linux 基本操作

## 开机关机

> 开机操作和介绍

​		开机会启动许多程序。它们在 Windows 叫做”服务”（service），在 Linux 就叫做`“ 守护进程 ”（daemon）`。

用户登录方式：

1）命令行登录

2）`ssh 登录`：XShell、Putty 等远程登陆方式。（企业里面一般使用这种方式）

3）图形界面登录

最高权限用户为 `root`，可以操作一切。

> 关机操作和介绍（`linux 系统一般不会关机`）

关机核心指令：`shutdown`

基于关机，有很多种关机的操作，但是一般都会运行 `sync` 命令，将内存中的数据写到磁盘中。具体关机相关操作有：

```shell
sync # 将数据由内存同步到硬盘中。

shutdown # 关机指令，你可以man shutdown 来看一下帮助文档。例如你可以运行如下命令关机：

shutdown –h 10 # 这个命令告诉大家，计算机将在10分钟后关机
shutdown –h now # 立马关机
shutdown –h 20:25 # 系统会在今天20:25关机
shutdown –h +10 # 十分钟后关机

shutdown –r now # 系统立马重启
shutdown –r +10 # 系统十分钟后重启
reboot # 就是重启，等同于 shutdown –r now
halt # 关闭系统，等同于shutdown –h now 和 poweroff
```



查看当前 centos 系统版本：

```shell
cat /etc/centos-release
```

## 系统目录结构

​		linux 有一个准则：`一切皆文件`，`/` 表示根目录，所有的文件都挂在在这个节点上。

1、使用 `ls /` 显示根目录下所有的文件：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210115214433897.png)

2、目录结构：树状目录结构

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210115214450337.png)

1）`/bin` 目录是 Binary 的缩写, 这个目录存放着最经常使用的命令。（`存放命令`）

2）`/boot` 目录存放启动 Linux 时使用的一些核心文件，包括一些连接文件以及镜像文件。（`启动、连接、镜像文件`）

3）`/dev` 目录是 Device(设备) 的缩写, 存放的是 Linux 的外部设备，在 Linux 中访问设备的方式和访问文件的方式是相同的。（`外部设备`，例如 U盘）

4）`/etc` 目录存放所有的系统管理所需要的`配置文件和子目录`。（`配置文件`）

5）`/home`目录是`用户的主目录`，在Linux中，每个用户都有一个自己的目录，一般该目录名是以用户的账号命名的。

6）`/lib` 目录存放着系统最基本的`动态连接共享库`，其作用类似于Windows里的DLL文件。（系统文件）

7）/lost+found： 这个目录一般情况下是空的，当系统非法关机后，这里就存放了一些文件。（存放突然关机的一些文件）

8）`/media`：linux系统会自动识别一些设备，例如U盘、光驱等等，当识别后，linux会把识别的设备挂载到这个目录下。

9）`/mnt`：系统提供该目录是为了让用户临时挂载别的文件系统的，我们可以将光驱挂载在/mnt/上，然后进入该目录就可以查看光驱里的内容了。

10）`/opt`：这是给主机额外安装软件所摆放的目录。比如你安装一个ORACLE数据库则就可以放到这个目录下。（`用户安装文件软件`）

11）/proc： 这个目录是一个虚拟的目录，它是系统内存的映射，我们可以通过直接访问这个目录来获取系统信息。（不用管）

12）`/root`：该目录为系统管理员，也称作超级权限者的用户主目录。

13）`/usr`：用户的很多应用程序和文件都放在这个目录下，类似于 windows 下的 program files 目录。

- /usr/bin：系统用户使用的应用程序。
- /usr/sbin：超级用户使用的比较高级的管理程序和系统守护程序。Super
- /usr/src： 内核源代码默认的放置目录。

14）`/sbin`：s 就是 Super User 的意思，这里存放的是系统管理员使用的系统管理程序。

15）`/srv`：该目录存放一些服务启动之后需要提取的数据。

16）`/sys`：这是 linux2.6 内核的一个很大的变化。该目录下安装了2.6内核中新出现的一个文件系统 sysfs 。

17）`/tmp`：这个目录是用来存放一些临时文件的。用完即丢的文件，可以放在这个目录下，安装包。（`临时文件`）

18）`/var`：这个目录中存放着在不断扩充着的东西，我们习惯将那些经常被修改的目录放在这个目录下。包括各种`日志`文件。

19）/run：是一个临时文件系统，存储系统启动以来的信息。当系统重启时，这个目录下的文件应该被删掉或清除。

20）/www：存放服务器网站相关的资源，环境，网站的项目。

## 目录文件管理

1、目录的切换：

```shell
cd xxx # 切换目录
./ 		 # 当前目录
cd ..    # 返回上一级目录
```

> 显示当前位置：`pwd` 命令。

2、目录内容列出：

```shell
ls		# 列出所有文件，不包括隐藏文件
ls -a	# 列出所有文件，包括隐藏文件
ls -l	# 列出所有文件，包含文件的属性和权限，不包括隐藏文件
ls -al	# 组合使用
```

3、创建和删除`目录`：

```shell
mkdir xxx	# 创建目录
mkdir -p test2/test3/test4	# 创建多级目录

rmdir xxx	# 删除目录，该目录不能为空，否则不能删除
rmdir -p test2/test3/test4	# 强制递归删除目录，不为空也能删
```

4、复制`文件或目录`，如果文件重复就会给出提示选择覆盖还是放弃：（可以重命名）

```shell
cp oldPosition newPosition

# 举例：
cp install.sh test	# 拷贝文件到 test 目录
```

5、移除`文件或目录`：

```shell
rm -f	# 忽略不存在的文件，不会出现警告，强制删除
rm -r	# 递归删除目录
rm -i	# 删除时会询问是否删除

# 举例：
rm -rf / 	# 强制删除系统中所有的文件，“删库跑路”
```

6、移动文件或目录，同时还可以`重命名`：

```shell
mv -f	# 强制移动文件
mv -u	# 只替换已经更新过的文件（用的少）

# 举例：
mv test1 test2	# 重命名文件夹为 test2
mv install.sh kuangstudy/	# 移动文件
```

7、创建文件：

```shell
touch f1.txt	# 创建文件
vim	f2.txt	# 创建文件
```

8、文件输入

```shell
vim f2.txt	# 直接编辑整个文件
echo 输入内容 >> 文件		# 向某个文件输入内容
```

测试：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ test]# echo "i heat you" >> f1.txt
```

## `目录文件属性`

​		Linux 系统是一种典型的多用户系统，不同的用户处于不同的地位，拥有不同的权限。为了保护系统的安全性，`Linux 系统对不同的用户访问同一文件（包括目录文件）的权限做了不同的规定`。

查看文件信息：`ll` 或 `ls -l` 命令查看。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210115223156210.png)

根据上图，某文件为文件属性为：`lrwxrwxrwx`，则如何分析呢？

1）第一个字母 l 代表，表示一个链接文档，此处只是一个链接，连接带 /usr/bin 目录（相当于此处只是一个快捷方式）

> 第一个字母可能会出现的选项：`l、d、-、b、c`
>
> `l`：表示一个链接文档 link file。
>
> `d`：表示是一个`目录`。
>
> `-`：表示是一个`文件`。
>
> 此外还有 b 和 c 表示外部设备链接。

2）后面的字母是三个为一组，且内容均是【`rwx`】，表示`读、写、可执行`，当没有该权限时，就会出现`-`标记。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210115223324226.png)

属主权限：该文件或目录的所有者。

属组权限：该文件或目录的所有者所属的组。

其他用户权限：非所有者同组的用户。

1、修改文件属组：

```shell
chgrp [-R] 属组名 文件名
```

> `-R`：递归更改文件属组，就是在更改某个目录文件的属组时，如果加上 -R 的参数，那么该目录下的所有文件的属组都会更改。（`要改就会加`）

2、更改文件属主，同时可以更改文件属组：（`chown`使用较多）

```shell
chown [–R] 属主名 文件名
chown [-R] 属主名：属组名 文件名
```

3、更改文件9个属性：（`chmod` 使用很多）

> 工作中可能会出现`报错`：你没有权限操作此文件！这个时候就需要更改文件的属性。

```shell
chmod [-R] xyz 文件或目录
# -R 表示递归修改，没有 -R 则只是修改这一个文件夹，文件夹内部的文件并未修改！
```

有两种修改的方式：数字 和 符号 修改方式。

1）数字方式：由于文件权限字符为【rwx rwx rwx】三个为一组，使用数字来代表每一个“三位”的权限，其中 r：4，w：2，x：1（`常用数字方式修改`）

​		举例：

```shell
chmod  777 filename  # 文件赋予所有用户可读可执行（最常用）
# 777 = 4+2+1，4+2+1，4+2+1

chmod  770 filename  # 文件赋予属主和属组可读可执行，其他用户无权操作
# 770 = 4+2+1，4+2+1，0+0+0
```

2）符号方式：一般不使用

测试：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ test]# chmod 777 test
[root@iZ8vb0l7sqdpurpvy5e77xZ test]# ll
total 0
drwxrwxrwx 2 root root 6 Jun  2 09:58 test
[root@iZ8vb0l7sqdpurpvy5e77xZ test]# chmod 770 test
[root@iZ8vb0l7sqdpurpvy5e77xZ test]# ll
total 0
drwxrwx--- 2 root root 6 Jun  2 09:58 test
```

## 文件内容

1、`cat` ：由第一行开始显示文件内容，用来读文章，或者读取配置文件。

2、`tac` ：从最后一行开始显示，可以看出 tac 是 cat 的倒着写。

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ test]# cat test1.txt 
剑来
天不生我伏生
万古如长夜
[root@iZ8vb0l7sqdpurpvy5e77xZ test]# tac test1.txt 
万古如长夜
天不生我伏生
剑来
```

3、`nl`：输出内容是带行号，用于看代码。

4、`more`：一页一页的显示文件内容，带余下内容的（空格代表翻页，enter 代表向下看一行， :f 行号）

5、`less`：less 与 more 类似，但是比 more 更好的是，他可以往前翻页。

​		操作：

​	1）空格下翻页，pageDown，pageUp键代表翻动页面。

​	2）退出 q 命令。

​	3）查找字符串： `/`要查询的字符向下查询，向上查询使用`？`，n 继续向下搜寻下一个，N 上寻找。

6、`head`：只看头几行 通过 -n 参数来控制显示几行。

7、`tail`：只看尾巴几行 -n 参数 要查看几行。

> man [命令名] 来查看命令的使用方式。

总结：实际开发中使用 `vim`、`vi`、`cat` 即可。搜寻使用 `/` 即可。

> 网络配置文件位置：`cd /etc/sysconfig/network-scripts`（centos7）
>
> `ifconfig` 命令查看网络配置。

## 链接概念

Linux 的链接分为两种：硬链接、软链接。

`硬链接`：A——B，假设 B 是 A 的硬链接，那么他们两个`指向了同一个文件`！允许一个文件拥有多个路径，用户可以通过这种机制建立硬链接到一些重要文件上，防止误删。（`备份`）

`软链接`：类似 Window 下的`快捷方式`，删除源文件，快捷方式也访问不了。（软连接也叫符号链接）

创建链接：`ln [-s] source to `

```shell
touch f1.txt		 # 创建文件 f1
ln f1.txt f2.txt	 # 创建硬链接
ln -s f1.txt f3.txt	 # 创建软链接
```

测试：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ test]# echo "i heat you" >> f1.txt
[root@iZ8vb0l7sqdpurpvy5e77xZ test]# cat f1.txt 
i heat you
[root@iZ8vb0l7sqdpurpvy5e77xZ test]# cat f2.txt 
i heat you
[root@iZ8vb0l7sqdpurpvy5e77xZ test]# cat f3.txt 
i heat you
```

发现：源文件改变，链接文件内容都变化。

## Vim 编辑器

​		vim 是 vi 的升级版的文本编辑器，用来`查看内容，编辑内容，保存内容`。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210116092222874.png)

基本上 vim 共分为三种模式，分别是命令模式、输入模式、底线命令模式。

1）`命令模式`：此时键盘输入是命令，按下 `i` 切换到输入模式，`x` 删除当前光标所在处的字符，`：`切换到底线命令模式（输入模式先使用 ESC）。

2）`输入模式`：此时可以输入文本内容。使用 `ESC`退出输入模式，切换到命令模式。

3）`底线命令模式`：`：`切换到底线命令模式，`wq` 表示保存并退出，`q!`不保存并退出。

其余操作暂不做了解。

## 账号管理

### 用户管理

​		linux 是一个多用户多任务的分时操作系统。（类似于 MySQL 的用户管理）`root 权限用户才能操作`

1、添加用户

```shell
useradd [-m] [-g] 用户名	# 添加用户
# -m ：自动创建这个用户的主目录 /home/gaozheng
# -g ：给用户分配组！
```

`本质`：Linux中一切皆文件，这里的添加用户说白了就是往某一个文件（`/etc/passwd`）中写入用户的信息了。

2、删除用户

```shell
userdel [-r] gaozheng 	# 删除用户的时候将他的目录页一并删掉
```

3、修改用户

```shell
usermod [选项] [选项设置] 用户名	# 修改用户
usermod -d /home/test gaozheng	# 修改用户对应的文件夹为 test，一般会先把这个文件创建。
```

4、切换用户，默认是 root 用户。

```shell
su 用户名		# 从 root 用户切换到 其他用户
```

> 注意：root 用户的编辑首字符为：#，其他用户为 $。

```shell
sudo su		# 普通用户切换到 root 用户
```

其他操作：

```shell
su-root		# 切换用户时，如果想在切换用户之后使用新用户的工作环境，可以在su和username之间加 - 
exit		# 退出到原来的用户 root
logout		# 退出到原来的用户 root
hostname 新主机名	# 修改主机名，修改完需要重新连接才生效
```

5、修改密码，创建用户时需要修改密码（linux 输入密码不会显示）

1）超级用户修改密码：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ home]# passwd gaozheng
Changing password for user gaozheng.
New password: 
BAD PASSWORD: The password contains the user name in some form
Retype new password: 
passwd: all authentication tokens updated successfully.
```

2）普通用户修改密码：

```shell
[gaozheng@iZ8vb0l7sqdpurpvy5e77xZ home]$ passwd
Changing password for user gaozheng.
Current password: 
New password: 
```

6、锁定账户，由 root 账户操作。

```shell
passwd -l gaozheng 	# 锁定之后这个用户就不能登录了。
passwd -d gaozheng 	# 没有密码，将上次输入的密码清空了，也不能登录。
```

### 用户组管理

​		`属主` 和` 属组` 的概念。

​		每个用户都有一个用户组，系统可以对一个用户组中的所有用户进行集中管理（开发、测试、运维、root）。不同Linux 系统对用户组的规定有所不同，如Linux下的用户属于与它`同名的用户组`，这个`用户组在创建用户时同时创建`。

​		用户组的管理涉及用户组的添加、删除和修改。组的增加、删除和修改实际上就是对 `/etc/group` 文件的更新。

1、创建用户组，系统会默认分配一个自增 1 的 groupId，也可以手动设置。

```shell
groupadd [-g groupId] 用户组名 
# -g 代表指定 groupId
```

2、删除用户组。

```shell
groupdel 用户组名
```

3、修改用户组的权限信息和名称

```shell
groupmod -g groupId -n 用户组新名称 待修改的用户组名称
# -g 代表指定 groupId，-n 代表指定用户组名称
```

4、切换用户的用户组名称

```shell
# 1、登录要修改的用户
# 2、修改用户组到 root 用户组
newgrp root
```

> 总结用户信息存放位置：
>
> 在 `/etc/passwd` 配置文件中，每一行都代表这一个用户，我们可以从这里看出这个用户的主目录在哪里，可以看到属于哪一个组！
>
> ```shell
> 用户名:口令(登录密码，我们不可见):用户标识号:组标识号:注释性描述:主目录:登录Shell
> ```
>
> 登录口令：把真正的`加密`后的用户口令字存放到`/etc/shadow`文件中，保证我们密码的安全性！
>
> 用户组的所有信息都存放在 `/etc/group` 文件中。

## 磁盘管理

1、磁盘信息查看：

```shell
df		# 列出文件系统整体的磁盘使用量
df -h	# 检查磁盘空间使用量
```

测试：

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ /]# df
Filesystem     1K-blocks     Used Available Use% Mounted on
devtmpfs         3982948        0   3982948   0% /dev
tmpfs            3998616        0   3998616   0% /dev/shm
tmpfs            3998616      596   3998020   1% /run
tmpfs            3998616        0   3998616   0% /sys/fs/cgroup
/dev/vda1       41931756 30255072  11676684  73% /
tmpfs             799720        0    799720   0% /run/user/0
# 这个单位是 字节
[root@iZ8vb0l7sqdpurpvy5e77xZ /]# df -h
Filesystem      Size  Used Avail Use% Mounted on
devtmpfs        3.8G     0  3.8G   0% /dev
tmpfs           3.9G     0  3.9G   0% /dev/shm
tmpfs           3.9G  596K  3.9G   1% /run
tmpfs           3.9G     0  3.9G   0% /sys/fs/cgroup
/dev/vda1        40G   29G   12G  73% /
tmpfs           781M     0  781M   0% /run/user/0
# 这个单位是 M 或 G
```

2、查看具体文件夹的使用情况

```shell
# 需要先进入某个文件夹
du		# 查看内部文件大小，可以看到子文件夹
du -a 	# 显示隐藏的文件

du -sm /*	# 检查根目录下每个文件夹容量情况
# 系统初始化最大的是用户目录 /usr ，因为很多文件和程序都在这里
```

3、挂载和卸载本地磁盘或是文件、U盘等。

1）挂载 mount：外部设备接入默认都在 dev 文件夹下，有时候不挂载可能不能使用。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210116144426865.png)

2）卸载 umount：相当于 U盘弹出。

```shell
umount -f [挂载位置] 	# 强制卸载
```

## `进程管理`

​		每个程序都有一个进程，每个进程都对应了一个 `pid` 号，同时都有一个父进程。

​		进程可以有两种存在方式：前台 和 后台运行，`服务一般后台运行，基本的程序都是前台运行`。

1、查看进程信息：

```shell
ps [-选项]
# -a 显示当前终端运行的进程信息（就是这个 ps -a）
# -A 显示当前终端运行的所有进程信息
# -u 以用户的信息显示进程
# -x 显示后台运行进程的参数。
```

测试：

```shell
ps -aux	# 查看所有的进程信息
```

```shell
ps -aux|grep mysql
# grep 查找前面命令的结果中中符合条件的字符串
```

> `|` 在 linux 中叫做管道符，用来过滤。

2、查看父进程信息：

```shell
ps -ef
```

测试：

```shell
ps -ef|grep mysql 
# 看父进程我们一般可以通过目录树结构来查看，使用进程树命令：
pstree -pu
# -p 显示父进程 id
# -u 显示用户组
```

3、结束进程：相当于 windows 结束任务。（很少会强制结束）

```shell
kill -9 进程pid		# 表示强制结束该进程
```

## `Jar 包运行`

1、直接前台运行：当前 ssh 窗口被锁定，可按 CTRL + C 打断程序运行，或直接关闭窗口，程序会直接退出。

```shell
java -jar xxxx.jar
```

2、后台运行：& 表示后台运行，但是当窗口关闭时，程序也会终止。

```shell
java -jar xxxx.jar &
```

3、后台持续运行：此时输出内容会打印到一个默认的 nohup 文件。

```shell
nohup java -jar xxxx.jar &
```

4、后台运行的同时，保存运行日志信息：

```shell
nohup java -jar xxxx.jar >>temp.log 2>&1 &
```

## 安全设置

​		安全设置主要有几个方面：`阿里云安全组`、`防火墙`、`端口开放`等。

1、阿里云安全组设置开放端口，只有这样外网才能访问到服务器上的某个端口。



2、防火墙设置。

```shell
systemctl status firewalld.service		# 查看防火墙状态
systemctl status firewalld			    # 查看防火墙状态
systemctl start firewalld				# 开启防火墙
systemctl stop firewalld				# 关闭防火墙
systemctl restart firewalld				# 重启防火墙
```

3、端口设置

当防火墙开启时，需要将部署项目的具体某个端口开放，外网才能访问到该端口。

```shell
firewall-cmd --zone=public --add-port=9000/tcp --permanent		# 开启防火墙的 9000 端口
firewall-cmd --list-ports			# 查看所有开启的端口

# --zone 	作用域
# --add-port=80/tcp 	添加端口，格式为：端口/通讯协议
# --permanent 	永久生效，没有此参数重启后失效
```

# 环境安装

​		linux 上安装软件一般有三种方式：`rpm` 安装、`解压缩`安装、`yum` 在线安装。

## 安装 JDK 环境

1、下载 Jdk8 的 rpm 包：`https://www.oracle.com/java/technologies/javase/javase8-archive-downloads.html` 官网下载。

2、将 rpm 包上传到 `/home/username` 目录下（此处的 username 文件夹指用户目录，此目录用于存放该用户的安装包）。

3、检测系统是否存在 Jdk 环境：

```shell
java -version
```

> 如果存在 jdk 环境，就需要卸载原有的不完整的 openJdk：
>
> ```shell
> rpm -qa|grep jdk		# 检测 JDK 版本信息
> rpm -e --nodeps jdk__	# 强制移除 jdk.....
> ```
>
> ![在这里插入图片描述](https://img-blog.csdnimg.cn/20210116144854687.png)

4、安装 jdk 环境：

```shell
rpm -ivh rpm包
```

5、配置环境变量：`/etc/profile`文件就是系统配置文件。

1）在配置文件最后面加上配置：

```shell
# 这里的 JAVA_HOME 路径写本地的安装位置
JAVA_HOME=/usr/java/jdk1.8.0_221-amd64
CLASSPATH=%JAVA_HOME%/lib:%JAVA_HOME%/jre/lib
PATH=$JAVA_HOME/bin:$JAVA_HOME/jre/bin
export PATH CLASSPATH JAVA_HOME
```

2）激活配置文件，使配置生效。

```shell
source /etc/profile
```



## 安装 Tomcat

​		SSM 项目打的是 war 包，war 包运行就需要 Tomcat。（jar 包不需要 Tomcat）

1、官网下载 Tomcat 压缩包：`apache-tomcat-9.0.22.tar.gz`

2、将压缩包上传到 `/home/username` 目录下，直接进行解压：

```shell
tar -zxvf apache-tomcat-9.0.22.tar.gz
```

3、此时该目录下就有一个压缩包，此时进入 /bin 目录启动 Tomcat 测试：

```shell
./startup.sh		# 执行 
./shotdown.sh		# 停止
```

> 注意开启阿里云安全组和防火墙端口：8080（Tomcat 默认端口）。
>



## 安装 MySQL 

> 安装注意：安装 压缩包版本，exe 版本安装后会有注册表，难卸载。
>

mysql 5.7 64位下载地址:

https://dev.mysql.com/get/Downloads/MySQL-5.7/mysql-5.7.19-winx64.zip

电脑是64位的就下载使用64位版本的！

1、下载后得到zip压缩包。

2、解压到自己想要安装到的目录，本人解压到的是 D:\Environment\mysql-5.7.19

3、添加环境变量：
	1）我的电脑->属性->高级->环境变量
	2）选择PATH,在其后面添加: 你的mysql 安装文件下面的bin文件夹
	3）在 D:\Environment\mysql 目录下新建 my.ini 文件
	4）编辑 my.ini 文件，注意替换路径位置

```xml
[mysqld]
basedir=D:\Program Files\mysql-5.7\
datadir=D:\Program Files\mysql-5.7\data\
port=3306
skip-grant-tables
```

5、启动**管理员模式**下的CMD，并将路径切换至 mysql 下的bin目录，然后输入 mysqld –install (安装mysql)

6、再输入 mysqld --initialize-insecure --user=mysql 初始化数据文件
7、然后输入命令`net start mysql`再次启动 mysql 然后用命令 mysql –u root –p 进入mysql管理界面（密码可为空）

8、进入界面后更改root密码

```sql
update mysql.user set authentication_string=password('123456') where user='root' 
and Host = 'localhost';
```

9、刷新权限

```xml
flush privileges;
```

10、修改 my.ini文件删除最后一句 skip-grant-tables

11、重启 mysql 即可正常使用（先使用exit，退出mysql）

```xml
net stop mysql
net start mysql
```

12、连接上测试出现以下结果就安装好了
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200511175311493.png)

`注意：`如果您以前装过,现在需要重装,一定要将环境清理干净 .

```cmd
sc delete mysql
```

mysql可视化工具 : Navicat Premium。

`连接数据库语句 ：`mysql -h 服务器主机地址 -u用户名 -p用户密码
注意 :-u  -p 后面不能加空格,否则会被当做密码的内容，导致登录失败 !

几个基本的数据库操作命令 :

```sql
mysql -uroot -p123456  --连接数据库
update user set password=password('123456')where user='root' and Host = 'localhost';  --修改密码
flush privileges;  --刷新权限
--------------------------------------------------------------------------------
--所有的语句以分号结尾
show databases; --显示所有数据库
use dbname；--切换数据库
show tables; --显示该数据库中所有的表
describe user; --显示表数据库中 user 表的列信息

create database westos; --创建数据库

exit; --退出连接
? 命令关键词 : 寻求帮助
```

## 安装 InfluxDB

`influxdb` 数据库一般是在 linux 系统中进行使用，比如云服务器、虚拟机等 linux 系统场景。(windows 系统也可以使用)

> 以阿里云服务器搭载`centos 7.9` 系统为例进行`influxdb 1.8` 数据库的搭建！使用 wget 工具下载 influxdb 的 rpm 包。

1、进入`/usr/local` 目录（目录可自己选择）

```shell
cd /usr/local
```

2、下载 InfluxDB 依赖包。

​		方式一：云服务器直接使用 wget 工具下载 Influxdb 的 rpm 包。（可能会比较慢）

```shell
wget https://dl.influxdata.com/influxdb/releases/influxdb-1.8.2.x86_64.rpm
```

​		方式二：本地下载好依赖包后，而后借助 `XFTP`或 `Winscp `放入云服务器目录。

```txt
# 本地下载直接使用 http 下载，地址栏输入 
https://dl.influxdata.com/influxdb/releases/influxdb-1.8.2.x86_64.rpm
浏览器直接会下载好安装包（此种方法速度快）。
```

3、使用 yum 命令进行 influxdb 的安装。

```shell
yum localinstall influxdb-1.8.0.x86_64.rpm
```

4、修改influxdb.conf配置文件(`可选`)

​		因为监控的数据量一般会比较大，所以相关数据的目录一般需要调整至空间比较大的目录。安装后默认的配置文件在`/etc/influxdb/influxdb.conf`，进入修改`[meta]下dir`目录、`[meta]下dir`目录、`[meta]下wal-dir`目录。

```shell
[meta]
  dir = "/data/influxdb/meta"
```

```shell
[data]
  dir = "/data/influxdb/data"
  ......
  wal-dir = "/data/influxdb/wal"
```

5、启动服务

```shell
systemctl start influxdb
```

6、检查 InfluxDB服务启动状态。

```shell
# 检查 influxdb启动状态
systemctl status influxdb  # 或 systemctl status influxd
# 检查所有服务启动状态
ps auxw
```

![Influxdb数据库服务状态](https://pic1.imgdb.cn/item/6337c16b16f2c2beb1746c3f.png)



##  安装 Chronograf

Chronograf 安装与 InfluxDB 安装类似，都采用本地下载安装包后，放到云服务器，进行安装。

1、下载 Chronograf(1.8.4 版本) 依赖包，下载版本为 `ReadHat&CentOS`版本。

​		本地下载好依赖包后，而后借助 `XFTP`或 `Winscp `放入云服务器目录(建议放到 /usr/local 目录)。

```txt
# 本地下载直接使用 http 下载，地址栏输入 
https://dl.influxdata.com/chronograf/releases/chronograf-1.8.4.x86_64.rpm
浏览器直接会下载好安装包（此种方法速度快）。
```

2、使用 yum 命令进行 Chronograf 的安装。

```shell
yum localinstall chronograf-1.8.4.x86_64.rpm
```

3、不需要修改 Chronograf  配置文件(`目前配置文件未找到`)。

4、启动服务

```shell
systemctl start Chronograf
```

5、检查 Chronograf 服务启动状态。

```shell
# 检查 influxdb启动状态
systemctl status Chronograf
# 检查所有服务启动状态
ps auxw
```

![chronograf服务状态](https://pic1.imgdb.cn/item/6337c17d16f2c2beb1747ea2.png)



## 安装 Kapitator 

Kapacitor 是一个开源的数据处理框架，可以轻松创建警报、运行ETL作业和检测异常。

1、下载 Kapacitor (1.6.2 版本) 依赖包，下载版本为 `ReadHat&CentOS`版本。

​		本地下载好依赖包后，而后借助 `XFTP`或 `Winscp `放入云服务器目录(建议放到 /usr/local 目录)。

```txt
# 本地下载直接使用 http 下载，地址栏输入 
https://dl.influxdata.com/kapacitor/releases/kapacitor-1.6.2-1.x86_64.rpm
浏览器直接会下载好安装包（此种方法速度快）。
```

2、使用 yum 命令进行 Kapacitor 的安装。

```shell
yum localinstall kapacitor-1.6.2-1.aarch64.rpm
```

3、需要修改 Kapacitor 配置文件(`/etc/kapacitor/kapacitor.conf `)。

​		可以使用`kapacitor config`命令查找配置文件的位置，也可以通过`systemctl edit kapacitor`打开服务的配置文件，进行时区的设置，或是通过 `vim /etc/kapacitor/kapacitor.conf`，编辑配置文件。

```shell
[Service]
Environment="TZ=Asia/Shanghai"
```

4、启动服务

```shell
systemctl start Kapacitor
```

5、检查 Chronograf 服务启动状态。

```shell
# 检查 influxdb启动状态
systemctl status Kapacitor
# 检查所有服务启动状态
ps auxw
```

![kapacitor状态](https://pic1.imgdb.cn/item/6337c19d16f2c2beb1749d80.png)



## 安装 Telegraf 

Telegraf 可用于监测系统参数，并同步写入绑定的 InfluxDB 数据库。

1、下载 Telegraf (1.20.4 版本) 依赖包，下载版本为 `ReadHat&CentOS`版本。

​		本地下载好依赖包后，而后借助 `XFTP`或 `Winscp `放入云服务器目录(建议放到 /usr/local 目录)。

```txt
# 本地下载直接使用 http 下载，地址栏输入 
https://dl.influxdata.com/telegraf/releases/telegraf-1.20.4-1.x86_64.rpm
浏览器直接会下载好安装包（此种方法速度快）。
```

2、使用 yum 命令进行 Telegraf 的安装。

```shell
yum localinstall telegraf-1.20.4-1.x86_64.rpm
```

3、需要修改 Telegraf  配置文件(`/etc/telegraf/telegraf.conf `)。

​		需要设置 Telegraf  绑定 InfluxDB 数据库。

​		1. 编辑配置文件 /etc/telegraf/telegraf.conf 。

```shell
vim /etc/telegraf/telegraf.conf 
```

​		2. 找到配置文件中 [[outputs.influxdb]]模块。

```shell
/influxdb
```

​		3.修改配置文件。

```shell
[[outputs.influxdb]]
  ## The full HTTP or UDP URL for your InfluxDB instance.
  ##
  ## Multiple URLs can be specified for a single cluster, only ONE of the
  ## urls will be written to each interval.
  # urls = ["unix:///var/run/influxdb.sock"]
  # urls = ["udp://127.0.0.1:8089"]
  # 此处为数据写入的 Influxdb 数据库 HTTP 地址
  urls = ["http://127.0.0.1:8086"] 

  ## The target database for metrics; will be created as needed.
  ## For UDP url endpoint database needs to be configured on server side.
  # 写入数据库名称
  database = "telegraf7076"  

  ## The value of this tag will be used to determine the database.  If this
  ## tag is not set the 'database' option is used as the default.
  # database_tag = ""
  .............
  # 验证信息
  username = "test"
  password = "123456"

```

4、启动服务

```shell
systemctl start telegraf
```

5、检查 telegraf服务启动状态。

```shell
# 检查 influxdb启动状态
systemctl status telegraf
# 检查所有服务启动状态
ps auxw
```

![Telegraf状态](https://pic1.imgdb.cn/item/6337c1ba16f2c2beb174bb57.png)

6、查看数据库中数据信息或直接在 Chronograf 中进行查看。

![telegraf测试](https://pic1.imgdb.cn/item/6337c1cf16f2c2beb174d07d.png)



## 安装 Docker

​		根据官网的安装步骤，使用 yum 在线安装。

1、安装准备环境：

```shell
yum -y install 包名 	# yum install 安装命令 -y 所有的提示都为 y
yum -y install gcc
yum -y install gcc-c++
```

> `-y` 表示安装过程中自动同意。

2、清除以前的 docker 版本

​		旧版本 Docker 版本可能被称为 docker 或 docker-engine，首先进行卸载旧版本，同时卸载其关联的依赖。

```shell
$ sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
```

如果在使用 yum 的时候，提示没有任何上面的包被安装的话，也没有关系，可以跳过这个卸载的过程。

3、首次安装 Docker 需要设置 Docker 仓库：

1）设置仓库，安装依赖包。

```shell
yum install -y yum-utils device-mapper-persistent-data lvm2
```

2）设置阿里云下载镜像（国外镜像比较慢）

```shell
yum-config-manager  --add-repo  http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

4、更新 yum 软件包的索引。

```shell
yum makecache fast
# 注意：centos8 直接使用 yum makecache 即可
```

5、安装 docker 

```shell
yum -y install docker-ce docker-ce-cli containerd.io
```

6、启动 docker

```shell
systemctl start docker
```

检查 docker 运行状态：

```shell
systemctl status docker
```

7、检查 docker 版本：

```shell
docker version
```

> Docker 的卸载：
>
> 1）卸载依赖：
>
> ```shell
> yum remove docker-ce docker-ce-cli containerd.io
> ```
>
> 2）删除 docker 资源目录：
>
> ```shell
> rm -rf /var/lib/docker
> ```
>
> docker 默认工作路径：`/var/lib/docker`

8、配置阿里云镜像加速：

1、登录阿里云官网，找到容器镜像服务，最下面的镜像加速器，根据操作文档进行操作：

![](https://pic1.imgdb.cn/item/6337c1f216f2c2beb174f226.png)

> 每个服务器都有单独的加速器地址，是内网使用的加速器方式（其他服务器使用不了）。

```shell
# 四个命令，配置完即可
sudo mkdir -p /etc/docker
# 编写配置文件
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://h0f3j068.mirror.aliyuncs.com"]
}
EOF
# 重启服务
sudo systemctl daemon-reload
sudo systemctl restart docker
```



## 安装 Nginx

1、官网下载 tar 压缩包：`http://nginx.org/en/download.html`（中间的就是 tar 包），版本为 nginx-1.22.0.tar.gz。

2、将 压缩包 利用 XFtp 上传到 /opt 目录下，再进行解压。

```shell
tar -zxvf nginx-1.22.0.tar.gz
```

3、解压后，发现有一个绿色的文件 `configure`，需要执行这个文件，进行编译（go 环境编译）：

```shell
./configure
```

再执行 make 命令进行编译：

```shell
make
```

再执行安装：

```shell
make install
```

4、查看 nginx 的启动文件：`/usr/local/nginx`

```shell
[root@iZ8vb0l7sqdpurpvy5e77xZ nginx-1.22.0]# whereis nginx
nginx: /usr/sbin/nginx /usr/lib64/nginx /etc/nginx /usr/local/nginx /usr/share/nginx /usr/share/man/man3/nginx.3pm.gz /usr/share/man/man8/nginx.8.gz
```

那么如何启动呢？

```shell
cd /usr/local/nginx
cd sbin
./nginx
# 未出现报错就是没问题
```

5、查看配置文件：`/etc/nginx`，发现默认端口为 80。

6、打开阿里云安全组的端口设置，开放 80 端口。

7、访问 ip 即可看到 welcome to nginx 页面。



## 安装 Redis

​		注意：官方推荐使用 Linux 安装和操作 Redis，官方不支持 Windows 系统的 Redis。

1、下载 Redis 安装包：当前最新版本 `redis-7.0.1.tar.gz`，并上传到 `/home` 目录下。

2、解压 Redis 压缩包，并移动到 /opt 目录下。

```shell
# 解压文件
tar -zxvf redis-7.0.1.tar.gz
# 移动文件
mv redis-7.0.1 /opt
```

3、进入解压后的文件，找到 redis 的配置文件：`redis.conf`，后续会使用。

4、安装 redis 的环境：`gcc-c++`

```shell
yum install gcc-c++

# 进入 redis 的目录，编译文件，下载环境依赖
make
# 安装
make install
```

redis 默认的安装路径在 `/usr/local/bin` 目录下。

5、当前 /usr/local/bin 安装目录中，创建文件夹：redis-conf ，并将刚才找到的 redis.conf 配置文件拷贝到此文件夹中，以后便使用此处的配置文件启动。

```shell
cp /opt/redis-7.0.1/redis.conf /usr/local/bin/redis-conf
```

6、打开 redis 的配置文件：`/redis-conf/redis.conf`，修改部分配置，以后台启动。

```shell
# 以后台方式启动 redis
daemonize yes
```

7、启动 redis 服务。

```shell
redis-server redis-conf/redis.conf
```

8、连接进 redis 客户端操作。

```shell
redis-cli -p 6379
```

9、关闭 redis 服务。

```shell
# 在客户端 redis-cli 内部执行
shutdown
quit
```

10、当使用远程连接时，还需要修改一些配置：

```shell
# 开启任何 IP 允许访问
bind 0.0.0.0
# 关闭保护模式
protected-mode no
# 设置密码
reuqirepass gaozheng1998
```

## 安装 Mycat2

​		Mycat2 的安装需要二次整合：tar(zip) 包 + jar 包，需要将下载的 zip 包本地解压，再将核心 jar 包放入其 lib 目录。

> 此次安装测试使用的是 39.103.191.179 服务器，使用的 mysql 是服务器本地 docker 创建的 mysql8。

1、下载安装包 zip 包：`http://dl.mycat.org.cn/2.0/install-template/`，选择 1.21 版本。

2、下载核心依赖 Jar 包：`http://dl.mycat.org.cn/2.0/1.21-release/`，选择 1.21 版本。

3、解压安装包，将 Jar 包直接放入 mycat 的 `lib 目录`，此时使用包即搭建完成。

4、利用 XFTP 将此解压包 mycat 放入`/usr/local` 目录下。

5、修改文件夹的权限为最高权限，使其支持 root 用户操作（未修改时是白色文件夹，权限修改后为绿色）

```shell
# 进入 /usr/local 目录
cd /usr/local
# 修改整个文件夹权限
chmod -R 777 mycat
```

6、利用 docker 创建 `mysql 8.0.26` 服务并运行：

​	1）创建 docker-compose.yml 配置文件（docker 创建 mysql 容器配置项很多，因此使用 docker-compose 创建）

```properties
version: '3.1'
services:
  mysql8:
    image: mysql:8.0.28
    container_name: mysql8
    environment:
      MYSQL_ROOT_PASSWORD: 123456
    command:
      --default-authentication-plugin=mysql_native_password
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_general_ci
      --explicit_defaults_for_timestamp=true
      --lower_case_table_names=1
    ports:
      - 4306:3306
    volumes:
      - ./data:/var/lib/mysql
```

​	2）启动 mysql8 容器，进入容器，配置一个 mycat 用户（`也可以不添加用户，直接使用 root 用户`）

```shell
# 利用 docker-compose 启动容器
docker-compose up -d

# 进入 mysql8 容器
docker exec -it mysql8 /bin/bash

# 进入 mysql 客户端
mysql -uroot -p123456

# 创建用户 mycat，设置密码
create user 'mycat'@'%' identified by '123456';
# 设置远程连接的 root 权限用户
grant xa_recover_admin on *.* to 'root'@'%';
# 赋予 mycat 权限
grant all privileges on *.* to 'mycat'@'%';
# 刷新权限
flush privileges;
```

8、修改 mycat 的 prototype 数据源对应的 mysql 数据库配置：`/conf/datasources/prototypeDs.datasource.json` 配置文件

```json
{
        "dbType":"mysql",
        "idleTimeout":60000,
        "initSqls":[],
        "initSqlsGetConnection":true,
        "instanceType":"READ_WRITE",
        "maxCon":1000,
        "maxConnectTimeout":3000,
        "maxRetryCount":5,
        "minCon":1,
        "name":"prototypeDs",
        "password":"123456",
        "type":"JDBC",
        "url":"jdbc:mysql://39.103.191.179:4306/mydb01?useUnicode=true&serverTimezone=Asia/Shanghai&characterEncoding=UTF-8",
        "user":"mycat",
        "weight":0
}
```

​		当前只修改原型库的相关配置：user（刚才创建的 mycat 用户）、password、url（对应的 IP 和 端口以及原型数据库名）。

9、启动 mycat 的相关命令：

```shell
# 进入 mycat的启动文件目录 bin
cd /usr/local/mycat/bin

# 启动 mycat
[root@iZ8vb45xejetxupwfn3mj8Z bin]# ./mycat start
Starting mycat2...

# 检查 mycat 状态
[root@iZ8vb45xejetxupwfn3mj8Z bin]# ./mycat status
mycat2 is running (613329).

# 其他操作命令：
./mycat start  # 启动 mycat
./mycat status # 查看 mycat 状态
./mycat stop   # 停止 mycat
./mycat console # 前台启动 mycat
./mycat install # 添加到系统自动启动（暂未实现）
./mycat remove   # 取消随系统自动启动（暂未实现）
./mycat restart # 重启 mycat 服务
./mycat pause # 暂停 mycat 服务
```

## 安装 RabbitMQ

`环境说明:` centos8 服务器，Xshell 安装。

1、下载：`https://www.rabbitmq.com/download.html`

2、安装 Erlang 环境，RabbitMQ 依赖 Erlang 环境：

> ```shell
> # 官网下载：https://packagecloud.io/rabbitmq/erlang/packages/el/7/erlang-23.3.4.5-1.el8.x86_64.rpm
> # 此处的 el8 代表是 centos8 系统
> # 注意点：需要参照 RabbitMQ 和 Erlang 版本对照进行下载安装：https://www.rabbitmq.com/which-erlang.html
> ```

```shell
# 1、下载 rpm 安装包，网页右上角的 download 按钮
# 2、XFTP 拖放到指定文件：/usr/local/software
# 3、解压 rpm 包：
	rpm -ivh erlang-23.3.4.5-1.el8.x86_64.rpm
# 4、安装 Erlang
	yum install -y erlang
# 5、检查安装情况
	erl -v
```

3、安装 RabbitMQ 依赖包：

```shell
yum install socat -y
```

> 附录：
>
> ​	报错：yum 的安装源问题
>
> ```shell
> Repository extras is listed more than once in the configuration
> CentOS Linux 8 - AppStream                                                                            18 kB/s | 2.3 kB     00:00    
> Errors during downloading metadata for repository 'appstream':
>   - Status code: 404 for http://mirrors.cloud.aliyuncs.com/centos/8/AppStream/x86_64/os/repodata/repomd.xml (IP: 100.100.2.148)
> Error: Failed to download metadata for repo 'appstream': Cannot download repomd.xml: Cannot download repodata/repomd.xml: All mirrors were tried
> ```
>
> **解决方法：**针对该问题,阿里云也提供了解决方法,可依次执行如下命令即可解决。该方法只适用于阿里云的ECS服务器,其他 IDC公司的服务器可参考教程操作：`https://blog.tag.gg/showinfo-3-36185-0.html`。
>
> yum 命令下载报错 404，起源于阿里巴巴镜像问题，需要更换镜像：
>
> 1、执行如下命令先将之前的yum文件备份：
>
> > rename '.repo' '.repo.bak' /etc/yum.repos.d/*.repo 
>
> 2、运行以下命令下载最新的repo文件：
>
> > wget https://mirrors.aliyun.com/repo/Centos-vault-8.5.2111.repo -O /etc/yum.repos.d/Centos-vault-8.5.2111.repo
>
> > wget https://mirrors.aliyun.com/repo/epel-archive-8.repo -O /etc/yum.repos.d/epel-archive-8.repo
>
> 3、运行以下命令替换repo文件中的链接：
>
> > sed -i 's/mirrors.cloud.aliyuncs.com/url_tmp/g' /etc/yum.repos.d/Centos-vault-8.5.2111.repo && sed -i 's/mirrors.aliyun.com/mirrors.cloud.aliyuncs.com/g' /etc/yum.repos.d/Centos-vault-8.5.2111.repo && sed -i 's/url_tmp/mirrors.aliyun.com/g' /etc/yum.repos.d/Centos-vault-8.5.2111.repo
>
> > sed -i 's/mirrors.aliyun.com/mirrors.cloud.aliyuncs.com/g' /etc/yum.repos.d/epel-archive-8.repo
>
> 4、运行以下命令重新创建缓存,若没报错,则正常了。
>
> > yum clean all && yum makecache
>
> **注意：**若使用阿里云服务器参考本教程重新执行后还有问题,请将 进入 /etc/yum.repos.d/ 目录，将之前下载的yum文件（repo）改名后再重新按照本教程操作一次即可。

4、安装 RabbitMQ：

```shell
# 1、下载 RabbitMQ 的rpm 包：https://www.rabbitmq.com/download.html（注意版本对应问题）
# 2、解压 rpm 包
	rpm -Uvh rabbitmq-server-3.9.14-1.el8.noarch.rpm
# 3、安装 RabbitMQ
	yum install -y rabbitmq-server
```

5、开机启动 MQ：

```shell
systemctl enable rabbitmq-server
```

6、RabbitMQ 相关操作：

```shell
# 启动：第一次启动可能比较慢
systemctl start rabbitmq-server

# 检查状态
systemctl status rabbitmq-server

# 关闭
systemctl stop rabbitmq-server

# 重启
systemctl restart rabbitmq-server
```

7、需要安装后台管理模块，注意需要先将 RabbitMQ 关闭：

```shell
rabbitmq-plugins enable rabbitmq_management
```

​		安装完毕后，注意将 RabbitMQ 服务重新启动。

8、访问 RabbitMQ 的 Web 页面，此处我的 IP 为`http://8.142.92.222:15672/`，默认账号密码为 guest 不支持远程访问。

> 注意需要打开阿里云服务器的 `15672 端口（web端口） 和 5672 端口（连接端口）`，同时关闭防火墙或是打开该端口拦截状态。

9、创建远程登陆用户，并赋予权限：

```shell
# 1、创建用户：
rabbitmqctl add_user root 123456
# 2、赋予角色：administrator 为超级管理员
rabbitmqctl set_user_tags root administrator
# 3、设置用户权限：
rabbitmqctl set_permissions -p / root ".*" ".*" ".*"
# 4、查看用户：
rabbitmqctl list_users
```









































































