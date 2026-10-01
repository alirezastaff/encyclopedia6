"use client";

import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Calculator, FilePenLine, Globe2, Mail, Search, UsersRound } from "lucide-react";
import KnowledgeSearch from "@/components/homepage/KnowledgeSearch";

const cards = [
  ["ENCYCLOPEDIA", "Social Economy Encyclopedia", "In-depth articles, key concepts and foundational theories.", "Explore encyclopedia", "/en/archive", "/homepage/encyclopedia.png", "encyclopedia", BookOpen],
  ["MARGINALIA", "Marginalia", "Dialogue and ideas about social solidarity.", "Join the discussion", "/profile", "/homepage/marginalia.jpg", "marginalia", FilePenLine],
  ["ATLAS", "Atlas", "Track countries through social economy data.", "Explore atlas", "/en/country-explorer", "/homepage/country-explorer.jpg", "atlas", Globe2],
  ["SOLIDARITY EXPERIENCES", "Solidarity Experiences", "Successful social and solidarity economy examples.", "View experiences", "/en/case-studies", "/homepage/case-studies.jpg", "experiences", UsersRound],
  ["IMPACT CALCULATOR", "Impact Calculator", "Estimate social and economic impact.", "Calculate impact", "/en/impact-calculator", "/homepage/impact-calculator.jpg", "impact", Calculator],
] as const;

