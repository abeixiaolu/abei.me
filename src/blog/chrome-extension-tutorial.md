---
title: 如何从零开发一款划词翻译的 Chrome 插件
description: 如何开发一个 Chrome 扩展
date: 2025-04-02
---

> 项目源码：[chrome-translate-extension](https://github.com/abeixiaolu/chrome-translate-extension)

Chrome 浏览器凭借其强大的扩展生态，让我们可以轻松定制功能来提升使用体验。划词翻译插件就是其中一个实用的小工具：选中网页上的文字，就能立刻看到翻译结果，特别适合阅读外文网页时快速理解内容。本文将带你从零开始，打造一款划词翻译插件，包含基础的翻译功能，甚至还能加上生词本和高亮生词的小惊喜。别担心，我会尽量把每一步讲得清楚明白，像朋友聊天一样带你入门。

---

## 为什么要做这个插件？

想象一下，你在看一篇英文文章，碰到不认识的单词，不用打开新标签页查字典，直接鼠标一划，翻译就跳出来，多方便！Chrome 扩展的开发其实没那么神秘，只要掌握几个核心概念，就能做出实用的工具。咱们的目标是：选中文字后翻译，翻译结果显示在页面上，还能把生词存下来，下次看到时高亮提醒。

---

## 准备工作：工具和环境

动手前，先准备好这些家伙：

- **Chrome 浏览器**：开发和测试的主场，必须得有。
- **文本编辑器**：推荐 Visual Studio Code，轻便好用，写代码调试都顺手。
- **基础知识**：懂点 JavaScript、HTML 和 CSS 就够了，不需要高深技术。

装好这些，找个安静的角落，咱们开始干活！

---

## 第一步：搭建项目框架

### 创建项目文件夹

在电脑上建个文件夹，比如叫 `chrome-translate-extension`，用来放所有文件。简单点，里面会塞几个关键文件：配置文件、脚本啥的。

### 配置 manifest.json

每个 Chrome 扩展都得有个“身份证”——`manifest.json`。新建这个文件，写上以下内容：

```json
{
  "manifest_version": 3,
  "name": "划词翻译",
  "version": "1.0",
  "description": "选中网页文本并翻译",
  "permissions": ["activeTab", "https://translation.googleapis.com/*"],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
}
```

这文件啥意思呢？
- `manifest_version: 3`：Chrome 现在推荐用版本 3，规则更现代。
- `name`和`description`：插件的名字和简介，随手取个明白的。
- `permissions`：告诉 Chrome 我们需要啥权限，比如访问当前标签页和调用翻译 API 的网络权限。
- `background`：指定背景脚本 `background.js`，它像个后台管家，处理翻译请求。
- `content_scripts`：定义内容脚本 `content.js`，它会在网页上跑，负责抓取你选中的文字。

---

## 第二步：实现核心功能

插件的灵魂是“选中文字→翻译→显示结果”，咱们拆成三部分搞定。

### 内容脚本：抓取选中文本

新建 `content.js`，写上这些代码：

```javascript
document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection().toString().trim()
  if (selectedText) {
    chrome.runtime.sendMessage({ action: 'translate', text: selectedText })
  }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showTranslation') {
    const div = document.createElement('div')
    div.style.position = 'fixed'
    div.style.top = '10px'
    div.style.right = '10px'
    div.style.backgroundColor = 'white'
    div.style.padding = '10px'
    div.style.border = '1px solid black'
    div.style.zIndex = '9999'
    div.textContent = request.translation
    document.body.appendChild(div)
  }
})
```

- **监听鼠标松开**：用 `mouseup` 事件，鼠标一松就看看你选了啥文字。
- **发送消息**：如果真选了文字，就通过 `chrome.runtime.sendMessage` 发给背景脚本，带着“translate”标签和选中的内容。
- **接收翻译**：背景脚本翻译完会发回结果，咱们监听消息，收到后弄个小方框显示在页面右上角。

### 背景脚本：调用翻译 API

接着建 `background.js`，负责翻译的“大脑”：

```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    const apiKey = 'YOUR_API_KEY' // 替换成你自己的密钥
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`
    const data = {
      q: request.text,
      target: 'en' // 翻译成英文
    }
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then((result) => {
        const translatedText = result.data.translations[0].translatedText
        chrome.tabs.sendMessage(sender.tab.id, { action: 'showTranslation', translation: translatedText })
      })
      .catch(error => console.error('翻译失败:', error))
  }
})
```

- **监听消息**：收到内容脚本的“translate”请求后，干活。
- **调用 API**：用 Google Translate API，发送选中的文字，目标语言设为英文（可以改成别的）。
- **返回结果**：翻译完后通过 `chrome.tabs.sendMessage` 发回内容脚本。

**API 密钥咋弄？**
去 [Google Cloud Console](https://console.cloud.google.com/)，建个项目，启用 Cloud Translation API，生成密钥，填到 `YOUR_API_KEY` 里。别忘了开通计费，不然用不了。

---

## 第三步：加点高级功能

基础功能有了，咱们再锦上添花。

### 生词本：存下不认识的词

用 IndexedDB 做个小数据库，存生词。改 `background.js`，加这些代码：

```javascript
const DB_NAME = 'VocabularyDB'
const STORE_NAME = 'words'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'original' })
      }
    }
    request.onsuccess = event => resolve(event.target.result)
    request.onerror = event => reject(event.target.error)
  })
}

