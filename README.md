# 🎵 TuneTix — Music Event Booking System

> A scalable, cloud-native microservices platform for music event discovery, ticket booking, and secure payments.

---

## 🏗️ Microservices Overview
TuneTix adheres to a **Microservices Architecture** and **Database-per-Service** pattern. This provides loose coupling, independence of scalability and capability to isolate fault.

### Service Responsibilities
| Service | Port | Responsibility |
|---|---|---|
| **User Service** | `8081` | Handles authentication (JWT), RBAC, and user profiles |
| **Event Service** | `8082` | Manages event catalog and seat inventory |
| **Booking Service** | `8083` | Manages ticket reservations and seat allocation |
| **Payment Service** | `8084` | Processes secure transactions |
| **Notification Service** | `8085` | Sends async alerts for bookings and payments |

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | ReactJS, Vite, Tailwind CSS |
| **Backend** | Java 17+, Spring Boot |
| **Database** | MongoDB (per-service instance) |
| **Containerization** | Docker, Docker Compose |
| **Communication** | REST APIs (sync) · Message Queues (async) |
| **CI/CD** | GitHub Actions |
| **Cloud** | AWS ECS Fargate |

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Purpose |
|---|---|
| **Node.js** | Frontend development |
| **Java 17+** & **Maven** | Backend services |
| **Docker & Docker Compose** | Containerized setup *(optional)* |
| **MongoDB** | MongoDB Atlas (cloud-hosted per-service instance) |

### 1. Clone the Repository

```bash
git clone https://github.com/nisulaRap/music-event-booking-system.git
cd music-event-booking-system
```

### 2. Run Backend Services

Navigate into each service directory and run the following commands.

> Repeat for each service: `user-service`, `event-service`, `booking-service`, `payment-service`, `notification-service`.

**macOS / Linux**
```bash
# Build and compile
./mvnw clean compile

# Start the service
./mvnw spring-boot:run
```

**Windows**
```bash
# Build and compile
.\mvnw clean compile

# Start the service
.\mvnw spring-boot:run
```

### 3. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit the app at: **http://localhost:3000/**

---

## 🐳 Docker Deployment

### Build & Launch All Services

First, package each service into a JAR (run inside each service directory):

**macOS / Linux**
```bash
./mvnw clean package -DskipTests
```

**Windows**
```bash
.\mvnw clean package -DskipTests
```

Then build and start all containers:

```bash
docker-compose up --build
```

### Container Management

```bash
# Stop all running services
docker-compose stop

# Restart stopped services
docker-compose start

# Tear down containers and remove images
docker-compose down
```

---

## 🛣️ Microservices & API Endpoints

### 👤 User Service — Port `8081`

Handles user registration, authentication, and profile management with Role-Based Access Control (RBAC).

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and generate JWT |
| `POST` | `/api/auth/forgot-password` | Generate password reset token |
| `POST` | `/api/auth/reset-password` | Reset user password |
| `GET` | `/api/users/me` | Get logged-in user profile |
| `PUT` | `/api/users/me` | Update own profile |
| `DELETE` | `/api/users/me` | Delete own account |
| `GET` | `/api/users` | Get all users *(Admin only)* |

---

### 🎟️ Event Service — Port `8082`

Manages the event catalog and seat availability.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/events` | List all upcoming events |
| `GET` | `/events/{id}` | Get event details |
| `POST` | `/events` | Create event *(Admin only)* |
| `PUT` | `/events/{id}` | Update event or seat inventory |
| `DELETE` | `/events/{id}` | Delete event *(Admin only)* |

---

### 📋 Booking Service — Port `8083`

Handles ticket reservations and the full booking lifecycle.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/bookings` | Create a new booking |
| `GET` | `/bookings/my` | Get current user's bookings |
| `GET` | `/bookings/{id}` | Get booking details |
| `DELETE` | `/bookings/{id}` | Cancel a booking |

---

### 💳 Payment Service — Port `8084`

Manages payment processing and transaction history.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/payments` | Process a payment |
| `GET` | `/payments/{id}` | Get payment details |
| `GET` | `/payments/user` | Get user's payment history |

---

### 🔔 Notification Service — Port `8085`

Sends asynchronous notifications for bookings, payments, and account events via message queues.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notifications/my` | View user notifications |
| `POST` | `/api/notifications/booking-confirmed` | Send booking confirmation |
| `POST` | `/api/notifications/booking-cancelled` | Send booking cancellation |
| `POST` | `/api/notifications/welcome` | Send welcome notification |

---

## 🔧 DevOps & Security

### DevOps Practices

| Practice | Details |
|---|---|
| **Version Control** | Separate repositories per microservice, branch protection, Conventional Commits |
| **Containerization** | Docker ensures consistent environments across dev and production |
| **CI/CD Pipeline** | Automated build, test, package, and deploy via GitHub Actions |
| **Cloud Deployment** | AWS ECS Fargate for scalability, high availability, and fault tolerance |

### Security Practices

| Practice | Details |
|---|---|
| **Authentication** | Stateless JWT-based sessions |
| **Authorization** | Role-Based Access Control (Admin vs User) |
| **Encryption** | Passwords hashed with BCrypt |
| **API Security** | CORS and route protection configured via Spring Security |
