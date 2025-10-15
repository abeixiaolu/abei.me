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

## 代码 revert 之后，修改完想继续合并回去

1. 比如当前你想要重新合并到 master 的分支是 feat/aaa。
2. 首先，从 master 分支拉取新分支 feat/bbb 并切换到新分支。
3. 然后找到 revert 的那一条 commit，执行 `git revert -m 1 commitID`
3. 然后再执行 `git merge feat/aaa`。

> -m 1的意思是：“以 merge 的第一个父分支（通常是 master）为主线，把当时合并进来的另一个分支的内容反向恢复出来。”

错误操作流程：
```
1. feat/5890 分支 pr 合并到 master
2. master 合并 pr 后部署发现有问题
3. master 执行 revert 这个 pr后
4. 我回到 master 后拉取新分支 feat/5890-2 后，又把 feat/5890 合并到 feat/5890-2 然后继续修改。
5. 修改结束后，我又再一次提 pr 把 feat/5890-2 合并到 master 了。
6. 合并完成后发现代码还是丢失，虽然有提交记录。
```
正确恢复流程：
```
git checkout master
git pull
git checkout -b feat/5890-fix

# 反转之前那个 revert 的 merge 提交
git revert -m 1 dac2f0a029b2faf2af328c130b3bf7f5312d320c

# 如果有冲突，解决后继续
git add .
git revert --continue

# 推送并提 PR
git push origin feat/5890-fix
```