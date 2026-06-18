import { DATABASE_URL, PORT, TEST_DATABASE_URL } from './utils/config.js';
import { connectToDatabase, createSequelize } from './utils/db.js';
import { createApp } from './app.js';
import { initModels } from './models/index.js';

const sequelize = createSequelize(TEST_DATABASE_URL || DATABASE_URL);
await connectToDatabase(sequelize);
const models = sequelize ? initModels(sequelize) : null;

const app = await createApp({
  sequelize,
  models,
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
