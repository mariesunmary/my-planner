import PropTypes from "prop-types";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./AppDatePicker.css";

/**
 * Кастомний date picker у стилі додатку.
 * @component
 * @param {object} props
 * @param {string} props.value - Дата у форматі YYYY-MM-DD.
 * @param {Function} props.onChange - Колбек, отримує нову дату у форматі YYYY-MM-DD.
 * @param {string} [props.className] - CSS клас для поля вводу.
 * @param {string} [props.placeholder] - Текст-підказка.
 * @returns {JSX.Element} Поле вибору дати.
 */
function AppDatePicker({ value, onChange, className, placeholder }) {
  const selected = value ? new Date(value + "T12:00:00") : null;

  const handleChange = (date) => {
    if (!date) { onChange(""); return; }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
  };

  return (
    <ReactDatePicker
      selected={selected}
      onChange={handleChange}
      dateFormat="dd-MM-yyyy"
      placeholderText={placeholder || "Select date"}
      className={className}
      calendarClassName="app-calendar"
      showPopperArrow={false}
      popperPlacement="bottom-start"
    />
  );
}

AppDatePicker.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.string,
};

AppDatePicker.defaultProps = {
  value: "",
  className: "",
  placeholder: "Select date",
};

export default AppDatePicker;
