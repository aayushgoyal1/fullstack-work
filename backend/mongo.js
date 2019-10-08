const { ObjectID, MongoClient } = require('mongodb');

let client = null;

module.exports.connect = async function() {
  const host = process.env.MONGODB_HOST || 'localhost';
  client = new MongoClient(`mongodb://${host}/`, { useNewUrlParser: true });
  await client.connect();
  let mongo = client.db(config.mongo.dbName);

  // Ensure that there's a demo user
  try {
    // Try to get the demo user's ID - this will work if the user exists
    (await mongo
      .collection('users')
      .findOne({ _id: config.demoUserID, username: config.demoUserID }))._id;
  } catch (e) {
    // The user doesn't exist so create them!
    await mongo.collection('users').insertOne({
      _id: config.demoUserID,
      username: config.demoUserID
    });
    // Also create a session for the user
    const future = new Date();
    future.setFullYear(future.getFullYear() + 100);
    await mongo.collection('sessions').insertOne({
      userID: config.demoUserID,
      sessionCookie: config.demoUserSessionCookie,
      expires: future
    });
    // Also create a group for this user
    await mongo
      .collection('groups')
      .insertOne({ name: 'My Group', members: [config.demoUserID] });
  }
  return mongo;
};

module.exports.close = () => client.close();
