import Link from "next/link";

interface ProductBreadcrumbProps {
  category: string;
  categoryHref?: string;
  productName: string;
}

export function ProductBreadcrumb({
  category,
  categoryHref = "/products",
  productName,
}: ProductBreadcrumbProps) {
  return (
    <nav className="mb-6 text-sm">
      <ol className="flex items-center space-x-2 text-taupe-600">
        <li>
          <Link href="/" className="hover:text-walnut-500">
            Inicio
          </Link>
        </li>
        <li>/</li>
        <li>
          <Link href={categoryHref} className="hover:text-walnut-500">
            {category}
          </Link>
        </li>
        <li>/</li>
        <li className="text-walnut-500">{productName}</li>
      </ol>
    </nav>
  );
}
