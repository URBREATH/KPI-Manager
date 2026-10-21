import chalk from "chalk";
import { basename } from 'path'

const priority = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'off'];

const LOG_LEVEL: number = priority.indexOf(process.env.LOG_LEVEL || "info");

const levelLabels: any = {
    "trace": "TRACE",
    "debug": "DEBUG",
    "info": " INFO",
    "warn": " WARN",
    "error": "ERROR",
    "fatal": "FATAL"
}

function printLine(level: string, from: string, message: string) {

    if (LOG_LEVEL == priority.length - 1) return;

    if (LOG_LEVEL <= priority.indexOf(level)) {

        let textStyle = chalk.cyan

        switch (level) {
            case "trace":
                textStyle = chalk.gray
                break;
            case "debug":
                textStyle = chalk.cyan
                break;
            case "info":
                textStyle = chalk.green
                break;
            case "warn":
                textStyle = chalk.yellow
                break;
            case "error":
                textStyle = chalk.red
                break;
            case "fatal":
                textStyle = chalk.magenta
                break;
            default:
                break;
        }

        if (from.endsWith('.ts') || from.endsWith('.js')) from = base(from)
        
        console.log(textStyle.bold(levelLabels[level]) + " | " + textStyle((new Date()).toISOString()) + " | " + textStyle.bold(from) + textStyle(": " + message))
    }
}

export function trace(from: string, message: string) {
    printLine('trace', from, message);
}

export function debug(from: string, message: string) {
    printLine('debug', from, message);
}

export function info(from: string, message: string, p0?: any) {
      if (p0) {
        printLine('info', from, `${message} | ${JSON.stringify(p0)}`);
    } else {
        printLine('info', from, message);
    }
}

export function warn(from: string, message: string) {
    printLine('warn', from, message);
}

export function error(from: string, message: string) {
    printLine('error', from, message);
}

export function fatal(from: string, message: string) {
    printLine('fatal', from, message);
}

export function base(filename: string) {
    return basename(filename).split('.')[0];
}

