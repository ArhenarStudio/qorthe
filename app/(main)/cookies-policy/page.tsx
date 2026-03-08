import { CookiesPolicyPage } from "@/components/pages/CookiesPolicyPage";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";

export default function Page() {
  return <CmsPageRenderer fallback={<CookiesPolicyPage />} />;
}
