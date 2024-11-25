// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
            console.log('Service Worker registrado con éxito:', registration);

            registration.onupdatefound = function() {
                const installingWorker = registration.installing;
                installingWorker.onstatechange = function() {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            if (confirm('Nueva versión disponible. ¿Quieres actualizar?')) {
                                window.location.reload();
                            }
                        }
                    }
                };
            };
        }).catch(function(error) {
            console.error('Error al registrar el Service Worker:', error);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    startSync(); // Iniciar sincronización periódica
    document.getElementById('add-note').addEventListener('click', addNote);
    document.getElementById('clear-notes').addEventListener('click', clearNotes);
});

function addNote() {
    console.log("Botón 'Agregar Nota' presionado");

    let notesList = document.getElementById('notes-list');
    let newNote = document.createElement('div');
    newNote.className = 'note';

    let textarea = document.createElement('textarea');
    textarea.placeholder = 'Nueva Nota...';

    newNote.appendChild(textarea);
    notesList.appendChild(newNote);

    console.log("Nota agregada en el DOM, ahora guardando en la base de datos.");

    // Guardar la nueva nota en la base de datos cuando el usuario termine de escribir
    textarea.addEventListener('blur', function() {
        const contentValue = textarea.value.trim(); // Captura el contenido sin espacios en blanco
        if (contentValue) {
            fetch('create_note.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `content=${encodeURIComponent(contentValue)}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    newNote.dataset.id = data.id;
                    console.log('Nota creada con éxito en la base de datos, ID:', data.id);
                    saveNotes();
                } else {
                    console.error('Error al crear la nota:', data.error);
                }
            })
            .catch(error => console.error('Error al enviar la nota al servidor:', error));
        } else {
            console.warn("La nota está vacía, no se enviará al servidor.");
        }
    });
}



// Guardar todas las notas actuales en localStorage
function saveNotes() {
    let notes = [];
    document.querySelectorAll('.note').forEach(note => {
        notes.push({
            id: note.dataset.id || null,
            content: note.querySelector('textarea').value
        });
    });
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Cargar notas desde localStorage y luego sincronizar con la base de datos
function loadNotes() {
    let savedNotes = JSON.parse(localStorage.getItem('notes'));

    if (savedNotes && savedNotes.length > 0) {
        renderNotes(savedNotes);
    } else {
        syncNotes(); // Si no hay notas locales, carga desde la base de datos
    }
}

// Función para renderizar notas en la pantalla
function renderNotes(notes) {
    let notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';
    notes.forEach(noteData => {
        let note = document.createElement('div');
        note.className = 'note';
        note.dataset.id = noteData.id;

        let textarea = document.createElement('textarea');
        textarea.value = noteData.content;
        textarea.addEventListener('input', saveNotes);

        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Borrar Nota';
        deleteButton.className = 'delete-note';
        deleteButton.addEventListener('click', function() {
            deleteNoteFromDatabase(noteData.id);
            note.remove();
            saveNotes();
        });

        note.appendChild(textarea);
        note.appendChild(deleteButton);
        notesList.appendChild(note);
    });
}

// Sincronizar notas con la base de datos
function syncNotes() {
    if (navigator.onLine) {
        fetch('get_notes.php')
            .then(response => response.json())
            .then(serverNotes => {
                console.log('Notas sincronizadas desde el servidor:', serverNotes);
                renderNotes(serverNotes);
                localStorage.setItem('notes', JSON.stringify(serverNotes));
            })
            .catch(error => console.error('Error al sincronizar las notas:', error));
    }
}

// Eliminar una nota de la base de datos
function deleteNoteFromDatabase(noteId) {
    if (!noteId) return; // Verificar que el ID no esté vacío o nulo
    fetch('delete_note.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `id=${noteId}`
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            console.error('Error al borrar la nota:', data.error);
        } else {
            console.log(`Nota con ID ${noteId} eliminada de la base de datos`);
        }
    })
    .catch(error => console.error('Error al intentar borrar la nota:', error));
}

// Borrar todas las notas de la pantalla y de localStorage
function clearNotes() {
    if (confirm('¿Estás seguro de que quieres borrar todas las notas?')) {
        document.getElementById('notes-list').innerHTML = '';
        localStorage.removeItem('notes');
        // Aquí también podrías agregar una función para borrar todas las notas de la base de datos, si fuera necesario
    }
}

// Función para iniciar la sincronización periódica
function startSync() {
    setInterval(syncNotes, 60000); // Sincroniza cada 60 segundos
}
