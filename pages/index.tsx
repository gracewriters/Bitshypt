import fs from 'fs';
import path from 'path';
import type { NextPage } from 'next';
import Head from 'next/head';
import Script from 'next/script';

type ScriptData = {
  src: string | null;
  content: string | null;
};

interface HomeProps {
  bodyHtml: string;
  scripts: ScriptData[];
}

const Home: NextPage<HomeProps> = ({ bodyHtml, scripts }) => {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>BitShypt — Decentralized Drone Delivery on the Blockchain</title>
        <meta
          name="description"
          content="The world's first decentralized drone delivery platform. Blockchain Proof-of-Delivery, real-time VLOS enforcement, and cryptographic escrow."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      {scripts.map((script, idx) =>
        script.src ? (
          <Script key={idx} src={script.src} strategy="afterInteractive" />
        ) : (
          <Script key={idx} id={`inline-script-${idx}`} strategy="afterInteractive">
            {script.content}
          </Script>
        )
      )}
    </>
  );
};

export default Home;

export async function getStaticProps() {
  const htmlPath = path.join(process.cwd(), 'index.html');
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let bodyHtml = bodyMatch ? bodyMatch[1] : rawHtml;
  const scripts: ScriptData[] = [];

  bodyHtml = bodyHtml.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (_, attrs, content) => {
    const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
    scripts.push({
      src: srcMatch ? srcMatch[1] : null,
      content: srcMatch ? null : content,
    });
    return '';
  });

  return {
    props: {
      bodyHtml,
      scripts,
    },
  };
}
