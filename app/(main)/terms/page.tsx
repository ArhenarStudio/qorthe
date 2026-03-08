import { TermsPage } from "@/components/pages/TermsPage";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";

export default function Page() {
  return <CmsPageRenderer fallback={<TermsPage />} />;
}
