"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkHealth = checkHealth;
async function checkHealth(req, res, next) {
    return res.status(200).json();
}
