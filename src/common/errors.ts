export class OssoundValidationError extends Error {
  constructor(mainErrorMessage: string, readonly messages: string[]) {
    super(mainErrorMessage);
  }
}

export class OssoundConflictError extends Error {
  constructor(mainErrorMessage: string) {
    super(mainErrorMessage);
  }
}

