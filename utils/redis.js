import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.getClient = promisify(this.client.get).bind(this.client);
    this.client.on('error', (error) => {
      console.log(`Redis client not connected to the server: ${error.message}`);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  get(key) {
    return this.getClient(key);
  }

  set(key, value) {
    this.client.set(key, value, redis.print);
  }

  del(key) {
    this.client.del(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
