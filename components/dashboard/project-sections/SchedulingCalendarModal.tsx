'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

type SchedulingCalendarModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectDateTime: (date: string, time: string) => void;
  companySlug: string;
  currentScheduledDate?: string;
  currentScheduledTime?: string;
  selectedTeamMember?: string;
};

type ScheduledJob = {
  id: number;
  scheduled_date: string;
  scheduled_time: string;
  assigned_to: string;
  name: string;
};

export default function SchedulingCalendarModal({
  isOpen,
  onClose,
  onSelectDateTime,
  companySlug,
  currentScheduledDate,
  currentScheduledTime,
  selectedTeamMember
}: SchedulingCalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all scheduled jobs
  useEffect(() => {
    if (isOpen) {
      fetchScheduledJobs();
    }
  }, [isOpen, companySlug]);

  async function fetchScheduledJobs() {
    console.log('🔍 SchedulingCalendarModal fetchScheduledJobs called');
    console.log('🔍 companySlug value:', companySlug);
    console.log('🔍 typeof companySlug:', typeof companySlug);
    
    try {
      const response = await fetch(`/api/company/${companySlug}/leads`);
      const data = await response.json();
      
      // The leads endpoint already includes project data via LEFT JOIN
      // So scheduled_date, scheduled_time, assigned_to are all available
      const scheduled = (data.leads || []).filter((lead: any) => {
        return lead.scheduled_date && lead.scheduled_date.trim() !== '' && !lead.deleted;
      }).map((lead: any) => ({
        id: lead.id,
        scheduled_date: lead.scheduled_date,
        scheduled_time: lead.scheduled_time,
        assigned_to: lead.assigned_to,
        name: lead.name
      }));
      
      setScheduledJobs(scheduled);
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
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getJobsForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return scheduledJobs.filter(job => {
      const jobDate = job.scheduled_date ? job.scheduled_date.split('T')[0] : null;
      
      // If filtering by team member, only show their jobs
      if (selectedTeamMember) {
        return jobDate === dateStr && job.assigned_to === selectedTeamMember;
      }
      
      return jobDate === dateStr;
    });
  };

  const isTimeSlotAvailable = (time: string) => {
    if (!selectedDate) return false;
    
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const jobsOnDate = scheduledJobs.filter(job => {
      const jobDate = job.scheduled_date ? job.scheduled_date.split('T')[0] : null;
      
      // If filtering by team member, only check their availability
      if (selectedTeamMember) {
        return jobDate === dateStr && job.scheduled_time === time && job.assigned_to === selectedTeamMember;
      }
      
      return jobDate === dateStr && job.scheduled_time === time;
    });
    
    return jobsOnDate.length === 0;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time');
      return;
    }

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    onSelectDateTime(dateStr, selectedTime);
    onClose();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
    setSelectedTime('');
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
    setSelectedTime('');
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Generate time slots (7 AM to 7 PM in 30-minute intervals)
  const timeSlots = [];
  for (let hour = 7; hour <= 19; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 19) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  if (!isOpen) return null;

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Date & Time</h2>
            {selectedTeamMember && (
              <p className="text-sm text-gray-600 mt-1">
                Showing availability for: <span className="font-semibold">{selectedTeamMember}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar - Left side */}
            <div className="lg:col-span-2">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition text-xl font-bold"
                >
                  ←
                </button>
                <span className="text-lg font-bold text-gray-900">
                  {currentDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric'
                  })}
                </span>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition text-xl font-bold"
                >
                  →
                </button>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-bold text-sm text-gray-700 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells before month starts */}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const dayStr = String(date.getDate()).padStart(2, '0');
                  const dateStr = `${year}-${month}-${dayStr}`;
                  
                  const isToday = dateStr === today;
                  const isSelected = selectedDate?.getDate() === day && 
                                    selectedDate?.getMonth() === currentDate.getMonth() &&
                                    selectedDate?.getFullYear() === currentDate.getFullYear();
                  const isPast = date < now && !isToday;
                  const jobsOnDate = getJobsForDate(date);
                  const hasJobs = jobsOnDate.length > 0;

                  return (
                    <button
                      key={day}
                      onClick={() => !isPast && handleDateClick(date)}
                      disabled={isPast}
                      className={`aspect-square p-2 rounded-lg border-2 transition-all relative ${
                        isPast
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : isToday
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <span className={`font-semibold ${
                        isPast ? 'text-gray-400' : isSelected || isToday ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {day}
                      </span>
                      
                      {/* Job indicator dots */}
                      {hasJobs && !isPast && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {Array.from({ length: Math.min(jobsOnDate.length, 3) }).map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-orange-500"
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-blue-300 bg-blue-50" />
                  <span className="text-gray-600">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-50" />
                  <span className="text-gray-600">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span className="text-gray-600">Has bookings</span>
                </div>
              </div>
            </div>

            {/* Time slots - Right side */}
            <div className="lg:col-span-1">
              <div className="sticky top-0">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {selectedDate ? (
                    <>Select Time</>
                  ) : (
                    <>Select a date first</>
                  )}
                </h3>

                {selectedDate ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="text-sm text-blue-900 font-semibold">
                        {selectedDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                      {timeSlots.map((time) => {
                        const available = isTimeSlotAvailable(time);
                        const isSelectedTime = selectedTime === time;
                        
                        return (
                          <button
                            key={time}
                            onClick={() => handleTimeSelect(time)}
                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                              isSelectedTime
                                ? 'border-green-500 bg-green-50 shadow-md'
                                : available
                                ? 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                                : 'border-red-200 bg-red-50 cursor-not-allowed'
                            }`}
                            disabled={!available}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`font-semibold ${
                                isSelectedTime ? 'text-green-700' : available ? 'text-gray-900' : 'text-red-600'
                              }`}>
                                {formatTime(time)}
                              </span>
                              {isSelectedTime ? (
  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
) : available ? (
  <div className="text-xs text-green-600 font-semibold">Available</div>
) : (
  (() => {
    // Find the job that's booked at this time
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const bookedJob = scheduledJobs.find(job => {
      const jobDate = job.scheduled_date ? job.scheduled_date.split('T')[0] : null;
      return jobDate === dateStr && job.scheduled_time === time;
    });
    
    return (
      <div className="text-xs text-red-600 font-semibold">
        {bookedJob?.assigned_to ? `${bookedJob.assigned_to}` : 'Booked'}
      </div>
    );
  })()
)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Select a date to see available times</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedDate && selectedTime ? (
              <div className="font-semibold text-gray-900">
                Selected: {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {formatTime(selectedTime)}
              </div>
            ) : (
              <div>Please select date and time</div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedDate || !selectedTime}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition shadow-sm"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}