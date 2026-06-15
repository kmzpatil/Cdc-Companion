"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const RevieweeRoutes_1 = __importDefault(require("./routes/RevieweeRoutes"));
const ReviewerRoutes_1 = __importDefault(require("./routes/ReviewerRoutes"));
const AdminRoutes_1 = __importDefault(require("./routes/AdminRoutes"));
const path_1 = __importDefault(require("path"));
const rateLimiter_1 = require("./middleware/rateLimiter");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Apply global rate limiter: Max 150 requests per minute per IP
app.use((0, rateLimiter_1.rateLimiter)(60 * 1000, 150));
app.use('/api/reviewee', RevieweeRoutes_1.default);
app.use('/api/reviewer', ReviewerRoutes_1.default);
app.use('/api/admin', AdminRoutes_1.default);
app.use('/assets', express_1.default.static(path_1.default.join(__dirname, '../public/assets')));
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
