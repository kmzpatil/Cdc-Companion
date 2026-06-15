"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ReviewerController_1 = __importDefault(require("../controllers/ReviewerController"));
const auth_1 = require("../middleware/auth");
const ctrl = new ReviewerController_1.default();
const router = (0, express_1.Router)();
router.post('/login', (req, res, next) => {
    ctrl.login(req, res, next).catch(next);
});
router.post('/signup', (req, res, next) => {
    ctrl.signup(req, res, next).catch(next);
});
router.use((0, auth_1.auth)(false));
router.get('/next', (req, res, next) => {
    ctrl.getNextCV(req, res, next).catch(next);
});
router.post('/review', (req, res, next) => {
    ctrl.submitReview(req, res, next).catch(next);
});
router.get('/assigned', (req, res, next) => {
    ctrl.getAssignedCVs(req, res, next).catch(next);
});
exports.default = router;
