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
const mailer_1 = require("./mailer");
const prisma_1 = __importDefault(require("../prisma"));
/**
 * POST /api/reviewee/submit
 * Body: { name, rollNo, email, password, cvLink, profile }
 */
class RevieweeController {
    submitCV(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, rollNo, email, password, cvLink, profile } = req.body;
                if (!name || !rollNo || !email || !password || !cvLink || !profile) {
                    return res.status(400).json({ error: 'Missing required fields' });
                }
                if (!cvLink.includes('drive.google.com') && !cvLink.includes('docs.google.com')) {
                    return res.status(400).json({ error: 'Please submit a valid Google Drive or Google Docs link.' });
                }
                // Check for duplicate rollNo or email
                const existing = yield prisma_1.default.reviewee.findFirst({
                    where: {
                        OR: [
                            { rollNo },
                            { email }
                        ]
                    }
                });
                if (existing) {
                    if (existing.rollNo === rollNo) {
                        return res.status(400).json({ error: 'Roll number already registered' });
                    }
                    if (existing.email === email) {
                        return res.status(400).json({ error: 'Email address already registered' });
                    }
                }
                const reviewee = yield prisma_1.default.reviewee.create({
                    data: {
                        name,
                        rollNo,
                        email,
                        password,
                        cvLink,
                        profile,
                    },
                });
                console.log("cv submitted");
                // Send confirmation email containing their details and password asynchronously
                (0, mailer_1.sendRegistrationEmail)(email, name, password, cvLink, profile).catch((mailErr) => {
                    console.error("Failsafe: Error sending registration email:", mailErr);
                });
                return res.status(201).json(reviewee);
            }
            catch (err) {
                console.error(err);
                if (err.code === 'P2002') {
                    return res.status(400).json({ error: 'Roll number already registered' });
                }
                return res.status(500).json({ error: 'Server error' });
            }
        });
    }
    checkStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({ error: 'Missing email or password' });
                }
                const submission = yield prisma_1.default.reviewee.findFirst({
                    where: { email },
                    include: {
                        review: {
                            include: {
                                reviewer: true
                            }
                        }
                    }
                });
                if (!submission) {
                    return res.status(404).json({ error: 'No submission found for this email address.' });
                }
                if (submission.password !== password) {
                    return res.status(401).json({ error: 'Invalid password. Please try again.' });
                }
                const result = {
                    submission: {
                        id: submission.id,
                        name: submission.name,
                        email: submission.email,
                        rollNo: submission.rollNo,
                        profile: submission.profile,
                        cvLink: submission.cvLink,
                        submissionTime: submission.submittedAt,
                        status: submission.status
                    }
                };
                if (submission.review) {
                    result.feedback = {
                        id: submission.review.id,
                        comments: submission.review.comments,
                        aiSuggestions: submission.review.aiSuggestions,
                        submissionTime: submission.review.createdAt,
                        reviewer: {
                            name: submission.review.reviewer.name,
                            id: submission.review.reviewer.id
                        }
                    };
                }
                return res.json(result);
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ error: 'Server error' });
            }
        });
    }
    getSubmission(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.params;
                if (!email) {
                    return res.status(400).json({ error: 'Missing email' });
                }
                const submission = yield prisma_1.default.reviewee.findFirst({
                    where: { email },
                    include: {
                        review: {
                            include: {
                                reviewer: true
                            }
                        }
                    }
                });
                if (!submission) {
                    return res.status(404).json({ error: 'Submission not found' });
                }
                const result = {
                    submission: {
                        id: submission.id,
                        name: submission.name,
                        email: submission.email,
                        rollNo: submission.rollNo,
                        profile: submission.profile,
                        cvLink: submission.cvLink,
                        submissionTime: submission.submittedAt,
                        status: submission.status
                    }
                };
                if (submission.review) {
                    result.feedback = {
                        id: submission.review.id,
                        comments: submission.review.comments,
                        aiSuggestions: submission.review.aiSuggestions,
                        submissionTime: submission.review.createdAt,
                        reviewer: {
                            name: submission.review.reviewer.name,
                            id: submission.review.reviewer.id
                        }
                    };
                }
                return res.json(result);
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ error: 'Server error' });
            }
        });
    }
}
exports.default = RevieweeController;
