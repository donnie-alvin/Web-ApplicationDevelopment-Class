<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#ffffff">
  <title>Foodies Order</title>
  <link href="style.css" rel="stylesheet" type="text/css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet">
  <link rel="shortcut icon" type="image/png" href="./assets/logotop.png"/>
  <link rel="manifest" href="manifest.json">
  <script defer src="index.js"></script>
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
    <!-- Previous sections remain unchanged -->
    
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
    
    <!-- Rest of the sections remain unchanged -->
    
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
  </main>
  <script>
  document.getElementById('homeBtn').addEventListener('click', function() {
    // Redirect to the index.php page
    window.location.href = 'index.php';
  });

  document.getElementById('order-form').addEventListener('submit', function(event) {
    event.preventDefault();
    let summary = 'Your Order Summary:\n';
    const formData = new FormData(this);
    formData.forEach((value, key) => {
      if (value > 0) {
        summary += `${key}: ${value}\n`;
      }
    });
    document.getElementById('order-summary').innerText = summary === 'Your Order Summary:\n' ? 'No items ordered.' : summary;
  });
 
  </script>
</body>
</html>
