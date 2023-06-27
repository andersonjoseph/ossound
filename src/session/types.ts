import { User } from '../user/tables/users';

export type PasswordReset = {
  passwordResetToken: string;
  user: User;
};
