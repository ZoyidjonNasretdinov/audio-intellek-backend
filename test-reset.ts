import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

async function test() {
  await mongoose.connect('mongodb+srv://zoyidjonnasretdinovcoder_db_user:ngJFaHSxthSotqHk@cluster0.frnyj58.mongodb.net/?appName=Cluster0');
  const password = await bcrypt.hash('admin123', 10);
  await mongoose.connection.collection('users').updateOne(
    { phone: 'admin@gmail.com' },
    { $set: { password } }
  );
  console.log('Password reset to admin123');
  process.exit(0);
}
test().catch(console.error);
