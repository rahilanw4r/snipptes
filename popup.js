document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const pinnedList = document.getElementById('pinned-list');
    const recentList = document.getElementById('recent-list');
    const pinnedSection = document.getElementById('pinned-section');
    const recentSection = document.getElementById('recent-section');
    const emptyState = document.getElementById('empty-state');

    // Header Actions
    const selectModeBtn = document.getElementById('select-mode-btn');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const cancelSelectBtn = document.getElementById('cancel-select-btn');
    const settingsBtn = document.getElementById('settings-btn');

    // Search & Filter
    const searchInput = document.getElementById('search-input');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Modals
    const editModal = document.getElementById('edit-modal');
    const settingsModal = document.getElementById('settings-modal');

    // Edit Form
    const editText = document.getElementById('edit-text');
    const editTitle = document.getElementById('edit-title');
    const saveEditBtn = document.getElementById('save-edit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // Settings Form
    const exportBtn = document.getElementById('export-btn');
    const importBtnTrigger = document.getElementById('import-btn-trigger');
    const importFile = document.getElementById('import-file');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');

    // --- State ---
    let currentSnippets = [];
    let isSelectionMode = false;
    const selectedSnippetIds = new Set();
    let currentFilter = 'all';
    let currentSearch = '';
    let editingSnippetId = null;
    let toastTimeout = null;

    // --- Storage Abstraction ---
    const storage = {
        getSnippets(callback) {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(['snippets'], (result) => {
                    callback(result.snippets || []);
                });
            } else {
                try {
                    const data = JSON.parse(localStorage.getItem('snippets') || '[]');
                    callback(Array.isArray(data) ? data : []);
                } catch {
                    callback([]);
                }
            }
        },
        saveSnippets(snippets, callback) {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ snippets }, callback);
            } else {
                try {
                    localStorage.setItem('snippets', JSON.stringify(snippets));
                } catch (err) {
                    console.error('Storage error:', err);
                }
                if (callback) callback();
            }
        }
    };

    // --- Initialization ---
    loadSnippets();

    // --- Event Listeners ---

    // Search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.trim().toLowerCase();
            renderSnippets(currentSnippets);
        });
    }

    // Filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.type || 'all';
            renderSnippets(currentSnippets);
        });
    });

    // Selection Mode
    if (selectModeBtn) selectModeBtn.addEventListener('click', () => toggleSelectionMode(true));
    if (cancelSelectBtn) cancelSelectBtn.addEventListener('click', () => toggleSelectionMode(false));

    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', () => {
            if (selectedSnippetIds.size === 0) {
                showToast('No snippets selected');
                return;
            }
            const count = selectedSnippetIds.size;
            if (confirm(`Are you sure you want to delete ${count} snippet${count > 1 ? 's' : ''}?`)) {
                currentSnippets = currentSnippets.filter(s => !selectedSnippetIds.has(s.id));
                saveAndRender(`${count} snippet${count > 1 ? 's' : ''} deleted`);
                toggleSelectionMode(false);
            }
        });
    }

    // Settings Modal
    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', () => settingsModal.style.display = 'flex');
    }
    if (closeSettingsBtn && settingsModal) {
        closeSettingsBtn.addEventListener('click', () => settingsModal.style.display = 'none');
    }

    // Clear All
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete ALL snippets? This cannot be undone.')) {
                currentSnippets = [];
                saveAndRender('All snippets cleared');
                if (settingsModal) settingsModal.style.display = 'none';
            }
        });
    }

    // Export
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const dataStr = JSON.stringify(currentSnippets, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `snippets_backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showToast('Export completed');
        });
    }

    // Import
    if (importBtnTrigger && importFile) {
        importBtnTrigger.addEventListener('click', () => importFile.click());
    }

    if (importFile) {
        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    if (Array.isArray(imported)) {
                        const validItems = imported.filter(item => item && item.text && item.id);
                        const newItems = validItems.map(item => ({
                            ...item,
                            id: generateId(),
                            date: item.date || new Date().toISOString()
                        }));

                        currentSnippets = [...newItems, ...currentSnippets];
                        saveAndRender(`${newItems.length} snippet${newItems.length === 1 ? '' : 's'} imported`);
                        if (settingsModal) settingsModal.style.display = 'none';
                    } else {
                        alert('Invalid JSON format: Expected an array.');
                    }
                } catch (err) {
                    alert('Error parsing JSON file.');
                    console.error(err);
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        });
    }

    // Edit Modal
    if (cancelEditBtn && editModal) {
        cancelEditBtn.addEventListener('click', () => {
            editModal.style.display = 'none';
            editingSnippetId = null;
        });
    }

    if (saveEditBtn && editModal) {
        saveEditBtn.addEventListener('click', () => {
            if (!editingSnippetId) return;

            const snippet = currentSnippets.find(s => s.id === editingSnippetId);
            if (snippet) {
                snippet.text = editText.value;
                snippet.title = editTitle.value.trim();
                snippet.updatedAt = new Date().toISOString();

                saveAndRender('Snippet updated');
                editModal.style.display = 'none';
                editingSnippetId = null;
            }
        });
    }

    // Close Modals on Overlay Backdrop Click
    [editModal, settingsModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    if (modal === editModal) editingSnippetId = null;
                }
            });
        }
    });

    // Close on Escape Key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (editModal && editModal.style.display === 'flex') {
                editModal.style.display = 'none';
                editingSnippetId = null;
            }
            if (settingsModal && settingsModal.style.display === 'flex') {
                settingsModal.style.display = 'none';
            }
            if (isSelectionMode) {
                toggleSelectionMode(false);
            }
        }
    });

    // --- Core Functions ---

    function loadSnippets() {
        storage.getSnippets((snippets) => {
            currentSnippets = snippets;
            renderSnippets(currentSnippets);
        });
    }

    function saveAndRender(toastMsg) {
        storage.saveSnippets(currentSnippets, () => {
            renderSnippets(currentSnippets);
            if (toastMsg) showToast(toastMsg);
        });
    }

    function renderSnippets(snippets) {
        // Filter & Search
        const filtered = snippets.filter(s => {
            if (currentFilter !== 'all' && s.type !== currentFilter) return false;
            if (currentSearch) {
                const textMatch = (s.text || '').toLowerCase().includes(currentSearch);
                const titleMatch = (s.title || '').toLowerCase().includes(currentSearch);
                const urlMatch = (s.url || '').toLowerCase().includes(currentSearch);
                return textMatch || titleMatch || urlMatch;
            }
            return true;
        });

        // Clear Lists
        if (pinnedList) pinnedList.innerHTML = '';
        if (recentList) recentList.innerHTML = '';

        if (filtered.length === 0) {
            if (pinnedSection) pinnedSection.style.display = 'none';
            if (recentSection) recentSection.style.display = 'none';
            if (emptyState) {
                emptyState.style.display = 'flex';
                const p = emptyState.querySelector('p');
                const small = emptyState.querySelector('small');
                if (currentSearch || currentFilter !== 'all') {
                    if (p) p.textContent = 'No matches found.';
                    if (small) small.textContent = 'Try adjusting your search or filters.';
                } else {
                    if (p) p.textContent = 'No snippets yet.';
                    if (small) small.textContent = 'Select text on any page, right-click, and choose "Save to Snippets".';
                }
            }
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        const pinnedSnippets = filtered.filter(s => s.pinned);
        const recentSnippets = filtered.filter(s => !s.pinned);

        if (pinnedSection && pinnedList) {
            if (pinnedSnippets.length > 0) {
                pinnedSection.style.display = 'flex';
                pinnedSnippets.forEach(s => pinnedList.appendChild(createSnippetCard(s)));
            } else {
                pinnedSection.style.display = 'none';
            }
        }

        if (recentSection && recentList) {
            if (recentSnippets.length > 0) {
                recentSection.style.display = 'flex';
                recentSnippets.forEach(s => recentList.appendChild(createSnippetCard(s)));
            } else {
                recentSection.style.display = 'none';
            }
        }
    }

    function createSnippetCard(snippet) {
        const card = document.createElement('div');
        const isSelected = selectedSnippetIds.has(snippet.id);
        card.className = `snippet-card${snippet.pinned ? ' pinned' : ''}${isSelected ? ' selected' : ''}`;
        card.dataset.id = snippet.id;

        if (!isSelectionMode) {
            card.draggable = true;
        }

        let contentHtml = '';
        let readMoreDisplay = 'none';
        let displayTitle = snippet.title || 'Unknown Source';
        if (displayTitle.length > 30) {
            displayTitle = displayTitle.substring(0, 27) + '...';
        }

        const safeUrl = snippet.url ? escapeHtml(snippet.url) : '';
        const safeText = escapeHtml(snippet.text || '');

        if (snippet.type === 'image') {
            contentHtml = `<img src="${safeText}" alt="Saved Image" class="snippet-image" loading="lazy">`;
        } else if (snippet.type === 'link' || snippet.type === 'page') {
            contentHtml = `<a href="${safeText}" target="_blank" rel="noopener noreferrer" class="snippet-link">${safeText}</a>`;
        } else {
            const isLongText = (snippet.text || '').length > 150;
            const contentClass = isLongText ? 'snippet-content clamped' : 'snippet-content';
            readMoreDisplay = isLongText ? 'block' : 'none';
            contentHtml = `<div class="${contentClass}">${safeText}</div>`;
        }

        card.innerHTML = `
            <div class="selection-checkbox${isSelected ? ' checked' : ''}"></div>
            <div class="drag-handle" title="Drag to reorder">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
            </div>
            ${contentHtml}
            <button class="read-more-btn" style="display: ${readMoreDisplay}">Read More</button>
            <div class="snippet-meta">
                <span class="snippet-source" title="${safeUrl}">${escapeHtml(displayTitle)}</span>
                <span>${formatDate(snippet.date)}</span>
            </div>
            <div class="snippet-actions">
                <button class="action-btn pin" title="${snippet.pinned ? 'Unpin' : 'Pin'}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="${snippet.pinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                </button>
                <button class="action-btn edit" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="action-btn copy" title="Copy">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
                <button class="action-btn delete" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;

        if (!isSelectionMode) {
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragover', handleDragOver);
            card.addEventListener('dragenter', handleDragEnter);
            card.addEventListener('dragleave', handleDragLeave);
            card.addEventListener('drop', handleDrop);
            card.addEventListener('dragend', handleDragEnd);

            const readMoreBtn = card.querySelector('.read-more-btn');
            if (readMoreBtn) {
                readMoreBtn.addEventListener('click', () => toggleReadMore(card));
            }

            const pinBtn = card.querySelector('.pin');
            if (pinBtn) {
                pinBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    togglePin(snippet.id);
                });
            }

            const copyBtn = card.querySelector('.copy');
            if (copyBtn) {
                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    copyText(snippet.text);
                });
            }

            const deleteBtn = card.querySelector('.delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteSnippet(snippet.id);
                });
            }

            const editBtn = card.querySelector('.edit');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEditModal(snippet.id);
                });
            }
        } else {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('read-more-btn')) return;
                toggleSnippetSelection(snippet.id);
            });
        }

        return card;
    }

    // --- Helper Functions ---

    function toggleSelectionMode(active) {
        isSelectionMode = active;
        selectedSnippetIds.clear();

        if (active) {
            document.body.classList.add('selection-mode');
            if (selectModeBtn) selectModeBtn.style.display = 'none';
            if (settingsBtn) settingsBtn.style.display = 'none';
            if (deleteSelectedBtn) deleteSelectedBtn.style.display = 'flex';
            if (cancelSelectBtn) cancelSelectBtn.style.display = 'flex';
        } else {
            document.body.classList.remove('selection-mode');
            if (selectModeBtn) selectModeBtn.style.display = 'flex';
            if (settingsBtn) settingsBtn.style.display = 'flex';
            if (deleteSelectedBtn) deleteSelectedBtn.style.display = 'none';
            if (cancelSelectBtn) cancelSelectBtn.style.display = 'none';
        }
        renderSnippets(currentSnippets);
    }

    function toggleSnippetSelection(id) {
        if (selectedSnippetIds.has(id)) {
            selectedSnippetIds.delete(id);
        } else {
            selectedSnippetIds.add(id);
        }
        renderSnippets(currentSnippets);
    }

    function toggleReadMore(card) {
        const content = card.querySelector('.snippet-content');
        const readMoreBtn = card.querySelector('.read-more-btn');
        if (!content || !readMoreBtn) return;

        const isExpanded = !content.classList.contains('clamped');
        if (isExpanded) {
            content.classList.add('clamped');
            readMoreBtn.textContent = 'Read More';
        } else {
            content.classList.remove('clamped');
            readMoreBtn.textContent = 'Read Less';
        }
    }

    function togglePin(id) {
        const index = currentSnippets.findIndex(s => s.id === id);
        if (index === -1) return;

        const snippet = currentSnippets[index];
        snippet.pinned = !snippet.pinned;

        currentSnippets.splice(index, 1);
        if (snippet.pinned) {
            currentSnippets.unshift(snippet);
        } else {
            const lastPinnedIndex = currentSnippets.findLastIndex(s => s.pinned);
            const insertIndex = lastPinnedIndex === -1 ? 0 : lastPinnedIndex + 1;
            currentSnippets.splice(insertIndex, 0, snippet);
        }

        saveAndRender(snippet.pinned ? 'Snippet Pinned' : 'Snippet Unpinned');
    }

    function deleteSnippet(id) {
        if (confirm('Are you sure you want to delete this snippet?')) {
            currentSnippets = currentSnippets.filter(s => s.id !== id);
            selectedSnippetIds.delete(id);
            saveAndRender('Snippet deleted');
        }
    }

    function openEditModal(id) {
        const snippet = currentSnippets.find(s => s.id === id);
        if (snippet && editModal && editText && editTitle) {
            editingSnippetId = id;
            editText.value = snippet.text || '';
            editTitle.value = snippet.title || '';
            editModal.style.display = 'flex';
            editText.focus();
        }
    }

    function copyText(text) {
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!'));
        } else {
            const fallback = document.createElement('textarea');
            fallback.value = text;
            fallback.style.position = 'fixed';
            fallback.style.opacity = '0';
            document.body.appendChild(fallback);
            fallback.select();
            try {
                document.execCommand('copy');
                showToast('Copied to clipboard!');
            } finally {
                document.body.removeChild(fallback);
            }
        }
    }

    // --- Drag & Drop ---
    let dragSrcEl = null;

    function handleDragStart(e) {
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.id);
        this.classList.add('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDragEnter(e) {
        if (this !== dragSrcEl) {
            this.classList.add('drag-over');
        }
    }

    function handleDragLeave(e) {
        if (!this.contains(e.relatedTarget)) {
            this.classList.remove('drag-over');
        }
    }

    function handleDrop(e) {
        e.stopPropagation();
        if (dragSrcEl !== this) {
            const draggedId = e.dataTransfer.getData('text/plain');
            const targetId = this.dataset.id;
            const draggedCard = document.querySelector(`[data-id="${draggedId}"]`);
            if (!draggedCard) return;

            if (this.parentElement !== draggedCard.parentElement) {
                showToast('Manual pinning only');
                return;
            }

            const draggedIndex = currentSnippets.findIndex(s => s.id === draggedId);
            if (draggedIndex === -1) return;

            const [movedItem] = currentSnippets.splice(draggedIndex, 1);
            const newTargetIndex = currentSnippets.findIndex(s => s.id === targetId);

            if (newTargetIndex === -1) {
                currentSnippets.push(movedItem);
            } else {
                currentSnippets.splice(newTargetIndex, 0, movedItem);
            }
            saveAndRender();
        }
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        document.querySelectorAll('.snippet-card').forEach(c => c.classList.remove('drag-over'));
    }

    // --- Utilities ---

    function generateId() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function formatDate(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        if (toastTimeout) clearTimeout(toastTimeout);

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        toast.offsetHeight;
        toast.classList.add('show');

        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 250);
        }, 1800);
    }
});
