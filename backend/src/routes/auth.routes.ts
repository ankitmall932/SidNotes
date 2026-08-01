import express from 'express';
import * as controllers from '../controllers/auth.controller.js';

const router = express.Router();

router.post( "/register", controllers.register );

router.post( '/verify-otp', controllers.verifyOtp );

router.post( '/reset-password', controllers.resetPassword );

router.post( '/resend-otp', controllers.resendOtp );

router.post( '/login', controllers.login );

export default router;