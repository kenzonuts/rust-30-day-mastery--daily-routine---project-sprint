// Daily Schedule Data
const dailySchedule = [
    { time: '04.15 – 05.00', activity: '🌅 Sahur + Subuh' },
    { time: '05.00 – 05.25', activity: '📚 Baca buku (25 menit)' },
    { time: '05.30 – 08.30', activity: '😴 Tidur lagi' },
    { time: '09.00 – 11.00', activity: '☀ Produktif ringan (review / planning / belajar)' },
    { time: '12.00 – 13.00', activity: '🕌 Dzuhur + istirahat' },
    { time: '13.00 – 15.00', activity: '🌤 Light session / santai produktif' },
    { time: '15.00 – 16.00', activity: '💤 Power nap opsional' },
    { time: '16.30 – 17.30', activity: '🚶 Olahraga ringan' },
    { time: '18.00 – 19.30', activity: '🌇 Buka + Maghrib + makan' },
    { time: '20.00 – 00.00', activity: '💻 Coding utama' },
    { time: '00.15', activity: '🌙 Tidur' }
];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeDateInfo();
    renderSchedule();
    loadWeeklyProgress();
    loadDailyChecklist();
    loadSavedNotes();
    setupEventListeners();
});

function initializeDateInfo() {
    const startDate = new Date(2026, 2, 3); // March 3, 2026
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const currentDay = Math.min(diffDays, 30);

    document.getElementById('current-date').textContent = today.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('day-counter').textContent = `Hari ${currentDay} dari 30`;
    document.getElementById('notes-date').textContent = today.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function renderSchedule() {
    const scheduleGrid = document.getElementById('schedule-grid');
    const today = getTodayKey();
    const completedSchedule = JSON.parse(localStorage.getItem(`schedule-${today}`) || '{}');

    scheduleGrid.innerHTML = dailySchedule.map((item, index) => {
        const isCompleted = completedSchedule[index] || false;
        return `
            <div class="schedule-item ${isCompleted ? 'completed' : ''}" data-index="${index}">
                <div class="schedule-time">${item.time}</div>
                <div class="schedule-activity">${item.activity}</div>
            </div>
        `;
    }).join('');

    // Add click handlers
    document.querySelectorAll('.schedule-item').forEach(item => {
        item.addEventListener('click', function() {
            const index = this.dataset.index;
            toggleScheduleItem(index);
        });
    });
}

function toggleScheduleItem(index) {
    const today = getTodayKey();
    const completedSchedule = JSON.parse(localStorage.getItem(`schedule-${today}`) || '{}');
    completedSchedule[index] = !completedSchedule[index];
    localStorage.setItem(`schedule-${today}`, JSON.stringify(completedSchedule));
    renderSchedule();
}

function loadWeeklyProgress() {
    const checkboxes = document.querySelectorAll('.outputs input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        const week = checkbox.dataset.week;
        const output = checkbox.dataset.output;
        const key = `week${week}-output${output}`;
        const isChecked = localStorage.getItem(key) === 'true';
        checkbox.checked = isChecked;

        checkbox.addEventListener('change', function() {
            localStorage.setItem(key, this.checked);
        });
    });
}

function loadDailyChecklist() {
    const checklist = document.getElementById('day-checklist');
    const today = getTodayKey();
    const dailyTasks = [
        'Sahur + Subuh',
        'Baca buku 25 menit',
        'Review/Planning pagi',
        'Dzuhur',
        'Light session siang',
        'Olahraga ringan',
        'Buka puasa',
        'Coding utama (4 jam)',
        'Catat insight buku'
    ];

    const completed = JSON.parse(localStorage.getItem(`checklist-${today}`) || '{}');

    checklist.innerHTML = dailyTasks.map((task, index) => {
        const isChecked = completed[index] || false;
        return `
            <div class="day-item ${isChecked ? 'checked' : ''}">
                <input type="checkbox" id="task-${index}" ${isChecked ? 'checked' : ''}>
                <label for="task-${index}">${task}</label>
            </div>
        `;
    }).join('');

    // Add event listeners
    checklist.querySelectorAll('input[type="checkbox"]').forEach((checkbox, index) => {
        checkbox.addEventListener('change', function() {
            const completed = JSON.parse(localStorage.getItem(`checklist-${today}`) || '{}');
            completed[index] = this.checked;
            localStorage.setItem(`checklist-${today}`, JSON.stringify(completed));
            this.closest('.day-item').classList.toggle('checked', this.checked);
        });
    });
}

function setupEventListeners() {
    document.getElementById('save-notes').addEventListener('click', saveNotes);
}

function saveNotes() {
    const today = getTodayKey();
    const insight1 = document.getElementById('insight-1').value.trim();
    const insight2 = document.getElementById('insight-2').value.trim();
    const insight3 = document.getElementById('insight-3').value.trim();
    const action = document.getElementById('action-item').value.trim();

    if (!insight1 && !insight2 && !insight3 && !action) {
        alert('Isi minimal satu field sebelum menyimpan');
        return;
    }

    const notes = {
        date: new Date().toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        insights: [insight1, insight2, insight3].filter(i => i),
        action: action
    };

    // Save to localStorage
    const allNotes = JSON.parse(localStorage.getItem('book-notes') || '{}');
    allNotes[today] = notes;
    localStorage.setItem('book-notes', JSON.stringify(allNotes));

    // Clear form
    document.getElementById('insight-1').value = '';
    document.getElementById('insight-2').value = '';
    document.getElementById('insight-3').value = '';
    document.getElementById('action-item').value = '';

    // Reload notes display
    loadSavedNotes();

    alert('Catatan berhasil disimpan!');
}

function loadSavedNotes() {
    const savedNotesContainer = document.getElementById('saved-notes');
    const allNotes = JSON.parse(localStorage.getItem('book-notes') || '{}');
    const notesArray = Object.entries(allNotes).reverse();

    if (notesArray.length === 0) {
        savedNotesContainer.innerHTML = '<p style="text-align: center; color: #999;">Belum ada catatan tersimpan</p>';
        return;
    }

    savedNotesContainer.innerHTML = notesArray.map(([date, note]) => `
        <div class="note-entry">
            <div class="note-date">${note.date}</div>
            ${note.insights.length > 0 ? `
                <div class="note-insights">
                    <h5>Insights:</h5>
                    <ul>
                        ${note.insights.map(insight => `<li>${insight}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            ${note.action ? `
                <div class="note-action">
                    <h5>Diterapkan:</h5>
                    <p>${note.action}</p>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}