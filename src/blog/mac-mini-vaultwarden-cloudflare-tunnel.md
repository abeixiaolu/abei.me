---
title: "在 Mac mini 上自建 Vaultwarden：Cloudflare Tunnel 零端口暴露实战"
description: "不折腾路由器端口转发，手机也不用开 VPN，直接用 vault.abei.me 安全访问自建密码库。"
date: 2026-03-04
---

你可能也遇到过这个场景：

想自建密码库，但一想到公网端口、路由器转发、动态 IP、手机还要开 VPN，瞬间就不想弄了。

我这次的目标很朴素：

- 不开家庭公网端口
- 手机直接可用
- 先跑通，再收口

最后方案是：**Mac mini + Vaultwarden + Cloudflare Tunnel + `vault.abei.me`**。

## 一句话理解这套架构

- Vaultwarden 只监听本机：`127.0.0.1:8222`
- Cloudflare Tunnel 把 `vault.abei.me` 转发到本机这个端口
- 外部访问的是 Cloudflare，不是你家路由器

> [!TIP]
> 这套方案最省心的点：不需要做端口映射，也不依赖固定公网 IP。

## 先把 3 个关键名词说清楚

### 1) ADMIN_TOKEN 是什么？

它是 Vaultwarden 管理后台（`/admin`）的访问密钥。

- **它不是** 你登录密码库的主密码
- **它是** 运维入口的超级钥匙
- 泄露后风险很高，必须放密码管理器里

生成方式：

```bash
python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(48))
PY
```

### 2) tunnel id 从哪来？

执行 `cloudflared tunnel create vaultwarden-abei` 后，Cloudflare 会返回一个 UUID，比如：

`d4e3af3d-3490-4529-93d0-5f6ab9be0aba`

这就是 tunnel id，后面配置和启动都要用它。

### 3) credentials-file 是什么？

`~/.cloudflared/<tunnel-id>.json` 这个文件就是隧道凭证。

> [!IMPORTANT]
> 这个 JSON 文件别外传、别提交到 git。它泄露等于隧道控制权泄露。

## 手工部署（macOS）

## Step 1：准备容器环境

如果你用 OrbStack，直接用它的 Docker 就行。  
如果没有，可用 Colima：

```bash
brew install docker docker-compose colima
colima start --cpu 2 --memory 4 --disk 40
```

## Step 2：启动 Vaultwarden

`docker-compose.yml`（核心配置）：

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

`.env`:

```env
VW_ADMIN_TOKEN=你刚生成的随机字符串
```

启动：

```bash
docker compose up -d
```

本机检查：

```bash
curl -I http://127.0.0.1:8222
```

## Step 3：配置 Cloudflare Tunnel

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

运行隧道：

```bash
cloudflared tunnel run <tunnel-id>
```

验证：

```bash
curl -I https://vault.abei.me
```

看到 `HTTP 200` 就是通了。

## 我踩过的坑（你可以直接避开）

1. **只看到登录页，看不到注册**  
   多半是 `SIGNUPS_ALLOWED=false`。首次可临时打开注册，建完首个账号立刻关回去。

2. **Invalid master password**  
   常见是没注册先登录、邮箱输错、或者连到了别的服务地址。

3. **隧道进程在跑，但域名 530/502**  
   先查 tunnel 状态，再查本机 `127.0.0.1:8222` 是否可达。

## 安全收口（上线当天就做）

- 关闭公开注册（`SIGNUPS_ALLOWED=false`）
- 管理员账号开启 2FA（TOTP）
- 定期备份 `./data`
- `ADMIN_TOKEN` 和 tunnel 凭证 JSON 放进密码库
- 有空再加 Cloudflare Access（邮箱白名单）

## 备选方案：用 OpenClaw 自动化搭建

如果你不想手敲全流程，可以让 OpenClaw 代跑，自己只负责授权和确认。

你可以直接给 OpenClaw 这段指令：

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

## 最后

这套方案不是最花哨，但对个人用户特别友好：
**暴露面小、维护简单、手机直接能用。**

如果你只是想稳稳地把密码库跑起来，这条路径基本可以直接抄作业。
