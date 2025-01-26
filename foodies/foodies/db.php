<?php
$servername = "localhost"; // Your database server
$username = "root"; // Your database username
$password = ""; // Your database password
$dbname = "zomato"; // Your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Function to create a new user
function createUser($name, $email, $password) {
    global $conn;
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $name, $email, $hashedPassword);
    $stmt->execute();
    $stmt->close();
}

// Function to create a new order
function createOrder($userId, $foodItem, $quantity) {
    global $conn;
    $stmt = $conn->prepare("INSERT INTO orders (user_id, food_item, quantity) VALUES (?, ?, ?)");
    $stmt->bind_param("isi", $userId, $foodItem, $quantity);
    $stmt->execute();
    $stmt->close();
}

// Example usage
// createUser('John Doe', 'john@example.com', 'password123');
// createOrder(1, 'Burger', 2);

// Close the connection
$conn->close();
?>