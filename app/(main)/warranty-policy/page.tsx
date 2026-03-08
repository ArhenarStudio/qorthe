import { WarrantyPolicyPage } from "@/components/pages/WarrantyPolicyPage";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";

export default function Page() {
  return <CmsPageRenderer fallback={<WarrantyPolicyPage />} />;
}
