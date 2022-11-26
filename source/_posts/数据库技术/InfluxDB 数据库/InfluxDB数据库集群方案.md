---
title: Influxdb 数据库集群方案
date: 2021-05-26 00:00:00
type:
comments:
tags: 
  - 数据库
  - Influxdb
  - 集群
categories: 
  - 数据库技术
description: 
keywords: Influxdb
swiper_index: 5
cover: https://w.wallhaven.cc/full/qz/wallhaven-qz93rr.jpg
top_img: https://w.wallhaven.cc/full/qz/wallhaven-qz93rr.jpg
---

## 集群方案

​		influxdb 官方集群不再开源，采用收费制，因此本次集群采用免费开源的` influx Proxy` 实现。

> ​		`Influx Proxy` 是一个基于高可用、一致性哈希的 InfluxDB 集群代理服务，实现了 InfluxDB 高可用集群的部署方案，具有动态扩/缩容、故障恢复、数据同步等能力，是在 `influx-realy` 基础上的改进。连接到 Influx Proxy 和连接原生的 InfluxDB Server 没有显著区别，对上层客户端是透明的，上层应用可以像使用单机的 InfluxDB 一样使用，Influx Proxy 会处理请求的转发，并对各个 InfluxDB 集群节点进行管理。
>
> ​		Influx Proxy 基于饿了么开源的 Influx-Proxy，并进一步开发和优化，支持了更多的特性，移除了 Python、Redis 依赖，解决了受限于一个数据库、需要额外配置 KEYMAPS 、数据负载不均衡的问题。

## 集群架构

