import {
  TableRow,
  TableCell,
  TableHeader,
  TableHead,
  TableBody,
  Table,
} from "@/components/ui";

export const TableSkeleton = ({
  isMobile,
  shouldSplit,
}: {
  isMobile: boolean;
  shouldSplit: boolean;
}) => {
  const renderSkeletonRows = (count: number) => {
    return Array.from({ length: count }).map((_, index) => (
      <TableRow key={index} className="h-16 animate-pulse">
        <TableCell className="w-[100px] text-center">
          <div className="h-4 w-6 bg-gray-700 rounded" />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-700 rounded-full" />
            <div className="h-4 w-32 bg-gray-700 rounded" />
          </div>
        </TableCell>
        <TableCell>
          <div className="h-4 w-16 bg-gray-700 rounded" />
        </TableCell>
        <TableCell>
          <div className="h-4 w-20 bg-gray-700 rounded" />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="flex items-center justify-center gap-5 mt-5">
      {isMobile || !shouldSplit ? (
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-center">Rank</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead>Floor Price</TableHead>
                <TableHead>Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderSkeletonRows(8)}</TableBody>
          </Table>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-center">Rank</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead>Floor Price</TableHead>
                <TableHead>Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderSkeletonRows(5)}</TableBody>
          </Table>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-center">Rank</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead>Floor Price</TableHead>
                <TableHead>Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderSkeletonRows(5)}</TableBody>
          </Table>
        </>
      )}
    </div>
  );
};
