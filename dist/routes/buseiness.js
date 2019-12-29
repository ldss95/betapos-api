"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const business_1 = __importDefault(require("../controllers/business"));
const router = express_1.Router();
router.route('/')
    .get(business_1.default.getAll)
    .post(business_1.default.create);
router.route('/:id')
    .get(business_1.default.getOne)
    .put(business_1.default.update);
exports.default = router;
