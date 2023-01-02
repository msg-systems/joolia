import * as express from 'express';
import { getUsers } from '../database/user.doa';
import { offsetLimit } from '../util';

const router = express.Router();

router.get('/', (req: any, res: any) => {
    const userData = getUsers();
    const result = offsetLimit(userData, req.query.offset, req.query.limit);
    return res.send({
        count: userData.length,
        users: result,
    });
});

export default router;
