import React, { useEffect } from 'react';
import { useGlobals } from '@storybook/manager-api';
import versions from '../../versions.json';

interface Version {
  id: string;
  title: string;
  url?: string;
}

const VERSIONS: Version[] = [
  { id: 'latest', title: 'Latest Version' },
  ...versions.reverse(),
];

export default function VersionSwitcher() {
  const [globals, updateGlobals] = useGlobals();

  useEffect(() => {
    const pathSegments = window.location.pathname.split('/');
    const currentVersion = pathSegments[1];

    if (VERSIONS.some((version) => version.id === currentVersion)) {
      updateGlobals({ version: currentVersion });
    }
  }, []);

  const handleVersionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVersion = VERSIONS.find((v) => v.id === event.target.value);

    if (selectedVersion?.url) {
      window.location.href = `${window.location.origin}${selectedVersion.url}`;
    } else {
      window.location.href = `${window.location.origin}`;
      updateGlobals({ version: selectedVersion?.id });
    }
  };

  return (
    <div className="version-switcher">
      <select
        value={globals.version || 'latest'}
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
