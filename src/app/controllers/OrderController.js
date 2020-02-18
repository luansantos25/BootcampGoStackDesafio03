import * as Yup from 'yup';
import Order from '../models/Order';

class OrderController {
  async index(req, res) {
    const orders = await Order.findAll();
    return res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliverer_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation error' });
    }

    await Order.create(req.body);

    return res.json();
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string(),
      recipient_id: Yup.number(),
      deliverer_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation error' });
    }

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(400).json({ error: 'Order not found' });
    }

    const {
      id,
      product,
      canceled_at,
      start_date,
      end_date,
      recipient_id,
      deliverer_id,
    } = await order.update(req.body);

    return res.json({
      id,
      product,
      canceled_at,
      start_date,
      end_date,
      recipient_id,
      deliverer_id,
    });
  }

  async delete(req, res) {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(400).json({ error: 'Order not found' });
    }

    order.canceled_at = new Date();

    await order.save();

    return res.json();
  }
}

export default new OrderController();
