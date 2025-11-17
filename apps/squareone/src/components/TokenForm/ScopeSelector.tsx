import React from 'react';
import { Checkbox, CheckboxGroup } from '@lsst-sqre/squared';
import styles from './ScopeSelector.module.css';

export type Scope = {
  name: string;
  description: string;
};

export type ScopeSelectorProps = {
  scopes: Scope[];
  selectedScopes: string[];
  onChange: (scopes: string[]) => void;
  disabled?: boolean;
  name: string;
};

export default function ScopeSelector({
  scopes,
  selectedScopes,
  onChange,
  disabled,
  name,
}: ScopeSelectorProps) {
  const handleScopeChange = (scopeName: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedScopes, scopeName]);
    } else {
      onChange(selectedScopes.filter((s) => s !== scopeName));
    }
  };

  return (
    <div className={styles.container}>
      <CheckboxGroup
        legend="Token scopes"
        description="Select the permissions this token should have."
        required
      >
        <div className={styles.scopeGrid}>
          {scopes.map((scope) => (
            <Checkbox
              key={scope.name}
              name={`${name}[]`}
              value={scope.name}
              label={scope.name}
              description={scope.description}
              checked={selectedScopes.includes(scope.name)}
              onCheckedChange={(checked) =>
                handleScopeChange(scope.name, checked === true)
              }
              disabled={disabled}
            />
          ))}
        </div>
      </CheckboxGroup>
    </div>
  );
}
