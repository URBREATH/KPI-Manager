import express, { Router } from 'express';
import { callbackUrl, getLoginUrl, logoutUrl } from '../controllers/authController';
import { protect } from '../middlewares/AuthMiddleware';
const router: Router = express.Router();

router.route('/:tenantId/auth/login').get(getLoginUrl);
router.route('/:tenantId/auth/callback').get(callbackUrl);
router.route('/:tenantId/auth/logout').get(logoutUrl);

router.get('/:tenantId/me', (req, res) => {
    if ((req as any).session?.user) {
        res.status(200).json((req as any).session.user);
    } else {
        res.status(401).send('User not authenticated');
    }
});

router.head('/:tenantId/status', protect, (req, res) => {
    res.status(200).send();
});
export default router;