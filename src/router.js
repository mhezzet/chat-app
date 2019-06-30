export default function(app, express) {
  app.use(express.static('./src/public'))
}
