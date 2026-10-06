"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.35 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about-us"
      className={`sse-about-section${isVisible ? " is-visible" : ""}`}
      aria-labelledby="sse-about-title"
    >
      <div id="contact-us" className="sse-about-panel">
        <div className="sse-about-mark">
          <Image src="/sse-logo.png" alt="Social and Solidarity Economy logo" width={255} height={252} sizes="255px" />
          <p className="sse-about-kicker">Independent research group</p>
          <h2 id="sse-about-title">About Us</h2>
        </div>
        <div className="sse-about-divider" aria-hidden="true" />
        <div className="sse-about-copy">
          <h3>Independent Social Economy Research Group</h3>
          <p>The Independent Social Economy Research Group is a network of independent researchers in Iran focused on advancing and promoting the field of social economy.</p>
          <p>Our activities include research and knowledge production, collaboration with universities and academics, engagement with economic enterprises, facilitating connections among community-based organizations, and building networks among social economy actors.</p>
          <p>Our primary focus is to strengthen the connection between academia, society, and policymaking and contribute to the development of the social economy discourse in Iran. Through national conferences, specialized seminars, and academic dialogues, we seek to create greater space for social economy within discussions on development and public policy.</p>
        </div>
      </div>
      <p className="sse-about-caption"><span lang="fa" dir="rtl">تصویر: تهران، ایران</span><span lang="en" dir="ltr">Image: Tehran, Iran</span></p>
    </section>
  );
}
