import {IUserPasswordService} from "./interfaces/user-password.service.interface";

export class UserPasswordService implements IUserPasswordService {

  async hash(password: string): Promise<string> {
    const hashedPassowrd = await Bun.password.hash(password);

    return hashedPassowrd
  }

  isValid(options: {hash: string, password: string}): Promise<boolean> {
    return Bun.password.verify(options.password, options.hash);
  }

}
