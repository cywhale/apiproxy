import Proxy from "@fastify/http-proxy"

export default async function upstreamapp (fastify, opts) {
  fastify.register(Proxy, {
    upstream: 'https://api.obis.org/v3',
    prefix: '/node/obis',
    undici: true,
  })
}
