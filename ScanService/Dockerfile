FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy root pom and module poms for dependency caching
COPY pom.xml .
COPY TaskService/pom.xml TaskService/
COPY ScanService/pom.xml ScanService/
COPY NotificationService/pom.xml NotificationService/

# Copy ScanService source and build
COPY ScanService/src ScanService/src
RUN mvn clean package -pl ScanService -am -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/ScanService/target/*.jar app.jar
ENV JAVA_OPTS="-Xmx256m -Xms128m -XX:+UseG1GC"
EXPOSE 8083
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
