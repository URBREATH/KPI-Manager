"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trace = trace;
exports.debug = debug;
exports.info = info;
exports.warn = warn;
exports.error = error;
exports.fatal = fatal;
exports.req = req;
exports.base = base;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const path_1 = require("path");
const priority = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'off'];
const LOG_LEVEL = priority.indexOf(process.env.LOG_LEVEL || "info");
const levelLabels = {
    "trace": "TRACE",
    "debug": "DEBUG",
    "info": " INFO",
    "warn": " WARN",
    "error": "ERROR",
    "fatal": "FATAL"
};
function printLine(level, from, message) {
    if (LOG_LEVEL == priority.length - 1)
        return;
    if (LOG_LEVEL <= priority.indexOf(level)) {
        let textStyle = chalk_1.default.cyan;
        switch (level) {
            case "trace":
                textStyle = chalk_1.default.gray;
                break;
            case "debug":
                textStyle = chalk_1.default.cyan;
                break;
            case "info":
                textStyle = chalk_1.default.green;
                break;
            case "warn":
                textStyle = chalk_1.default.yellow;
                break;
            case "error":
                textStyle = chalk_1.default.red;
                break;
            case "fatal":
                textStyle = chalk_1.default.magenta;
                break;
            default:
                break;
        }
        if (from.endsWith('.ts') || from.endsWith('.js'))
            from = base(from);
        console.log(textStyle.bold(levelLabels[level]) + " | " + textStyle((new Date()).toISOString()) + " | " + textStyle.bold(from) + textStyle(": " + message));
    }
}
function trace(from, message) {
    printLine('trace', from, message);
}
function debug(from, message) {
    printLine('debug', from, message);
}
function info(from, message) {
    printLine('info', from, message);
}
function warn(from, message) {
    printLine('warn', from, message);
}
function error(from, message) {
    printLine('error', from, message);
}
function fatal(from, message) {
    printLine('fatal', from, message);
}
function req(method, url, status, traceMessage) {
    let levelStyle = chalk_1.default.green;
    if (status >= 300 && status < 500)
        levelStyle = chalk_1.default.yellow;
    else if (status >= 500)
        levelStyle = chalk_1.default.red;
    let msg = levelStyle.bold(" HTTP") + " | " + (new Date()).toISOString() + " | " + chalk_1.default.bold(method + " " + url) + " -> " + levelStyle.bold(status);
    if (LOG_LEVEL === 0 && traceMessage)
        msg += chalk_1.default.gray(" " + traceMessage);
    console.log(msg);
}
function base(filename) {
    return (0, path_1.basename)(filename).split('.')[0];
}
