// === BEGIN: Unavailable Dates Feature ===

// 1. Hardcoded unavailable dates (ISO format, yyyy-mm-dd)
const UNAVAILABLE_DATES = [
    { from: "2026-05-01", to: "2026-05-14" },
];

class BookingCalendar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        // Always start from the first day of the current month
        const now = new Date();
        this.currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
        this.selectedDates = {
            start: null,
            end: null
        };
        this.bookedDates = []; // This will be populated from your backend
        this.monthsToShow = 2; // Show 2 months at a time
        // Store the minimum allowed month/year for navigation
        this.minYear = now.getFullYear();
        this.minMonth = now.getMonth();
        this.currentYear = this.minYear;
        this.nextYear = this.currentYear + 1;
        this.init();
    }

    init() {
        this.renderCalendar();
        this.setupEventListeners();
    }

    renderCalendar() {
        let html = `
            <div class="calendar-header">
                <div class="header-line">
                    <h3>Verfügbarkeit</h3>
                </div>
                <div class="header-line">
                    <button class="prev-year" ${(this.currentDate.getFullYear() <= this.minYear && this.currentDate.getMonth() <= this.minMonth) ? 'disabled' : ''}>&lt;&lt;</button>
                    <button class="prev-month" ${(this.currentDate.getFullYear() === this.minYear && this.currentDate.getMonth() <= this.minMonth) ? 'disabled' : ''}>&lt;</button>
                    <h3>${this.currentDate.getFullYear()}</h3>
                    <button class="next-month" ${(this.currentDate.getMonth() === 11 && this.currentDate.getFullYear() === this.nextYear) ? 'disabled' : ''}>&gt;</button>
                    <button class="next-year" ${(this.currentDate.getFullYear() >= this.nextYear) ? 'disabled' : ''}>&gt;&gt;</button>
                </div>
            </div>
            <div class="months-container">
        `;

        for (let i = 0; i < this.monthsToShow; i++) {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + i, 1);
            html += this.renderMonth(date);
        }

        html += '</div>';
        this.container.innerHTML = html;
    }

    renderMonth(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        let html = `
            <div class="month-container">
                <h3>${this.getMonthName(month)} ${year}</h3>
                <div class="calendar-grid">
                    <div class="weekdays">
                        <span>Mo</span>
                        <span>Di</span>
                        <span>Mi</span>
                        <span>Do</span>
                        <span>Fr</span>
                        <span>Sa</span>
                        <span>So</span>
                    </div>
                    <div class="days">
        `;

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < (firstDay.getDay() || 7) - 1; i++) {
            html += '<div class="day empty"></div>';
        }

        // Add days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const currentDate = new Date(year, month, day);
            const isBooked = this.isDateBooked(currentDate);
            const isPast = this.isDateInPast(currentDate);
            const isUnavailable = this.isDateUnavailable(currentDate);
            const isSelected = this.isDateSelected(currentDate);
            const isInRange = this.isDateInRange(currentDate);
            
            let classes = 'day';
            if (isBooked) classes += ' booked';
            if (isPast) classes += ' past';
            if (isUnavailable) classes += ' unavailable';
            if (isSelected) classes += ' selected';
            if (isInRange) classes += ' in-range';

            // Visually disable end dates that are too close to the start date
            let isTooSoon = false;
            if (this.selectedDates.start && !this.selectedDates.end) {
                const startDate = new Date(this.selectedDates.start);
                startDate.setHours(0,0,0,0);
                const checkDate = new Date(currentDate);
                checkDate.setHours(0,0,0,0);
                const nights = Math.ceil((checkDate - startDate) / (1000 * 60 * 60 * 24));
                // Only mark as too-soon if after start date but less than 4 nights
                if (checkDate > startDate && nights < 4) {
                    isTooSoon = true;
                    classes += ' too-soon';
                }
            }
            
            // Add data attribute for past or unavailable dates
            const dataAttributes = [
                (isPast || isUnavailable) ? 'data-past="true"' : '',
                isTooSoon ? 'data-too-soon="true"' : ''
            ].filter(Boolean).join(' ');
            
            html += `<div class="${classes}" data-date="${currentDate.toISOString()}" ${dataAttributes}>${day}</div>`;
        }

        html += '</div></div></div>';
        return html;
    }

    setupEventListeners() {
        // Separate event listeners for navigation and date selection
        this.setupNavigationListeners();
        this.setupDateSelectionListeners();
    }

    setupNavigationListeners() {
        // Navigation buttons with direct event listeners
        const prevMonthBtn = this.container.querySelector('.prev-month');
        const nextMonthBtn = this.container.querySelector('.next-month');
        const prevYearBtn = this.container.querySelector('.prev-year');
        const nextYearBtn = this.container.querySelector('.next-year');

        if (prevMonthBtn) {
            prevMonthBtn.onclick = (e) => {
                e.stopPropagation(); // Prevent event bubbling
                // Prevent navigating to months before the current month
                if (
                    (this.currentDate.getFullYear() === this.minYear && this.currentDate.getMonth() <= this.minMonth)
                ) {
                    return;
                }
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                // If we go before the min month, reset to min month
                if (
                    this.currentDate.getFullYear() < this.minYear ||
                    (this.currentDate.getFullYear() === this.minYear && this.currentDate.getMonth() < this.minMonth)
                ) {
                    this.currentDate = new Date(this.minYear, this.minMonth, 1);
                }
                this.renderCalendar();
                this.setupNavigationListeners(); // Reattach listeners after render
            };
        }

        if (nextMonthBtn) {
            nextMonthBtn.onclick = (e) => {
                e.stopPropagation(); // Prevent event bubbling
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderCalendar();
                this.setupNavigationListeners(); // Reattach listeners after render
            };
        }

        if (prevYearBtn) {
            prevYearBtn.onclick = (e) => {
                e.stopPropagation(); // Prevent event bubbling
                // Prevent navigating to years before the min year/month
                if (
                    (this.currentDate.getFullYear() === this.minYear && this.currentDate.getMonth() <= this.minMonth)
                ) {
                    return;
                }
                this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
                // If we go before the min year/month, reset to min year/month
                if (
                    this.currentDate.getFullYear() < this.minYear ||
                    (this.currentDate.getFullYear() === this.minYear && this.currentDate.getMonth() < this.minMonth)
                ) {
                    this.currentDate = new Date(this.minYear, this.minMonth, 1);
                }
                this.renderCalendar();
                this.setupNavigationListeners(); // Reattach listeners after render
            };
        }

        if (nextYearBtn) {
            nextYearBtn.onclick = (e) => {
                e.stopPropagation(); // Prevent event bubbling
                if (this.currentDate.getFullYear() < this.nextYear) {
                    this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
                    this.renderCalendar();
                    this.setupNavigationListeners(); // Reattach listeners after render
                }
            };
        }
    }

    setupDateSelectionListeners() {
        // Use event delegation for day clicks, but be more specific
        this.container.addEventListener('click', (e) => {
            // Only handle clicks on day elements, not navigation buttons
            if (e.target.classList.contains('day') && !e.target.classList.contains('empty')) {
                e.stopPropagation(); // Prevent event bubbling
                // Prevent selection if booked, past, unavailable, or too-soon
                if (
                    this.isDateBooked(new Date(e.target.dataset.date)) ||
                    this.isDateInPast(new Date(e.target.dataset.date)) ||
                    this.isDateUnavailable(new Date(e.target.dataset.date)) ||
                    e.target.classList.contains('too-soon')
                ) {
                    return;
                }
                const date = new Date(e.target.dataset.date);
                console.log('Day clicked:', e.target.dataset.date);
                this.handleDayClick(e.target);
            }
        });
    }

    handleDayClick(day) {
        const date = new Date(day.dataset.date);
        console.log('Handling click for date:', date);

        if (this.isDateBooked(date) || this.isDateInPast(date) || this.isDateUnavailable(date)) {
            console.log('Date is booked, past, or unavailable, returning');
            return;
        }

        // If no date is selected or both dates are selected, start new selection
        if (!this.selectedDates.start || (this.selectedDates.start && this.selectedDates.end)) {
            console.log('Starting new selection');
            this.selectedDates.start = date;
            this.selectedDates.end = null;
            // Reset cost calculation when starting new selection
            this.updateCostCalculation(0);
        } 
        // If only start date is selected, handle different cases
        else if (this.selectedDates.start && !this.selectedDates.end) {
            const startDate = new Date(this.selectedDates.start);
            startDate.setHours(0, 0, 0, 0);
            const selectedDate = new Date(date);
            selectedDate.setHours(0, 0, 0, 0);

            // If selected date is before current start date, make it the new start date
            if (selectedDate.getTime() < startDate.getTime()) {
                console.log('Selected earlier date, setting as new start date');
                this.selectedDates.start = date;
                this.selectedDates.end = null;
                // Reset cost calculation when changing start date
                this.updateCostCalculation(0);
            }
            // If selected date is after current start date, try to set as end date
            else if (selectedDate.getTime() > startDate.getTime()) {
                console.log('Attempting to set end date');
                const nights = Math.ceil((selectedDate - startDate) / (1000 * 60 * 60 * 24));
                console.log('Date comparison:', {
                    startDate: startDate.getTime(),
                    endDate: selectedDate.getTime(),
                    nights: nights,
                    isValid: selectedDate.getTime() >= startDate.getTime() && nights >= 4
                });

                // Check for unavailable dates in the range
                if (nights >= 4) {
                    if (this.isRangeUnavailable(startDate, selectedDate)) {
                        alert('Der gewählte Zeitraum enthält nicht verfügbare Tage.');
                        // Restart selection
                        this.selectedDates.start = null;
                        this.selectedDates.end = null;
                        this.renderCalendar();
                        this.setupNavigationListeners();
                        this.updateBookingSummary();
                        this.updateBookingFormDates();
                        return;
                    }
                    console.log('Setting end date');
                    this.selectedDates.end = date;
                } else {
                    alert('Die Mindestaufenthaltsdauer beträgt 4 Nächte.');
                }
            }
            // If selected date is the same as start date, do nothing
            else {
                console.log('Selected same date as start date, no action needed');
            }
        }

        console.log('New state:', {
            start: this.selectedDates.start,
            end: this.selectedDates.end
        });

        this.renderCalendar();
        this.setupNavigationListeners();
        this.updateBookingSummary();
        this.updateBookingFormDates();
        this.updateBookingSummary();
    }

    isDateBooked(date) {
        return this.bookedDates.some(bookedDate => 
            date.toDateString() === new Date(bookedDate).toDateString()
        );
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
        if (!this.selectedDates.start) return false;
        
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        
        const startDate = new Date(this.selectedDates.start);
        startDate.setHours(0, 0, 0, 0);
        
        if (this.selectedDates.end) {
            const endDate = new Date(this.selectedDates.end);
            endDate.setHours(0, 0, 0, 0);
            
            return checkDate.getTime() === startDate.getTime() || 
                   checkDate.getTime() === endDate.getTime();
        }
        
        return checkDate.getTime() === startDate.getTime();
    }

    isDateInRange(date) {
        if (!this.selectedDates.start || !this.selectedDates.end) return false;
        
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        
        const startDate = new Date(this.selectedDates.start);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(this.selectedDates.end);
        endDate.setHours(0, 0, 0, 0);
        
        return checkDate.getTime() > startDate.getTime() && 
               checkDate.getTime() < endDate.getTime();
    }

    // Add this method to the BookingCalendar class
    isDateUnavailable(date) {
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

    // Update isDateInPast to allow combined logic if needed
    isDateInPastOrUnavailable(date) {
        return this.isDateInPast(date) || this.isDateUnavailable(date);
    }

    // Helper to check if any date in a range is unavailable
    isRangeUnavailable(startDate, endDate) {
        let current = new Date(startDate);
        current.setHours(0,0,0,0);
        const end = new Date(endDate);
        end.setHours(0,0,0,0);
        while (current <= end) {
            if (this.isDateUnavailable(current)) {
                return true;
            }
            current.setDate(current.getDate() + 1);
        }
        return false;
    }

    getMonthName(month) {
        const months = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];
        return months[month];
    }

    updateBookingSummary() {
        const summary = document.getElementById('mobile-cost-card');
        if (!summary) return;

        // Get values from the main booking form
        const checkinInput = document.getElementById('checkin');
        const checkoutInput = document.getElementById('checkout');
        const guestSelect = document.getElementById('guests');

        let start = null;
        let end = null;
        let guests = '';
        if (checkinInput && checkinInput.value) {
            start = window.bookingCalendar.parseEuropeanDate(checkinInput.value);
        }
        if (checkoutInput && checkoutInput.value) {
            end = window.bookingCalendar.parseEuropeanDate(checkoutInput.value);
        }
        if (guestSelect && guestSelect.value) {
            guests = guestSelect.value;
        }

        if (start && end && guests) {
            // Use UTC methods to avoid timezone issues
            const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
            const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
            
            // Calculate nights using Math.ceil to match other calculations in the code
            const nights = Math.ceil((endUTC - startUTC) / (1000 * 60 * 60 * 24));
            window.bookingCalendar.updateCostCalculation(nights, guests);
        } else {
            window.bookingCalendar.updateCostCalculation(0, guests);
        }
    }

    updateBookingFormDates() {
        const checkinInput = document.getElementById('checkin');
        const checkoutInput = document.getElementById('checkout');
        const summaryCheckinInput = document.getElementById('summary-checkin');
        const summaryCheckoutInput = document.getElementById('summary-checkout');
        
        // Update or clear checkin input
        if (checkinInput) {
            if (this.selectedDates.start) {
                checkinInput.value = this.formatDateForInput(this.selectedDates.start);
            } else {
                checkinInput.value = '';
            }
        }
        
        // Update or clear checkout input
        if (checkoutInput) {
            if (this.selectedDates.end) {
                checkoutInput.value = this.formatDateForInput(this.selectedDates.end);
            } else {
                checkoutInput.value = '';
            }
        }
        
        // Update or clear summary inputs
        if (summaryCheckinInput) {
            if (this.selectedDates.start) {
                summaryCheckinInput.value = this.formatDateForInput(this.selectedDates.start);
            } else {
                summaryCheckinInput.value = '';
            }
        }
        
        if (summaryCheckoutInput) {
            if (this.selectedDates.end) {
                summaryCheckoutInput.value = this.formatDateForInput(this.selectedDates.end);
            } else {
                summaryCheckoutInput.value = '';
            }
        }
    }

    formatDateForInput(date) {
        // Format date for European display (DD.MM.YYYY)
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    parseEuropeanDate(dateString) {
        // Parse European date format (DD.MM.YYYY) to Date object
        const [day, month, year] = dateString.split('.').map(Number);
        if (day && month && year) {
            return new Date(year, month - 1, day);
        }
        return null;
    }

    calculateNightlyRate(guests) {
        // Calculate nightly rate based on number of guests
        switch(parseInt(guests)) {
            case 1: return 95;
            case 2: return 105;
            case 3: return 115;
            case 4: return 125;
            case 5: return 135;
            default: return 0;
        }
    }

    updateCostCalculation(nights, guestsOverride) {
        // Always get guests from the main booking form
        let guests = guestsOverride;
        if (!guests) {
            const guestSelect = document.getElementById('guests');
            guests = guestSelect ? guestSelect.value : '';
        }

        // Prepare HTML for cost calculation
        let html = '';
        if (!guests || nights <= 0) {
            html = `
                <div class="cost-item">
                    <span>Unterkunft (– Nächte × – €)</span>
                    <span>–</span>
                </div>
                <div class="cost-item">
                    <span>Bettwäsche und Handtücher</span>
                    <span>–</span>
                </div>
                <div class="cost-item subtotal">
                    <span>Zwischensumme</span>
                    <span>–</span>
                </div>
                <div class="cost-item">
                    <span>Endreinigung</span>
                    <span>–</span>
                </div>
                <div class="cost-item total">
                    <span>Gesamtpreis</span>
                    <span>–</span>
                </div>
            `;
        } else {
            const nightlyRate = this.calculateNightlyRate(guests);
            const accommodationCost = nightlyRate * nights;
            const bedsheetFee = 10 * guests;
            const subtotal = accommodationCost + bedsheetFee;
            const cleaningFee = 80;
            const total = subtotal + cleaningFee;

            html = `
                <div class="cost-item">
                    <span>Unterkunft (${nights} Nächt${nights > 1 ? 'e' : ''} × ${nightlyRate}€ / ${guests} Person${guests > 1 ? 'en' : ''})</span>
                    <span>${accommodationCost.toFixed(2)}€</span>
                </div>
                <div class="cost-item">
                    <span>Bettwäsche und Handtücher</span>
                    <span>${bedsheetFee.toFixed(2)}€</span>
                </div>
                <div class="cost-item subtotal">
                    <span>Zwischensumme</span>
                    <span>${subtotal.toFixed(2)}€</span>
                </div>
                <div class="cost-item">
                    <span>Endreinigung</span>
                    <span>${cleaningFee.toFixed(2)}€</span>
                </div>
                <div class="cost-item total">
                    <span>Gesamtpreis</span>
                    <span>${total.toFixed(2)}€</span>
                </div>
            `;
        }

        // Update mobile-cost-card if it exists
        const summary = document.getElementById('mobile-cost-card');
        if (summary) {
            const costDisplay = summary.querySelector('.cost-calculation');
            if (costDisplay) costDisplay.innerHTML = html;
        }

        // Update desktop-cost-card if it exists
        const desktopCard = document.getElementById('desktop-cost-card');
        if (desktopCard) {
            const desktopCostDisplay = desktopCard.querySelector('.cost-calculation');
            if (desktopCostDisplay) desktopCostDisplay.innerHTML = html;
        }
    }

    formatDate(date) {
        // Ensure European date format (DD.MM.YYYY)
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }
}
// === END: Unavailable Dates Feature ===

