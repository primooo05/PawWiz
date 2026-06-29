import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      silent: process.env.NODE_ENV === 'test'
    }),
    // Persist errors to disk — survives terminal scroll and concurrently output interleaving.
    // Rotate or delete error.log freely; it is gitignored.
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
      silent: process.env.NODE_ENV === 'test',
    }),
  ]
});
