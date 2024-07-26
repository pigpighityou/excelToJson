const { Controller } = require("egg");

class UploadController extends Controller {
  async upload() {
    const { ctx } = this;
    await ctx.render("uploadRules.html", {
      rules: [
        "文件大小不超过10M",
        "支持的文件格式有：xlsx、xls",
        '文件名不要包含特殊字符',
      ],
    });
  }
}

module.exports = UploadController;
