"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const controller = tslib_1.__importStar(require("../controllers/healthController"));
const healthRoutes = (0, express_1.Router)();
healthRoutes.get("/", controller.checkHealth);
exports.default = healthRoutes;
