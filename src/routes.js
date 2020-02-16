import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import RecipientController from './app/controllers/RecipientController';
import DelivererController from './app/controllers/DelivererController';
import FileController from './app/controllers/FileController';

import authMiddlewares from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);
routes.post('/users', UserController.store);

routes.use(authMiddlewares);

const upload = multer(multerConfig);

routes.put('/users', UserController.update);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

routes.get('/couriers', DelivererController.index);
routes.post('/couriers', DelivererController.store);
routes.put('/couriers/:id', DelivererController.update);
routes.delete('/couriers/:id', DelivererController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
