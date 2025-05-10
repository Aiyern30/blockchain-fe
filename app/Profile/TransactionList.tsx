import { ExternalLink } from "lucide-react";
import { truncateAddress } from "@/utils/function";

interface Transaction {
  id: string;
  type: string;
  nftName: string;
  collection: string;
  price: string;
  currency: string;
  from: string;
  to: string;
  timestamp: string;
  hash: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="mt-6 space-y-4">
      {transactions.map((tx) => (
        <div key={tx.id} className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  tx.type === "Purchase"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : tx.type === "Sale"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                }`}
              >
                {tx.type}
              </span>
              <h3 className="font-medium">{tx.nftName}</h3>
              <span className="text-sm text-muted-foreground">
                {tx.collection}
              </span>
            </div>
            <div className="text-right">
              <p className="font-medium">
                {tx.price} {tx.currency}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(tx.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm">
                <span className="text-muted-foreground">From: </span>
                {truncateAddress(tx.from)}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">To: </span>
                {truncateAddress(tx.to)}
              </p>
            </div>
            <a
              href={`https://etherscan.io/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:underline sm:mt-0"
            >
              View on Etherscan
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
