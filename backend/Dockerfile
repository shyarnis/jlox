# Use official OpenJDK image with Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS builder

# Set working directory
WORKDIR /app

# Copy pom.xml and isntall dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the source cod  and build the application
COPY src ./src
RUN mvn clean package -DskipTests

# Use an official OpenJDK image to run the application
FROM eclipse-temurin:21-jre

# Set the working directory
WORKDIR /app

# Copy the built JAR from the builder stage and renames as (app.jar)
COPY --from=builder /app/target/lox-web-1.0.0.jar app.jar

# Default port for Spring Boot
EXPOSE 8080

# Run the JAR
ENTRYPOINT ["java", "-jar", "app.jar"]