export default function ReferenceHome() {
  const router = useRouter();
  type NavItem = "home" | "about" | "subscription";
  const [focusTarget, setFocusTarget] = useState<"search" | "about" | "subscription" | null>(null);
  const [visualFocusTarget, setVisualFocusTarget] = useState<"search" | "about" | "subscription" | null>(null);
  const [activeNavItem, setActiveNavItem] = useState<NavItem>("home");
  const [navIndicator, setNavIndicator] = useState({ left: 0, width: 0 });
  const [subscriptionMessage, setSubscriptionMessage] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isLanguageSwitching, setIsLanguageSwitching] = useState(false);
  const languageSwitchTimerRef = useRef<number | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const navItemRefs = useRef<Record<NavItem, HTMLAnchorElement | null>>({ home: null, about: null, subscription: null });

  useLayoutEffect(() => {
    const nav = navRef.current;
    const activeLink = navItemRefs.current[activeNavItem];
    if (!nav || !activeLink) return;

    function updateIndicator() {
      const navBounds = nav.getBoundingClientRect();
      const linkBounds = activeLink.getBoundingClientRect();
      setNavIndicator({ left: linkBounds.left - navBounds.left, width: linkBounds.width });
    }

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeNavItem]);

  useEffect(() => {
    function preventZoomShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && ["+", "=", "-", "_", "0"].includes(event.key)) {
        event.preventDefault();
      }
    }

    function preventWheelZoom(event: WheelEvent) {
      if (event.ctrlKey || event.metaKey) event.preventDefault();
    }

    function preventGestureZoom(event: Event) {
      event.preventDefault();
    }

    document.addEventListener("keydown", preventZoomShortcut);
    document.addEventListener("wheel", preventWheelZoom, { passive: false });
    document.addEventListener("gesturestart", preventGestureZoom, { passive: false });
    document.addEventListener("gesturechange", preventGestureZoom, { passive: false });
    document.addEventListener("gestureend", preventGestureZoom, { passive: false });

    return () => {
      document.removeEventListener("keydown", preventZoomShortcut);
      document.removeEventListener("wheel", preventWheelZoom);
      document.removeEventListener("gesturestart", preventGestureZoom);
      document.removeEventListener("gesturechange", preventGestureZoom);
      document.removeEventListener("gestureend", preventGestureZoom);
    };
  }, []);

  useEffect(() => () => {
    if (languageSwitchTimerRef.current !== null) window.clearTimeout(languageSwitchTimerRef.current);
  }, []);

  useEffect(() => {
    if (!focusTarget) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFocusTarget(null);
        setVisualFocusTarget(null);
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [focusTarget]);

  useEffect(() => {
    if (!visualFocusTarget) {
      const previousFocus = previousFocusRef.current;
      previousFocusRef.current = null;
      previousFocus?.focus();
      return;
    }

    const targetElement = document.getElementById(
      visualFocusTarget === "about" ? "about-us" : visualFocusTarget === "subscription" ? "subscription" : "reference-search",
    );
    const shell = targetElement?.closest<HTMLElement>(".reference-shell");
    if (!targetElement || !shell) return;
    const spotlightTarget = targetElement;
    const spotlightShell = shell;

    const inertedElements: Array<{ element: HTMLElement; wasInert: boolean }> = [];
    let activeBranch: HTMLElement = targetElement;
    while (activeBranch !== shell) {
      const parent = activeBranch.parentElement;
      if (!parent) break;
      for (const sibling of Array.from(parent.children)) {
        if (sibling === activeBranch || sibling.matches(".reference-focus-scrim")) continue;
        if (sibling instanceof HTMLElement) {
          inertedElements.push({ element: sibling, wasInert: sibling.inert });
          sibling.inert = true;
        }
      }
      activeBranch = parent;
    }

    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const firstTargetControl = targetElement.querySelector<HTMLElement>(focusableSelector);
    (firstTargetControl ?? targetElement).focus({ preventScroll: true });

    function containTabFocus(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const scrim = spotlightShell.querySelector<HTMLElement>(".reference-focus-scrim");
      const targetControls = Array.from(spotlightTarget.querySelectorAll<HTMLElement>(focusableSelector));
      if (spotlightTarget.tabIndex >= 0) targetControls.unshift(spotlightTarget);
      const focusableElements = scrim ? [...targetControls, scrim] : targetControls;
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }
      const activeIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && activeIndex <= 0) {
        event.preventDefault();
        focusableElements.at(-1)?.focus();
      } else if (!event.shiftKey && (activeIndex === -1 || activeIndex === focusableElements.length - 1)) {
        event.preventDefault();
        focusableElements[0].focus();
      }
    }

    document.addEventListener("keydown", containTabFocus);
    return () => {
      document.removeEventListener("keydown", containTabFocus);
      for (const { element, wasInert } of inertedElements) element.inert = wasInert;
    };
  }, [visualFocusTarget]);

  function toggleSpotlight(target: "search" | "about" | "subscription", trigger?: HTMLElement) {
    if (focusTarget === target) {
      setFocusTarget(null);
      setVisualFocusTarget(null);
      return false;
    }
    if (!focusTarget) {
      const activeElement = document.activeElement;
      previousFocusRef.current = trigger ?? (activeElement instanceof HTMLElement ? activeElement : null);
    }
    setVisualFocusTarget(target);
    setFocusTarget(target);
    return true;
  }

  async function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email");
    if (typeof email !== "string") return;

    setIsSubscribing(true);
    setSubscriptionMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Subscription failed");
      setSubscriptionMessage("Thank you. You are subscribed.");
      form.reset();
    } catch {
      setSubscriptionMessage("We could not complete your subscription. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  }

  return <main className={`reference-home${visualFocusTarget ? " spotlight-active" : ""}`} dir="ltr"><style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
    .reference-home{--cream:#f5f8f3;--soft:rgba(239,247,239,.76);--line:rgba(232,245,238,.36);--teal:#173f43;height:100dvh;min-height:560px;overflow:hidden;color:var(--cream);background:#8aa99d;font-family:'DM Sans',sans-serif}.reference-home *{box-sizing:border-box}.reference-shell{position:relative;display:grid;grid-template-rows:58px minmax(0,1fr) 40px minmax(0,1.7fr);gap:10px;width:min(100%,1536px);height:100%;margin:auto;padding:18px 32px 20px;isolation:isolate}.reference-shell:before{content:"";position:absolute;inset:0;z-index:-2;background:linear-gradient(90deg,rgba(4,42,47,.82),rgba(13,63,65,.58) 48%,rgba(129,162,149,.3)),url('/bg.png') center/cover no-repeat,linear-gradient(145deg,#143e44,#528579 54%,#c4c9b0)}.reference-shell:after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(5,40,44,.12),rgba(228,235,217,.18) 75%,rgba(213,223,209,.72));pointer-events:none}.reference-header{display:flex;align-items:center;gap:32px;min-width:0;padding:0 24px;border:1px solid rgba(237,249,240,.3);border-radius:16px;background:rgba(211,232,225,.17);box-shadow:inset 0 1px rgba(255,255,255,.2),0 12px 28px rgba(8,44,42,.14);backdrop-filter:blur(14px)}.reference-logo{width:220px;height:auto;filter:brightness(0) invert(1)}.reference-nav{display:flex;justify-content:center;align-items:center;gap:36px;flex:1;height:100%}.reference-nav a{display:flex;align-items:center;height:100%;color:rgba(248,255,250,.83);font-size:11px;text-decoration:none;white-space:nowrap}.reference-nav a:first-child{border-bottom:2px solid #c9f1d7;color:#fff}.reference-tools{display:flex;align-items:center;gap:12px}.reference-languages{display:flex;align-items:center;border:1px solid rgba(255,255,255,.27);border-radius:20px;overflow:hidden}.reference-languages span{padding:6px 11px;color:rgba(255,255,255,.64);font-size:10px}.reference-languages .active{border-radius:20px;color:#fff;background:#17555a}.reference-tools>svg{width:18px;height:18px}.reference-hero{position:relative;min-height:0;padding:22px 38px 0}.reference-kicker{margin:0 0 10px;color:#d0f4dc;font-size:9px;font-weight:600;letter-spacing:3px}.reference-hero h1{margin:0;font:normal clamp(36px,3.2vw,50px)/.92 'DM Serif Display',Georgia,serif;letter-spacing:-1px}.reference-hero p{max-width:460px;margin:10px 0 0;color:var(--soft);font-size:12px;line-height:1.4}.reference-feature{position:absolute;top:36px;right:0;width:280px;padding:17px 20px 18px;border:1px solid var(--line);border-radius:15px;background:rgba(175,211,202,.23);box-shadow:inset 0 1px rgba(255,255,255,.2),0 14px 28px rgba(6,43,40,.15);backdrop-filter:blur(15px)}.reference-feature-tag,.reference-category-tag{display:flex;align-items:center;gap:8px;color:rgba(246,255,250,.8);font-size:10px}.reference-feature h2{margin:14px 0 7px;font:normal 23px/1 'DM Serif Display',Georgia,serif}.reference-feature p{max-width:215px;margin:0;color:var(--soft);font-size:10px;line-height:1.35}.reference-round-button{display:grid;place-items:center;width:28px;height:28px;margin-top:14px;border:0;border-radius:50%;color:var(--teal);background:rgba(242,250,246,.86)}.reference-search{min-width:0;padding-left:38px}.reference-search .knowledge-search-wrap{width:min(560px,48%)}.reference-search .knowledge-search{height:40px;margin:0;border:1px solid rgba(235,255,245,.5);border-radius:22px;background:rgba(218,244,235,.16);box-shadow:inset 0 1px rgba(255,255,255,.35),0 10px 30px rgba(4,34,33,.12);backdrop-filter:blur(22px) saturate(150%);-webkit-backdrop-filter:blur(22px) saturate(150%)}.reference-search .search-glass{color:#e2f9ec}.reference-search .search-submit{width:28px;height:28px}.reference-search .search-filter{color:rgba(247,255,251,.82);font-size:9px}.reference-search .search-placeholder{color:#fff;font-size:9px}.reference-search .search-placeholder::placeholder{color:rgba(247,255,251,.75)}.reference-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:10px;min-height:0}.reference-card{position:relative;min-width:0;min-height:0;overflow:hidden;border:1px solid rgba(235,249,241,.43);border-radius:10px;box-shadow:0 10px 24px rgba(8,44,41,.2),inset 0 1px rgba(255,255,255,.2)}.reference-card:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,47,47,.86),rgba(6,52,51,.2))}.reference-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.reference-card .card-body{position:relative;z-index:1;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;height:100%;padding:20px}.reference-card .card-heading{display:flex;align-items:center;gap:7px}.reference-card .card-icon{display:grid;place-items:center;width:25px;height:25px;border-radius:50%;background:rgba(15,99,95,.85)}.reference-card .card-icon svg{width:14px;height:14px}.reference-card .card-label{padding:5px 9px;border:1px solid rgba(255,255,255,.65);border-radius:15px;color:#f6fffa;font-size:8px;letter-spacing:1px}.reference-card h2{max-width:360px;margin:10px 0 5px;font:normal clamp(20px,1.72vw,28px)/.98 'DM Serif Display',Georgia,serif}.reference-card p{max-width:280px;margin:0;color:rgba(247,255,250,.84);font-size:10px;line-height:1.3}.reference-card .card-button{display:inline-flex;align-items:center;gap:10px;margin-top:14px;padding:7px 12px;border-radius:18px;color:#173f43;background:rgba(244,252,248,.9);font-size:9px;font-weight:700;text-decoration:none}.reference-card .card-button svg{width:13px;height:13px}.reference-card.encyclopedia{grid-column:1/span 7;grid-row:1}.reference-card.marginalia{grid-column:8/span 5;grid-row:1}.reference-card.atlas{grid-column:1/span 4;grid-row:2}.reference-card.experiences{grid-column:5/span 4;grid-row:2}.reference-card.impact{grid-column:9/span 4;grid-row:2}.reference-card.marginalia:after{background:linear-gradient(90deg,rgba(25,31,24,.84),rgba(25,31,24,.16))}.reference-card.atlas:after{background:linear-gradient(90deg,rgba(0,49,52,.9),rgba(3,75,72,.2))}.reference-card.experiences:after{background:linear-gradient(90deg,rgba(55,38,22,.83),rgba(40,47,30,.18))}.reference-card.impact:after{background:linear-gradient(90deg,rgba(2,58,42,.86),rgba(6,90,65,.14))}.reference-categories{grid-column:13;grid-row:1/span 2;min-width:0;padding:17px;border:1px solid var(--line);border-radius:12px;background:rgba(177,211,203,.27);box-shadow:inset 0 1px rgba(255,255,255,.2),0 14px 28px rgba(8,44,41,.13);backdrop-filter:blur(14px)}.reference-category-tag{justify-content:space-between;margin-bottom:14px}.reference-category-tag span{display:flex;align-items:center;gap:8px}.reference-categories h2{display:none}.reference-categories ul{display:grid;gap:0;padding:0;margin:0;list-style:none}.reference-categories li{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(235,249,241,.22);color:rgba(248,255,251,.86);font-size:10px}
    @media(max-width:900px){.reference-shell{padding-inline:20px}.reference-nav{gap:17px}.reference-nav a{font-size:10px}.reference-logo{width:190px}.reference-feature{width:235px}.reference-card .card-body{padding:12px}.reference-card h2{font-size:21px}}
    @media(max-width:680px){.reference-home{min-height:100dvh;overflow:auto}.reference-shell{grid-template-rows:46px auto 44px auto;gap:9px;min-height:100dvh;height:auto;padding:10px}.reference-header{padding:0 12px;border-radius:12px}.reference-logo{width:155px}.reference-nav{display:none}.reference-tools{margin-left:auto}.reference-languages span{padding:5px 8px;font-size:9px}.reference-tools>svg{width:16px}.reference-hero{padding:18px 12px 10px;min-height:150px}.reference-hero h1{font-size:clamp(35px,10vw,52px)}.reference-hero p{max-width:285px;font-size:10px}.reference-kicker{margin-bottom:10px;font-size:7px;letter-spacing:2px}.reference-feature{display:none}.reference-search .knowledge-search-wrap{width:100%}.reference-search .knowledge-search{height:40px}.reference-search .search-filter,.reference-search .search-divider{display:none}.reference-search .search-submit{width:31px;height:31px}.reference-grid{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(3,180px);gap:7px}.reference-card.encyclopedia{grid-column:1/span 2;grid-row:1}.reference-card.marginalia,.reference-card.atlas,.reference-card.experiences,.reference-card.impact{grid-column:auto;grid-row:auto}.reference-categories{display:none}.reference-card .card-body{padding:10px}.reference-card .card-label{max-width:calc(100% - 28px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:7px}.reference-card h2{margin-top:6px;font-size:17px}.reference-card p{display:none}.reference-card .card-button{padding:5px 8px;font-size:8px}}
  `}</style>
      <style>{`
        .reference-nav{position:relative}
        .reference-nav a,.reference-nav a:first-child{border-bottom:0;transition:color 180ms ease}
        .reference-nav a.active{color:#fff}
        .reference-nav-indicator{position:absolute;left:0;bottom:0;height:2px;background:#c9f1d7;pointer-events:none;transition:left 320ms cubic-bezier(.2,.75,.25,1),width 320ms cubic-bezier(.2,.75,.25,1)}
        @media(prefers-reduced-motion:reduce){.reference-nav a,.reference-nav-indicator{transition:none}}
      `}</style>
      <div className="reference-shell">
        <div className="reference-background-blur reference-background-blur-bottom" aria-hidden="true" />
        <div className="reference-background-blur reference-background-blur-title" aria-hidden="true" />
        <header className="reference-header">
          <Link href="/en"><img className="reference-logo" src="/homepage/logo-2-w.png" alt="SSE Knowledge Platform" /></Link>
          <nav ref={navRef} className="reference-nav" aria-label="Main navigation">
            <Link ref={(element) => { navItemRefs.current.home = element; }} className={activeNavItem === "home" ? "active" : ""} href="/en" onClick={() => setActiveNavItem("home")}>Home</Link>
            <a ref={(element) => { navItemRefs.current.about = element; }} className={activeNavItem === "about" ? "active" : ""} href="#about-us" onClick={(event) => { event.preventDefault(); setActiveNavItem("about"); if (toggleSpotlight("about", event.currentTarget) && window.innerWidth <= 680) document.getElementById("about-us")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>About Us</a>
            <a ref={(element) => { navItemRefs.current.subscription = element; }} className={activeNavItem === "subscription" ? "active" : ""} href="#subscription" onClick={(event) => { setActiveNavItem("subscription"); event.preventDefault(); toggleSpotlight("subscription", event.currentTarget); }}>Follow Us</a>
            <span className="reference-nav-indicator" aria-hidden="true" style={{ left: navIndicator.left, width: navIndicator.width }} />
          </nav>
          <div className="reference-tools">
            <div className={`reference-languages${isLanguageSwitching ? " switching" : ""}`}>
              <span className="active">EN</span>
              <Link
                href="/fa"
                onClick={(event) => {
                  event.preventDefault();
                  if (isLanguageSwitching) return;
                  setIsLanguageSwitching(true);
                  languageSwitchTimerRef.current = window.setTimeout(() => router.push("/fa"), 380);
                }}
              >
                <span>FA</span>
              </Link>
            </div>
            <Search aria-hidden="true" />
          </div>
        </header>

        <section className="reference-hero">
          <p className="reference-kicker">EXPLORE / ANALYZE / BUILD A FAIRER FUTURE</p>
          <h1>The knowledge platform<br />for social economy</h1>
          <p>Explore research, data and real-world cases on social economy,<br />solidarity and inclusive development.</p>
          <aside id="subscription" className={`reference-feature newsletter-feature${focusTarget === "subscription" ? " focus-spotlight" : ""}${visualFocusTarget === "subscription" ? " spotlight-raised" : ""}`}>
            <div className="newsletter-kicker">
              <span><Mail size={13} aria-hidden="true" /> Subscription</span>
            </div>
            <h2>Ideas and research, delivered.</h2>
            <p className="newsletter-description">Get occasional updates from our social economy research.</p>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <label htmlFor="newsletter-email">Email address</label>
              <input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
              <button type="submit" disabled={isSubscribing}>{isSubscribing ? "Joining..." : "Subscribe"}<ArrowRight size={14} aria-hidden="true" /></button>
              <p className="newsletter-feedback" role="status">{subscriptionMessage}</p>
            </form>
          </aside>
        </section>

        <div id="reference-search" className={`reference-search${focusTarget === "search" ? " focus-spotlight" : ""}${visualFocusTarget === "search" ? " spotlight-raised" : ""}`}>
          <KnowledgeSearch locale="en" smartSearchActive={visualFocusTarget === "search"} onSmartSearchToggle={() => toggleSpotlight("search")} />
        </div>

        <section className="reference-grid">
          {cards.map(([label,title,text,action,href,image,className,Icon]) => (
            <article className={`reference-card ${className}`} key={title}>
              <img src={image} alt="" />
              <div className="card-body">
                <div className="card-heading"><span className="card-icon"><Icon aria-hidden="true" /></span><span className="card-label">{label}</span></div>
                <h2>{title}</h2><p>{text}</p>
                <Link className="card-button" href={href}>{action}<ArrowRight /></Link>
              </div>
            </article>
          ))}
          <aside id="about-us" tabIndex={visualFocusTarget === "about" ? 0 : -1} className={`reference-categories about-panel${focusTarget === "about" ? " focus-spotlight" : ""}${visualFocusTarget === "about" ? " spotlight-raised" : ""}`}>
            <div className="about-scroll-content">
              <h2>About Us</h2>
              <p>We are an independent research institute dedicated to the social economy. We study its ideas, institutions, and practices, and make this knowledge accessible to researchers, practitioners, and the wider public.</p>
              <p>Our work promotes social economy concepts across Iran and internationally. Through research, collaboration, and open exchange, we contribute to a more inclusive and sustainable future.</p>
              <p>We connect scholarship with lived experience, bringing together researchers, educators, community organizations, and practitioners who are working to build economies rooted in cooperation, dignity, and shared responsibility. By documenting local initiatives and examining the structures that support them, we help make practical knowledge visible and useful.</p>
              <p>Our platform is a growing space for thoughtful inquiry and public exchange. We publish accessible research, highlight solidarity experiences, and create pathways for new conversations about how communities can shape fairer systems. We believe that knowledge becomes most powerful when it is shared openly and put into dialogue with the people it is meant to serve.</p>
            </div>
          </aside>
        </section>
        <button
          className={`reference-focus-scrim${focusTarget ? " active" : ""}`}
          type="button"
          tabIndex={visualFocusTarget ? 0 : -1}
          aria-hidden={!visualFocusTarget}
          aria-label="Close spotlight"
          onClick={() => {
            setFocusTarget(null);
            setVisualFocusTarget(null);
          }}
        />
      </div>
    </main>;
}
