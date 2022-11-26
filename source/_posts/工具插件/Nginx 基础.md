---
title: Nginx 使用初探
date: 2022-05-20 00:00:00
type:
comments:
tags: 
  - Nginx
  - 负载均衡组件
categories: 
  - 工具插件
description: 
keywords: Nginx
cover: https://w.wallhaven.cc/full/1k/wallhaven-1k7ox3.jpg
top_img: https://w.wallhaven.cc/full/1k/wallhaven-1k7ox3.jpg
---

​		Nginx 是一款高性能的 web 和反向代理服务器，也是一个 `IMAP/POP2/STMP` 代理服务器（邮件）。在高连接并发的情况下，Nginx 是Apache服务器不错的替代品，其主要作用可以归纳为：`反向代理`、`负载均衡`、`动静结合`。

## Nginx 作用

1、反向代理

正向代理，例如 VPN，代理的是客户端：

![在这里插入图片描述](https://img-blog.csdnimg.cn/849dca40b61b491d99bbd5b4885788ff.png)

反向代理，代理的是服务器。

![在这里插入图片描述](https://img-blog.csdnimg.cn/1daa7613260244779f4c5f198cbac47f.png)

2、 负载均衡

​		Nginx 提供的负载均衡策略有两种：

1）内置策略：轮询、加权轮询、IPHash（主要是将固定 ip 的访问分配到固定的服务器上，一般不用）

2）扩展策略



3、动静分离

静态资源服务器，静态资源直接从 nginx 返回，不需要从项目里面请求，提高响应速度。

## Nginx 安装

​		windows 安装直接从官网下载解压即可使用：`http://nginx.org/en/download.html`

​		linux 安装查看 linux 笔记。

## Nginx 常用命令

```shell
cd /usr/local/nginx/sbin/
./nginx  # 启动
./nginx -s stop  # 停止
./nginx -s quit  # 安全退出
./nginx -s reload  # 重新加载配置文件（经常使用）
ps aux|grep nginx  # 查看 nginx 进程
```

## 具体操作

​		以 window 环境下的 nginx 为例：

​		`需求`：现在有一个项目 jar 包，那么如何让它在本地运行两个服务8080、8081，同时使用 nginx 使访问 80 端口就会被转发到其中的某一个，同时还能实现负载均衡呢？

1、先运行 jar 包：`example.jar`，使其运行于 8080 和 8081端口：

```shell
java -jar example.jar --server.port=8080
java -jar example.jar --server.port=8081
```

2、修改 nginx 的配置文件，使请求转发：

```shell
# 全局配置;
worker_processes  1;
# 
events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
   
    keepalive_timeout  65;

   # 增加负载均衡的配置，给下面的请求转发使用
   upstream kuangstydy {
         # 服务器资源，例如此处配置两个服务，同时设置权重
         server 127.0.0.1:8080 weight=1;
         server 127.0.0.1:8081 weight=1;
   }

    # server 配置（负载均衡和反向代理）
    server {
        # 监听 80 端口，访问请求都会被此处拦截
        listen       80;
        server_name  localhost;
      
        # 访问 80 的根目录，就会走这个里面的请求
        location / {
            root   html;
            index  index.html index.htm;
            # 此处进行具体的代理配置，此处对应上面的 upstream 设置
            proxy_pass http://kungstudy;
        }
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
	   # ......
    }

    # another virtual host using mix of IP-, name-, and port-based configuration
    #
    #server {
    #    listen       8000;
    #    listen       somename:8080;
    #    server_name  somename  alias  another.alias;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}


    # HTTPS server
    #
    #server {
    #    listen       443 ssl;
    #    server_name  localhost;

    #    ssl_certificate      cert.pem;
    #    ssl_certificate_key  cert.key;

    #    ssl_session_cache    shared:SSL:1m;
    #    ssl_session_timeout  5m;

    #    ssl_ciphers  HIGH:!aNULL:!MD5;
    #    ssl_prefer_server_ciphers  on;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}
}
```

这样就达到了只需要访问 80 端口，就可以转发到不同的端口上 8080、8081。

​		`拓展`：当将 nginx 部署于某个服务器上时，将其每个服务配置在不同的服务器上，通过 nginx 设置权重：对性能好的服务器设置大权重，性能差的设置小权重，通过`统一访问 nginx 的地址 80 `，就可以实现用户在无感知的情况下被转发到具体的服务器的具体服务上。
