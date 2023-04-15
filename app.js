const Koa = require('koa');
const router = require('./src/router');
const bodyParser = require('koa-bodyparser');
const https = require('https');
const fs = require('fs');
const enforceHttps = require('koa-sslify');

console.log = ()=>{};
console.warn = ()=>{};
// console.error = ()=>{};
const app = new Koa();

// Force HTTPS on all page
// app.use(enforceHttps());

// CORS
app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*")
  await next()
})

// log request URL:
app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
  await next();
});

// add router middleware:
app.use(bodyParser());
app.use(router.routes());

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/marslab.top/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/marslab.top/fullchain.pem')
};
https.createServer(options, app.callback()).listen(1080, () => {
  console.log('app started at port 1080...');
});
