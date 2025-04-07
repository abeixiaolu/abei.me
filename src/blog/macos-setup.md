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
>
> 备份时需要递归删除某个目录下的所有`node_modules`目录，记录一下命令：
> ```bash
> find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
> ```

## 软件安装

由于国内环境，首先需要安装代理软件，这里使用 ~~`Quantumult X`~~ 作为代理软件（改投 [`Clash Verge`](https://www.clashverge.dev/install.html) 了）。导入订阅，我使用的是[白月光](https://www.bygcloud.com/dashboard)，不过它最近有点不稳定，我也不知道是我电脑问题还是什么，时不时会断流。

安装 `Homebrew`：

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
brew "pnpm"
brew "zoxide"
brew "zsh-autosuggestions"
brew "zsh-syntax-highlighting"
brew "yt-dlp"
cask "cursor"
cask "dingtalk"
cask "finalshell"
cask "ghostty"
cask "edge"
cask "iina"
cask "itsycal"
cask "jordanbaird-ice"
cask "keka"
cask "monitorcontrol"
cask "neteasemusic"
cask "orbstack"
cask "raycast"
cask "snipaste"
cask "wechat"
cask "wetype"
cask "stats"
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
Accents
Pixpin
```

## 终端工具配置

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
    alias i="cd ~/Documents/studyspace/i"
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
        ```bash
        [user]
          name = shenmengping
          email = shenmengping@gupo.onaliyun.com
        ```
6. 从 iCloud 上恢复一些必要文件例如 `.ssh, .logseq` 目录。记得要修改目录和文件的权限。
    ```bash
    chmod 700 ~/.ssh
    chmod 600 ~/.ssh/id_rsa
    chmod 644 ~/.ssh/id_rsa.pub
    eval "$(ssh-agent -s)"  # 启动SSH Agent
    ssh-add ~/.ssh/id_rsa   # 添加私钥
    ```

## vscode｜cursor 配置

安装依赖采用脚本安装：
```sh
#!/usr/bin/env bash

cat extensions.txt | while read extension || [[ -n $extension ]];
do
  cursor --install-extension $extension --force
done

cursor --list-extensions
```
需要在同级目录放置一个 `extensions.txt` 文件，里面存放的是 `code --list-extensions` 的输出内容。下面是我用到的一些扩展：

```bash
aaron-bond.better-comments
antfu.goto-alias
antfu.iconify
antfu.icons-carbon
antfu.pnpm-catalog-lens
antfu.theme-vitesse
antfu.unocss
astro-build.astro-vscode
bierner.markdown-mermaid
bradlc.vscode-tailwindcss
christian-kohler.path-intellisense
dbaeumer.vscode-eslint
dsznajder.es7-react-js-snippets
eamodio.gitlens
esbenp.prettier-vscode
fabiospampinato.vscode-diff
gruntfuggly.bettercomment
humao.rest-client
johnsoncodehk.vscode-tsconfig-helper
mhutchie.git-graph
naumovs.color-highlight
nichabosh.minimalist-dark
pkief.material-icon-theme
prisma.prisma
raunofreiberg.vesper
rust-lang.rust-analyzer
serayuzgur.crates
simonsiefke.svg-preview
stivo.tailwind-fold
streetsidesoftware.code-spell-checker
tamasfe.even-better-toml
usernamehw.errorlens
vue.volar
whtouche.vscode-js-console-utils
xiaoluabei.xiaoluabei-vscode-theme
yandeu.five-server
yoavbls.pretty-ts-errors
yummygum.city-lights-icon-vsc
yzhang.markdown-all-in-one
```

我还会修改一些默认快捷键 `cmd+shift+p` 打开命令面板，搜索 `Open Keyboard Shortcuts` 打开快捷键配置文件：
```json
[
  {
    "key": "cmd+i",
    "command": "editor.action.triggerSuggest",
    "when": "editorHasCompletionItemProvider && textInputFocus && !editorReadonly && !suggestWidgetVisible"
  },
  {
    "key": "cmd+i",
    "command": "-editor.action.triggerSuggest",
    "when": "editorHasCompletionItemProvider && textInputFocus && !editorReadonly && !suggestWidgetVisible"
  },
  {
    "key": "shift+cmd+u",
    "command": "aichat.insertselectionintochat"
  },
  {
    "key": "shift+cmd+l",
    "command": "-aichat.insertselectionintochat"
  },
  {
    "key": "cmd+u",
    "command": "composer.startComposerPrompt"
  },
  {
    "key": "cmd+i",
    "command": "-composer.startComposerPrompt"
  },
  {
    "key": "shift+cmd+u",
    "command": "composer.newAgentChat"
  },
  {
    "key": "shift+cmd+i",
    "command": "-composer.newAgentChat"
  }
]
```

::: details 下面再贴一下我的 `vscode` 配置，有需要可以展开看看：
```json
{
  "window.commandCenter": false,
  "window.nativeTabs": true,
  "window.nativeFullScreen": false,
  "window.dialogStyle": "custom",
  "window.title": "${rootName}",
  "window.titleBarStyle": "custom",
  "window.autoDetectColorScheme": true,
  "workbench.layoutControl.enabled": false,
  "workbench.tree.indent": 12,
  "workbench.tree.renderIndentGuides": "none",
  "workbench.sideBar.location": "right",
  "workbench.productIconTheme": "icons-carbon",
  "workbench.iconTheme": "city-lights-icons-vsc",
  "git.decorations.enabled": false,
  "explorer.decorations.badges": false,
  "city-lights-icons-vsc.hidesExplorerArrows": true,

  "workbench.editor.customLabels.enabled": false,
  "workbench.editor.customLabels.patterns": {
    "**/views/**/index.vue": "${dirname} - View",
    "**/components/**/*.vue": "${filename} - Component",
    "**/utils/**/*.ts": "${filename} - Util",
    "**/hooks/**/*.ts": "${filename} - Hook",
    "**/composables/**/*.ts": "${filename} - Hook",
    "**/router/**/*": "${filename} - Route",
    "**/stores/**/*": "${filename} - Store",
    "**/styles/**/*": "${filename} - Style",
    "**/assets/**/*": "${filename} - Asset",
    "**/docs/**/*": "${filename} - Docs(${extname})",
    "**/examples/**/*": "${filename} - Examples"
  },
  // explorer
  "explorer.compactFolders": false,
  "explorer.confirmDelete": false,
  "explorer.confirmDragAndDrop": false,
  "explorer.sortOrder": "foldersNestsFiles",
  "explorer.confirmPasteNative": false,
  // editor 测试
  "editor.fontFamily": "Iosevka Abei, Sarasa Mono SC, Maple Mono, MesloLGL Nerd Font, Dank Mono, FZYouSongS, Berkeley Mono",
  "editor.fontLigatures": "'calt', 'zero', 'cv01', 'cv04'",
  // "editor.fontVariations": "'wght' 340",
  // "editor.letterSpacing": -0.4,
  "editor.fontWeight": "400",
  "editor.tabSize": 2,
  "editor.lineHeight": 1.8,
  "editor.fontSize": 14,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.cursorBlinking": "expand",
  "editor.cursorSmoothCaretAnimation": "on",
  "editor.smoothScrolling": true,
  "editor.acceptSuggestionOnCommitCharacter": false,
  "editor.suggestLineHeight": 20,
  "editor.inlayHints.fontSize": 12,
  "editor.suggestFontSize": 12,
  "editor.suggestSelection": "first",
  "editor.wordSeparators": "`~!#%^&*()=+[{]}\\|;:'\",.<>/?",
  "editor.bracketPairColorization.enabled": false,
  "editor.guides.bracketPairs": "active",
  "editor.lightbulb.enabled": "off",
  "editor.lineNumbers": "interval",
  "files.trimTrailingWhitespace": true,
  "scm.diffDecorations": "none",
  "editor.accessibilitySupport": "off",
  "diffEditor.ignoreTrimWhitespace": true,
  "editor.colorDecorators": false,
  "editor.codeLens": true,
  // terminal
  "terminal.integrated.fontFamily": "Iosevka Abei",
  "terminal.integrated.fontSize": 14,
  "terminal.integrated.cursorBlinking": true,
  "terminal.integrated.cursorStyle": "line",
  "terminal.integrated.persistentSessionReviveProcess": "never",
  "terminal.integrated.stickyScroll.enabled": false,
  "terminal.integrated.tabs.enabled": true,
  // language
  "javascript.updateImportsOnFileMove.enabled": "always",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "[json, css, jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  },
  "files.associations": {
    "*.toml": "yaml"
  },
  "[html]": {
    "editor.defaultFormatter": "vscode.html-language-features"
  },
  "[json]": {
    "editor.defaultFormatter": "vscode.json-language-features"
  },
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
  },
  // plugins
  "color-highlight.markerType": "dot-before",
  "gitlens.graph.layout": "editor",
  "git.autofetch": true,
  "git.confirmSync": false,
  "errorLens.fontSize": "12px",
  "errorLens.enabledDiagnosticLevels": ["error", "warning"],
  "[php]": {
    "editor.defaultFormatter": "bmewburn.vscode-intelephense-client"
  },
  "git.enableSmartCommit": true,
  "cursor.cpp.disabledLanguages": [],
  "bladeFormatter.format.indentSize": 2,
  "[blade]": {
    "editor.defaultFormatter": "shufo.vscode-blade-formatter"
  },
  "[css]": {
    "editor.defaultFormatter": "vscode.css-language-features"
  },
  "git.openRepositoryInParentFolders": "never",
  "[markdown]": {
    "editor.defaultFormatter": "yzhang.markdown-all-in-one"
  },
  "[vue]": {
    "editor.defaultFormatter": "Vue.volar"
  },
  "cSpell.userWords": [],
  "editor.gotoLocation.multipleDefinitions": "goto",
  "workbench.preferredDarkColorTheme": "Xiaolu Abei Dark Green",
  "git.replaceTagsWhenPull": true,
  "workbench.preferredLightColorTheme": "Xiaolu Abei Dark",
  "tailwind-fold.autoFold": false,
  "cursor.composer.shouldAllowCustomModes": true,
  "extensions.ignoreRecommendations": true
}
```
:::

## 其它

1. 禁用 macOS 默认输入法，仅采用微信输入法。可以参考这篇文章：[macOS 禁用自带的 ABC 输入法](https://rokcso.com/p/macos-remove-abc/)。

2. 遇到软件提示已损坏，先打开允许任何来源：
    ```bash
    sudo spctl --master-disable
    ```
    然后针对这个软件运行：
    ```bash
    # 地址可以从访达中拖入终端
    xattr -cr /Applications/WeChat.app
    ```
    如果仍然打不开，则需要打开**系统设置 – 隐私和安全性，“安全性” 下面出现提示，点击 “仍要打开”**，当然该操作仅需要一次，以后可以正常打开。

3. homebrew 更新所有已安装软件：
    ```bash
    brew update && brew upgrade && brew cleanup
    ```
4. 开启允许任何来源软件，然后到设置中选择任何来源：
    ```bash
    sudo spctl --master-enable
    ```
5. 当系统某些文件的图标被 webstorm、cursor 等软件修改时，你卸载了这个软件，但是文件图标仍然是该软件，则可以运行以下命令进行恢复：
    ```bash
    /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill
    ```

## 结束

自己整体跑了一遍这个流程，整体配置下来还是很快的。常用的在用户家目录下的配置我一般会复制一份到 `iCloud` 中，这样复制出来改改权限基本就可以用了。
不过也有几个痛点：
1. raycast 配置拷贝出来后，再拷贝回去好像他并不会读取，需要重新配置。当然我基本上就是几个插件和快捷键，问题不大。
2. 不知道有没有办法自动同步几个目录到 `iCloud` 中，这样我就可以不用每次手动同步了，之后有时间可以研究一下这个。
