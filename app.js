const Koa = require('koa2')
const Router = require('koa-router')
const cors = require('koa2-cors')
const path = require('path')

const app = new Koa()

// 配置跨域
app.use(
  cors({
    origin: () => 'http://localhost:8080',
    // origin: () => 'http://192.168.0.101:8080',
    credentials: true,
    allowMethods: ["get", "post", "delete"],
    exposeHeaders: ["Authorization"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"]
  })
)

// 静态资源
app.use(require('koa-static')(path.join(__dirname) + '/public'))

let home = require('./routes/home')
let user = require('./routes/user')
let edit = require('./routes/edit')

app.use(home.routes())
app.use(user.routes())
app.use(edit.routes())

app.listen(3000, () => {
  console.log(`服务器启动成功`)
})
