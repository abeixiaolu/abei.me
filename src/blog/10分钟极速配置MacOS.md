---
title: 10分钟极速配置MacOS
description: MacOS ｜ Setup ｜ 配置
date: 2025-10-30
---

## 前言

> [!TIP] 提示
> 首先声明，我是一个前端程序员噢，装的软件也倾向于前端开发，重点是一个配置的思路。

作为一名程序员，拥有一台高效配置的MacOS设备是提升工作效率的关键。本文将指导你在10分钟内完成MacOS的极速配置，让你的开发环境焕然一新。特别是入职新公司时，快速配置一台Mac尤为重要。

## 系统设置

首先第一步，先粘贴下面的系统设置相关的命令到终端（Terminal）中执行，可以按照自己的使用习惯调整。我还会在状态栏仅显示时钟图标：系统设置->控制中心->时钟->样式->指针。

```bash
# 开启自动隐藏
defaults write com.apple.dock autohide -bool true
# 取消自动隐藏延迟
defaults write com.apple.dock autohide-delay -bool false
# 取消自动隐藏动画
defaults write com.apple.dock autohide-time-modifier -bool false
# 图标放大大小
defaults write com.apple.dock largesize -int 82
# 图标大小
defaults write com.apple.dock tilesize -int 29
# 开启图标放大
defaults write com.apple.dock magnification -bool true
# 禁用 Dock 中的额外项（比如 Recents 或特定的文件
defaults write com.apple.dock dock-extra -bool false
# 显示 Dock 中正在运行进程的指示器
defaults write com.apple.dock show-process-indicators -bool true
# 禁用 Dock 中最近使用的应用和文档
defaults write com.apple.dock show-recents -bool false
# 键盘速率设置
defaults write -g InitialKeyRepeat -int 15
defaults write -g KeyRepeat -int 1
# 设置触控板的指针速度为 2.5
defaults write -g com.apple.trackpad.scaling -float 2.5
# 启用触控板的单击功能
defaults write com.apple.AppleMultitouchTrackpad Clicking -bool true
# 启用触控板的三指拖动功能
defaults write com.apple.AppleMultitouchTrackpad TrackpadThreeFingerDrag -bool true
# 设置触控板滚动速度为 0.3125（默认为 1.0）
defaults write -g com.apple.trackpad.scrolling -float 0.3125
```

结束后，记得注销登录后重进系统。

## 代理配置

我习惯使用的是`Quantumult X`，规则使用[墨鱼规则](https://github.com/ddgksf2013)，有用到的给大佬点点star和follow吧！配置好后就可以开始下一步了。机场我用的是[可乐云](https://cokeyun.buyzur.com/#/register?code=uZU2oAwj)，便宜量大。

## Homebrew以及常用软件安装

1. 安装Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. 安装常用软件

```bash
# 命令行软件
brew install git bat eza fnm pnpm zoxide zsh-autosuggestions zsh-syntax-highlighting stow starship
# GUI软件
brew install --cask appcleaner visual-studio-code raycast ghostty cursor iina pixpin google-chrome wechat orbstack
# 状态栏日期时间软件
brew tap pakerwreah/calendr
brew install --cask calendr
```

3. ssh key生成与配置

```bash
# 生成ssh key
ssh-keygen -t ed25519 -C "xiaoluabei@gmail.com"
# 复制ssh public key到剪贴板
pbcopy < ~/.ssh/id_ed25519.pub
```

## 使用stow来管理你的配置文件

如果你还没用过，强烈建议看这个教程：[How To Easily Manage Your Dotfiles With GNU Stow](https://www.youtube.com/watch?v=06x3ZhwrrwA)。
我已经配置过了，对应的配置在我的[dotfiles仓库](https://github.com/abeixiaolu/dotfiles)，可以直接克隆下来使用。

```bash
cd ~

git clone git@github.com:abeixiaolu/dotfiles.git

cd dotfiles

stow .
```

然后重启终端，打开ghostty，大功告成！
![Beautiful Terminal](/imgs/my-terminal.png)

## Raycast配置

免费版的Raycast已经足够好用了，我一般会进行如下设置：

- 快捷键设置为`command + space`，你需要提前在系统设置->键盘->快捷键->聚焦中取消掉Spotlight的快捷键。
- 进入设置，在Advanced面板中开启Hyper Key。然后使用Hyper Key来作为快速切换键用于切换软件、窗口管理等。
- 其它我基本没有做什么设置了，常用的功能有计算器、Quicklinks、剪贴板历史、窗口管理等。
  ![Raycast Settings](/imgs/raycast-settings.png)

## 输入法配置

我使用的是微信输入法，配置如下：

1. 下载并安装微信输入法：[微信输入法下载地址](https://ime.weixin.qq.com/)，按指引设置即可。
2. 我会用PlistEdit Pro来移除掉默认的ABC输入法，开启微信输入法的shift切换中英文功能。
   1. `sudo open ~/Library/Preferences/com.apple.HIToolbox.plist`
   2. 在 `AppleEnabledInputSources` 项中找到包含 ABC 的组，右键删除并 `Ctrl + s` 保存。
3. 重启MacOS。

## 开发配置

我使用的是vscode，所以我的配置都使用它的自动同步，很好用。同步完成后，cursor自动导入vscode配置即可。另外我的node版本管理使用fnm，安装好后执行：

```bash
fnm install --lts
fnm default [lts版本号]
```

然后我全局的npm包使用pnpm安装，我全局只用这个包：

```bash
pnpm i -g @antfu/ni
```

至此，10分钟极速配置MacOS完成！希望这篇文章能帮助你快速搭建一个高效的开发环境。祝大家工作顺利，愉快coding！

## 额外的个人向操作

1. 工作相关文件夹：`mkdir -p ~/Documents/workspace`，及其git配置：`vim ~/Documents/workspace/.gitconfig`。

```bash
[user]
  name = shenmengping
  email = shenmengping@xxx.com
```

2. 个人文件夹：`mkdir -p ~/Documents/ispace`。
3. 遇到软件提示已损坏（破解软件），我现在基本都付费或者开源代替了😅：`sudo spctl --master-disable`。
4. Homebrew更新和清理：`brew update && brew upgrade && brew cleanup`。
5. 当系统某些文件的图标被 webstorm、cursor 等软件修改时，你卸载了这个软件，但是文件图标仍然是该软件，则可以运行以下命令进行恢复：

```bash
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill
```
