import React from 'react';
import { useGlobals, useStorybookApi } from '@storybook/manager-api';
import versions from '../../versions.json';

interface Version {
  id: string;
  title: string;
  url?: string;
}

const VERSIONS: Version[] = [
  { id: 'current', title: 'Select Version' },
  ...versions,
];

export default function VersionSwitcher() {
  const [globals, updateGlobals] = useGlobals();
  const api = useStorybookApi();

  const handleVersionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVersion = VERSIONS.find((v) => v.id === event.target.value);

    if (selectedVersion?.url) {
      window.location.href = `${window.location.origin}${selectedVersion.url}`;
    } else {
      updateGlobals({ version: selectedVersion?.id });
    }
  };

  return (
    <div className="version-switcher">
      <select
        value={globals.version || 'current'}
        onChange={handleVersionChange}
        style={{
          margin: '0 15px',
          padding: '5px 10px',
          borderRadius: '4px',
          border: '1px solid #ccc',
        }}
      >
        {VERSIONS.map((version) => (
          <option key={version.id} value={version.id}>
            {version.title}
          </option>
        ))}
      </select>
    </div>
  );
}
