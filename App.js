/**
 * @author IITII <ccmejx@gmail.com>
 * @date 2022/12/08
 */
'use strict'

const fs = require('fs'),
  path = require('path')

const {logger} = require('./libs/logger.js')
const {list_dir} = require('./libs/api.utils.js')
const {origin, sync} = require('./config/config.js')
const {sleep, isPhoto, spendTime, time_human} = require('./libs/utils.lib.js')
const {downloadFiles} = require('./libs/dl.utils.js')
let start = Date.now()

async function main() {
  // return list_dir(origin)
  return await spendTime(`sync onedrive`, sync_bfs, origin, sync.local)
}

async function sync_dfs(url, local) {
  let dirs = await list_dir(url)
  for (const dir of dirs) {
    const tmp_local = path.resolve(local, dir.name)
    logger.info(`sync: ${dir.name} -> ${tmp_local}`)
    if (dir.folder === true) {
      logger.info(`sleep ${sync.slow_time}ms for slow down`)
      await sleep(sync.slow_time)
      await sync_dfs(dir.url, tmp_local)
    } else if (dir.file === true) {
      if (sync.mode === 'img' && !isPhoto(dir.name)) {
        continue
      }
      await downloadFiles([{url: dir.downloadUrl, local: tmp_local}])
    } else {
      logger.error(`unknown file: ${JSON.stringify(dir)}`)
    }
  }
}

async function sync_bfs(url, local) {
  let name = 'root', queue = [{name, url, local}], tmp = [], round = 1
  while (queue.length > 0) {
    const shift = queue.shift()
    if (shift) {
      const {name, url, local} = shift
      logger.info(`sync: ${name} -> ${local}`)
      const dirs = await list_dir(url)
      let files, folders, unknown
      files = dirs.filter(dir => dir.file === true)
      folders = dirs.filter(dir => dir.folder === true)
      unknown = dirs.filter(dir => dir.file !== true && dir.folder !== true)
      if (unknown.length > 0) {
        logger.error(`unknown file: ${JSON.stringify(unknown)}`)
      }
      if (sync.mode === 'img') {
        files.filter(file => !isPhoto(file.name)).forEach(file => logger.info(`skip file: ${file.name}`))
        files = files.filter(file => isPhoto(file.name))
      }
      if (files.length > 0) {
        files = files.map(f => ({url: f.downloadUrl, local: path.resolve(local, f.name)}))
        logger.info(`download files: ${files.length}`)
        await downloadFiles(files, local)
      }
      tmp = tmp.concat(folders.map(f => ({name: f.name, url: f.link, local: path.resolve(local, f.name)})))

      logger.info(`sleep ${sync.slow_time}ms for slow down`)
      await sleep(sync.slow_time)
    }

    logger.info(`round: ${round}: remain ${queue.length + tmp.length} tasks, total: ${time_human(Date.now() - start)}`)
    if (queue.length === 0) {
      queue = tmp
      tmp = []
      round += 1
    }
  }
}

function stop() {
  logger.info(`running time: ${time_human(Date.now() - start)}`)
  process.exit(0)
}

process.on('SIGINT' || 'SIGTERM', stop)

spendTime(`Sync at ${new Date()}`, main)
  .then(r => logger.info(`${r || 'sync'} done`))
  .catch(e => logger.error(e))
  .finally(stop)

