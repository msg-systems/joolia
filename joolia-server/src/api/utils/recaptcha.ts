import * as rp from 'request-promise';
import { getConf } from '../../config';
import { logger } from '../../logger';

export async function checkReCaptcha(reCaptchaToken: string, expectedAction: string, url: string): Promise<boolean> {
    const reCaptchaConf = getConf().reCaptchaConf.find((re) => url.includes(re.domain));

    const reCaptchaResponseRaw = await rp.post('https://www.google.com/recaptcha/api/siteverify', {
        form: {
            secret: reCaptchaConf.secret,
            response: reCaptchaToken
        }
    });

    logger.silly('reCaptcha response: %s', reCaptchaResponseRaw);

    const reCaptchaResponse = JSON.parse(reCaptchaResponseRaw);

    const result =
        reCaptchaResponse.success && reCaptchaResponse.action === expectedAction && reCaptchaResponse.score >= reCaptchaConf.threshold;

    logger.silly('reCaptcha result: %s', result);

    return result;
}
