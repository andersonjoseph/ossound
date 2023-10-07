export interface IUserPasswordService {
  hash(password: string): Promise<string>,
  isValid(options: {hash: string, password: string}): Promise<boolean>;
}
