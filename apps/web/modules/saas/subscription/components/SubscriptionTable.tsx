import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/components/table";
import { Button } from "@ui/components/button";

type Subscription = {
  id: string;
  name: string;
  price: string;
  status: "active" | "canceled" | "expired";
  nextBillingDate: string;
};

export function SubscriptionTable() {
  const subscriptions: Subscription[] = [
    {
      id: "1",
      name: "高级套餐",
      price: "$9.99/月",
      status: "active",
      nextBillingDate: "2023-12-01"
    },
    {
      id: "2",
      name: "基础套餐", 
      price: "$4.99/月",
      status: "active",
      nextBillingDate: "2023-12-01"
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">订阅管理</h2>
        <Button>新建订阅</Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>价格</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>下次账单日期</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell>{sub.name}</TableCell>
              <TableCell>{sub.price}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded text-xs ${
                  sub.status === "active" ? "bg-green-100 text-green-800" :
                  sub.status === "canceled" ? "bg-red-100 text-red-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {sub.status === "active" ? "活跃" : 
                   sub.status === "canceled" ? "已取消" : "已过期"}
                </span>
              </TableCell>
              <TableCell>{sub.nextBillingDate}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" className="mr-2">编辑</Button>
                <Button variant="ghost" size="sm">取消</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}