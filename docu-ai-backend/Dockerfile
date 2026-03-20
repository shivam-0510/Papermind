# ---------- Build Stage ----------
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

# copy pom first for dependency caching
COPY pom.xml .

RUN mvn -B -q -e -C dependency:go-offline

# copy source
COPY src ./src

# build jar
RUN mvn clean package -DskipTests


# ---------- Runtime Stage ----------
FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

# copy built jar
COPY --from=builder /app/target/*.jar app.jar

# create upload folder used in your yaml
RUN mkdir -p /tmp/uploads

# expose port from application.yml
EXPOSE 6000

ENTRYPOINT ["java","-jar","app.jar"]