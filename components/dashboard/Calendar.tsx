'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type CalendarProps = {
  companySlug: string;
  onSelectLead: (lead: any) => void;
};

type CalendarEvent = {
  id: number;
  name: string;
  scheduled_date: string;
  scheduled_time: string;
  job_status: string;
  assigned_to: string;
  category: string;
  phone: string;
  email: string;
};

const JOB_STATUS_COLORS: Record<string, string> = {
  'not_started': 'bg-gray-200 text-gray-800 border-gray-300',
  'scheduled': 'bg-blue-100 text-blue-800 border-blue-300',
  'in_progress': 'bg-orange-100 text-orange-800 border-orange-300',
  'completed': 'bg-green-100 text-green-800 border-green-300',
  'cancelled': 'bg-red-100 text-red-800 border-red-300',
};

export default function Calendar({ companySlug, onSelectLead }: CalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  useEffect(() => {
    fetchScheduledJobs();
  }, [companySlug]);

  async function fetchScheduledJobs() {
    try {
      const response = await fetch(`/api/company/${companySlug}/leads`);
      const data = await response.json();
      
      // Filter leads that have scheduled dates and are not deleted
      const scheduledLeads = (data.leads || []).filter((lead: any) => {
        const hasScheduledDate = lead.scheduled_date && lead.scheduled_date.trim() !== '';
        const notDeleted = !lead.deleted;
        const hasStatus = lead.job_status && lead.job_status.trim() !== '';
        
        return hasScheduledDate && notDeleted && hasStatus;
      });
      
      console.log('Total leads:', data.leads?.length || 0);
      console.log('Scheduled leads found:', scheduledLeads.length);
      console.log('Scheduled leads:', scheduledLeads.map((l: any) => ({ 
        name: l.name, 
        date: l.scheduled_date, 
        status: l.job_status 
      })));
      
      setEvents(scheduledLeads);
    } catch (error) {
      console.error('Failed to fetch scheduled jobs:', error);
      toast.error('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }

  // Calendar helpers
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
    startOfWeek.setDate(date.getDate() - date.getDay()); // Start on Sunday
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    // Format date as YYYY-MM-DD in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return events.filter(event => {
      // Handle both full datetime strings and date-only strings
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
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-900">
            📅 {view === 'month' ? 'Monthly Calendar' : 'Weekly Calendar'}
          </h2>
          <button
            onClick={goToToday}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-sm"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* View Switcher */}
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1.5">
            <button
              onClick={() => setView('month')}
              className={`px-5 py-2 rounded-md font-semibold transition ${
                view === 'month' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-5 py-2 rounded-md font-semibold transition ${
                view === 'week' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={view === 'month' ? goToPreviousMonth : goToPreviousWeek}
              className="p-2.5 hover:bg-gray-100 rounded-lg transition text-xl font-bold"
            >
              ←
            </button>
            <span className="text-xl font-bold text-gray-900 min-w-[220px] text-center">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric',
                ...(view === 'week' ? { day: 'numeric' } : {})
              })}
            </span>
            <button
              onClick={view === 'month' ? goToNextMonth : goToNextWeek}
              className="p-2.5 hover:bg-gray-100 rounded-lg transition text-xl font-bold"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-200 border-2 border-gray-300"></div>
          <span className="text-sm font-medium text-gray-700">Not Started</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-100 border-2 border-blue-300"></div>
          <span className="text-sm font-medium text-gray-700">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-orange-100 border-2 border-orange-300"></div>
          <span className="text-sm font-medium text-gray-700">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-green-100 border-2 border-green-300"></div>
          <span className="text-sm font-medium text-gray-700">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-red-100 border-2 border-red-300"></div>
          <span className="text-sm font-medium text-gray-700">Cancelled</span>
        </div>
      </div>

      {/* Month View */}
      {view === 'month' && <MonthView 
        currentDate={currentDate}
        events={events}
        getEventsForDate={getEventsForDate}
        getDaysInMonth={getDaysInMonth}
        formatTime={formatTime}
        onSelectLead={onSelectLead}
      />}

      {/* Week View */}
      {view === 'week' && <WeekView 
        currentDate={currentDate}
        events={events}
        getEventsForDate={getEventsForDate}
        getWeekDays={getWeekDays}
        formatTime={formatTime}
        onSelectLead={onSelectLead}
      />}
    </div>
  );
}

// Month View Component
type MonthViewProps = {
  currentDate: Date;
  events: CalendarEvent[];
  getEventsForDate: (date: Date) => CalendarEvent[];
  getDaysInMonth: (date: Date) => { daysInMonth: number; startingDayOfWeek: number; firstDay: Date; lastDay: Date };
  formatTime: (time: string) => string;
  onSelectLead: (lead: any) => void;
};

function MonthView({ currentDate, events, getEventsForDate, getDaysInMonth, formatTime, onSelectLead }: MonthViewProps) {
  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  
  // Format today's date consistently
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Create a complete 6-week calendar grid (42 cells)
  const calendarCells = [];
  
  // Add empty cells before the month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarCells.push({ type: 'empty', key: `empty-${i}` });
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push({ type: 'day', day, key: `day-${day}` });
  }
  
  // Add empty cells after the month ends to complete the grid
  const remainingCells = 42 - calendarCells.length;
  for (let i = 0; i < remainingCells; i++) {
    calendarCells.push({ type: 'empty', key: `empty-end-${i}` });
  }

  return (
    <div className="space-y-3">
      {/* Day headers - Full width row */}
      <div className="grid grid-cols-7 gap-2">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
          <div 
            key={day} 
            className="text-center font-bold text-sm text-gray-700 py-3 bg-gray-100 rounded-lg border border-gray-200"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid - 6 rows of 7 days */}
      <div className="grid grid-cols-7 gap-2">
        {calendarCells.map((cell) => {
          if (cell.type === 'empty') {
            return (
              <div 
                key={cell.key} 
                className="aspect-square min-h-[140px] bg-gray-50 rounded-lg border border-gray-200"
              />
            );
          }

          const day = cell.day!;
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          
          // Format date consistently
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const dayStr = String(date.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${dayStr}`;
          
          const dayEvents = getEventsForDate(date);
          const isToday = dateStr === today;

          return (
            <div
              key={cell.key}
              className={`aspect-square min-h-[140px] rounded-lg border-2 p-3 transition-all flex flex-col ${
                isToday 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md'
              }`}
            >
              {/* Day number */}
              <div className={`text-lg font-bold mb-2 ${
                isToday ? 'text-blue-600' : 'text-gray-700'
              }`}>
                {day}
              </div>
              
              {/* Events */}
              <div className="flex-1 space-y-1 overflow-y-auto">
                {dayEvents.slice(0, 4).map((event: CalendarEvent) => (
                  <button
                    key={event.id}
                    onClick={() => onSelectLead(event)}
                    className={`w-full text-left px-2 py-1 rounded text-xs font-medium border ${
                      JOB_STATUS_COLORS[event.job_status] || 'bg-gray-100 text-gray-800 border-gray-300'
                    } hover:opacity-80 hover:shadow transition`}
                  >
                    <div className="truncate font-semibold">{event.name}</div>
                    {event.scheduled_time && (
                      <div className="text-[10px] opacity-75 mt-0.5">
                        ⏰ {formatTime(event.scheduled_time)}
                      </div>
                    )}
                  </button>
                ))}
                
                {dayEvents.length > 4 && (
                  <div className="text-xs text-gray-500 text-center pt-1 font-medium">
                    +{dayEvents.length - 4} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Week View Component
type WeekViewProps = {
  currentDate: Date;
  events: CalendarEvent[];
  getEventsForDate: (date: Date) => CalendarEvent[];
  getWeekDays: (date: Date) => Date[];
  formatTime: (time: string) => string;
  onSelectLead: (lead: any) => void;
};

function WeekView({ currentDate, events, getEventsForDate, getWeekDays, formatTime, onSelectLead }: WeekViewProps) {
  const weekDays = getWeekDays(currentDate);
  
  // Format today's date consistently
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    <div className="grid grid-cols-7 gap-3">
      {weekDays.map((date: Date, i: number) => {
        // Format date consistently
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const dayEvents = getEventsForDate(date);
        const isToday = dateStr === today;

        return (
          <div key={i} className="space-y-2">
            {/* Day header */}
            <div className={`text-center py-2 rounded-lg ${
              isToday ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              <div className="text-xs font-medium">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-lg font-bold">{date.getDate()}</div>
            </div>

            {/* Events */}
            <div className="space-y-2">
              {dayEvents.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-4">
                  No jobs
                </div>
              ) : (
                dayEvents.map((event: CalendarEvent) => (
                  <button
                    key={event.id}
                    onClick={() => onSelectLead(event)}
                    className={`w-full text-left p-3 rounded-lg border-2 ${
                      JOB_STATUS_COLORS[event.job_status] || 'bg-gray-100 text-gray-800'
                    } hover:shadow-md transition`}
                  >
                    <div className="font-semibold text-sm mb-1 truncate">
                      {event.name}
                    </div>
                    {event.scheduled_time && (
                      <div className="text-xs opacity-75 mb-1">
                        ⏰ {formatTime(event.scheduled_time)}
                      </div>
                    )}
                    {event.assigned_to && (
                      <div className="text-xs opacity-75">
                        👤 {event.assigned_to}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}