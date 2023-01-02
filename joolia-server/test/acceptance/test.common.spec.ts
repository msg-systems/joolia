import { getConf } from '../../src/config';
import { createServer } from '../../src/server';
import { DummyFileService } from '../mock';
import { DummyBBBService } from '../mock/DummyBBBService';
import { DummyMSTeamsService } from '../mock/DummyMSTeamsService';

export const server = createServer(getConf(), new DummyFileService(), new DummyBBBService(), new DummyMSTeamsService());

before(async () => {
    await server.start();
});

after(async () => {
    await server.stop();
});
