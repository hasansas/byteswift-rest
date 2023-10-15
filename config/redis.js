/**
 * Redis
 */

const redis = require('redis')

class Redis {
  createClient () {
    const redisHost = ENV.REDIS_HOST || '127.0.0.1'
    const redisPort = ENV.REDIS_PORT || '6379'
    const redisDb = ENV.REDIS_DB || 0
    const redisPassword = ENV.REDIS_PASSWORD

    const client = redis.createClient({
      url: `redis://${redisHost}:${redisPort}`,
      password: redisPassword,
      database: redisDb
    })
    return client
  }

  async connect () {
    try {
      const client = this.createClient()
      await client.connect()

      return {
        success: true,
        client: client
      }
    } catch (error) {
      return {
        success: false,
        error: error,
        client: null
      }
    }
  }

  async disconnect (client) {
    await client.disconnect()
  }
}

export default () => new Redis()