// Initialize the calendar when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create calendar instance and make it globally accessible
    window.bookingCalendar = new BookingCalendar('booking-calendar');
    
    // Sync guest selection between main form and summary
    const mainGuestSelect = document.getElementById('guests');
    if (mainGuestSelect) {
        mainGuestSelect.addEventListener('change', (e) => {
            const summaryGuestSelect = document.getElementById('summary-guests');
            if (summaryGuestSelect) {
                summaryGuestSelect.value = e.target.value;
            }
            
            // Update cost calculation when guest selection changes
            const calendar = window.bookingCalendar;
            if (calendar && calendar.selectedDates.start && calendar.selectedDates.end) {
                const nights = Math.ceil((calendar.selectedDates.end - calendar.selectedDates.start) / (1000 * 60 * 60 * 24));
                calendar.updateCostCalculation(nights);
            }
        });
    }
    
    // Initialize the booking form
    initBookingForm();
    
    // Initialize summary date inputs
    initSummaryDateInputs();

    // Ensure desktop cost card always shows placeholders on load
    const calendar = window.bookingCalendar;
    if (calendar) {
        calendar.updateCostCalculation(0);
    }

    // Add event listeners for all reset buttons
    document.querySelectorAll('.reset-btn').forEach(btn => {
        btn.addEventListener('click', resetDateSelection);
    });
});

function initBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    if (!bookingForm) return;
    
    // Set minimum dates for check-in and check-out
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    
    if (checkinInput) {
        // Set minimum date in European format
        const minDate = window.bookingCalendar.formatDateForInput(tomorrow);
        checkinInput.setAttribute('data-min-date', minDate);
        
        // Add event listener to sync check-in changes with calendar
        checkinInput.addEventListener('change', function() {
            const calendar = window.bookingCalendar;
            if (calendar && this.value) {
                // Parse European date format
                const newDate = calendar.parseEuropeanDate(this.value);
                if (newDate) {
                    calendar.selectedDates.start = newDate;
                    // If end date is set, check for unavailable dates in the new range
                    if (calendar.selectedDates.end) {
                        const endDate = new Date(calendar.selectedDates.end);
                        endDate.setHours(0,0,0,0);
                        const startDate = new Date(newDate);
                        startDate.setHours(0,0,0,0);
                        if (endDate > startDate) {
                            const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                            if (nights >= 4 && calendar.isRangeUnavailable(startDate, endDate)) {
                                alert('Der gewählte Zeitraum enthält nicht verfügbare Tage.');
                                resetDateSelection();
                                return;
                            }
                        }
                    }
                    calendar.renderCalendar();
                    calendar.updateBookingSummary();
                }
            }
        });
    }
    
    if (checkoutInput) {
        // Set minimum date in European format
        const minDate = window.bookingCalendar.formatDateForInput(tomorrow);
        checkoutInput.setAttribute('data-min-date', minDate);
        
        // Add event listener to sync check-out changes with calendar
        checkoutInput.addEventListener('change', function() {
            const calendar = window.bookingCalendar;
            if (calendar && this.value) {
                // Parse European date format
                const newDate = calendar.parseEuropeanDate(this.value);
                if (newDate) {
                    // Check end date is after start date
                    if (calendar.selectedDates.start) {
                        const startDate = new Date(calendar.selectedDates.start);
                        startDate.setHours(0,0,0,0);
                        if (newDate <= startDate) {
                            alert('Das Abreisedatum muss nach dem Anreisedatum liegen.');
                            this.value = '';
                            resetDateSelection();
                            return;
                        }
                        const nights = Math.ceil((newDate - startDate) / (1000 * 60 * 60 * 24));
                        if (newDate > startDate && nights < 4) {
                            alert('Die Mindestaufenthaltsdauer beträgt 4 Nächte.');
                            this.value = '';
                            resetDateSelection();
                            return;
                        }
                        // Check for unavailable dates in the range
                        if (nights >= 4 && calendar.isRangeUnavailable(startDate, newDate)) {
                            alert('Der gewählte Zeitraum enthält nicht verfügbare Tage.');
                            this.value = '';
                            resetDateSelection();
                            return;
                        }
                    }
                    calendar.selectedDates.end = newDate;
                    calendar.renderCalendar();
                    calendar.updateBookingSummary();
                }
            }
        });
    }
    
    // Handle form submission for Formspree integration
    bookingForm.addEventListener('submit', function(e) {
        // Get the current cost calculation
        const costDisplay = document.querySelector('.cost-calculation');
        if (costDisplay) {
            const costSummary = costDisplay.textContent || costDisplay.innerText;
            document.getElementById('cost-summary').value = costSummary;
        }
        
        // Show success message after a short delay (to allow form submission)
        setTimeout(() => {
            const successMessage = document.getElementById('form-success');
            if (successMessage) {
                successMessage.style.display = 'block';
                // Hide the form
                bookingForm.style.display = 'none';
                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth' });
            }
        }, 1000);
        
        // Let the form submit to Formspree normally
        // No preventDefault() needed
    });
    
    // Update checkout minimum date when checkin changes
    if (checkinInput && checkoutInput) {
        checkinInput.addEventListener('change', function() {
            const calendar = window.bookingCalendar;
            const checkinDate = calendar.parseEuropeanDate(this.value);
            if (checkinDate) {
                const nextDay = new Date(checkinDate);
                nextDay.setDate(nextDay.getDate() + 1);
                const minDate = calendar.formatDateForInput(nextDay);
                checkoutInput.setAttribute('data-min-date', minDate);
                
                // If checkout date is before new checkin date, clear it
                if (checkoutInput.value) {
                    const checkoutDate = calendar.parseEuropeanDate(checkoutInput.value);
                    if (checkoutDate && checkoutDate <= checkinDate) {
                        checkoutInput.value = '';
                    }
                }
            }
        });
    }
}

