import fs from 'fs';
import path from 'path';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import parse, { domToReact } from 'html-react-parser';

type StatsResponse = {
  packages_delivered: number;
  countries_active: number;
  vlos_compliance: number;
  avg_proof_of_delivery: number;
};

type TelemetryResponse = {
  alt: number;
  speed: number;
  battery: number;
  vlos: string;
  hash: string;
};

type BlockResponse = {
  block_number: number;
  block_hash: string;
  pod_hash: string;
  status: string;
};

type SamplePad = {
  id: number;
  name: string;
  value: string;
};

interface HomeProps {
  bodyHtml: string;
  pageStyles: string;
}

const tickerItems = [
  { label: '$BS', value: '0.0842' },
  { label: 'Max Supply', value: '21,000,000' },
  { label: 'Dividends', value: '100% in BTC', highlight: true },
  { label: 'Fees Paid in', value: 'BTC' },
  { label: 'Block Rewards in', value: '$BS' },
  { label: '🔒 Private Wallets', value: 'Active', highlight: true },
  { label: 'Deliveries Today', value: '1,847', id: 'tkD' },
  { label: 'Active Drones', value: '312' },
  { label: 'Validators Online', value: '94' },
  { label: 'Avg PoD Time', value: '4.2s' },
  { label: 'Consensus', value: 'PPoW', highlight: true },
  { label: 'Honouring', value: 'Satoshi ₿', highlight: true },
  { label: 'Team Tokens', value: 'Time-Locked' },
  { label: 'Vesting', value: '4 Years' },
  { label: 'Attention =', value: 'New Gold', highlight: true },
  { label: 'BitShypt TV', value: 'Coming', highlight: true },
  { label: 'BTC Target', value: '$909K' },
  { label: 'NFAs', value: 'Electricity-Backed', highlight: true },
  { label: 'Uptime', value: '99.97%', highlight: true },
  { label: 'Total Volume', value: '$84.2M' },
  { label: 'Block Height', value: '1,204,817', id: 'tkBl' },
  { label: 'VLOS Compliance', value: '99.98%', highlight: true },
  { label: 'Countries', value: '34' },
  { label: '📸 BTC Snapshot', value: 'Block 1,000,000', highlight: true },
  { label: 'Hold BTC = Get', value: '$BS Airdrop', highlight: true },
];

const proofValues = [
  '0x1d8c4a…f3b2019e4c7a…bc3d0f…2a9e',
  '0x9f3b2a…e4c7a19…0f2a9e…8c4d',
  '0x4c7a19…bc3d0f2a…9e8c4d…1f3b2',
];

