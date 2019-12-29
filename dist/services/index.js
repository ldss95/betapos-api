"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_simple_1 = __importDefault(require("jwt-simple"));
const moment_1 = __importDefault(require("moment"));
exports.default = {
    createToken: (user) => {
        const payload = {
            sub: user.id,
            iat: moment_1.default().unix(),
            exp: moment_1.default().add(14, 'days').unix()
        };
        jwt_simple_1.default.encode(payload, process.env.SECRET_TOKEN);
    }
};
