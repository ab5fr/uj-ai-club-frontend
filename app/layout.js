import { Noto_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "AI Club at University of Jeddah",
  description: "Welcome to the AI Club at University of Jeddah!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${notoSans.className} antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
