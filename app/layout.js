import { Sarabun } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-sarabun',
  display: 'swap',
});

export const metadata = {
  title: "ระบบฝึกงาน สาธารณสุขศาสตร์ มรพส.",
  description: "ระบบฝึกงาน สาธารณสุขศาสตร์ มหาวิทยาลัยราชภัฏพิบูลสงคราม",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body
        className={`${sarabun.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
