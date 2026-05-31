"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = __importDefault(require("../controllers/AdminController"));
const ctrl = new AdminController_1.default();
const router = (0, express_1.Router)();
router.post('/login', (req, res, next) => {
    ctrl.login(req, res, next).catch(next);
});
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
exports.default = router;
