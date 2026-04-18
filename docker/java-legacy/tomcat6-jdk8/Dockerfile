FROM debian:bullseye-slim

ARG DEBIAN_FRONTEND=noninteractive
ARG TOMCAT_VERSION=6.0.43
ARG TOMCAT_ARCHIVE_URL=https://archive.apache.org/dist/tomcat/tomcat-6/v${TOMCAT_VERSION}/bin/apache-tomcat-${TOMCAT_VERSION}.tar.gz
ARG JDK_EXPECTED_VERSION=1.8.0_202
ARG LEGACY_PACKAGE_ZIP=6.zip

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl tzdata unzip \
  && rm -rf /var/lib/apt/lists/*

# Place Oracle JDK tarball and optional legacy package zip under docker/java-legacy/assets/ before build.
COPY docker/java-legacy/assets/ /tmp/java-assets/

RUN set -eux; \
  java_archive="$(find /tmp/java-assets -maxdepth 1 -type f -name '*.tar.gz' | head -n 1 || true)"; \
  if [ -z "${java_archive}" ]; then \
    echo >&2 "Missing JDK archive. Place Java tarball under docker/java-legacy/assets/ (e.g. jdk-8u202-linux-x64.tar.gz)."; \
    exit 1; \
  fi; \
  mkdir -p /opt/java; \
  tar -xzf "${java_archive}" -C /opt/java; \
  jdk_dir="$(find /opt/java -mindepth 1 -maxdepth 1 -type d | head -n 1)"; \
  java_version="$("${jdk_dir}/bin/java" -version 2>&1 | awk 'NR==1{print $3}' | tr -d '"')"; \
  if [ "${java_version}" != "${JDK_EXPECTED_VERSION}" ]; then \
    echo >&2 "Unexpected JDK version: ${java_version}. Expected ${JDK_EXPECTED_VERSION}."; \
    exit 1; \
  fi; \
  ln -s "${jdk_dir}" /opt/java/current

RUN set -eux; \
  curl -fsSL "${TOMCAT_ARCHIVE_URL}" -o /tmp/tomcat.tar.gz; \
  tar -xzf /tmp/tomcat.tar.gz -C /usr/local; \
  ln -s "/usr/local/apache-tomcat-${TOMCAT_VERSION}" /usr/local/tomcat; \
  rm -f /tmp/tomcat.tar.gz

RUN set -eux; \
  legacy_zip="/tmp/java-assets/${LEGACY_PACKAGE_ZIP}"; \
  if [ -f "${legacy_zip}" ]; then \
    mkdir -p /tmp/legacy-src /opt/legacy-seed/webapps; \
    unzip -q "${legacy_zip}" -d /tmp/legacy-src; \
    legacy_home="$(find /tmp/legacy-src -type f -path '*/bin/catalina.sh' | head -n 1 | sed 's#/bin/catalina.sh##')"; \
    if [ -z "${legacy_home}" ]; then \
      echo >&2 "Could not locate Tomcat home in ${LEGACY_PACKAGE_ZIP}."; \
      exit 1; \
    fi; \
    cp -a "${legacy_home}/bin/." /usr/local/tomcat/bin/; \
    cp -a "${legacy_home}/lib/." /usr/local/tomcat/lib/; \
    cp -a "${legacy_home}/conf/." /usr/local/tomcat/conf/; \
    if [ -d "${legacy_home}/webapps" ]; then \
      cp -a "${legacy_home}/webapps/." /opt/legacy-seed/webapps/; \
    fi; \
    rm -rf /tmp/legacy-src; \
  fi; \
  find /usr/local/tomcat/bin -maxdepth 1 -type f -name '*.sh' -exec chmod +x {} \;; \
  rm -rf /tmp/java-assets

COPY docker/java-legacy/tomcat6-jdk8/docker-entrypoint.sh /usr/local/bin/java-legacy-entrypoint.sh
RUN chmod +x /usr/local/bin/java-legacy-entrypoint.sh

ENV JAVA_HOME=/opt/java/current
ENV CATALINA_HOME=/usr/local/tomcat
ENV PATH=${JAVA_HOME}/bin:${CATALINA_HOME}/bin:${PATH}

WORKDIR /usr/local/tomcat
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/java-legacy-entrypoint.sh"]
CMD ["catalina.sh", "run"]
