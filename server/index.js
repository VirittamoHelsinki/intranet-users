const { port } = require('./config')
const app = require('./app')

// Start server on the configured port.
app.listen(port, () => {
  console.log('Service listening on port:', port)
})