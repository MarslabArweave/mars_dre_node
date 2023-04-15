const warpWrapper = require('./warpWrapper');
const router = require('koa-router')();

const warp = new warpWrapper();
// start schedule tasks
warp.scheduleUpdateState();

router.get('/', async (ctx, next) => {
  ctx.response.body = '<h1>Mars-DRE-Node</h1>';
});

router.get('/status', async (ctx, next) => {
  ctx.response.type = 'application/json';
  ctx.response.body = {
    contractPoolSize: warp.contractPoolSize()
  };
});

router.get('/v1/contract/viewState', async (ctx, next) => {
  var code = 200;
  var data = {};
  var msg = {};
  try {
    const id = ctx.query.id;
    const action = JSON.parse(ctx.query.action);
    data = await warp.viewState(id, action);
  } catch (err) {
    code = 500;
    msg = {name: err.name, message: err.message, stack: err.stack};
  }

  ctx.response.type = 'application/json';
  ctx.response.body = {version: 'v1', code, data, msg};
});

router.get('/v1/contract/readState', async (ctx, next) => {
  var code = 200;
  var data;
  var msg;
  try {
    const id = ctx.query.id;
    const option = ctx.query.option;
    data = await warp.readState(id, option);
  } catch (err) {
    code = 500;
    msg = {name: err.name, message: err.message, stack: err.stack};
  }

  ctx.response.type = 'application/json';
  ctx.response.body = {version: 'v1', code, data, msg};
});

module.exports = router;