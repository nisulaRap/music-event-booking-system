# Booking Service

Microservice responsible for ticket booking within the **Music Event Booking Platform**.

| Detail | Value |
|---|---|
| Port | `8083` (configurable via `SERVER_PORT`) |
| Runtime | Java 21, Spring Boot 3.5.11 |
| Database | MongoDB |
| Auth | JWT (Bearer token) |
| API Docs | `GET /swagger-ui.html` |

---

## Architecture

```
BookingController  →  BookingService  →  BookingRepository (MongoDB)
                           │
                           └── RestTemplate → Notification Service
```

**Scheduled task** (`SeatExpiryScheduler`) runs every minute and cancels PENDING bookings whose 5-minute seat lock has expired.

---

## Environment Variables

All configuration is driven by environment variables. **Never hardcode secrets.**

| Variable | Default | Description |
|---|---|---|
| `SERVER_PORT` | `8083` | HTTP port |
| `MONGO_URI` | `mongodb://localhost:27017/booking-db` | MongoDB connection string |
| `JWT_SECRET` | *(none — required in production)* | HS256 signing secret (≥ 32 chars) |
| `API_KEY` | `local-dev-key` | Shared key sent as `X-API-Key` to other services |
| `NOTIFICATION_SERVICE_URL` | `http://localhost:8081` | Base URL of the Notification Service |
| `EVENT_SERVICE_URL` | `http://localhost:8082` | Base URL of the Event Service |

---

## Running Locally

### Prerequisites
- Java 21
- Maven 3.9+
- MongoDB running on `localhost:27017`

### Steps

```bash
# 1 – Clone the repository
git clone https://github.com/nisulaRap/music-event-booking-system.git
cd music-event-booking-system/booking-service

# 2 – Set required environment variables (PowerShell example)
$Env:MONGO_URI          = "mongodb://localhost:27017/booking-db"
$Env:JWT_SECRET         = "your-super-secret-key-that-is-at-least-32-chars"
$Env:API_KEY            = "your-api-key"
$Env:NOTIFICATION_SERVICE_URL = "http://localhost:8081"
$Env:EVENT_SERVICE_URL  = "http://localhost:8082"

# 3 – Build and run
./mvnw spring-boot:run
```

The service is available at `http://localhost:8083`.
Swagger UI: `http://localhost:8083/swagger-ui.html`

---

## Running with Docker

```bash
# Build the image
docker build -t booking-service:local .

# Run with environment variables
docker run -p 8083:8083 \
  -e MONGO_URI="mongodb://host.docker.internal:27017/booking-db" \
  -e JWT_SECRET="your-super-secret-key-that-is-at-least-32-chars" \
  -e API_KEY="your-api-key" \
  -e NOTIFICATION_SERVICE_URL="http://host.docker.internal:8081" \
  -e EVENT_SERVICE_URL="http://host.docker.internal:8082" \
  booking-service:local
```

---

## Running Tests

```bash
./mvnw test
```

The context-load test uses the `test` Spring profile (see `src/test/resources/application-test.yml`) so no real MongoDB or external services are required.

---

## CI/CD Pipeline (GitHub Actions)

File: `.github/workflows/ci-cd.yml`

| Job | Trigger | Description |
|---|---|---|
| `build-and-test` | All branches | Maven compile, test, and SonarCloud scan |
| `docker-build-push` | `main` branch push | Build & push Docker image to Azure Container Registry |
| `deploy` | `main` branch push | Deploy to Azure Container Apps |

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `SONAR_TOKEN` | SonarCloud token |
| `ACR_REGISTRY` | e.g. `myregistry.azurecr.io` |
| `ACR_USERNAME` | ACR service principal client ID |
| `ACR_PASSWORD` | ACR service principal client secret |
| `AZURE_CREDENTIALS` | JSON credentials for `azure/login` action |
| `MONGO_URI` | Production MongoDB connection string |
| `JWT_SECRET` | Production JWT signing secret |
| `API_KEY` | Production inter-service API key |
| `NOTIFICATION_SERVICE_URL` | Production Notification Service URL |
| `EVENT_SERVICE_URL` | Production Event Service URL |
| `JWT_SECRET_TEST` | JWT secret used in CI tests |
| `MONGO_URI_TEST` | MongoDB URI used in CI tests |

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Public | Create a new booking |
| `GET` | `/api/bookings/{bookingId}` | JWT | Get booking by ID |
| `GET` | `/api/bookings/user/{userId}` | JWT | Get all bookings for a user |
| `GET` | `/api/bookings/check-availability?eventId=` | Public | Get booked/locked seat IDs |
| `PUT` | `/api/bookings/{bookingId}/confirm` | JWT | Confirm a booking |
| `PUT` | `/api/bookings/{bookingId}/cancel` | JWT | Cancel a booking |
| `GET` | `/actuator/health` | Public | Health probe |

---

## Project Structure

```
booking-service/
├── src/
│   ├── main/
│   │   ├── java/com/musicbooking/booking_service/
│   │   │   ├── BookingServiceApplication.java
│   │   │   ├── config/
│   │   │   │   ├── OpenApiConfig.java
│   │   │   │   ├── RestTemplateConfig.java
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── controller/
│   │   │   │   └── BookingController.java
│   │   │   ├── dto/
│   │   │   │   ├── ApiResponse.java
│   │   │   │   ├── BookingRequest.java
│   │   │   │   ├── BookingResponse.java
│   │   │   │   └── NotificationRequest.java
│   │   │   ├── exception/
│   │   │   │   ├── BookingNotFoundException.java
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── SeatAlreadyBookedException.java
│   │   │   ├── model/
│   │   │   │   ├── Booking.java
│   │   │   │   └── BookingStatus.java
│   │   │   ├── repository/
│   │   │   │   └── BookingRepository.java
│   │   │   ├── scheduler/
│   │   │   │   └── SeatExpiryScheduler.java
│   │   │   ├── security/
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   └── JwtUtil.java
│   │   │   └── service/
│   │   │       └── BookingService.java
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       ├── java/…/BookingServiceApplicationTests.java
│       └── resources/application-test.yml
├── .github/workflows/ci-cd.yml
├── Dockerfile
├── pom.xml
└── README.md
```
