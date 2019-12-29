"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roles_1 = __importDefault(require("../controllers/roles"));
const router = express_1.Router();
router.route('/')
    .get(roles_1.default.getAll)
    .post(roles_1.default.create);
router.route('/:id')
    .get(roles_1.default.getOne)
    .put(roles_1.default.update)
    .delete(roles_1.default.delete);
exports.default = router;
