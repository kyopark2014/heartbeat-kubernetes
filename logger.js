const winston = require('winston')
require('winston-daily-rotate-file')
require('date-utils')
 
const winstonTimestampColorize = require('winston-timestamp-colorize');

const { combine, timestamp, label, printf, colorize } = winston.format;
const myFormat = printf(({ timestamp, label, level, message   }) => {
    return `${timestamp} ${label} ${level}: ${message}`;    // log format for stored file
  });

const myFormat2 = printf(({message}) => {
    return `${message}`;    // log format for console and kibana
  });

const logger = winston.createLogger({
    level: 'info',   // { emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7 }

    transports: [
    /*    //  for Debugging locally
        new winston.transports.DailyRotateFile({
            filename : '/tmp/log/heartbeat.log', 
            zippedArchive: true, 
            handleExceptions: true,
            colorize: false,
            format: combine(
                label({ label: 'heartbeat-api' }),
                timestamp(),
                myFormat
            )
        }),   

        new winston.transports.Console({
            handleExceptions: true,
            format: combine(
                label({ label: 'heartbeat-api' }),
                timestamp(),
                colorize(),
                winstonTimestampColorize({color: 'yellow'}),
                myFormat
            )
        })  */

        new winston.transports.Console({
            handleExceptions: true,
            format: combine(
                myFormat2
            )
        }) 
    ]
})
 
module.exports = logger