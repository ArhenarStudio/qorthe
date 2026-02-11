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
      {children}
      <Footer />
      <GlobalWidgets />
    </>
  );
}
