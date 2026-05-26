import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans, Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import UnhandledRejectionLogger from "@/components/UnhandledRejectionLogger";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], weight: ["400", "500", "600"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], weight: ["700"], style: ["normal", "italic"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: {
    default: "Lead2Project | Blast your link. Get better leads.",
    template: "%s | Lead2Project",
  },
  description:
    "Stop losing leads in your text threads. Blast your link, get better leads with photos, and manage your empire from the couch. Built for the guys in the field.",
  keywords: [
    "contractor lead management",
    "QR code for plumbers",
    "landscaping job tracking",
    "hvac business dashboard",
    "service business outbox",
    "Long Island contractor software",
    "construction quote app",
    "job management for trades",
    "small business booking link",
    "contractor CRM",
    "field service software"
  ],
  authors: [{ name: "Lead2Project" }],
  creator: "Lead2Project",
  publisher: "Lead2Project",
  metadataBase: new URL("https://lead2project.com"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lead2project.com",
    siteName: "Lead2Project",
    title: "Lead2Project | Manage your empire from the couch.",
    description:
      "Two links. One to capture. One to run it all. No more text thread madness. Quote, schedule, and track your jobs right from your phone.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Lead2Project Dashboard Preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lead2Project | Field Command Center",
    description:
      "Blast your link. Get better leads. The command center for your field operation.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${fraunces.variable} ${inter.variable} antialiased`}>
        <UnhandledRejectionLogger />
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4TG9X39EQ5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4TG9X39EQ5');
          `}
        </Script>
      </body>
    </html>
  );
}