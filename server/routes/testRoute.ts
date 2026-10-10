import { Router } from 'express';
import { runSuite } from '../Controller/testController';

const router = Router();

router.get('/run', runSuite);
router.post('/run', runSuite);

export default router;
