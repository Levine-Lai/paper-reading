# Paper Reading

本地浏览器扩展版英文论文阅读辅助工具：在网页文章或本地 PDF 中标出学术词、CET6+、低频词和复杂词形，并支持生词库、移除词和轻量同步。

## 推荐使用方式

### 普通用户

到 GitHub Releases 下载预构建包 `paper-reading-extension.zip`，解压后在 Chrome/Edge 的扩展管理页选择“加载已解压的扩展程序”，加载解压目录。

这种方式不需要 clone 仓库，也不需要安装 Node.js 依赖。Release 包可以带完整词库，源码仓库则保持轻量。

### 开发者

```bash
npm.cmd install
npm.cmd run build
```

然后加载本项目的 `dist` 目录。

如果需要更大的本地词库：

```bash
npm.cmd run setup:dict
npm.cmd run build
```

`setup:dict` 会从 `ecdict` 生成 `public/dict/*.json`。这些大词库 chunk 不提交到 Git，避免每次 clone 都下载几十 MB 的词库文件。

## 标黄策略

插件弹窗里可以选择不同策略：

- 基础：标得更多，适合积累词汇。
- 进阶：默认策略，学术词和常见难词优先。
- 高阶：减少常规 CET6 词干扰，更偏难词。
- 极简：只保留更难的核心词。

还可以开关“低频词形推断”。设置会优先保存到 `chrome.storage.sync`，换电脑登录同一个浏览器账号时可以轻量同步。

## 当前能力

- 普通网页文章：扫描正文并标黄，点击单词可加入生词库或移除。
- 本地 PDF：提供插件自带 reader fallback，基于 `pdfjs-dist` 本地解析 PDF。
- 原生浏览器 PDF 页面：尝试叠加不拦截鼠标的标注层。
- 生词库：保存、删除、恢复移除词、导出 CSV。
- 同步 JSON：可手动导入/导出生词和移除词。

## 注意事项

Chrome/Edge 内置 PDF 查看器属于浏览器保护区域，扩展无法稳定改写它内部的文字层。当前原生 PDF 模式是估算页面布局后叠加高亮层；如果高亮无法跟随滚动或缩放，建议使用插件自带 reader fallback。

源码里的 HTML 不能直接双击运行。开发调试使用：

```bash
npm.cmd run dev
```

## 个人数据同步

生词库和移除词默认存放在浏览器存储中，不会自动出现在 Git 仓库里。

手动 Git 同步流程：

1. 打开插件弹窗里的“生词库”。
2. 点击“导出同步 JSON”。
3. 把下载的文件放到 `user-data/paper-reading-sync.json`。
4. 提交到 Git。
5. 另一台电脑拉取后，在“生词库”中点击“导入同步 JSON”。
