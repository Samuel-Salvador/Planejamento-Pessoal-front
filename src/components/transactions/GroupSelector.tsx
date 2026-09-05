import React from 'react';
import { Select } from '../common/Select';
import { FolderKanban } from 'lucide-react';

interface GroupSelectorProps {
  groups: string[];
  selectedGroup: string;
  onSelectGroup: (group: string) => void;
}

export const GroupSelector: React.FC<GroupSelectorProps> = ({
  groups,
  selectedGroup,
  onSelectGroup,
}) => {
  // Garante que "Dia a dia" está nas opções
  const allGroups = Array.from(new Set(['Dia a dia', ...(groups || [])]));

  return (
    <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800/80 px-4 py-2.5 rounded-2xl shadow-md">
      <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
        <FolderKanban className="w-4 h-4 text-emerald-400" />
        <span>Grupo:</span>
      </div>
      <Select
        value={selectedGroup}
        onChange={(e) => onSelectGroup(e.target.value)}
        className="py-1.5 px-3 text-xs sm:text-sm bg-slate-950 border-slate-700 min-w-[140px]"
      >
        {allGroups.map((grp) => (
          <option key={grp} value={grp}>
            {grp}
          </option>
        ))}
      </Select>
    </div>
  );
};
