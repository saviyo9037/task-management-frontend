import { X, Check, Monitor, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const themeIcons = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

const ThemeModal = ({ isOpen, onClose }) => {
  const { theme: activeTheme, setTheme, themes } = useTheme();

  if (!isOpen) return null;

  const handleSelect = (id) => {
    setTheme(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative z-10 w-full bg-card-t rounded-t-2xl shadow-2xl sm:max-w-lg sm:rounded-2xl"
        style={{
          backgroundColor: 'hsl(var(--bg-card))',
          border: '1px solid hsl(var(--border))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Drag handle */}
        <div
          className="mx-auto mt-3 h-1 w-12 rounded-full sm:hidden"
          style={{ backgroundColor: 'hsl(var(--border))' }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid hsl(var(--border))' }}
        >
          <div>
            <h3 className="text-base font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
              Appearance
            </h3>
            <p className="mt-0.5 text-xs" style={{ color: 'hsl(var(--text-secondary))' }}>
              Choose a theme for your workspace
            </p>
          </div>
          <button
            onClick={onClose}
            className="tap-target flex h-8 w-8 items-center justify-center rounded-xl transition hover:opacity-70"
            style={{ backgroundColor: 'hsl(var(--bg-muted))', color: 'hsl(var(--text-secondary))' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Theme Grid */}
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            {themes.map((t) => {
              const isActive = activeTheme === t.id;
              const Icon = themeIcons[t.id];

              return (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className="relative flex flex-col items-center gap-2 rounded-2xl p-3 text-center transition-all active:scale-95"
                  style={{
                    backgroundColor: isActive ? 'hsl(var(--accent-muted))' : 'hsl(var(--bg-muted))',
                    border: isActive
                      ? '2px solid hsl(var(--accent))'
                      : '2px solid transparent',
                  }}
                >
                  {/* Color preview swatch */}
                  <div className="relative h-14 w-full overflow-hidden rounded-xl shadow-sm">
                    {/* Background */}
                    <div className="absolute inset-0" style={{ backgroundColor: t.preview[0] }} />
                    {/* Sidebar strip */}
                    <div
                      className="absolute left-0 top-0 h-full w-[30%]"
                      style={{ backgroundColor: t.preview[1] }}
                    />
                    {/* Accent dot */}
                    <div
                      className="absolute bottom-2 right-2 h-4 w-4 rounded-full shadow-sm"
                      style={{ backgroundColor: t.preview[2] }}
                    />
                    {/* Card mock */}
                    <div
                      className="absolute right-1.5 top-1.5 h-5 w-9 rounded-md"
                      style={{ backgroundColor: t.id === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)' }}
                    />
                  </div>

                  {/* Name + icon */}
                  <div className="flex items-center gap-1">
                    {Icon && <Icon className="h-3 w-3 shrink-0" style={{ color: 'hsl(var(--text-secondary))' }} />}
                    <span
                      className="text-xs font-medium leading-tight"
                      style={{ color: 'hsl(var(--text-primary))' }}
                    >
                      {t.name}
                    </span>
                  </div>

                  {/* Active checkmark */}
                  {isActive && (
                    <div
                      className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'hsl(var(--accent))' }}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Current theme label */}
          <p
            className="mt-4 text-center text-xs"
            style={{ color: 'hsl(var(--text-secondary))' }}
          >
            Active: <span className="font-semibold" style={{ color: 'hsl(var(--accent))' }}>
              {themes.find((t) => t.id === activeTheme)?.name || activeTheme}
            </span>
          </p>

          {/* Done button */}
          <button
            onClick={onClose}
            className="btn-primary mt-4 w-full"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;
