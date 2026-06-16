import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";

export function ProductSkeleton() {
  return (
    // Tạo vòng lặp giả lập hiển thị 8 ô trống màu xám nhấp nháy
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="w-full max-w-sm p-4 space-y-4">
          {/* Giả lập ảnh Thumbnail của variant */}
          <Skeleton className="aspect-video w-full rounded-md" />

          <CardHeader className="p-0 space-y-2">
            {/* Giả lập Tên sản phẩm */}
            <Skeleton className="h-5 w-2/3" />
            {/* Giả lập Mô tả sản phẩm */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardHeader>

          <CardFooter className="p-0 flex justify-between items-center pt-2">
            {/* Giả lập Giá tiền */}
            <Skeleton className="h-5 w-1/3" />
            {/* Giả lập Badge loại hàng */}
            <Skeleton className="h-6 w-16 rounded-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
