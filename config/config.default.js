/* eslint valid-jsdoc: "off" */

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */

const path = require('path');

module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + "_1721098125531_8776";

  // add your middleware config here
  config.middleware = [];

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.view = {
    mapping: {
      ".html": "ejs",
    },
  };

  config.multipart = {
    mode: "stream",
    fileModeMatch: /^\/upload$/,
    fileSize: 1048576000,
    fileExtensions: [".pdf", ".json", ".log", "xlsx", "xls", "csv",'docx','doc','png','webp','jpg'],

  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  // 允许前端下载获取的后端静态文件服务
  config.static = {
    prefix: "/public/",
    dir: path.join(appInfo.baseDir, "app/public"),
  };

  return {
    ...config,
    ...userConfig,
  };
};
