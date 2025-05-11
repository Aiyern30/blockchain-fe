/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import {
  ExternalLink,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/";
import { Card, CardContent } from "@/components/ui/";
import { truncateAddress } from "@/utils/function";
import type { ProcessedTransaction } from "@/utils/etherscan";

interface TransactionListProps {
  transactions: ProcessedTransaction[];
  isLoading: boolean;
}

export function TransactionList({
  transactions,
  isLoading,
}: TransactionListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="mt-6 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">
            Loading transactions...
          </p>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="mt-6 text-center">
        <p className="text-lg font-medium">No transactions found</p>
        <p className="text-sm text-muted-foreground mt-2">
          This wallet doesn't have any transactions yet or they couldn't be
          retrieved.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {currentTransactions.map((tx, index) => (
        <Card
          key={`${tx.hash}-${tx.type}-${index}`}
          className={`border ${
            tx.isError ? "border-red-300 bg-red-50 dark:bg-red-950/20" : ""
          }`}
        >
          <CardContent className="p-4 space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    tx.type.includes("Received") ||
                    tx.type.includes("NFT Received")
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : tx.type.includes("Sent") || tx.type.includes("NFT Sent")
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : tx.type.includes("Contract")
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  }`}
                >
                  {tx.type}
                </span>

                {tx.isError && (
                  <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                    <AlertCircle className="h-3 w-3" />
                    Failed
                  </span>
                )}

                {tx.nftName !== "Unknown" && (
                  <span className="font-medium text-sm">{tx.nftName}</span>
                )}

                {tx.collection !== "Unknown" && (
                  <span className="text-sm text-muted-foreground">
                    {tx.collection}
                  </span>
                )}
              </div>

              <div className="text-right space-y-1">
                {tx.price !== "0" && (
                  <p className="font-medium text-sm">
                    {tx.price} {tx.currency}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(tx.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">From: </span>
                  {truncateAddress(tx.from)}
                </p>
                <p>
                  <span className="text-muted-foreground">To: </span>
                  {truncateAddress(tx.to)}
                </p>
              </div>

              <a
                href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                View on Etherscan <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
          <div className="text-sm text-muted-foreground">
            Showing {indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, transactions.length)} of{" "}
            {transactions.length} transactions
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
