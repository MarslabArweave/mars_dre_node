const { WarpFactory, LoggerFactory, defaultCacheOptions } = require('warp-contracts');
const {LmdbCache} = require("warp-contracts-lmdb");
const schedule = require('node-schedule');


class warpWrapper {
  constructor(env='mainnet') {
    LoggerFactory.INST.logLevel('error');

    var warp = WarpFactory.forMainnet();
    if (env === 'local') {
      warp = WarpFactory.forLocal(1984);
    }

    // set cache option
    warp.useStateCache(new LmdbCache({
        ...defaultCacheOptions,
        dbLocation: `./cache/warp/state`
      }, {
        maxEntriesPerContract: 100, 
        minEntriesPerContract: 10
      }
    ))
    .useContractCache(
      // Contract cache
      new LmdbCache({
      ...defaultCacheOptions,
      dbLocation: `./cache/warp/contracts`
      }), 
      // Source cache
      new LmdbCache({
      ...defaultCacheOptions,
      dbLocation: `./cache/warp/src`
    }));

    this.warp = warp;
    this.contractPool = new Set();
  }

  scheduleUpdateState() {
    schedule.scheduleJob('0 * * * * *', async () => {
      for (const contractID of this.contractPool) {
        try {
          await this.readState(contractID);
        } catch (err) {}
      }
    });
  }

  async viewState(contractID, action) {
    const contract = this.warp.contract(contractID);
    contract.setEvaluationOptions({
      internalWrites: true,
      useVM2: true
    });
    const ret = await contract.viewState(action);
    this.contractPool.add(contractID);
    return ret;
  }

  async readState(contractID, option) {
    const contract = this.warp.contract(contractID);
    contract.setEvaluationOptions({
      internalWrites: true,
      useVM2: true
    });
    var ret;
    if (option === undefined) {
      ret = await contract.readState();
    } else {
      const blockHeight = Number(option);
      ret = await contract.readState(blockHeight);
    }
    this.contractPool.add(contractID);
    return ret;
  }

  contractPoolSize() {
    return this.contractPool.size;
  }
}

module.exports = warpWrapper;