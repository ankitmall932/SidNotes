import express from 'express';
import * as controllers from '../controllers/heading.controller.js';
import { protect } from '../middleware/protect.js';

const router = express.Router();

router.post( '/topic/:id/create', protect, controllers.createHeading );

router.get( '/topic/:id/get', protect, controllers.getHeading );

router.get( '/:id/detail-heading', protect, controllers.getDetailHeading );

router.put( '/:id/edit-heading', protect, controllers.editHeading );

router.delete( '/:id/delete', protect, controllers.deleteHeading );

router.put( '/:id/completed', protect, controllers.completedHeading );

export default router;
