import {IUseCase} from "@common/interfaces/use-case.interface";
import {SerializedUserProps, User} from "@user/entities/user.entity";
import {IRegisterUserDto, RegisterUserDtoProps} from "./interfaces/register-user-dto-validator.interface";
import {IController} from "../../../../common/interfaces/controller.interface";
import {IUserSerializerService} from "../../services/interfaces/user-serializer.service.interface";

export class RegisterUserController implements IController<Promise<SerializedUserProps>> {
  private readonly dto: IRegisterUserDto
  private readonly userSerializerService: IUserSerializerService
  private readonly registerUserUseCase: IUseCase<RegisterUserDtoProps, Promise<User>>

  constructor(
    dependencies: {
      dto: IRegisterUserDto,
      registerUserUseCase: IUseCase<RegisterUserDtoProps, Promise<User>>
      userSerializerService: IUserSerializerService,
    }
  ) {
    this.dto = dependencies.dto;
    this.registerUserUseCase = dependencies.registerUserUseCase;
    this.userSerializerService = dependencies.userSerializerService;
  }

  async handleRequest(input: unknown): Promise<SerializedUserProps> {
    this.dto.validate(input);

    const registeredUser = await this.registerUserUseCase.execute(input);

    return this.userSerializerService.serialize(registeredUser);
  }

}
