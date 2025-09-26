# ----------- Stage 1: Build bằng Maven -----------
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app
COPY . .

# Build jar (bỏ test để nhanh hơn)
RUN mvn clean package -DskipTests


# ----------- Stage 2: Run ứng dụng -----------
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copy jar từ stage 1
COPY --from=builder /app/target/*.jar app.jar

# Expose port (Railway sẽ tự map)
EXPOSE 8080

# Chạy Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]
