import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import UnhandledRejectionLogger from "@/components/UnhandledRejectionLogger";
import QueryProvider from "@/app/QueryProvider";


export const metadata: Metadata = {
  title: {
    default: "Lead2Project | Stop losing leads in your text threads.",
    template: "%s | Lead2Project",
  },
  description:
    "Stop losing leads in your text threads. Blast your link, get better leads with photos, and run your jobs from your phone. Built for the guys in the field.",
 keywords: [
  "contractor lead management",
  "QR code for plumbers",
  "landscaping job tracking",
  "hvac business dashboard",
  "service business outbox",
  "construction quote app",
  "job management for trades",
  "small business booking link",
  "contractor CRM",
  "field service software",
  "lead tracking for contractors"
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
    title: "Lead2Project | Stop losing leads in your text threads.",
    description:
      "One link to capture leads. One link to run the job. No more digging through texts — quote, schedule, and track jobs right from your phone.",
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
           <body className="antialiased">
                    <UnhandledRejectionLogger />
        <QueryProvider>{children}</QueryProvider>
      <Script
                   src="https://www.googletagmanager.com/gtag/js?id=G-4TG9X39EQ5"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
                    {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4TG9X39EQ5');
          `}
        </Script>
        <Script id="meta-pixel" strategy="lazyOnload">
                    {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1029001909797956');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1029001909797956&ev=PageView&noscript=1" alt="" />
        </noscript>
      </body>
    </html>
  );
}