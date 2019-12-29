"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = __importDefault(require("../controllers/users"));
const router = express_1.Router();
router.route('/:id')
    .get(users_1.default.getOne)
    .put(users_1.default.update)
    .delete(users_1.default.delete);
router.route('/')
    .get(users_1.default.getAll)
    .post(users_1.default.create);
exports.default = router;
