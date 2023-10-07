export interface IUseCase<Input, Response> {
  execute(input: Input): Response
}
