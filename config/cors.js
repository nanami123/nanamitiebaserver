const CORS_CONFIG = {
  origin: () => 'http://localhost:8080',
  credentials: true,
  allowMethods: ["get", "post", "delete"],
  exposeHeaders: ["Authorization"],
  allowHeaders: ["Content-Type", "Authorization", "Accept"]
}

module.exports = {
  CORS_CONFIG
}