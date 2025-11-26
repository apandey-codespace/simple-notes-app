// Notes data structure
let notes = [];
let currentNoteId = null;
let selectedTheme = null;

// Wait for the page to load
document.addEventListener('DOMContentLoaded', function () {
    // Check if we need to show theme selection
    const today = new Date().toDateString();
    const lastVisitDate = localStorage.getItem('lastVisitDate');
    const userTheme = localStorage.getItem('userTheme');

    // Load notes from localStorage
    const savedNotes = localStorage.getItem('notesApp_notes');
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
    }

    // Show theme selection if:
    // 1. First time visiting OR
    // 2. Browser was closed and reopened (sessionStorage cleared) OR
    // 3. It's a new day
    const shouldShowThemeSelection = !lastVisitDate ||
        !sessionStorage.getItem('hasSeenThemeToday') ||
        lastVisitDate !== today;

    if (shouldShowThemeSelection) {
        // Show theme selection after loading
        setTimeout(function () {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('theme-screen').style.display = 'flex';

            // Check system preference for dark mode
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                selectTheme(darkTheme, true);
            } else {
                selectTheme(lightTheme, false);
            }
        }, 2000);
    } else {
        // Apply saved theme and go directly to home screen
        applyTheme(userTheme);
        updateThemeDisplay(userTheme);
        setTimeout(function () {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('home-screen').style.display = 'flex';
            renderRecentNotes();
        }, 1500);
    }

    // Theme selection functionality
    const lightTheme = document.getElementById('light-theme');
    const darkTheme = document.getElementById('dark-theme');
    const skipBtn = document.getElementById('skip-btn');
    const confirmBtn = document.getElementById('confirm-btn');
    const aboutChangeThemeBtn = document.getElementById('about-change-theme-btn');
    const allNotesBtn = document.getElementById('all-notes-btn');
    const aboutBtn = document.getElementById('about-btn');
    const viewAllBtn = document.getElementById('view-all-btn');
    const addNoteBtn = document.getElementById('add-note-btn');
    const allNotesBackBtn = document.getElementById('all-notes-back-btn');
    const previewBackBtn = document.getElementById('preview-back-btn');
    const editBackBtn = document.getElementById('edit-back-btn');
    const aboutBackBtn = document.getElementById('about-back-btn');
    const editNoteBtn = document.getElementById('edit-note-btn');
    const deleteNoteBtn = document.getElementById('delete-note-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const dialogCancel = document.getElementById('dialog-cancel');
    const dialogConfirm = document.getElementById('dialog-confirm');
    const confirmationDialog = document.getElementById('confirmation-dialog');

    // Function to select a theme
    function selectTheme(themeElement, isDark) {
        // Remove selected class from both
        lightTheme.classList.remove('selected');
        darkTheme.classList.remove('selected');

        // Add selected class to chosen theme
        themeElement.classList.add('selected');

        // Change indicator to filled circle
        const indicators = document.querySelectorAll('.theme-indicator i');
        indicators.forEach(indicator => {
            indicator.className = 'far fa-circle';
        });

        themeElement.querySelector('.theme-indicator i').className = 'fas fa-check';

        // Apply theme immediately to selection page
        if (isDark) {
            document.body.classList.add('dark-theme');
            selectedTheme = 'dark';
        } else {
            document.body.classList.remove('dark-theme');
            selectedTheme = 'light';
        }
    }

    // Function to apply a theme
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    // Function to update theme display on about page
    function updateThemeDisplay(theme) {
        const aboutDisplay = document.getElementById('about-theme-display');
        if (theme === 'dark') {
            aboutDisplay.textContent = 'Dark Mode';
        } else {
            aboutDisplay.textContent = 'Light Mode';
        }
    }

    // Function to save notes to localStorage
    function saveNotes() {
        localStorage.setItem('notesApp_notes', JSON.stringify(notes));
    }

    // Function to create a new note
    function createNote(topic, description) {
        const newNote = {
            id: Date.now().toString(),
            topic: topic,
            description: description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        notes.unshift(newNote);
        saveNotes();
        return newNote;
    }

    // Function to update an existing note
    function updateNote(id, topic, description) {
        const noteIndex = notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            notes[noteIndex].topic = topic;
            notes[noteIndex].description = description;
            notes[noteIndex].updatedAt = new Date().toISOString();
            saveNotes();
            return notes[noteIndex];
        }
        return null;
    }

    // Function to delete a note
    function deleteNote(id) {
        const noteIndex = notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            notes.splice(noteIndex, 1);
            saveNotes();
            return true;
        }
        return false;
    }

    // Function to get a note by ID
    function getNoteById(id) {
        return notes.find(note => note.id === id);
    }

    // Function to get recent notes (last 2)
    function getRecentNotes() {
        return notes.slice(0, 2);
    }

    // Function to format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Function to render recent notes on home page
    function renderRecentNotes() {
        const recentNotesContainer = document.getElementById('recent-notes');
        const recentNotes = getRecentNotes();

        if (recentNotes.length === 0) {
            recentNotesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-sticky-note"></i>
                    </div>
                    <p>No notes yet. Create your first note!</p>
                </div>
            `;
            return;
        }

        recentNotesContainer.innerHTML = recentNotes.map(note => `
            <div class="note-card" data-note-id="${note.id}">
                <div class="note-topic">${note.topic || 'Untitled'}</div>
                <div class="note-description">${note.description || 'No description'}</div>
                <div class="note-date">${formatDate(note.updatedAt)}</div>
            </div>
        `).join('');

        // Add click event listeners to note cards
        document.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', function () {
                const noteId = this.getAttribute('data-note-id');
                showNotePreview(noteId);
            });
        });
    }

    // Function to render all notes
    function renderAllNotes() {
        const allNotesContainer = document.getElementById('all-notes-list');

        if (notes.length === 0) {
            allNotesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-sticky-note"></i>
                    </div>
                    <p>No notes yet. Create your first note!</p>
                </div>
            `;
            return;
        }

        allNotesContainer.innerHTML = notes.map(note => `
            <div class="note-card" data-note-id="${note.id}">
                <div class="note-topic">${note.topic || 'Untitled'}</div>
                <div class="note-description">${note.description || 'No description'}</div>
                <div class="note-date">${formatDate(note.updatedAt)}</div>
            </div>
        `).join('');

        // Add click event listeners to note cards
        document.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', function () {
                const noteId = this.getAttribute('data-note-id');
                showNotePreview(noteId);
            });
        });
    }

    // Function to show note preview
    function showNotePreview(noteId) {
        const note = getNoteById(noteId);
        if (!note) return;

        currentNoteId = noteId;

        document.getElementById('preview-note-topic').textContent = note.topic || 'Untitled';
        document.getElementById('preview-note-description').textContent = note.description || 'No description';
        document.getElementById('preview-note-date').textContent = `Created on: ${formatDate(note.createdAt)}`;

        // Hide current screen and show preview
        document.querySelectorAll('#home-screen, #all-notes-screen, #edit-note-screen, #about-screen').forEach(screen => {
            screen.style.display = 'none';
        });
        document.getElementById('note-preview-screen').style.display = 'flex';
    }

    // Function to show edit note screen
    function showEditNoteScreen(noteId = null) {
        const isEditing = noteId !== null;
        currentNoteId = noteId;

        document.getElementById('edit-screen-title').textContent = isEditing ? 'Edit Note' : 'Add New Note';

        if (isEditing) {
            const note = getNoteById(noteId);
            if (note) {
                document.getElementById('note-topic-input').value = note.topic || '';
                document.getElementById('note-description-input').value = note.description || '';
            }
        } else {
            document.getElementById('note-topic-input').value = '';
            document.getElementById('note-description-input').value = '';
        }

        // Hide current screen and show edit screen
        document.querySelectorAll('#home-screen, #all-notes-screen, #note-preview-screen, #about-screen').forEach(screen => {
            screen.style.display = 'none';
        });
        document.getElementById('edit-note-screen').style.display = 'flex';

        // Focus on topic input
        setTimeout(() => {
            document.getElementById('note-topic-input').focus();
        }, 100);
    }

    // Function to show all notes screen
    function showAllNotesScreen() {
        renderAllNotes();

        document.querySelectorAll('#home-screen, #note-preview-screen, #edit-note-screen, #about-screen').forEach(screen => {
            screen.style.display = 'none';
        });
        document.getElementById('all-notes-screen').style.display = 'flex';
    }

    // Function to show about screen
    function showAboutScreen() {
        document.querySelectorAll('#home-screen, #all-notes-screen, #note-preview-screen, #edit-note-screen').forEach(screen => {
            screen.style.display = 'none';
        });
        document.getElementById('about-screen').style.display = 'flex';
    }

    // Function to show home screen
    function showHomeScreen() {
        renderRecentNotes();

        document.querySelectorAll('#all-notes-screen, #note-preview-screen, #edit-note-screen, #about-screen').forEach(screen => {
            screen.style.display = 'none';
        });
        document.getElementById('home-screen').style.display = 'flex';
    }

    // Event listeners for theme selection
    lightTheme.addEventListener('click', function () {
        selectTheme(lightTheme, false);
    });

    darkTheme.addEventListener('click', function () {
        selectTheme(darkTheme, true);
    });

    // Skip button functionality
    skipBtn.addEventListener('click', function () {
        // Use light mode as default
        const today = new Date().toDateString();
        localStorage.setItem('userTheme', 'light');
        localStorage.setItem('lastVisitDate', today);
        sessionStorage.setItem('hasSeenThemeToday', 'true');

        document.getElementById('theme-screen').style.display = 'none';
        document.getElementById('home-screen').style.display = 'flex';
        updateThemeDisplay('light');
        renderRecentNotes();
    });

    // Confirm button functionality
    confirmBtn.addEventListener('click', function () {
        if (selectedTheme) {
            const today = new Date().toDateString();
            localStorage.setItem('userTheme', selectedTheme);
            localStorage.setItem('lastVisitDate', today);
            sessionStorage.setItem('hasSeenThemeToday', 'true');

            document.getElementById('theme-screen').style.display = 'none';
            document.getElementById('home-screen').style.display = 'flex';
            updateThemeDisplay(selectedTheme);
            renderRecentNotes();
        }
    });

    // About change theme button functionality
    aboutChangeThemeBtn.addEventListener('click', function () {
        // Clear the flags to show theme selection again
        localStorage.removeItem('lastVisitDate');
        sessionStorage.removeItem('hasSeenThemeToday');

        // Go back to theme selection
        document.getElementById('about-screen').style.display = 'none';
        document.getElementById('theme-screen').style.display = 'flex';

        // Pre-select the current theme
        const currentTheme = localStorage.getItem('userTheme') || 'light';
        if (currentTheme === 'dark') {
            selectTheme(darkTheme, true);
        } else {
            selectTheme(lightTheme, false);
        }
    });

    // Navigation buttons
    allNotesBtn.addEventListener('click', showAllNotesScreen);
    aboutBtn.addEventListener('click', showAboutScreen);
    viewAllBtn.addEventListener('click', showAllNotesScreen);
    addNoteBtn.addEventListener('click', function () {
        showEditNoteScreen();
    });

    // Back buttons
    allNotesBackBtn.addEventListener('click', showHomeScreen);
    previewBackBtn.addEventListener('click', function () {
        // Check if we came from home or all notes
        if (document.getElementById('all-notes-screen').style.display === 'flex') {
            showAllNotesScreen();
        } else {
            showHomeScreen();
        }
    });
    editBackBtn.addEventListener('click', function () {
        // Check if we came from home or preview
        if (currentNoteId && document.getElementById('note-preview-screen').style.display === 'flex') {
            showNotePreview(currentNoteId);
        } else {
            showHomeScreen();
        }
    });
    aboutBackBtn.addEventListener('click', showHomeScreen);

    // Note actions
    editNoteBtn.addEventListener('click', function () {
        if (currentNoteId) {
            showEditNoteScreen(currentNoteId);
        }
    });

    deleteNoteBtn.addEventListener('click', function () {
        if (currentNoteId) {
            confirmationDialog.style.display = 'flex';
        }
    });

    // Save note
    saveNoteBtn.addEventListener('click', function () {
        const topic = document.getElementById('note-topic-input').value.trim();
        const description = document.getElementById('note-description-input').value.trim();

        if (topic === '' && description === '') {
            alert('Please add a topic or description for your note.');
            return;
        }

        if (currentNoteId) {
            // Update existing note
            updateNote(currentNoteId, topic, description);
        } else {
            // Create new note
            createNote(topic, description);
        }

        // Go back to appropriate screen
        if (document.getElementById('all-notes-screen').style.display === 'flex') {
            showAllNotesScreen();
        } else {
            showHomeScreen();
        }
    });

    // Cancel edit
    cancelEditBtn.addEventListener('click', function () {
        if (currentNoteId) {
            showNotePreview(currentNoteId);
        } else {
            showHomeScreen();
        }
    });

    // Confirmation dialog
    dialogCancel.addEventListener('click', function () {
        confirmationDialog.style.display = 'none';
    });

    dialogConfirm.addEventListener('click', function () {
        if (currentNoteId) {
            deleteNote(currentNoteId);
            confirmationDialog.style.display = 'none';
            showHomeScreen();
        }
    });

    // Store that the user has seen the theme today when they leave the page
    window.addEventListener('beforeunload', function () {
        if (document.getElementById('home-screen').style.display === 'flex' ||
            document.getElementById('all-notes-screen').style.display === 'flex' ||
            document.getElementById('note-preview-screen').style.display === 'flex' ||
            document.getElementById('edit-note-screen').style.display === 'flex' ||
            document.getElementById('about-screen').style.display === 'flex') {
            sessionStorage.setItem('hasSeenThemeToday', 'true');
        }
    });
});
