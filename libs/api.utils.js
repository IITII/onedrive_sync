/**
 * @author IITII <ccmejx@gmail.com>
 * @date 2022/12/09
 */
'use strict'

const path = require('path')
const {axios} = require('./axios_client.js')
const cloudscraper = require('cloudscraper')
const {api} = require('../config/config.js')
const {logger} = require('./logger.js')
const {titleFormat} = require('./utils.lib.js')

async function api_get(url, params = {}) {
  let res, full_url
  full_url = new URL(url, api.base).toString()
  if (api.cf) {
    res = cloudscraper({
      uri: full_url,
      formData: params,
    }).then(_ => JSON.parse(_))
  } else {
    res = axios.get(full_url, {...api.opts, params})
      .then(res => res.data)
  }
  return await res
}

async function list_dir(tar_url, res = []) {
  let url, params, tmp, count, values, nextLink
  url = new URL(tar_url)
  url.searchParams.set('$top', '1000')
  url = url.toString()
  tmp = await api_get(url, {})
  count = tmp['@odata.count']
  values = tmp.value
  nextLink = tmp['@odata.nextLink']
  res = res.concat(values)
  if (nextLink) {
    logger.info(`list dir: ${res.length}/${count}, nextLink: ${nextLink}`)
    return await list_dir(nextLink, res)
  } else {
    res = res.map(_ => {
      let {id, name, size} = _
      let parseName, downloadUrl, file, mime, folder, pid, link
      parseName = path.parse(name)
      downloadUrl = _['@content.downloadUrl']
      file = !!_.file
      folder = !!_.folder
      mime = _?.file?.mimeType
      pid = _?.parentReference?.id
      link = url.replace(pid, id)

      if (file) {
        name = titleFormat(parseName.name) + parseName.ext
      } else {
        name = titleFormat(name)
      }
      return {id, name, size, downloadUrl, file, folder, mime, pid, link}
    })
    return Promise.resolve(res)
  }
}

module.exports = {
  api_get,
  list_dir,
}
