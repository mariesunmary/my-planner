import React from 'react';
import { getUiText, getLocalizedErrorMessage } from '../utils/i18n';

// A styled, user-friendly error page without exposing technical details
const ErrorFallback = ({ error }) => {
  const errorId = error?.errorId || 'UNKNOWN';
  const customMessageCode = error?.code || 'GENERIC_ERROR';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>⚠️ {getUiText('errorBoundaryTitle')}</h1>
        <p style={styles.description}>{getUiText('errorBoundaryDesc')}</p>
        
        <div style={styles.messageBox}>
          <p style={styles.localizedMessage}>{getLocalizedErrorMessage(customMessageCode)}</p>
        </div>

        <div style={styles.idBox}>
          <strong>{getUiText('errorIdLabel')}</strong> <span style={styles.errorId}>{errorId}</span>
        </div>

        <div style={styles.buttons}>
          <button style={styles.primaryBtn} onClick={() => window.location.reload()}>
            {getUiText('reloadButton')}
          </button>
          <button style={styles.secondaryBtn} onClick={() => alert(`Reporting error ID: ${errorId}...`)}>
            {getUiText('reportButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    fontFamily: '"Inter", sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    textAlign: 'center',
  },
  title: {
    color: '#e03131',
    marginTop: 0,
  },
  description: {
    color: '#495057',
    fontSize: '16px',
    lineHeight: '1.5',
  },
  messageBox: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#ffe3e3',
    borderRadius: '8px',
    borderLeft: '4px solid #e03131',
  },
  localizedMessage: {
    margin: 0,
    color: '#c92a2a',
    fontWeight: '500',
  },
  idBox: {
    marginTop: '25px',
    fontSize: '14px',
    color: '#868e96',
  },
  errorId: {
    fontFamily: 'monospace',
    backgroundColor: '#f1f3f5',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#343a40',
  },
  buttons: {
    marginTop: '30px',
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
  },
  primaryBtn: {
    padding: '10px 20px',
    backgroundColor: '#339af0',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.2s',
  },
  secondaryBtn: {
    padding: '10px 20px',
    backgroundColor: '#e9ecef',
    color: '#495057',
    border: '1px solid #ced4da',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  }
};

export default ErrorFallback;
