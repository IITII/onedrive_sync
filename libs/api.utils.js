/**
 * @author IITII <ccmejx@gmail.com>
 * @date 2022/12/09
 */
'use strict'

const path = require('path')
const {axios} = require('./axios_client.js')
const {api, origin, cookie, downloadUrl} = require('../config/config.js')
let cloudscraper = require('cloudscraper')
const {logger} = require('./logger.js')
const {titleFormat} = require('./utils.lib.js')

cloudscraper = cloudscraper.defaults({headers: {...cloudscraper.defaultParams.headers, ...api.headers}})

// api_get(origin, {}, 'POST').then(_ => {
api_get('https://63v7q8-my.sharepoint.com/personal/hope773715568_63v7q8_onmicrosoft_com/_api/web/GetListUsingPath(DecodedUrl=@a1)/RenderListDataAsStream?@a1=\'/personal/hope773715568_63v7q8_onmicrosoft_com/Documents\'&RootFolder=/personal/hope773715568_63v7q8_onmicrosoft_com/Documents/写真/六味帝皇酱/六味帝皇酱 - 脱在分手后&TryNewExperienceSingle=TRUE', {}, 'POST').then(_ => {
  console.log(_)
}).catch(e =>{
  console.log(e)
})

async function api_get(url, params = {}, method = 'get') {
  let res, full_url
  full_url = new URL(url, api.base).toString()
  if (api.cf) {
    res = cloudscraper({
      method,
      uri: full_url,
      formData: params,
    }).then(_ => JSON.parse(_))
  } else {
    res = method === 'get' ? axios.get(full_url, {...api.opts, params})
      : axios.post(full_url, params, api.opts)
    res = res.then(res => res.data)
  }
  return await res
}

async function list_dir(tar_url, res = []) {
  let url, params, tmp, count, values, nextLink
  url = tar_url
  tmp = await api_get(url, {}, 'POST')
  // count = tmp['@odata.count']
  values = tmp['Row']
  nextLink = tmp['NextHref']
  let {FirstRow, LastRow} = tmp
  res = res.concat(values)
  if (nextLink) {
    nextLink = nextLink.startsWith('?') ? tar_url + nextLink : nextLink
    logger.info(`cur: ${FirstRow} -> ${LastRow}, nextLink: ${nextLink}`)
    return await list_dir(nextLink, res)
  } else {
    res = res.map(_ => {
      let {UniqueId, FileRef, FileSizeDisplay, FSObjType} = _
      let FileLeafRefName, FileLeafRefSuffix
      FileLeafRefName = tmp['FileLeafRef.Name']
      FileLeafRefSuffix = tmp['FileLeafRef.Suffix']

      let id, name, folder, downloadUrl, link

      downloadUrl.searchParams.set('UniqueId', UniqueId)
      downloadUrl = downloadUrl.toString()
      // let parseName, downloadUrl, file, mime, folder, pid, link
      // parseName = path.parse(name)
      // downloadUrl = _['@content.downloadUrl']
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
