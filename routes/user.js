const Router = require('koa-router')
const fs = require('fs')
const query = require('../util/db.js')
const path = require('path')
// const connection = require('../util/db.js')
const koabody = require('koa-body')

const baseurl = '192.168.0.101:3000'

let router = new Router()

router
  // 用户注册
  .post('/register', koabody(), async (ctx) => {
  let res = await query('select * from users where username = ?',[ctx.request.body.username])
  if (res[0]) {
    ctx.body = {
      code: 1,
      message: '用户已经存在'
    }
  } else {
    const avatarurl = 'http://'+ baseurl + '/img/avatartest.jpg'
    let res = await query('insert into users(username,password,avatar) values (?,?,?)', 
    [ctx.request.body.username, ctx.request.body.password,avatarurl])
    if (res[0]) {
      ctx.body = {
        code : 2,
        message: '用户创建失败'
      }
    }
    let userinfo = await query('select * from users where username = ?',[ctx.request.body.username])
    // console.log(userinfo[0])
    ctx.body = {
      code: 200,
      message: '用户创建成功',
      userinfo: userinfo[0]
    }
  }
  })
  // 用户登录
  .post('/login', koabody(),async (ctx) => {
    let res = await query('select * from users where username = ? and password = ?',[ctx.request.body.username,ctx.request.body.password])
    if (res[0]) {
      ctx.body = {
        code: 200,
        message: '登录成功',
        userinfo: res[0]
      }
    } else {
      ctx.body = {
        code: 1,
        message: '用户名或者密码错误'
      }
    }
  })
  // 用户上传头像
  .post('/avatar', koabody({ multipart: true }), async (ctx) => {
    const avatar = ctx.request.files.avatar
    const reader = fs.createReadStream(avatar.path)
    let filepath = path.join(__dirname.slice(0,__dirname.lastIndexOf('\\')), '/public/img/avatar/' + avatar.name)
    const upStream = fs.createWriteStream(filepath);
    reader.pipe(upStream)
    const avatarurl = 'http://'+ baseurl + '/img/avatar/' + avatar.name
    query('update users set avatar = ? where userid = ?',[avatarurl,ctx.request.body.userid])
    ctx.body = {
      code: 200,
      message: '上传成功',
      avatar: avatarurl
    }
  })
  // 用户修改Name
  .post('/changename', koabody(), async (ctx) => {
    let req = ctx.request.body
    let res = await query('update users set username = ? where userid = ?',[req.username, req.userid])
    ctx.body = {
      code: 200,
      message: '修改成功'
    }
  })
  // 修改gender
  .post('/changegender', koabody(), async (ctx) => {
    let req = ctx.request.body
    let res = await query('update users set gender = ? where userid = ?',[req.gender, req.userid])
    ctx.body = {
      code: 200,
      message: '修改成功'
    }
  })
  // 修改introduce
  .post('/introduce', koabody(), async (ctx) => {
    let req = ctx.request.body
    await query('update users set introduction = ? where userid = ?',[req.introduction, req.userid])
    ctx.body = {
      code: 200,
      message: '修改成功'
    }
  })

module.exports = router