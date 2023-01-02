import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import { expect, use } from 'chai';
import { describe } from 'mocha';
import * as request from 'supertest';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import * as chaiThings from 'chai-things';
import { FormatMemberResponse, TeamResponse } from '../../src/api/responses';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

let authToken;

function setupBeforeAndAfter(): void {
    before(async () => {
        await loadFixtures();
    });

    after(async () => {
        await clearDatabases();
    });
}

describe('TeamController', () => {
    describe('Platform User', () => {
        const user = seeds.users.Unprivileged;
        const formatOne = seeds.formats.FormatOne;
        const team1 = seeds.teams.Team1;

        setupBeforeAndAfter();

        before(async () => {
            authToken = await getSignedIn(server, user);
        });

        it('Get an existing team should fail', async () => {
            await request(server.application)
                .get(`/format/${formatOne.id}/team/${team1.id}`)
                .set('Authorization', authToken)
                .expect(403);
        });

        it('Get available team members should fail', async () => {
            await request(server.application)
                .get(`/format/${formatOne.id}/team/${team1.id}/availableNewMembers`)
                .set('Authorization', authToken)
                .expect(403);
        });

        it('Create a new team should fail', async () => {
            await request(server.application)
                .post(`/format/${formatOne.id}/team`)
                .set('Authorization', authToken)
                .send({
                    name: 'Team Testing'
                })
                .expect(403);
        });

        it('Update team name with new name should fail', async () => {
            await request(server.application)
                .put(`/format/${formatOne.id}/team/${team1.id}`)
                .set('Authorization', authToken)
                .send({
                    name: 'New Name'
                })
                .expect(403);
        });

        it('Get all teams of format should be forbidden', async () => {
            await request(server.application)
                .get(`/format/${formatOne.id}/team`)
                .set('Authorization', authToken)
                .expect(403);
        });

        it('Update Team with a new member should fail', async () => {
            await request(server.application)
                .patch(`/format/${formatOne.id}/team/${team1.id}`)
                .set('Authorization', authToken)
                .send({
                    emails: ['whatever@jedi-order.com']
                })
                .expect(403);
        });

        it('Removes member from team should fail', async () => {
            await request(server.application)
                .post(`/format/${formatOne.id}/team/${team1.id}/_delete`)
                .set('Authorization', authToken)
                .send({
                    emails: ['whatever@jedi-order.com']
                })
                .expect(403);
        });

        it('Delete team should fail', async () => {
            await request(server.application)
                .delete(`/format/${formatOne.id}/team/${team1.id}`)
                .set('Authorization', authToken)
                .expect(403);
        });
    });

    describe('As Format Organizer', () => {
        let createdTeam;
        const user = seeds.users.Luke;
        const formatOne = seeds.formats.FormatOne;
        const team1 = seeds.teams.Team1;

        setupBeforeAndAfter();

        before(async () => {
            authToken = await getSignedIn(server, user);
        });

        it('Get available team members should succeed for organizer', async () => {
            await request(server.application)
                .get(`/format/${formatOne.id}/team/${team1.id}/availableNewMembers?filter.name=Mickey`)
                .set('Authorization', authToken)
                .expect(200);
        });

        it('Update team name with new name succeeds for organizer', async () => {
            await request(server.application)
                .put(`/format/${formatOne.id}/team/${team1.id}`)
                .set('Authorization', authToken)
                .send({
                    name: 'I prefer this name'
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).eq(team1.id);
                    expect(res.body.name).eq('I prefer this name');
                });
        });

        it('Get existing team', async () => {
            await request(server.application)
                .get(`/format/${formatOne.id}/team/${team1.id}`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(TeamResponse.attrs);
                    expect(res.body.members).to.be.an('array');
                    expect(res.body.members.length).eq(2);
                    expect(res.body.members[0]).to.have.keys(FormatMemberResponse.attrs);
                });
        });

        it('Create a new team', async () => {
            await request(server.application)
                .post('/format/' + formatOne.id + '/team')
                .set('Authorization', authToken)
                .send({
                    name: 'Team Testing'
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).to.have.keys(TeamResponse.attrs);
                    expect(res.body.createdBy.id).eq(user.id);
                    createdTeam = res.body;
                });
        });

        it('Update team name with new name', async () => {
            await request(server.application)
                .put(`/format/${formatOne.id}/team/${createdTeam.id}`)
                .set('Authorization', authToken)
                .send({
                    name: 'New Name'
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).eq(createdTeam.id);
                    expect(res.body.name).eq('New Name');
                });
        });

        it('Get all teams of format', async () => {
            await request(server.application)
                .get(`/format/${formatOne.id}/team`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['count', 'entities']);
                    expect(res.body.count).eq(4);
                    // Teams should be order on name asc name by default
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');
                });
        });

        it('Get all teams of format a user can be added to', async () => {
            await request(server.application)
                .get(`/format/${formatOne.id}/usersAvailableTeams/${user.id}`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['count', 'entities']);
                    expect(res.body.count).eq(1);
                });
        });

        it('Update Team with a new member', async () => {
            await request(server.application)
                .patch(`/format/${formatOne.id}/team/${createdTeam.id}`)
                .set('Authorization', authToken)
                .send({
                    emails: ['OBI.wan@jedi-order.com']
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body[0]).to.have.keys(FormatMemberResponse.attrs);
                    expect(res.body[0].email).equal('obi.wan@jedi-order.com');
                });
        });

        it('Organizer Luke can add new member without being creator of team 10', async () => {
            await request(server.application)
                .patch(`/format/${seeds.formats.FormatTwo.id}/team/${seeds.teams.Team10.id}`)
                .set('Authorization', authToken)
                .send({
                    emails: ['princess@alliance.com']
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body[0]).to.have.keys(FormatMemberResponse.attrs);
                    expect(res.body[0].email).equal('princess@alliance.com');
                });
        });

        it('Get the team with the new member', async () => {
            await request(server.application)
                .get(`/format/${formatOne.id}/team/${createdTeam.id}`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(TeamResponse.attrs);
                    expect(res.body.members).to.be.an('array');
                    expect(res.body.members.length).eq(2);
                    res.body.members.forEach((m) => {
                        expect(m).to.have.keys(FormatMemberResponse.attrs);
                        expect(m.email).to.be.oneOf(['obi.wan@jedi-order.com', 'luke@alliance.com']);
                    });
                });
        });

        it('Removes added member from team', async () => {
            await request(server.application)
                .post(`/format/${formatOne.id}/team/${createdTeam.id}/_delete`)
                .set('Authorization', authToken)
                .send({
                    emails: ['OBI.wan@jedi-order.com']
                })
                .expect(204);
        });

        it('Removes creator from team', async () => {
            await request(server.application)
                .post(`/format/${formatOne.id}/team/${createdTeam.id}/_delete`)
                .set('Authorization', authToken)
                .send({
                    emails: ['luke@alliance.com']
                })
                .expect(204);
        });

        it('Get updated team without any members', async () => {
            await request(server.application)
                .get(`/format/${formatOne.id}/team/${createdTeam.id}`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(TeamResponse.attrs);
                    expect(res.body.members).to.be.an('array');
                    expect(res.body.members.length).eq(0);
                });
        });

        it('Delete created team', async () => {
            await request(server.application)
                .delete('/format/' + formatOne.id + '/team/' + createdTeam.id)
                .set('Authorization', authToken)
                .expect(204);
        });
    });

    describe('As Format Participant', () => {
        let createdTeam;
        const user = seeds.users.Leia;
        const user2 = seeds.users.Luke;
        const formatTwo = seeds.formats.FormatTwo;
        const team10 = seeds.teams.Team10;

        setupBeforeAndAfter();

        before(async () => {
            authToken = await getSignedIn(server, user);
        });

        it('Update team name with new name fails for format participant', async () => {
            await request(server.application)
                .put(`/format/${formatTwo.id}/team/${team10.id}`)
                .set('Authorization', authToken)
                .send({
                    name: 'I prefer this name'
                })
                .expect(403);
        });

        it('Get available team members should fail', async () => {
            await request(server.application)
                .get(`/format/${formatTwo.id}/team/${team10.id}/availableNewMembers`)
                .set('Authorization', authToken)
                .expect(403);
        });

        it('Get existing team is not allowed for a participant', async () => {
            await request(server.application)
                .get(`/format/${formatTwo.id}/team/${team10.id}`)
                .set('Authorization', authToken)
                .expect(403);
        });

        it('Participant is not allowed to delete a team', async () => {
            await request(server.application)
                .delete(`/format/${formatTwo.id}/team/${team10.id}`)
                .set('Authorization', authToken)
                .expect(403);
        });

        it('Participant is not allowed to add a new member', async () => {
            await request(server.application)
                .patch(`/format/${formatTwo.id}/team/${team10.id}`)
                .set('Authorization', authToken)
                .send({
                    emails: ['blah@blah.com']
                })
                .expect(403);
        });

        it('Participant is not allowed to remove member', async () => {
            await request(server.application)
                .post(`/format/${formatTwo.id}/team/${team10.id}/_delete`)
                .set('Authorization', authToken)
                .send({
                    emails: ['blah@blah.com']
                })
                .expect(403);
        });

        it('Get all teams of format before user becomes Creator', async () => {
            await request(server.application)
                .get(`/format/${formatTwo.id}/team`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['count', 'entities']);
                    expect(res.body.count).eq(0);
                });
        });

        it('Create a new team', async () => {
            await request(server.application)
                .post(`/format/${formatTwo.id}/team`)
                .set('Authorization', authToken)
                .send({
                    name: 'Team Testing'
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).to.have.keys(TeamResponse.attrs);
                    expect(res.body.createdBy.id).eq(user.id);
                    createdTeam = res.body;
                });
        });

        it('Update team name with new name', async () => {
            await request(server.application)
                .put(`/format/${formatTwo.id}/team/${createdTeam.id}`)
                .set('Authorization', authToken)
                .send({
                    name: 'New Name'
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).eq(createdTeam.id);
                    expect(res.body.name).eq('New Name');
                });
        });

        it('Get all teams of format', async () => {
            await request(server.application)
                .get(`/format/${formatTwo.id}/team`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['count', 'entities']);
                    expect(res.body.count).eq(1);
                });
        });

        it('Get all teams of format a user can be added to', async () => {
            await request(server.application)
                .get(`/format/${formatTwo.id}/usersAvailableTeams/${user2.id}`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['count', 'entities']);
                    expect(res.body.count).eq(1);
                });
        });

        it('Delete created team', async () => {
            await request(server.application)
                .delete(`/format/${formatTwo.id}/team/${createdTeam.id}`)
                .set('Authorization', authToken)
                .expect(204);
        });
    });

    describe('As Format Creator', () => {
        const user = seeds.users.Leia;
        const formatFour = seeds.formats.FormatFour;
        const team6 = seeds.teams.Team6; // In fixture Leia is the Creator

        setupBeforeAndAfter();

        before(async () => {
            authToken = await getSignedIn(server, user);
        });

        it('Get existing team', async () => {
            await request(server.application)
                .get(`/format/${formatFour.id}/team/${team6.id}`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(TeamResponse.attrs);
                    expect(res.body.members).to.be.an('array');
                    expect(res.body.members.length).eq(0);
                });
        });

        it('Get available team members should succeed for creator', async () => {
            await request(server.application)
                .get(`/format/${formatFour.id}/team/${team6.id}/availableNewMembers`)
                .set('Authorization', authToken)
                .expect(200);
        });

        it('Update team name with new name', async () => {
            await request(server.application)
                .put(`/format/${formatFour.id}/team/${team6.id}`)
                .set('Authorization', authToken)
                .send({
                    name: 'New Name'
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).eq(team6.id);
                    expect(res.body.name).eq('New Name');
                });
        });

        it('Get all teams of format', async () => {
            await request(server.application)
                .get(`/format/${formatFour.id}/team`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['count', 'entities']);
                    expect(res.body.count).eq(1);
                });
        });

        it('Update Team with a new member', async () => {
            await request(server.application)
                .patch(`/format/${formatFour.id}/team/${team6.id}`)
                .set('Authorization', authToken)
                .send({
                    emails: ['shaak.ti@jedi-order.com']
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body[0]).to.have.keys(FormatMemberResponse.attrs);
                    expect(res.body[0].email).equal('shaak.ti@jedi-order.com');
                });
        });

        it('Get the team with the new member', async () => {
            await request(server.application)
                .get(`/format/${formatFour.id}/team/${team6.id}`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(TeamResponse.attrs);
                    expect(res.body.members).to.be.an('array');
                    expect(res.body.members.length).eq(1);
                    expect(res.body.members[0]).to.have.keys(FormatMemberResponse.attrs);
                    expect(res.body.members[0].email).equal('shaak.ti@jedi-order.com');
                });
        });

        it('Removes member from team', async () => {
            await request(server.application)
                .post(`/format/${formatFour.id}/team/${team6.id}/_delete`)
                .set('Authorization', authToken)
                .send({
                    emails: ['shaak.ti@jedi-order.com']
                })
                .expect(204);
        });

        it('Get updated team without any members', async () => {
            await request(server.application)
                .get(`/format/${formatFour.id}/team/${team6.id}`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(TeamResponse.attrs);
                    expect(res.body.members).to.be.an('array');
                    expect(res.body.members.length).eq(0);
                });
        });

        it('Delete team', async () => {
            await request(server.application)
                .delete(`/format/${formatFour.id}/team/${team6.id}`)
                .set('Authorization', authToken)
                .expect(204);
        });
    });

    describe('As Team Member', () => {
        let createdTeam;
        const user = seeds.users.Luke;
        const formatEight = seeds.formats.FormatEight; // Luke is participant in this format
        const team8 = seeds.teams.Team8; // Luke is a member in this Team

        setupBeforeAndAfter();

        before(async () => {
            authToken = await getSignedIn(server, user);
        });

        it('Update team with new name', async () => {
            await request(server.application)
                .put(`/format/${formatEight.id}/team/${team8.id}`)
                .set('Authorization', authToken)
                .send({
                    name: 'New Name'
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).eq(team8.id);
                    expect(res.body.name).eq('New Name');
                });
        });

        it('Get available team members should succeed', async () => {
            await request(server.application)
                .get(`/format/${formatEight.id}/team/${team8.id}/availableNewMembers`)
                .set('Authorization', authToken)
                .expect(200);
        });

        it('Get existing team', async () => {
            await request(server.application)
                .get(`/format/${formatEight.id}/team/${team8.id}`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(TeamResponse.attrs);
                    expect(res.body.members).to.be.an('array');
                    expect(res.body.members.length).eq(2);
                });
        });

        it('Member is not allowed to delete its team', async () => {
            await request(server.application)
                .delete(`/format/${formatEight.id}/team/${team8.id}`)
                .set('Authorization', authToken)
                .expect(403);
        });

        it('Member is not allowed to add a new member', async () => {
            await request(server.application)
                .patch(`/format/${formatEight.id}/team/${team8.id}`)
                .set('Authorization', authToken)
                .send({
                    emails: ['blah@blah.com']
                })
                .expect(403);
        });

        it('Member is not allowed to remove member', async () => {
            await request(server.application)
                .post(`/format/${formatEight.id}/team/${team8.id}/_delete`)
                .set('Authorization', authToken)
                .send({
                    emails: ['blah@blah.com']
                })
                .expect(403);
        });

        it('Create a new team', async () => {
            await request(server.application)
                .post(`/format/${formatEight.id}/team/`)
                .set('Authorization', authToken)
                .send({
                    name: 'Team Testing'
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).to.have.keys(TeamResponse.attrs);
                    expect(res.body.createdBy.id).eq(user.id);
                    createdTeam = res.body;
                });
        });

        it('Update created team with new name', async () => {
            await request(server.application)
                .put(`/format/${formatEight.id}/team/${createdTeam.id}`)
                .set('Authorization', authToken)
                .send({
                    name: 'New Name'
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).eq(createdTeam.id);
                    expect(res.body.name).eq('New Name');
                });
        });

        it('Get all teams of format', async () => {
            await request(server.application)
                .get(`/format/${formatEight.id}/team`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['count', 'entities']);
                    expect(res.body.count).eq(2);
                });
        });

        it('Delete created team', async () => {
            await request(server.application)
                .delete('/format/' + formatEight.id + '/team/' + createdTeam.id)
                .set('Authorization', authToken)
                .expect(204);
        });
    });
});
