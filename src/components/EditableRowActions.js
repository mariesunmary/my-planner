/**
 * Відповідає за відображення кнопок дій для редагованих рядків (наприклад, у таблицях або списках).
 * Залежно від стану `isEditing`, показує або кнопки "Зберегти/Скасувати", або "Редагувати/Видалити".
 *
 * @param {boolean} isEditing - режим редагування
 * @param {function} onSave - дія при збереженні
 * @param {function} onCancel - дія при скасуванні
 * @param {function} onEdit - дія при редагуванні
 * @param {function} onDelete - дія при видаленні
 * @param {string} [saveTitle="Save"] - підказка для кнопки збереження
 * @param {string} [cancelTitle="Cancel"] - підказка для кнопки скасування
 * @param {string} [editTitle="Edit"] - підказка для кнопки редагування
 * @param {string} [deleteTitle="Delete"] - підказка для кнопки видалення
 */

import React from "react";
import PropTypes from "prop-types";
import common from "../styles/Common.module.css";

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
