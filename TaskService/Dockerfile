FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy root pom and module poms for dependency caching
COPY pom.xml .
COPY TaskService/pom.xml TaskService/
COPY ScanService/pom.xml ScanService/
COPY NotificationService/pom.xml NotificationService/

# Copy TaskService source and build
COPY TaskService/src TaskService/src
RUN mvn clean package -pl TaskService -am -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/TaskService/target/*.jar app.jar
ENV JAVA_OPTS="-Xmx256m -Xms128m -XX:+UseG1GC"
EXPOSE 8081
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
