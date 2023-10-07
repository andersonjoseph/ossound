export interface RegisterUserDtoProps {
  email: string;
  username: string
  password: string
}

export interface IRegisterUserDto {
  validate(dto: unknown): asserts dto is RegisterUserDtoProps
}
