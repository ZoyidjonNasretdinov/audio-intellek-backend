import mongoose from 'mongoose';

async function test() {
  await mongoose.connect('mongodb+srv://zoyidjonnasretdinovcoder_db_user:ngJFaHSxthSotqHk@cluster0.frnyj58.mongodb.net/?appName=Cluster0');
  const user = await mongoose.connection.collection('users').findOne({ role: 'ADMIN' });
  console.log('ADMIN USER:', user);
  process.exit(0);
}
test().catch(console.error);
