"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
}
const prisma = new client_1.PrismaClient();
class AuthController {
    /**
     * POST /api/auth/login
     * Body: { name, password }
     * If valid reviewer/admin, returns { token }
     */
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, password } = req.body;
                if (!name || !password) {
                    return res.status(400).json({ error: 'Missing name or password' });
                }
                const user = yield prisma.reviewer.findUnique({ where: { name } });
                if (!user || user.password !== password) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
                const payload = {
                    id: user.id,
                    name: user.name,
                    isAdmin: user.admin,
                    profiles: user.profiles,
                };
                const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: '8h',
                });
                return res.json({ token });
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = AuthController;
