import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const PRESETS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last7', label: 'Last 7 days' },
  { id: 'last15', label: 'Last 15 days' },
  { id: 'last30', label: 'Last 30 days' },
  { id: 'thisMonth', label: 'This month' },
  { id: 'lastMonth', label: 'Last month' },
  { id: 'thisYear', label: 'This year' },
];

function getPresetRange(presetId) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (presetId) {
    case 'today':
      return { start: today, end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59) };
    case 'yesterday': {
      const start = new Date(today);
      start.setDate(today.getDate() - 1);
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59);
      return { start, end };
    }
    case 'last7': {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      return { start, end };
    }
    case 'last15': {
      const start = new Date(today);
      start.setDate(today.getDate() - 14);
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      return { start, end };
    }
    case 'last30': {
      const start = new Date(today);
      start.setDate(today.getDate() - 29);
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      return { start, end };
    }
    case 'thisMonth': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
      return { start, end };
    }
    case 'lastMonth': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
      return { start, end };
    }
    case 'thisYear': {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
      return { start, end };
    }
    default:
      return { start: today, end: today };
  }
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  const a = new Date(d1);
  const b = new Date(d2);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetween(target, start, end) {
  if (!target || !start || !end) return false;
  const t = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return t >= Math.min(s, e) && t <= Math.max(s, e);
}

