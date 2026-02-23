'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type CalendarProps = {
  companySlug: string;
  onSelectLead: (lead: any) => void;
  statusOptions: any[]; // Add this
};

type CalendarEvent = {
  id: number;
  name: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  job_status: string;
  assigned_to: string;
  category: string;
  phone: string;
  email: string;
};

export default function Calendar({ companySlug, onSelectLead, statusOptions }: CalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'list'>('month');

    // Add default statuses if none provided
  const DEFAULT_STATUSES = [
    { value: 'new', label: 'New', color: 'blue', emoji: '🆕' },
    { value: 'contacted', label: 'Contacted', color: 'yellow', emoji: '📞' },
    { value: 'quoted', label: 'Quoted', color: 'purple', emoji: '💰' },
    { value: 'in-progress', label: 'In Progress', color: 'orange', emoji: '🔨' },
    { value: 'completed', label: 'Completed', color: 'green', emoji: '✅' },
  ];

    // Use provided statusOptions or fallback to defaults
  const safeStatusOptions = statusOptions && statusOptions.length > 0 
    ? statusOptions 
    : DEFAULT_STATUSES;
  
  // Helper to get status color from statusOptions
  const getStatusColorHex = (colorName: string) => {
    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      yellow: '#eab308',
      purple: '#a855f7',
      orange: '#f97316',
      green: '#22c55e',
      red: '#ef4444',
      gray: '#6b7280',
      indigo: '#6366f1',
      pink: '#ec4899',
    };
    return colorMap[colorName] || '#3b82f6';
  };

