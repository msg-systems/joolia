import express from 'express';
import userRouter from './api/users';
import { serverPort } from './config';

export default () => {
    const app = express();

    app.use('/api/users', userRouter);

    app.route('/*').get((req: any, res: any) => {
        return res.status(204);
    });

    app.listen(serverPort, () => console.log('Mockserver listening on port 9100!'));
};
