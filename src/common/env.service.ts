export class EnvService {
  constructor() {}

  static getOrThrow(options: {key: string, isNumber: true }): number
  static getOrThrow(options: {key: string, isNumber?: false }): string
  static getOrThrow(options: {key: string, isNumber?: boolean}): string | number {
    const envVariable = process.env[options.key]

    if(!envVariable) {
      throw new Error(`Environment variable ${options.key} not found`);
    }

    if(options.isNumber && isNaN(Number(envVariable))) {
      throw new Error(`Environment variable ${envVariable} not found`);
    }

    return options.isNumber ? Number(envVariable) : envVariable;
  }
}
