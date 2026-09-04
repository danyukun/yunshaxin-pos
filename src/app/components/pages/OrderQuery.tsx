import { useState } from 'react';
import { Search, Filter, Eye, Printer } from 'lucide-react';

const mockOrders = [
  {
    id: '202605090001',
    customerName: '张先生',
    customerPhone: '13812345678',
    items: 2,
    totalAmount: 65,
    status: '清洗中',
    date: '2026-05-09 10:30',
  },
  {
    id: '202605090002',
    customerName: '李女士',
    customerPhone: '13912345678',
    items: 3,
    totalAmount: 95,
    status: '待取衣',
    date: '2026-05-09 11:15',
  },
  {
    id: '202605090003',
    customerName: '王先生',
    customerPhone: '13612345678',
    items: 1,
    totalAmount: 50,
    status: '已完成',
    date: '2026-05-09 09:20',
  },
  {
    id: '202605080015',
    customerName: '赵女士',
    customerPhone: '13712345678',
    items: 4,
    totalAmount: 120,
    status: '清洗中',
    date: '2026-05-08 16:45',
  },
];

export default function OrderQuery() {
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.id.includes(searchValue) ||
      order.customerName.includes(searchValue) ||
      order.customerPhone.includes(searchValue);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已完成':
        return 'bg-green-100 text-green-700';
      case '待取衣':
        return 'bg-orange-100 text-orange-700';
      case '清洗中':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">订单查询</h2>
        <p className="text-gray-500 mt-1">查看和管理所有订单</p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="搜索订单号、姓名或手机号..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部状态</option>
              <option value="清洗中">清洗中</option>
              <option value="待取衣">待取衣</option>
              <option value="已完成">已完成</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">订单号</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">客户信息</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">件数</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">金额</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">状态</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">时间</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <p className="font-medium text-sm">{order.id}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-sm">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{order.customerPhone}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm">{order.items} 件</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-sm">¥{order.totalAmount}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">{order.date}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="查看详情">
                        <Eye className="size-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="打印小票">
                        <Printer className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">没有找到符合条件的订单</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">共 {filteredOrders.length} 条记录</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              上一页
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
