import Sequelize, { Op } from 'sequelize';
import * as Yup from 'yup';
import { parseISO, startOfDay, endOfDay } from 'date-fns';
import Order from '../models/Order';

class DelivererOrderController {
  async index(req, res) {
    // defining operation based on the query parameter 'end'
    const operation = req.query.end ? 'not' : 'is';

    // id query param 'end' is set, end_date must be valid
    const deliverer_orders = await Order.findAll({
      where: [
        {
          deliverer_id: req.params.id,
          canceled_at: null,
          end_date: { [Op[operation]]: null },
        },
      ],
    });

    return res.status(400).json(deliverer_orders);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number().when('end_date', (end_date, field) =>
        end_date ? field.required() : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation error' });
    }

    // search order
    const order = await Order.findOne({
      where: {
        id: req.params.order_id,
        deliverer_id: req.params.id,
        canceled_at: null,
      },
    });

    // check if order exists
    if (!order) {
      return res.status(400).json({ err: 'Order not found' });
    }

    const today = new Date();

    const ordersOnDay = await Order.count({
      where: {
        start_date: { [Op.between]: [startOfDay(today), endOfDay(today)] },
        deliverer_id: order.deliverer_id,
      },
    });

    if (ordersOnDay > 3) {
      return res
        .status(400)
        .json({ error: 'You reached the limit of the day' });
    }

    console.log('Orders on day', ordersOnDay);

    // check if the order has already been delivered
    if (order.end_date) {
      return res.status(400).json('This order has already been delivered');
    }

    const { end_date, signature_id } = req.body;

    // update end_date and signature_if if both exists
    if (end_date && signature_id) {
      // check if the order has already been started
      if (!order.start_date) {
        return res
          .status(400)
          .json('You canot finalize an order that has not started');
      }

      order.end_date = parseISO(end_date);
      order.signature_id = signature_id;
    } else {
      // check if the order has already been delivered
      if (order.start_date) {
        return res.status(400).json('This order has already been started');
      }

      // setting start date
      order.start_date = new Date();
    }

    // await order.save();

    return res.json(order);
  }
}

export default new DelivererOrderController();
