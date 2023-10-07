import {UserDbResult} from "@user/tables/user.table";
import {RegisterUserDtoProps} from "../../use-cases/register-user/interfaces/register-user-dto-validator.interface";

export interface IUserRepository {
  save: (dto: RegisterUserDtoProps) => Promise<UserDbResult>
}
