interface ViewSwitcherProps {
  currentView: 'cards' | 'table';
  onViewChange: (view: 'cards' | 'table') => void;
}

export default function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="flex gap-2 bg-white/10 backdrop-blur rounded-lg p-1">
      <button
        onClick={() => onViewChange('cards')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
          currentView === 'cards'
            ? 'bg-white text-blue-600 shadow'
            : 'text-white hover:bg-white/20'
        }`}
      >
        <span>📱</span>
        <span>Cards</span>
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
          currentView === 'table'
            ? 'bg-white text-blue-600 shadow'
            : 'text-white hover:bg-white/20'
        }`}
      >
        <span>📊</span>
        <span>Table</span>
      </button>
    </div>
  );
}
