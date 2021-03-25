const Router = require('koa-router')
const koabody = require('koa-body')
const query = require('../util/db.js')


let router = new Router()

router
  .get('/tiezilist', koabody(), async (ctx) => {
    const max = ctx.query.listpage * 10
    const min = ctx.query.listpage * 10 - 10
    const res = await query(`select tiezis.*,users.username,users.avatar,tiezititleimages.imgurl from tiezis 
      left join users on tiezis.userid = users.userid
      left join tiezititleimages on tiezis.pid = tiezititleimages.pid and tiezititleimages.mian = TRUE order by tiezis.pid DESC limit ?,?`, [min, max])
    ctx.body = {
      code: 200,
      message: 'success',
      data: res
    }
  })
  .get('/tiezi', koabody(), async (ctx) => {
    const pid = ctx.query.pid
    // 帖子标题文本数据
    const textdata = await query('select tiezis.*,users.username,users.avatar from tiezis,users where tiezis.userid = users.userid and tiezis.pid = ?',[pid])
    // 图片数据
    const imgdata = await query('select * from tiezititleimages where pid = ?',[pid])
    ctx.body = {
      code: 200,
      message: 'success',
      textdata: textdata,
      imgdata: imgdata
    }
  })
  .get('/floors', koabody(), async (ctx) => {
    const pid = ctx.query.pid
    const resdata = await query('select comments.*,users.username,users.avatar from comments,users where users.userid = comments.userid and pid = ?',[pid])
    const imgdata = await query('select * from commentimgs where pid = ?',[pid])
    const floorcommentdata = await query(`select floorcomment.floorid,floorcomment.date,users.username,users.avatar,floorcomment.info from floorcomment,users 
    where floorcomment.userid = users.userid and floorcomment.pid = ?`, [pid])
    resdata.forEach(item => {
      item.imglist = []
      item.floorcomments = []
      for (let imgitem of imgdata) {
        if (item.floorid === imgitem.floorid) {
          item.imglist.push(imgitem.imgurl)
        }
      }
      for (let fcommentitem of floorcommentdata) {
        if (item.floorid === fcommentitem.floorid) {
          item.floorcomments.push(fcommentitem)
        }
      }
    });
    ctx.body = {
      code: 200,
      message: 'sucess',
      resdata
    }
  })


module.exports = router