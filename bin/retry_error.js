// /**
//  * @author IITII <ccmejx@gmail.com>
//  * @date 2022/12/10
//  */
// 'use strict'
// let reg_raw, reg, retry_base, url_replace, error_log_name, log_dir, error_log_path
// reg_raw = process.env.SYNC_RETRY_REG || '^https?://'
// retry_base = process.env.SYNC_RETRY_BASE || '../tmp/retry'
// url_replace = process.env.SYNC_RETRY_REPLACE || '/file/1'
// error_log_name = process.env.SYNC_RETRY_LOG_NAME || 'errors.log'
// log_dir = process.env.SYNC_RETRY_LOG_DIR || '../logs'
//
// const fs = require('fs')
// const path = require('path')
// const {logger} = require('../libs/logger.js')
// const {isPhoto, isVideo, titleFormat, spendTime} = require('../libs/utils.lib.js')
// const {downloadFiles} = require('../libs/dl.utils.js')
//
// reg = new RegExp(reg_raw, 'g')
// retry_base = path.resolve(__dirname, retry_base)
// log_dir = path.resolve(__dirname, log_dir)
// error_log_path = path.resolve(log_dir, error_log_name)
//
// const lineReader = require('readline').createInterface({
//   input: fs.createReadStream(error_log_path)
// })
//
// let arr = []
// lineReader.on('line', line => {
//   if (line && line.trim()) {
//     line = line.replace(/'/g, '')
//     line = line.replace(/,/g, ' ')
//     line = line.trim()
//     if (reg.test(line)) {
//       arr.push(line)
//     }
//   }
// })
//
// lineReader.on('close', async () => {
//   await spendTime(`Retry download from ${error_log_path}`, handle)
// })
//
// async function handle() {
//   logger.info(`Total ${arr.length} lines, rm dup...`)
//   arr = [...new Set(arr)]
//   logger.info(`Unique ${arr.length} lines, filter media...`)
//   arr = arr.filter(_ => isPhoto(_) || isVideo(_))
//   logger.info(`Media ${arr.length} lines, downloading...`)
//   arr = arr.map(r => {
//     let decoded, path_arr, filename, local
//     decoded = new URL(r).pathname
//     decoded = decodeURI(decoded)
//     if (url_replace) {
//       decoded = decoded.replace(url_replace, '')
//     }
//     decoded = decoded.replace(/^\/+/g, '')
//     path_arr = decoded.split('/').filter(_ => !!_).map(_ => _.trim())
//     filename = path_arr.pop()
//     path_arr = path_arr.map(_ => titleFormat(_))
//     local = path.resolve(retry_base, ...path_arr, filename)
//     return {url: r, local}
//   })
//   await downloadFiles(arr, retry_base)
// }
