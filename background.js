var listScrollingTabIds = [];

// send message to popup.js to update the table of scrolling tabs
function updatePopupTableOfScrollingTabs() {
    console.log("background.js: Sending message to update listScrollingTabIds");

    browser.runtime.sendMessage({
        msg: "update-table",
        listScrollingTabIds: listScrollingTabIds
    })
}

function updateIcon(tab, isScrolling) {
    if (isScrolling) {
        var settingIcon = browser.browserAction.setIcon({
            tabId: tab.id,
            path: "icons/scrollToBottomFox-ON.png"
        });
    } else {
        var settingIcon = browser.browserAction.setIcon({
            tabId: tab.id,
            path: "icons/scrollToBottomFox-OFF.png"
        });
    }
}

function browserActionOnClickListener(tab) {
    browser.tabs.sendMessage(tab.id, {
        msg: "toggle-scrolling",
        tabId: tab.id
    });

}

function browserTabsOnActivatedListener(activeInfo) {
    var gettingActiveTab = browser.tabs.get(activeInfo.tabId);
    gettingActiveTab.then((tabInfo) => {
        // Automatically inject script to any tab
        var injectingScript = browser.tabs.executeScript({file: "content_scripts/scrollToBottom.js"});
        injectingScript.then(() => {
            browser.tabs.sendMessage(tabInfo.id, {
                msg: "tabId",
                tabId: tabInfo.id
            });
        });
        
        updateIcon(tabInfo, false);

        if (listScrollingTabIds.indexOf(tabInfo.id) !== -1) {
            updateIcon(tabInfo, true);
        }
    });
}

function browserRuntimeOnMessageListener(message) {
    // Concerning listScrollingTabIds manipulation
    // messages are sent whenever a tab starts/stops scrolling
    if (message.msg == "addTabToScrollingList") {
        console.log("background.js: Message addTabToScrollingList received");
        console.log("background.js: message.tabId = " + message.tabId);

        var gettingTab = browser.tabs.get(message.tabId);
        gettingTab.then((tab) => {
            listScrollingTabIds.push(tab.id);
            updatePopupTableOfScrollingTabs();
            updateIcon(tab.id, true);
        });
    } else if (message.msg == "delTabFromScrollingList") {
        console.log("background.js: Message delTabFromScrollingList received");
        console.log("background.js: message.tabId = " + message.tabId);
        var delIndx = listScrollingTabIds.indexOf(message.tabId);
        updateIcon(message.tabId, false);
        listScrollingTabIds.splice(delIndx, 1);
        updatePopupTableOfScrollingTabs();
    }

    if (message.msg == "requestListScrollingTabIds") {
        browser.runtime.sendMessage({
            msg: "requestedListScrollingTabIds",
            listScrollingTabIds: listScrollingTabIds
        });
    }   
}

function browserTabsOnUpdatedListener(tabId, changeInfo, tab) {
    if ((changeInfo.status === "complete") & (listScrollingTabIds.indexOf(tabId) !== -1)) {
        listScrollingTabIds.splice(listScrollingTabIds.indexOf(tabId), 1);
        updatePopupTableOfScrollingTabs();
    }
}

// listen when to tab switching and see if the tab has scrollToBottom running
browser.tabs.onActivated.addListener(browserTabsOnActivatedListener);

// listen when the extension button on toolbar is clicked    
browser.browserAction.onClicked.addListener(browserActionOnClickListener);

// listen when a content script sends message
browser.runtime.onMessage.addListener(browserRuntimeOnMessageListener);

// listen when a tab is updated
browser.tabs.onUpdated.addListener(browserTabsOnUpdatedListener);