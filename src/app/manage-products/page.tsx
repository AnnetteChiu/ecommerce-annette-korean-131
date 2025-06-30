import { getProducts } from '@/lib/products';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function ManageProductsPage() {
  const products = getProducts();

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (stock <= 10) {
      return <Badge variant="secondary">Low Stock ({stock})</Badge>;
    }
    return <Badge variant="outline">In Stock ({stock})</Badge>;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-headline font-bold text-center">Manage Products</h1>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableCaption>A list of all products in your store.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Stock Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="rounded-md object-cover aspect-square"
                    data-ai-hint={`${product.category} product`}
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                <TableCell className="text-center">{getStockBadge(product.stock)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
