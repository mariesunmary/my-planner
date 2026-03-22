

import React from "react";
import PropTypes from "prop-types";
import common from "../styles/Common.module.css";

/**
 * Компонент для відображення кнопок дій для редагованих рядків (наприклад, у таблицях або списках).
 * Залежно від стану `isEditing`, показує або кнопки "Зберегти/Скасувати", або "Редагувати/Видалити".
 * @component
 * @param {object} props - Властивості компонента.
 * @param {boolean} props.isEditing - Режим редагування (якщо true, показує "Зберегти/Скасувати").
 * @param {Function} props.onSave - Функція-обробник дії збереження.
 * @param {Function} props.onCancel - Функція-обробник дії скасування.
 * @param {Function} props.onEdit - Функція-обробник дії редагування.
 * @param {Function} props.onDelete - Функція-обробник дії видалення.
 * @param {string} [props.saveTitle] - Текст-підказка для кнопки збереження.
 * @param {string} [props.cancelTitle] - Текст-підказка для кнопки скасування.
 * @param {string} [props.editTitle] - Текст-підказка для кнопки редагування.
 * @param {string} [props.deleteTitle] - Текст-підказка для кнопки видалення.
 * @returns {JSX.Element} Блок кнопок управління рядком.
 */
function EditableRowActions({
  isEditing,
  onSave,
  onCancel,
  onEdit,
  onDelete,
  saveTitle = "Save",
  cancelTitle = "Cancel",
  editTitle = "Edit",
  deleteTitle = "Delete",
}) {
  return (
    <div>
      {isEditing ? (
        <>
          <button onClick={onSave} className={common.actionButton} title={saveTitle}>
            ✓︎
          </button>
          <button onClick={onCancel} className={common.actionButton} title={cancelTitle}>
            ✕
          </button>
        </>
      ) : (
        <>
          <button onClick={onEdit} className={common.actionButton} title={editTitle}>
            ✎
          </button>
          <button onClick={onDelete} className={common.deleteButton} title={deleteTitle}>
            ✕
          </button>
        </>
      )}
    </div>
  );
}

EditableRowActions.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  saveTitle: PropTypes.string,
  cancelTitle: PropTypes.string,
  editTitle: PropTypes.string,
  deleteTitle: PropTypes.string,
};

export default EditableRowActions;
