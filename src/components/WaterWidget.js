import React, { useState, useEffect, useRef } from "react";
import styles from "./WaterWidget.module.css";
import api from "../services/api";

const GOAL = 8;

const QUOTES = [
  "Water is the driving force of all nature.",
  "Drink water. Your body is 60% you.",
  "Stay hydrated — your brain is 75% water.",
  "A glass of water a day keeps the brain fog away.",
  "Hydration is the simplest form of self-care.",
  "Water fuels focus, energy, and clarity.",
  "Your body asked for water. Don't keep it waiting.",
];

const TOOLTIP =
  "Even mild dehydration (1–2%) impairs concentration, mood, and short-term memory. Drinking 8 glasses a day supports digestion, skin health, and energy levels.";

/**
 *
 */
function getDailyQuote() {
  return QUOTES[new Date().getDate() % QUOTES.length];
}

/**
 *
 */
function WaterWidget() {
  const [count, setCount] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const prevCount = useRef(0);

  useEffect(() => {
    api.get("/water/today").then((res) => {
      setCount(res.data.count);
      prevCount.current = res.data.count;
    }).catch(() => {});
  }, []);

  const updateCount = async (newCount) => {
    if (prevCount.current < GOAL && newCount === GOAL) {
      setCelebrating(true);
      setShowToast(true);
      setTimeout(() => setCelebrating(false), 1000);
      setTimeout(() => setShowToast(false), 3800);
    }
    prevCount.current = newCount;
    setCount(newCount);
    await api.put("/water/today", { count: newCount });
  };

  const percent = Math.min((count / GOAL) * 100, 100);
  const done = count >= GOAL;

  const add = () => { if (!done) {updateCount(count + 1);} };
  const remove = () => { if (count > 0) {updateCount(count - 1);} };

  return (
    <>
      <div
        className={`${styles.widget} ${celebrating ? styles.celebrating : ""}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && (
          <div className={styles.tooltip}>
            <p className={styles.tooltipText}>{TOOLTIP}</p>
          </div>
        )}

        <div className={styles.header}>
          <span className={`${styles.icon} ${celebrating ? styles.iconBounce : ""}`}>💧</span>
          <span className={styles.title}>Water</span>
          <span className={`${styles.count} ${done ? styles.done : ""}`}>{count}/{GOAL}</span>
        </div>

        <div className={styles.track}>
          <div className={`${styles.fill} ${done ? styles.fillDone : ""}`} style={{ width: `${percent}%` }} />
        </div>

        <div className={styles.controls}>
          <button className={styles.minus} onClick={remove} disabled={count === 0}>−</button>
          <button className={styles.plus} onClick={add} disabled={done}>+ glass</button>
        </div>

        {done ? <p className={styles.message}>Goal reached! 🎉</p> : <p className={styles.quote}>{getDailyQuote()}</p>}
      </div>

      {showToast && (
        <div className={styles.toast}>
          <span className={styles.toastEmoji}>🎉</span>
          <div>
            <p className={styles.toastTitle}>Daily goal reached!</p>
            <p className={styles.toastSub}>8 glasses done. Your body thanks you 💧</p>
          </div>
        </div>
      )}
    </>
  );
}

export default WaterWidget;
