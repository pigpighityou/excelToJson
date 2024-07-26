const { Controller } = require("egg");
const path = require("path");
const sendToWormhole = require("stream-wormhole");
const fs = require("mz/fs");
const pump = require("pump");

class HomeController extends Controller {
  async upload() {
    const { ctx } = this;
    await ctx.render("upload.html");
  }

  async uploadPost() {
    const { ctx, app } = this;
    const res = ctx.request.files[0];
    // 和uploadDirPost一样，放入public。upload1文件夹，然后将它的路径和文件名放入filesInfo数组，传给transExcelToJson
    const uploadDir = path.join(this.config.baseDir, "app/public/upload");
    const target = path.join(uploadDir, res.filename);
    if (fs.existsSync(uploadDir)) {
      fs.rmdirSync(uploadDir, { recursive: true });
    }
    fs.mkdirSync(uploadDir, { recursive: true });
    // 将表格文件放入到upload文件夹
    await fs.copyFile(res.filepath, target);
    const filesInfo = [];
    filesInfo.push({
      filename: res.filename,
      filepath: target,
    });
    //  转换为json
    const r = app.transExcelToJson(filesInfo);

    ctx.body = {
      status: 200,
      data: r,
    };
  }

  async uploadDir() {
    const { ctx } = this;
    await ctx.render("uploadDir.html");
  }

  async uploadDirPost() {
    const { ctx, app } = this;
    const parts = ctx.multipart();
    let part;
    const filesInfo = [];
    const uploadDir = path.join(this.config.baseDir, "app/public/upload");
    // 确保上传目录存在,新的文件夹应放入upload文件夹，
    // 下一次上传会覆盖之前的文件，将上一次的文件夹里的内容全部删掉
    if (fs.existsSync(uploadDir)) {
      fs.rmdirSync(uploadDir, { recursive: true });
    }
    fs.mkdirSync(uploadDir, { recursive: true });

    while ((part = await parts()) != null) {
      if (part.length) {
        // 这是 busboy 的字段
   /*      console.log("field: " + part[0]);
        console.log("value: " + part[1]);
        console.log("valueTruncated: " + part[2]);
        console.log("fieldnameTruncated: " + part[3]); */
      } else {
        if (!part.filename) {
          // 这时是用户没有选择文件就点击了上传(part 是 file stream，但是 part.filename 为空)
          // 需要做出处理，例如给出错误提示消息
          return;
        }
        /*         // part 是上传的文件流
        console.log("field: " + part.fieldname);
        console.log("filename: " + part.filename);
        console.log("encoding: " + part.encoding);
        console.log("mime: " + part.mime); */

        // 处理流文件
        const target = path.join(uploadDir, part.filename);

        try {
          const writeStream = fs.createWriteStream(target);
          await pump(part, writeStream);

          filesInfo.push({
            filename: part.filename,
            filepath: target,
          });
        } catch (err) {
          // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
          await sendToWormhole(part);
          throw err;
        }
      }

    }

    // 计算文件夹大小
    let totalSize = app.calcDirSize(filesInfo);
    // 过滤掉非表格文件
    const excelFiles = filesInfo.filter((file) =>
      [".xlsx", ".xls", ".csv"].includes(
        path.extname(file.filename).toLowerCase()
      )
    );

    // 对所有表格文件进行处理，将他们转换为json
    const r = app.transExcelToJson(excelFiles);


    // 返回消息
    ctx.body = {
      status: 200,
      data: {
        excel: r,
        totalSize,
      },
    };
    // 需要使得计数完成后再进行excel数组大小的检查


    // json文件夹传输给前端,如果没有则证明没有表格
    if (r.length === 0) {
      ctx.throw(400, "No excel files found!!!");
      ctx.body = {
        status: 400,
        data: "No excel files found",
      };
    }
  }

  async compressAndDownload() {
    const { ctx, app } = this;
    // zipfile是异步的
    await app.zipFile();
    ctx.body = {
      status: 200,
      data: {
        zipPath: "/public/download/json_files.zip",
      },
    };
  }
}

module.exports = HomeController;
