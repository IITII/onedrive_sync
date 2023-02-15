/**
 * @author IITII <ccmejx@gmail.com>
 * @date 2022/05/26
 */
'use strict'
const fs = require('fs'),
  https = require('https'),
  path = require('path')
const opts = {
  origin: process.env.SYNC_ORIGIN || '',
  sync: {
    // 本地路径
    local: process.env.SYNC_LOCAL || '../tmp',
    // 同步模式, mix: 全部, img: 图片和文件夹
    mode: process.env.SYNC_MODE || 'img',
    // slow 模式, api 请求间隔, 单位: ms
    slow_time: process.env.SLOW_TIME || 500,
    target_round: 3,
  },
  download: {
    // 下载并发数
    limit: process.env.ZFILE_LIMIT || 3,
    // 下载后等待 ms
    sleep: process.env.ZFILE_SLEEP || 500,
  },
  // cache_file: process.env.SYNC_CACHE || '../cache.txt',
}

// DO NOT TOUCH UNLESS YOU KNOW WHAT YOU ARE DOING
opts.api = {
  cf: true,
  base: opts.origin,
  opts: {
    responseType: 'json',
  },
}

// DO NOT TOUCH UNLESS YOU KNOW WHAT YOU ARE DOING
const config = {
  DEBUG: process.env.SYNC_DEBUG === 'true',
  PROXY: process.env.PROXY,
  regex: /https:\/\/api.onedrive.com\/v1.0\/drives\/\w+\/items\/[\w\W]+\/children\?/,
  axios: {
    // proxy: process.env.PROXY,
    proxy: undefined,
    // 时间设置不合理可能会导致订阅超时失败
    timeout: 1000 * 20,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  },
  ...opts,
}

// DO NOT TOUCH UNLESS YOU KNOW WHAT YOU ARE DOING
if (!config.origin) {
  throw new Error('SYNC_ORIGIN is required')
}
if (!config.regex.test(config.origin)) {
  throw new Error('SYNC_ORIGIN is invalid')
}
config.searchParams = new URL( config.origin).searchParams
config.sync.local = path.resolve(__dirname, config.sync.local)
// config.cache_file = path.resolve(__dirname, config.cache_file)
// config.cache_file_bak = `${config.cache_file}.bak`
config.sync.slow_time = parseInt(config.sync.slow_time)
config.download.limit = parseInt(config.download.limit)
config.download.sleep = parseInt(config.download.sleep)
const headers = {
  Referer: config.origin,
  Host: new URL(config.origin).host,
  Connection: 'keep-alive',
}
config.api.opts.headers = {
  ...config.axios.headers,
  ...headers,
  ...config.api.opts.headers,
}
const proxy = process.env.PROXY?.replace(/https?:\/\//, '')
if (proxy) {
  config.axios.proxy = {
    host: proxy.split(':')[0],
    port: proxy.split(':')[1],
  }
}

module.exports = config
