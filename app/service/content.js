const Service = require("egg").Service;
const fs = require("fs");
const path = require("path");

class ContentService extends Service {
  async delTransportedFiles() {
    // 删去public里面的download目录，json目录，upload目录
    const { ctx } = this;
    const publicDir = path.join(__dirname, "../public");
    const downloadDir = path.join(publicDir, "download");
    const jsonDir = path.join(publicDir, "json");
    const uploadDir = path.join(publicDir, "upload");
    if (fs.existsSync(downloadDir)) {
      fs.rmdirSync(downloadDir, { recursive: true });
    }
    if (fs.existsSync(jsonDir)) {
      fs.rmdirSync(jsonDir, { recursive: true });
    }
    if (fs.existsSync(uploadDir)) {
      fs.rmdirSync(uploadDir, { recursive: true });
    }
  }
}

module.exports = ContentService;
