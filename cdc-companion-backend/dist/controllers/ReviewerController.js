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
const mailer_1 = require("./mailer");
const prisma_1 = __importDefault(require("../prisma"));
class ReviewerController {
    // POST /api/reviewer/signup
    signup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, rollNo, email, contactNumber, profiles, reviewsNumber } = req.body;
                if (!name || !rollNo || !email || !profiles || !reviewsNumber) {
                    return res.status(400).json({ error: 'Missing required fields' });
                }
                const existing = yield prisma_1.default.reviewer.findFirst({
                    where: {
                        OR: [
                            { password: rollNo },
                            { email }
                        ]
                    }
                });
                if (existing) {
                    if (existing.password === rollNo) {
                        return res.status(400).json({ error: 'A reviewer with this roll number already exists' });
                    }
                    if (existing.email === email) {
                        return res.status(400).json({ error: 'A reviewer with this email already exists' });
                    }
                }
                // Roll Number acts as the password since it has the seniority year prefix (e.g. 21CS10001 starting with '21')
                const reviewer = yield prisma_1.default.reviewer.create({
                    data: {
                        name,
                        password: rollNo,
                        email,
                        profiles,
                        reviewsNumber: Number(reviewsNumber),
                        reviewedCount: 0
                    }
                });
                return res.status(201).json({
                    message: 'Signup successful',
                    reviewer: {
                        id: reviewer.id,
                        name: reviewer.name,
                        email: reviewer.email,
                    }
                });
            }
            catch (err) {
                next(err);
            }
        });
    }
    // POST /api/reviewer/login
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({ error: 'Missing email or password' });
                }
                const reviewer = yield prisma_1.default.reviewer.findUnique({ where: { email } });
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
                const payload = req.user;
                if (!payload) {
                    return res.status(401).json({ error: 'Unauthenticated' });
                }
                const reviewer = yield prisma_1.default.reviewer.findUnique({ where: { id: payload.id } });
                if (!reviewer) {
                    return res.status(404).json({ error: 'Reviewer not found' });
                }
                const reviewee = yield prisma_1.default.reviewee.findFirst({
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
                yield prisma_1.default.reviewee.update({
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
                const payload = req.user;
                if (!payload) {
                    return res.status(401).json({ error: 'Unauthenticated' });
                }
                const { revieweeId, comments } = req.body;
                if (!Array.isArray(comments)) {
                    return res.status(400).json({ error: 'Comments must be an array' });
                }
                // Check if a review already exists to prevent duplicate reviewer count increments
                const existingReview = yield prisma_1.default.review.findUnique({
                    where: { revieweeId }
                });
                const review = yield prisma_1.default.review.upsert({
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
                yield prisma_1.default.reviewee.update({
                    where: { id: revieweeId },
                    data: { status: true, submittedAt: new Date() },
                });
                if (!existingReview) {
                    yield prisma_1.default.reviewer.update({
                        where: { id: payload.id },
                        data: { reviewedCount: { increment: 1 } },
                    });
                }
                const re = yield prisma_1.default.reviewee.findUnique({
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
                    (0, mailer_1.sendReviewEmail)({
                        to: re.email,
                        userName: re.name,
                        reviewComments: formattedComments,
                    }).catch((mailErr) => {
                        console.error("Failsafe: Error sending review email:", mailErr);
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
                const payload = req.user;
                if (!payload) {
                    return res.status(401).json({ error: 'Unauthenticated' });
                }
                // fetch reviewer details
                const reviewer = yield prisma_1.default.reviewer.findUnique({
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
                const assigned = yield prisma_1.default.reviewee.findMany({
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
