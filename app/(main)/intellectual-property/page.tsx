import { IntellectualPropertyPage } from "@/components/pages/IntellectualPropertyPage";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";

export default function Page() {
  return <CmsPageRenderer fallback={<IntellectualPropertyPage />} />;
}