function initSummaryDateInputs() {
    const summaryCheckinInput = document.getElementById('summary-checkin');
    const summaryCheckoutInput = document.getElementById('summary-checkout');
    
    if (summaryCheckinInput) {
        summaryCheckinInput.addEventListener('change', function() {
            const calendar = window.bookingCalendar;
            if (calendar && this.value) {
                // Parse European date format
                const newDate = calendar.parseEuropeanDate(this.value);
                if (newDate) {
                    calendar.selectedDates.start = newDate;
                    // If end date is set, check for unavailable dates in the new range
                    if (calendar.selectedDates.end) {
                        const endDate = new Date(calendar.selectedDates.end);
                        endDate.setHours(0,0,0,0);
                        const startDate = new Date(newDate);
                        startDate.setHours(0,0,0,0);
                        if (endDate > startDate) {
                            const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                            if (nights >= 4 && calendar.isRangeUnavailable(startDate, endDate)) {
                                alert('Der gewählte Zeitraum enthält nicht verfügbare Tage.');
                                resetDateSelection();
                                return;
                            }
                        }
                    }
                    calendar.renderCalendar();
                    calendar.updateBookingSummary();
                }
            }
        });
    }
    
    if (summaryCheckoutInput) {
        summaryCheckoutInput.addEventListener('change', function() {
            const calendar = window.bookingCalendar;
            if (calendar && this.value) {
                // Parse European date format
                const newDate = calendar.parseEuropeanDate(this.value);
                if (newDate) {
                    // Check end date is after start date
                    if (calendar.selectedDates.start) {
                        const startDate = new Date(calendar.selectedDates.start);
                        startDate.setHours(0,0,0,0);
                        if (newDate <= startDate) {
                            alert('Das Abreisedatum muss nach dem Anreisedatum liegen.');
                            this.value = '';
                            resetDateSelection();
                            return;
                        }
                        const nights = Math.ceil((newDate - startDate) / (1000 * 60 * 60 * 24));
                        if (newDate > startDate && nights < 4) {
                            alert('Die Mindestaufenthaltsdauer beträgt 4 Nächte.');
                            this.value = '';
                            resetDateSelection();
                            return;
                        }
                        // Check for unavailable dates in the range
                        if (nights >= 4 && calendar.isRangeUnavailable(startDate, newDate)) {
                            alert('Der gewählte Zeitraum enthält nicht verfügbare Tage.');
                            this.value = '';
                            resetDateSelection();
                            return;
                        }
                    }
                    calendar.selectedDates.end = newDate;
                    calendar.renderCalendar();
                    calendar.updateBookingSummary();
                }
            }
        });
    }
}

