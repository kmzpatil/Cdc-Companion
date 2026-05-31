"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = auth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function auth(optionalAdmin = false) {
    return (req, res, next) => {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Missing or malformed token' });
            return; // <-- no longer `return res...`
        }
        const token = header.slice(7);
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (_a) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }
        if (optionalAdmin && !payload.isAdmin) {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }
        // attach and continue
        req.user = payload;
        next();
    };
}
