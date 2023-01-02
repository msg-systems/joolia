import { logger } from '../../src/logger';

export class DummyMSTeamsService {
    public verifyCredentials(): void {
        logger.info('Dummy MS Teams Meeting Service created');
    }
}