// Helper to reset date selection everywhere
function resetDateSelection() {
    const calendar = window.bookingCalendar;
    if (!calendar) return;
    calendar.selectedDates.start = null;
    calendar.selectedDates.end = null;
    // Clear booking form inputs
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    if (checkinInput) checkinInput.value = '';
    if (checkoutInput) checkoutInput.value = '';
    // Clear summary inputs
    const summaryCheckinInput = document.getElementById('summary-checkin');
    const summaryCheckoutInput = document.getElementById('summary-checkout');
    if (summaryCheckinInput) summaryCheckinInput.value = '';
    if (summaryCheckoutInput) summaryCheckoutInput.value = '';
    calendar.renderCalendar();
    calendar.setupNavigationListeners(); // Ensure navigation buttons are reattached after reset
    calendar.updateBookingSummary();
}

// Custom slow scroll for anchor links

document.addEventListener('DOMContentLoaded', function () {
    // Select all anchor links that scroll to an id on the same page
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            // Only handle if the target is on the current page
            const href = anchor.getAttribute('href');
            if (href.length > 1 && document.getElementById(href.substring(1))) {
                e.preventDefault();
                
                // Handle mobile-specific navigation for images section
                if (href === '#desktop-card' && window.innerWidth <= 768) {
                    const mobileImagesSection = document.getElementById('mobile-images');
                    if (mobileImagesSection) {
                        // Use smooth scroll to mobile images section
                        mobileImagesSection.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                        return;
                    }
                }
                
                const target = document.getElementById(href.substring(1));
                if (!target) return;
                // Custom slow scroll
                slowScrollTo(target, 1500); // 1500ms for slower effect
            }
        });
    });

    function slowScrollTo(element, duration) {
        const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 70;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;
        const startPosition = window.pageYOffset;
        const distance = offsetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                window.scrollTo(0, offsetPosition);
                // Update the URL hash without causing a jump
                if (element.id) {
                    history.replaceState(null, '', '#' + element.id);
                }
            }
        }

        // Ease function for smooth effect
        function easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }
});