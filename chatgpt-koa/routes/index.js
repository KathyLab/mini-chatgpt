const fs = require('fs');

module.exports = (app) => {
  //  read all files in the directory
  fs.readdirSync(__dirname).forEach((file) => {
    // exclude `index.js`
    if (file === 'index.js') return;
    const router = require(`./${file}`);

    app.use(router.routes());
    // 启用对路由的 HTTP 方法的支持
    app.use(router.allowedMethods());
  });
};
