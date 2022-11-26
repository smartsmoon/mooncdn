---
title: Git 版本控制基础
date: 2022-04-22 00:00:00
type:
comments:
tags: 
  - Git
  - 版本控制
categories: 
  - 工具插件
description: 
keywords: Git
cover: https://w.wallhaven.cc/full/j3/wallhaven-j36wpw.png
top_img: https://w.wallhaven.cc/full/j3/wallhaven-j36wpw.png

---

​		Git 是一个开源的`分布式版本控制系统`，可以有效、高速地处理从很小到非常大的项目版本管理。也是 Linus Torvalds 为了帮助管理 Linux 内核开发而开发的一个开放源码的版本控制软件。

## 版本控制

​		`版本控制`是一种在开发的过程中用于管理我们对文件、目录或工程等内容的修改历史，方便查看更改历史记录，备份以便恢复以前的版本的软件工程技术。

核心：`版本迭代`，版本保存，版本恢复，就是一种管理多人协同开发项目的技术。

常见的版本控制工具：`Git`、SVN 等。

版本控制主要可以分为：本地版本控制、集中版本控制、分布式版本控制。

1、本地版本控制：记录文件每次的更新，可以对每个版本做一个快照，或是记录补丁文件，适合个人用，如RCS。（类似于 论文版本修改）

2、集中版本控制：版本数据都存在服务器上，协同开发者`从服务器上同步更新或上传自己的修改`；用户的本地只有自己以前所同步的版本，如果不连网的话，用户就看不到历史版本，也无法切换版本验证问题，或在不同分支工作。而且，所有数据都保存在单一的服务器上，有很大的风险这个服务器会损坏，这样就会丢失所有的数据，当然可以定期备份。（SVN）

3、`分布式版本控制`：版本信息仓库`全部同步`到本地的每个用户，这样就可以在本地查看所有版本历史，可以`离线在本地提交`(本地提交到本地版本控制中心)，只需在连网时push到相应的服务器或其他用户那里。由于`每个用户那里保存的都是所有的版本数据`，只要有一个用户的设备没有问题就可以恢复所有的数据，但这增加了本地存储空间的占用。（Git）

>  Git与SVN的主要区别：
>
> 1）SVN：集中式版本控制，手上只有上一次从中央服务器拉取的最新代码，工作完毕再推送，需要联网。
>
> 2）Git：分布式版本控制，每个人手中都是完整的版本库，不需要联网就可以提交到本地版本控制中心。
>
> `Git是目前世界上最先进的分布式版本控制系统`。

## Git 环境配置

> git 官网下载缓慢，可以使用淘宝镜像：`http://npm.taobao.org/mirrors/git-for-windows/` 地址下载。

Git 下载与安装：下载对应版本，点击安装，一路 yes 即可（exe 版本安装包）。

`注意`	下载安装后，会有三个使用方法：`bash`（linux 风格）、cmd（windows 风格）、gui（可视化） 方式。

安装完毕，查看 git 配置：

```shell
git config -l
```

查看本地系统配置：

```shell
git config --system --list
```

查看本地全局配置：

```shell
git config --global --list
```

`设置全局配置`，username 和 邮箱，不设置的话，无法提交（这里的 username 和 邮箱 是 自己的 gitee 或 github 里面的信息）

```shell
git config --global user.name "gaozheng"  # 名称
git config --global user.email "123456789@qq.com"   # 邮箱
```

## Git 基本理论

​		Git 本地有三个工作区域：`工作目录`（Working Directory）、`暂存区`(Stage/Index)、`资源库`(Repository或Git Directory)。如果在加上`远程的git仓库`(Remote Directory)就可以分为四个工作区域。文件在这四个区域之间的转换关系如下：

<img src="https://img-blog.csdnimg.cn/d60404d4224e44b19ad339e855e24c97.png" width="600px" height="400px"/>

Workspace：工作区，就是你平时存放项目代码的地方。

Index / Stage：暂存区，用于临时存放你的改动，`事实上它只是一个文件，保存即将提交到文件列表信息`。

Repository：仓库区（或本地仓库），就是安全存放数据的位置，这里面有你提交到所有版本的数据。其中 HEAD 指向最新放入仓库的版本。

Remote：远程仓库，托管代码的服务器，可以简单的认为是你项目组中的一台电脑用于远程数据交换。

<img src="https://img-blog.csdnimg.cn/34b25a23ac1944f681891b2d76e749bc.png" width="800px" height="500px"/>

## Git 工作流程

Git 工作流程主要包括：

<img src="https://img-blog.csdnimg.cn/2e58e3f2ff5a4e539eb09c923a45b6e4.png" width="800px" height="500px"/>

１、在工作目录中添加、修改文件；	`UserMapper.xml`