const Home: NextPage<HomeProps> = ({ bodyHtml, pageStyles }) => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryResponse | null>(null);
  const [blocks, setBlocks] = useState<BlockResponse[]>([]);
  const [samplePads, setSamplePads] = useState<SamplePad[]>([]);
  const [loading, setLoading] = useState({ stats: true, telemetry: true, blocks: true, sampleData: true });
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tickerState, setTickerState] = useState({ block: 1204817, deliveries: 1847 });
  const [proofHash, setProofHash] = useState(proofValues[0]);
  const [demoTelemetry, setDemoTelemetry] = useState({ alt: 118, speed: 24.3, battery: 78, vlos: 'OK', hash: '0xa4f9…3b21', distance: 412, visibility: 8.2, cvScore: 0.94 });
  const [mintForm, setMintForm] = useState({ sender: '', receiver: '', meta: '', trackId: '' });
  const [mintOutput, setMintOutput] = useState('Ready — enter details and create your first package…');
  const [trackOutput, setTrackOutput] = useState('Create a package or enter an ID to track…');
  const [eggVisible, setEggVisible] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const staticCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const staticAnimRef = useRef<number | null>(null);
  const eggBufferRef = useRef('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        const data: StatsResponse = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading((prev) => ({ ...prev, stats: false }));
      }
    }

    async function fetchTelemetry() {
      try {
        const response = await fetch('/api/telemetry');
        const data: TelemetryResponse = await response.json();
        setTelemetry(data);
      } catch (error) {
        console.error('Failed to load telemetry:', error);
      } finally {
        setLoading((prev) => ({ ...prev, telemetry: false }));
      }
    }

    async function fetchBlocks() {
      try {
        const response = await fetch('/api/blocks');
        const data: BlockResponse[] = await response.json();
        setBlocks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load blocks:', error);
      } finally {
        setLoading((prev) => ({ ...prev, blocks: false }));
      }
    }

    async function fetchSampleData() {
      try {
        const response = await fetch('/api/sample-data');
        const data: SamplePad[] = await response.json();
        setSamplePads(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load sample marketplace data:', error);
      } finally {
        setLoading((prev) => ({ ...prev, sampleData: false }));
      }
    }

    fetchStats();
    fetchTelemetry();
    fetchBlocks();
    fetchSampleData();
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('bsTheme') as 'dark' | 'light' | null;
    const initialTheme = savedTheme === 'light' ? 'light' : 'dark';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('bsTheme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.has-dropdown')) {
        setDropdownOpen(false);
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileNavOpen(false);
        setDropdownOpen(false);
        setEggVisible(false);
      }
      if (event.key.length === 1) {
        eggBufferRef.current = (eggBufferRef.current + event.key).slice(-'satoshi'.length);
        if (eggBufferRef.current === 'satoshi') {
          setEggVisible((prev) => !prev);
        }
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDemoTelemetry((prev) => {
        const alt = Math.max(80, Math.min(150, prev.alt + (Math.random() - 0.48) * 2));
        const speed = Math.max(18, Math.min(32, prev.speed + (Math.random() - 0.5) * 1.5));
        const battery = Math.max(40, prev.battery - Math.random() * 0.05);
        const vlos = battery > 50 ? 'OK' : 'WARN';
        const hashes = ['0xa4f9…3b21', '0xf8c2…9a04', '0xb3e7…71cc', '0x2a9e…8c4d'];
        return {
          alt,
          speed,
          battery,
          vlos,
          hash: hashes[Math.floor(Math.random() * hashes.length)],
          distance: Math.round(380 + Math.random() * 80),
          visibility: Number((7.5 + Math.random() * 2).toFixed(1)),
          cvScore: Number((0.88 + Math.random() * 0.1).toFixed(2)),
        };
      });
    }, 2200);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTickerState((prev) => ({ block: prev.block + 1, deliveries: prev.deliveries + Math.floor(Math.random() * 3) }));
    }, 10000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProofHash((current) => {
        const nextIndex = (proofValues.indexOf(current) + 1) % proofValues.length;
        return proofValues[nextIndex];
      });
    }, 8000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = staticCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawStatic = () => {
      const width = canvas.offsetWidth || 400;
      const height = 200;
      canvas.width = width;
      canvas.height = height;
      const imageData = ctx.createImageData(width, height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const v = Math.floor(Math.random() * 210);
        const flicker = Math.random();
        if (flicker > 0.997) {
          imageData.data[i] = 0;
          imageData.data[i + 1] = 201;
          imageData.data[i + 2] = 172;
          imageData.data[i + 3] = 255;
        } else if (flicker > 0.994) {
          imageData.data[i] = 11;
          imageData.data[i + 1] = 132;
          imageData.data[i + 2] = 255;
          imageData.data[i + 3] = 255;
        } else {
          imageData.data[i] = v;
          imageData.data[i + 1] = v;
          imageData.data[i + 2] = v;
          imageData.data[i + 3] = 255;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      if (Math.random() > 0.93) {
        const lineY = Math.floor(Math.random() * height);
        const lineH = Math.floor(Math.random() * 3) + 1;
        ctx.fillStyle = 'rgba(0,201,172,0.06)';
        ctx.fillRect(0, lineY, width, lineH);
      }
      staticAnimRef.current = window.requestAnimationFrame(drawStatic);
    };

    const timeoutId = window.setTimeout(() => {
      drawStatic();
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
      if (staticAnimRef.current !== null) {
        window.cancelAnimationFrame(staticAnimRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const rvEls = document.querySelectorAll('.rv,.rv2,.rv3,.rv4');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
          }
        });
      },
      { threshold: 0.12 }
    );
    rvEls.forEach((el) => observer.observe(el));
    const statsEl = document.querySelector('.stats');
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.sn[data-t]').forEach((el) => {
              const element = el as HTMLElement;
              const target = parseFloat(element.dataset.t || '0');
              const suffix = element.dataset.sf || '';
              const big = target > 1000;
              const duration = 2000;
              const steps = 60;
              let current = 0;
              const step = target / steps;
              const intervalId = window.setInterval(() => {
                current = Math.min(current + step, target);
                let display;
                if (Number.isInteger(target)) {
                  display = Math.round(current).toLocaleString();
                } else {
                  display = current.toFixed(2);
                }
                element.textContent = `${display}${suffix}`;
                if (current >= target) {
                  window.clearInterval(intervalId);
                }
              }, duration / steps);
            });
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (statsEl) statsObserver.observe(statsEl);
    return () => {
      observer.disconnect();
      statsObserver.disconnect();
    };
  }, []);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const toggleMobileNav = () => setMobileNavOpen((prev) => !prev);
  const closeMobileNav = () => setMobileNavOpen(false);
  const handleOpenLogin = () => window.alert('Login coming soon.');
  const handleEggClick = () => {
    if (Math.random() < 0.125) setEggVisible((prev) => !prev);
  };
  const handleMintNfa = () => {
    const sender = mintForm.sender.trim() || 'Sender Address';
    const receiver = mintForm.receiver.trim() || 'Receiver Address';
    const meta = mintForm.meta.trim() || 'No metadata';
    const nfaId = 'NFA-' + Math.random().toString(16).slice(2, 10).toUpperCase();
    const pod = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setMintForm((prev) => ({ ...prev, trackId: nfaId }));
    setMintOutput(
      `✅ Package NFA Minted!\nNFA ID: ${nfaId}\nPoD Hash: ${pod.slice(0, 24)}...\nSender: ${sender.slice(0, 32)}\nReceiver: ${receiver.slice(0, 32)}\nMetadata: ${meta.slice(0, 32)}\n+5.0 $BS block reward credited`
    );
  };

  const handleTrackShipment = () => {
    const id = mintForm.trackId.trim();
    if (!id) {
      setTrackOutput('Enter a Package ID to track.');
      return;
    }
    const statuses = ['PENDING', 'IN_TRANSIT', 'IN_TRANSIT', 'DELIVERED'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const utcTime = new Date().toLocaleTimeString();
    setTrackOutput(
      `📍 Tracking: ${id}\n● ${status}\nLast ping: ${utcTime}\nAltitude: ${80 + Math.floor(Math.random() * 120)}m · Speed: ${30 + Math.floor(Math.random() * 40)} km/h\nGPS: ${(13.7 + Math.random() * 0.1).toFixed(5)}°N, ${(100.5 + Math.random() * 0.1).toFixed(5)}°E`
    );
  };

  const handleConfirmPoD = () => {
    const id = mintForm.trackId.trim();
    if (!id) {
      setTrackOutput('Enter a Package ID to confirm.');
      return;
    }
    const pod = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setTrackOutput(
      `✅ Proof-of-Delivery Confirmed!\nPackage: ${id}\nStatus: DELIVERED\nZK Proof: ${pod.slice(0, 24)}...\nAnchored: Block #${800000 + Math.floor(Math.random() * 9999)}\n+2.0 $BS PoD reward credited`
    );
  };

  const handleNewsletterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
  };

  const transformNode = (domNode: any) => {
    if (domNode.type !== 'tag') {
      return undefined;
    }

    const attribs = domNode.attribs || {};
    const children = domToReact(domNode.children, { replace: transformNode });
    const id = attribs.id;
    const onclick = attribs.onclick?.trim();
    const href = attribs.href;
    const className = attribs.class;

    if (id === 'mintOut') {
      return (
        <div id="mintOut" className={className} style={{ minHeight: 60, padding: 11, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', lineHeight: 1.9 }}>
          {mintOutput.split('\n').map((line, index) => (
            <span key={index} style={index === 0 ? { color: 'var(--teal)' } : { display: 'block' }}>
              {line}
            </span>
          ))}
        </div>
      );
    }

    if (id === 'trackOut') {
      return (
        <div id="trackOut" className={className} style={{ minHeight: 60, padding: 11, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', lineHeight: 1.9 }}>
          {trackOutput.split('\n').map((line, index) => (
            <span key={index} style={index === 0 ? { color: 'var(--teal)', display: 'block' } : { display: 'block' }}>
              {line}
            </span>
          ))}
        </div>
      );
    }

    if (id === 'demoStaticCanvas') {
      return <canvas id="demoStaticCanvas" ref={staticCanvasRef} className={className} style={{ width: '100%', height: '200px', display: 'block' }} />;
    }

    if (id === 'eggMsg') {
      return (
        <div
          id="eggMsg"
          className={className}
          style={{
            display: eggVisible ? 'flex' : 'none',
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            background: 'rgba(2,10,13,.92)',
            zIndex: 10,
            padding: 16,
            textAlign: 'center',
          }}
        >
          {children}
        </div>
      );
    }

    if (id === 'themeBtn') {
      const ariaLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      return (
        <button id="themeBtn" className={className} aria-label={ariaLabel} title={ariaLabel} onClick={toggleTheme}>
          {children}
        </button>
      );
    }

    if (id === 'burger') {
      return (
        <button id="burger" className={`${className}${mobileNavOpen ? ' open' : ''}`} aria-label="Menu" onClick={toggleMobileNav}>
          {children}
        </button>
      );
    }

    if (id === 'mnav') {
      return (
        <div id="mnav" className={`${className}${mobileNavOpen ? ' open' : ''}`}>
          {children}
        </div>
      );
    }

    if (href?.startsWith('/cdn-cgi/l/email-protection')) {
      return (
        <a href="mailto:contact@bitshypt.com" target="_blank" rel="noopener noreferrer" className={className}>
          {children}
        </a>
      );
    }

    if (onclick === 'openLogin()') {
      return (
        <button className={className} style={domNode.attribs.style ? undefined : undefined} onClick={handleOpenLogin}>
          {children}
        </button>
      );
    }

    if (onclick === 'closeMob()') {
      return (
        <a href={href || '#'} className={className} onClick={(event) => { event.preventDefault(); closeMobileNav(); }}>
          {children}
        </a>
      );
    }

    if (onclick === 'mintNFA()') {
      return (
        <button className={className} onClick={handleMintNfa}>
          {children}
        </button>
      );
    }

    if (onclick === 'trackShipment()' && domNode.name !== 'button') {
      return (
        <button className={className} onClick={handleTrackShipment}>
          {children}
        </button>
      );
    }

    if (onclick === 'trackShipment()') {
      return (
        <button className={className} onClick={handleTrackShipment}>
          {children}
        </button>
      );
    }

    if (onclick === 'confirmPoD()') {
      return (
        <button className={className} onClick={handleConfirmPoD}>
          {children}
        </button>
      );
    }

    if (onclick === 'eggClick()') {
      return (
        <div id={id} className={className} onClick={handleEggClick} style={{ cursor: 'pointer', position: 'relative', background: '#020a0d', border: '1px solid rgba(0,201,172,.18)', borderRadius: 10, overflow: 'hidden', height: 200, marginBottom: 12 }}>
          {children}
        </div>
      );
    }

    if (onclick === "event.preventDefault();alert('APK download coming soon! Join our Discord for early access.')") {
      return (
        <a href="#" className={className} style={domNode.attribs.style ? undefined : undefined} onClick={(event) => { event.preventDefault(); window.alert('APK download coming soon! Join our Discord for early access.'); }}>
          {children}
        </a>
      );
    }

    if (domNode.name === 'form' && className?.includes('newsw')) {
      return (
        <form className={className} onSubmit={handleNewsletterSubmit}>
          {children}
        </form>
      );
    }

    if (domNode.name === 'input' && id === 'newsEmail') {
      return (
        <input
          id="newsEmail"
          className={className}
          type="email"
          placeholder={attribs.placeholder}
          value={newsletterEmail}
          onChange={(event) => setNewsletterEmail(event.target.value)}
        />
      );
    }

    if (domNode.name === 'input' && id === 'dSender') {
      return (
        <input
          id="dSender"
          className={className}
          type={attribs.type || 'text'}
          placeholder={attribs.placeholder}
          value={mintForm.sender}
          onChange={(event) => setMintForm((prev) => ({ ...prev, sender: event.target.value }))}
        />
      );
    }

    if (domNode.name === 'input' && id === 'dReceiver') {
      return (
        <input
          id="dReceiver"
          className={className}
          type={attribs.type || 'text'}
          placeholder={attribs.placeholder}
          value={mintForm.receiver}
          onChange={(event) => setMintForm((prev) => ({ ...prev, receiver: event.target.value }))}
        />
      );
    }

    if (domNode.name === 'input' && id === 'dMeta') {
      return (
        <input
          id="dMeta"
          className={className}
          type={attribs.type || 'text'}
          placeholder={attribs.placeholder}
          value={mintForm.meta}
          onChange={(event) => setMintForm((prev) => ({ ...prev, meta: event.target.value }))}
        />
      );
    }

    if (domNode.name === 'input' && id === 'dTrackId') {
      return (
        <input
          id="dTrackId"
          className={className}
          type={attribs.type || 'text'}
          placeholder={attribs.placeholder}
          value={mintForm.trackId}
          onChange={(event) => setMintForm((prev) => ({ ...prev, trackId: event.target.value }))}
        />
      );
    }

    if (id === 'tkBl') {
      return <b id="tkBl" suppressHydrationWarning>{tickerState.block.toLocaleString()}</b>;
    }

    if (id === 'tkD') {
      return <b id="tkD" suppressHydrationWarning>{tickerState.deliveries.toLocaleString()}</b>;
    }

    if (id === 'hA' || id === 'vA') {
      return <span id={id}>{Math.round(demoTelemetry.alt)}</span>;
    }

    if (id === 'hS') {
      return <span id="hS">{demoTelemetry.speed.toFixed(1)}</span>;
    }

    if (id === 'hB') {
      return <span id="hB">{Math.round(demoTelemetry.battery)}</span>;
    }

    if (id === 'hV') {
      return (
        <div id="hV" style={{ fontSize: 10, color: demoTelemetry.vlos === 'OK' ? 'var(--teal)' : 'var(--blue)' }}>
          {demoTelemetry.vlos}
        </div>
      );
    }

    if (id === 'hH') {
      return <span id="hH">{demoTelemetry.hash}</span>;
    }

    if (id === 'vD') {
      return <span id="vD">{demoTelemetry.distance}</span>;
    }

    if (id === 'vV') {
      return <span id="vV">{demoTelemetry.visibility}</span>;
    }

    if (id === 'vC') {
      return <span id="vC">{demoTelemetry.cvScore}</span>;
    }

    if (id === 'pA') {
      return <div id="pA">{Math.round(demoTelemetry.alt)}m</div>;
    }

    if (id === 'pS') {
      return <div id="pS">{Math.round(demoTelemetry.speed)}m/s</div>;
    }

    if (id === 'pB') {
      return <div id="pB">{Math.round(demoTelemetry.battery)}%</div>;
    }

    if (id === 'zkP') {
      return <div id="zkP">{proofHash}</div>;
    }

    if (id === 'demoCamStatus') {
      return (
        <div id="demoCamStatus" className={className} style={{ position: 'absolute', top: 8, right: 8, fontFamily: 'var(--mono)', fontSize: 9, color: '#4a7a8a', background: 'rgba(2,10,13,.9)', padding: '3px 8px', borderRadius: 4, border: '1px solid rgba(0,201,172,.1)' }}>
          ● OFFLINE
        </div>
      );
    }

    return undefined;
  };

  const parsedBody = useMemo(
    () => parse(bodyHtml, { replace: transformNode }),
    [
      bodyHtml,
      mobileNavOpen,
      dropdownOpen,
      eggVisible,
      newsletterEmail,
      subscribed,
      mintForm,
      mintOutput,
      trackOutput,
      tickerState,
      demoTelemetry,
      proofHash,
      theme,
    ]
  );

  const statusColor = (status: string) => {
    if (status === 'DELIVERED') return '#48bb78';
    if (status === 'ACCEPTED') return '#F5A623';
    return '#0B84FF';
  };

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
        <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      </Head>

      <section className="db-backend-section" style={{ padding: '52px 24px 32px', color: 'var(--text)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: '28px' }}>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, marginBottom: '10px', lineHeight: 1.05 }}>
              Live Supabase-backed dashboard
            </div>
            <p style={{ color: 'var(--text2)', maxWidth: 760, lineHeight: 1.8, fontSize: '0.98rem' }}>
              This preview loads the real Supabase data for stats, telemetry, recent blockchain delivery blocks, and sample marketplace rows.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div className="db-card" style={{ padding: '24px' }}>
              <div className="db-label">Packages Delivered</div>
              <div className="db-value">{loading.stats ? 'Loading…' : stats?.packages_delivered.toLocaleString() ?? '—'}</div>
            </div>
            <div className="db-card" style={{ padding: '24px' }}>
              <div className="db-label">Countries Active</div>
              <div className="db-value">{loading.stats ? 'Loading…' : stats?.countries_active ?? '—'}</div>
            </div>
            <div className="db-card" style={{ padding: '24px' }}>
              <div className="db-label">VLOS Compliance</div>
              <div className="db-value">{loading.stats ? 'Loading…' : stats ? `${stats.vlos_compliance.toFixed(2)}%` : '—'}</div>
            </div>
            <div className="db-card" style={{ padding: '24px' }}>
              <div className="db-label">Avg Proof-of-Delivery</div>
              <div className="db-value">{loading.stats ? 'Loading…' : stats ? `${stats.avg_proof_of_delivery.toFixed(1)}s` : '—'}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <div className="db-card" style={{ padding: '24px' }}>
              <h3>Live Telemetry</h3>
              <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="db-label">Altitude</span>
                  <span>{loading.telemetry ? 'Loading…' : `${telemetry?.alt ?? '—'} m`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="db-label">Speed</span>
                  <span>{loading.telemetry ? 'Loading…' : `${telemetry?.speed.toFixed(1) ?? '—'} m/s`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="db-label">Battery</span>
                  <span>{loading.telemetry ? 'Loading…' : `${telemetry?.battery ?? '—'}%`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="db-label">VLOS Status</span>
                  <span style={{ color: telemetry?.vlos === 'OK' ? 'var(--teal)' : 'var(--blue)' }}>{loading.telemetry ? 'Loading…' : telemetry?.vlos ?? '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="db-label">Last Proof Hash</span>
                  <span style={{ fontFamily: 'var(--mono)' }}>{loading.telemetry ? 'Loading…' : telemetry?.hash ?? '—'}</span>
                </div>
              </div>
            </div>

            <div className="db-card" style={{ padding: '24px' }}>
              <h3>Recent Blockchain Delivery Blocks</h3>
              <div style={{ display: 'grid', gap: '14px', marginTop: '16px' }}>
                {loading.blocks ? (
                  <div>Loading blocks…</div>
                ) : blocks.length ? (
                  blocks.map((block) => (
                    <div key={block.block_number} style={{ padding: '18px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '12px' }}>
                        <div style={{ fontWeight: 700 }}>Block #{block.block_number}</div>
                        <div style={{ color: statusColor(block.status), fontSize: '0.85rem', fontWeight: 700 }}>{block.status.replace('_', ' ')}</div>
                      </div>
                      <div style={{ color: 'var(--text2)', fontSize: '0.92rem', lineHeight: 1.45 }}>
                        <div><strong>Hash:</strong> {block.block_hash}</div>
                        <div><strong>PoD:</strong> {block.pod_hash}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text3)' }}>No blocks available from Supabase.</div>
                )}
              </div>
            </div>
          </div>

          <div className="db-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div>
                <h3>Marketplace sample rows</h3>
                <div style={{ color: 'var(--text3)', fontSize: '0.92rem' }}>Supabase sample table rendered in React.</div>
              </div>
              <div style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>{loading.sampleData ? 'Loading…' : `${samplePads.length} records`}</div>
            </div>
            <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {loading.sampleData ? (
                <div>Loading marketplace rows…</div>
              ) : samplePads.length ? (
                samplePads.map((pad) => (
                  <div key={pad.id} style={{ padding: '18px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>{pad.name}</div>
                    <div style={{ color: 'var(--text2)', fontSize: '0.92rem', marginBottom: '12px' }}>{pad.value || 'Supabase record'}</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--teal)' }}>Row ID: {pad.id}</div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text3)' }}>No marketplace rows found.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div>{parsedBody}</div>
    </>
  );
};

export default Home;

export async function getStaticProps() {
  const htmlPath = path.join(process.cwd(), 'index.html');
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[1] : rawHtml;
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const headHtml = headMatch ? headMatch[1] : '';
  const pageStyles = [...headHtml.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((match) => match[1])
    .join('\n');

  return {
    props: {
      bodyHtml,
      pageStyles,
    },
  };
}
