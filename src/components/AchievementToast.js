import PropTypes from "prop-types";
import styles from "./AchievementToast.module.css";

/**
 * Глобальний toast для відображення досягнень.
 * @component
 * @param {object} props
 * @param {string} props.title - Заголовок повідомлення.
 * @param {string} props.subtitle - Підзаголовок повідомлення.
 * @param {string} props.emoji - Емодзі поруч із текстом.
 * @returns {JSX.Element}
 */
function AchievementToast({ title, subtitle, emoji }) {
  return (
    <div className={styles.toast}>
      <span className={styles.emoji}>{emoji}</span>
      <div>
        <p className={styles.title}>{title}</p>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </div>
  );
}

AchievementToast.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  emoji: PropTypes.string.isRequired,
};

export default AchievementToast;
