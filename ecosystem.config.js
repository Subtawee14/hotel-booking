/**
 * @description pm2 configuration file.
 * @example
 *  production mode :: pm2 start ecosystem.config.js --only prod
 *  development mode :: pm2 start ecosystem.config.js --only dev
 */
module.exports = {
  apps: [
    {
      name: 'prod',
      script: 'dist/server.js',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '1G',
      merge_logs: true,
      output: './logs/access.log',
      error: './logs/error.log',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        PORT: 3000,
        NODE_ENV: 'production',
        DB_HOST: 'hotel01.igpaf.mongodb.net',
        DB_PORT: '27017',
        DB_DATABASE: 'hotel_booking',
        DB_USER: 'my_hotel_admin',
        DB_PASSWORD: 'bRl9brYVl8oFPEPe',
        SECRET_KEY: 'secretKey',
        EXPIRE_TIME: '30d',
        LOG_FORMAT: 'dev',
        LOG_DIR: '../logs',
        ORIGIN: '*',
      },
    },
  ],
};
