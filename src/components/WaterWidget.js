import React, { useState, useEffect, useRef } from "react";
import styles from "./WaterWidget.module.css";

const STORAGE_KEY = "waterWidget";
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
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 *
 */
function getDailyQuote() {
  const day = new Date().getDate();
  return QUOTES[day % QUOTES.length];
}

/**
 *
 */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {return { count: 0 };}
    const data = JSON.parse(raw);
    if (data.date !== getTodayKey()) {return { count: 0 };}
    return data;
  } catch {
    return { count: 0 };
  }
}

/**
 *
 * @param count
 */
function saveData(count) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ date: getTodayKey(), count })
  );
}

/**
 *
 */
function WaterWidget() {
  const [count, setCount] = useState(() => loadData().count);
  const [hovered, setHovered] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const prevCount = useRef(count);

  useEffect(() => {
    saveData(count);
    if (prevCount.current < GOAL && count === GOAL) {
      setCelebrating(true);
      setShowToast(true);
      setTimeout(() => setCelebrating(false), 1000);
      setTimeout(() => setShowToast(false), 3800);
    }
    prevCount.current = count;
  }, [count]);

  const percent = Math.min((count / GOAL) * 100, 100);
  const done = count >= GOAL;

  /**
   *
   */
  function add() {
    setCount((c) => Math.min(c + 1, GOAL));
  }

  /**
   *
   */
  function remove() {
    setCount((c) => Math.max(c - 1, 0));
  }

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
          <span className={`${styles.icon} ${celebrating ? styles.iconBounce : ""}`}>
            💧
          </span>
          <span className={styles.title}>Water</span>
          <span className={`${styles.count} ${done ? styles.done : ""}`}>
            {count}/{GOAL}
          </span>
        </div>

        <div className={styles.track}>
          <div
            className={`${styles.fill} ${done ? styles.fillDone : ""}`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className={styles.controls}>
          <button className={styles.minus} onClick={remove} disabled={count === 0}>
            −
          </button>
          <button className={styles.plus} onClick={add} disabled={done}>
            + glass
          </button>
        </div>

        {done
          ? <p className={styles.message}>Goal reached! 🎉</p>
          : <p className={styles.quote}>{getDailyQuote()}</p>
        }
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
