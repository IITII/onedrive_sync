/**
 * @author IITII <ccmejx@gmail.com>
 * @date 2022/05/26
 */
'use strict'
const fs = require('fs'),
  https = require('https'),
  path = require('path')
const opts = {
  origin: process.env.SYNC_ORIGIN || 'https://63v7q8-my.sharepoint.com/personal/hope773715568_63v7q8_onmicrosoft_com/_api/web/GetListUsingPath(DecodedUrl=@a1)/RenderListDataAsStream?@a1=%27%2Fpersonal%2Fhope773715568%5F63v7q8%5Fonmicrosoft%5Fcom%2FDocuments%27&RootFolder=%2Fpersonal%2Fhope773715568%5F63v7q8%5Fonmicrosoft%5Fcom%2FDocuments%2F%E5%86%99%E7%9C%9F&TryNewExperienceSingle=TRUE',
  cookie: process.env.SYNC_COOKIE || 'FedAuth=77u/PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48U1A+VjEzLDBoLmZ8bWVtYmVyc2hpcHx1cm4lM2FzcG8lM2Fhbm9uI2NmMTA4Y2E5ZTNmYmQ3MGI4OWMwMzlhZWE0MzcyNGE0NWVhYjVmMDE2MTkzODM0ZjQzYzNmZTQwNWRiNzUwYTAsMCMuZnxtZW1iZXJzaGlwfHVybiUzYXNwbyUzYWFub24jY2YxMDhjYTllM2ZiZDcwYjg5YzAzOWFlYTQzNzI0YTQ1ZWFiNWYwMTYxOTM4MzRmNDNjM2ZlNDA1ZGI3NTBhMCwxMzMyMTAyNTQ3MTAwMDAwMDAsMCwxMzMyMTExMTU3MTM3MzQ4MjUsMC4wLjAuMCwyNTgsZTc1ODBlNmEtODMxNy00YTExLTliYTctYjQyMDM2MWZmOTZhLCwsZjljNjk2YTAtMTBmMS0zMDAwLTNiYzMtYzhhYmZlYjhiMTIzLGY5YzY5NmEwLTEwZjEtMzAwMC0zYmMzLWM4YWJmZWI4YjEyMyxlMFI5eEY0NnMwR1Mxb0VqN1hubFR3LDAsMCwwLCwsLDI2NTA0Njc3NDM5OTk5OTk5OTksMCwsLCwsLCwwLCxVU18yMTNfQ29udGVudCxEYS9uWEZhVHQ4V1pqK3BNNHRCVlZkc3o5NHBaLzM0d0d3MTJWVWl6dStFOGQzRFd0TkE0SzkrRVNwcDV3WldjQ0hXeHNBV0kyZkdVRVA2NDB4NzI2UFZFYWN2RGFLUm0wRXZmOFpDVWJSTW9ZSmY2YmhNVnprbE9rRUg3VlNzQXdrNy83UGlPUVR4ZnZ4VXdZSEtTZFo2VHJtTmxpVkZXdS9sUEhPa1h6eTFFaTl5MTZPSXZLQkIwVWJCWWUybjFzMlpOamd1d29kS1NVNEJ6MnhFSzIzN2o2VWFIbS9lRndtd3dWeWFxNDIwUi9zVlVhaUh1SGl6QW1oWm0wTTNHSWg2aFZES0xwMDYrWWZwMmF1TUlYamJmRndnWjVQVGtlTUR4V3JIdWxWQUQzb2VYc0RJbUtZYlpZQjJyMnNvTWpDQjlWZzEra3VIR2JDTTRHcVg2UkE9PTwvU1A+',
  downloadUrl: process.env.SYNC_DOWNLOAD || 'https://63v7q8-my.sharepoint.com/personal/hope773715568_63v7q8_onmicrosoft_com/_layouts/15/download.aspx?UniqueId=6FF8216B-33F9-4C7E-AC58-8CB10B1F8EAD',
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
  headers: {
    'Cookie': opts.cookie,
  }
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
      ...opts.api.headers,
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
// if (!config.regex.test(config.origin)) {
//   throw new Error('SYNC_ORIGIN is invalid')
// }
config.downloadUrl = new URL(config.downloadUrl)
config.searchParams = new URL(config.origin).searchParams
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
