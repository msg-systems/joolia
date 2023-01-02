import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { Format, User, Workspace } from '../models';
import { UserService } from './user.service';

@Injectable()
export class ReferenceResolverService {
    constructor(private logger: LoggerService, private userService: UserService) {}

    public resolveRef(o: Format | Workspace | User): Observable<Format | Workspace | User> {
        for (const field of Object.keys(o)) {
            if (/Id$/.test(field)) {
                switch (this.getFieldName(field)) {
                    case 'workspace':
                        // No resolving needed since this would create unnecessary failing requests
                        break;
                    case 'createdBy':
                    case 'updatedBy':
                        this.resolveUser(o, field);
                        break;
                    case 'avatar':
                        this.resolveAvatar(o, field);
                        break;
                    default:
                        this.logger.fatal('[ReferenceResolver] missing ref resolver for: ' + field);
                        break;
                }
            }
        }
        return of(o);
    }

    private resolveUser(o, field) {
        if (o[field]) {
            this.logger.debug('[ReferenceResolver] resolve: ' + field);
            this.userService.loadUser(o[field]).subscribe((u) => {
                o[this.getFieldName(field)] = u;
                delete o[field];
            });
        }
    }

    private resolveAvatar(o, field) {
        if (!o.pending && o.avatarId && o[field]) {
            this.logger.debug('[ReferenceResolver] resolve: ' + field);
            this.userService.loadAvatarMeta(o.id).subscribe((a) => {
                o[this.getFieldName(field)] = a;
                delete o[field];
            });
        }
    }

    private getFieldName(field): string {
        return field.substring(0, field.length - 2);
    }
}
