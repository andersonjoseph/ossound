import {db} from "@db/index";
import {UserDbResult, usersTable} from "@user/tables/user.table";
import {IUserRepository} from "@user/repositories/interfaces/user.repository.interface";
import {RegisterUserDtoProps} from "../use-cases/register-user/interfaces/register-user-dto-validator.interface";
import {eq} from "drizzle-orm";
import {OssoundConflictError} from "../../../common/errors";

export class UserRepository implements IUserRepository {

  async usernameExists(username: string): Promise<boolean> {
    const [existingUser] = await db.select({id: usersTable.id }).from(usersTable).where(eq(usersTable.username, username));

    return !!existingUser
  }

  async emailExists(email: string): Promise<boolean> {
    const [existingUser] = await db.select({id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email));

    return !!existingUser
  }

  private async throwIfUserExists(options: Pick<RegisterUserDtoProps, 'username' | 'email' >) {
    if(await this.usernameExists(options.username)) {
      throw new OssoundConflictError(`An user with the username: ${options.username} already exists`);
    }

    if(await this.emailExists(options.username)) {
      throw new OssoundConflictError(`An user with the email: ${options.email} already exists`);
    }
  }

  async save(dto: RegisterUserDtoProps): Promise<UserDbResult> {
    await this.throwIfUserExists(dto);

    const [savedUser] = await db.insert(usersTable).values(dto).returning();

    return savedUser;
  }

}
