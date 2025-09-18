class DatePicker {
    constructor() {
        // Always start from the first day of the current month
        const now = new Date();
        this.currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
        this.selectedDate = null;
        this.activePicker = null;
        // Store the minimum allowed month/year for navigation
        this.minYear = now.getFullYear();
        this.minMonth = now.getMonth();
        // Store the maximum allowed month/year for navigation (January two years ahead)
        this.maxYear = now.getFullYear() + 2;
        this.maxMonth = 0; // January = 0
        this.init();
    }

    init() {
        // Add click listeners to date inputs
        const checkinInput = document.getElementById('checkin');
        const checkoutInput = document.getElementById('checkout');
        
        if (checkinInput) {
            checkinInput.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPicker('checkin-picker', checkinInput);
            });
        }
        
        if (checkoutInput) {
            checkoutInput.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPicker('checkout-picker', checkoutInput);
            });
        }

        // Close picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.date-picker') && !e.target.closest('input[readonly]')) {
                this.hideAllPickers();
            }
        });
    }

    showPicker(pickerId, input) {
        // Hide any other open pickers
        this.hideAllPickers();
        
        const picker = document.getElementById(pickerId);
        if (!picker) return;

        this.activePicker = picker;
        this.selectedDate = null;
        
        // Set current date to today or the date in the input
        const inputValue = input.value;
        if (inputValue) {
            const dateParts = inputValue.split('.');
            if (dateParts.length === 3) {
                this.currentDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            }
        }

        this.renderCalendar(picker);
        picker.classList.add('active');
    }

    hideAllPickers() {
        const pickers = document.querySelectorAll('.date-picker');
        pickers.forEach(picker => picker.classList.remove('active'));
        this.activePicker = null;
    }

    renderCalendar(picker) {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const monthNames = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];

        const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

        let html = `
            <div class="date-picker-header">
                <button class="date-picker-nav prev" ${(this.currentDate.getFullYear() <= this.minYear && this.currentDate.getMonth() <= this.minMonth) ? 'disabled' : ''}>&lt;</button>
                <h3>${monthNames[month]} ${year}</h3>
                <button class="date-picker-nav next" ${(this.currentDate.getFullYear() >= this.maxYear && this.currentDate.getMonth() >= this.maxMonth) ? 'disabled' : ''}>&gt;</button>
            </div>
            <div class="date-picker-weekdays">
                ${weekdays.map(day => `<div class="weekday">${day}</div>`).join('')}
            </div>
            <div class="date-picker-days">
        `;

        // Calculate the first day of the month and how many days to show from previous month
        const firstDayOfMonth = new Date(year, month, 1);
        const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Calculate total cells needed (weeks * 7 days)
        const totalCells = Math.ceil((dayOfWeek + daysInMonth) / 7) * 7;
        
        for (let i = 0; i < totalCells; i++) {
            const currentDate = new Date(year, month, 1 - dayOfWeek + i);
            
            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = this.isToday(currentDate);
            const isPast = this.isDateInPast(currentDate);
            const isBooked = this.isBooked(currentDate);
            const isSelected = this.isDateSelected(currentDate);
            const isInRange = this.isDateInRange(currentDate);
            
            if (isCurrentMonth) {
                let classes = 'date-picker-day';
                if (isToday) classes += ' today';
                if (isPast) classes += ' past';
                if (isBooked) classes += ' booked';
                if (isSelected) classes += ' selected';
                if (isInRange) classes += ' in-range';
                
                html += `<div class="${classes}" data-date="${currentDate.toISOString()}">${currentDate.getDate()}</div>`;
            } else {
                // Empty cell for previous/next month dates
                html += `<div class="date-picker-day empty"></div>`;
            }
        }

        html += '</div>';
        picker.innerHTML = html;

        // Add click listeners to navigation buttons
        const prevButton = picker.querySelector('.date-picker-nav.prev');
        const nextButton = picker.querySelector('.date-picker-nav.next');
        
        if (prevButton) {
            prevButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.previousMonth();
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.nextMonth();
            });
        }

        // Add click listeners to days
        const days = picker.querySelectorAll('.date-picker-day');
        days.forEach(day => {
            day.addEventListener('click', (e) => {
                if (!day.classList.contains('empty') && !day.classList.contains('past') && !day.classList.contains('booked')) {
                    this.selectDate(day.dataset.date);
                } else if (day.classList.contains('booked')) {
                    alert('Dieses Datum ist nicht verfügbar.');
                    this.hideAllPickers();
                } else if (day.classList.contains('past')) {
                    alert('Vergangene Daten können nicht ausgewählt werden.');
                    this.hideAllPickers();
                }
            });
        });
    }

    previousMonth() {
        // Check if going to previous month would go into the past
        const targetDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
        if (targetDate.getFullYear() < this.minYear || 
            (targetDate.getFullYear() === this.minYear && targetDate.getMonth() < this.minMonth)) {
            return; // Don't allow navigation to past months
        }
        
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar(this.activePicker);
    }

    nextMonth() {
        // Check if going to next month would go beyond the maximum allowed date
        const targetDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
        if (targetDate.getFullYear() > this.maxYear || 
            (targetDate.getFullYear() === this.maxYear && targetDate.getMonth() > this.maxMonth)) {
            return; // Don't allow navigation beyond maximum date
        }
        
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar(this.activePicker);
    }

    selectDate(dateString) {
        // Use the same date creation method as the main calendar
        const date = new Date(dateString);
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        
        const formattedDate = `${day}.${month}.${year}`;
        
        // Update the corresponding input
        if (this.activePicker.id === 'checkin-picker') {
            const checkoutInput = document.getElementById('checkout');
            const checkoutValue = checkoutInput.value;
            
            // Validate checkin date
            if (checkoutValue) {
                const checkoutDate = this.parseDateInput(checkoutValue);
                if (checkoutDate && date >= checkoutDate) {
                    alert('Anreise muss vor Abreise liegen.');
                    this.hideAllPickers();
                    return;
                }
                
                // Check minimum 4 nights
                const nights = Math.ceil((checkoutDate - date) / (1000 * 60 * 60 * 24));
                if (nights < 4) {
                    alert('Mindestaufenthalt ist 4 Nächte.');
                    this.hideAllPickers();
                    return;
                }
            }
            
            document.getElementById('checkin').value = formattedDate;
            
            // After selecting Anreise, automatically open the Abreise picker
            this.hideAllPickers();
            setTimeout(() => {
                const checkoutInput = document.getElementById('checkout');
                if (checkoutInput) {
                    this.showPicker('checkout-picker', checkoutInput);
                }
            }, 100); // Small delay to ensure smooth transition
            
        } else if (this.activePicker.id === 'checkout-picker') {
            const checkinInput = document.getElementById('checkin');
            const checkinValue = checkinInput.value;
            
            // Validate checkout date
            if (checkinValue) {
                const checkinDate = this.parseDateInput(checkinValue);
                if (checkinDate && date <= checkinDate) {
                    alert('Abreise muss nach Anreise liegen.');
                    this.hideAllPickers();
                    return;
                }
                
                // Check minimum 4 nights
                const nights = Math.ceil((date - checkinDate) / (1000 * 60 * 60 * 24));
                if (nights < 4) {
                    alert('Mindestaufenthalt ist 4 Nächte.');
                    this.hideAllPickers();
                    return;
                }
                
                // Check for unavailable dates in the range
                if (this.hasUnavailableDates(checkinDate, date)) {
                    alert('Der gewählte Zeitraum enthält nicht verfügbare Daten. Bitte wählen Sie einen anderen Zeitraum.');
                    this.hideAllPickers();
                    return;
                }
            }
            
            document.getElementById('checkout').value = formattedDate;
        }
        
        this.hideAllPickers();
        
        // Update the main booking calendar to reflect the selection
        this.updateBookingCalendar();
        
        // Trigger cost calculation if both dates are selected
        this.triggerCostCalculation();
    }

    triggerCostCalculation() {
        const checkinInput = document.getElementById('checkin');
        const checkoutInput = document.getElementById('checkout');
        const guestSelect = document.getElementById('guests');
        
        if (checkinInput && checkoutInput && checkinInput.value && checkoutInput.value) {
            // Use the same cost calculation logic as the main calendar
            if (window.bookingCalendar && window.bookingCalendar.updateBookingSummary) {
                window.bookingCalendar.updateBookingSummary();
            }
        }
    }

    updateBookingCalendar() {
        const checkinInput = document.getElementById('checkin');
        const checkoutInput = document.getElementById('checkout');
        
        if (window.bookingCalendar) {
            // Parse the dates from the form inputs
            let startDate = null;
            let endDate = null;
            
            if (checkinInput && checkinInput.value) {
                startDate = this.parseDateInput(checkinInput.value);
            }
            
            if (checkoutInput && checkoutInput.value) {
                endDate = this.parseDateInput(checkoutInput.value);
            }
            
            // Update the booking calendar's selected dates
            if (startDate) {
                window.bookingCalendar.selectedDates.start = startDate;
            }
            if (endDate) {
                window.bookingCalendar.selectedDates.end = endDate;
            }
            
            // Navigate the main calendar to show the selected dates if they're not visible
            if (startDate || endDate) {
                const targetDate = startDate || endDate;
                const targetYear = targetDate.getFullYear();
                const targetMonth = targetDate.getMonth();
                
                // Check if the target month is within the current 2-month view
                const currentYear = window.bookingCalendar.currentDate.getFullYear();
                const currentMonth = window.bookingCalendar.currentDate.getMonth();
                const nextMonth = new Date(currentYear, currentMonth + 1, 1);
                const nextMonthYear = nextMonth.getFullYear();
                const nextMonthMonth = nextMonth.getMonth();
                
                // If target month is not in current view, navigate to it
                if (targetYear < currentYear || 
                    (targetYear === currentYear && targetMonth < currentMonth) ||
                    targetYear > nextMonthYear || 
                    (targetYear === nextMonthYear && targetMonth > nextMonthMonth)) {
                    
                    // Set the main calendar to show the month containing the target date
                    window.bookingCalendar.currentDate = new Date(targetYear, targetMonth, 1);
                }
            }
            
            // Re-render the calendar to show the selection
            window.bookingCalendar.renderCalendar();
            
            // Update the booking form dates in the calendar
            window.bookingCalendar.updateBookingFormDates();
        }
    }

    parseDateInput(dateString) {
        // Use the same parsing method as the main calendar for consistency
        const [day, month, year] = dateString.split('.').map(Number);
        if (day && month && year) {
            return new Date(year, month - 1, day);
        }
        return null;
    }

    hasUnavailableDates(startDate, endDate) {
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            if (this.isBooked(currentDate)) {
                return true;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return false;
    }

    validateBookingPeriod() {
        const checkinInput = document.getElementById('checkin');
        const checkoutInput = document.getElementById('checkout');
        
        if (!checkinInput.value || !checkoutInput.value) {
            return { valid: false, message: 'Bitte wählen Sie Anreise- und Abreisedatum.' };
        }
        
        const checkinDate = this.parseDateInput(checkinInput.value);
        const checkoutDate = this.parseDateInput(checkoutInput.value);
        
        if (!checkinDate || !checkoutDate) {
            return { valid: false, message: 'Ungültiges Datumsformat.' };
        }
        
        if (checkinDate >= checkoutDate) {
            return { valid: false, message: 'Abreise muss nach Anreise liegen.' };
        }
        
        const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
        if (nights < 4) {
            return { valid: false, message: 'Mindestaufenthalt ist 4 Nächte.' };
        }
        
        if (this.hasUnavailableDates(checkinDate, checkoutDate)) {
            return { valid: false, message: 'Der gewählte Zeitraum enthält nicht verfügbare Daten.' };
        }
        
        return { valid: true, nights: nights };
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    isDateInPast(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Create a new date object and set it to midnight in the local timezone
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        
        // Compare dates using UTC to avoid timezone issues
        const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        const checkDateUTC = Date.UTC(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
        
        return checkDateUTC < todayUTC;
    }

    isDateSelected(date) {
        if (!window.bookingCalendar || !window.bookingCalendar.selectedDates.start) return false;
        
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        
        const startDate = new Date(window.bookingCalendar.selectedDates.start);
        startDate.setHours(0, 0, 0, 0);
        
        if (window.bookingCalendar.selectedDates.end) {
            const endDate = new Date(window.bookingCalendar.selectedDates.end);
            endDate.setHours(0, 0, 0, 0);
            
            return checkDate.getTime() === startDate.getTime() || 
                   checkDate.getTime() === endDate.getTime();
        }
        
        return checkDate.getTime() === startDate.getTime();
    }

    isDateInRange(date) {
        if (!window.bookingCalendar || !window.bookingCalendar.selectedDates.start || !window.bookingCalendar.selectedDates.end) return false;
        
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        
        const startDate = new Date(window.bookingCalendar.selectedDates.start);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(window.bookingCalendar.selectedDates.end);
        endDate.setHours(0, 0, 0, 0);
        
        return checkDate.getTime() > startDate.getTime() && 
               checkDate.getTime() < endDate.getTime();
    }

    isBooked(date) {
        // Use the same UNAVAILABLE_DATES from calendar.js
        // This ensures consistency between the main calendar and date picker
        const UNAVAILABLE_DATES = [
            "2025-12-01",
            { from: "2025-09-05", to: "2025-10-07" },
            { from: "2025-08-02", to: "2025-08-05" },
        ];
        
        // Compare only the date part (not time)
        const dateStr = date.toISOString().split('T')[0];
        for (const entry of UNAVAILABLE_DATES) {
            if (typeof entry === "string") {
                if (entry === dateStr) return true;
            } else if (entry && entry.from && entry.to) {
                // Use Date objects for accurate comparison
                const from = new Date(entry.from);
                const to = new Date(entry.to);
                from.setHours(0,0,0,0);
                to.setHours(0,0,0,0);
                const check = new Date(date);
                check.setHours(0,0,0,0);
                if (check >= from && check <= to) return true;
            }
        }
        return false;
    }
}

// Initialize date picker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.datePicker = new DatePicker();
}); 