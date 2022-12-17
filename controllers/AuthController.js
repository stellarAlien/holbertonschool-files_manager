import { dbClient } from "../utils/db";
import {redisClient} from "../utils/redis";
import crypto from 'crypto';
import {Buffer} from 'buffer';
import { v4 as uuid } from "uuid";

class AuthController{
    getConnect(req, res) {
        const credentials_in_header = req.headers['Authorization'];

        if(credentials_in_header){
            const credentials = credentials_in_header.split(' ')[2];
            var email_password = Buffer.from(credentials, 'base64').toString('ascii');
            email, password = email_password.split(':');
            hashed_password = crypto.createHash('sha1').update(password).digest(hex);
            const query = {"email": email, "password":hashed_password};
            id = dbClient.colection('user').find(query).toArray((err, item)=>{
                if(err) {throw new Error(err);}
                if(!item) { res.status(401).json({"error":"Unauthorized"});}
            });

            const token = uuid();
            const key = `auth_${token}`;
            redisClient.set(key, id);
            redisClient.client.expire(key, 60*60*24);
        }
    }

    getDisconnect(req, res){
        if(req.headers['X-Token']){
            token = req.headers['X-Token'];
        }
        auth_token = `auth_${token}`;

        redisClient.get(auth_token, (err, value)=>{
            if(value) { redisClient.client.del(auth); return;}
            res.status(401).json({"error":"Unauthorized"});
        });
    }

    
}