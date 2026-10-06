import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="sse-entry-page">
      <div className="sse-entry-wash" aria-hidden="true" />

      <nav className="sse-entry-meta" aria-label="Editorial navigation">
        <span>IDEAS</span><span aria-hidden="true">/</span><span>PEOPLE</span><span aria-hidden="true">/</span><span>SUSTAINABLE FUTURES</span>
      </nav>

      <div className="sse-entry-vertical" aria-hidden="true">
        <i /><b /><span>SOCIAL AND SOLIDARITY ECONOMY</span>
      </div>

      <section className="sse-entry-panel" aria-labelledby="sse-entry-title">
        <div className="sse-entry-brand">
          <Image src="/sse-logo.png" alt="Social and Solidarity Economy logo" width={255} height={252} sizes="92px" loading="eager" />
          <div>
            <h1 id="sse-entry-title">Social and Solidarity<span>Economy</span></h1>
            <p>Knowledge platform</p>
          </div>
        </div>
        <div className="sse-entry-divider" aria-hidden="true" />
        <nav className="sse-entry-languages" aria-label="Choose language">
          <Link href="/fa" className="sse-entry-language sse-entry-language-fa" lang="fa" dir="rtl"><span>فارسی</span><b aria-hidden="true">→</b></Link>
          <Link href="/en" className="sse-entry-language" lang="en" dir="ltr"><span>English</span><b aria-hidden="true">→</b></Link>
        </nav>
      </section>

      <p className="sse-entry-footer-copy">KNOWLEDGE BUILDS<br />A MORE JUST ECONOMY</p>

      <svg className="sse-entry-mark" viewBox="0 0 150 42" aria-hidden="true">
        <path d="M1 21h38m22 0h87" />
        <circle cx="52" cy="21" r="13" /><circle cx="77" cy="21" r="13" /><circle cx="102" cy="21" r="13" />
        <circle cx="145" cy="21" r="2" fill="currentColor" stroke="none" />
      </svg>

      <p className="sse-entry-caption">
        <span lang="fa" dir="rtl">تصویر: منجیل، ایران</span>
        <span lang="en" dir="ltr">Image: Manjil, Iran</span>
      </p>

      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&display=swap");
        .sse-entry-page, .sse-entry-page * { box-sizing:border-box; }
        .sse-entry-page { --sse-white:rgba(255,255,255,.96); --sse-soft-white:rgba(245,255,250,.78); --sse-gutter:clamp(18px,4vw,52px); position:relative; isolation:isolate; display:grid; width:100%; height:100dvh; min-height:100dvh; place-items:center; overflow:hidden; color:var(--sse-white); background:#123b3b url("/bg.png") center center / cover no-repeat; font-family:"Manrope","Avenir Next","Helvetica Neue",Arial,sans-serif; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; }
        .sse-entry-wash { position:absolute; z-index:-1; inset:0; background:rgba(5,38,36,.24); pointer-events:none; }
        .sse-entry-panel { position:relative; top:clamp(-21px,-2.6vh,-10px); z-index:1; display:grid; width:min(68vw,900px); height:clamp(270px,45vh,344px); grid-template-areas:"brand divider languages"; grid-template-columns:minmax(0,1fr) 1px clamp(150px,13vw,184px); align-items:center; gap:clamp(24px,3.1vw,42px); padding:clamp(28px,4vh,42px) clamp(32px,5vw,68px); border:1px solid rgba(235,255,246,.46); border-radius:28px; background:rgba(76,137,122,.22); box-shadow:0 20px 60px rgba(2,32,28,.22),inset 0 1px 0 rgba(235,255,246,.24); backdrop-filter:blur(18px) saturate(112%); -webkit-backdrop-filter:blur(18px) saturate(112%); animation:sse-entry-rise 650ms cubic-bezier(.22,1,.36,1) both; direction:ltr; }
        .sse-entry-brand { grid-area:brand; min-width:0; text-align:left; }
        .sse-entry-brand img { display:block; width:clamp(72px,6.8vw,92px); height:clamp(72px,6.8vw,92px); margin:0 0 12px; object-fit:contain; object-position:center; }
        .sse-entry-brand h1 { margin:0; color:var(--sse-white); font-size:clamp(2rem,2.75vw,2.65rem); font-weight:500; line-height:1.08; letter-spacing:-1.7px; text-align:left; }
        .sse-entry-brand h1 span { display:block; }
        .sse-entry-brand p { margin:14px 0 0; color:var(--sse-soft-white); font-size:clamp(1.25rem,1.65vw,1.6rem); font-weight:300; line-height:1.2; letter-spacing:-.5px; }
        .sse-entry-divider { grid-area:divider; width:1px; height:144px; background:rgba(255,255,255,.55); }
        .sse-entry-languages { grid-area:languages; display:grid; gap:14px; justify-self:end; justify-items:stretch; }
        .sse-entry-language { display:flex; width:184px; min-height:42px; align-items:center; justify-content:space-between; padding:0 16px 0 20px; border:1px solid rgba(235,255,246,.48); border-radius:28px; color:var(--sse-white); background:rgba(210,240,226,.1); box-shadow:inset 0 1px 0 rgba(235,255,246,.12); font-size:1.05rem; font-weight:400; line-height:1; text-decoration:none; transition:transform 200ms ease,background-color 200ms ease,border-color 200ms ease,box-shadow 200ms ease; }
        .sse-entry-language:hover { transform:translateY(-1px); border-color:rgba(240,255,248,.78); background:rgba(210,240,226,.17); box-shadow:0 8px 20px rgba(2,32,28,.16),inset 0 1px 0 rgba(235,255,246,.18); }
        .sse-entry-language:focus-visible { outline:2px solid #fff; outline-offset:4px; }
        .sse-entry-language-fa { font-family:"Vazirmatn",Tahoma,sans-serif; }
        .sse-entry-language b { color:rgba(255,255,255,.86); font-family:Arial,sans-serif; font-size:1.32rem; font-weight:300; }
        .sse-entry-meta,.sse-entry-vertical,.sse-entry-footer-copy,.sse-entry-mark,.sse-entry-caption { position:absolute; z-index:2; color:var(--sse-soft-white); }
        .sse-entry-meta { top:34px; right:52px; display:flex; gap:13px; align-items:center; font-size:.72rem; font-weight:400; letter-spacing:2px; }
        .sse-entry-vertical { top:53px; left:52px; display:flex; flex-direction:column; align-items:center; gap:11px; font-size:.68rem; letter-spacing:3px; }
        .sse-entry-vertical i { display:block; width:1px; height:66px; background:rgba(255,255,255,.58); }
        .sse-entry-vertical b { display:block; width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,.75); }
        .sse-entry-vertical span { writing-mode:vertical-rl; transform:rotate(180deg); white-space:nowrap; }
        .sse-entry-footer-copy { bottom:39px; left:96px; margin:0; font-size:.66rem; font-weight:400; line-height:1.75; letter-spacing:2px; }
        .sse-entry-footer-copy::before { content:""; position:absolute; width:28px; height:1px; top:8px; right:calc(100% + 15px); background:rgba(255,255,255,.55); }
        .sse-entry-mark { right:62px; bottom:40px; width:150px; height:42px; fill:none; stroke:currentColor; stroke-width:1; }
        .sse-entry-caption { right:66px; bottom:82px; display:grid; gap:2px; margin:0; font-size:.55rem; font-weight:400; line-height:1.35; letter-spacing:1px; text-align:right; }
        .sse-entry-caption span:first-child { font-family:"Vazirmatn",Tahoma,sans-serif; letter-spacing:0; }
        @keyframes sse-entry-rise { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @media (max-height:720px) and (min-width:721px) { .sse-entry-panel { height:clamp(248px,58vh,300px); padding-block:24px; } .sse-entry-brand img { margin-bottom:8px; } .sse-entry-brand p { margin-top:8px; } .sse-entry-divider { height:118px; } .sse-entry-meta { top:22px; } .sse-entry-vertical { top:34px; } .sse-entry-footer-copy { bottom:22px; } .sse-entry-mark { bottom:22px; } .sse-entry-caption { bottom:64px; } }
        @media (max-width:1100px) { .sse-entry-panel { width:min(76vw,820px); gap:28px; padding-inline:48px; } .sse-entry-brand img { width:88px; height:88px; } .sse-entry-language { width:184px; } }
        @media (max-width:720px) { .sse-entry-page { padding:var(--sse-gutter) 0; } .sse-entry-panel { top:0; width:min(calc(100vw - var(--sse-gutter) - var(--sse-gutter)),480px); height:auto; min-height:0; max-height:calc(100dvh - var(--sse-gutter) - var(--sse-gutter) - 78px); grid-template-areas:"brand" "divider" "languages"; grid-template-columns:1fr; gap:clamp(14px,3vh,25px); padding:clamp(22px,5vh,34px) 24px clamp(22px,4vh,30px); border-radius:24px; } .sse-entry-brand { text-align:center; } .sse-entry-brand img { width:clamp(64px,18vw,88px); height:clamp(64px,18vw,88px); margin:0 auto 12px; } .sse-entry-brand h1 { font-size:clamp(2rem,9vw,2.55rem); text-align:center; } .sse-entry-brand p { margin-top:12px; font-size:clamp(1rem,5vw,1.4rem); } .sse-entry-divider { width:100%; height:1px; } .sse-entry-languages { justify-self:center; justify-items:center; } .sse-entry-language { width:min(220px,100%); } .sse-entry-meta { top:var(--sse-gutter); right:var(--sse-gutter); font-size:.62rem; gap:8px; letter-spacing:1.4px; } .sse-entry-vertical { display:none; } .sse-entry-footer-copy { bottom:var(--sse-gutter); left:var(--sse-gutter); font-size:.58rem; letter-spacing:1.5px; } .sse-entry-footer-copy::before { display:none; } .sse-entry-mark { right:var(--sse-gutter); bottom:var(--sse-gutter); width:105px; } .sse-entry-caption { right:var(--sse-gutter); bottom:calc(var(--sse-gutter) + 40px); font-size:.48rem; } }
        @media (prefers-reduced-motion:reduce) { .sse-entry-panel { animation:none; } .sse-entry-language { transition:none; } }
      `}</style>
    </main>
  );
}
