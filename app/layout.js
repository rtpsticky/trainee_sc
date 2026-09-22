import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-prompt',
  display: 'swap',
});

export const metadata = {
  title: "ฝึกประสบการณ์วิชาชีพ สาขาวิชาสาธารณสุขศาสตร์",
  description: "ระบบฝึกประสบการณ์วิชาชีพ สาขาวิชาสาธารณสุขศาสตร์ มหาวิทยาลัยราชภัฏพิบูลสงคราม",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body
        className={`${prompt.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
