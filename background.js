// Snippets Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
    // Context menu definitions
    const contexts = [
        { id: 'save-selection', title: 'Save selection to Snippets', contexts: ['selection'] },
        { id: 'save-link', title: 'Save link to Snippets', contexts: ['link'] },
        { id: 'save-image', title: 'Save image to Snippets', contexts: ['image'] },
        { id: 'save-page', title: 'Save page to Snippets', contexts: ['page'] }
    ];

    contexts.forEach(({ id, title, contexts: ctxList }) => {
        chrome.contextMenus.create({
            id,
            title,
            contexts: ctxList
        });
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    let snippetType = 'text';
    let content = '';

    if (info.menuItemId === 'save-selection' && info.selectionText) {
        snippetType = 'text';
        content = info.selectionText;
    } else if (info.menuItemId === 'save-link' && info.linkUrl) {
        snippetType = 'link';
        content = info.linkUrl;
    } else if (info.menuItemId === 'save-image' && info.srcUrl) {
        snippetType = 'image';
        content = info.srcUrl;
    } else if (info.menuItemId === 'save-page') {
        snippetType = 'page';
        content = info.pageUrl || (tab && tab.url) || '';
    }

    if (!content) return;

    const newSnippet = {
        id: (typeof crypto !== 'undefined' && crypto.randomUUID) 
            ? crypto.randomUUID() 
            : Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        text: content,
        title: (tab && tab.title) ? tab.title : (info.pageUrl || 'Web Snippet'),
        url: (tab && tab.url) ? tab.url : (info.pageUrl || ''),
        type: snippetType,
        pinned: false,
        date: new Date().toISOString()
    };

    chrome.storage.local.get(['snippets'], (result) => {
        const current = result.snippets || [];
        const updated = [newSnippet, ...current];

        chrome.storage.local.set({ snippets: updated }, () => {
            // Flash badge to give visual confirmation
            chrome.action.setBadgeText({ text: '✓' });
            chrome.action.setBadgeBackgroundColor({ color: '#4f80ff' });

            setTimeout(() => {
                chrome.action.setBadgeText({ text: '' });
            }, 1500);
        });
    });
});
