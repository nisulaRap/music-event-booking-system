# ============================================================
# Multi-stage Dockerfile for Booking Service
# Stage 1: Maven build (eclipse-temurin JDK 21)
# Stage 2: Slim JRE runtime, runs as non-root user
# ============================================================

# ---- Build stage ----
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /build

# Copy Maven wrapper and POM first (layer caching for dependencies)
COPY mvnw mvnw.cmd ./
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -q

# Copy source and build the fat-jar (skip tests; tests run in CI)
COPY src src
RUN ./mvnw package -DskipTests -q

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre AS runtime

WORKDIR /app

# Create a non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy the fat-jar from the builder
COPY --from=builder /build/target/*.jar app.jar

# Ensure the non-root user owns the application file
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8083

ENTRYPOINT ["java", "-jar", "app.jar"]
