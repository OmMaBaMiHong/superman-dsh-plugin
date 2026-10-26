import { t as config } from "./config-B5Cf_tHS.mjs";
import path from "node:path";
import winston from "winston";
//#region lib/utils/logger.ts
let transports = [];
if (!config.noLogfiles && !process.env.VERCEL) transports = [new winston.transports.File({
	filename: path.resolve("logs/error.log"),
	level: "error"
}), new winston.transports.File({ filename: path.resolve("logs/combined.log") })];
const logger = winston.createLogger({
	level: config.loggerLevel,
	format: winston.format.combine(winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }), winston.format.printf((info) => JSON.stringify({
		timestamp: info.timestamp,
		level: info.level,
		message: info.message
	}))),
	transports
});
if (!config.isPackage) logger.add(new winston.transports.Console({
	format: winston.format.printf((info) => {
		return `${winston.format.colorize().colorize(info.level, config.showLoggerTimestamp ? `[${info.timestamp}] ${info.level}` : info.level)}: ${info.message}`;
	}),
	silent: process.env.NODE_ENV === "test"
}));
//#endregion
export { logger as t };
