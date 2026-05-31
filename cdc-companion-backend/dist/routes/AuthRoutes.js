"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = auth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * auth(optionalAdmin = false)
 * - verifies Bearer token in Authorization header
 * - attaches payload to req.user
 * - if optionalAdmin=true, also enforces user.isAdmin
 */
function auth(optionalAdmin = false) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
            return res.status(401).json({ error: 'Missing or malformed token' });
        }
        const token = authHeader.split(' ')[1];
        try {
            const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.user = payload;
            if (optionalAdmin && !payload.isAdmin) {
                return res.status(403).json({ error: 'Admin access required' });
            }
            next();
        }
        catch (_a) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    };
}
