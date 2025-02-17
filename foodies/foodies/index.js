
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
          .then((registration) => {
              console.log('Service Worker registered :', registration.scope);
          })
          .catch((error) => {
              console.error('Service Worker registration failed:', error);
          });
  });
}


// IndexedDB setup
//const dbPromise = idb.openDB("zomato-db", 1, {
 //   upgrade(db) {
 //     if (!db.objectStoreNames.contains("orders")) {
 //       db.createObjectStore("orders", { keyPath: "id", autoIncrement: true });
 //   }
  //},
  //});
  
 // async function saveOrderOffline(order) {
 //   const db = await dbPromise;
   // const tx = db.transaction("orders", "readwrite");
   // tx.store.add(order);
   // await tx.done;
   // console.log("Order saved offline:", order);
  //}
  
  //async function syncOrders() {
   // const db = await dbPromise;
    //const tx = db.transaction("orders", "readonly");
    //const orders = await tx.store.getAll();
    
    // Simulate sending orders to the server
    //orders.forEach((order) => {
      //console.log("Syncing order:", order);
  
      // Remove order from IndexedDB once synced
      //const deleteTx = db.transaction("orders", "readwrite");
      //deleteTx.store.delete(order.id);
      //deleteTx.done;
    //});
  //}
  
  // Listen for online status 
 // window.addEventListener("online", syncOrders);

  //let deferredPrompt;
//const installButton = document.getElementById("install-button");

//window.addEventListener("beforeinstallprompt", (event) => {
  //event.preventDefault();
  //deferredPrompt = event;
  //installButton.style.display = "block";

  // installButton.addEventListener("click", () => {
  //   deferredPrompt.prompt();
  //   deferredPrompt.userChoice.then((choiceResult) => {
  //     if (choiceResult.outcome === "accepted") {
  //       console.log("User accepted the install prompt");
  //     } else {
  //       console.log("User dismissed the install prompt");
  //     }
  //     deferredPrompt = null;
  //   });
  // });
//});

window.addEventListener("appinstalled", () => {
  console.log("PWA installed");
});