import { Router, Request, Response, NextFunction } from "express";
// Make sure the file exists at the correct path and with the correct casing
import RevieweeController from "../controllers/RevieweeController";
import { auth } from "../middleware/auth";

const revieweeController = new RevieweeController();

const router = Router();

router.post("/submit", 
    (req: Request, res: Response, next: NextFunction) => {
        revieweeController.submitCV(req, res, next).catch(next);
    }
);

router.post("/check",
    (req: Request, res: Response, next: NextFunction) => {
        revieweeController.checkStatus(req, res, next).catch(next);
    }
);



router.get("/submission/:email",
    auth(false),
    (req: Request, res: Response, next: NextFunction) => {
        revieweeController.getSubmission(req, res, next).catch(next);
    }
);

export default router;
