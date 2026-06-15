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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
function normalizeProfile(p) {
    const upper = p.toUpperCase().replace(/\s+/g, '').replace(/[-_\/]/g, '');
    if (upper === 'SOFTWARE' || upper === 'SDE' || upper === 'SDEQUANT')
        return 'SOFTWARE';
    if (upper === 'FINANCEQUANT' || upper === 'FINANCE')
        return 'FINANCE_QUANT';
    if (upper === 'PRODUCTFMCG' || upper === 'FMCG')
        return 'PRODUCT_FMCG';
    return upper;
}
class AdminController {
    // ... (rest of class)
    // POST /api/admin/login
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, password } = req.body;
                const admin = yield prisma_1.default.admin.findUnique({ where: { name } });
                if (!admin || admin.password !== password) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
                const payload = {
                    id: admin.id,
                    name: admin.name,
                    isAdmin: true,
                };
                const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET /* make sure you have this in .env */, { expiresIn: '8h' });
                // Return the token and any user info you need on the client
                return res.json({
                    token,
                    admin: {
                        id: admin.id,
                        name: admin.name,
                    }
                });
            }
            catch (err) {
                next(err);
            }
        });
    }
    // GET /api/admin/reviewees
    listReviewees(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const all = yield prisma_1.default.reviewee.findMany({ include: { assignedTo: true, review: true } });
                return res.json(all);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // GET /api/admin/reviewers
    listReviewers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const all = yield prisma_1.default.reviewer.findMany({ select: {
                        id: true,
                        name: true,
                        password: true, // now valid
                        profiles: true,
                        reviewsNumber: true,
                        reviewedCount: true,
                        email: true,
                        admin: true,
                        assignedCVs: true,
                        reviewsGiven: true,
                    } });
                return res.json(all);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // GET /api/admin/reviews
    listReviews(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const all = yield prisma_1.default.review.findMany({ include: { reviewee: true, reviewer: true } });
                return res.json(all);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // POST /api/admin/allocate
    // POST /api/admin/allocate
    // POST /api/admin/allocate
    allocate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pending = yield prisma_1.default.reviewee.findMany({
                    where: { assignedToId: null },
                });
                if (!pending.length) {
                    return res.json({ message: 'No CVs to allocate' });
                }
                // fetch reviewers with their current assignments
                const reviewers = yield prisma_1.default.reviewer.findMany({
                    include: { assignedCVs: true },
                });
                for (const cv of pending) {
                    const rollPrefix = parseInt(cv.rollNo.slice(0, 2), 10);
                    const eligible = reviewers
                        .filter(r => {
                        const pwdPrefix = parseInt(r.password.slice(0, 2), 10);
                        return (
                        // handles this profile (case-insensitive and format-insensitive check)
                        r.profiles.map(normalizeProfile).includes(normalizeProfile(cv.profile)) &&
                            // hasn't reviewed up to their quota
                            r.reviewedCount < r.reviewsNumber &&
                            // doesn't already have too many CVs assigned
                            r.assignedCVs.length < r.reviewsNumber &&
                            // password-prefix rule (less-than-or-equal-to so same-batch peer reviews are permitted)
                            pwdPrefix <= rollPrefix);
                    })
                        .sort((a, b) => a.reviewedCount - b.reviewedCount);
                    if (!eligible.length)
                        continue;
                    const chosen = eligible[0];
                    // assign in DB
                    yield prisma_1.default.reviewee.update({
                        where: { id: cv.id },
                        data: { assignedToId: chosen.id },
                    });
                    // bump their reviewedCount
                    yield prisma_1.default.reviewer.update({
                        where: { id: chosen.id },
                        data: { reviewedCount: { increment: 1 } },
                    });
                    // keep in-memory state in sync
                    chosen.reviewedCount++;
                    chosen.assignedCVs.push(cv);
                }
                return res.json({ message: 'Allocation complete' });
            }
            catch (err) {
                next(err);
            }
        });
    }
    // DELETE /api/admin/reviewee/:id
    deleteReviewee(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id, 10);
                yield prisma_1.default.review.deleteMany({ where: { revieweeId: id } });
                yield prisma_1.default.reviewee.delete({ where: { id } });
                return res.json({ message: 'Reviewee deleted successfully' });
            }
            catch (err) {
                next(err);
            }
        });
    }
    // DELETE /api/admin/reviewer/:id
    deleteReviewer(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id, 10);
                yield prisma_1.default.reviewee.updateMany({
                    where: { assignedToId: id },
                    data: { assignedToId: null }
                });
                yield prisma_1.default.review.deleteMany({ where: { reviewerId: id } });
                yield prisma_1.default.reviewer.delete({ where: { id } });
                return res.json({ message: 'Reviewer deleted successfully' });
            }
            catch (err) {
                next(err);
            }
        });
    }
    // DELETE /api/admin/review/:id
    deleteReview(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id, 10);
                const review = yield prisma_1.default.review.findUnique({
                    where: { id },
                    select: { revieweeId: true }
                });
                if (review) {
                    yield prisma_1.default.reviewee.update({
                        where: { id: review.revieweeId },
                        data: { status: false }
                    });
                }
                yield prisma_1.default.review.delete({ where: { id } });
                return res.json({ message: 'Review deleted successfully' });
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = AdminController;
