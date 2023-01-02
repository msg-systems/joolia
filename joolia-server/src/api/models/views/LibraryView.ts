import { AfterLoad, BaseEntity, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';

/**
 *  Note: If this view is changed you must also update in `db/procedures/views.sql`.
 *
 *  @deprecated See JOOLIA-1937/1978/2077 for context.
 */
@ViewEntity({
    expression: `
    SELECT l.id AS id, l.name AS name, l.updatedAt AS updatedAt,
        (SELECT COUNT(1) FROM user_libraries_library WHERE libraryId = l.id) AS _memberCount,
        (SELECT COUNT(1) FROM format_template WHERE libraryId = l.id) AS _formatTemplateCount,
        (SELECT COUNT(1) FROM activity_template WHERE libraryId = l.id AND phaseTemplateId is NULL) AS _activityTemplateCount,
        (SELECT COUNT(1) FROM phase_template WHERE libraryId = l.id AND formatTemplateId is NULL) AS _phaseTemplateCount
    FROM library l;
    `
})
export class LibraryView extends BaseEntity {
    @ViewColumn()
    @PrimaryColumn()
    public id: string;

    @ViewColumn()
    public name: string;

    @ViewColumn()
    public updatedAt: Date;

    @ViewColumn()
    public _memberCount: string;

    @ViewColumn()
    public _formatTemplateCount: string;

    @ViewColumn()
    public _activityTemplateCount: string;

    @ViewColumn()
    public _phaseTemplateCount: string;

    public memberCount: number;
    public formatTemplateCount: number;
    public activityTemplateCount: number;
    public phaseTemplateCount: number;
    public templateCount: number;

    @AfterLoad()
    public fixTypes(): void {
        // COUNTs are 64bit integers, which do not fit into the standard js-number.
        // So typeorm returns a string, that we parse here.
        this.memberCount = Number(this._memberCount);
        this.formatTemplateCount = Number(this._formatTemplateCount);
        this.activityTemplateCount = Number(this._activityTemplateCount);
        this.phaseTemplateCount = Number(this._phaseTemplateCount);
        this.templateCount = this.formatTemplateCount + this.activityTemplateCount + this.phaseTemplateCount;
    }
}
