import { DisputeResolutionPage } from "@/components/pages/DisputeResolutionPage";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";

export default function Page() {
  return <CmsPageRenderer fallback={<DisputeResolutionPage />} />;
}
