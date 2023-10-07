import {userRoutes} from '../modules/user/routes';
import server from './server';

server.register(userRoutes);

await server.listen({port: 3000, host: '0.0.0.0'})
