import { ReturnsPolicyPage } from "@/components/pages/ReturnsPolicyPage";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";

export default function Page() {
  return <CmsPageRenderer fallback={<ReturnsPolicyPage />} />;
}
