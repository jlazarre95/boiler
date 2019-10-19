import { env } from "process";
import { createLogger, format, Logger, transports } from "winston";

const upperCaseLevelFormat = format(info => {
    info.level = info.level.toUpperCase();
    return info;
})();

const messageFormat = format.printf((info) => {
    if(info.level.toLowerCase().indexOf("error") >= 0) {
        if(info instanceof Error && env["BOILER_VERBOSE"] === "True") {
            return `${info.level}: ${info.stack}`;
        } else {
            return `${info.level}: ${info.message}`;
        }
    } else {
        return `${info.message}`;
    }
});

function getLogger(): Logger {
    return createLogger({
        level: env["LOG_LEVEL"] || "info",
        transports: [
            new transports.Console({})
        ],
        format: format.combine(
            upperCaseLevelFormat,
            format.colorize(),
            messageFormat
        )       
    });
}

export const logger: Logger = getLogger();