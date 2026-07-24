import express from 'express';
import * as controllers from '../controllers/auth.controller.js';

const router = express.Router();

router.post( "/register", controllers.register );

router.post( '/verify-otp', controllers.verifyOtp );

export default router;