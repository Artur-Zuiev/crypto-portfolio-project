# One deployment serves both the Spring Boot REST API and the static frontend.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY backend/cryptoportfolio/pom.xml ./pom.xml
COPY backend/cryptoportfolio/src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/target/cryptoportfolio-0.0.1-SNAPSHOT.jar /app/app.jar
COPY frontend/ /app/static/
ENV PORT=8080
EXPOSE 8080
# Serve the same-origin frontend, with API routes handled by Spring.
ENTRYPOINT ["java", "-Dspring.web.resources.static-locations=file:/app/static/", "-jar", "/app/app.jar"]
