import winston from 'winston';

// Cloud Logging LogServerity
// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
//    DEFAULT	(0) The log entry has no assigned severity level.
//    DEBUG	(100) Debug or trace information.
//    INFO	(200) Routine information, such as ongoing status or performance.
//    NOTICE	(300) Normal but significant events, such as start up, shut down, or a configuration change.
//    WARNING	(400) Warning events might cause problems.
//    ERROR	(500) Error events are likely to cause problems.
//    CRITICAL	(600) Critical events cause more severe problems or outages.
//    ALERT	(700) A person must take an action immediately.
//    EMERGENCY	(800) One or more systems are unusable.

// Winston Logging Levels
// https://github.com/winstonjs/winston#logging-levels
//    // for cli and npm levels
//    error: LeveledLogMethod;
//    warn: LeveledLogMethod;
//    help: LeveledLogMethod;
//    data: LeveledLogMethod;
//    info: LeveledLogMethod;
//    debug: LeveledLogMethod;
//    prompt: LeveledLogMethod;
//    http: LeveledLogMethod;
//    verbose: LeveledLogMethod;
//    input: LeveledLogMethod;
//    silly: LeveledLogMethod;
//
//    // for syslog levels only
//    emerg: LeveledLogMethod;
//    alert: LeveledLogMethod;
//    crit: LeveledLogMethod;
//    warning: LeveledLogMethod;
//    notice: LeveledLogMethod;

const mapCloudLogging = (winstonLevel: string) => {
  return ((level) => {
    switch (level) {
      case 'warn': // fall through
      case 'help': // fall through
      case 'data':
        return 'warning';
      case 'prompt': // fall throught
      case 'http': // fall throught
      case 'verbose': // fall throught
      case 'input': // fall throught
      case 'silly':
        return 'debug';
      case 'emerg':
        return 'emergency';
      case 'crit':
        return 'critical';
      default:
        return level;
    }
  })(winstonLevel).toUpperCase();
};

const format = winston.format.combine(
  winston.format((info) => {
    const { level, ...data } = info;

    return {
      time: new Date().toISOString(),
      serverity: mapCloudLogging(level),
      level,
      ...data,
    };
  })(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: 'debug',
  format,
  defaultMeta: { service: 'ailead' },
  transports: [new winston.transports.Console()],
});

export default logger;
