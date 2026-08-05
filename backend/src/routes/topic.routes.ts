import express from 'express';
import * as controllers from '../controllers/topic.controller.js';
import { protect } from '../middleware/protect.js';

const router = express.Router();

router.post( '/create', protect, controllers.createTopics );

router.get( '/get', protect, controllers.getTopics );

router.put( '/:id/edit', protect, controllers.editTopic );


export default router;