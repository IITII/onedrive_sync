/**
 * @author IITII <ccmejx@gmail.com>
 * @date 2021/10/25
 */
'use strict'
const fs = require('fs')
const path = require('path')
const {mapLimit} = require('async')
const {logger} = require('./logger')

/**
 * Calc how much time spent on run function.
 * @param prefix prefix
 * @param func {Function} Run function
 * @param args function's args
 */
async function spendTime(prefix = '', func, ...args) {
    return await new Promise(async (resolve, reject) => {
        let start = new Date()
        try {
            let res = await func.apply(this, args)
            return resolve(res)
        } catch (e) {
            return reject(e)
        } finally {
            logger.info(`${prefix} total spent ${time_human(Date.now() - start)}.`)
        }
    })
}

function time_human(mills, frac = 2) {
    const seconds = 1000
    const units = [
        {unit: 'd', value: 24 * 60 * 60 * seconds},
        {unit: 'h', value: 60 * 60 * seconds},
        {unit: 'm', value: 60 * seconds},
    ]
    let res = ''
    let time = mills
    units.forEach(u => {
        if (time >= u.value) {
            res += `${Math.floor(time / u.value)}${u.unit}`
            time %= u.value
        }
    })
    res += `${(time / seconds).toFixed(frac)}s`
    return res
}

function mkdir(abs, dirname = false) {
    abs = dirname ? path.dirname(abs) : abs
    if (!fs.existsSync(abs)) {
        logger.info(`Create dir: ${abs}`)
        fs.mkdirSync(abs, {recursive: true})
    }
}

async function sleep(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms))
}

function count(str, cnt_str) {
    if (!cnt_str) {
        return 0
    }
    let reg, rep_str, cnt = 0
    reg = new RegExp(cnt_str, 'g')
    rep_str = str.replace(reg, '')
    cnt = (str.length - rep_str.length) / cnt_str.length
    return cnt
}

function titleFormat(title) {
    let res = format_sub_title(title, ' ').trim()
    return res ? res : title
}

function format_sub_title(raw, multiSpace = '') {
    let res = raw
    res = res.replace(/[\[\]()+*.\\/\-—–?${}@!&\n\r~`|=#…%;；:：'"<>。，,《》【】「」、！￥（）～]/g, ' ')
    res = res.replace(/\d+月\d+日?会员(资源)?/g, ' ')
    res = res.replace(/写真(集|套图)/g, ' ')
    res = res.replace(/标题：?/g, ' ')
    res = res.replace(/email\s?protected/g, ' ')
    res = res.replace(/photos/g, ' ')
    res = res.replace(/Page\s\d+/g, ' ')
    res = res.replace(/P(\d+[MG]B)?(\d+V)?/ig, 'P')
    res = res.replace(/\s+/g, multiSpace)
    return res.trim()
}

function isPhoto(str, reg = /\S+\.(jpe?g|png|webp|gif|svg)$/i) {
    return reg.test(str)
}
function isVideo(str, reg = /\S+\.(mp4|mkv|flv|avi)$/i) {
    return reg.test(str)
}

function arrToAbsUrl(urls, origin) {
    return urls.map(u => toAbsUrl(u, origin))
}

function toAbsUrl(url, origin) {
    let base = url.startsWith('/') ? new URL(origin).origin : origin
    return url_resolve(base, url)
}

function url_resolve(from, to) {
    const resolvedUrl = new URL(to, new URL(from, 'resolve://'))
    if (resolvedUrl.protocol === 'resolve:') {
        // `from` is a relative URL.
        const {pathname, search, hash} = resolvedUrl
        return pathname + search + hash
    }
    return resolvedUrl.toString()
}

async function currMapLimit(array, limit = 10, func) {
    return mapLimit(array, limit, async (item, cb) => {
        return func(item).finally(cb)
    })
}

module.exports = {
    spendTime,
    time_human,
    mkdir,
    sleep,
    count,
    titleFormat,
    format_sub_title,
    isPhoto,
    isVideo,
    arrToAbsUrl,
    toAbsUrl,
    currMapLimit,
}
