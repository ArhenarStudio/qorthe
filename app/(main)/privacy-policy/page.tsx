import { PrivacyPolicyPage } from "@/components/pages/PrivacyPolicyPage";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";

export default function Page() {
  return <CmsPageRenderer fallback={<PrivacyPolicyPage />} />;
}
