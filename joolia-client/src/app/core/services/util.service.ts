import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigurationService } from './configuration.service';
import { Injectable } from '@angular/core';
import { cloneDeep, isEmpty } from 'lodash-es';
import { SnackbarService } from './snackbar.service';
import { Router } from '@angular/router';
import { LoggerService } from './logger.service';
import { TranslateService } from '@ngx-translate/core';
import { Skill } from '../models';
import { MeetingType } from '../enum/global/meeting-type.enum';

export interface IQueryParams {
    select?: string;
    download?: boolean;
    order?: string;
    skip?: number;
    take?: number;
    filter?: string;
    entity?: string;
    id?: string;

    [key: string]: unknown;
}

/**
 * The UtilService holds general logic and methods that are not sorted into special services. These methods can be used generally everywhere
 * in the application and provide small useful functions.
 */
@Injectable()
export class UtilService {
    constructor(
        private http: HttpClient,
        private config: ConfigurationService,
        private snackbarService: SnackbarService,
        private router: Router,
        private logger: LoggerService
    ) {
        this.serverConnection = this.config.getServerConnection();
    }
    private readonly serverConnection: string;

    /**
     * Adds filter to queryParams
     * @return (HttpParams) Params in the definition the server needs
     * @param queryParams (IQueryParams) query params with values
     * @param filter (Object) { 'field': 'value' }
     * @param filter (Object) { 'field[]': 'value=a,value=b' }
     */
    static addFilterToQueryParams(queryParams: IQueryParams, filter: object): IQueryParams {
        if (!isEmpty(filter)) {
            let resultFilter = '';

            for (const [key, value] of Object.entries(filter)) {
                if (key.endsWith('[]')) {
                    resultFilter = value;
                } else {
                    resultFilter += key + '=' + value + ',';
                }
            }

            // remove last ","
            if (resultFilter.endsWith(',')) {
                resultFilter = resultFilter.slice(0, -1);
            }

            queryParams = {
                ...queryParams,
                filter: resultFilter
            };
        }
        return { ...queryParams };
    }

    /**
     * Transform IQueryparams to HTTPParams
     * @return (HttpParams) Params in the definition the server needs
     * @param queryParams (IQueryParams) query params with values
     */
    static buildHttpParams(queryParams: IQueryParams): HttpParams {
        const qp = cloneDeep(queryParams);
        if (!qp) {
            return;
        } else {
            Object.keys(qp).forEach((key) => (qp[key] === undefined ? delete qp[key] : {}));
            if (!qp) {
                return;
            }
        }

        let resultParams: HttpParams = new HttpParams();

        if (this.hasField(qp, 'select')) {
            qp.select.split(',').forEach((s) => (resultParams = resultParams.append('select[]', s)));
            delete qp.select;
        }

        if (this.hasField(qp, 'download')) {
            resultParams = resultParams.append('download', qp.download.toString());
            delete qp.download;
        }

        if (this.hasField(qp, 'order')) {
            let orderDirection;
            let orderName;

            qp.order.split(',').forEach((o) => {
                if (o[0] === '-') {
                    orderDirection = 'DESC';
                    orderName = o.slice(1);
                } else {
                    orderDirection = 'ASC';
                    orderName = o;
                }

                resultParams = resultParams.append('order[' + orderName + ']', orderDirection);

                orderDirection = orderName = '';
            });

            delete qp.order;
        }

        if (this.hasField(qp, 'skip')) {
            resultParams = resultParams.append('skip', qp.skip.toString());
            delete qp.skip;
        }

        if (this.hasField(qp, 'take')) {
            resultParams = resultParams.append('take', qp.take.toString());
            delete qp.take;
        }

        if (this.hasField(qp, 'filter')) {
            qp.filter
                .split(',')
                .sort()
                .forEach((s) => {
                    const keyValue = s.split('=');
                    resultParams = resultParams.append('filter[' + keyValue[0] + ']', keyValue[1]);
                });
            delete qp.filter;
        }

        if (this.hasField(qp, 'entity')) {
            resultParams = resultParams.append('entity', qp.entity.toString());
            delete qp.entity;
        }

        if (this.hasField(qp, 'id')) {
            resultParams = resultParams.append('id', qp.id.toString());
            delete qp.id;
        }

        // all other cases like field[]=test
        if (Object.keys(qp)) {
            Object.keys(qp).forEach((o) => {
                const param: string = (qp[o] + '') as string;
                (param + '').split(',').forEach((s) => (resultParams = resultParams.append(o + '[]', s)));
            });
        }

        return resultParams;
    }

