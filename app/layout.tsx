import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], weight: ["400", "500", "600"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], weight: ["700"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: {
    default: "Lead2Project | CRM & Project Management for Small Businesses",
    template: "%s | Lead2Project",
  },
  description:
    "Lead2Project turns contacts into organized projects. Simple CRM and job management software built for contractors, electricians, dog trainers, auto detailers, and small business owners. Track leads, schedule jobs, and manage clients — all in one place.",
  keywords: [
    "contractor CRM",
    "small business project management",
    "job tracking software for contractors",
    "lead management for small business",
    "contractor scheduling software",
    "electrician CRM",
    "auto detailer CRM",
    "dog trainer client management",
    "simple CRM for contractors",
    "project management for small business",
    "contractor job management app",
    "lead to project software",
    "small business client tracker",
    "contractor software Long Island",
    "CRM for service businesses",
    "home service contractor software",
    "job management app",
    "contractor lead tracking",
    "small business scheduling software",
    "affordable CRM for contractors",
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
    title: "Lead2Project | CRM & Project Management for Small Businesses",
    description:
      "Turn leads into organized projects. Simple job and client management for contractors and small business owners. Start your free 14-day trial.",
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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${fraunces.variable} antialiased`}>
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