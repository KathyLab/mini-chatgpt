const Koa = require('koa');
const cors = require('koa2-cors');
const routing = require('./routes');
const dotenv = require('dotenv');
const path = require('path');

function loadEnv() {
  const basePath = path.resolve(process.cwd(), '.env');
  const localPath = `${basePath}.local`;

  const load = (envPath) => {
    try {
      dotenv.config({ path: envPath });
    } catch (err) {
      if (err.toString().includes('ENOENT') < 0) {
        console.error(err);
      }
    }
  };

  load(localPath);
  load(basePath);
}

loadEnv();

// 将 HTTP 请求的 body 中的数据解析为 JavaScript 对象,
// 解析后的数据将被放置在请求对象的 body 属性中
const bodyParser = require('koa-bodyparser');

const app = new Koa();

// 中间件配置
app.use(cors());
app.use(
  bodyParser({
    onerror: function (err, ctx) {
      ctx.throw(422, 'body parse error');
    },
  })
);

// logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

routing(app);

// 启动服务器
const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
