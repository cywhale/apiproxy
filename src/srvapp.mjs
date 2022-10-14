//import AutoLoad from '@fastify/autoload'
import Cors from '@fastify/cors'
//import ReplyFrom from '@fastify/reply-from'
//import Proxy from "@fastify/http-proxy"
import { join } from 'desm'
import upstreamapp from './upstream.mjs'

const BASE = 'node'

export default async function (fastify, opts) {
  fastify.decorate('conf', {
    node_env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    basedir: `/${BASE}`
  })

  fastify.register(Cors, (instance) => {
    return (req, callback) => {
      const corsOptions = {
        origin: true,
        credentials: true,
        preflight: true,
        preflightContinue: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Keep-Alive', 'User-Agent',
                         'Cache-Control', 'Authorization', 'DNT', 'X-PINGOTHER', 'Range'],
        exposedHeaders: ['Content-Range'],
        maxAge: 86400,
      };
      // do not include CORS headers for requests from localhost
      if (/^localhost$/m.test(req.headers.origin)) {
        corsOptions.origin = false
      }
      callback(null, corsOptions)
    }
  })

  fastify.register(upstreamapp)
/*fastify.register(ReplyFrom)

  fastify.register(AutoLoad, {
    dir: join(import.meta.url, 'routes'),
    dirNameRoutePrefix: false,
    options: Object.assign({}, opts)
  })*/
}

