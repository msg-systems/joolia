import { logger } from '../../src/logger';

export class DummyBBBService {
    public verifyCredentials(): void {
        logger.info('Dummy BBB Meeting Service created');
    }
}
