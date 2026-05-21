import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { graphql, buildSchema } from 'graphql';
import pg from 'pg';

const app = express();
const port = Number(process.env.PORT) || 3001;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const databaseUrl = process.env.DATABASE_URL;
const pool = databaseUrl ? new pg.Pool({ connectionString: databaseUrl }) : null;

const schema = buildSchema(`
  type Health {
    status: String!
    service: String!
    database: String!
  }

  type Query {
    health: Health!
  }
`);

async function getDatabaseStatus() {
  if (!pool) {
    return 'not_configured';
  }

  try {
    await pool.query('select 1');
    return 'ok';
  } catch (error) {
    console.error('Database health check failed:', error.message);
    return 'error';
  }
}

app.use(
  cors({
    origin: clientOrigin,
  })
);
app.use(express.json());

app.get('/api/health', async (_request, response) => {
  response.json({
    status: 'ok',
    service: 'prep-tracker-api',
    database: await getDatabaseStatus(),
  });
});

app.post('/api/graphql', async (request, response) => {
  const result = await graphql({
    schema,
    source: request.body?.query || '',
    rootValue: {
      health: async () => ({
        status: 'ok',
        service: 'prep-tracker-api',
        database: await getDatabaseStatus(),
      }),
    },
  });

  response.json(result);
});

app.listen(port, () => {
  console.log(`API server is running on port ${port}.`);
});
