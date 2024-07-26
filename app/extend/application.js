const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { pinyin } = require("pinyin-pro");
const moment = require("moment");
const archiver = require("archiver");

module.exports = {
  // excel变成json
  transExcelToJson(excels) {
    return trans(excels);
  },

  //   计算总文件夹的大小，换成kb
  calcDirSize(filesInfo) {
    return calDir(filesInfo);
  },

  //   将excel里自动变成数字的日期转换为正常格式的日期
  transExcelInvalidDate(serial) {
    return transExcelInvalidDate(serial);
  },

  //   压缩json目录里的所有文件
  zipFile() {
    return zipHandler();
  },
};

//   计算总文件夹的大小，换成kb
function calDir(filesInfo) {
  return (
    filesInfo.reduce((acc, file) => {
      const stats = fs.statSync(file.filepath);
      return acc + stats.size;
    }, 0) / 1024
  ).toFixed(2);
}

function convertToPinyinInitials(field) {
  return pinyin(field, { pattern: "first", type: "array" }).join("");
}

// 这里是将excel文件转换为json的逻辑
function trans(excels) {
  // 第一步，读取处于public/upload文件夹下的所有excel文件
  const result = [];
  // 如果没有传入excels，就读取文件夹下的所有文件
  if (!excels) {
    fs.readdirSync(path.join(__dirname, "../public/upload")).forEach((file) => {
      if (
        [".xlsx", ".xls", ".csv"].includes(path.extname(file).toLowerCase())
      ) {
        excels.push({
          filename: file,
          filepath: path.join(__dirname, "../public/upload", file),
        });
      } else {
        return;
      }
    });
  }

  //   创建一个叫做json的文件夹
  if (fs.existsSync(path.join(__dirname, "../public/json"))) {
    fs.rmdirSync(path.join(__dirname, "../public/json"), { recursive: true });
  }
  fs.mkdirSync(path.join(__dirname, "../public/json"), { recursive: true });

  //  某个表格里，所有工作表的内容依次创建一个新json
  excels.forEach((file) => {
    const workbook = xlsx.readFile(file.filepath);
    const sheetNames = workbook.SheetNames;

    sheetNames.forEach((sheetName) => {
      const sheetNumberMatch = sheetName.match(/\d+/);
      const sheetNumber = sheetNumberMatch ? sheetNumberMatch[0] : sheetName;
      const fileNumberMatch = file.filename.match(/\d+/);
      const fileNumber = fileNumberMatch;

      const ws = workbook.Sheets[sheetName];
      let json = xlsx.utils.sheet_to_json(ws, { defval: null });

      //  将日期字段的所有日期转换为（YYYY-MM-DD）格式
      json = json.map((item) => {
        const newItem = {};
        Object.keys(item).forEach((key) => {
          // 如果不幸数字日期都被转换为了数字，那么就转换回来
          if (typeof item[key] === "number") {
            newItem[key] = transExcelInvalidDate(item[key]);
          } else {
            newItem[key] = item[key];
          }
        });
        return newItem;
      });

      //   将json数组里每一个对象里的字段名都转换为拼音
      json = json.map((item) => {
        if (!item || typeof item !== "object") {
          return item;
        }
        const newItem = {};
        Object.keys(item).forEach((key) => {
          // 如果是全英文 例如id，不转换
          if (/^[A-Za-z]+$/.test(key)) {
            newItem[key] = item[key];
            return;
          }
          newItem[convertToPinyinInitials(key)] = item[key];
        });

        return newItem;
      });

      //   创建一个header，包含文件名，表名，时间，行数，描述
      const header = {
        source: "",
        producer: "04",
        tablename: `ZT${fileNumber}_TB${sheetNumber}`,
        datetime: moment().format("YYYY-MM-DD HH:mm:ss"),
        count: json.length,
        describe: `专题${file.filename.match(/\d+/)[0]}`,
      };
      const res = {
        header,
        body: json,
      };
      result.push({
        filename: file.filename,
        sheetName,
        json: res,
      });
    });
  });
  //   将结果写入文件，路径为public/json
  result.forEach((file) => {
    fs.writeFileSync(
      path.join(
        __dirname,
        "../public/json",
        file.filename + "_" + file.sheetName + ".json"
      ),
      JSON.stringify(file.json)
    );
  });

  return result;
}

// 这个代码是负责将excel里自动变成数字的日期转换为正常格式的日期
// 格式为YYYY-MM-DD
function transExcelInvalidDate(serial) {
  const basedate = moment("1900-01-01");
  const r = basedate.add(serial - 2, "days").format("YYYY-MM-DD");
  return r;
}

// 这个代码是负责压缩app/public/json文件夹目录，然后将压缩好的zip文件夹放入app/public/download文件夹
async function zipHandler() {
  const outputDir = path.join(__dirname, "../public/download");
  const zipFilePath = path.join(outputDir, "json_files.zip");
  const sourceDir = path.join(__dirname, "../public/json");
  if (fs.existsSync(outputDir)) {
    fs.rmdirSync(outputDir, { recursive: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });
  //   创建一个输出流
  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  // 将输出流和archiver绑定，并当archive写入文件后，结束输出流
  output.on("close", function () {
    console.log(archive.pointer() + " total bytes");
    console.log(
      "archiver has been finalized and the output file descriptor has closed."
    );
  });

  // 监听错误
  archive.on("error", function (err) {
    throw err;
  });
  // 将数据管道传输到文件流
  archive.pipe(output);
  // 添加目录中的所有文件到archive中
  archive.directory(sourceDir, false);
  // 完成
  await archive.finalize();
}
