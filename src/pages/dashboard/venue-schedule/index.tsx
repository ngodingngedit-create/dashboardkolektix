import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import moment from 'moment';
import { Card, CardBody, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Skeleton } from '@nextui-org/react';
import { DatePicker } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { Get } from '@/utils/REST';
import useLoggedUser from '@/utils/useLoggedUser';
import { VenueListResponse } from '../venue/type';
import { toast } from 'react-toastify';

const daysIdLong = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const hours = Array.from({ length: 24 }, (_, i) => i);

const VenueSchedulePage = () => {
    const loggedUser = useLoggedUser();
    const [venues, setVenues] = useState<any[]>([]);
    const [selectedVenue, setSelectedVenue] = useState<any | null>(null);
    const [loadingVenues, setLoadingVenues] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [currentDate, setCurrentDate] = useState(moment());
    const [activeView, setActiveView] = useState<'CALENDAR' | 'TASKS'>('CALENDAR');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDetails, setTaskDetails] = useState('');

    useEffect(() => {
        if (loggedUser) {
            fetchData();
        }
    }, [loggedUser]);

    const fetchData = async () => {
        setLoadingVenues(true);
        try {
            const res: any = await Get('creator-data/venue', {});
            if (res && (res.status || res.success) && Array.isArray(res.data)) {
                setVenues(res.data);
                if (res.data.length > 0) {
                    setSelectedVenue(res.data[0]);
                    fetchVenueDetail(res.data[0].slug);
                }
            }
        } catch (error) {
            console.error('Failed to fetch venues:', error);
            toast.error('Failed to load venues');
        } finally {
            setLoadingVenues(false);
        }
    };

    const fetchVenueDetail = async (venueSlug: string) => {
        setLoadingDetail(true);
        try {
            const res: any = await Get(`venue/${venueSlug}`, {});
            if (res && (res.status || res.success)) {
                const venueData = Array.isArray(res.data) ? res.data[0] : res.data;
                setSelectedVenue(venueData);
                
                // If the venue has a schedule start date, jump the calendar to it
                if (venueData.venue_schedule?.start_date) {
                    setCurrentDate(moment(venueData.venue_schedule.start_date));
                }
            }
        } catch (error) {
            console.error('Failed to fetch venue detail:', error);
            toast.error('Failed to load venue detail');
        } finally {
            setLoadingDetail(false);
        }
    };

    const weekStart = useMemo(() => moment(currentDate).startOf('isoWeek'), [currentDate]);
    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => moment(weekStart).add(i, 'days'));
    }, [weekStart]);

    const handlePrevWeek = () => setCurrentDate(moment(currentDate).subtract(1, 'week'));
    const handleNextWeek = () => setCurrentDate(moment(currentDate).add(1, 'week'));
    const handleToday = () => setCurrentDate(moment());

    const bookings = useMemo(() => {
        if (!selectedVenue?.has_booked_venue) return [];
        return selectedVenue.has_booked_venue.map((b: any) => ({
            ...b,
            moment: moment(b.start_date)
        }));
    }, [selectedVenue]);

    const getBookingsForDayAndHour = (day: moment.Moment, hour: number) => {
        return bookings.filter((b: any) => 
            b.moment.isSame(day, 'day') && b.moment.hour() === hour
        );
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-10">
            {/* Header Section */}
            <div className="max-w-[1600px] mx-auto px-6 pt-10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="flex flex-col gap-1">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Venue Schedule</h1>
                        <p className="text-slate-500 mt-1">Monitor and manage your venue bookings in a calendar view</p>
                    </div>

                    {/* View Switcher Toggle */}
                    <div className="flex bg-white border border-light-grey rounded-full p-1.5 shadow-sm w-fit mt-4">
                        <Button 
                            isIconOnly 
                            radius="full" 
                            size="md" 
                            variant={activeView === 'CALENDAR' ? 'solid' : 'light'}
                            color={activeView === 'CALENDAR' ? 'primary' : 'default'}
                            onClick={() => setActiveView('CALENDAR')}
                            className={activeView === 'CALENDAR' ? 'bg-[#194e9e] text-white w-12 h-12' : 'text-slate-500 w-12 h-12'}
                        >
                            <Icon icon="mdi:calendar-month" width={22} />
                        </Button>
                        <Button 
                            isIconOnly 
                            radius="full" 
                            size="md" 
                            variant={activeView === 'TASKS' ? 'solid' : 'light'}
                            color={activeView === 'TASKS' ? 'primary' : 'default'}
                            onClick={() => setActiveView('TASKS')}
                            className={activeView === 'TASKS' ? 'bg-[#194e9e] text-white w-12 h-12' : 'text-slate-500 w-12 h-12'}
                        >
                            <Icon icon="mdi:check-circle-outline" width={22} />
                        </Button>
                    </div>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <Dropdown>
                        <DropdownTrigger>
                            <Button 
                                variant="flat" 
                                color="primary"
                                className="bg-white border border-light-grey font-bold min-w-[250px] justify-between h-11 rounded-xl shadow-sm"
                                endContent={<Icon icon="mdi:chevron-down" />}
                                isLoading={loadingVenues}
                            >
                                {selectedVenue ? selectedVenue.name : 'Select Venue'}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu 
                            aria-label="Venue Selection"
                            onAction={(key) => {
                                const ven = venues.find(v => v.slug === key);
                                if (ven) {
                                    setSelectedVenue(ven);
                                    fetchVenueDetail(ven.slug);
                                }
                            }}
                        >
                            {venues.map((v) => (
                                <DropdownItem key={v.slug} textValue={v.name}>
                                    <div className="flex flex-col">
                                        <span className="font-bold">{v.name}</span>
                                        <span className="text-xs text-slate-400">
                                            {v.venue_schedule?.name || 'No Schedule'}
                                        </span>
                                    </div>
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row gap-6">
                
                {/* ── LEFT SIDEBAR ── */}
                {!isMobile && (
                    <div className="w-[300px] shrink-0 space-y-6">
                        {activeView === 'CALENDAR' ? (
                            <>
                                <Card className="border border-light-grey shadow-sm rounded-2xl" shadow="none">
                                    <CardBody className="p-4">
                                        <DatePicker 
                                            size="sm" 
                                            value={currentDate.toDate()} 
                                            onChange={(val: Date | null) => val && setCurrentDate(moment(val))}
                                            styles={{
                                                calendarHeader: { marginBottom: '10px' },
                                                day: { fontSize: '12px', fontWeight: 600, borderRadius: '8px' },
                                                weekday: { fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8' }
                                            }}
                                        />
                                    </CardBody>
                                </Card>

                                <Card className="border border-light-grey shadow-sm rounded-2xl" shadow="none">
                                    <CardBody className="p-5 space-y-6">
                                        <div>
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">My Calendars</h3>
                                            <div className="space-y-3">
                                                {[
                                                    { label: 'Venue Bookings', color: '#194e9e' },
                                                    { label: 'Maintenance', color: '#f59e0b' },
                                                    { label: 'Internal Events', color: '#10b981' },
                                                ].map((cal, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className="w-4 h-4 rounded border-2" style={{ borderColor: cal.color, backgroundColor: `${cal.color}20` }} />
                                                        <span className="text-sm font-bold text-slate-600">{cal.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="pt-4 border-t border-light-grey">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Legend</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Time</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-sm bg-[#194e9e]/10 border-l-2 border-[#194e9e]" />
                                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Venue Booked</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </>
                        ) : (
                            <Card className="border border-light-grey shadow-sm rounded-2xl" shadow="none">
                                <CardBody className="p-4 space-y-2">
                                    <Button 
                                        fullWidth 
                                        variant="flat" 
                                        color="primary" 
                                        className="justify-start font-bold h-11 bg-blue-50 text-[#194e9e]"
                                        startContent={<Icon icon="mdi:check-circle" width={18} />}
                                    >
                                        All tasks
                                    </Button>
                                    <Button 
                                        fullWidth 
                                        variant="light" 
                                        className="justify-start font-semibold h-11 text-slate-600"
                                        startContent={<Icon icon="mdi:star-outline" width={18} />}
                                    >
                                        Starred
                                    </Button>
                                    
                                    <div className="pt-4 mt-2 border-t border-light-grey">
                                        <div className="flex justify-between items-center px-2 mb-4">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Lists</span>
                                            <Icon icon="mdi:chevron-up" className="text-slate-400" />
                                        </div>
                                        <Button 
                                            fullWidth 
                                            variant="light" 
                                            className="justify-start font-semibold h-11 text-slate-600"
                                            startContent={<Icon icon="mdi:format-list-bulleted" width={18} />}
                                        >
                                            My Tasks
                                        </Button>
                                        <Button 
                                            fullWidth 
                                            variant="light" 
                                            className="justify-start font-bold h-11 text-slate-400 border-t border-light-grey mt-2"
                                            startContent={<Icon icon="mdi:plus" width={20} />}
                                        >
                                            Create new list
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        )}
                    </div>
                )}

                {/* ── MAIN CONTENT AREA ── */}
                <div className="flex-1 min-w-0">
                    {activeView === 'CALENDAR' ? (
                        <Card className="border border-light-grey shadow-sm rounded-2xl overflow-hidden h-[850px]" shadow="none">
                            {/* Calendar Header */}
                            <div className="px-6 py-4 border-b border-light-grey flex items-center justify-between bg-white">
                                <div className="flex items-center gap-4">
                                    <Button 
                                        size="sm"
                                        variant="flat"
                                        onClick={handleToday}
                                        className="bg-slate-100 text-slate-700 font-bold px-5"
                                    >
                                        Today
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        <Button isIconOnly size="sm" variant="light" onClick={handlePrevWeek}>
                                            <Icon icon="mdi:chevron-left" width={20} />
                                        </Button>
                                        <Button isIconOnly size="sm" variant="light" onClick={handleNextWeek}>
                                            <Icon icon="mdi:chevron-right" width={20} />
                                        </Button>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 ml-2">
                                        {weekStart.format('MMMM YYYY')}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-light-grey text-[#194e9e] text-[10px] font-black uppercase tracking-widest">
                                        {selectedVenue?.venue_schedule?.name || 'Weekly View'}
                                    </div>
                                    {loadingDetail && <Skeleton className="w-20 h-8 rounded-lg" />}
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="flex-1 overflow-auto flex flex-col relative bg-white">
                                {/* Day Headers */}
                                <div className="flex border-b border-light-grey sticky top-0 z-20 bg-white">
                                    <div className="w-[80px] shrink-0 border-r border-light-grey bg-slate-50/50"></div>
                                    {weekDays.map((day, i) => {
                                        const isToday = day.isSame(moment(), 'day');
                                        return (
                                            <div key={i} className="flex-1 min-w-[120px] py-4 flex flex-col items-center border-r border-light-grey last:border-r-0">
                                                <span className={`text-[11px] font-black uppercase tracking-widest ${isToday ? 'text-[#194e9e]' : 'text-slate-400'}`}>
                                                    {daysIdLong[day.day()].substring(0, 3)}
                                                </span>
                                                <div className={`mt-1 w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg ${isToday ? 'bg-[#194e9e] text-white shadow-lg shadow-blue-100' : 'text-slate-900'}`}>
                                                    {day.date()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Time Grid */}
                                <div className="flex flex-1">
                                    {/* Time Labels */}
                                    <div className="w-[80px] shrink-0 bg-slate-50/50 border-r border-light-grey">
                                        {hours.map(h => (
                                            <div key={h} className="h-[70px] flex items-start justify-center pt-2 relative">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tabular-nums">
                                                    {h === 0 ? '' : moment().hour(h).format('ha')}
                                                </span>
                                                <div className="absolute bottom-0 left-0 right-0 border-b border-light-grey/50 w-full"></div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Main Day Columns */}
                                    {weekDays.map((day, dayIdx) => (
                                        <div key={dayIdx} className="flex-1 min-w-[120px] border-r border-light-grey last:border-r-0 relative group">
                                            {hours.map(h => (
                                                <div key={h} className="h-[70px] border-b border-light-grey hover:bg-slate-50/50 transition-colors relative">
                                                    {/* Hourly bookings */}
                                                    <div className="absolute inset-x-1 top-1 bottom-1 flex flex-col gap-1 z-10">
                                                        {getBookingsForDayAndHour(day, h).map((booking: any, bIdx: number) => (
                                                            <div 
                                                                key={bIdx}
                                                                className="bg-[#194e9e]/10 border-l-4 border-[#194e9e] rounded-r-lg p-2 overflow-hidden shadow-sm hover:shadow-md hover:bg-[#194e9e]/15 transition-all cursor-pointer h-full group/booking"
                                                                title={`${booking.event_name} at ${booking.moment.format('HH:mm')}`}
                                                            >
                                                                <p className="text-[10px] font-black text-[#194e9e] leading-tight truncate uppercase">
                                                                    {booking.event_name}
                                                                </p>
                                                                <p className="text-[9px] font-bold text-slate-500 mt-1">
                                                                    {booking.moment.format('HH:mm')} - {moment(booking.end_date).format('HH:mm')}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {/* Current Time Indicator Line (Only on today's column) */}
                                            {day.isSame(moment(), 'day') && (
                                                <div 
                                                    className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                                                    style={{ top: `${(moment().hour() * 70 + (moment().minute() / 60) * 70)}px` }}
                                                >
                                                    <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5 shadow-md border-2 border-white"></div>
                                                    <div className="flex-1 h-0.5 bg-red-500 shadow-sm"></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="border border-light-grey shadow-sm rounded-2xl h-[850px]" shadow="none">
                            <CardBody className="p-10 flex flex-col">
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-2xl font-bold text-slate-800">My Tasks</h2>
                                    <Button isIconOnly variant="light" size="sm">
                                        <Icon icon="mdi:dots-vertical" className="text-slate-400" width={24} />
                                    </Button>
                                </div>
                                
                                {isAddingTask ? (
                                    <div className="bg-[#f8fafd] border border-blue-100 rounded-xl p-4 mb-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex gap-4">
                                            <div className="mt-1">
                                                <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors" />
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <input 
                                                    autoFocus
                                                    type="text" 
                                                    placeholder="Title" 
                                                    className="w-full bg-transparent border-none outline-none text-lg font-semibold text-slate-700 placeholder:text-slate-400"
                                                    value={taskTitle}
                                                    onChange={(e) => setTaskTitle(e.target.value)}
                                                />
                                                <div className="flex items-start gap-2 text-slate-500">
                                                    <Icon icon="mdi:text-subject" width={20} className="mt-0.5 shrink-0" />
                                                    <textarea 
                                                        placeholder="Details" 
                                                        rows={1}
                                                        className="w-full bg-transparent border-none outline-none text-sm py-0 placeholder:text-slate-400 resize-none"
                                                        value={taskDetails}
                                                        onChange={(e) => setTaskDetails(e.target.value)}
                                                    />
                                                </div>
                                                
                                                <div className="flex items-center justify-between pt-2">
                                                    <div className="flex items-center gap-2">
                                                        <Button size="sm" radius="full" variant="bordered" className="border-slate-200 text-slate-600 font-bold h-8 px-4 text-xs">
                                                            Today
                                                        </Button>
                                                        <Button size="sm" radius="full" variant="bordered" className="border-slate-200 text-slate-600 font-bold h-8 px-4 text-xs">
                                                            Tomorrow
                                                        </Button>
                                                        <Button isIconOnly size="sm" radius="full" variant="bordered" className="border-slate-200 text-slate-500 h-8 w-8 min-w-0">
                                                            <Icon icon="mdi:calendar-outline" width={18} />
                                                        </Button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button isIconOnly size="sm" variant="light" className="text-slate-400">
                                                            <Icon icon="mdi:repeat" width={20} />
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            color="primary" 
                                                            className="font-bold px-6 h-8 rounded-lg"
                                                            onClick={() => setIsAddingTask(false)}
                                                        >
                                                            Save
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Button 
                                        variant="light" 
                                        className="justify-start text-[#1a73e8] font-bold px-0 hover:bg-transparent mb-6 h-12 text-base group"
                                        startContent={
                                            <div className="bg-blue-50 p-2 rounded-full group-hover:bg-blue-100 transition-colors">
                                                <Icon icon="mdi:plus" width={24} className="text-[#1a73e8]" />
                                            </div>
                                        }
                                        onClick={() => setIsAddingTask(true)}
                                    >
                                        Add a task
                                    </Button>
                                )}

                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-64 h-64 opacity-80">
                                        <img src="/images/no_tasks_illustration.png" alt="No tasks" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-slate-700">No tasks yet</h3>
                                        <p className="text-slate-400 max-w-sm mx-auto font-medium">
                                            Add your to-dos and keep track of them across Kolektix Workspace
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VenueSchedulePage;
