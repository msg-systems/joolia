import { IProcessor } from 'typeorm-fixtures-cli';
import { User } from '../../src/api/models';

export default class UserProcessor implements IProcessor<User> {
    public async preProcess(name: string, object: Partial<User>): Promise<unknown> {
        const user = new User();
        user.pending = object.pending || undefined; // undefined force to honor the default choice in db
        user.id = object.id;
        user.avatar = object.avatar;
        user.company = object.company;
        user.name = object.name;
        user.email = object.email;
        user.password = object.password;
        user.admin = object.admin || undefined; // undefined force to honor the default choice in db
        // fixtures to test SSO does not have pass
        if (object.password) {
            await user.setPassword(object.password);
        }
        return { ...user };
    }
}
