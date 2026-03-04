---
title: "在 Mac mini 上自建 Vaultwarden：Cloudflare Tunnel 零端口暴露实战"
description: "不折腾路由器端口转发，手机也不用开 VPN，直接用 vault.abei.me 安全访问自建密码库。"
date: 2026-03-04
---

你可能也有这个烦恼：  
想自建密码服务，但一想到“公网端口、路由器、动态IP、手机VPN”，头就大了。

我这次的目标很简单：

- 不开家庭公网端口
- 手机直接访问（不用额外开 VPN）
- 先跑通，再安全收口

最后落地方案是：**Mac mini + Vaultwarden + Cloudflare Tunnel + 自有域名 `vault.abei.me`**。

## 先讲结论：这套方案到底在做什么？

本质上是三层：

1. **Vaultwarden 只在本机监听**  
   它只开 `127.0.0.1:8222`，意思是“只让本机访问”，不给局域网更不给公网直接打。

2. **Cloudflare Tunnel 做中间桥**  
   它把公网的 `vault.abei.me` 请求，安全转发到本机 `127.0.0.1:8222`。

3. **外部看不到你家入口**  
   没有路由器端口映射，别人扫不到你家 80/443 开放服务。

一句话：**把“暴露家庭网络”改成“暴露 Cloudflare 入口”**。

## 关键名词先讲透（很重要）

### `ADMIN_TOKEN` 是什么？从哪来？

它是 Vaultwarden 管理后台（`/admin`）的“超级钥匙”。
不是登录你密码库的主密码，而是“服务运维权限”。

- **来源**：你自己生成（随机长字符串）
- **作用**：进入管理后台配置服务
- **风险**：泄露后，别人能进你的管理后台
- **建议**：放进你自己的密码库，不要写到博客截图里

生成示例：

```bash
python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(48))
PY
```

### `tunnel id` 是什么？从哪来？

`cloudflared tunnel create xxx` 后，Cloudflare 会给你一个唯一 ID，类似：

`d4e3af3d-3490-4529-93d0-5f6ab9be0aba`

这就是 **tunnel id**，相当于这条隧道的身份证。

- **来源**：`cloudflared tunnel create` 自动生成
- **用途**：写入 config、绑定 DNS、运行 tunnel
- **关联文件**：`~/.cloudflared/<tunnel-id>.json`（凭证文件，必须保密）

### `credentials-file` 是什么？

就是 cloudflared 连接 Cloudflare 账户时用的本地凭证路径。  
没有它，隧道跑不起来。

## 手工部署（可复制）

### Step 1：准备容器环境（macOS）

```bash
brew install docker docker-compose colima
colima start --cpu 2 --memory 4 --disk 40
```

> 如果你已经用 OrbStack，就不用 Colima，直接用 OrbStack 的 Docker 即可。

### Step 2：部署 Vaultwarden

目录示例：`~/services/vaultwarden`

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
VW_ADMIN_TOKEN=你生成的超长随机字符串
```

启动：

```bash
docker compose up -d
```

### Step 3：安装并授权 Cloudflare Tunnel

```bash
brew install cloudflared
cloudflared tunnel login
cloudflared tunnel create vaultwarden-abei
```

### Step 4：配置隧道

`~/.cloudflared/config.yml`：

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

运行隧道：

```bash
cloudflared tunnel run <tunnel-id>
```

验证：

```bash
curl -I https://vault.abei.me
```

看到 `HTTP 200` 就通了。

## 常见坑（我踩过的版本）

1. **只有登录没有注册**：因为 `SIGNUPS_ALLOWED=false`，初次部署可短暂打开注册，创建首个账号后立刻关回去。  
2. **Invalid master password**：常见是没注册先登录、邮箱输错、连错服务器地址。  
3. **cloudflared 在跑但 530/502**：先查 tunnel 在线状态，再查本机 `127.0.0.1:8222` 是否可访问。

## 安全收口（一定做）

- 关闭公开注册：`SIGNUPS_ALLOWED=false`
- 开启 2FA（TOTP）
- 定期备份 `./data` 目录
- 保护好 `ADMIN_TOKEN` 与 tunnel 凭证 JSON
- 后续补上 Cloudflare Access（邮箱白名单）

## 备选方案：如何用 OpenClaw 自动化搭建

不想一条条敲命令，可以让 OpenClaw 代跑，自己只做关键确认。

### 自动化目标

1. 自动检查环境（OrbStack/Docker、cloudflared、域名）
2. 自动生成 `docker-compose.yml` + `.env`
3. 自动拉起 Vaultwarden 并健康检查
4. 引导完成 `cloudflared tunnel login` 网页授权
5. 自动创建 tunnel、route dns、run
6. 自动安全收口（关注册、输出备份脚本）

### 可直接给 OpenClaw 的指令

```text
帮我在本机用 OrbStack + Cloudflare Tunnel 部署 Vaultwarden，
域名用 vault.abei.me。
要求：
1) Vaultwarden 仅监听 127.0.0.1:8222
2) 自动生成强 ADMIN_TOKEN 并写入 .env
3) cloudflared 完成 tunnel create、route dns、run
4) 验证 https://vault.abei.me 返回 200
5) 默认关闭注册并输出备份脚本
```

## 结语

这套方案不算最花哨，但对个人用户来说非常实用：
**暴露面小、维护成本低、可长期稳定使用。**

如果你和我一样，不想折腾路由器映射，又想在手机上随时访问自建密码库，这条路值得直接抄。
