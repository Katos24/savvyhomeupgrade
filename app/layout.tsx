import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import UnhandledRejectionLogger from "@/components/UnhandledRejectionLogger";
import QueryProvider from "@/app/QueryProvider";


export const metadata: Metadata = {
  title: {
    default: "Lead2Project | Quotes, Deposits & Invoices for Contractors",
    template: "%s | Lead2Project",
  },
  description:
    "The easiest way for contractors to get paid for every job. A booking link for requests, quotes that collect the deposit up front, scheduling, and a final invoice for the balance — all on one card per job. Free plan available.",
  keywords: [
    "contractor software",
    "contractor invoicing",
    "deposit invoices for contractors",
    "contractor quotes and estimates",
    "job scheduling for contractors",
    "contractor booking link",
    "Jobber alternative",
    "field service software",
    "contractor CRM",
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
    title: "Lead2Project | The easiest way to get paid for every job",
    description:
      "Requests come in through your booking link. Quotes collect the deposit up front, and the final invoice collects the balance. One card per job, from request to paid.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Lead2Project — quotes, deposits and invoices for contractors" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lead2Project | The easiest way to get paid for every job",
    description:
      "Quotes that collect the deposit up front, scheduling, and a final invoice for the balance. One card per job. Built for contractors.",
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