import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { pick } from 'lodash-es';
import { UserRole } from 'src/app/core/models';
import { UserService } from 'src/app/core/services';
import { DialogStub, getMockData, UserServiceStub } from '../../../../testing/unitTest';
import { MomentPipe } from '../../pipes';
import { CommentComponent } from './comment.component';

const userServiceStub = new UserServiceStub();
const dialogStub = new DialogStub({ confirmation: true });

let mockCommentList1;
let mockComment1;
let mockComment2;
let mockComment3;
let mockComment4;
let mockComment5;
let mockUserLuke;
let mockUserLeia;

describe('CommentComponent', () => {
    let component: CommentComponent;
    let fixture: ComponentFixture<CommentComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            declarations: [CommentComponent, MomentPipe],
            providers: [
                { provide: UserService, useValue: userServiceStub },
                { provide: MatDialog, useValue: dialogStub }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        mockCommentList1 = getMockData('comment.list.list1');
        mockComment1 = getMockData('comment.comment1');
        mockComment2 = getMockData('comment.comment2');
        mockComment3 = getMockData('comment.comment3');
        mockComment4 = getMockData('comment.comment4');
        mockComment5 = getMockData('comment.comment5');
        mockUserLuke = getMockData('user.luke');
        mockUserLeia = getMockData('user.leia');

        fixture = TestBed.createComponent(CommentComponent);
        component = fixture.componentInstance;
        component.comments = mockCommentList1;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.comments.count).toEqual(5);
    });

    describe('Send Comment', () => {
        it('Send comment should emit sendCommentEvent', () => {
            const emitSpy = spyOn(component.sendComment, 'emit').and.callThrough();
            const values = pick(mockComment1, ['createdBy', 'comment']);

            // mock inputs
            const textArea: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('mat-form-field textarea');
            textArea.value = values.comment;

            fixture.debugElement.nativeElement.querySelector('.sendButton').click();

            expect(emitSpy).toHaveBeenCalledWith(values);
            expect(textArea.value).toEqual('');
        });

        it('Send comment without comment text should emit sendCommentEvent', () => {
            const emitSpy = spyOn(component.sendComment, 'emit').and.callThrough();
            const values = pick(mockComment5, ['createdBy', 'rating', 'comment']);

            fixture.debugElement.nativeElement.querySelector('.sendButton').click();

            expect(emitSpy).toHaveBeenCalledWith(values);
            expect(fixture.debugElement.nativeElement.querySelector('mat-form-field textArea').value).toEqual('');
        });
    });

    describe('Delete Comment', () => {
        it('Should emit delete as user deletes own comment', () => {
            // mock current user
            component.userRole = UserRole.PARTICIPANT;
            component.currentUser.id = mockUserLuke.id;
            fixture.detectChanges();

            const emitSpy = spyOn(component.deleteComment, 'emit').and.callThrough();
            const values = '7d6d537d-6be7-4c99-b0e2-a327d70b02ec';

            fixture.debugElement.nativeElement.querySelector('.comment-delete').click();

            expect(emitSpy).toHaveBeenCalledWith(values);
        });

        it('Should emit delete as user is organizer', () => {
            // mock current user
            component.userRole = UserRole.ORGANIZER;
            component.currentUser.id = mockUserLeia.id;
            fixture.detectChanges();

            const emitSpy = spyOn(component.deleteComment, 'emit').and.callThrough();
            const values = '7d6d537d-6be7-4c99-b0e2-a327d70b02ec';

            fixture.debugElement.nativeElement.querySelector('.comment-delete').click();

            expect(emitSpy).toHaveBeenCalledWith(values);
        });

        it('Should return false if user is not comment owner nor organizer', () => {
            // fake different current user than comment user
            component.currentUser.id = mockUserLeia.id;
            component.userRole = UserRole.PARTICIPANT;
            fixture.detectChanges();

            expect(component.checkPermission(component.comments.entities[0])).toBeFalsy();

            // should not render delete button
            const deleteDiv = fixture.debugElement.nativeElement.querySelector('.comment-delete');
            expect(deleteDiv).toBeNull();
        });
    });
});
