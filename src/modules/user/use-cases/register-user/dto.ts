import {OssoundValidationError} from "../../../../common/errors";
import {IRegisterUserDto, RegisterUserDtoProps} from "./interfaces/register-user-dto-validator.interface";
import FastestValidator, {SyncCheckFunction} from 'fastest-validator'

export class RegisterUserDto implements IRegisterUserDto {
  private readonly validator: SyncCheckFunction

  constructor() {
    const fastestValidator = new FastestValidator();

    this.validator = fastestValidator.compile<RegisterUserDtoProps>({
      email: {type: 'email', lowercase: true},
      username: {type: 'string', min: 3, max: 32, trim: true, lowercase: true},
      password: {type: 'string', min: 6},
      $$strict: 'remove'
    }) as SyncCheckFunction

  }

  validate(dto: unknown): asserts dto is RegisterUserDtoProps {
    const result = this.validator(dto);

    if(Array.isArray(result)) {
      throw new OssoundValidationError('validation error', result.map((err) => err.message as string))
    }
  }

}