![](https://pic1.imgdb.cn/item/634d643916f2c2beb1bdfa6b.png)

- **Client**:  客户端

  > ​		目前支持 UDP 的直接写入 ， 支持 Http 的 write /query 操作 ， 包含有: influxdb-java /influxdb-go/influxdb-shell /curl/ 浏览器 等。

- **load balance**:  负载均衡以及多 influx-proxy 转发设置

  > ​		支持 客户端为 Http 请求的操作，对于 UDP 请求 目前暂时不支持， UDP 请求 直接 对接到 Proxy

- **influxdb-proxy**: influx-Proxy 实例

  > ​		influx-proxy 实例，架构示意图部署了两个 influx-proxy 实例，用于管理 influxdb 数据库实例。

- **Circle**:  一致性哈希环(circle)

  > ​		一致性哈希环(circle)，一个 circle 包含了若干个 influxdb 实例，`共同存储了一份全量的数据`，即每个 circle 都是全量数据的一个副本，各个 circle 数据互备。不同 circle 不能包含相同 influxdb 实例，每个 circle 包含的 influxdb 实例个数可以不相等。circle 只是一种逻辑划分，无实体存在，架构示意图配置了三个 circle。
  >
  > `注`：
  >
  >  - 一个 cicle 存储全量数据，每个 influxdb 数据库实例只存储一部分数据。
  >  - cicle 和 cicle 之间相互备份数据，考虑使用 文件备份的形式。
  > - HashRing 只是一种 逻辑 概念。

- **influxdb**：influxdb实例

  > ​		influxdb 实例，以 url 进行区分，可以部署在不同的服务器上，也可以部署在同一服务器上以不同端口运行多个实例，`一个 influxdb 实例只存储了一份全量数据的一部分数据`。
  >
  > ​		当`influxdb实例列表`不发生改变时，`db,measurement`将只会唯一对应一台`influxdb实例`。
  >
  > ​		每个 circle 数据存储位置计算：
  >
  > ```shell
  > db,measurement + influxdb实例列表 + 一致性哈希算法 => influxdb实例
  > ```

## docker集群测试

Docker Compose脚本运行docker容器

下载  `docker-compose.yml`和 `proxy.json`，执行：

```
docker-compose up -d
```

将会启动 1 个 influx-proxy 容器（端口为 7076）和 4 个 influxdb 容器（共 2个 circle，每个 circle 有 2 个 influxdb）。

## 集群实现

### 测试准备

> ​		`influx-proxy` 集群实际测试，采用阿里云的云服务器进行测试，`进行单个代理proxy以及“双环双实例”的测试`，一台主机搭建 influx-proxy 代理和两个 influxdb 实例，另一台专门用于搭载两个 influxdb 实例。实例采用修改端口`(8086、8087)`创建出两个 influxdb 实例的方案。

#### 1、机器准备

|         机器名          |      操作系统版本      | CPU  | 内存 |
| :---------------------: | :--------------------: | :--: | :--: |
|   8.142.92.222 (主机)   | aliyun centos 7.9 系统 | 4核  | 8 Gi |
| 39.103.191.179 (实例机) | aliyun centos 7.9 系统 | 4 核 | 8 Gi |

#### 2、实例准备

influxdb 实例版本：1.8.0 版本

部署方式：二进制部署

开放数据端口:  8086、8087

#### 3、依赖安装

		-  Influx-proxy 编译时需要 go 语言环境。

> ​		`go语言`环境的安装和验证：
>
> 1、下载 go 语言环境压缩包，上传至服务器 /opt 目录；
>
> ​		下载地址：`https://golang.org/dl/`
>
> ​		版本选择：go1.15.linux-amd64.tar.gz(`注意此处 go 环境版本不能过高，否则编译出的文件不同`)
>
> 2、解压 go1.15 压缩包到 /usr/local 目录；
>
> ```shell
> tar -zxvf go1.15.linux-amd64.tar.gz -C /usr/local
> ```
>
> 3、设置环境变量，并重新加载系统 Path ，方便全局访问；
>
> ```shell
> echo "export PATH=\$PATH:/usr/local/go/bin" >> /etc/profile
> echo "export GOPROXY=https://goproxy.io" >> /etc/profile
> source /etc/profile
> ```
>
> 4、验证 go 语言环境。
>
> ```shell
> go version
> 
> # 查看系统变量
> $PATH
> 
> 注：此处可能会出现一个问题，$PATH 路径中可能会出现重复路径，考虑是由于反复加载系统路径的原因，重新打开服务器窗口解决！
> ```
>
> ​	验证结果：
>
> ```shell
> go version go1.15 linux/amd64
> ```

		- Influx-proxy 使用 git 方式从 [git 官网](https://github.com/chengshiwen/influx-proxy) 进行拉取，需要 git 环境。

> ​		git 环境安装与测试
>
> 1、安装
>
> ```shell
> yum install git
> ```
>
> 2、验证
>
> ```
> git --version
> ```
>
> ​		验证结果：
>
> ```shell
> git version 1.8.3.1
> ```



### Influx-proxy安装

​		influx-proxy 选择主机  8.142.92.222 进行部署。

1、下载 influx-proxy  到 /opt 目录；

```shell
# 主机 8.142.92.222 拉取最新版本 influx-proxy

cd /opt
git clone https://github.com/chengshiwen/influx-proxy.git
```

2、编译 influx-proxy ；

```shell
# 主机 8.142.92.222 编译 go 语言编写的 influx-proxy
# 进入 influx-proxy 目录
cd influx-proxy
# 编译：需要 git 支持，会从 git 上拉取依赖包，速度较慢可以考虑更换 git 下载路径
make
# 拷贝到 /usr/local/bin/ 目录，直接就加入了 $PATH 系统路径，就不需要单独配置
cp /opt/influx-proxy/bin/influx-proxy /usr/local/bin/
```

3、增加 influx-proxy 配置文件;

```shell
# 编辑配置文件 proxy.json 
vim /opt/influx-proxy/proxy.json
```

​	proxy.json文件示例：

```json
{
    "circles": [
        {
            "name": "circle-1",
            "backends": [
                {
                    "name": "influxdb-1-1",
                    "url": "http://127.0.0.1:8086",
                    "username": "test",
                    "password": "123456",
                    "auth_encrypt": false
                },
                {
                    "name": "influxdb-1-2",
                    "url": "http://127.0.0.1:8087",
                    "username": "test",
                    "password": "123456",
                    "auth_encrypt": false
                }
            ]
        },
        {
            "name": "circle-2",
            "backends": [
                {
                    "name": "influxdb-2-1",
                    "url": "http://39.103.191.179:8086",
                    "username": "test",
                    "password": "123456",
                    "auth_encrypt": false
                },
                {
                    "name": "influxdb-2-2",
                    "url": "http://39.103.191.179:8087",
                    "username": "test",
                    "password": "123456",
                    "auth_encrypt": false
                }
            ]
        }
    ],
    "listen_addr": ":7076",
    "db_list": [],
    "data_dir": "/mnt/data/influx-pr/data",
    "tlog_dir": "/mnt/data/influx-pr/log",
    "hash_key": "idx",
    "flush_size": 10000,
    "flush_time": 1,
    "check_interval": 1,
    "rewrite_interval": 10,
    "conn_pool_size": 20,
    "write_timeout": 10,
    "idle_timeout": 10,
    "username": "test",
    "password": "123456",
    "auth_encrypt": false,
    "write_tracing": false,
    "query_tracing": false,
    "https_enabled": false,
    "https_cert": "",
    "https_key": ""
}
```

> 配置文件 proxy.json 说明：
>
> - `circles`:  hash circle的列表
>
>   - `name`:  每个 hash circle的 名字，保证唯一性，必填
>
>   - `backends`:  circle 包含的 influxdb 后端实例列表，必填
>
>     - `name`:  实例名称，要求不同后端实例名称不同，必填
>
>     - `url`:  实例 url，此处填写自己服务器的 ip : port ，必填
>
>       ​	此处显示四个 influxdb 实例，分别位于两个 circle 。
>
>       	- http://127.0.0.1:8086	           主机 8086 端口  influxdb   实例
>       	- http://127.0.0.1:8087               主机 8087 端口  influxdb   实例
>       	- http://39.103.191.179:8086    实例机 8086 端口 influxdb 实例
>       	- http://39.103.191.179:8087    实例机 8087 端口 influxdb 实例
>
>     - `username`:  实例认证用户
>
>     - `password`:  实例认证密码
>
>     - `auth_encrypt`:  是否启用认证加密，即`用户和密码是否为加密文字`，默认为 `false`，此处并不是说开启认证。即这里选择 `false`后，进入influx-proxy 仍然需要 username 和 password 。
>
>       > 此处还应该注意的是，从 v2.5.5 版本 influx-proxy 后，所有 `auth_secure` 变更为 `auth_encrypt`。
>
> - `listen_addr`:  Proxy 使用Http的 `ip:port` 请求地址，一般不绑定 `ip`。
>
> - `db_list`:  允许 Proxy 访问 的 数据库 列表， `默认: []` , 表示不进行限制，proxy 可以访问所有数据库。
>
> - `data_dir`: 保存写入失败的数据的缓存目录，存放 .dat 和 .rec 文件，默认为 `data`。
>
> - `tlog_dir`:  用于记录重新平衡、故障恢复、数据同步、错误数据清理的日志目录。
>
> - `hash_key`:  配置一致性哈希算法的 key，可选值为 idx、exi、name 或 url，分别使用 backend 实例的 索引、扩展索引、name、url 的值进行 hash，`默认值为 idx`。
>
>   - hash key 确定后，尽量不进行修改， 否则需要 rebalance。
>   - 若 backend 实例的 index、name、url 的值发生变更，也会导致 hash 策略发生变化，从而需要 rebalance，如新增 backend 实例、name 变更、url 从 http 协议变成 https 协议等，`默认值 idx 会使得一致性哈希更加稳定`，从而减少 rebalance ;
>   - 扩展索引 exi 是 索引 idx 的扩展版，v2.5.3 开始支持，一个 circle 中的 influxdb `实例数量大于 10 `时建议使用 exi
>
> - `flush_size`:  写数据时缓冲的最大点数，达到设定值时将一次性批量写入到 influxdb 实例；
>
> - `flush_time`:  写数据时缓冲的最大时间，达到设定值时即使没有达到 flush_size 也进行一次性批量写入到 influxdb 实例，单位为秒，默认为 1。
>
> - `check_interval`:  检查后端存活的间隔时间。
>
> - `rewrite_interval`:  向 influxdb 后端实例重写缓存失败数据的间隔时间，默认为 10 秒。
>
> - `conn_pool_size`:  创建 influxdb 后端实例写入的连接池大小，默认为 20。
>
> - `write_timeout`:  向 influxdb 后端实例写数据的超时时间，默认为 10 秒。
>
> - `idle_timeout`:  服务器 keep-alives 的等待时间，默认为 10 秒。
>
> - `username`:  proxy 的认证用户，若 auth_secure 开启则启用认证加密，`空表示不启用认证`，默认空
>
> - `password`:  proxy 的认证密码，若 auth_secure 开启则启用认证加密，`空表示不启用认证`，默认空
>
> - `auth_encrypt`:  是否启用认证加密，即`用户和密码是否为加密文字`，默认为 `false`，并非启用认证。
>
> - `write_tracing`:  写入请求的日志开关，默认为 false
>
> - `query_tracing`:  查询请求的日志开关，默认为 false
>
> - `https_enabled`:  是否启用 https，默认为 `false`。
>
> - `udp_url`:  UDP 的 监控地址
>
> - `udp_db`:  UDP 的写入 库
>
> - `https_cert`:  ssl 证书路径，https_enabled 开启后有效
>
> - `https_key`:  ssl 私钥路径

4、配置系统启动服务文件，让 systemctl 管理 influx-proxy 服务。

​	进入编辑 influx-proxy.service 服务文件：

```shell
vim /etc/systemd/system/influx-proxy.service
```

​	influx-proxy.service 服务文件：

```shell
# 系统服务文件：服务需要命名为 influx-proxy.service ，后面以 influx-proxy 启动。

[Unit]
Description=influx-proxy
After=network.target

[Service]
Type=simple
# 配置文件
ExecStart=/usr/local/bin/influx-proxy -config /opt/influx-proxy/proxy.json
KillSignal=SIGTERM

[Install]
WantedBy=multi-user.target
```

5、设置权限

```shell
# 新建 influx-proxy 的数据存放目录
mkdir -p /mnt/data/influx-pr

# 设置文件目录权限
chown influxdb:influxdb /mnt/data/influx-pr
```



### 主机 Influxdb 实例安装

1、安装 influxdb 数据库，采用 wget 工具下载文件(也可以官网直接下载上传至服务器)， yum 工具安装。

```shell
# 下载
wget https://dl.influxdata.com/influxdb/releases/influxdb-1.8.2.x86_64.rpm

# 安装
yum -y localinstall influxdb-1.8.2.x86_64.rpm
```

2、修改配置文件(新建配置文件)，influxdb.conf.1(8086)、influxdb.conf.1(8087)

​	进入编辑 influxdb.conf.1、influxdb.conf.2 服务文件：

```shell
# 8086 端口 influxdb 实例配置文件
vim /etc/influxdb/influxdb.conf.1

# 8087 端口 influxdb 实例配置文件
vim /etc/influxdb/influxdb.conf.2
```

​	influxdb.conf.1 配置文件：

```shell
# 配置文件

reporting-disabled = true         # 禁用报告，默认为 false
bind-address = ":8088"
[meta]
dir = "/mnt/data/influxdb/meta"    # 元信息目录
[data]
dir = "/mnt/data/influxdb/data"    # 数据目录
wal-dir = "/mnt/data/influxdb/wal" # 预写目录
wal-fsync-delay = "10ms"          # SSD 设置为 0s，非 SSD 推荐设置为 0ms-100ms
index-version = "tsi1"            # tsi1 磁盘索引，inmem 内存索引需要大量内存
query-log-enabled = true          # 查询的日志，默认是 true
[coordinator]
write-timeout = "20s"             # 写入请求超时时间，默认为 10s
[http]
enabled = true					# 配置用户验证
bind-address = ":8086"			 # http访问端口
auth-enabled = true
log-enabled = true                 # http 请求日志，默认是 true
[logging]
level = "info"                    # 日志等级，error、warn、info(默认)、debug
```

influxdb.conf.2 配置文件：

```shell
# 配置文件
/etc/influxdb/influxdb.conf.2

reporting-disabled = true         # 禁用报告，默认为 false
bind-address = ":8089"
[meta]
dir = "/mnt/data/influxdb/meta"    # 元信息目录
[data]
dir = "/mnt/data/influxdb/data"    # 数据目录
wal-dir = "/mnt/data/influxdb/wal" # 预写目录
wal-fsync-delay = "10ms"          # SSD 设置为 0s，非 SSD 推荐设置为 0ms-100ms
index-version = "tsi1"            # tsi1 磁盘索引，inmem 内存索引需要大量内存
query-log-enabled = true          # 查询的日志，默认是 true
[coordinator]
write-timeout = "20s"             # 写入请求超时时间，默认为 10s
[http]
enabled = true					# 配置用户验证
bind-address = ":8087"			 # http访问端口
auth-enabled = true
log-enabled = true                 # http 请求日志，默认是 true
[logging]
level = "info"                    # 日志等级，error、warn、info(默认)、debug
```

> 注意：influxdb 实例刚创建后，需要将
>
> ```shell
> [http]
> enabled = true		# 配置用户验证可以直接使用 
> ```
>
> 改成：
>
> ```shell
> enabled = false		# 配置用户验证
> ```
>
> 当然，此处 influxdb 实例默认是 `false`。
>
> 而后，就可以直接使用命令
>
> ```shell
> influx 
> ```
>
> 进入 influx cli客户端，但无法使用 http 进行访问到，因此，后续每个 influxdb 实例都需要先设置一个 `admin`权限的用户，用于后续 http 访问数据库的使用。 

3、编写 服务启动服务脚本：influxd-cluster@.service ，让 systemctl 管理 influxdb 实例服务。

```shell
# 创建并进入 influxd-cluster@.service 文件
vim /etc/systemd/system/influxd-cluster@.service
```

​		服务启动脚本文件 influxd-cluster@.service ：

```shell
# 系统服务文件：服务需要命名为 influxd-cluster@.service ，后面以 influxd-cluster@1、influxd-cluster@2 启动。

[Unit]
Description=influx-cluster
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/influxd -config /etc/influxdb/influxdb.conf.%i
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

4、设置权限

```shell
mkdir -p /mnt/data/influxdb

chown influxdb:influxdb /mnt/data/influxdb
```

### 实例机 Influxdb 实例安装

​		实例机只用于创建 influxdb 实例，给 influx-proxy 使用。

1、安装 influxdb 数据库，采用 wget 工具下载文件(也可以官网直接下载上传至服务器)， yum 工具安装。

```shell
# 下载
wget https://dl.influxdata.com/influxdb/releases/influxdb-1.8.2.x86_64.rpm

# 安装
yum -y localinstall influxdb-1.8.2.x86_64.rpm
```

2、修改配置文件(新建配置文件)，influxdb.conf.1(8086)、influxdb.conf.1(8087)

​	进入编辑 influxdb.conf.1、influxdb.conf.2 服务文件：

```shell
# 8086 端口 influxdb 实例配置文件
vim /etc/influxdb/influxdb.conf.1

# 8087 端口 influxdb 实例配置文件
vim /etc/influxdb/influxdb.conf.2
```

​	influxdb.conf.1 配置文件：

```shell
# 配置文件

reporting-disabled = true         # 禁用报告，默认为 false
bind-address = ":8088"
[meta]
dir = "/mnt/data/influxdb/meta"    # 元信息目录
[data]
dir = "/mnt/data/influxdb/data"    # 数据目录
wal-dir = "/mnt/data/influxdb/wal" # 预写目录
wal-fsync-delay = "10ms"          # SSD 设置为 0s，非 SSD 推荐设置为 0ms-100ms
index-version = "tsi1"            # tsi1 磁盘索引，inmem 内存索引需要大量内存
query-log-enabled = true          # 查询的日志，默认是 true
[coordinator]
write-timeout = "20s"             # 写入请求超时时间，默认为 10s
[http]
enabled = true					# 配置用户验证
bind-address = ":8086"			 # http访问端口
auth-enabled = true
log-enabled = true                 # http 请求日志，默认是 true
[logging]
level = "info"                    # 日志等级，error、warn、info(默认)、debug
```

influxdb.conf.2 配置文件：

```shell
# 配置文件
/etc/influxdb/influxdb.conf.2

reporting-disabled = true         # 禁用报告，默认为 false
bind-address = ":8089"
[meta]
dir = "/mnt/data/influxdb/meta"    # 元信息目录
[data]
dir = "/mnt/data/influxdb/data"    # 数据目录
wal-dir = "/mnt/data/influxdb/wal" # 预写目录
wal-fsync-delay = "10ms"          # SSD 设置为 0s，非 SSD 推荐设置为 0ms-100ms
index-version = "tsi1"            # tsi1 磁盘索引，inmem 内存索引需要大量内存
query-log-enabled = true          # 查询的日志，默认是 true
[coordinator]
write-timeout = "20s"             # 写入请求超时时间，默认为 10s
[http]
enabled = true					# 配置用户验证
bind-address = ":8087"			 # http访问端口
auth-enabled = true
log-enabled = true                 # http 请求日志，默认是 true
[logging]
level = "info"                    # 日志等级，error、warn、info(默认)、debug
```

> 注意：influxdb 实例刚创建后，需要将
>
> ```shell
> [http]
> enabled = true		# 配置用户验证可以直接使用 
> ```
>
> 改成：
>
> ```shell
> enabled = false		# 配置用户验证
> ```
>
> 当然，此处 influxdb 实例默认是 `false`。
>
> 而后，就可以直接使用命令
>
> ```shell
> influx 
> ```
>
> 进入 influx cli客户端，但无法使用 http 进行访问到，因此，后续每个 influxdb 实例都需要先设置一个 `admin`权限的用户，用于后续 http 访问数据库的使用。 

3、编写 服务启动服务脚本：influxd-cluster@.service ，让 systemctl 管理 influxdb 实例服务。

```shell
# 创建并进入 influxd-cluster@.service 文件
vim /etc/systemd/system/influxd-cluster@.service
```

​		服务启动脚本文件 influxd-cluster@.service ：

```shell
# 系统服务文件：服务需要命名为 influxd-cluster@.service ，后面以 influxd-cluster@1、influxd-cluster@2 启动。

[Unit]
Description=influx-cluster
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/influxd -config /etc/influxdb/influxdb.conf.%i
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

4、设置权限

```shell
mkdir -p /mnt/data/influxdb

chown influxdb:influxdb /mnt/data/influxdb
```

### 服务启动测试

#### 服务启动

1、启动主机`(8.142.92.222)`  两个 influxdb 实例。

```shell
# 上面已配置服务文件，让 systemctl 管理服务。
systemctl start influxd-cluster@1
systemctl start influxd-cluster@2
```

2、启动实例机`(39.103.191.179)`  两个 influxdb 实例。

```shell
# 上面已配置服务文件，让 systemctl 管理服务。
systemctl start influxd-cluster@1
systemctl start influxd-cluster@2
```

3、启动主机`(8.142.92.222)`   influx-proxy 代理。

```shell
systemctl start influx-proxy
```

4、检查所有服务启动情况。

```shell
ps auxw
```

​	主机服务情况如下，实例机相同检验。

![服务启动情况](https://pic1.imgdb.cn/item/634d648116f2c2beb1bf3ca3.png)

#### 实例开启 HTTP

1、检查 influxdb 实例配置文件 `[http]` 下的`enabled = false`是否已设置；

​		设置实例配置文件 `[http]` 下的`enabled = false`，使初始进去可以不用输入密码，这样才能创建 `admin`权限用户，用于后续登录。`四个 influxdb 实例都需要相同设置`，此处只示例主机两个 influxdb 实例。

```shell
# 设置实例配置文件 [http] 下的 enabled = false 后

# influxdb 8086 端口实例
# 进入 influxdb cli，需要指定端口(由于有两个端口的 influxdb 实例)
influx -port 8086

# 新增 admin 权限的用户(此处用户名和密码推荐和 proxy.json 中设置一样)
create user test with password '123456' with all privileges；

# 退出 8086 端口实例
exit

# influxdb 8087 端口实例
# 进入 influxdb cli，需要指定端口(由于有两个端口的 influxdb 实例)
influx -port 8087

# 新增 admin 权限的用户(此处用户名和密码推荐和 proxy.json 中设置一样)
create user test with password '123456' with all privileges；

# 退出 8087 端口实例
exit
```

#### Influx-proxy 版本

```shell
# 查看版本
influx-proxy -version

# 输出验证版本
Version:    2.5.7
Git commit: 3284113
Build time: 2021-11-30 18:14:13
Go version: go1.15
OS/Arch:    linux/amd64
```

#### 集群健康状态

```shell
# 查看集群健康状态，推荐使用 curl http://127.0.0.1:7076/health?pretty=true -u test:123456 查看 json 格式集群健康状态
curl http://127.0.0.1:7076/health -u test:123456

# 输出集群健康状态
[{"circle":{"id":0,"name":"circle-1","active":true,"write_only":false},"backends":[{"name":"influxdb-1-1","url":"http://localhost:8086","active":true,"backlog":false,"rewriting":false,"write_only":false},{"name":"influxdb-1-2","url":"http://localhost:8087","active":true,"backlog":false,"rewriting":false,"write_only":false}]},{"circle":{"id":1,"name":"circle-2","active":true,"write_only":false},"backends":[{"name":"influxdb-2-1","url":"http://39.103.191.179:8086","active":true,"backlog":false,"rewriting":false,"write_only":false},{"name":"influxdb-2-2","url":"http://39.103.191.179:8087","active":true,"backlog":false,"rewriting":false,"write_only":false}]}]

```

## Influx-proxy的 CURL 测试 

### 连通性测试

```shell
# 连通性测试
curl -i http://127.0.0.1:7076/ping

# 测试结果
HTTP/1.1 204 No Content
X-Influxdb-Version: 2.5.7
Date: Wed, 01 Dec 2021 12:07:16 GMT

```

### 数据库操作

#### 查询所有库

```shell
# 查询所有库,注意此处 http 的引号不能少
curl "http://127.0.0.1:7076/query?u=test&p=123456" --data-urlencode "q=show databases"

# 返回结果
{"results":[{"statement_id":0,"series":[{"name":"databases","columns":["name"],"values":[["mydb"],["_internal"],["testProxy"]]}]}]}
```

#### 新建数据库

```shell
curl -X POST 'http://127.0.0.1:7076/query?u=test&p=123456' --data-urlencode 'q=CREATE DATABASE "testCurlDb"'

# 返回结果
{"results":[{"statement_id":0}]}
# 查询数据库
curl "http://127.0.0.1:7076/query?u=test&p=123456" --data-urlencode "q=show databases"
# 查询结果
{"results":[{"statement_id":0,"series":[{"name":"databases","columns":["name"],"values":[["_internal"],["testProxy"],["mydb"],["testCurlDb"]]}]}]}
```

### Curl读数据操作

> 使用 HTTP API 进行查询是比较初级的一种方式，不推荐使用。
>
> 推荐使用第三方语言库和客户端管理程序进行查询操作。

```shell
curl -G 'http://127.0.0.1:8086/query?db=testProxy&u=test&p=123456' --data-urlencode 'q=SELECT * FROM "postmanProxy"'

# 返回结果
{"results":[{"statement_id":0,"series":[{"name":"postmanProxy","columns"：["time","sensor_id","value","valueH","valueL"],"values":[["2021-12-01T05:06:13.15947264Z","FSFX111111",10,null,null],["2021-12-01T05:35:37.418488971Z","ND000101",null,0.01,0.01],["2021-12-01T07:52:19.880923037Z","ACC111000",100,100,1]]}]}]}
```

### Curl写数据操作

> 在使用HTTP 写入数据 API 时，InfluxDB的响应主要有以下几个：
>
> 1）`2xx`：
>
> ​			204代表no content;
>
> ​			200代表InfluxDB可以接收请求但是没有完成请求。一般会在body体中带有出错信息。
>
> 2）`4xx`：InfluxDB不能解析请求。
>
> 3）`5xx`：系统出现错误。

```shell
curl -i -X POST "http://127.0.0.1:7076/write?db=testCurlDb&u=test&p=123456" --data-binary 'curlInsertDb,mytag=1 myfield=90'

# 返回响应
HTTP/1.1 204 No Content
X-Influxdb-Version: 2.5.7
Date: Wed, 01 Dec 2021 12:20:30 GMT

# 查询数据表情况
# 查询 http 语句
curl -G 'http://127.0.0.1:7076/query?db=testCurlDb&u=test&p=123456' --data-urlencode 'q=SELECT * FROM "curlInsertDb"'
# 查询结果
{"results":[{"statement_id":0,"series":[{"name":"curlInsertDb","columns":["time","myfield","mytag"],"values":[["2021-12-01T12:20:30.269881771Z",90,"1"]]}]}]}
```

### 查询实例副本

​		查询 db,measurement 对应数据存储的所有 influxdb 实例副本，使用 `/replica` 接口。

```shell
# 查询testCurlDb数据库 curlInsertDb数据表 对应的实例副本
curl 'http://127.0.0.1:7076/replica?db=testCurlDb&meas=curlInsertDb&u=test&p=123456'

# 查询结果
[{"backend":{"name":"influxdb-1-2","url":"http://localhost:8087"},"circle":{"id":0,"name":"circle-1"}},{"backend":{"name":"influxdb-2-2","url":"http://39.103.191.179:8087"},"circle":{"id":1,"name":"circle-2"}}]
```

### HTTP API

|                            接口名                            |                           接口描述                           |
| :----------------------------------------------------------: | :----------------------------------------------------------: |
| [/ping](https://github.com/chengshiwen/influx-proxy/wiki?v=1#接口-ping) |          检查 influx proxy 实例的运行状态及版本信息          |
| [/query](https://github.com/chengshiwen/influx-proxy/wiki?v=1#接口-query) |               查询数据并管理 measurement 数据                |
| [/write](https://github.com/chengshiwen/influx-proxy/wiki?v=1#接口-write) |                  写入数据到已存在的数据库中                  |
| [/health](https://github.com/chengshiwen/influx-proxy/wiki?v=1#接口-health) |               查询所有 influxdb 实例的健康状态               |
| [/replica](https://github.com/chengshiwen/influx-proxy/wiki?v=1#接口-replica) |   查询 db,measurement 对应数据存储的所有 influxdb 实例副本   |
| [/encrypt](https://github.com/chengshiwen/influx-proxy/wiki?v=1#接口-encrypt) |                     加密明文的用户和密码                     |
| [/decrypt](https://github.com/chengshiwen/influx-proxy/wiki?v=1#接口-decrypt) |                     解密加密的用户和密码                     |
| [/rebalance](https://github.com/chengshiwen/influx-proxy/wiki?v=1#接口-rebalance) |                 对指定的 circle 进行重新平衡                 |
| [/recovery](https://github.com/chengshiwen/influx-proxy/wiki?v=1#接口-recovery) | 将指定 circle 的全量数据恢复到故障的 circle 的全部或部分实例 |
| [/resync](https://github.com/chengshiwen/influx-proxy/wiki?v=1#接口-resync) |                   所有 circle 互相同步数据                   |
| [/cleanup](https://github.com/chengshiwen/influx-proxy/wiki?v=1#接口-cleanup) |    对指定的 circle 中不该存储在对应实例的错误数据进行清理    |
| [/transfer/state](https://github.com/chengshiwen/influx-proxy/wiki?v=1#接口-transferstate) |                    查询和设置迁移状态标志                    |
| [/transfer/stats](https://github.com/chengshiwen/influx-proxy/wiki?v=1#接口-transferstats) |                     查询迁移进度状态统计                     |
| [/debug/pprof](https://github.com/chengshiwen/influx-proxy/wiki?v=1#接口-debugpprof) |              生成用于性能瓶颈排障定位的采样文件              |

## Influx-proxy 的 Postman 测试

### 数据库测试

#### 1、查询数据库

- 查询方式：GET

- 查询请求：http://x.x.x.x:7076/`query`

- 参数：

  | 参数名 |     参数值     |     参数意义      |
  | :----: | :------------: | :---------------: |
  |   u    |      test      |   influx用户名    |
  |   p    |     123456     |  influx用户密码   |
  |   q    | show databases | influx查询sql语句 |
  | pretty |      true      |   json格式设置    |

#### 2、创建数据库

#### 1、创建数据库

- 查询方式：POST

- 查询请求：http://x.x.x.x:7076/`query`

- 参数：

  | 参数名 |            参数值             |     参数意义      |
  | :----: | :---------------------------: | :---------------: |
  |   u    |             test              |   influx用户名    |
  |   p    |            123456             |  influx用户密码   |
  |   q    | create database postmanTestDb | influx创库sql语句 |
  | pretty |             true              |   json格式设置    |

### 读数据测试

- 查询方式：GET

- 查询请求：http://x.x.x.x:7076/`query`

- 参数：

  | 参数名 |           参数值           |     参数意义      |
  | :----: | :------------------------: | :---------------: |
  |   db   |         testProxy          |     数据库名      |
  |   u    |            test            |   influx用户名    |
  |   p    |           123456           |  influx用户密码   |
  |   q    | select * from postmanProxy | influx创库sql语句 |
  | pretty |            true            |   json格式设置    |

### 写数据测试

- 查询方式：POST

- 查询请求：http://x.x.x.x:7076/`write`

- 参数：

  | 参数名 |  参数值   |    参数意义    |
  | :----: | :-------: | :------------: |
  |   db   | testProxy |    数据库名    |
  |   u    |   test    |  influx用户名  |
  |   p    |  123456   | influx用户密码 |
  | pretty |   true    |  json格式设置  |

- 请求体：(点击 Body **--** 选择 raw 选项)

  ```json
  postmanProxy2,sensor_id=WSD000101 valueH=100,valueL=0.01,value=1000
  ```

## Java端测试

### Influx-proxy工具类

​		使用 `Influx-proxy工具类`，参照 Influxdb 工具类，进行方法的添加，达到如下功能：

		- Influx-proxy的连接检查
		- Influx-proxy的健康状况的检查
		- Influxdb数据库的新建、查询
		- Influxdb数据库的数据的 CRUD

```java
/**
 * @program: influx-proxy 集群测试
 * @description: Influx-proxy 工具类
 * @author: Gao
 * @create: 2020-12-03 09:19:54
 */
public class InfluxDBProxyUtils {

    private String username;//用户名
    private String password;//密码
    private String openUrl;//url
    private String database;//数据库名
    private String retentionPolicy;
    private InfluxDB influxDB;

    //构造函数，初始化 Influx-proxy 的连接
    public InfluxDBProxyUtils(String username, String password, String openUrl, String database, String retentionPolicy) {
        this.username = username;
        this.password = password;
        this.openUrl = openUrl;
        this.database = database;
        this.retentionPolicy = retentionPolicy == null || retentionPolicy.equals("") ? "autogen" : retentionPolicy;
        //实际连接 Influx-proxy 操作
        influxDBBuild();
    }

    /**
     * @Author: Gao
     * @Description: 测试 InfluxDB 连接是否正常
     * @Date: 2020-12-03 09:30:54
     * @Param: []
     * @Return: String:连接与否提示
     **/
    public String ping() {
        String isConnected = "ping 方法检查结果：InfluxDB 数据库连接异常!";
        Pong pong;
        pong = influxDB.ping();
        try {
            if (pong != null) {
                isConnected = "ping 方法检查结果：InfluxDB 数据库连接成功!";
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return isConnected;
    }

    /**
     * @Author: Gao
     * @Description: 测试 InfluxDB-proxy 集群的健康性
     * @Date: 2020-12-03 09:39:54
     * @Param: url 服务器 Influx-proxy 地址和端口
     * @Param: username 服务器 Influx-proxy 用户名
     * @Param: password 服务器 Influx-proxy 密码
     * @Return: String:连接与否提示
     **/
    public String health(String url,String username,String password){
        RestTemplate restTemplate=new RestTemplate();
        ResponseEntity<String> forEntity = restTemplate.getForEntity(url+"health?u={1}&p={2}&pretty=true", String.class, username, password);
        String health = forEntity.getBody();
        System.out.println(health);
        String healthInfo = health.substring(1, health.length() - 2);
        return healthInfo;
    }

    /**
     * @Author: Gao
     * @Description: 查询数据库列表
     * @Date: 2021-12-03 10:30:54
     * @Param: []
     * @Return: List<String>:数据库列表
     **/
    @SuppressWarnings("deprecation")
    public List<String> showDBList() {
        List<String> dbList = influxDB.describeDatabases();
        //剔除 influxdb 自带的 _internal 数据库
        List<String> result = dbList;
        for (int i = 0; i < result.size(); i++) {
            if ("_internal".equals(result.get(i))){
                result.remove(i);
            }
        }
        return result;
    }

    /**
     * @Author: Gao
     * @Description: 创建一个数据库
     * @Date: 2021-12-03 10:33:50
     * @Param: [数据库名称]
     * @Return: void
     **/
    @SuppressWarnings("deprecation")
    public void createDB(String dbName) {
        influxDB.createDatabase(dbName);
    }

    /**
     * @Author: Gao
     * @Description: 删除一个数据库
     * @Date: 2021-12-03 10:38:20
     * @Param: [dbName]
     * @Return: void
     **/
    @SuppressWarnings("deprecation")
    public void deleteDB(String dbName) {
        influxDB.deleteDatabase(dbName);
    }

    /**
     * @Author: Gao
     * @Description: 创建数据库连接，加入该数据不存在就创建该数据库
     * @Date: 2021-12-03 09:03:02
     * @Param: []
     * @Return: org.influxdb.InfluxDB
     **/
    @SuppressWarnings("deprecation")
    public InfluxDB influxDBBuild() {
        if (influxDB == null) {
            influxDB = InfluxDBFactory.connect(openUrl, username, password);
        }
        try {
            if (!influxDB.databaseExists(database)) {
                influxDB.createDatabase(database);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            influxDB.setRetentionPolicy(retentionPolicy);
        }
        influxDB.setLogLevel(InfluxDB.LogLevel.NONE);
        return influxDB;
    }

    /**
     * @Author: Gao
     * @Description: 查询数据，并将查询的数据转成JSONArray的格式
     * @Date: 2021-12-03 11:03:02
     * @Param: [command]
     * @Return: JSONArray
     **/
    public JSONArray selectJsonData(String command) {
        JSONArray results = new JSONArray();
        try {
            QueryResult resultsInfluxDB = influxDB.query(new Query(command, database));
            for (QueryResult.Result result : resultsInfluxDB.getResults()) {
                for (QueryResult.Series series : result.getSeries()) {
                    for (int j = 0; j < series.getValues().size(); j++) {
                        JSONObject data=new JSONObject();
                        for (int i = 0; i <series.getValues().get(j).size(); i++) {
                            data.put(series.getColumns().get(i),series.getValues().get(j).get(i));
                        }
                        results.add(data);
                    }
                }
            }
        } catch (NullPointerException e) {
            System.out.println("查询返回值为空！");
        } catch (InfluxDBException e) {
            System.out.println("请检查查询语句的语法，语法出现问题！");
        }
        return results;
    }

    /**
     * @Author: Gao
     * @Description: 查询数据，并将查询的数据转成List<List<Object>>的格式
     * @Date: 2021-12-03 11:23:02
     * @Param: [command]
     * @Return: List<List<Object>>
     **/
    public List<List<Object>> selectListData(String command) {
        List<List<Object>> result = new ArrayList<>();
        try {
            QueryResult resultsInfluxDB = influxDB.query(new Query(command, database));
            List<QueryResult.Result> allList = resultsInfluxDB.getResults();
            for (QueryResult.Result result1 : allList) {
                for (QueryResult.Series series : result1.getSeries()) {
                    result =  series.getValues();
                }
            }
        }catch (NullPointerException e) {
            System.out.println("查询返回值为空！");
            return null;
        } catch (InfluxDBException e) {
            System.out.println("请检查查询语句的语法，语法出现问题！");
            return null;
        }
        return result;
    }


    /**
     * @Author: Gao
     * @Description: 插入一个数据
     * @Date: 2021-12-03 12:43:28
     * @Param: [measurement, tags, fields, time, timeUnit]
     * @Return: void
     * @注: time一般设成 0 ，表示当前时间，timeUnit 设成  TimeUnit.SECONDS
     **/
    public void insert(String measurement, Map<String, String> tags, Map<String, Object> fields, long time, TimeUnit timeUnit) {
        Builder builder = Point.measurement(measurement);
        builder.tag(tags);
        builder.fields(fields);
        if (0 != time) {
            builder.time(time, timeUnit);
        }
        influxDB.write(database, retentionPolicy, builder.build());
    }


    /**
     * @Author: Gao
     * @Description: 按照数据的时间去删除数据
     * @Date:  2021-12-03 13:03:50
     * @Param: [measurement, time]
     * @Return: void
     **/
    public void deleteDataByTime(String measurement,String time){
        String command = "delete from "+measurement+" where time='"+time+"'";
        QueryResult result = influxDB.query(new Query(command,database));
    }
}
```

### 测试类测试

> 插入数据批量测试，只能单独写在主程序内，目前原因不知！

1、基本测试

```java
@SpringBootTest
class InfluxProxyApplicationTests {

    private static String username = "test";
    private static String password = "123456";
    private static String openUrl = "http://8.142.92.222:7076/";
    private static String database = "testJavaDb01";
    private static InfluxDBProxyUtils influxdb = new InfluxDBProxyUtils(username,password,openUrl,database,"");

    public static void main(String[] args) {
        testProxyPing();
        testProxyHealth();
        //查询所有数据库
        List<String> dbList = influxdb.showDBList();
        System.out.println(dbList);
        //新建数据库
        influxdb.createDB("testJavaDb01");
        //插入数据
        testInsert();
        //查询数据
        testQuery();
    }

    //测试influx-proxy集群连通性
    public static void testProxyPing(){
        System.out.println(influxdb);
        System.out.println(influxdb.ping());
    }

    //测试influx-proxy集群健康性
    public static String testProxyHealth(){
        String healthInfo = influxdb.health(openUrl, username, password);
        return healthInfo;
    }
    //插入数据
    public static void testInsert(){
        Map<String,String> tags = new HashMap<>();
        Map<String,Object> fields = new HashMap<>();
        tags.put("sensor_id","FSFX111000");
        fields.put("value1",10.10);
        fields.put("value2",30.20);
        fields.put("value3",40.40);
        influxdb.insert("javaMeas",tags,fields,0, TimeUnit.SECONDS);
    }

    //查询数据
    public static void testQuery(){
        String command = "select * from javaMeas";
        JSONArray result = influxdb.selectJsonData(command);
        List<List<Object>> data = influxdb.selectListData(command);
        System.out.println(result);
        System.out.println(data);
    }
}
```

2、数据批量插入测试（`进程休眠必须`）

```java
@SpringBootTest
public class InsertDataTest {
    private static String username = "test";
    private static String password = "123456";
    private static String openUrl = "http://8.142.92.222:7076/";
    private static String database = "batchDb01";
    private static InfluxDBProxyUtils influxdb = new InfluxDBProxyUtils(username,password,openUrl,database,"");
    public static void main(String[] args) throws InterruptedException {
        for (int i = 1; i < 5; i++) {
            Map<String,String> tags = new HashMap<>();
            Map<String,Object> fields = new HashMap<>();
            tags.put("host","YB001");
            fields.put("value1",i * 8.8);
            fields.put("value2",i * 0.8);
            fields.put("value3",i * 88);
            influxdb.insert("batchMeasurement03",tags,fields,0, TimeUnit.SECONDS);
            //休眠1s，防止写入失败
            Thread.sleep(1000);
        }
    }
}
```
