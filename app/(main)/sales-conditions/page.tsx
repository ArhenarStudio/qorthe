import { SalesConditionsPage } from "@/components/pages/SalesConditionsPage";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";

export default function Page() {
  return <CmsPageRenderer fallback={<SalesConditionsPage />} />;
}