    private static hasField(queryParams: IQueryParams, field: string): boolean {
        return queryParams.hasOwnProperty(field) && queryParams[field] != null;
    }

    static removeFileExtension(fileName: string) {
        return fileName.includes('.')
            ? fileName
                  .split('.')
                  .slice(0, -1)
                  .join('.')
            : fileName;
    }

    static extractFileExtension(fileName: string) {
        return fileName.includes('.') ? fileName.split('.').pop() : '';
    }

    /**
     * Transforms the given you tube video in an embedded one
     */
    static getEmbeddedYouTubeUrl(youTubeLink: string): string {
        const regex = new RegExp(ConfigurationService.getConfiguration().configuration.validations.videoURL);
        const match = youTubeLink.match(regex);

        // Change to you tube embedded
        return match ? 'https://www.youtube.com/embed/' + match[2] : undefined;
    }

    /**
     * Tries to determine whether the user-client has a touch device.
     * @return prediction as boolean
     */
    static isTouchDevice(): boolean {
        /*
         * Touch-Devices are not trivial -nearly impossible- to detect.
         * http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
         * https://modernizr.com/docs/   see touchevents
         * https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
         */
        const hasTouchApi = 'ontouchstart' in window;
        const hasTouchMediaQuery = window.matchMedia('(pointer: coarse)').matches;

        return hasTouchApi || hasTouchMediaQuery;
    }

    static encodeObjectBase64andURI(object): string {
        return encodeURIComponent(btoa(JSON.stringify(object)));
    }

    static decodeObjectBase64andURI(encodedObject: string) {
        return JSON.parse(atob(decodeURIComponent(encodedObject)));
    }

    logAndNavigate(error: any, classObj: Object, method: Object, snackbarMessage: string, route: string) {
        this.logger.debug(error, classObj, method);
        this.snackbarService.openWithMessage(snackbarMessage);
        this.router.navigate([route]);
    }

    /**
     * Transforms Path to Object with keys
     * @param path The Url Path of the entity
     * @return Object with key / value
     * ```
     * Input: /format/123/phase/456
     * Return: {
     *          formatId: 123,
     *          phaseId: 456
     *         }
     * ```
     */
    getKeysFromPath(path: string): Object {
        const keys = {};
        const keysArray = path.split('/');
        keysArray.forEach((value, i) => {
            if (!!(i % 2)) {
                keys[value + 'Id'] = keysArray[i + 1];
            }
        });
        return keys;
    }

    /**
     * Gets an string array and concats the entries after translation separated by comma.
     * @param array of skills
     * @return transformed string of translated skills
     */
    getUserSkillsAsText(skills: Skill[], translateService: TranslateService) {
        const skillText = skills
            .map((skill: Skill) => {
                return translateService.instant('skill.' + skill.name);
            })
            .join(', ');

        return skillText;
    }

    normalizeStr(s: string): string {
        let normalized = s.replace(/\s/g, '_');
        normalized = normalized.replace(/&/g, 'and');
        normalized = normalized.replace(/-/g, '');
        normalized = normalized.replace(/\//g, '_');
        normalized = normalized.replace(/\\/g, '_');
        normalized = normalized.replace(/(_)+/g, '_');
        return normalized.toUpperCase();
    }

    getTypeOfMeetingFromUrl(meetingUrl: string): MeetingType {
        const teamsRegExp = new RegExp(ConfigurationService.getConfiguration().configuration.validations.meetingUrl.teams);
        if (teamsRegExp.test(meetingUrl)) {
            return MeetingType.MSTeams;
        } else {
            return MeetingType.BBB;
        }
    }
}
