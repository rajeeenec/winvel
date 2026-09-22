export async function seed(knex) {
  // Clear existing order statuses
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('order_statuses').truncate();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  // Insert default order status records
  await knex('order_statuses').insert([
    { id: 1, code: 'ORDER_PLACED', name: 'Order Placed', customer_label_msg: 'Your order has been placed successfully.', show_to_customer: true, send_email: true, badge_color: 'blue', sort_order: 1, status: true },
    { id: 2, code: 'PAYMENT_STATUS', name: 'Payment Status', customer_label_msg: 'Payment status updated for your order.', show_to_customer: true, send_email: false, badge_color: 'amber', sort_order: 2, status: true },
    { id: 3, code: 'CONFIRMED', name: 'Confirmed', customer_label_msg: 'Your order has been confirmed by the seller.', show_to_customer: true, send_email: true, badge_color: 'indigo', sort_order: 3, status: true },
    { id: 4, code: 'PACKING_IN_PROGRESS', name: 'Packing in Progress', customer_label_msg: 'Your order items are being packed with care.', show_to_customer: true, send_email: false, badge_color: 'purple', sort_order: 4, status: true },
    { id: 5, code: 'READY_FOR_PICKUP', name: 'Ready for Pickup', customer_label_msg: 'Your package is ready for courier pickup.', show_to_customer: true, send_email: false, badge_color: 'teal', sort_order: 5, status: true },
    { id: 6, code: 'OUT_FOR_DELIVERY', name: 'Out for Delivery', customer_label_msg: 'Your package is out for delivery today.', show_to_customer: true, send_email: true, badge_color: 'amber', sort_order: 6, status: true },
    { id: 7, code: 'DELIVERED', name: 'Delivered', customer_label_msg: 'Your order has been delivered successfully.', show_to_customer: true, send_email: true, badge_color: 'emerald', sort_order: 7, status: true },
    { id: 8, code: 'COMPLETED', name: 'Completed', customer_label_msg: 'Order completed. Thank you for shopping with us!', show_to_customer: true, send_email: false, badge_color: 'emerald', sort_order: 8, status: true },
    { id: 9, code: 'CANCELED', name: 'Canceled', customer_label_msg: 'Your order has been canceled.', show_to_customer: true, send_email: true, badge_color: 'rose', sort_order: 9, status: true },
    { id: 10, code: 'RETURN_PLACED', name: 'Return Placed', customer_label_msg: 'Return request has been initiated.', show_to_customer: true, send_email: true, badge_color: 'orange', sort_order: 10, status: true }
  ]);

  console.log('Order Statuses seed data inserted successfully!');
}