２、将需要进行版本管理的文件放入暂存区域；	`git add .`

３、将暂存区域的文件提交到本地 git 仓库。	`git commit`

4、推送到远程。	`git push`

因此，git 管理的文件有三种状态：已修改（modified）,已暂存（staged）,已提交(committed)

## Git 操作

工作目录（WorkSpace)一般就是你希望 Git 帮助你管理的文件夹，可以是你项目的目录，也可以是一个空目录（远程拉取项目），建议不要有中文。

主要的命令和操作流程：

<img src="https://img-blog.csdnimg.cn/0c5a75592130469e81bef906b57c36d3.png" width="900px" height="450px"/>

### Git 仓库初始化

git 仓库初始化方式：

1、`本地仓库搭建`：在当前目录新建一个 Git 代码库。

```shell
git init
```

2、`克隆远程仓库`：克隆远程目录到本地，将远程服务器上的仓库完全镜像一份到本地。

```shell
git clone [url]
```

### Git 文件操作

文件状态：

1）Untracked: 未跟踪, 此文件在文件夹中, 但并没有加入到 git 库, 不参与版本控制. 通过`git add` 状态变为`Staged`。

2）Unmodify: 文件已经入库, 未修改, 即版本库中的文件快照内容与文件夹中完全一致. 这种类型的文件有两种去处, 如果它被修改, 而变为 Modified. 如果使用`git rm`移出版本库, 则成为`Untracked`文件。

3）Modified: 文件已修改, 仅仅是修改, 并没有进行其他的操作. 这个文件也有两个去处, 通过`git add`可进入暂存 staged 状态, 使用`git checkout` 则丢弃修改过, 返回到`unmodify`状态, 这个 git checkout 即从库中取出文件, 覆盖当前修改 。

4）Staged: 暂存状态.，执行`git commit`则将修改同步到库中, 这时库中的文件和本地文件又变为一致, 文件为 `Unmodify` 状态. 执行`git reset HEAD filename`取消暂存, 文件状态为 Modified。

相关命令：

1、查看文件状态：

```shell
# 查看指定文件状态
git status [filename]

# 查看所有文件状态
git status
```

2、添加文件到暂存区：

```shell
git add .  
```

3、提交暂存区内容到本地仓库：

```shell
git commit -m "备注内容"
```

### 忽略文件配置

​		有些时候我们不想把某些文件纳入版本控制中，比如数据库文件，临时文件，设计文件等。（Idea 中的 `.gitignore` 文件就是忽略配置文件）

- 忽略文件中的空行或以井号（#）开始的行将会被忽略。
- 可以使用Linux通配符。例如：星号（*）代表任意多个字符，问号（？）代表一个字符，方括号（[abc]）代表可选字符范围，大括号（{string1,string2,…}）代表可选的字符串等。
- 如果名称的最前面有一个感叹号（!），表示例外规则，将不被忽略。
- 如果名称的最前面是一个路径分隔符（/），表示要忽略的文件在此目录下，而子目录中的文件不忽略。
- 如果名称的最后面是一个路径分隔符（/），表示要忽略的是此目录下该名称的子目录，而非文件（默认文件或目录都忽略）。

```shell
*.txt        # 忽略所有 .txt结尾的文件,这样的话上传就不会被选中！
!lib.txt     # 但lib.txt除外
/temp        # 仅忽略项目根目录下的TODO文件,不包括其它目录temp
build/       # 忽略build/目录下的所有文件
doc/*.txt    # 会忽略 doc/notes.txt 但不包括 doc/server/arch.txt
```

### IDEA 集成 Git

1、IDEA 绑定 Git：将 Git 远程仓库的内容全部剪切到项目中，就会发现 IDEA 中的项目出现` git 的相关图标`，同时文件变色。

## Git 分支

```shell
# 列出所有本地分支
git branch
 
# 列出所有远程分支
git branch -r
 
# 新建一个分支，但依然停留在当前分支
git branch [branch-name]
 
# 新建一个分支，并切换到该分支
git checkout -b [branch]
 
# 合并指定分支到当前分支
$ git merge [branch]
 
# 删除分支
$ git branch -d [branch-name]
 
# 删除远程分支
$ git push origin --delete [branch-name]
$ git branch -dr [remote/branch]
```

`如果同一个文件在合并分支时都被修改了则会引起冲突：解决的办法是我们可以修改冲突文件后重新提交！选择要保留他的代码还是你的代码`！

​		`master主分支`应该非常稳定，`用来发布新版本`，一般情况下不允许在上面工作，工作一般情况下在新建的dev分支上工作，工作完后，比如上要发布，或者说`dev分支代码稳定后可以合并到主分支master上来`。
