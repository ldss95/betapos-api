"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const users_1 = __importDefault(require("./users"));
const buseiness_1 = __importDefault(require("./buseiness"));
router.use('/users', users_1.default);
router.use('/business', buseiness_1.default);
exports.default = router;
