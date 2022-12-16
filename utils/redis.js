const redis = require('redis');
class RedisClient {
    construcor() {
        this.client = redis.createClient();
        this.client.on_error(err=>{console.log(err)}); //on('error')
    }
    //set client() {
        //this.client = redis.createClient();
    //}
}
export {RedisClient as redisClient}

