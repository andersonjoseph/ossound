import {FastifyInstance} from "fastify";
import {registerUserRoute} from "./create-user.route";

export function userRoutes(fastify: FastifyInstance) {
  fastify.register(registerUserRoute);
}
