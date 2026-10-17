# SVG 编辑器 CLI（Lab1 Phase 1）

Node.js 20+。安装依赖并启动交互界面：

```bash
npm install
npm run cli
```

提示符为 `svg>`。可以逐行输入命令，也可以把命令文本通过标准输入传给 CLI；空行与 `#` 开头的行会被忽略。参数中有空格时使用双引号，例如 `create text title 20 40 "My Diagram"`。`help` 查看所有命令。

```text
init 400 200
create g flow
create rect start 30 70 120 60 #4a90d9 in flow
create line edge 150 100 250 100 black in flow
create rect end 250 70 120 60 #f5a623 in flow
tree
save demo.svg
```

`save demo.svg` 输出可直接在浏览器打开的 SVG。`read demo.svg` 读回；如果读入的文件含无 `id` 图形，程序会分配唯一 id 并警告。`save` 不带路径时使用最近一次读取或保存的路径。

支持 `rect`、`circle`、`ellipse`、`line`、`text`、`g`。`box` 是后续插件阶段的类型，本阶段会报告未知图形类型。读入时只接受这六类元素与明确支持的 SVG 属性；不支持的内容会报错，避免无声丢失。简单的 `translate` 与等比 `scale` 会在读入时作用到坐标；复杂变换与嵌套富文本暂不支持。`ungroup` 按任务约定拒绝根级容器。

运行验证：

```bash
npm test
npm run typecheck
```

架构方案、过程记录和一致性自查见 [doc/README.md](doc/README.md)。
