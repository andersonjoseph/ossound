import {IUseCase} from "@common/interfaces/use-case.interface";
import {User} from "@user/entities/user.entity";
import {IUserRepository} from "@user/repositories/interfaces/user.repository.interface";
import {IUserPasswordService} from "@user/services/interfaces/user-password.service.interface";
import {RegisterUserDtoProps} from "./interfaces/register-user-dto-validator.interface";

export class RegisterUser implements IUseCase<RegisterUserDtoProps, Promise<User>> {
  private readonly passwordService: IUserPasswordService;
  private readonly userRepository: IUserRepository;

  constructor(
    dependencies: {
      passwordService: IUserPasswordService,
      userRepository: IUserRepository,
    }
  ) {
    this.passwordService = dependencies.passwordService;
    this.userRepository = dependencies.userRepository;
  }

  async execute(registerUserDto: RegisterUserDtoProps): Promise<User> {
    registerUserDto.password = await this.passwordService.hash(registerUserDto.password);

    const savedUser = await this.userRepository.save(registerUserDto)
    const user = new User(savedUser);

    return user;
  }
}
