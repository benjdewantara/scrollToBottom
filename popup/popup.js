console.log("popup.js: Executing popup.js..");

var populateTable = function(listScrollingTabIds_updated) {
    // Remove any children rows except for header
    if (tbody_listScrollingTabs.children.length > 1) {
        for (var idx = tbody_listScrollingTabs.children.length - 1; idx >= 1; idx --) {
            tbody_listScrollingTabs.children[idx].remove();
        }
    }
    
    console.log("popup.js:populateTable: tbody_listScrollingTabs = ");
    console.log(tbody_listScrollingTabs);
    
    console.log("popup.js:populateTable: listScrollingTabIds_updated = ");
    console.log(listScrollingTabIds_updated);

    for (let tabIdEntry of listScrollingTabIds_updated.entries()) {
        var gettingTab = browser.tabs.get(tabIdEntry[1]);
        gettingTab.then((tab) => {
            var tag_td_tabId = document.createElement("td");
            tag_td_tabId.textContent = tabIdEntry[1].toString();
    
            var tag_td_tabTitle = document.createElement("td");
            tag_td_tabTitle.textContent = tab.title;

            var buttonShow = document.createElement("button");
            buttonShow.textContent = "Show";
            buttonShow.classList.add("button-show");

            var tag_td_buttonShow = document.createElement("td");
            tag_td_buttonShow.appendChild(buttonShow);
            tag_td_buttonShow.classList.add("button-container");

            buttonShow.addEventListener("click", function(e) {
                browser.windows.update(tab.windowId, {
                    focused: true
                }).then(
                    browser.tabs.update(tab.id, {
                        active: true
                    })
                );
            });

            var tag_tr = document.createElement("tr");
            tag_tr.appendChild(tag_td_tabId);
            tag_tr.appendChild(tag_td_tabTitle);
            tag_tr.appendChild(tag_td_buttonShow);

            tbody_listScrollingTabs.appendChild(tag_tr);


        });

    }

    console.log("popup.js:populateTable: tbody_listScrollingTabs after populated = ");
    console.log(tbody_listScrollingTabs);

    console.log("popup.js:populateTable: tbody_listScrollingTabs.innerHTML after populated = ");
    console.log(tbody_listScrollingTabs.innerHTML);


    
    return;
}

var btn_toggleScrollingOnClickListener = function(event) {
    console.log("popup.js:btn_toggleScrollingOnClickListener: Injecting the script");

    var gettingActiveTab = browser.tabs.query({
        active: true,
        currentWindow: true
    });

    gettingActiveTab.then(function(tabArr) {
        // Inject the script
        var injectingScript = browser.tabs.executeScript({file: "../content_scripts/scrollToBottom.js"});
        injectingScript.then(function() {
            browser.tabs.sendMessage(tabArr[0].id, {
                msg: "toggle-scrolling",
                tabId: tabArr[0].id
            });
        });

        injectingScript.then(() => {
            browser.tabs.sendMessage(tabArr[0].id, {
                msg: "tabId",
                tabId: tabArr[0].id
            });
        });

        
    });
}

var btn_toggleScrolling = document.body.querySelector("button#btn-toggle-scrolling");
btn_toggleScrolling.addEventListener("click", btn_toggleScrollingOnClickListener);

browser.runtime.onMessage.addListener((message) => {
    var gettingActiveTab = browser.tabs.query({
        active: true,
        currentWindow: true
    });

    if (message.msg == "yesRunning") {
        document.querySelector("span#scrolling-statement").textContent = "scrolling";
    } else if (message.msg == "notRunning") {
        document.querySelector("span#scrolling-statement").textContent = "not scrolling";
    }

    if (message.msg == "update-table") {
        console.log("popup.js: Received message update-table");
        populateTable(message.listScrollingTabIds);
    }

    if (message.msg == "requestedListScrollingTabIds") {
        populateTable(message.listScrollingTabIds)
        console.log("popup.js: Received message requestedListScrollingTabIds");
    }
});


document.querySelector("span#scrolling-statement").textContent = "not scrolling";

// This assumes that the active tab on which the popup is opened
// has the script injected already and tries to see if the scrolling is running
var gettingActiveTab = browser.tabs.query({
    active: true,
    currentWindow: true
});

gettingActiveTab.then(function(tabArr) {
    console.log("popup.js:gettingActiveTab: tabArr[0].title = " + tabArr[0].title);
    browser.tabs.sendMessage(tabArr[0].id, {
        msg: "isRunning"
    });
});

var tbody_listScrollingTabs = document.querySelector("table#content-all-scrolling-tabs > tbody");

browser.runtime.sendMessage({
    msg: "requestListScrollingTabIds"
});

document.querySelector("table#content-all-scrolling-tabs").addEventListener("click", (e) => {
    console.log("popup.js: table#content-all-scrolling-tabs receives a click event with e = ");
    console.log(e);
});