function addWord(original, translation) {
  openDB().then((db) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    store.put({ original, translation })
  }).catch(error => console.error('存储失败:', error))
}

// 加到消息监听里
if (request.action === 'addToVocabulary') {
  addWord(request.original, request.translation)
}
```

- **IndexedDB**：浏览器自带的小型数据库，比 localStorage 更强大，适合存结构化数据。
- **存储逻辑**：收到“addToVocabulary”消息，把原文和翻译存起来。

### 高亮生词：在页面标记

改 `content.js`，让页面加载时高亮生词：

```javascript
function highlightWords(vocabulary) {
  if (isHighlighting)
    return

  // 提取生词的原始文本
  const words = vocabulary.map(item => item.original).filter(Boolean)
  if (!words.length)
    return

  isHighlighting = true

  try {
    // 创建一个正则表达式匹配所有单词
    const escapedWords = words.map(word =>
      word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    )
    const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi')
    console.log('regex: ', regex)

    // 使用TreeWalker遍历文本节点
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentNode
          // 跳过已处理的节点和特殊标签
          if (
            !parent
            || parent.nodeName === 'SCRIPT'
            || parent.nodeName === 'STYLE'
            || parent.nodeName === 'MARK'
            || parent.id === 'translation-popup'
            || highlightedNodes.has(parent)
          ) {
            return NodeFilter.FILTER_REJECT
          }
          return NodeFilter.FILTER_ACCEPT
        },
      }
    )

    let textNode
    const nodesToProcess = []

    // 收集需要处理的节点
    while ((textNode = walker.nextNode())) {
      if (regex.test(textNode.textContent)) {
        nodesToProcess.push(textNode)
      }
    }

    // 处理收集到的节点
    nodesToProcess.forEach((node) => {
      const text = node.textContent
      const container = document.createElement('span')
      let lastIndex = 0
      regex.lastIndex = 0

      let result
      let processedText = ''

      while ((result = regex.exec(text)) !== null) {
        // 添加匹配前的文本
        processedText += text.slice(lastIndex, result.index)
        // 添加带高亮的匹配文本
        const title = vocabulary.find(
          item => item.original === result[0]
        ).translation
        processedText += `<mark title="${title}" class="abei-highlighted-word">${result[0]}</mark>`
        lastIndex = regex.lastIndex
      }

      // 添加剩余文本
      processedText += text.slice(lastIndex)

      container.innerHTML = processedText
      if (node.parentNode) {
        node.parentNode.replaceChild(container, node)
        highlightedNodes.add(container)
      }
    })
  }
  catch (error) {
    console.error('高亮处理出错：', error)
  }
  finally {
    isHighlighting = false
  }
}
```

- **遍历文本**：用 `TreeWalker` 扫描页面所有文字节点。
- **正则匹配**：找到生词后，用 `<mark>` 标签高亮。

---

## 第四步：调试与测试

代码写好了，得试试管不管用。

### 加载扩展

1. 打开 Chrome，输入 `chrome://extensions/`。
2. 点右上角“开发者模式”开关。
3. 点击“加载已解压的扩展程序”，选你的项目文件夹。

### 调试技巧

- **内容脚本**：在网页上右键“检查”，打开控制台，看看 `console.log` 输出啥。
- **背景脚本**：在扩展页面点“背景页”，打开它的开发者工具。
- **加日志**：代码里多写点 `console.log`，追踪哪里出了问题。

试着选几段文字，看翻译跳不跳出来；存几个生词，刷新页面看高不高亮。出错了别慌，多打印日志慢慢查。

---

## 总结：收获与下一步

到这步，你已经做出了一个挺像样的划词翻译插件！它能翻译文字、存生词、还会在页面上高亮提醒。过程中你接触了：
- **manifest.json**：扩展的“说明书”。
- **内容脚本**：跟网页互动的“前台”。
- **背景脚本**：处理逻辑的“后台”。
- **IndexedDB**：存数据的“小仓库”。
- **调试工具**：Chrome 自带的“侦探”。

想再升级？可以加个设置页面调整语言，或者弄个浮窗让翻译结果更好看。总之，动手试试，边做边学，插件开发其实挺有趣的！
