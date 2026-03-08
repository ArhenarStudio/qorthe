import { LegalNoticePage } from "@/components/pages/LegalNoticePage";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";

export default function Page() {
  return <CmsPageRenderer fallback={<LegalNoticePage />} />;
}
