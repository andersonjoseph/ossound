import {FastifyInstance} from "fastify";
import {RegisterUser} from "../use-cases/register-user/use-case";
import {UserPasswordService} from "../services/user-password.service";
import {UserRepository} from "../repositories/user.repository";
import {RegisterUserController} from "../use-cases/register-user/controller";
import {RegisterUserDto} from "../use-cases/register-user/dto";
import {OssoundConflictError, OssoundValidationError} from "../../../common/errors";
import {SerializedUserProps} from "../entities/user.entity";
import {UserSerializerService} from "../services/user-serializer.service";

export function registerUserRoute(fastify: FastifyInstance) {
  const registerUserUseCase = new RegisterUser({
    passwordService: new UserPasswordService(),
    userRepository: new UserRepository(),
  });

  const registerUserController = new RegisterUserController({
    dto: new RegisterUserDto(),
    registerUserUseCase: registerUserUseCase,
    userSerializerService: new UserSerializerService()
  });

  fastify.post('session', async (request, reply) => {
    let registeredUser: SerializedUserProps;

    try {
      registeredUser = await registerUserController.handleRequest(request.body);
    } catch(err) {
      if(err instanceof OssoundValidationError) {
        return reply.status(400).send({
          message: 'Bad Request',
          errors: err.messages
        });
      }
      else if(err instanceof OssoundConflictError) {
        return reply.status(409).send({
          message: 'Conflict',
          errors: err.message
        });
      }
      else {
        return reply.status(500).send({
          message: 'Internal Server Error',
        });
      }
    }

    return reply.status(201).send({
      message: 'Created',
      data: registeredUser
    })

  })
}
