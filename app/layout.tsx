import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import UnhandledRejectionLogger from "@/components/UnhandledRejectionLogger";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], weight: ["400", "500", "600"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], weight: ["700"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: {
    default: "Lead2Project | Job Management for Home Service Contractors",
    template: "%s | Lead2Project",
  },
  description:
    "Stop losing leads. Get a custom booking link — customers submit requests, everything lands on your dashboard organized and ready to act on. Quote, schedule, and track every job in one place. Built for small and mid-size businesses.",
  keywords: [
      "small business lead management",
    "service business job tracking",
    "booking link for small business",
    "contractor CRM",
    "home service software",
    "plumber job management",
    "electrician lead tracking",
    "cleaning business software",
    "dog groomer client management",
    "landscaping business app",
    "roofing contractor software",
    "painter job tracking",
    "HVAC business management",
    "handyman scheduling app",
    "service business dashboard",
    "quote and schedule software",
    "small business booking form",
    "QR code for service business",
    "job management app",
    "affordable CRM for service businesses",
    
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
   title: "Lead2Project | Job Management for Home Service Contractors",
    description:
      "Get a booking link, capture leads with photos, quote and schedule from your phone. Everything in one dashboard. Start your free 14-day trial.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Lead2Project Dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lead2Project | CRM & Project Management for Small Businesses",
    description:
      "Turn leads into organized projects. Simple job and client management for contractors and small business owners.",
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
    <body className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${fraunces.variable} antialiased`}>
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