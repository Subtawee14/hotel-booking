import { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } from '@config';

export const dbConnection = {
  url: `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_DATABASE}`,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
};
