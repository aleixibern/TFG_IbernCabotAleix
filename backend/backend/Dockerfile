# Etapa 1: Compilació amb Maven
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Compilem saltant els tests per anar més ràpid en l'arrencada
RUN mvn clean package -DskipTests

# Etapa 2: Execució lleugera
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]