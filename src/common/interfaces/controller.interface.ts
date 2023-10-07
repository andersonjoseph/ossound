
export interface IController<Response> {
  handleRequest(input: unknown): Response
}
