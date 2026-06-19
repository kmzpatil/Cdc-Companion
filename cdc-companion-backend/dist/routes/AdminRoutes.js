"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = __importDefault(require("../controllers/AdminController"));
const auth_1 = require("../middleware/auth");
const ctrl = new AdminController_1.default();
const router = (0, express_1.Router)();
router.post('/login', (req, res, next) => {
    ctrl.login(req, res, next).catch(next);
});
router.use((0, auth_1.auth)(true));
router.get('/reviewees', (req, res, next) => {
    ctrl.listReviewees(req, res, next).catch(next);
});
router.get('/reviewers', (req, res, next) => {
    ctrl.listReviewers(req, res, next).catch(next);
});
router.get('/reviews', (req, res, next) => {
    ctrl.listReviews(req, res, next).catch(next);
});
router.post('/allocate', (req, res, next) => {
    ctrl.allocate(req, res, next).catch(next);
});
router.delete('/reviewee/:id', (req, res, next) => {
    ctrl.deleteReviewee(req, res, next).catch(next);
});
router.delete('/reviewer/:id', (req, res, next) => {
    ctrl.deleteReviewer(req, res, next).catch(next);
});
router.delete('/review/:id', (req, res, next) => {
    ctrl.deleteReview(req, res, next).catch(next);
});
router.post('/reassign', (req, res, next) => {
    ctrl.reassign(req, res, next).catch(next);
});
exports.default = router;
