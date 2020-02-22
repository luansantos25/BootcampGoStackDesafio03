import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import RecipientController from './app/controllers/RecipientController';
import DelivererController from './app/controllers/DelivererController';
import FileController from './app/controllers/FileController';
import OrderController from './app/controllers/OrderController';
import DelivererOrderController from './app/controllers/DelivererOrderController';
import SignatureController from './app/controllers/SignatureController';

import authMiddlewares from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);
routes.post('/users', UserController.store);

routes.get('/deliverer/:id/deliveries', DelivererOrderController.index);
routes.put(
  '/deliverer/:id/deliveries/:order_id',
  DelivererOrderController.update
);

routes.post('/signature', upload.single('file'), SignatureController.store);

routes.use(authMiddlewares);

routes.put('/users', UserController.update);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

routes.get('/couriers', DelivererController.index);
routes.post('/couriers', DelivererController.store);
routes.put('/couriers/:id', DelivererController.update);
routes.delete('/couriers/:id', DelivererController.delete);

routes.get('/orders', OrderController.index);
routes.post('/orders', OrderController.store);
routes.put('/orders/:id', OrderController.update);
routes.delete('/orders/:id', OrderController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
