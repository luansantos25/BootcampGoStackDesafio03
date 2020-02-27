import * as Yup from 'yup';
import Deliverer from '../models/Deliverer';

class DelivererController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliverer = await Deliverer.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      where: { removed_at: null },
    });

    res.json(deliverer);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation error' });
    }

    const delivererExists = await Deliverer.findOne({
      where: { email: req.body.email },
    });

    if (delivererExists) {
      return res.status(400).json({ error: 'Deliverer already exists' });
    }

    const { id, name, email } = await Deliverer.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation error' });
    }

    const deliverer = await Deliverer.findOne({
      where: [{ id: req.params.id }, { removed_at: null }],
    });

    if (!deliverer) {
      return res.status(400).json({ error: 'Deliverer not found' });
    }

    const { email } = req.body;

    if (email && deliverer.email !== email) {
      const delivererExists = await Deliverer.findOne({
        where: { email },
      });

      if (delivererExists) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    const { id, name } = await deliverer.update(req.body);

    return res.json({
      id,
      name,
      email: deliverer.email,
    });
  }

  async delete(req, res) {
    const deliverer = await Deliverer.findByPk(req.params.id);

    if (!deliverer) {
      return res.status(400).json({ error: 'Deliverer not found' });
    }

    deliverer.removed_at = new Date();
    await deliverer.save();

    return res.json();
  }
}

export default new DelivererController();
