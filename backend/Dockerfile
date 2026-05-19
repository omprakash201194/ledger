# --- Build stage ---
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline -B -q

COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn package -DskipTests -B -q

# --- Runtime stage ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S ledger && adduser -S ledger -G ledger

COPY --from=build /app/target/ledger-*.jar app.jar

USER ledger
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
