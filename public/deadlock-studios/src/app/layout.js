import "./globals.css";

import ClientLayout from "@/client-layout";

export const metadata = {
  title: "Deadlock Studios",
  description: "MWT BY CODEGRID | MAY 2026",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
