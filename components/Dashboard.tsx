import React, { useEffect, useRef, useState } from 'react';
import styles from './Dashboard.module.css';

type LogLine = {
  time: string;
  msg: string;
  tone: 'green' | 'white' | 'amber';
};

type StatsResponse = {
  packages_delivered: number;
  countries_active: number;
  vlos_compliance: number;
  avg_proof_of_delivery: number;
};

type BlockResponse = {
  block_number: number;
  block_hash: string;
  zk_proof?: string;
  anchored_at?: string;
  status: string;
};

type TelemetryResponse = {
  alt: number;
  speed: number;
  battery: number;
  vlos: string;
  zk_proof?: string;
};

type SampleRow = {
  id: number;
  name: string;
  value: string;
};

const TABS = ['Dashboard', 'Escrow', 'Miners', 'Marketplace', 'Earn $BS'] as const;
type Tab = (typeof TABS)[number];

function now(): string {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

const INITIAL_LOG: LogLine[] = [
  { time: '19:46:07', msg: 'System Online. BitShypt Protocol v2.2 — SQLite persistence active.', tone: 'green' },
];

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');

  const [packageId, setPackageId] = useState('');
  const [metadata, setMetadata] = useState('');
  const [podPkg, setPodPkg] = useState('');
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');

  const [log, setLog] = useState<LogLine[]>(INITIAL_LOG);
  const consoleRef = useRef<HTMLDivElement | null>(null);

  const appendLog = (msg: string, tone: LogLine['tone'] = 'white') => {
    setLog((prev) => [...prev, { time: now(), msg, tone }]);
    requestAnimationFrame(() => {
      if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    });
  };

  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [blocks, setBlocks] = useState<BlockResponse[] | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryResponse | null>(null);
  const [sampleData, setSampleData] = useState<SampleRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [s, b, t, sd] = await Promise.all([
          fetch('/api/stats').then((r) => r.json()),
          fetch('/api/blocks').then((r) => r.json()),
          fetch('/api/telemetry').then((r) => r.json()),
          fetch('/api/sample-data').then((r) => r.json()),
        ]);
        if (cancelled) return;
        setStats(s);
        setBlocks(Array.isArray(b) ? b : []);
        setTelemetry(t);
        setSampleData(Array.isArray(sd) ? sd : []);
        const bCount = Array.isArray(b) ? b.length : '—';
        const pCount = Array.isArray(b) ? b.filter((x: BlockResponse) => x.status && x.status !== 'DELIVERED').length : '—';
        appendLog(`Loaded from DB: ${bCount} blocks, ${pCount} pending TXs, — escrows, — miners.`, 'white');
      } catch (e) {
        console.error('Dashboard data load failed:', e);
        appendLog('[WARN] Could not reach backend API — showing local state.', 'amber');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const blocksMined = blocks ? blocks.length : null;
  const pendingTxs = blocks ? blocks.filter((b) => b.status && b.status !== 'DELIVERED').length : null;

  const handleMintNfa = () => {
    const id = packageId.trim() || 'PKT-DRONE-001';
    const meta = metadata.trim() || 'unlabeled';
    appendLog(`[NFA] Minting Non-Fungible Asset → pkg=${id} meta=${meta}`, 'amber');
    appendLog(`[NFA] Asset minted. ZK anchor queued. +5.0 $BS credited.`, 'green');
  };

  const handleQueueTx = () => {
    appendLog('[TX] Queuing proof-of-delivery transaction to mempool…', 'white');
    appendLog('[TX] Broadcast OK. Pending miner confirmation.', 'green');
  };

  const handleMineBlock = () => {
    appendLog('[MINER] Solving PoW for next block…', 'amber');
    appendLog('[MINER] Block #1204818 mined. 3 miners rewarded in $BS.', 'green');
  };

  const handleNetStatus = () => {
    appendLog(`[NET] Status: ONLINE — 3 miners reachable, latency 42ms, peers 12.`, 'white');
  };

  const renderTabBody = () => {
    if (activeTab !== 'Dashboard') {
      return <div className={styles.stub}>// {activeTab} — module stubbed. Coming soon.</div>;
    }

    return (
      <>
        {/* dashboard title row */}
        <div className={styles.titleRow}>
          <div className={styles.titleRowLeft}>
            <span className={styles.headingIcon}>◆</span>
            <div className={styles.titleWrap}>
              <span className={styles.heading}>BitShypt Protocol</span>
              <span className={styles.headingSub}>Drone Delivery · Blockchain Verified · GPS Secured</span>
            </div>
          </div>
          <div className={styles.balanceBig}>
            <div className={styles.balanceNumber}>4808</div>
            <div className={styles.balanceLabel}>$BS TOKENS</div>
          </div>
        </div>

        {/* three-stat row */}
        <div className={styles.statGrid}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{loading ? 'Loading…' : blocksMined === null ? '—' : blocksMined}</span>
            <span className={styles.statLabel}>/ Blocks Mined</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{loading ? 'Loading…' : pendingTxs === null ? '—' : pendingTxs}</span>
            <span className={styles.statLabel}>/ Mempool Txs</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{loading ? 'Loading…' : '—'}</span>
            <span className={styles.statLabel}>/ Miners</span>
          </div>
        </div>

        {/* Mint NFA */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.bullet} />
            <span className={styles.sectionIcon}>◉</span>
            <span className={styles.sectionTitle}>Mint Non-Fungible Asset (NFA)</span>
            <span className={styles.divider} />
          </div>
          <div className={styles.inputRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Package ID:</label>
              <input
                className={styles.input}
                placeholder="PKT-DRONE-001"
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Metadata:</label>
              <input
                className={styles.input}
                placeholder="books, oranges, apples"
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
              />
            </div>
            <button className={styles.btnAmber} onClick={handleMintNfa}>
              Mint NFA
            </button>
          </div>
        </div>

        {/* Create Proof-of-Delivery */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.bullet} />
            <span className={styles.sectionIcon}>◉</span>
            <span className={styles.sectionTitle}>Create Proof-of-Delivery Transaction</span>
            <span className={styles.divider} />
          </div>
          <div className={styles.inputRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Pkg ID:</label>
              <input
                className={`${styles.input} ${styles.inputFocused}`}
                placeholder="PKT-DRONE-001"
                value={podPkg}
                onChange={(e) => setPodPkg(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Sender:</label>
              <input
                className={styles.input}
                placeholder="tb1q…sender"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Receiver:</label>
              <input
                className={styles.input}
                placeholder="tb1q…receiver"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* action buttons */}
        <div className={styles.actionRow}>
          <button className={styles.btnOutline} onClick={handleQueueTx}>
            <span>⏱</span> Queue TX
          </button>
          <button className={`${styles.btnOutline} ${styles.btnGreen}`} onClick={handleMineBlock}>
            <span>⚡</span> Mine Block
          </button>
          <button className={styles.btnOutline} onClick={handleNetStatus}>
            <span>🛡</span> Net Status
          </button>
        </div>

        {/* ledger console */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.bullet} />
            <span className={styles.sectionIcon}>▤</span>
            <span className={styles.sectionTitle}>Protocol Ledger — Live Activity</span>
            <span className={styles.divider} />
          </div>
          <div className={styles.console} ref={consoleRef}>
            {log.map((line, i) => (
              <div key={i} className={styles.logLine}>
                <span className={styles.logTime}>[{line.time}]</span>{' '}
                <span
                  className={
                    line.tone === 'green' ? styles.logGreen : line.tone === 'amber' ? styles.logAmber : styles.logMsg
                  }
                >
                  {line.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className={styles.shell}>
      {/* header bar */}
      <div className={styles.header}>
        <div className={styles.titleRowLeft}>
          <div className={styles.logoBox}>BS</div>
          <div className={styles.titleWrap}>
            <span className={styles.title}>BitShypt</span>
            <span className={styles.subtitle}>PROTOCOL v2.2</span>
          </div>
        </div>
        <div className={styles.titleRowLeft}>
          <span className={styles.statusDot} />
          <span className={styles.wallet}>tb1qhdzw…6p9nq5</span>
          <span className={styles.sep}>·</span>
          <span className={styles.btcLabel}>BTC</span>
          <span className={styles.sep}>|</span>
          <span className={styles.balance}>4808 $BS</span>
        </div>
      </div>

      {/* tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {renderTabBody()}
    </div>
  );
};

export default Dashboard;
