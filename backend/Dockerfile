# --- Build stage ---
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw package -DskipTests -B 2>/dev/null || \
    (apt-get install -y maven 2>/dev/null; mvn package -DskipTests -B)

# --- Runtime stage ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S ledger && adduser -S ledger -G ledger

COPY --from=build /app/target/ledger-*.jar app.jar

USER ledger
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
