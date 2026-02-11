import { Header } from "@/modules/header";
import { Footer } from "@/modules/footer";
import { GlobalWidgets } from "../components/GlobalWidgets";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <div className="pt-20 md:pt-24 bg-white dark:bg-[#0a0806]">{children}</div>
      <Footer />
      <GlobalWidgets />
    </>
  );
}
