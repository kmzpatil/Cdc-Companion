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
const nodemailer_1 = __importDefault(require("nodemailer"));
const mailer_1 = require("./mailer");
const prisma = new client_1.PrismaClient();
// configure your transporter once
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
class ReviewerController {
    // POST /api/reviewer/login
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, password } = req.body;
                const reviewer = yield prisma.reviewer.findUnique({ where: { name } });
                if (!reviewer || reviewer.password !== password) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
                const payload = {
                    id: reviewer.id,
                    name: reviewer.name,
                    profiles: reviewer.profiles,
                };
                const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: '8h',
                });
                return res.json({
                    token,
                    reviewer: {
                        id: reviewer.id,
                        name: reviewer.name,
                        profiles: reviewer.profiles,
                        reviewedCount: reviewer.reviewedCount,
                    },
                });
            }
            catch (err) {
                next(err);
            }
        });
    }
    // GET /api/reviewer/next
    getNextCV(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const auth = req.headers.authorization;
                if (!(auth === null || auth === void 0 ? void 0 : auth.startsWith('Bearer '))) {
                    return res.status(401).json({ error: 'Missing token' });
                }
                const payload = jsonwebtoken_1.default.verify(auth.slice(7), process.env.JWT_SECRET);
                const reviewer = yield prisma.reviewer.findUnique({ where: { id: payload.id } });
                if (!reviewer) {
                    return res.status(404).json({ error: 'Reviewer not found' });
                }
                const reviewee = yield prisma.reviewee.findFirst({
                    where: {
                        assignedToId: null,
                        profile: { in: reviewer.profiles },
                    },
                });
                if (!reviewee) {
                    return res.status(204).send();
                }
                //   await prisma.reviewer.update({
                //     where: { id: payload.id },
                //     data: { reviewedCount: { increment: 1 } },
                //   })
                yield prisma.reviewee.update({
                    where: { id: reviewee.id },
                    data: { assignedToId: payload.id },
                });
                return res.json(reviewee);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // POST /api/reviewer/review
    submitReview(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const auth = req.headers.authorization;
                if (!(auth === null || auth === void 0 ? void 0 : auth.startsWith('Bearer '))) {
                    return res.status(401).json({ error: 'Missing token' });
                }
                const payload = jsonwebtoken_1.default.verify(auth.slice(7), process.env.JWT_SECRET);
                const { revieweeId, comments } = req.body;
                if (!Array.isArray(comments)) {
                    return res.status(400).json({ error: 'Comments must be an array' });
                }
                const review = yield prisma.review.upsert({
                    where: { revieweeId },
                    update: {
                        comments,
                        reviewerId: payload.id,
                    },
                    create: {
                        revieweeId,
                        reviewerId: payload.id,
                        comments,
                    },
                });
                yield prisma.reviewee.update({
                    where: { id: revieweeId },
                    data: { status: true, submittedAt: new Date() },
                });
                yield prisma.reviewer.update({
                    where: { id: payload.id },
                    data: { reviewedCount: { increment: 1 } },
                });
                const re = yield prisma.reviewee.findUnique({
                    where: { id: revieweeId },
                    select: { email: true, name: true },
                });
                if (re === null || re === void 0 ? void 0 : re.email) {
                    // Uncomment to send email notification
                    // await transporter.sendMail({
                    //   to: re.email,
                    //   from: process.env.SMTP_FROM!,
                    //   subject: 'Your CV has been reviewed',
                    //   text: `Hi ${re.name},\n\nYour CV has been reviewed. Feedback:\n\n${comments.join('\n')}`,
                    // })
                    const labels = [
                        'Structure & Format',
                        'Relevance to Domain',
                        'Depth of Explanation',
                        'Language and Grammar',
                        'Improvements in Projects',
                        'Additional Suggestions',
                    ];
                    // const rawComments = [
                    //   'Clear headings but add spacing.',
                    //   'Good alignment with the target industry.',
                    //   'Could use more examples to illustrate key points.',
                    //   'Watch comma usage and tense consistency.',
                    //   'Expand on your role in project outcomes.',
                    //   'Consider adding a summary at the end.',
                    // ]
                    // pair label with each comment:
                    const formattedComments = labels.map((label, idx) => `${label}: ${comments[idx]}`);
                    yield (0, mailer_1.sendReviewEmail)({
                        to: re.email,
                        userName: re.name,
                        reviewComments: formattedComments,
                    });
                }
                return res.status(201).json(review);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // GET /api/reviewer/assigned
    getAssignedCVs(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const auth = req.headers.authorization;
                if (!(auth === null || auth === void 0 ? void 0 : auth.startsWith('Bearer '))) {
                    return res.status(401).json({ error: 'Missing token' });
                }
                const payload = jsonwebtoken_1.default.verify(auth.slice(7), process.env.JWT_SECRET);
                // fetch reviewer details
                const reviewer = yield prisma.reviewer.findUnique({
                    where: { id: payload.id },
                    select: {
                        id: true,
                        name: true,
                        profiles: true,
                        reviewedCount: true,
                        reviewsNumber: true,
                    },
                });
                if (!reviewer) {
                    return res.status(404).json({ error: 'Reviewer not found' });
                }
                // fetch all reviewees assigned to this reviewer
                const assigned = yield prisma.reviewee.findMany({
                    where: { assignedToId: payload.id },
                    select: {
                        id: true,
                        name: true,
                        rollNo: true,
                        email: true,
                        cvLink: true,
                        profile: true,
                        status: true,
                        submittedAt: true,
                        review: {
                            select: {
                                comments: true,
                            },
                        },
                    },
                });
                return res.json({
                    reviewer,
                    assigned,
                });
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = ReviewerController;
