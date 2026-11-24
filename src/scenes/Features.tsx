import React from 'react';
import {useVideoConfig} from 'remotion';
import {SceneId, scene, vo} from '../data/timeline';
import {IconName, Medallion} from '../components/Icons3D';
import {LightStreaks, ShockRing} from '../components/Light';
import {EXPO_OUT, pop, SOFT, tween, wave} from '../components/motion';
import {Center, Parallax, SceneShell, useSceneFrame} from '../components/Scene';
import {KineticWords, Ltr, WhiteText} from '../components/Typography';
import {C, FONT_BODY, FONT_DISPLAY, GOLD_GRADIENT} from '../theme';

const glass: React.CSSProperties = {
  background: 'linear-gradient(150deg, rgba(27,63,158,0.5), rgba(3,10,31,0.7))',
  border: '2px solid rgba(230,195,92,0.55)',
  boxShadow: '0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.22), 0 0 40px rgba(61,123,255,0.2)',
  borderRadius: 32,
  backdropFilter: 'blur(12px)',
};

const Check: React.FC<{p: number; size?: number}> = ({p, size = 54}) => (
  <svg width={size} height={size} viewBox="0 0 60 60">
    <circle cx="30" cy="30" r="27" fill="none" stroke="url(#chk)" strokeWidth="4" />
    <defs>
      <linearGradient id="chk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff3c4" />
        <stop offset="1" stopColor="#b8892a" />
      </linearGradient>
    </defs>
    <path d="M17 31 l9 9 17 -19" fill="none" stroke="#f3d77e" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" strokeDashoffset={40 - 40 * p} />
  </svg>
);

/** A row that slides in from the right (RTL reading direction) with a gold check. */
const Row: React.FC<{f: number; at: number; children: React.ReactNode; size?: number}> = ({f, at, children, size = 52}) => {
  const p = tween(f, [at, at + 16], [0, 1], EXPO_OUT);
  return (
    <div
      dir="rtl"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        opacity: p,
        transform: `translateX(${(1 - p) * 160}px)`,
        filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined,
      }}
    >
      <Check p={tween(f, [at + 6, at + 20], [0, 1])} />
      <WhiteText size={size} weight={700}>
        {children}
      </WhiteText>
    </div>
  );
};

// ---------------------------------------------------------------- per-feature visuals
const VisualExplain: React.FC<{f: number; t: (r: number) => number}> = ({f, t}) => {
  const fill = tween(f, [t(0.45), t(0.95)], [0, 1], SOFT);
  return (
    <div style={{...glass, padding: '40px 56px', width: 860, display: 'flex', flexDirection: 'column', gap: 22}}>
      <Row f={f} at={t(0.42)}>شرح وافٍ ومفصل</Row>
      <Row f={f} at={t(0.62)}>يضمن لك فهم المادة</Row>
      <Row f={f} at={t(0.8)}>واستيعابها</Row>
      <div style={{height: 18, borderRadius: 9, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginTop: 8}}>
        <div style={{width: `${fill * 100}%`, height: '100%', background: GOLD_GRADIENT, boxShadow: '0 0 20px rgba(255,210,110,0.8)', marginRight: 0, marginLeft: 'auto'}} />
      </div>
    </div>
  );
};

