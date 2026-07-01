from pathlib import Path

path = Path('pages/index.tsx')
text = path.read_text(encoding='utf-8')
marker = "Wait, we can't write 'fizz etc'"
idx = text.find(marker)
if idx == -1:
    print('marker not found')
    print('last 400 chars:')
    print(text[-400:])
    raise SystemExit(1)
print('marker idx', idx)
print('snippet:', repr(text[idx:idx+260]))

replacement = """    ]
  );

  return (
    <>
      <Head>
        <meta charSet=\"UTF-8\" />
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
        <title>BitShypt — Decentralized Drone Delivery on the Blockchain</title>
        <meta
          name=\"description\"
          content=\"The world's first decentralized drone delivery platform. Blockchain Proof-of-Delivery, real-time VLOS enforcement, and cryptographic escrow.\"
        />
        <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      </Head>

      <section style={{ padding: '40px 24px', background: 'rgba(2, 10, 13, 0.98)', color: 'var(--text)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gap: 24, marginBottom: 36 }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800 }}>Live Supabase-backed dashboard</div>
            <p style={{ color: 'var(--text2)', maxWidth: 760, lineHeight: 1.8 }}>
              This preview loads the real Supabase data for stats, telemetry, recent blockchain delivery blocks, and sample marketplace rows.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div style={{ padding: 24, borderRadius: 24, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: 'var(--text3)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.3 }}>Packages Delivered</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: '2rem', fontWeight: 800, marginTop: 10 }}>{loading.stats ? 'Loading…' : stats?.packages_delivered?.toLocaleString() ?? '—'}</div>
            </div>
            <div style={{ padding: 24, borderRadius: 24, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: 'var(--text3)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.3 }}>Countries Active</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: '2rem', fontWeight: 800, marginTop: 10 }}>{loading.stats ? 'Loading…' : stats?.countries_active ?? '—'}</div>
            </div>
            <div style={{ padding: 24, borderRadius: 24, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: 'var(--text3)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.3 }}>VLOS Compliance</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: '2rem', fontWeight: 800, marginTop: 10 }}>{loading.stats ? 'Loading…' : stats ? f"{stats.vlos_compliance:.2f}%" : '—'}</div>
            </div>
            <div style={{ padding: 24, borderRadius: 24, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: 'var(--text3)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.3 }}>Avg Proof-of-Delivery</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: '2rem', fontWeight: 800, marginTop: 10 }}>{loading.stats ? 'Loading…' : stats ? f"{stats.avg_proof_of_delivery:.1f}s" : '—'}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 20, marginTop: 32, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div style={{ padding: 24, borderRadius: 24, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Live Telemetry</h2>
              <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text3)' }}>Altitude</span><span>{loading.telemetry ? 'Loading…' : f"{telemetry.alt:.0f} m" if telemetry else '—'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text3)' }}>Speed</span><span>{loading.telemetry ? 'Loading…' : f"{telemetry.speed:.1f} m/s" if telemetry else '—'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text3)' }}>Battery</span><span>{loading.telemetry ? 'Loading…' : f"{telemetry.battery}%" if telemetry else '—'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text3)' }}>VLOS Status</span><span style={{ color: 'var(--teal)' if telemetry and telemetry.vlos == 'OK' else 'var(--blue)' }}>{loading.telemetry ? 'Loading…' : telemetry.vlos if telemetry else '—'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text3)' }}>Last Proof Hash</span><span style={{ fontFamily: 'var(--mono)' }}>{loading.telemetry ? 'Loading…' : telemetry.hash if telemetry else '—'}</span></div>
              </div>
            </div>

            <div style={{ padding: 24, borderRadius: 24, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Recent Blockchain Delivery Blocks</h2>
              <div style={{ display: 'grid', gap: 14, marginTop: 20 }}>
                {loading.blocks ? (
                  <div>Loading blocks…</div>
                ) : blocks.length ? (
                  blocks.map((block) => (
                    <div key={block.block_number} style={{ padding: 18, borderRadius: 18, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ fontWeight: 700 }}>Block #{block.block_number}</div>
                        <div style={{ color: '#48bb78' if block.status == 'DELIVERED' else '#F5A623', fontSize: 12, fontWeight: 700 }}>{block.status.replace('_', ' ')}</div>
                      </div>
                      <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6 }}>
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

          <div style={{ padding: 24, borderRadius: 24, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Marketplace sample rows</h2>
                <p style={{ margin: '8px 0 0', color: 'var(--text3)' }}>Supabase sample table rendered in React.</p>
              </div>
              <div style={{ color: 'var(--text3)', fontSize: 13 }}>{loading.sampleData ? 'Loading…' : f"{len(samplePads)} records"}</div>
            </div>
            <div style={{ display: 'grid', gap: 14, marginTop: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {loading.sampleData ? (
                <div>Loading marketplace rows…</div>
              ) : samplePads.length ? (
                samplePads.map((pad) => (
                  <div key={pad.id} style={{ padding: 18, borderRadius: 18, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>{pad.name}</div>
                    <div style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 12 }}>{pad.value or 'Supabase record'}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)' }}>Row ID: {pad.id}</div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text3)' }}>No marketplace rows found.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <main>{parsedBody}</main>
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
"""

new_text = text[:idx] + replacement
path.write_text(new_text, encoding='utf-8')
print('tail replaced')
