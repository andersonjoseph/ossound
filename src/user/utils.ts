import { SerializedUser, User } from './tables/users';

export function serializeUser(user: User): SerializedUser {
  const serializedUser: SerializedUser = {
    ...user,
    id: String(user.id),
  };

  delete serializedUser.password;
  delete serializedUser.passwordResetToken;

  return serializedUser;
}
