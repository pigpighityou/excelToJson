# excel-json

这个项目是一个将 Excel 文件转换为 JSON 数据的工具。它可以识别传入的文件或文件夹中的表格文件,将其解析并转换为 JSON 格式,最后将 JSON 数据打包压缩返回给前端用户。

### 主要功能点
* 自动识别传入的表格文件,支持 .xlsx、.xls、.csv 等格式
* 将表格文件转换为 JSON 格式数据
* 将转换后的 JSON 数据打包压缩返回给前端用户

### 技术栈

* Node.js

* Egg.js
* js(cjs)


### 不允许传内容过大的文件夹，里面的格式最好只有
```
[".pdf", ".json", ".log", "xlsx", "xls", "csv",'docx','doc','png','webp','jpg']
```

### 有待完善

### 目前自己访问的步骤（因为未部署到前端框架）
* 1.下载代码
* 2.安装依赖 => npm || yarn
* 3.启动服务=>npm run dev||yarn dev
* 4.访问 http://localhost:7002
