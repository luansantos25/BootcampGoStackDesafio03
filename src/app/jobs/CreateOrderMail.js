import Mail from '../../lib/Mail';

class CreateOrderMail {
  get key() {
    return 'CreateOrderMail';
  }

  // execution of job
  async handle({ data }) {
    const { deliverer, recipient, order } = data;

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
  }
}

export default new CreateOrderMail();
