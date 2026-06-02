import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const config = {
  datasource: {
    url: process.env.DATABASE_URL,
  },
};

export default config;
