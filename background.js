chrome.action.onClicked.addListener(function() {
  chrome.tabs.create({
    url: 'index.html'
  });
});
chrome.runtime.onInstalled.addListener(() => {
	console.log("Init");
	getData();	
})

async function getData(){
    var a = await fetch("./src/data.json");
    var b = await a.json();
    chrome.storage.local.set({'data': b});
    
}