const VisualExams: React.FC<{f: number; t: (r: number) => number}> = ({f, t}) => {
  const days = 7;
  const dayLit = tween(f, [t(0.35), t(0.6)], [0, days], SOFT);
  const week = tween(f, [t(0.55), t(0.68)], [0, 1]);
  const unit = pop(f, 30, t(0.75), 11, 0.8);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
      <div dir="rtl" style={{...glass, padding: 26, display: 'flex', gap: 14, position: 'relative'}}>
        {new Array(days).fill(0).map((_, i) => {
          const lit = dayLit > i;
          return (
            <div
              key={i}
              style={{
                width: 96,
                height: 110,
                borderRadius: 18,
                background: lit ? GOLD_GRADIENT : 'rgba(255,255,255,0.08)',
                border: '2px solid rgba(255,230,160,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${lit ? 1 : 0.9})`,
                boxShadow: lit ? '0 0 26px rgba(255,210,110,0.6)' : undefined,
              }}
            >
              <svg width="54" height="54" viewBox="0 0 60 60">
                <path d="M15 31 l10 10 20 -22" fill="none" stroke={lit ? C.navy900 : 'rgba(255,255,255,0.25)'} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          );
        })}
        <div style={{position: 'absolute', inset: 14, borderRadius: 24, border: `4px solid rgba(255,230,160,${week})`, boxShadow: `0 0 40px rgba(255,210,110,${0.6 * week})`}} />
      </div>
      <div dir="rtl" style={{display: 'flex', gap: 24}}>
        {['يومية', 'أسبوعية'].map((w, i) => {
          const p = tween(f, [t(0.38 + i * 0.18), t(0.48 + i * 0.18)], [0, 1]);
          return (
            <div key={w} style={{...glass, borderRadius: 60, padding: '12px 40px', opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
              <WhiteText size={50}>{w}</WhiteText>
            </div>
          );
        })}
      </div>
      <div style={{transform: `scale(${unit}) rotate(${(1 - unit) * -8}deg)`, opacity: unit, ...glass, borderRadius: 60, padding: '16px 50px', background: GOLD_GRADIENT}}>
        <span dir="rtl" style={{fontFamily: FONT_BODY, fontWeight: 900, fontSize: 54, color: C.navy950}}>
          شاملة لكل وحدة
        </span>
      </div>
    </div>
  );
};

const VisualSystem: React.FC<{f: number; t: (r: number) => number}> = ({f, t}) => {
  const rows = [
    {label: 'حضور الطالب', at: t(0.45), kind: 'check'},
    {label: 'درجاته', at: t(0.62), kind: 'bar'},
    {label: 'مستواه الدراسي', at: t(0.78), kind: 'line'},
  ];
  return (
    <div style={{...glass, width: 880, padding: '30px 44px', position: 'relative', overflow: 'hidden'}}>
      <div dir="rtl" style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16}}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{width: 16, height: 16, borderRadius: 8, background: i === 0 ? C.gold : 'rgba(255,255,255,0.3)'}} />
        ))}
        <div style={{flex: 1, height: 2, background: 'rgba(230,195,92,0.4)'}} />
        <WhiteText size={30} weight={700} style={{color: C.ice}}>
          نظام متابعة إلكتروني
        </WhiteText>
      </div>
      {rows.map((r) => {
        const p = tween(f, [r.at, r.at + 16], [0, 1]);
        const g = tween(f, [r.at + 4, r.at + 30], [0, 1], SOFT);
        return (
          <div key={r.label} dir="rtl" style={{display: 'flex', alignItems: 'center', gap: 24, height: 104, opacity: p, transform: `translateX(${(1 - p) * 120}px)`, borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
            <WhiteText size={44} weight={700} style={{width: 360, whiteSpace: 'nowrap'}}>
              {r.label}
            </WhiteText>
            <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>
              {r.kind === 'check' && <Check p={g} size={70} />}
              {r.kind === 'bar' && (
                <div style={{display: 'flex', alignItems: 'flex-end', gap: 12, height: 80}}>
                  {[0.55, 0.7, 0.62, 0.85, 0.95].map((h, i) => (
                    <div key={i} style={{width: 34, height: 80 * h * g, borderRadius: 6, background: GOLD_GRADIENT}} />
                  ))}
                </div>
              )}
              {r.kind === 'line' && (
                <svg width="380" height="90" viewBox="0 0 380 90">
                  <polyline points="380,80 300,66 220,58 140,36 60,24 0,8" fill="none" stroke="#9cc2ff" strokeWidth="6" strokeDasharray="500" strokeDashoffset={500 - 500 * g} strokeLinecap="round" />
                  <circle cx={380 - 380 * g} cy={80 - 72 * g} r="10" fill="#f3d77e" />
                </svg>
              )}
            </div>
          </div>
        );
      })}
      {/* scanning light */}
      <div style={{position: 'absolute', left: 0, right: 0, top: ((f * 6) % 520) - 60, height: 60, background: 'linear-gradient(to bottom, rgba(156,194,255,0), rgba(156,194,255,0.18), rgba(156,194,255,0))'}} />
    </div>
  );
};

