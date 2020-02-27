import Mail from '../../lib/Mail';

class CancelOrderByProblemMail {
  get key() {
    return 'CancelOrderByProblemMail';
  }

  // execution of job
  async handle({ data }) {
    const { problem, deliverer, recipient, order } = data;

    await Mail.sendMail({
      to: `${deliverer.name} - ${deliverer.email}`,
      subject: 'Encomenda cancelada - Fastfeet',
      template: 'cancelOrderByProblem',
      context: {
        problem,
        deliverer_name: deliverer.name,
        recipient_name: recipient.name,
        recipient_street: recipient.street,
        recipient_number: recipient.number,
        recipient_city: recipient.city,
        recipient_state: recipient.state,
        product_name: order.product,
      },
    });
  }
}

export default new CancelOrderByProblemMail();
