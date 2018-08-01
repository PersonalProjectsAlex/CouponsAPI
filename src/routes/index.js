import amazon from '../controllers/amazon';
import express from 'express';
const router = express.Router()

router.route('/signature').get(amazon.signature)

export default router;