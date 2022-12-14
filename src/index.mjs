'use strict'
import Fastify from 'fastify'
import Env from '@fastify/env'
import { readFileSync } from 'fs'
import { join } from 'desm'
import srvapp from './srvapp.mjs'

const configSecServ = async (certDir='../config') => {
  const readCertFile = (filename) => {
    return readFileSync(join(import.meta.url, certDir, filename))
  }
  try {
    const [key, cert] = await Promise.all(
      [readCertFile('privkey.pem'), readCertFile('fullchain.pem')])
    return {key, cert, allowHTTP1: true}
  } catch (err) {
    console.log('Error: certifite failed. ' + err)
    process.exit(1)
  }
}

const startServer = async () => {
  const PORT = process.env.PORT || 3023;
  const {key, cert, allowHTTP1} = await configSecServ()
  const fastify = Fastify({
      http2: true,
      trustProxy: true,
      https: {key, cert, allowHTTP1},
      requestTimeout: 5000,
      logger: true,
      ajv: {
        customOptions: {
          coerceTypes: 'array'
        }
      }
  })

  fastify.register(Env, {
    dotenv: {
      path: join(import.meta.url, '../config', '.env'),
    },
    schema: {
      type: 'object',
      required: ['DOMAIN'], //'BIOQRY_HOST','BIOQRY_BASE'],
      properties: {
        DOMAIN: { type: 'string' },
        //BIOQRY_HOST: { type: 'string' },
        //BIOQRY_BASE: { type: 'string' }
      }
    }
  }).ready((err) => {
    if (err) console.error(err)
  })

  fastify.register(srvapp)

  fastify.listen({ port: PORT }, function (err, address) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
    fastify.log.info(`server listening on ${address}`)
  })
}

startServer()
