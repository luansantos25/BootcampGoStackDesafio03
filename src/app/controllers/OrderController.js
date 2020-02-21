import * as Yup from 'yup';
import Order from '../models/Order';
import Deliverer from '../models/Deliverer';
import Recipient from '../models/Recipient';
import Mail from '../../lib/Mail';

class OrderController {
  async index(req, res) {
    const orders = await Order.findAll();
    return res.json(orders);
  }

  async store(req, res) {
    // Yup schema for validation
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliverer_id: Yup.number().required(),
    });

    // checking if body params is valid
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation error' });
    }

    const deliverer = await Deliverer.findByPk(req.body.deliverer_id);

    // checking if deliverer exists
    if (!deliverer) {
      return res.status(400).json({ error: 'Deliverer not found' });
    }

    const recipient = await Recipient.findByPk(req.body.recipient_id);

    // checking if recipient exists
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient not found' });
    }

    // creating order
    const order = await Order.create(req.body);

    // send mail
    await Mail.sendMail({
      to: `${deliverer.name} - email@email.com`,
      subject: 'Nova encomenda - Fastfeet',
      template: 'createOrder',
      context: {
        deliverer_name: deliverer.name,
        recipient_name: recipient.name,
        recipient_street: recipient.street,
        recipient_number: recipient.number,
        recipient_city: recipient.city,
        recipient_state: recipient.state,
        product_name: order.product,
      },
    });

    // returning data
    return res.json(order);
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