const VisualParent: React.FC<{f: number; t: (r: number) => number}> = ({f, t}) => {
  const quote = pop(f, 30, t(0.32), 13, 0.8);
  const bubbles = [
    {text: 'نجاح الطالب مسؤوليتنا', at: t(0.4), side: 'right'},
    {text: 'تواصل مباشر ومستمر', at: t(0.62), side: 'left'},
    {text: 'مع ولي الأمر', at: t(0.8), side: 'right'},
  ];
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
      <div style={{transform: `scale(${quote})`, opacity: quote}}>
        <WhiteText size={46} weight={600} style={{color: C.ice}}>
          لأن
        </WhiteText>
      </div>
      <div style={{width: 820, display: 'flex', flexDirection: 'column', gap: 20}}>
        {bubbles.map((b, i) => {
          const s = pop(f, 30, b.at, 12, 0.7);
          const right = b.side === 'right';
          return (
            <div key={i} style={{display: 'flex', justifyContent: right ? 'flex-end' : 'flex-start'}}>
              <div
                dir="rtl"
                style={{
                  transform: `scale(${s})`,
                  transformOrigin: right ? '100% 100%' : '0% 100%',
                  opacity: Math.min(1, s * 2),
                  padding: '20px 40px',
                  borderRadius: right ? '40px 40px 8px 40px' : '40px 40px 40px 8px',
                  background: right ? GOLD_GRADIENT : 'linear-gradient(150deg, #2a56c6, #0b2163)',
                  border: right ? '2px solid rgba(255,240,190,0.9)' : '2px solid rgba(156,194,255,0.6)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                }}
              >
                <span style={{fontFamily: FONT_BODY, fontWeight: 800, fontSize: 50, color: right ? C.navy950 : C.white}}>{b.text}</span>
                <span style={{fontFamily: FONT_BODY, fontSize: 28, color: right ? C.navy800 : C.ice, opacity: tween(f, [b.at + 12, b.at + 18], [0, 1])}}>✓✓</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const VisualJourney: React.FC<{f: number; t: (r: number) => number}> = ({f, t}) => {
  const p = tween(f, [t(0.3), t(1.0)], [0, 1], SOFT);
  const W = 860;
  const milestones = [
    {at: 0, label: 'أول محاضرة'},
    {at: 0.36, label: 'مراجعة مفصلة'},
    {at: 0.66, label: 'متابعة مستمرة'},
    {at: 1, label: 'قاعة الامتحان'},
  ];
  // RTL: journey runs right → left
  const pathX = (r: number) => W - 40 - r * (W - 80);
  const pathY = (r: number) => 150 + Math.sin(r * Math.PI * 2) * 60;
  const pts = new Array(41).fill(0).map((_, i) => `${pathX(i / 40)},${pathY(i / 40)}`).join(' ');
  return (
    <div style={{...glass, width: W, height: 380, position: 'relative'}}>
      <svg width={W} height={380} style={{position: 'absolute', inset: 0}}>
        <polyline points={pts} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" strokeLinecap="round" />
        <polyline points={pts} fill="none" stroke="#f3d77e" strokeWidth="10" strokeLinecap="round" strokeDasharray="2000" strokeDashoffset={2000 - 1150 * p} style={{filter: 'drop-shadow(0 0 10px rgba(255,210,110,0.9))'}} />
      </svg>
      {milestones.map((m, i) => {
        const on = p >= m.at - 0.01;
        return (
          <div key={i} style={{position: 'absolute', left: pathX(m.at) - 22, top: pathY(m.at) - 22}}>
            <div style={{width: 44, height: 44, borderRadius: 22, background: on ? GOLD_GRADIENT : '#0b2163', border: '3px solid #f3d77e', boxShadow: on ? '0 0 26px rgba(255,210,110,0.9)' : undefined}} />
            <div
              dir="rtl"
              style={{
                position: 'absolute',
                top: i <= 1 ? 62 : -78,
                left: 22,
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                fontFamily: FONT_BODY,
                fontWeight: 800,
                fontSize: 36,
                color: on ? C.goldLight : 'rgba(255,255,255,0.55)',
                textShadow: on ? '0 0 16px rgba(255,210,110,0.6)' : undefined,
              }}
            >
              {m.label}
            </div>
          </div>
        );
      })}
      {/* traveller */}
      <div style={{position: 'absolute', left: pathX(p) - 30, top: pathY(p) - 30, width: 60, height: 60, borderRadius: 30, background: 'radial-gradient(circle, #fff 0%, #ffe39a 45%, rgba(255,200,90,0) 72%)', boxShadow: '0 0 40px 14px rgba(255,210,110,0.5)'}} />
    </div>
  );
};

// ---------------------------------------------------------------- feature scene
const FEATURES: Record<string, {n: string; icon: IconName; vo: string; title: string; Visual: React.FC<{f: number; t: (r: number) => number}>}> = {
  f1: {n: '01', icon: 'book', vo: 'v06', title: 'شرح مفصل للمادة', Visual: VisualExplain},
  f2: {n: '02', icon: 'exam', vo: 'v07', title: 'امتحانات مستمرة', Visual: VisualExams},
  f3: {n: '03', icon: 'system', vo: 'v08', title: 'نظام إلكتروني دقيق', Visual: VisualSystem},
  f4: {n: '04', icon: 'parent', vo: 'v09', title: 'تواصل مباشر مع ولي الأمر', Visual: VisualParent},
  f5: {n: '05', icon: 'cap', vo: 'v10', title: 'متابعة حتى الامتحان الوزاري', Visual: VisualJourney},
};

export const Feature: React.FC<{id: SceneId}> = ({id}) => {
  const def = FEATURES[id];
  const {duration} = scene(id);
  const f = useSceneFrame();
  const {fps} = useVideoConfig();
  const v = vo(def.vo, id);
  const t = (r: number) => Math.round(v.start + v.len * r);
  const idx = Number(def.n);
  const numS = pop(f, fps, 0, 16, 1);
  const enter = idx % 2 === 0 ? 'slideUp' : 'zoomThrough';

  return (
    <SceneShell duration={duration} enter={enter} zoom={[1.06, 1.0]} driftX={idx % 2 ? 40 : -40} driftY={-30}>
      <Parallax depth={0.3}>
        <LightStreaks every={80} count={2} angle={idx % 2 ? -30 : 30} />
      </Parallax>

      {/* giant outlined index number */}
      <Parallax depth={0.25}>
        <div
          style={{
            position: 'absolute',
            top: 120,
            left: idx % 2 ? 40 : 520,
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 900,
            fontSize: 520,
            lineHeight: 1,
            color: 'transparent',
            WebkitTextStroke: '3px rgba(230,195,92,0.35)',
            opacity: numS,
            transform: `translateY(${(1 - numS) * 200}px)`,
          }}
        >
          <Ltr>{def.n}</Ltr>
        </div>
      </Parallax>

      {/* progress dots 1–5 */}
      <Center y={200}>
        <div dir="rtl" style={{display: 'flex', gap: 16}}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{width: i === idx ? 64 : 18, height: 18, borderRadius: 9, background: i <= idx ? GOLD_GRADIENT : 'rgba(255,255,255,0.2)', boxShadow: i === idx ? '0 0 20px rgba(255,210,110,0.7)' : undefined}} />
          ))}
        </div>
      </Center>

      <Parallax depth={0.8}>
        <Center y={480}>
          <Medallion name={def.icon} size={340} delay={2} />
        </Center>
      </Parallax>
      <ShockRing at={8} y={480} max={900} />

      <Parallax depth={1}>
        <Center y={820}>
          <KineticWords text={def.title} gold={[def.title]} start={v.start} stagger={4} size={def.title.length > 18 ? 84 : 100} font={FONT_DISPLAY} weight={700} mode="drop" />
        </Center>
      </Parallax>

      <Parallax depth={1.25}>
        <Center y={1200}>
          <div style={{transform: `translateY(${wave(f, 140, 6)}px)`}}>
            <def.Visual f={f} t={t} />
          </div>
        </Center>
      </Parallax>
    </SceneShell>
  );
};

