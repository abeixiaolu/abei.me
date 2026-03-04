---
title: "Mac mini 自建 Vaultwarden"
description: "不用路由器端口映射，手机直接访问 vault.abei.me，记录完整搭建与安全加固过程。"
date: 2026-03-04
---

这次做自建密码库，我给自己定了三个要求：

- 家庭网络不开放公网端口
- 手机随时可访问
- 配置后续容易维护

最后选了这条路径：Mac mini + Vaultwarden + Cloudflare Tunnel + `vault.abei.me`。

架构很直接：

- Vaultwarden 仅监听本机 `127.0.0.1:8222`
- Cloudflare Tunnel 负责把 `vault.abei.me` 转到本机服务
- 外部流量先到 Cloudflare，不直接触达家里路由器

> [!TIP]
> 这样做之后，不需要在路由器上折腾端口映射，也不依赖固定公网 IP。

## 先说几个关键名词

## ADMIN_TOKEN

这是 Vaultwarden 管理后台 `/admin` 的访问密钥。

- 不是日常登录密码库用的主密码
- 用于服务级管理
- 泄露后风险高，建议马上存进密码库

生成方式：

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

## tunnel id

执行下面命令后，Cloudflare 会返回一个 UUID：

```bash
cloudflared tunnel create vaultwarden-abei
```

类似这样：

`d4e3af3d-3490-4529-93d0-5f6ab9be0aba`

这串 UUID 就是 tunnel id。  
后面的 config、DNS 绑定、隧道启动都要用它。

## credentials-file

路径一般是：

`~/.cloudflared/<tunnel-id>.json`

这个文件是隧道认证凭证。没有它，隧道无法连接 Cloudflare。

> [!IMPORTANT]
> 这个 JSON 文件不要外传，也不要进 git。  
> 一旦泄露，别人就可能接管你的隧道。

## 部署步骤

## 准备容器环境

如果你已经在用 OrbStack，直接走 OrbStack 的 Docker。  
没有的话，也可以用 Colima：

```bash
brew install docker docker-compose colima
colima start --cpu 2 --memory 4 --disk 40
```

## 启动 Vaultwarden

`docker-compose.yml`：

```yaml
services:
  vaultwarden:
    image: vaultwarden/server:latest
    restart: unless-stopped
    environment:
      DOMAIN: https://vault.abei.me
      SIGNUPS_ALLOWED: "false"
      INVITATIONS_ALLOWED: "false"
      WEBSOCKET_ENABLED: "true"
      ADMIN_TOKEN: ${VW_ADMIN_TOKEN}
    volumes:
      - ./data:/data
    ports:
      - "127.0.0.1:8222:80"
```

`.env`：

```env
VW_ADMIN_TOKEN=你生成的随机字符串
```

启动：

```bash
docker compose up -d
```

本机检查：

```bash
curl -I http://127.0.0.1:8222
```

## 配置 Cloudflare Tunnel

安装并登录授权：

```bash
brew install cloudflared
cloudflared tunnel login
cloudflared tunnel create vaultwarden-abei
```

然后写 `~/.cloudflared/config.yml`：

```yaml
tunnel: <你的 tunnel id>
credentials-file: /Users/<user>/.cloudflared/<tunnel-id>.json
ingress:
  - hostname: vault.abei.me
    service: http://127.0.0.1:8222
  - service: http_status:404
```

绑定 DNS：

```bash
cloudflared tunnel route dns <tunnel-id> vault.abei.me
```

启动隧道：

```bash
cloudflared tunnel run <tunnel-id>
```

验证访问：

```bash
curl -I https://vault.abei.me
```

返回 `HTTP 200` 就可以正常访问。

## 我遇到的几个问题

1. **只有登录页，没有注册入口**  
   通常是 `SIGNUPS_ALLOWED=false`。首次部署可临时打开注册，创建首个账号后立即关闭。

2. **Invalid master password**  
   常见原因：没注册就登录、邮箱输错、访问了错误地址。

3. **隧道进程在运行，但域名 530/502**  
   先看 tunnel 状态，再看本机 `127.0.0.1:8222` 是否可访问。

## 安全加固清单

- 关闭公开注册 `SIGNUPS_ALLOWED=false`
- 管理员账号开启 2FA
- 定期备份 `./data`
- `ADMIN_TOKEN` 与隧道凭证放入密码库
- 增加 Cloudflare Access 邮箱白名单

## 备选方案

## 用 OpenClaw 自动化完成部署

如果不想手动走完整流程，可以让 OpenClaw 代执行，你只负责授权和关键确认。

可直接给 OpenClaw 这段指令：

```text
帮我在本机用 OrbStack + Cloudflare Tunnel 部署 Vaultwarden，
域名用 vault.abei.me。
要求：
1) Vaultwarden 仅监听 127.0.0.1:8222
2) 自动生成强 ADMIN_TOKEN 并写入 .env
3) cloudflared 完成 tunnel create、route dns、run
4) 验证 https://vault.abei.me 返回 200
5) 关闭公开注册并输出备份脚本
```

这套方案对个人用户很友好：暴露面小，维护压力也低。  
如果你想长期稳定地用自建密码库，这条路径可以直接照着做。
