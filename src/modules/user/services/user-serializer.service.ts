import {User, SerializedUserProps} from "../entities/user.entity";
import {IUserSerializerService} from "./interfaces/user-serializer.service.interface";

export class UserSerializerService implements IUserSerializerService {

  serialize(user: User): SerializedUserProps {
    return {
      id: String(user.id),
      username: user.username,
      email: user.email
    }
  }

}
