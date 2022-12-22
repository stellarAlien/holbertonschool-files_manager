import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(request, response) {
    // Extract authorization data from request header
    const authData = request.header('Authorization');
    // Split authData and decode base64 encoded email
    let userEmail = authData.split(' ')[1];
    const buff = Buffer.from(userEmail, 'base64');
    userEmail = buff.toString('ascii');
    // Split email and password
    const data = userEmail.split(':');
    // Return Unauthorized error if data length is not 2
    if (data.length !== 2) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }
    // Hash the password
    const hashedPassword = sha1(data[1]);
    // Get users collection from database
    const users = dbClient.db.collection('users');
    // Search for user with matching email and hashed password
    users.findOne({ email: data[0], password: hashedPassword }, async (err, user) => {
      // If user is found
      if (user) {
        // Generate new token
        const token = uuidv4();
        // Set token in redis store
        const key = `auth_${token}`;
        await redisClient.set(key, user._id.toString(), 60 * 60 * 24);
        // Send token back in response
        response.status(200).json({ token });
      } else {
        // Send Unauthorized error if user is not found
        response.status(401).json({ error: 'Unauthorized' });
      }
    });
  }

  static async getDisconnect(request, response) {
    // Get token from request header
    const token = request.header('X-Token');
    // Get key for token in redis store
    const key = `auth_${token}`;
    // Get user id for token from redis store
    const id = await redisClient.get(key);
    // If id is found
    if (id) {
      // Delete key from redis store
      await redisClient.del(key);
      // Send empty response
      response.status(204).json({});
    } else {
      // Send Unauthorized error if id is not found
      response.status(401).json({ error: 'Unauthorized' });
    }
  }
}

module.exports = AuthController;
