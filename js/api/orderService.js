// js/api/orderService.js
const API_BASE_URL = 'php/api';

const OrderService = {
    // Create a new order
    async createOrder(orderData) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create order');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    // Update order status
    async updateOrderStatus(email, vin, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders.php`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, vin, status })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update order');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    },

    // Get orders by email
    async getOrdersByEmail(email) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders.php?action=getByEmail&email=${email}`);
            if (!response.ok) throw new Error('Failed to fetch orders');
            const data = await response.json();
            return data.orders;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }
};

export default OrderService;
