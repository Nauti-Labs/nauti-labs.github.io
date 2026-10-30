#!/usr/bin/env node
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
const port = Number(process.env.PORT || 8088)
const hostRoots = {
  'neighbors.nauti-labs.com': 'neighbors',
  'maritime.nauti-labs.com': 'maritime',
}
const localHosts = new Set(['', '127.0.0.1', 'localhost'])

const hostRedirects = {
  'ai.nauti-labs.com': 'https://nauti-labs.com/#ai',
  'crypto.nauti-labs.com': 'https://nauti-labs.com/#crypto',
}

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

function getHost(req) {
  return String(req.headers.host || '').split(':')[0].toLowerCase()
}

function resolvePath(req) {
  const host = getHost(req)
  const hostRoot = hostRoots[host] || (localHosts.has(host) ? 'neighbors' : null)
  if (!hostRoot) return null
  const urlPath = req.url || '/'
  const path = decodeURIComponent(urlPath.split('?')[0] || '/')
  if (path === '/' || path === '/index.html') return join(root, hostRoot, 'index.html')

  const safePath = normalize(path).replace(/^(\.\.(\/|\\|$))+/, '')
  const candidate = resolve(root, safePath.replace(/^\/+/, ''))
  if (!candidate.startsWith(root)) return null
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  return null
}

createServer((req, res) => {
  const redirect = hostRedirects[getHost(req)]
  if (redirect) {
    res.writeHead(302, { location: redirect })
    res.end()
    return
  }

  const file = resolvePath(req)
  if (!file) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Not found')
    return
  }

  res.writeHead(200, {
    'cache-control': 'public, max-age=60',
    'content-type': types[extname(file)] || 'application/octet-stream',
  })
  createReadStream(file).pipe(res)
}).listen(port, '127.0.0.1', () => {
  console.log(`Practice static server listening on http://127.0.0.1:${port}`)
})
