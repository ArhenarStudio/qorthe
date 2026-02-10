export interface ComparisonProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  materials?: string[];
  dimensions?: {
    width: string;
    height: string;
    depth: string;
  };
  features?: string[];
  craftTime?: string;
}