const getStatusConfig = (statusValue: string) => {
  return safeStatusOptions.find((s: any) => s.value === statusValue) || safeStatusOptions[0];
};

  // Generate Tailwind-compatible classes from hex colors
  const getStatusClasses = (statusValue: string) => {
    const config = getStatusConfig(statusValue);
    const hex = getStatusColorHex(config.color);
    // Return inline style instead
    return hex;
  };

  useEffect(() => {
    fetchScheduledJobs();
  }, [companySlug]);

  async function fetchScheduledJobs() {
    try {
      const response = await fetch(`/api/company/${companySlug}/leads`);
      const data = await response.json();
      
      const scheduledLeads = (data.leads || []).filter((lead: any) => {
        const hasScheduledDate = lead.scheduled_date && lead.scheduled_date.trim() !== '';
        const notDeleted = !lead.deleted;
        
        return hasScheduledDate && notDeleted;
      });
      
      setEvents(scheduledLeads);
    } catch (error) {
      console.error('Failed to fetch scheduled jobs:', error);
      toast.error('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, firstDay, lastDay };
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return events.filter(event => {
      const eventDate = event.scheduled_date ? event.scheduled_date.split('T')[0] : null;
      return eventDate === dateStr;
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-4xl">📅</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
{/* Back to Leads Button */}
      <div className="mb-4">
        <a  // ✅ Has 
    href={`/${companySlug}/dashboard`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition border border-gray-300"
        >
          Back to Dashboard
        </a>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900">
            📅 {view === 'month' ? 'Monthly' : view === 'week' ? 'Weekly' : 'List'}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 sm:px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-sm text-sm sm:text-base"
          >
            Today
          </button>
        </div>

        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView('list')}
            className={`flex-1 px-3 sm:px-5 py-2 rounded-md font-semibold transition text-sm sm:text-base ${
              view === 'list' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 List
          </button>
          <button
            onClick={() => setView('week')}
            className={`flex-1 px-3 sm:px-5 py-2 rounded-md font-semibold transition text-sm sm:text-base ${
              view === 'week' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📅 Week
          </button>
          <button
            onClick={() => setView('month')}
            className={`flex-1 px-3 sm:px-5 py-2 rounded-md font-semibold transition text-sm sm:text-base ${
              view === 'month' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🗓️ Month
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={view === 'month' ? goToPreviousMonth : goToPreviousWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-xl font-bold"
        >
          ←
        </button>
        <span className="text-lg sm:text-xl font-bold text-gray-900 text-center">
          {currentDate.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric',
            ...(view === 'week' ? { day: 'numeric' } : {})
          })}
        </span>
        <button
          onClick={view === 'month' ? goToNextMonth : goToNextWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-xl font-bold"
        >
          →
        </button>
      </div>

 {/* Dynamic Legend based on statusOptions */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b-2">
        {safeStatusOptions.map((status) => (
          <div key={status.value} className="flex items-center gap-1 sm:gap-2">
                        <div 
              className="w-3 h-3 sm:w-5 sm:h-5 rounded border-2"
              style={{ 
                backgroundColor: getStatusColorHex(status.color),
                borderColor: getStatusColorHex(status.color)
              }}
            ></div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">
             {status.label}
            </span>
          </div>
        ))}
      </div>

{/* Views */}
      {view === 'list' && <ListView 
        events={events}
        formatTime={formatTime}
        onSelectLead={onSelectLead}
        getStatusColorHex={getStatusColorHex}
        getStatusConfig={getStatusConfig}
        currentDate={currentDate}
      />}

   {view === 'month' && <MonthView 
        currentDate={currentDate}
        events={events}
        getEventsForDate={getEventsForDate}
        getDaysInMonth={getDaysInMonth}
        formatTime={formatTime}
        onSelectLead={onSelectLead}
        getStatusColorHex={getStatusColorHex}
        getStatusConfig={getStatusConfig}
        onSwitchToWeek={(date) => {
          setCurrentDate(date);
          setView('week');
        }}
      />}

      {view === 'week' && <WeekView 
        currentDate={currentDate}
        events={events}
        getEventsForDate={getEventsForDate}
        getWeekDays={getWeekDays}
        formatTime={formatTime}
        onSelectLead={onSelectLead}
        getStatusColorHex={getStatusColorHex}
        getStatusConfig={getStatusConfig}
      />}
    </div>
  );
}

// List View Component
type ListViewProps = {
  currentDate: Date;
  events: CalendarEvent[];
  formatTime: (time: string) => string;
  onSelectLead: (lead: any) => void;
  getStatusColorHex: (colorName: string) => string;
  getStatusConfig: (statusValue: string) => any;
};

function ListView({ currentDate, events, formatTime, onSelectLead, getStatusColorHex, getStatusConfig }: ListViewProps) {
  const monthEvents = events.filter(event => {
    const eventDate = new Date(event.scheduled_date);
    return eventDate.getMonth() === currentDate.getMonth() && 
           eventDate.getFullYear() === currentDate.getFullYear();
  }).sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());

  if (monthEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📅</div>
        <p className="text-gray-500 text-lg">No scheduled jobs this month</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {monthEvents.map((event: CalendarEvent) => {
        const statusToUse = event.job_status || event.status || 'new';
        const statusConfig = getStatusConfig(statusToUse);
        const bgColor = getStatusColorHex(statusConfig.color);
        
        return (
          <button
            key={event.id}
            onClick={() => onSelectLead(event)}
            className="w-full text-left p-4 rounded-lg border-2 hover:shadow-md transition text-white"
            style={{ 
              backgroundColor: bgColor,
              borderColor: bgColor
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="font-bold text-base sm:text-lg mb-1">{event.name}</div>
                <div className="text-sm opacity-90">
                  📅 {new Date(event.scheduled_date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              {event.scheduled_time && (
                <div className="text-sm font-semibold opacity-90 whitespace-nowrap">
                  ⏰ {formatTime(event.scheduled_time)}
                </div>
              )}
            </div>
            {event.assigned_to && (
              <div className="text-sm opacity-90">
                👤 {event.assigned_to}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Month View Component
type MonthViewProps = {
  currentDate: Date;
  events: CalendarEvent[];
  getEventsForDate: (date: Date) => CalendarEvent[];
  getDaysInMonth: (date: Date) => { daysInMonth: number; startingDayOfWeek: number };
  formatTime: (time: string) => string;
  onSelectLead: (lead: any) => void;
  getStatusColorHex: (colorName: string) => string;
  getStatusConfig: (statusValue: string) => any;
    onSwitchToWeek: (date: Date) => void;

};

function MonthView({ currentDate, getEventsForDate, getDaysInMonth, formatTime, onSelectLead, getStatusColorHex, getStatusConfig, onSwitchToWeek }: MonthViewProps) {
  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const calendarCells = [];
  
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarCells.push({ type: 'empty', key: `empty-${i}` });
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push({ type: 'day', day, key: `day-${day}` });
  }
  
  const remainingCells = 42 - calendarCells.length;
  for (let i = 0; i < remainingCells; i++) {
    calendarCells.push({ type: 'empty', key: `empty-end-${i}` });
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {dayNames.map(day => (
          <div 
            key={day} 
            className="text-center font-bold text-xs sm:text-sm text-gray-700 py-2 bg-gray-100 rounded-lg border border-gray-200"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarCells.map((cell) => {
          if (cell.type === 'empty') {
            return (
              <div 
                key={cell.key} 
                className="aspect-square min-h-[60px] sm:min-h-[120px] bg-gray-50 rounded-lg border border-gray-200"
              />
            );
          }

          const day = cell.day!;
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const dayStr = String(date.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${dayStr}`;
          
          const dayEvents = getEventsForDate(date);
          const isToday = dateStr === today;

        return (
            <div
              key={cell.key}
              onClick={() => dayEvents.length > 0 && onSwitchToWeek(date)}
              className={`aspect-square min-h-[60px] sm:min-h-[120px] rounded-lg border-2 p-1 sm:p-2 transition-all flex flex-col sm:cursor-default ${
                isToday 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : dayEvents.length > 0
                    ? 'border-gray-300 bg-white active:bg-blue-50 active:border-blue-400 cursor-pointer'
                    : 'border-gray-300 bg-white'
              }`}
            >
              <div className={`text-sm sm:text-base font-bold mb-1 ${
                isToday ? 'text-blue-600' : 'text-gray-700'
              }`}>
                {day}
              </div>
              
              <div className="flex-1 overflow-hidden">
               {/* Mobile: tap date to jump to week view */}
<div className="sm:hidden flex flex-wrap gap-0.5">
  {dayEvents.slice(0, 6).map((event: CalendarEvent) => {
    const statusToUse = event.job_status || event.status || 'new';
    const statusConfig = getStatusConfig(statusToUse);
    const dotColor = getStatusColorHex(statusConfig.color);
    
    return (
      <div
        key={event.id}
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
    );
  })}
</div>
                
                {/* Desktop: cards */}
                <div className="hidden sm:block space-y-1">
                  {dayEvents.slice(0, 3).map((event: CalendarEvent) => {
                    const statusToUse = event.job_status || event.status || 'new';
                    const statusConfig = getStatusConfig(statusToUse);
                    const bgColor = getStatusColorHex(statusConfig.color);
                    
                    return (
                      <button
                        key={event.id}
                        onClick={() => onSelectLead(event)}
                        className="w-full text-left px-2 py-1 rounded text-xs font-medium border hover:opacity-80 hover:shadow transition text-white"
                        style={{ 
                          backgroundColor: bgColor,
                          borderColor: bgColor
                        }}
                      >
                        <div className="truncate font-semibold">{event.name}</div>
                        {event.scheduled_time && (
                          <div className="text-[10px] opacity-90 mt-0.5">
                            ⏰ {formatTime(event.scheduled_time)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                  
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 text-center pt-1 font-medium">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Week View Component - MOBILE FRIENDLY VERSION
type WeekViewProps = {
  currentDate: Date;
  events: CalendarEvent[];
  getEventsForDate: (date: Date) => CalendarEvent[];
  getWeekDays: (date: Date) => Date[];
  formatTime: (time: string) => string;
  onSelectLead: (lead: any) => void;
  getStatusColorHex: (colorName: string) => string;
  getStatusConfig: (statusValue: string) => any;
  
};

function WeekView({ currentDate, getEventsForDate, getWeekDays, formatTime, onSelectLead, getStatusColorHex, getStatusConfig }: WeekViewProps) {
  const weekDays = getWeekDays(currentDate);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Contractor hours: 7 AM to 7 PM
  const timeSlots = [];
  for (let hour = 7; hour <= 19; hour++) {
    timeSlots.push(hour);
  }

  const getEventTimeSlot = (time: string) => {
    if (!time) return null;
    const [hours] = time.split(':');
    return parseInt(hours);
  };

  return (
    <>
      {/* MOBILE VIEW - List of days with events */}
      <div className="lg:hidden space-y-4">
        {weekDays.map((date: Date, dayIndex: number) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          const isToday = dateStr === today;
          const dayEvents = getEventsForDate(date).sort((a, b) => {
            const timeA = a.scheduled_time || '00:00';
            const timeB = b.scheduled_time || '00:00';
            return timeA.localeCompare(timeB);
          });

          return (
            <div key={dayIndex} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
              {/* Day header */}
              <div className={`p-3 border-b-2 ${
                isToday ? 'bg-blue-600 border-blue-700' : 'bg-gray-100 border-gray-300'
              }`}>
                <div className={`text-sm font-medium ${isToday ? 'text-blue-100' : 'text-gray-600'}`}>
                  {date.toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
                <div className={`text-2xl font-bold ${isToday ? 'text-white' : 'text-gray-900'}`}>
                  {date.getDate()}
                </div>
              </div>

              {/* Events for this day */}
              <div className="p-3">
                {dayEvents.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No jobs scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {dayEvents.map((event: CalendarEvent) => {
                      const statusToUse = event.job_status || event.status || 'new';
                      const statusConfig = getStatusConfig(statusToUse);
                      const bgColor = getStatusColorHex(statusConfig.color);

                      return (
                        <button
                          key={event.id}
                          onClick={() => onSelectLead(event)}
                          className="w-full text-left p-3 rounded-lg border-2 text-white hover:shadow-md transition-all"
                          style={{ 
                            backgroundColor: bgColor,
                            borderColor: bgColor
                          }}
                        >
                          <div className="font-bold text-base mb-1">{event.name}</div>
                          <div className="text-sm opacity-90">
                            ⏰ {formatTime(event.scheduled_time)}
                          </div>
                          {event.assigned_to && (
                            <div className="text-sm opacity-90 mt-1">
                              👤 {event.assigned_to}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP VIEW - Grid with time slots */}
      <div className="hidden lg:block bg-white rounded-lg border border-gray-300 overflow-hidden">
        {/* Week header */}
        <div className="grid border-b-2 border-gray-300 bg-gray-50" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
          <div className="p-2 text-center text-xs font-bold text-gray-600 border-r border-gray-300">
            Time
          </div>
          {weekDays.map((date: Date, i: number) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const isToday = dateStr === today;

            return (
              <div 
                key={i} 
                className={`p-2 text-center border-r border-gray-300 last:border-r-0 ${
                  isToday ? 'bg-blue-100' : ''
                }`}
              >
                <div className="text-xs font-medium text-gray-600">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-base font-bold ${
                  isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time slots grid */}
        <div>
          {timeSlots.map((hour) => (
            <div 
              key={hour} 
              className="grid border-b border-gray-200" 
              style={{ 
                gridTemplateColumns: '60px repeat(7, 1fr)',
                minHeight: '50px' 
              }}
            >
              {/* Time label */}
              <div className="p-1 text-xs font-semibold text-gray-600 border-r border-gray-300 bg-gray-50 flex items-start justify-center">
                {hour % 12 || 12}{hour < 12 ? 'a' : 'p'}
              </div>

              {/* Day columns */}
              {weekDays.map((date: Date, dayIndex: number) => {
                const dayEvents = getEventsForDate(date);
                const hourEvents = dayEvents.filter(event => {
                  const eventHour = getEventTimeSlot(event.scheduled_time);
                  return eventHour === hour;
                });

                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                const isToday = dateStr === today;

                return (
                  <div 
                    key={dayIndex} 
                    className={`p-0.5 border-r border-gray-200 last:border-r-0 ${
                      isToday ? 'bg-blue-50/30' : 'hover:bg-gray-50'
                    }`}
                  >
                    {hourEvents.map((event: CalendarEvent) => {
                      const statusToUse = event.job_status || event.status || 'new';
                      const statusConfig = getStatusConfig(statusToUse);
                      const bgColor = getStatusColorHex(statusConfig.color);

                      return (
                        <button
                          key={event.id}
                          onClick={() => onSelectLead(event)}
                          className="w-full text-left px-1.5 py-1 rounded text-white text-xs font-medium border-l-2 hover:shadow-md hover:scale-[1.01] transition-all mb-0.5"
                          style={{ 
                            backgroundColor: bgColor,
                            borderLeftColor: bgColor,
                            opacity: 0.95
                          }}
                          title={`${event.name} - ${formatTime(event.scheduled_time)}${event.assigned_to ? ' - ' + event.assigned_to : ''}`}
                        >
                          <div className="font-bold truncate leading-tight">{event.name}</div>
                          {event.scheduled_time && (
                            <div className="opacity-90 truncate leading-tight text-[10px]">
                              {formatTime(event.scheduled_time).replace(' ', '')}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}