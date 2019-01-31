const http = require('http')
const fs = require('fs')
const path = require('path')

const CONFIG = {}

// Parse first 2 arguments, which can be port and folder to serve from
const args = process.argv.slice(2, 4)
CONFIG.LOCAL_PORT = args.filter(arg => !isNaN(arg))[0] || 3000
CONFIG.APP_ROOT = args.filter(arg => isNaN(arg))[0] || 'webapp'

// Read project's server settings, then start server
fs.readFile('bmw-ui5.yaml', 'utf8', (error, contents) => {
  if (error) {
    return console.log(error)
  }
  const lines = contents
  .replace(/\r?\n|\r/g, '\n')
  .split('\n')
  .filter(line => line[0] !== '#' && line.length !== 0)
  lines.forEach(line => {
    const colonIndex = line.indexOf(':')
    const key = line.slice(0, colonIndex)
    let value = line.slice(colonIndex + 1, line.length).trim()
    CONFIG[key] = value
  })
  CONFIG.LOCAL_RESOURCES = `../../resources/sapui5-sdk-${CONFIG.SAPUI5_VERSION}`
  createServer()
})

function createServer() {
  const server = http.createServer((request, response) => {
    console.log(`Start: ${request.url}`)
    if (request.url.match(/\/sap\/opu.*/)) {
      proxy(request, response)
    } else {
      local(request, response)
    }
  })
  server.listen(CONFIG.LOCAL_PORT, (error) => {
    if (error) {
      return console.log('Could not start server', error)
    }
    console.log(
      `
      Serving App from ${CONFIG.APP_ROOT}
      Serving Resources from ${CONFIG.LOCAL_RESOURCES}
      Serving OData from ${CONFIG.FES_HOST}:${CONFIG.FES_PORT}

      Listening on port ${CONFIG.LOCAL_PORT}
      Press Ctrl-C to stop server

      Open http://localhost:${CONFIG.LOCAL_PORT} to run app
      Open http://localhost:${CONFIG.LOCAL_PORT}/demokit to run the UI5 Demo Kit
      `
    )
  })
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(
        `
        ERROR: Port ${error.port} already in use. Stop the server on the port or try another port.

        For example, to try port 3001, run:

        npm start 3001
        `
      )
    } else {
      console.log(error)
    }
  })
  process.on('SIGINT', function() {
    console.log(
      `
      Shutting down server.
      `
    );
    process.exit(1);
  });
}

/** Proxy for SAP OData server
*/
function proxy(client_req, client_res) {
  client_res.setHeader('Access-Control-Allow-Origin', '*') // Avoid CORS issues
  const options = {
    hostname: CONFIG.FES_HOST,
    port: CONFIG.FES_PORT,
    path: client_req.url,
    method: client_req.method,
    headers: client_req.headers
  }
  console.log(`Proxy: ${options.hostname}:${options.port}${options.path}`)
  const proxy = http.request(options, (res) => {
    client_res.writeHead(res.statusCode, res.headers)
    res.pipe(client_res, {
      end: true
    })
  })
  client_req.pipe(proxy, {
    end: true
  })
  client_req.on('error', (error) => {
    console.log(`ERROR: ${client_req.url}: ${error.message}`)
  })
  proxy.on('error', (error) => {
    console.log(`ERROR: ${client_req.url}: ${error.message}`)
  })
  proxy.on('finish', () => {
    console.log(`End: ${client_req.url}`);
  })
}

/** Serve local files
*/
function local(request, response) {
  let extName = String(path.extname(request.url)).toLowerCase()
  const dotFile = request.url.match(/\.[a-z]*$/) !== null
  if (!extName && !dotFile) {
    // Temporary redirect 302
    const endChar = request.url.slice(request.url.length - 1)
    const newUrl = `${request.url}${endChar === '/' ? '' : '/'}index.html`
    console.log(`Redirect to ${newUrl}`)
    response.writeHead(302,
      {Location: newUrl}
    );
    response.end();
  } else {
    // Serve local file
    let filePath
    if (request.url.match(/^\/resources.*/)) {
      filePath = `${CONFIG.LOCAL_RESOURCES}${request.url}`
      .replace('sap-ui-cachebuster/', '')
    } else if (request.url.match(/^\/demokit\/resources.*/)) {
      filePath = `${CONFIG.LOCAL_RESOURCES}${request.url}`
      .replace('demokit/', '')
    } else if (request.url.match(/^\/demokit.*/)) {
      filePath = `${CONFIG.LOCAL_RESOURCES}${request.url}`.replace('demokit/', '')
    } else {
      filePath = `${CONFIG.APP_ROOT}${request.url}`
    }
    console.log(`Local: ${request.url}`)
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.gif': 'image/gif',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.woff': 'application/font-woff',
      '.ttf': 'application/font-ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.otf': 'application/font-otf',
      '.svg': 'application/image/svg+xml'
    }
    const contentType = mimeTypes[extName] || 'application/octet-stream'
    fs.readFile(filePath, (error, content) => {
      if (error) {
        if(error.code == 'ENOENT') {
          response.writeHead(404)
          response.end('Not found')
        } else {
          response.writeHead(500);
          response.end(`Error: ${error.code} ${error.message}`)
        }
      }
      else {
        response.writeHead(200, { 'Content-Type': contentType })
        response.end(content, 'utf-8')
      }
    })
  }

}
