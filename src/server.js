import 'dotenv/config';
import connectDB from './config/db.js';
import app from './app.js';

await connectDB();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
