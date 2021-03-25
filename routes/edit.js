const koaRouter = require('koa-router')
const fs = require('fs')
const path = require('path')
const koabody = require('koa-body')

const query = require('../util/db.js')

const baseurl = 'http://192.168.0.101:3000'

let router = new koaRouter()

router
  // 发帖 
  .post('/fatie', koabody({ multipart: true }), async (ctx) => {
    const files = ctx.request.files.file
    const pinfo = ctx.request.body

    // 帖子文本信息
    const date = new Date()
    const datezz = date.toLocaleString()

    // 帖子图片信息
    // if有图片
    if (files) {
      await query('insert into tiezis values(null,?,?,?,?)',[pinfo.userid,pinfo.title,datezz,true])
      const res = await query('select pid from tiezis where userid = ? and pdate = ?',[pinfo.userid,datezz])
      // if 有多张图片
      if (Array.isArray(files)) {
        files.forEach( function(item, index) {
          const reader = fs.createReadStream(item.path)
          let filepath = path.join(__dirname.slice(0,__dirname.lastIndexOf('\\')), '/public/img/ptitle/' + item.name)
          const upString = fs.createWriteStream(filepath)
          reader.pipe(upString)
          const imgurl = baseurl + '/img/ptitle/' + item.name
          if (index === 0) {
            query('insert into tiezititleimages values(null,?,?,?)',[res[0].pid,imgurl,true])
          } else {
            query('insert into tiezititleimages values(null,?,?,?)',[res[0].pid,imgurl,false])
          }
          
        })      
      } else {
        const reader = fs.createReadStream(files.path)
        let filepath = path.join(__dirname.slice(0,__dirname.lastIndexOf('\\')), '/public/img/ptitle/' + files.name)
        const upString = fs.createWriteStream(filepath)
        reader.pipe(upString)
        const imgurl = baseurl + '/img/ptitle/' + files.name
        query('insert into tiezititleimages values(null,?,?,?)',[res[0].pid,imgurl,true])
      }      
    } else {
      await query('insert into tiezis values(null,?,?,?,?)',[pinfo.userid,pinfo.title,datezz,false])
    }

    ctx.body = ({
      code: 200,
      message: 'success'
    })
  })
  // 评论
  .post('/comment', koabody({ multipart: true }), async (ctx) => {
    const files = ctx.request.files.file
    const textdata = ctx.request.body
    // 当前时间
    const date = new Date()
    const datezz = date.toLocaleString()
    // 回复某一楼
    if (textdata.infloor === 'true') {
      await query('insert into floorcomment values(null,?,?,?,?,?)',
      [textdata.pid,textdata.floorid,textdata.userid,textdata.title,datezz])
      await query('update comments set haveinfloor = TRUE where pid = ? and floorid = ?',
      [textdata.pid,textdata.floorid])
      ctx.body = {
        code: 200,
        message: 'success'
      }
    } else {
      // 回复帖子
      // 如果带图
      if (files) {
        // 保存文本数据
        await query('insert into comments values(null,?,?,?,?,?,TRUE,FALSE)',[textdata.pid,textdata.userid,textdata.floorid,textdata.title,datezz])
        // 如果带多张图
        if (Array.isArray(files)) {
          files.forEach( function(item, index) {
            const reader = fs.createReadStream(item.path)
            let filepath = path.join(__dirname.slice(0,__dirname.lastIndexOf('\\')), '/public/img/ptitle/' + item.name)
            const upString = fs.createWriteStream(filepath)
            reader.pipe(upString)
            const imgurl = baseurl + '/img/ptitle/' + item.name
            console.log(imgurl)
            query('insert into commentimgs values(?,?,?)',[textdata.pid,textdata.floorid,imgurl])
          }) 
        } else {
          const reader =fs.createReadStream(files.path)
          let filepath = path.join(__dirname.slice(0,__dirname.lastIndexOf('\\')), '/public/img/ptitle/' + files.name)
          const upString = fs.createWriteStream(filepath)
          reader.pipe(upString)
          const imgurl = baseurl + '/img/ptitle/' + files.name
          query('insert into commentimgs values(?,?,?)',[textdata.pid,textdata.floorid,imgurl])
        }
      } else {
        await query('insert into comments values(null,?,?,?,?,?,FALSE,FALSE)',[textdata.pid,textdata.userid,textdata.floorid,textdata.title,datezz])
      }
      ctx.body = ({
        code: 200,
        message: 'success'
      })
    }
  })

module.exports = router