import { ShippingPolicyPage } from "@/components/pages/ShippingPolicyPage";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";

export default function Page() {
  return <CmsPageRenderer fallback={<ShippingPolicyPage />} />;
}
