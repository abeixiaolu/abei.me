---
title: "在 Mac mini 上用 Cloudflare Tunnel 部署 Vaultwarden（无公网端口）"
description: "记录一次从 0 到 1 的自建密码管理服务部署：Docker + Vaultwarden + Cloudflare Tunnel。"
date: 2026-03-04
---

最近把密码服务从“想法”落到了“可用”，目标很明确：

- 不折腾路由器端口转发
- 手机不用开 VPN 也能访问
- 尽量减少暴露面

最终方案：**Mac mini + Vaultwarden + Cloudflare Tunnel + 自有域名 `vault.abei.me`**。

## 为什么选 Vaultwarden + Tunnel

官方 Bitwarden 自建方案偏重，个人场景下 Vaultwarden 更轻量。  
Cloudflare Tunnel 的好处是：

1. 不需要固定公网 IP
2. 不需要开放 80/443 到家庭网络
3. 直接走 `https://vault.abei.me`

## 最终架构

- Vaultwarden 容器只监听本机：`127.0.0.1:8222`
- Cloudflared 将 `vault.abei.me` 反代到 `http://127.0.0.1:8222`
- 外部只看见 Cloudflare，不直接碰到家里网络入口

## 关键步骤

## 1）准备 Docker 运行时

我这台是 macOS，使用 Homebrew 安装 CLI + Colima：

```bash
brew install docker docker-compose colima
colima start --cpu 2 --memory 4 --disk 40
```

## 2）部署 Vaultwarden

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

启动：

```bash
docker compose up -d
```

## 3）Cloudflare Tunnel 绑定域名

```bash
brew install cloudflared
cloudflared tunnel login
cloudflared tunnel create vaultwarden-abei
```

配置 `~/.cloudflared/config.yml`：

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

## 4）验证

```bash
curl -I https://vault.abei.me
```

返回 `HTTP/2 200` 即表示链路通了。

## 踩坑记录

1. **先关注册会导致只有登录入口**  
   初次部署可短暂打开注册，创建第一个账号后马上关回去。

2. **A 股之外，T+1 是交易规则；密码服务这边没有“后悔按钮”**  
   Vaultwarden 的主密码忘了没法帮你恢复明文，只能重置账户。一定要备份应急方案。

3. **Cloudflare Access 会提示创建团队**  
   这不是收费墙，免费版可用。后续建议加上邮箱白名单作为前置验证。

## 安全收口建议（强烈建议）

- `SIGNUPS_ALLOWED=false`（关闭公开注册）
- 开启 2FA（TOTP）
- 定期备份 `./data` 目录
- 管理后台 token 放进密码管理器，不要明文散落
- 后续补上 Cloudflare Access（仅允许自己的邮箱）

## 结语

这套方案的核心不是“最炫”，而是“够稳、够省心、可长期维护”。  
如果你和我一样，不想折腾家用网络映射，又希望自建密码服务可公网访问，这条路值得直接抄。
