chrome.action.onClicked.addListener(function() {
  chrome.tabs.create({
    url: 'index.html'
  });
});
chrome.runtime.onInstalled.addListener(() => {
	console.log("Init");
	getData();
    chrome.contextMenus.create({
        title: "Ôn tập đọc Xquang",
        id: "xq",
        contexts: ["action"]
    })	
    chrome.contextMenus.create({
        title: "Ôn luyện ECG",
        id: "ecg",
        contexts: ["action"]
    })	
})

chrome.contextMenus.onClicked.addListener(({
    menuItemId,
    selectionText
}) => {
    if (menuItemId === 'ecg') {
            chrome.tabs.create({
                url: chrome.runtime.getURL("./ecg/index.html")
            })
        }
	else if (menuItemId === 'xq') {
            chrome.tabs.create({
                url: chrome.runtime.getURL("./xq/index.html")
            })
        }
});
chrome.action.setTitle({
    title: chrome.runtime.getManifest().description
});
async function getData(){
    var a = await fetch("./src/data.json");
    var b = await a.json();
    chrome.storage.local.set({'data': b});
    
}

console.log("\n %c " + chrome.runtime.getManifest().name + " extension version: " + chrome.runtime.getManifest().version + ", được viết bởi Anh Phê %c https://facebook.com/phebungphe1995 ", "color: #FFF; background: #222d38; padding:5px 0;background-size: 300% 100%;background-image: linear-gradient(to right, #25aae1, #024fd6, #04befe, #3f86ed);", "color: #FFF; border: 1px solid #8f8f8f;padding:4px 0;");
