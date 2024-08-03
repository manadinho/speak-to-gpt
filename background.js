chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    console.log("===page changed");
    chrome.tabs
      .sendMessage(tabId, {
        type: "page_changed",
        message: "page url changed",
        data: {},
      })
      .then((response) => {
        console.log("response", response);
      })
      .catch((error) => {
        console.log("error", error);
      });
  }
});
