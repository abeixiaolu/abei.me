---
title: Tmux 入门
description: terminal | tmux | tutorial
date: 2025-09-25
---

## 基础概念

- 会话（session）
  - <kbd>CTRL</kbd> + <kbd>b</kbd> -> <kbd>d</kbd>：分离（detach）会话，内部运行的任务会保存在后台
  - <kbd>CTRL</kbd> + <kbd>b</kbd> -> <kbd>D</kbd>：选择要分离的会话
  - `tmux ls`：列出当前所有会话
  - `tmux attach -t 0`：连接到序号为 0 的会话
  - `tmux new -s <name>`：创建一个设置了名字的会话
  - `tmux rename-session -t 0 <new_name>`：重命名已有会话
  - `tmux kill-session -t <session_name>`：移除会话

- 窗格（pane）
  - 输入 `tmux`：开启默认会话
  - <kbd>CTRL</kbd> + <kbd>b</kbd> -> <kbd>%</kbd>：拆分左右窗格
  - <kbd>CTRL</kbd> + <kbd>b</kbd> -> <kbd>"</kbd>：拆分左右窗格
  - <kbd>CTRL</kbd> + <kbd>b</kbd> -> <kbd>arrow key</kbd>：窗格之间导航
  - <kbd>CTRL</kbd> + <kbd>d</kbd>：关闭当前窗格，关闭所有窗格后窗口就会消失
- 窗口（window）：类比为 Mac 可以创建多个桌面
  - <kbd>CTRL</kbd> + <kbd>b</kbd> -> <kbd>c</kbd>：创建新窗口
  - <kbd>CTRL</kbd> + <kbd>b</kbd> -> <kbd>p|n</kbd>：窗口之间导航

## 自定义

#### 终端与配色

启用 256 色与真彩支持，确保 Neovim/主题颜色正常。

```bash
set -g default-terminal "tmux-256color"
set -ag terminal-overrides ",xterm-256color:RGB"
```

#### 前缀键与发送前缀

作用：将前缀改为 `C-a`（默认 `C-b` 被取消）。

使用：

- 前缀：按 `C-a`。

- 向程序发送字面 `C-a`：快速连按两次 `C-a`（第一次作为前缀，第二次触发 send-prefix）

```bash
set -g prefix C-a
unbind C-b
bind-key C-a send-prefix
```

#### 分屏、重载、调整与缩放

- 分屏

  - 水平（左右）：`Prefix + |`

  - 垂直（上下）：`Prefix + -`

- 重载配置：`Prefix + r`（不重启 tmux 生效改动）

- 面板尺寸微调（每次 5 单位）：`Prefix + h/j/k/l`

- 面板缩放（全屏/还原切换）：`Prefix + m`

- 在当前 pane 目录新起一个 tmux 客户端：`Prefix + M-c（Alt/Option + c）`

```bash
unbind %
bind | split-window -h
unbind '"'
bind - split-window -v
unbind r
bind r source-file ~/.tmux.conf
bind j resize-pane -D 5
bind k resize-pane -U 5
bind l resize-pane -R 5
bind h resize-pane -L 5
bind -r m resize-pane -Z
bind M-c attach-session -c "#{pane_current_path}"
```

#### 鼠标与复制模式（Vi 风格）

- 鼠标：开启点击选择、滚轮滚动、拖拽分隔条调整大小。

- 复制模式按键为 Vi：

  - 进入复制模式：`Prefix + [`（tmux 默认）

  - 开始选择：`v`

  - 复制：`y`

  - 退出：`q` 或 `Enter`

- 鼠标拖选后不自动退出复制模式（方便继续操作）。

- escape-time 10：降低 ESC 处理延迟，优化 Neovim 返回普通模式的手感。

```bash
set -g mouse on
set-window-option -g mode-keys vi
bind-key -T copy-mode-vi 'v' send -X begin-selection # start selecting text with "v"
bind-key -T copy-mode-vi 'y' send -X copy-selection # copy text with "y"
unbind -T copy-mode-vi MouseDragEnd1Pane # don't exit copy mode when dragging with mouse
set -sg escape-time 10
```

#### 其他

- 重载配置：`Prefix + r`

- 安装插件：`Prefix + I`

- Resurrect 保存/恢复：`Prefix + C-s / Prefix + C-r`
