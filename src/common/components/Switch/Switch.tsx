import React from 'react';
import styles from './Switch.module.scss';

interface SwitchProps {
  id: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ id, checked, onChange, label }) => {
  return (
    <div className={styles.switchGroup}>
      {label && <label htmlFor={id}>{label}</label>}
      <label className={styles.switch}>
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
        />
        <span className={styles.slider}></span>
      </label>
    </div>
  );
};
