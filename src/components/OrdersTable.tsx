interface Order {
  id: string;
  customer: string;
  status: "Completed" | "Pending" | "Cancelled";
  total: string;
}

const OrdersTable: React.FC = () => {
  const orders: Order[] = [
    { id: "#10234", customer: "John Doe", status: "Completed", total: "$320.00" },
    { id: "#10235", customer: "Maria Silva", status: "Pending", total: "$150.00" },
    { id: "#10236", customer: "Lucas Pereira", status: "Cancelled", total: "$89.90" },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>

      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-2">Order #</th>
            <th className="text-left px-4 py-2">Customer</th>
            <th className="text-left px-4 py-2">Status</th>
            <th className="text-left px-4 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t">
              <td className="px-4 py-3">{o.id}</td>
              <td className="px-4 py-3">{o.customer}</td>
              <td className="px-4 py-3">{o.status}</td>
              <td className="px-4 py-3">{o.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
