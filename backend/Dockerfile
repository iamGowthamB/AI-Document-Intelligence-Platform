# Stage 1: Build Java Maven Application
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package application jar
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Production JRE Execution Environment
FROM eclipse-temurin:17-jre-alpine AS production
WORKDIR /app

# Create upload directory inside container
RUN mkdir -p /app/stored_documents

# Copy built artifact from stage 1
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
