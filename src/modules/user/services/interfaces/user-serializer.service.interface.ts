import {SerializedUserProps, User} from "../../entities/user.entity";

export interface IUserSerializerService {
  serialize(user: User): SerializedUserProps
}
