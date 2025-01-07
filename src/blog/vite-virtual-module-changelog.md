---
title: Vite 虚拟模块入门：自动生成 Changelog
description: vite | virtual module | auto generate changelog | tutorial
date: 2025-01-06
---

## 虚拟模块是什么

> [!TIP]
> [Vite 官方](https://cn.vite.dev/guide/api-plugin.html#virtual-modules-convention)对它的介绍是：虚拟模块是一种很实用的模式，使你可以对使用 ESM 语法的源文件传入一些编译时信息。

通俗点说：虚拟模块并没有实际的文件存在与文件系统中，而是由 Vite 内部插件或构建工具动态生成的。通过虚拟模块，开发者可以直接 import 一些特定标识符（如 virtual:xxx），获取动态内容。

```ts
import data from 'virtual:my-module'

console.log(data) // 输出虚拟模块的内容
```

## 虚拟模块的作用和运用场景

它主要有以下几个作用：

1. **动态内容注入**：允许开发者根据运行时环境生成动态内容。例如，提供项目配置、动态构建信息等。
2. **避免文件创建**：无需生成实际的物理文件，简化开发过程，同时减少磁盘 `I/O`。
3. **增强开发体验**：在开发环境中提供内置功能模块，例如热重载、状态管理工具的动态注入。
4. **插件扩展能力**：插件可以通过虚拟模块向项目注入特定功能，而不需要开发者手动添加文件或代码。

而根据它的作用，我们可以利用这些特性来实现一些特定的功能，例如：

1. 构建元信息的注入，例如版本号，GIT 提交信息、项目文件信息等。
2. 开发工具支持，例如热重载、状态管理工具的动态注入。
3. 跨语言资源加载，例如通过虚拟模块将 `.wasm`、`.json` 等非 JavaScript 资源动态加载为模块。

> [!NOTE]
> 总的来说，适合采用虚拟模块的场景有：
>
> 1. 内容动态生成：当模块内容是动态生成的，比如构建信息、配置项。
> 2. 避免生成实际文件：无需生成临时文件或过多中间文件时。
> 3. 插件注入功能：开发一个插件时需要向项目注入额外功能或数据。
> 4. 优化构建性能：通过虚拟模块减少文件扫描和读写操作，提升效率。
> 5. 调试和开发工具支持：比如工具链扩展、实时注入调试信息等。

## 举例实现

此处我们以 [Gupo-Admin](https://demo.group-ds.com/dev-business-kits-docs/components/) 项目为例，实现一个虚拟模块，用于自动生成每个组件下的 Changelog 信息。

1. 首先，我们需要一个获取 git 提交日志的方法：

    ```ts
    import { simpleGit } from 'simple-git'

    const git = simpleGit({
      maxConcurrentProcesses: 200,
    })

    export async function getChangeLog(count = 200) {
      const logs = (await git.log({ maxCount: count })).all.filter(commit => commit.message.startsWith('feat(components):')
        || commit.message.startsWith('fix(components):'))

      const result: {
        hash: string
        date: string
        message: string
        components: string[]
      }[] = []

      for (const log of logs) {
        const raw = await git.raw(['diff-tree', '--no-commit-id', '--name-only', '-r', log.hash])
        const files = raw.split('\n').filter(Boolean)
        // 提取该条提交影响的组件
        const components = Array.from(new Set(files
          .filter(file => file.startsWith('components/src/') && !file.includes('components/src/utils') && !file.includes('components/src/hooks'))
          .map(file => file.split('/').at(-3)) as string[],
        ))

        result.push({
          hash: log.hash,
          date: log.date,
          message: log.message,
          components,
        })
      }

      return result
    }
    ```

    这里我们过滤出 `feat(components):` 和 `fix(components):` 的提交日志，并获取每个提交的 hash、日期、消息和影响的组件。

2. 创建对应的虚拟模块：

    ```ts
    import type { PluginOption } from 'vite'
    import process from 'node:process'
    import { getChangeLog } from '../utils/changelog'

    export function ChangeLog(): PluginOption {
      const virtualModuleId = 'virtual:changelog'
      const resolvedVirtualModuleId = `\0${virtualModuleId}`

      return {
        name: 'vite:changelog',
        resolveId(id) {
          if (id === virtualModuleId) {
            return resolvedVirtualModuleId
          }
        },
        async load(id) {
          if (id === resolvedVirtualModuleId) {
            const changelog = await getChangeLog(process.env.DEV ? 5000 : 50)

            return `export default ${JSON.stringify(changelog)}`
          }
        },
      }
    }
    ```

    虚拟模块在 Vite（以及 Rollup）中都以 virtual: 为前缀，作为面向用户路径的一种约定。在内部，使用了虚拟模块的插件在解析时应该将模块 ID 加上前缀 `\0`，这一约定来自 rollup 生态。

3. 在 `Changelog.vue` 组件中使用虚拟模块：

    ```vue
    <script lang="ts" setup>
    import { NEllipsis } from 'naive-ui'
    import changelog from 'virtual:changelog' // [!code highlight]
    import { computed } from 'vue'

    const props = defineProps<{ component: string }>()

    const commits = computed(() => changelog
      .filter(commit => commit.components.includes(props.component)))
    </script>

    <template>
      <div class="space-y-1">
        <div v-for="commit of commits" :key="commit.hash" class="flex items-center gap-2">
          <div class="flex shrink-0 items-center justify-center rounded-full bg-[var(--vp-c-bg-alt)] p-1.5">
            <span class="i-lucide-git-commit-vertical size-4" />
          </div>

          <a :href="`https://codeup.aliyun.com/gupo/rd-frontend/dev/dev-business-kits-docs/commit/${commit.hash}`" class="text-sm font-mono">
            {{ commit.hash.slice(0, 5) }}
          </a>
          -
          <NEllipsis :tooltip="{ contentClass: 'max-w-300px max-h-300px overflow-y-auto' }" class="text-[var(--vp-c-text-alt)]!">
            {{ commit.message }}
          </NEllipsis>

          <span class="ml-auto shrink-0 text-[var(--vp-c-text-2)] font-mono">
            on {{ new Date(commit.date).toLocaleDateString() }}
          </span>
        </div>
      </div>
    </template>
    ```

4. 在 vite.config.ts 中使用该插件：

    ```ts
    import { ChangeLog } from './plugins/changelog'

    export default defineConfig({
      plugins: [
        ChangeLog(),
        {
          name: 'vite:add-changelog-info',
          enforce: 'pre',
          transform(code, id) {
            const match = id.match(/components\/at-(.*)\.md/)
            if (match) {
              const componentName = match[1]
              return `${code} \n\n ## changelog \n\n <Changelog component="${componentName}" />`
            }
            return code
          },
        },
      ],
    })
    ```
    此场景下，为了避免手动给每个组件的文档加上日志展示，我们可以再写一个简单的插件，在文档中自动注入日志展示。（当然此处的 `Changelog` 组件已经全局注册了）。

## 大功告成

最终实现的效果图如下：

![changelog](/imgs/changelog.png)
