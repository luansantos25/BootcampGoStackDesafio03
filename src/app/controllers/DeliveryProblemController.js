import * as Yup from 'yup';
import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';
import Deliverer from '../models/Deliverer';
import Recipient from '../models/Recipient';
import Queue from '../../lib/Queue';
import CancelOrderByProblemMail from '../jobs/CancelOrderByProblemMail';

class DeliveryProblemController {
  async index(req, res) {
    const deliveryProblems = await DeliveryProblem.findAll({
      attributes: ['id', 'description'],
      include: [
        {
          model: Order,
          as: 'delivery',
          attributes: ['id', 'product'],
          include: [
            {
              model: Deliverer,
              as: 'deliverer',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
    });

    return res.json(deliveryProblems);
  }

  async show(req, res) {
    const deliveryProblems = await DeliveryProblem.findAll({
      attributes: ['id', 'description'],
      include: [
        {
          model: Order,
          as: 'delivery',
          attributes: ['id', 'product'],
          include: [
            {
              model: Deliverer,
              as: 'deliverer',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
      where: { delivery_id: req.params.id },
    });

    return res.json(deliveryProblems);
  }

  async store(req, res) {
    // adding delivery Id on request body
    req.body.delivery_id = req.params.id;

    const schema = Yup.object().shape({
      delivery_id: Yup.number().required(),
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation error' });
    }

    const delivery = await Order.findByPk(req.params.id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    const deliveryProblem = await DeliveryProblem.create(req.body);

    return res.json(deliveryProblem);
  }

  async delete(req, res) {
    const finalPath = req.path.split('/').pop();

    const deliveryProblem = await DeliveryProblem.findOne({
      where: { id: req.params.id },
      attributes: ['description', 'delivery_id'],
      include: [
        {
          model: Order,
          as: 'delivery',
          attributes: ['product'],
          include: [
            {
              model: Recipient,
              as: 'recipient',
              attributes: ['name', 'street', 'number', 'city', 'state'],
            },
            {
              model: Deliverer,
              as: 'deliverer',
              attributes: ['name', 'email'],
            },
          ],
        },
      ],
    });

    // return res.json(deliveryProblem);

    if (!deliveryProblem) {
      return res.status(400).json({ error: 'Delivery problem not found' });
    }

    // checking if delete process is for deliveryProblem entity
    if (finalPath !== 'cancel-delivery') {
      await deliveryProblem.destroy();
    }

    // cancelling order by problemId
    const order = await Order.findByPk(deliveryProblem.delivery_id);

    if (!order.start_date) {
      return res
        .status(400)
        .json({ error: 'This order has not been collected' });
    }

    if (order.canceled_at) {
      return res
        .status(400)
        .json({ error: 'This order has already been canceled' });
    }

    if (!order) {
      return res.status(400).json({ error: 'Order not found' });
    }

    order.canceled_at = new Date();

    await order.save();

    // add email in queue
    await Queue.add(CancelOrderByProblemMail.key, {
      problem: deliveryProblem.description,
      deliverer: deliveryProblem.delivery.deliverer,
      recipient: deliveryProblem.delivery.recipient,
      order,
    });

    return res.json(order);
  }
}

export default new DeliveryProblemController();
