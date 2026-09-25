'use client';

import { useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform
} from 'motion/react';

import './FlipCard.css';

const SLOP = { fine: 4, coarse: 8 };
const TILT_SPRING = { stiffness: 240, damping: 24, mass: 0.6 };
const LIFT_SPRING = { stiffness: 320, damping: 26 };
const FLING = 0.16;
const HISTORY_MS = 90;

const SIMPLE_EASE = 'cubic-bezier(0.33, 1, 0.68, 1)';
// Fraction of the simple flip's duration at which SIMPLE_EASE reaches 90°, where faces swap.
const SIMPLE_EASE_HALFWAY = 0.206;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const facesViewer = deg => Math.cos((deg * Math.PI) / 180) >= 0;
const snap = deg => Math.round(deg / 180) * 180;
const isBack = deg => Math.abs(Math.round(deg / 180)) % 2 === 1;

export default function FlipCard({
  front = null,
  back = null,
  flipped,
  defaultFlipped = false,
  onFlipChange,
  axis = 'y',
  flipOnClick = true,
  draggable = true,
  dragDistance = 0,
  tilt = true,
  tiltMax = 12,
  glare = true,
  glareOpacity = 0.22,
  hoverScale = 1.03,
  perspective = 1100,
  stiffness = 170,
  damping = 20,
  width = 300,
  height = 400,
  radius = 22,
  background = '#27272a',
  color = '#f5f5f5',
  shadow = true,
  shadowColor = '#000000',
  shadowOpacity = 0.45,
  disabled = false,
  ariaLabel = 'Flip card',
  className = '',
  // Compositor-only CSS flip with no springs or pointer tracking; meant for touch devices.
  simple = false,
  flipDuration = 450
}) {
  const reduce = useReducedMotion();
  const controlled = flipped !== undefined;
  const [inner, setInner] = useState(defaultFlipped);
  const [dragging, setDragging] = useState(false);
  const shown = controlled ? flipped : inner;
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const rootRef = useRef(null);
  const grip = useRef(null);
  const spin = useRef(null);
  const target = useRef(shown ? 180 : 0);
  const lastPointerFlip = useRef(-Infinity);

  const turn = useMotionValue(shown ? 180 : 0);
  const tiltX = useSpring(0, TILT_SPRING);
  const tiltY = useSpring(0, TILT_SPRING);
  const lift = useSpring(1, LIFT_SPRING);
  const sheen = useSpring(0, LIFT_SPRING);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);

  const sumX = useTransform([turn, tiltX], ([t, x]) => t + x);
  const sumY = useTransform([turn, tiltY], ([t, y]) => t + y);
  const turnY = useMotionTemplate`perspective(${perspective}px) scale(${lift}) rotateX(${tiltX}deg) rotateY(${sumY}deg)`;
  const turnX = useMotionTemplate`perspective(${perspective}px) scale(${lift}) rotateY(${tiltY}deg) rotateX(${sumX}deg)`;
  // backface-visibility alone is not trusted: engines may composite a face's descendants on
  // their own layers and skip the culling, so the turned-away face also leaves the render tree.
  const angle = axis === 'x' ? sumX : sumY;
  // visibility alone does not cull filter/opacity compositor layers on iOS; opacity does.
  const frontVisibility = useTransform(angle, t => (facesViewer(t) ? 'visible' : 'hidden'));
  const backVisibility = useTransform(angle, t => (facesViewer(t) ? 'hidden' : 'visible'));
  const frontOpacity = useTransform(angle, t => (facesViewer(t) ? 1 : 0));
  const backOpacity = useTransform(angle, t => (facesViewer(t) ? 0 : 1));
  const facing = useTransform(turn, t => Math.abs(Math.cos((t * Math.PI) / 180)));
  const spread = useTransform(facing, f => 0.08 + 0.92 * f);
  const shade = useTransform(facing, f => 0.1 + 0.9 * f * f);
  const gxPct = useMotionTemplate`${gx}%`;
  const gyPct = useMotionTemplate`${gy}%`;

  const settle = (to, velocity, instant) => {
    spin.current?.stop();
    target.current = to;
    if (instant || reduce || simple) turn.jump(to);
    else spin.current = animate(turn, to, { type: 'spring', stiffness, damping, velocity, restDelta: 0.05 });
    const next = isBack(to);
    if (next === shownRef.current) return;
    shownRef.current = next;
    if (!controlled) setInner(next);
    onFlipChange?.(next);
  };
  const flip = instant => {
    const base = snap(turn.get());
    settle(isBack(base) ? base - 180 : base + 180, 0, instant);
  };
  const rest = () => {
    tiltX.set(0);
    tiltY.set(0);
    sheen.set(0);
    lift.set(1);
  };

  useEffect(() => {
    if (!controlled || isBack(target.current) === flipped) return;
    const base = target.current;
    spin.current?.stop();
    target.current = isBack(base) ? base - 180 : base + 180;
    if (reduce || simple) turn.jump(target.current);
    else spin.current = animate(turn, target.current, { type: 'spring', stiffness, damping, restDelta: 0.05 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped]);
  useEffect(() => () => spin.current?.stop(), []);
  useEffect(() => {
    if (disabled) rest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  const onPointerDown = e => {
    if (disabled || e.button !== 0 || grip.current) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    spin.current?.stop();
    grip.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      base: turn.get(),
      moved: false,
      slop: e.pointerType === 'touch' ? SLOP.coarse : SLOP.fine,
      hist: []
    };
    if (!reduce && !simple) lift.set(hoverScale);
  };
  const onPointerMove = e => {
    const g = grip.current;
    if (g && g.id === e.pointerId) {
      const d = axis === 'x' ? e.clientY - g.y : e.clientX - g.x;
      if (!g.moved) {
        if (Math.abs(d) < g.slop || !draggable || reduce) return;
        g.moved = true;
        setDragging(true);
        tiltX.set(0);
        tiltY.set(0);
        sheen.set(0);
      }
      const span = dragDistance > 0 ? dragDistance : axis === 'x' ? height : width;
      const deg = g.base + (axis === 'x' ? -1 : 1) * (d / span) * 180;
      turn.set(deg);
      const now = performance.now();
      g.hist.push({ t: now, v: deg });
      while (g.hist.length > 2 && now - g.hist[0].t > HISTORY_MS) g.hist.shift();
      return;
    }
    if (!tilt || simple || reduce || disabled || e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = clamp((e.clientX - r.left) / r.width, 0, 1);
    const py = clamp((e.clientY - r.top) / r.height, 0, 1);
    tiltX.set((0.5 - py) * 2 * tiltMax);
    tiltY.set((px - 0.5) * 2 * tiltMax);
    gx.set(px * 100);
    gy.set(py * 100);
    sheen.set(1);
  };
  const release = (e, cancelled) => {
    const g = grip.current;
    if (!g || g.id !== e.pointerId) return;
    grip.current = null;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setDragging(false);
    if (e.pointerType === 'touch' || !rootRef.current?.matches(':hover')) rest();
    if (!g.moved) {
      if (!cancelled && flipOnClick) {
        lastPointerFlip.current = performance.now();
        flip(false);
      }
      else settle(target.current, 0, false);
      return;
    }
    const here = turn.get();
    let velocity = 0;
    const a = g.hist[0];
    const b = g.hist[g.hist.length - 1];
    if (!cancelled && a && b && b.t > a.t && performance.now() - b.t < 60)
      velocity = ((b.v - a.v) / (b.t - a.t)) * 1000;
    const to = cancelled ? snap(g.base) : clamp(snap(here + velocity * FLING), snap(here) - 180, snap(here) + 180);
    settle(to, velocity, false);
  };
  const onKeyDown = e => {
    if (disabled || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    if (!e.repeat) flip(true);
  };
  const onClick = e => {
    // detail 0 means a keyboard click; ignore one that trails a pointer flip or the card flips twice.
    if (!disabled && e.detail === 0 && performance.now() - lastPointerFlip.current > 400) flip(true);
  };

  const rotorStyle = {
    transform: axis === 'x' ? turnX : turnY,
    '--fc-gx': gxPct,
    '--fc-gy': gyPct,
    '--fc-sheen': sheen
  };
  // motion.div owns `transform`, so the CSS-transition flip lives on a plain inner element.
  const simpleStyle = simple && !reduce
    ? {
        transform: `perspective(${perspective}px) rotate${axis === 'x' ? 'X' : 'Y'}(${target.current}deg)`,
        transition: `transform ${flipDuration}ms ${SIMPLE_EASE}`,
        willChange: 'transform'
      }
    : undefined;
  const swapMs = Math.round(flipDuration * SIMPLE_EASE_HALFWAY);
  const frontStyle = reduce || simple ? undefined : { visibility: frontVisibility, opacity: frontOpacity };
  const backStyle = reduce || simple ? undefined : { visibility: backVisibility, opacity: backOpacity };
  const Face = reduce || simple ? 'div' : motion.div;

  return (
    <div
      ref={rootRef}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={shown}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={`flip-card${className ? ` ${className}` : ''}`}
      data-axis={axis}
      data-draggable={draggable && !disabled && !reduce ? '' : undefined}
      data-dragging={dragging ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      data-simple={simple && !reduce ? '' : undefined}
      data-fade={reduce ? (shown ? 'back' : 'front') : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={e => release(e, false)}
      onPointerCancel={e => release(e, true)}
      onLostPointerCapture={e => release(e, true)}
      onPointerEnter={e => {
        if (!reduce && !simple && !disabled && e.pointerType !== 'touch') lift.set(hoverScale);
      }}
      onPointerLeave={() => {
        if (!grip.current) rest();
      }}
      onKeyDown={onKeyDown}
      onClick={onClick}
      onDragStart={e => e.preventDefault()}
      style={{
        '--fc-w': `${width}px`,
        '--fc-h': `${height}px`,
        '--fc-radius': `${radius}px`,
        '--fc-bg': background,
        '--fc-ink': color,
        '--fc-shadow': shadowColor,
        '--fc-shadow-o': shadowOpacity,
        '--fc-glare': glareOpacity,
        '--fc-swap': `${swapMs}ms`
      }}
    >
      {shadow ? (
        <motion.span
          className="flip-card__shadow"
          aria-hidden="true"
          style={axis === 'x' ? { scaleY: spread, opacity: shade } : { scaleX: spread, opacity: shade }}
        />
      ) : null}
      <motion.div className="flip-card__rotor" style={reduce || simple ? undefined : rotorStyle}>
        <div className="flip-card__rotor" style={simpleStyle}>
          <Face
            className="flip-card__face flip-card__face--front"
            style={frontStyle}
            aria-hidden={shown}
            inert={shown ? '' : undefined}
          >
            <div className="flip-card__clip">
              {front}
              {glare ? <span className="flip-card__glare" aria-hidden="true" /> : null}
            </div>
          </Face>
          <Face
            className="flip-card__face flip-card__face--back"
            style={backStyle}
            aria-hidden={!shown}
            inert={!shown ? '' : undefined}
          >
            <div className="flip-card__clip">
              {back}
              {glare ? <span className="flip-card__glare" aria-hidden="true" /> : null}
            </div>
          </Face>
        </div>
      </motion.div>
    </div>
  );
}
