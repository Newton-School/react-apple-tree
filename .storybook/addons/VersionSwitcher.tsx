import React, { useEffect } from 'react';
import { useGlobals } from '@storybook/manager-api';
import versions from '../../versions.json';

const VERSIONS: string[] = ['latest', ...versions.reverse()];

export default function VersionSwitcher() {
  const [globals, updateGlobals] = useGlobals();

  const pathSegments = window.location.pathname.split('/');
  const currentVersion = pathSegments[2];

  useEffect(() => {
    if (VERSIONS.some((version) => version === currentVersion)) {
      updateGlobals({ version: currentVersion });
    }
  }, []);

  const handleVersionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVersion = VERSIONS.find((v) => v === event.target.value);
    window.location.href = `${window.location.origin}/docs/${selectedVersion}`;
  };

  return (
    <div className="version-switcher">
      <select
        value={currentVersion || 'latest'}
        onChange={handleVersionChange}
        style={{
          margin: '0 15px',
          padding: '5px 10px',
          borderRadius: '4px',
          border: '1px solid #ccc',
        }}
      >
        {VERSIONS.map((version) => (
          <option key={version} value={version}>
            {version}
          </option>
        ))}
      </select>
    </div>
  );
}
