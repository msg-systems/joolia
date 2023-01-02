import * as bcrypt from 'bcryptjs';
import { omit } from 'lodash';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne } from 'typeorm';
import { AvatarFileEntry, Library, Submission, UserCanvasSubmission, UserSubmission } from './internal';
import { AbstractModel } from './AbstractModel';
import { UserSkill } from './UserSkillModel';

const saltRounds = 10;

@Entity()
export class User extends AbstractModel<User> {
    @Column({
        nullable: true
    })
    public name: string;

    @Column({
        nullable: true
    })
    public company: string;

    @Column({
        unique: true
    })
    public email: string;

    @Column({
        select: false,
        nullable: true
    })
    public password: string;

    @Column({
        default: 0,
        select: false
    })
    public failedLoginAttempts: number;

    @Column({
        nullable: true,
        select: false
    })
    public failedLoginTimeout: Date;

    @Column({
        default: false,
        precision: 1,
        type: 'bool'
    })
    public admin: boolean;

    @Column({
        default: false,
        precision: 1,
        type: 'bool'
    })
    public pending: boolean;

    @Column({
        nullable: true
    })
    public lastLogin: Date;

    @ManyToMany(() => Library, (library) => library.members, { onDelete: 'NO ACTION' })
    @JoinTable()
    public libraries: Library[];

    @OneToMany(() => Submission, (submission) => submission.createdBy)
    public createdSubmissions: Submission[];

    @OneToMany(() => UserSubmission, (userSubmission) => userSubmission.user)
    public submissions: UserSubmission[];

    @OneToMany(() => UserSkill, (userSkill) => userSkill.user)
    public skills: UserSkill[];

    @OneToMany(() => UserCanvasSubmission, (userCanvasSubmission) => userCanvasSubmission.user)
    public canvasSubmissions: UserCanvasSubmission[];

    @OneToOne(() => AvatarFileEntry)
    @JoinColumn()
    public avatar: AvatarFileEntry;

    public async setPassword(password): Promise<void> {
        if (password) {
            const salt = await bcrypt.genSalt(saltRounds);
            this.password = await bcrypt.hash(password, salt);
        }
    }

    public async validatePassword(password): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    public stripSensitiveFields(): Partial<User> {
        return omit(this, ['password', 'failedLoginAttempts', 'failedLoginTimeout']);
    }
}
