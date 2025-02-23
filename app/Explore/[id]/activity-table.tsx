import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

// This would normally come from your API/Database
const activities = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  event: "Sale",
  item: `Bored Ape #${i + 1}`,
  price: (Math.random() * 100).toFixed(2),
  from: "0x1234...5678",
  to: "0x8765...4321",
  time: "2 hours ago",
}));

export function ActivityTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((activity) => (
          <TableRow key={activity.id}>
            <TableCell>{activity.event}</TableCell>
            <TableCell>{activity.item}</TableCell>
            <TableCell>{activity.price} ETH</TableCell>
            <TableCell className="font-mono">{activity.from}</TableCell>
            <TableCell className="font-mono">{activity.to}</TableCell>
            <TableCell>{activity.time}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
