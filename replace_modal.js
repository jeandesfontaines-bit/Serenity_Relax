const fs = require('fs');
const path = './src/components/landing/LandingBookingModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Imports
content = content.replace(
  `import { addMinutes, format, isBefore, parseISO, startOfDay } from 'date-fns';`,
  `import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isBefore, isSameMonth, parseISO, startOfDay, startOfMonth, startOfWeek, subMonths } from 'date-fns';`
);

// 2. State
content = content.replace(
  `const [weekOffset, setWeekOffset] = useState(0);`,
  `const [monthOffset, setMonthOffset] = useState(0);`
);
content = content.replace(
  `setWeekOffset(0);`,
  `setMonthOffset(0);`
);

// 3. Calendar logic
const newLogic = `const calendarDays = useMemo(() => {
    const today = startOfDay(new Date());
    let targetMonth = startOfMonth(today);
    if (monthOffset !== 0) {
      targetMonth = monthOffset > 0 ? addMonths(targetMonth, monthOffset) : subMonths(targetMonth, Math.abs(monthOffset));
    }
    
    const firstDay = startOfWeek(targetMonth, { weekStartsOn: 1 });
    const lastDay = endOfWeek(endOfMonth(targetMonth), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: firstDay, end: lastDay });

    return days.map(date => {
      const fullDate = format(date, 'yyyy-MM-dd');
      const isPast = isBefore(date, today);
      const isCurrentMonth = isSameMonth(date, targetMonth);
      const slots = (isPast || !isCurrentMonth) ? [] : getFreeSlotsForDate(fullDate);

      return {
        fullDate,
        dayLabel: format(date, 'EEE', { locale: fr }).replace('.', ''),
        dayNumber: format(date, 'd'),
        isDisabled: isPast || !isCurrentMonth || slots.length === 0,
        isCurrentMonth,
        slots,
      };
    });
  }, [availableSlots, configSlots, monthOffset]);

  const currentMonthLabel = useMemo(() => {
    let targetMonth = startOfMonth(new Date());
    if (monthOffset !== 0) {
      targetMonth = monthOffset > 0 ? addMonths(targetMonth, monthOffset) : subMonths(targetMonth, Math.abs(monthOffset));
    }
    return format(targetMonth, 'MMMM yyyy', { locale: fr });
  }, [monthOffset]);

  const selectedDay = calendarDays.find((day) => day.fullDate === bookingData.date);`;

content = content.replace(
  /const weekData = useMemo[\s\S]*?const selectedDay = weekData\.days\.find\(\(day\) => day\.fullDate === bookingData\.date\) \|\| \n                      calendarDays\.find\(\(day\) => day\.fullDate === bookingData\.date\);/,
  newLogic
);

// 4. Modal container classes
content = content.replace(
  /className=\{`absolute bottom-0 left-0 right-0 bg-\[#FDFDFB\] rounded-t-\[3rem\] shadow-2xl transition-transform duration-700 ease-out flex flex-col md:flex-row overflow-hidden h-\[90vh\] md:h-\[85vh\] \$\{isOpen \? 'translate-y-0' : 'translate-y-full'\}onClick=\{e => e\.stopPropagation\(\)\}/,
  "className={`absolute bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:right-auto md:w-[900px] md:max-w-[95vw] md:h-[700px] bg-[#FDFDFB] rounded-t-[3rem] md:rounded-[3rem] shadow-2xl transition-all duration-700 ease-out flex flex-col md:flex-row overflow-hidden h-[90vh] ${isOpen ? 'translate-y-0 md:-translate-y-1/2 md:scale-100 opacity-100' : 'translate-y-full md:-translate-y-1/2 md:scale-95 opacity-0'}`}"
);
// note: wait, the original has ` onClick={e => e.stopPropagation()}` at the end of the line.
// let's use a simpler regex.

fs.writeFileSync('replace_modal.js', content);
