---
title: "Git 小技巧"
description: "Git ｜ 小技巧"
date: 2025-01-20
---

> [!TIP]
> 这里主要记录一些自己平常工作中会用到的 git 小技巧。

## 修改 commit 提交人

有两种方式，分别是逐条修改和批量修改。

#### 逐条修改

1. 如果要修改最近一次的 commit：
```bash
git commit --amend --author="新名字 <新邮箱>"
```

2. 如果要修改多个历史 commit，可以使用 git rebase：

```bash
git rebase -i HEAD~3  # 修改最近3个commit，数字可以根据需要调整
```

然后在打开的编辑器中，将需要修改的 commit 前面的 pick 改为 edit，保存退出。
对每个标记为 edit 的 commit，执行：
```bash
git commit --amend --author="新名字 <新邮箱>" --no-edit
git rebase --continue
```

最后，执行：
```bash
git push --force
```

#### 批量修改

批量修改可以使用下面这个脚本，保存它到任意位置，例如我保存到 `~/git-change-author.sh` 文件中：

```bash
git filter-branch --env-filter '
OLD_EMAIL="旧邮箱"
CORRECT_NAME="新名字"
CORRECT_EMAIL="新邮箱"

if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags
```

然后在你想要修改的 git 仓库目录下执行：
```bash
~/git-change-author.sh
```

执行完之后，运行 `git push --force` 强制推送到远程仓库。

## 开了翻墙推送报错

遇到如下错误，只需要把 ssh 的 remote地址修改为 https 的即可。
```bash
artsmp.me on  main [⇡] is 📦 v1.0.0 via ⬢ v22.13.0 took 4m12s
○ gps
Connection closed by 198.18.1.36 port 22
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

逐条运行下面的命令：
```bash
# 查看自己的 remote 地址和名称
git remote -v

# 修改为 https 的地址
git remote remove origin
git remote add origin https://github.com/abeixiaolu/artsmp.me.git
# or
git remote set-url origin https://github.com/abeixiaolu/artsmp.me.git

# 推送
git push --set-upstream [名称] main
```
