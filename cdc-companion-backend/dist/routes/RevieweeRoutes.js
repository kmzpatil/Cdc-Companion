"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Make sure the file exists at the correct path and with the correct casing
const RevieweeController_1 = __importDefault(require("../controllers/RevieweeController"));
const revieweeController = new RevieweeController_1.default();
const router = (0, express_1.Router)();
router.post("/submit", (req, res, next) => {
    revieweeController.submitCV(req, res, next).catch(next);
});
router.post("/check", (req, res, next) => {
    revieweeController.checkStatus(req, res, next).catch(next);
});
router.get("/submission/:email", (req, res, next) => {
    revieweeController.getSubmission(req, res, next).catch(next);
});
exports.default = router;
