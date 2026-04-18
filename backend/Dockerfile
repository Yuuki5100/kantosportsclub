ARG BACKEND_MAVEN_VERSION=3.9.9
ARG BACKEND_JAVA_VERSION=21

FROM maven:${BACKEND_MAVEN_VERSION}-eclipse-temurin-${BACKEND_JAVA_VERSION} AS backend-common

WORKDIR /workspace/BE

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    TZ=Asia/Tokyo \
    MAVEN_OPTS="-Dfile.encoding=UTF-8" \
    MAVEN_CONFIG=""

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl unzip \
  && rm -rf /var/lib/apt/lists/*

FROM backend-common AS backend-test-base

ENTRYPOINT []

CMD ["bash"]

FROM backend-common AS backend-service

ARG BACKEND_MODULE=appserver
ARG BACKEND_PORT=8081
ARG BACKEND_JAR_PATH=appserver/target/appserver-1.0.0-SNAPSHOT.jar

ENV BACKEND_MODULE=${BACKEND_MODULE} \
    BACKEND_PORT=${BACKEND_PORT} \
    BACKEND_JAR_PATH=${BACKEND_JAR_PATH}

COPY BE /workspace/BE

RUN chmod +x /workspace/BE/mvnw \
  && MAVEN_CONFIG="" ./mvnw -Pinstall-local-libs -pl servercommon/libs -am validate \
  && MAVEN_CONFIG="" ./mvnw -pl "${BACKEND_MODULE}" -am -Dmaven.test.skip=true install

EXPOSE ${BACKEND_PORT}

ENTRYPOINT []

CMD ["sh","-c","MAVEN_CONFIG=\"\" ./mvnw -Pinstall-local-libs -pl servercommon/libs -am validate && MAVEN_CONFIG=\"\" ./mvnw -pl \"${BACKEND_MODULE}\" -am -Dmaven.test.skip=true install && MAVEN_CONFIG=\"\" ./mvnw -f \"${BACKEND_MODULE}/pom.xml\" -Dmaven.test.skip=true package spring-boot:repackage && java -jar \"${BACKEND_JAR_PATH}\""]