export default function DateRangePicker({
  startDate,
  endDate,
  onApply,
  align = 'left',
}) {
  const initialRange = getPresetRange('last30');
  const [selectedStart, setSelectedStart] = useState(startDate ? new Date(startDate) : initialRange.start);
  const [selectedEnd, setSelectedEnd] = useState(endDate ? new Date(endDate) : initialRange.end);
  const [hoverDate, setHoverDate] = useState(null);
  const [activePreset, setActivePreset] = useState('last30');
  const [isOpen, setIsOpen] = useState(false);

  // Month navigation: viewMonth points to the Left month
  const [viewMonth, setViewMonth] = useState(() => {
    const s = startDate ? new Date(startDate) : initialRange.start;
    return new Date(s.getFullYear(), s.getMonth(), 1);
  });

  const popoverRef = useRef(null);

  // Sync state if props change externally
  useEffect(() => {
    if (startDate) setSelectedStart(new Date(startDate));
    if (endDate) setSelectedEnd(new Date(endDate));
  }, [startDate, endDate]);

  // Click outside to close popover
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePresetClick = (presetId) => {
    setActivePreset(presetId);
    const range = getPresetRange(presetId);
    setSelectedStart(range.start);
    setSelectedEnd(range.end);
    setViewMonth(new Date(range.start.getFullYear(), range.start.getMonth(), 1));
  };

  const handleDateClick = (date) => {
    setActivePreset('custom');
    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Start a new selection
      setSelectedStart(date);
      setSelectedEnd(null);
    } else {
      // Completing the selection
      if (date < selectedStart) {
        setSelectedEnd(new Date(selectedStart.getFullYear(), selectedStart.getMonth(), selectedStart.getDate(), 23, 59, 59));
        setSelectedStart(date);
      } else {
        setSelectedEnd(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59));
      }
    }
  };

  const handlePrevMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  };

  const handleApply = () => {
    const finalStart = selectedStart || new Date();
    const finalEnd = selectedEnd || selectedStart || new Date();
    if (onApply) {
      onApply({
        startDate: finalStart,
        endDate: finalEnd,
        presetId: activePreset,
        formattedString: `${formatDate(finalStart)} - ${formatDate(finalEnd)}`
      });
    }
    setIsOpen(false);
  };

  const rightViewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);

  const leftMonthName = viewMonth.toLocaleString('default', { month: 'short', year: 'numeric' });
  const rightMonthName = rightViewMonth.toLocaleString('default', { month: 'short', year: 'numeric' });

  return (
    <div ref={popoverRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger Button matching Winveel theme */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.45rem 0.85rem',
          borderRadius: '6px',
          background: '#FAF6F0',
          border: isOpen ? '1.5px solid #1A1918' : '1px solid #E2D7C5',
          color: '#1A1918',
          fontSize: '0.83rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 2px rgba(26, 25, 24, 0.15)' : 'none',
          transition: 'all 0.15s ease'
        }}
      >
        <span>{`${formatDate(selectedStart)} - ${formatDate(selectedEnd || selectedStart)}`}</span>
        <CalendarIcon size={16} color="#1A1918" />
      </button>

      {/* Popover Dropdown Modal */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            [align]: 0,
            zIndex: 1000,
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2D7C5',
            width: '620px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Content Area: Left Presets + Right Dual Calendars */}
          <div style={{ display: 'flex', flex: 1, minHeight: '330px' }}>
            {/* Left Presets Menu */}
            <div
              style={{
                width: '145px',
                padding: '0.85rem 0.65rem',
                borderRight: '1px solid #E2D7C5',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                background: '#FAF6F0'
              }}
            >
              {PRESETS.map((p) => {
                const isActive = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePresetClick(p.id)}
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#FFFFFF' : '#44403C',
                      backgroundColor: isActive ? '#1A1918' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Right Dual Month Calendars */}
            <div style={{ flex: 1, padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column' }}>
              {/* Header Month Nav */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#1A1918', display: 'flex', alignItems: 'center' }}
                >
                  <ChevronLeft size={18} />
                </button>

                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', fontWeight: 700, fontSize: '0.88rem', color: '#1A1918' }}>
                  <span>{leftMonthName}</span>
                  <span>{rightMonthName}</span>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#1A1918', display: 'flex', alignItems: 'center' }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Dual Calendars Container */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', flex: 1 }}>
                <SingleMonthGrid
                  monthDate={viewMonth}
                  selectedStart={selectedStart}
                  selectedEnd={selectedEnd}
                  hoverDate={hoverDate}
                  onDateClick={handleDateClick}
                  onDateHover={setHoverDate}
                />
                <SingleMonthGrid
                  monthDate={rightViewMonth}
                  selectedStart={selectedStart}
                  selectedEnd={selectedEnd}
                  hoverDate={hoverDate}
                  onDateClick={handleDateClick}
                  onDateHover={setHoverDate}
                />
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div
            style={{
              padding: '0.75rem 1.25rem',
              borderTop: '1px solid #E2D7C5',
              background: '#FAF6F0',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between'
            }}
          >
            <span style={{ fontSize: '0.82rem', color: '#78716C', fontWeight: 500 }}>
              {`${formatDate(selectedStart)} - ${formatDate(selectedEnd || selectedStart)}`}
            </span>
            <button
              type="button"
              onClick={handleApply}
              style={{
                padding: '0.45rem 1.35rem',
                borderRadius: '6px',
                background: '#1A1918',
                color: '#FFFFFF',
                fontSize: '0.83rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'background 0.15s ease'
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SingleMonthGrid({
  monthDate,
  selectedStart,
  selectedEnd,
  hoverDate,
  onDateClick,
  onDateHover,
}) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const days = [];
  // Padding previous month
  const prevMonthTotalDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthTotalDays - i),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // Next month padding to complete 42 cells (6 rows * 7 days)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  const effectiveEnd = selectedEnd || hoverDate;

  return (
    <div>
      {/* Weekday Labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '0.35rem' }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} style={{ fontSize: '0.72rem', fontWeight: 600, color: '#78716C' }}>
            {d}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px 0' }}>
        {days.map((item, idx) => {
          const { date, isCurrentMonth } = item;
          const isStart = isSameDay(date, selectedStart);
          const isEnd = isSameDay(date, selectedEnd);
          const inRange = selectedStart && effectiveEnd && isBetween(date, selectedStart, effectiveEnd);

          let bg = 'transparent';
          let color = isCurrentMonth ? '#1A1918' : '#A8A29E';
          let borderRadius = '50%';
          let fontWeight = 400;

          if (isStart || isEnd) {
            bg = '#1A1918';
            color = '#FFFFFF';
            fontWeight = 700;
          } else if (inRange && isCurrentMonth) {
            bg = '#F5EDE2';
            color = '#1A1918';
            borderRadius = '0';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onDateClick(date)}
              onMouseEnter={() => onDateHover(date)}
              style={{
                width: '30px',
                height: '30px',
                margin: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight,
                color,
                backgroundColor: bg,
                borderRadius,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.1s ease',
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
