import {redisClient} from "../utils/redis";

import {dbClient} from '../utils/db';

redis = redisClient();
mongo = dbClient();

class AppController {
    static getStatus(req, res){
        if(redis.isAlive() && mongo.isAlive()){
            res.status(200).json({ "redis": true, "db": true });
        }
    }
    static getStats(req, res){
        const users = mongo.nbUsers();
        const files = mongo.nbFiles();
        res.status(200).json(`{ "users": ${users}, "files": ${files} }`);
    }
}