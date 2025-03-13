---

# **Opinion Trading App**  

## **Overview**  
The **Opinion Trading App** is a web-based platform that allows users to place trades on various events, view real-time market data, and manage their accounts. The platform features **authentication**, an **admin panel**, **real-time WebSocket updates**, and a **database seed script** for initializing test data.  

---

## **Features**  

### ✅ User Authentication  
- Users can sign up and log in with JWT-based authentication.  

### ✅ Trading System  
- Users can place trades on events based on market data.  

### ✅ Admin Panel  
- Admins can view **live events** and **trades** in real-time.  
- Admins can **create events**, **update event status**, and **settle trades**.  

### ✅ WebSocket Integration  
- Real-time **event updates** and **trade updates** via WebSockets.  

### ✅ Database Seeding  
- Pre-loads test users, events, and trades for easier development and testing.  

### ✅ Logging & Error Handling  
- Logs errors and API calls using **Winston** for better debugging.  

---

## **Installation & Setup**  

### 🔹 **Clone the repository**  
```sh
git clone https://github.com/Lekhraj2000/GoToSOIC_assignment.git
cd GoToSOIC_assignment
```

### 🔹 **Install dependencies**  
```sh
npm install
```

### 🔹 **Start MongoDB (if not running already)**  
```sh
mongod --dbpath /path-to-your-mongodb-data
```

### 🔹 **Set up environment variables**  
Create a `.env` file in the root directory and add:  
```
JWT_SECRET=your_jwt_secret
MONGO_URI=mongodb://127.0.0.1:27017/opinionTradingApp
PORT=3000
WS_PORT=8080
```

---

## **Running the Application**  

### ▶️ **Start the Backend Server**  
```sh
node index.js
```
This starts the **REST API** and the **WebSocket server**.  

### ▶️ **Start the Frontend**  
```sh
npm run dev
```
Then, open your browser and go to:
```
http://localhost:5173
```
(Login as an admin to access the **Admin Panel**).  

---

## **API Endpoints**  

| Endpoint                | Method | Description                     | Auth |
|-------------------------|--------|---------------------------------|------|
| `/api/signup`           | POST   | User registration               | ❌   |
| `/api/login`            | POST   | User authentication             | ❌   |
| `/api/events`           | GET    | Fetch all events                | ✅   |
| `/api/trades`           | GET    | Fetch user trades               | ✅   |
| `/api/admin/events`     | GET    | Admin fetch all events          | ✅ Admin |
| `/api/admin/trades`     | GET    | Admin fetch all trades          | ✅ Admin |
| `/api/admin/events`     | POST   | Admin creates a new event       | ✅ Admin |
| `/api/admin/events/:id/settle` | POST | Admin settles an event | ✅ Admin |

> **Auth Key:**  
> ✅ = Requires Authentication (JWT Token in Header)  
> ❌ = Public  

---

## **WebSocket Usage**  

### ▶️ **Start the WebSocket Server**  
```sh
node index.js
```
This runs the WebSocket server on `ws://localhost:8080`.  

---

## **Seeding the Database**  

Run the following command to populate the database with sample **users**, **events**, and **trades**:  
```sh
node seed.js
```
This will:
- Create **test users** (`admin@example.com`, `user@example.com`)
- Add **sample events** (Sports, Politics, Finance)
- Generate **test trades**  

![image](https://github.com/user-attachments/assets/63091662-f6c0-4893-9d40-1fc7dae02394)


## **Technologies Used**  

### **Frontend:**  
- React (Vite)  
- React Router  

### **Backend:**  
- Node.js (Express.js)  
- MongoDB (Mongoose)  
- WebSockets (ws)  
- JWT Authentication  
- Winston (Logging)  

---

## **Troubleshooting**  

### ❌ **MongoDB connection error**  
- Make sure MongoDB is running:  
  ```sh
  mongod --dbpath /path-to-your-mongodb-data
  ```

### ❌ **WebSocket not connecting**  
- Ensure the server is running:  
  ```sh
  node index.js
  ```
- Test the connection with a WebSocket client.  

### ❌ **Invalid JWT Token**  
- Ensure you are passing the token in headers:  
  ```
  Authorization:your_jwt_token
  ```

---

- 🚀 **Lekhraj**  

