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
      const scheduledLeads = (data.leads || []).filter((lead: any) => 
        lead.scheduled_date && !lead.deleted && lead.job_status
      );
      
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
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.scheduled_date === dateStr);
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            📅 {view === 'month' ? 'Calendar' : 'Week View'}
          </h2>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded font-semibold transition ${
                view === 'month' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded font-semibold transition ${
                view === 'week' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={view === 'month' ? goToPreviousMonth : goToPreviousWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              ←
            </button>
            <span className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric',
                ...(view === 'week' ? { day: 'numeric' } : {})
              })}
            </span>
            <button
              onClick={view === 'month' ? goToNextMonth : goToNextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
          <span className="text-sm text-gray-600">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300"></div>
          <span className="text-sm text-gray-600">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
          <span className="text-sm text-gray-600">Completed</span>
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
function MonthView({ currentDate, events, getEventsForDate, getDaysInMonth, formatTime, onSelectLead }: any) {
  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="grid grid-cols-7 gap-2">
      {/* Day headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="text-center font-semibold text-gray-600 py-2">
          {day}
        </div>
      ))}

      {/* Empty cells for days before month starts */}
      {Array.from({ length: startingDayOfWeek }).map((_, i) => (
        <div key={`empty-${i}`} className="min-h-[120px] bg-gray-50 rounded-lg"></div>
      ))}

      {/* Days of the month */}
      {Array.from({ length: daysInMonth }).map((_, i) => {
        const day = i + 1;
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = date.toISOString().split('T')[0];
        const dayEvents = getEventsForDate(date);
        const isToday = dateStr === today;

        return (
          <div
            key={day}
            className={`min-h-[120px] rounded-lg border-2 p-2 ${
              isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className={`text-sm font-semibold mb-2 ${
              isToday ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {day}
            </div>
            
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map((event: any) => (
                <button
                  key={event.id}
                  onClick={() => onSelectLead(event)}
                  className={`w-full text-left px-2 py-1 rounded text-xs font-medium border ${
                    JOB_STATUS_COLORS[event.job_status] || 'bg-gray-100 text-gray-800'
                  } hover:opacity-80 transition`}
                >
                  <div className="truncate">{event.name}</div>
                  {event.scheduled_time && (
                    <div className="text-[10px] opacity-75">
                      {formatTime(event.scheduled_time)}
                    </div>
                  )}
                </button>
              ))}
              
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Week View Component
function WeekView({ currentDate, events, getEventsForDate, getWeekDays, formatTime, onSelectLead }: any) {
  const weekDays = getWeekDays(currentDate);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="grid grid-cols-7 gap-3">
      {weekDays.map((date, i) => {
        const dateStr = date.toISOString().split('T')[0];
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
                dayEvents.map((event: any) => (
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