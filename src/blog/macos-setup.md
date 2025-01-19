---
title: "我的 MacOS 配置"
description: "MacOS ｜ Setup ｜ 配置"
date: 2025-01-17
---

## 系统设置

在终端运行以下命令：
```bash
# dock栏设置
defaults write com.apple.dock autohide -bool false
defaults write com.apple.dock autohide-delay -bool false
defaults write com.apple.dock autohide-time-modifier -bool false
defaults write com.apple.dock largesize -int 82
defaults write com.apple.dock magnification -bool true
defaults write com.apple.dock dock-extra -bool false
defaults write com.apple.dock file-label -string "\\U7cfb\\U7edf\\U8bbe\\U7f6e"
defaults write com.apple.dock tile-type -string "file-tile"
defaults write com.apple.dock show-process-indicators -bool true
defaults write com.apple.dock show-recents -bool false
defaults write com.apple.dock tilesize -int 29
defaults write com.apple.dock version -bool true
defaults write com.apple.dock wvous-br-corner -int 14

# 键盘速率设置
defaults write -g InitialKeyRepeat -int 15
defaults write -g KeyRepeat -int 1

# 触控板设置
defaults write -g com.apple.trackpad.scaling -float 2.5
defaults write com.apple.AppleMultitouchTrackpad Clicking -bool true

defaults write com.apple.AppleMultitouchTrackpad TrackpadThreeFingerDrag -bool true
defaults write -g com.apple.trackpad.scrolling -float 0.3125

# Disable quarantine for downloaded apps
defaults write com.apple.LaunchServices LSQuarantine -bool false

# Safari 配置 来自 https://sxyz.blog/macos-setup/
# For better privacy
defaults write com.apple.Safari UniversalSearchEnabled -bool false
defaults write com.apple.Safari SuppressSearchSuggestions -bool true
defaults write com.apple.Safari SendDoNotTrackHTTPHeader -bool true

# Disable auto open downloads
defaults write com.apple.Safari AutoOpenSafeDownloads -bool false

# Enable Develop Menu, Web Inspector
defaults write com.apple.Safari IncludeDevelopMenu -bool true
defaults write com.apple.Safari IncludeInternalDebugMenu -bool true
defaults write com.apple.Safari WebKitDeveloperExtras -bool true
defaults write com.apple.Safari WebKitDeveloperExtrasEnabledPreferenceKey -bool true
defaults write com.apple.Safari "com.apple.Safari.ContentPageGroupIdentifier.WebKit2DeveloperExtrasEnabled" -bool true
```
> [!TIP]
> 执行完记得注销重新登录

## 软件安装

由于国内环境，首先需要安装代理软件，这里使用 `Quantumult X` 作为代理软件。导入订阅，我使用的是[白月光](https://www.bygcloud.com/dashboard)，不过它最近有点不稳定，我也不知道是我电脑问题还是什么，时不时会断流。

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

安装完成后，先安装下面的软件。

```bash
tap "homebrew/bundle"
tap "mihomo-party-org/mihomo-party"
brew "bat"
brew "eza"
brew "fastfetch"
brew "fnm"
brew "mysql"
brew "php"
brew "pnpm"
brew "smartmontools"
brew "tmux"
brew "zoxide"
brew "zsh-autosuggestions"
brew "zsh-syntax-highlighting"
cask "arc"
cask "cursor"
cask "dingtalk"
cask "finalshell"
cask "ghostty"
cask "iina"
cask "itsycal"
cask "jordanbaird-ice"
cask "karabiner-elements"
cask "keka"
cask "logseq"
cask "monitorcontrol"
cask "raycast"
cask "snipaste"
cask "wechat"
cask "wetype"
cask "wezterm"
cask "zen-browser"
cask "stats"
cask "neteasemusic"
cask "cursor"
cask "logi-options+"
cask "appcleaner"
```

额外需要安装的软件：

```bash
# 来自 app store
AdBlocker
Immersive Translate
Clicknow: https://clicknow.ai
```

## 终端等配置

1. 拷贝[线上配置目录](https://github.com/abeixiaolu/.config)到本地。
2. 安装 [starship](https://starship.rs/): `curl -sS https://starship.rs/install.sh | sh`
3. zsh 配置
    ```bash
    eval "$(starship init zsh)"
    eval "$(zoxide init zsh)"

    export WEZTERM_CONFIG_DIR="$HOME/.config/wezterm"
    export BAT_THEME="Dracula"

    # history setup
    HISTFILE=$HOME/.zhistory
    SAVEHIST=1000
    HISTSIZE=999
    setopt share_history
    setopt hist_expire_dups_first

    # autosuggestions and syntax highlighting
    source $(brew --prefix)/share/zsh-autosuggestions/zsh-autosuggestions.zsh
    source $(brew --prefix)/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

    # fnm
    eval "$(fnm env --use-on-cd --shell zsh)"

    # pnpm
    export PNPM_HOME="/Users/abei/Library/pnpm"
    case ":$PATH:" in
      *":$PNPM_HOME:"*) ;;
      *) export PATH="$PNPM_HOME:$PATH" ;;
    esac
    # pnpm end

    alias bz="rm -rf dist && rm -rf dist.zip && nr build:test && zip -r dist.zip dist"
    alias cat="bat"
    alias c="cursor"
    alias ws="cd ~/Documents/workspace"
    alias ss="cd ~/Documents/studyspace"
    alias d="nr dev"
    alias dt="nr dev:test"
    alias b="nr build"
    alias gaa="git add ."
    alias gcvm="git commit --no-verify -m"
    alias gcm="git commit -m"
    alias gpl="git pull"
    alias gps="git push"
    alias gco="git checkout"
    alias gcb="git checkout -b"
    alias gst="git status"
    alias ls="eza --icons=always --long --all"
    alias cd="z"
    ```
4. fnm 安装 node
    ```bash
    fnm install --lts
    fnm default 22
    ```
5. git 配置
    ```bash
    git config --global user.name "abei"
    git config --global user.email "abeixiaolu@gmail.com"
    git config --global core.ignorecase false
    git config --global includeIf.gitdir:/Users/abei/Documents/workspace/.path /Users/abei/Documents/workspace/.gitconfig
    ```
    - `mkdir -p ~/Documents/workspace`
    - `mkdir -p ~/Documents/studyspace`
    - `vim ~/Documents/workspace/.gitconfig`
        ```
        [user]
          name = shenmengping
          email = shenmengping@gupo.onaliyun.com
        ```
6. 从 iCloud 上恢复一些必要文件例如 `.ssh, .logseq` 目录。

## 其它

禁用 macOS 默认输入法，仅采用微信输入法。可以参考这篇文章：[macOS 禁用自带的 ABC 输入法](https://rokcso.com/p/macos-remove-abc/)。

遇到软件提示已损坏，先打开允许任何来源：
```bash
sudo spctl --master-disable
```
然后针对这个软件运行：
```bash
# 地址可以从访达中拖入终端
xattr -cr /Applications/WeChat.app
```
如果仍然打不开，则需要打开**系统设置 – 隐私和安全性，“安全性” 下面出现提示，点击 “仍要打开”**，当然该操作仅需要一次，以后可以正常打开。
