
/**
 * Хук для уніфікованих обробників input
 * @param {object} form - стан форми
 * @param {function} setForm - функція для оновлення стану форми
 * @param {function} setErrors - функція для оновлення помилок
 * @param {function} [setSuccess] - опційно, для сторінки реєстрації
 */
export function useFormHandlers(form, setForm, setErrors, setSuccess) {
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...setErrors, [e.target.name]: "" });
    if (setSuccess) setSuccess(""); // очищаємо повідомлення успіху
  };

  const handleFocus = (e) => {
    setErrors({ ...setErrors, [e.target.name]: "" });
  };

  return { handleChange, handleFocus };
}
