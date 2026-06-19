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
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
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
            var _a, _b, _c;
            try {
                const payload = req.user;
                if (!payload) {
                    return res.status(401).json({ error: 'Unauthenticated' });
                }
                const { revieweeId, comments } = req.body;
                if (!Array.isArray(comments)) {
                    return res.status(400).json({ error: 'Comments must be an array' });
                }
                const re = yield prisma_1.default.reviewee.findUnique({
                    where: { id: revieweeId },
                    select: { email: true, name: true, cvLink: true, profile: true },
                });
                if (!re) {
                    return res.status(404).json({ error: 'Reviewee not found' });
                }
                // Check if a review already exists to prevent duplicate reviewer count increments
                const existingReview = yield prisma_1.default.review.findUnique({
                    where: { revieweeId }
                });
                // 1. Extract CV text from link using python extractor
                let cvText = '';
                if (re.cvLink) {
                    cvText = yield new Promise((resolve) => {
                        const scriptPath = path_1.default.join(__dirname, '../../scripts/extract_text.py');
                        (0, child_process_1.exec)(`python "${scriptPath}" "${re.cvLink}"`, { encoding: 'utf8' }, (error, stdout, stderr) => {
                            if (error) {
                                console.error("Text extraction failed:", stderr || error.message);
                                resolve('');
                            }
                            else {
                                resolve(stdout.trim());
                            }
                        });
                    });
                }
                // 2. Generate AI Suggestions using Groq API with key rotation
                let aiSuggestions = '';
                const groqKeysStr = process.env.GROQ_API_KEYS || '';
                const groqKeys = groqKeysStr.split(',').map(k => k.trim()).filter(Boolean);
                const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
                if (groqKeys.length > 0) {
                    const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
                    const labels = [
                        'Structure & Format',
                        'Relevance to Domain',
                        'Depth of Explanation',
                        'Language and Grammar',
                        'Improvements in Projects',
                        'Additional Suggestions',
                    ];
                    const commentsText = comments.map((c, i) => `${labels[i] || 'Feedback'}: ${c}`).join('\n');
                    const prompt = `
You are an expert resume refiner. A student's CV was reviewed by a senior placement coordinator, who left specific diagnostic feedback.
Your goal is to read the student's CV text (if available) and the reviewer's feedback, then write detailed, actionable, section-by-section refinement suggestions.
Provide concrete "Before" vs "After" rewriting examples for their bullet points, projects, or structure, showing how they can rewrite lines to satisfy the reviewer's feedback.

Candidate Profile/Track: ${re.profile}
Reviewer's Diagnostic Feedback:
${commentsText}

${cvText ? `Here is the student's CV content (raw text): \n${cvText.slice(0, 8000)}` : 'Note: CV raw content is not directly readable. Use the Reviewer\'s Diagnostic Feedback to generate the optimal resume structure, best bullet points, and section improvements for their track.'}

Provide your response in clean, premium Markdown formatting.
`;
                    // Try keys one by one
                    for (let i = 0; i < groqKeys.length; i++) {
                        const currentKey = groqKeys[i];
                        try {
                            const groqResponse = yield fetch(groqUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${currentKey}`
                                },
                                body: JSON.stringify({
                                    model: groqModel,
                                    messages: [
                                        {
                                            role: 'system',
                                            content: 'You are an expert resume refiner. Provide direct, highly professional, actionable CV suggestions in clean markdown.'
                                        },
                                        {
                                            role: 'user',
                                            content: prompt
                                        }
                                    ],
                                    temperature: 0.1
                                })
                            });
                            if (groqResponse.ok) {
                                const groqData = yield groqResponse.json();
                                const content = ((_c = (_b = (_a = groqData.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || '';
                                if (content.trim()) {
                                    aiSuggestions = content;
                                    break; // Success! Break out of the rotation loop
                                }
                                else {
                                    console.warn(`Groq API key ${i + 1} succeeded but returned empty content. Trying next key.`);
                                }
                            }
                            else {
                                console.error(`Groq API key ${i + 1} failed status:`, groqResponse.status);
                            }
                        }
                        catch (groqErr) {
                            console.error(`Error calling Groq API with key ${i + 1}:`, groqErr);
                        }
                    }
                }
                // Offline fallback suggestions if Groq keys fail
                if (!aiSuggestions) {
                    aiSuggestions = `### AI CV Refinement Suggestions (Offline Fallback)
The AI assistant is temporarily busy or reached its request limit. Here is a summary of recommended actions based on the reviewer's feedback:
* **Address Reviewer Comments**: Focus on the specific items highlighted by the reviewer (e.g., improve structure, add domain-specific terminology).
* **Quantify Results**: Try to add metrics (percentages, numbers) to your project descriptions and work experience bullet points.
* **Format Consistency**: Ensure consistent margins, font sizes, and bullet styles throughout the document.`;
                }
                // Resolve reviewerId safely (especially if Admin)
                let reviewerId = payload.id;
                if (payload.isAdmin) {
                    const matchingReviewer = yield prisma_1.default.reviewer.findFirst({
                        where: { name: payload.name }
                    });
                    if (matchingReviewer) {
                        reviewerId = matchingReviewer.id;
                    }
                    else {
                        const adminReviewer = yield prisma_1.default.reviewer.findFirst({
                            where: { admin: true }
                        });
                        if (adminReviewer) {
                            reviewerId = adminReviewer.id;
                        }
                        else {
                            const anyReviewer = yield prisma_1.default.reviewer.findFirst();
                            if (anyReviewer) {
                                reviewerId = anyReviewer.id;
                            }
                            else {
                                const defaultReviewer = yield prisma_1.default.reviewer.create({
                                    data: {
                                        name: payload.name,
                                        email: `${payload.name.toLowerCase().replace(/\s+/g, '')}@kgpian.iitkgp.ac.in`,
                                        password: 'adminpassword',
                                        reviewsNumber: 9999,
                                        admin: true
                                    }
                                });
                                reviewerId = defaultReviewer.id;
                            }
                        }
                    }
                }
                const review = yield prisma_1.default.review.upsert({
                    where: { revieweeId },
                    update: {
                        comments,
                        aiSuggestions,
                        reviewerId,
                    },
                    create: {
                        revieweeId,
                        reviewerId,
                        comments,
                        aiSuggestions,
                    },
                });
                yield prisma_1.default.reviewee.update({
                    where: { id: revieweeId },
                    data: { status: true, submittedAt: new Date() },
                });
                if (!existingReview) {
                    yield prisma_1.default.reviewer.update({
                        where: { id: reviewerId },
                        data: { reviewedCount: { increment: 1 } },
                    });
                }
                if (re.email) {
                    const labels = [
                        'Structure & Format',
                        'Relevance to Domain',
                        'Depth of Explanation',
                        'Language and Grammar',
                        'Improvements in Projects',
                        'Additional Suggestions',
                    ];
                    const formattedComments = labels.map((label, idx) => `${label}: ${comments[idx]}`);
                    (0, mailer_1.sendReviewEmail)({
                        to: re.email,
                        userName: re.name,
                        reviewComments: formattedComments,
                        aiSuggestions: aiSuggestions || undefined,
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
