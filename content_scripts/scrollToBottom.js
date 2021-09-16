(function () {
  /* Check if the script is injected
  */

  if (window.hasScript) {
    return;
  }
  window.hasScript = true;

  var currentlyScrollingInterval;
  var tabId;

  // console.log("scrollToBottom.js: Js is injected..");


  function scrollToBottom() {
    var maxScrollHeight = window.scrollMaxY;
    window.scrollTo(0, maxScrollHeight);
  }

  function toggleScrolling() {
    if (window.isScrollingToBottomFox) {
      window.clearInterval(currentlyScrollingInterval);
      browser.runtime.sendMessage({
        msg: "notRunning"
      });
      window.isScrollingToBottomFox = false;

      console.log("scrollToBottom.js: Sending message delTabFromScrollingList with tabId = " + tabId);

      browser.runtime.sendMessage({
        msg: "delTabFromScrollingList",
        tabId: tabId
      });
      // console.log("scrollToBottom.js: scrollToBottom is not running");
    } else {
      currentlyScrollingInterval = window.setInterval(scrollToBottom, 1000);
      browser.runtime.sendMessage({
        msg: "yesRunning"
      });
      window.isScrollingToBottomFox = true;

      // console.log("scrollToBottom.js: Sending message addTabToScrollingList with tabId = " + tabId);

      browser.runtime.sendMessage({
        msg: "addTabToScrollingList",
        tabId: tabId
      });
      // console.log("scrollToBottom.js: scrollToBottom is running");
    }
  }

  /* Listening to messages from background script */
  browser.runtime.onMessage.addListener((message) => {
    if (message.msg == "isRunning") {
      if (window.isScrollingToBottomFox) {
        browser.runtime.sendMessage({
          msg: "yesRunning"
        });
      } else {
        browser.runtime.sendMessage({
          msg: "notRunning"
        });
      }
    } else if (message.msg == "toggle-scrolling") {
      tabId = message.tabId;
      toggleScrolling();
    }
  });

  var handleKeydown = function (e) {
    // Dealing with double-click of "End" key
    if (e.key == "End") {
      var timeStamp = e.timeStamp;

      if (this.timeStampBefore == null) {
        this.timeStampBefore = timeStamp;
      } else {
        var delta = timeStamp - this.timeStampBefore;

        if (delta <= 200) {
          // Perform auto-scroll here
          toggleScrolling();
        }

        this.timeStampBefore = null;
      }
    } else if (e.key == "Home") {
      if (window.isScrollingToBottomFox) {
        toggleScrolling();
      }
    }
  };

  // document.body.addEventListener("keydown", handleKeydown, false);
})();
