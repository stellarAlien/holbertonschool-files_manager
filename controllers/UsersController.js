import sha1 from 'sha1';
import { ObjectID } from 'mongodb';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

// Set up a queue for handling user tasks asynchronously
const userQueue = new Queue('userQueue', 'redis://127.0.0.1:6379');

class UsersController {
  // Create a new user
  static postNew(request, response) {
    const { email } = request.body;
    const { password } = request.body;

    // Validate that the email and password fields are not empty
    if (!email) {
      response.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      response.status(400).json({ error: 'Missing password' });
      return;
    }

    // Check if the user already exists
    const users = dbClient.db.collection('users');
    users.findOne({ email }, (err, user) => {
      if (user) {
        response.status(400).json({ error: 'Already exist' });
      } else {
        // Hash the password and create the new user
        const hashedPassword = sha1(password);
        users.insertOne(
          {
            email,
            password: hashedPassword,
          },
        ).then((result) => {
          response.status(201).json({ id: result.insertedId, email });
          // Add the user to the queue for further processing
          userQueue.add({ userId: result.insertedId });
        }).catch((error) => console.log(error));
      }
    });
  }

  // Get the current user based on the provided token
  static async getMe(request, response) {
    const token = request.header('X-Token');
    const key = `auth_${token}`;
    // Retrieve the user ID from the Redis cache
    const userId = await redisClient.get(key);
    if (userId) {
      const users = dbClient.db.collection('users');
      // Create a MongoDB ObjectID object from the user ID string
      const idObject = new ObjectID(userId);
      users.findOne({ _id: idObject }, (err, user) => {
        if (user) {
          response.status(200).json({ id: userId, email: user.email });
        } else {
          response.status(401).json({ error: 'Unauthorized' });
        }
      });
    } else {
      console.log('Hupatikani!');
      response.status(401).json({ error: 'Unauthorized' });
    }
  }
}

module.exports = UsersController;
