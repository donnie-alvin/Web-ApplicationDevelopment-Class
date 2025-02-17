<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#ffffff">
  <title>Foodies Order Database</title>
  <link href="style.css" rel="stylesheet" type="text/css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet">
  <link rel="shortcut icon" type="image/png" href="./assets/logotop.png"/>
  <link rel="manifest" href="manifest.json">
  <script defer src="app.js"></script>
</head>
<body>
  <header>
    <nav class="navbar">
      <div class="navbar__brand">
        <img src="./assets/logotop.png" alt="logo" class="brand__logo"/>
      </div>
      <div class="navbar__nav__items">
        <div class="nav__item">
          <button class="primary__button" type="button" id="homeBtn">Home</button>
        </div>
      </div>
    </nav>
  </header>

  <main class="container">
    <!-- Database Controls Section -->
    <section class="database__controls">
      <h1>Order Database Management</h1>
      <div class="db__buttons">
        <button onclick="addEntry()" class="primary__button">Add Entry</button>
        <button onclick="getAllEntries()" class="primary__button">Show Entries</button>
        <button onclick="ClearDb()" class="primary__button">Clear Db</button>
      </div>
      <div id="output"></div>
    </section>

    <!-- Order Section -->
    <section class="order__food__container">
      <h1 class="text__heading" style="text-align:center;">Order Your Food</h1>
      <form id="order-form">
        <div class="food__menu__card__list">
          <div class="food__menu__card">
            <img src="./assets/burger.jpg" alt="burger image" class="food__menu__card__image">
            <div class="food__menu__description">
              <h4 class="food__menu__card__title">Burgers</h4>
              <input type="number" name="burger" min="0" placeholder="Quantity" />
            </div>
          </div>
          <div class="food__menu__card">
            <img src="./assets/pizza.jpg" alt="pizza image" class="food__menu__card__image">
            <div class="food__menu__description">
              <h4 class="food__menu__card__title">Pizza</h4>
              <input type="number" name="pizza" min="0" placeholder="Quantity" />
            </div>
          </div>
          <div class="food__menu__card">
            <img src="./assets/iceCream.jpg" alt="ice cream image" class="food__menu__card__image">
            <div class="food__menu__description">
              <h4 class="food__menu__card__title">Ice Cream</h4>
              <input type="number" name="iceCream" min="0" placeholder="Quantity" />
            </div>
          </div>
        </div>
        <button type="submit" class="primary__button">Submit Order</button>
      </form>
      <div id="order-summary" class="order-summary" style="margin-top: 20px;"></div>
    </section>
  </main>

  <footer>
    <img src="./assets/logo.png" alt="logo">
    <ul>
      <li>Pricing</li>
      <li>Terms and condition</li>
      <li>Partners</li>
      <li>Career</li>
      <li>Contact</li>
    </ul>
  </footer>

  <script>
    // IndexedDB initialization
    let db;
    const dbName = "FoodOrderDB";
    const request = indexedDB.open(dbName, 1);

    request.onerror = (event) => {
      console.error("Database error: " + event.target.error);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      const orderStore = db.createObjectStore("orders", { keyPath: "id", autoIncrement: true });
      orderStore.createIndex("date", "date", { unique: false });
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log("Database initialized successfully");
    };

    // Home button functionality
    document.getElementById('homeBtn').addEventListener('click', function() {
      window.location.href = 'index.php';
    });

    // Order form handling
    document.getElementById('order-form').addEventListener('submit', function(event) {
      event.preventDefault();
      let summary = 'Your Order Summary:\n';
      const formData = new FormData(this);
      const orderData = {};
      
      formData.forEach((value, key) => {
        if (value > 0) {
          summary += `${key}: ${value}\n`;
          orderData[key] = value;
        }
      });

      // Store order in IndexedDB
      if (Object.keys(orderData).length > 0) {
        const transaction = db.transaction(["orders"], "readwrite");
        const orderStore = transaction.objectStore("orders");
        orderData.date = new Date();
        
        const addRequest = orderStore.add(orderData);
        
        addRequest.onsuccess = () => {
          console.log("Order saved to database");
        };
        
        addRequest.onerror = () => {
          console.error("Error saving order");
        };
      }

      document.getElementById('order-summary').innerText = 
        summary === 'Your Order Summary:\n' ? 'No items ordered.' : summary;
    });

    // Database control functions
    function addEntry() {
      // Manual entry addition logic
    }

    function getAllEntries() {
      const transaction = db.transaction(["orders"], "readonly");
      const orderStore = transaction.objectStore("orders");
      const request = orderStore.getAll();

      request.onsuccess = () => {
        const orders = request.result;
        let output = "<h2>All Orders</h2>";
        orders.forEach(order => {
          output += `<p>Order ID: ${order.id}<br>`;
          output += `Date: ${order.date}<br>`;
          Object.entries(order).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'date') {
              output += `${key}: ${value}<br>`;
            }
          });
          output += "</p>";
        });
        document.getElementById('output').innerHTML = output;
      };
    }

    function ClearDb() {
      const transaction = db.transaction(["orders"], "readwrite");
      const orderStore = transaction.objectStore("orders");
      const request = orderStore.clear();

      request.onsuccess = () => {
        document.getElementById('output').innerHTML = "<p>Database cleared successfully</p>";
      };
    }
  </script>
</body>
</html>
