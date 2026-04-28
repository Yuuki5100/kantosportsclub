FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

ARG TARGETARCH
ARG NODE_VERSION=24.14.0
ARG MAVEN_VERSION=3.9.9

USER root

RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    docker.io \
    glab \
    openjdk-21-jdk-headless \
    unzip \
    xz-utils \
  && case "${TARGETARCH:-amd64}" in \
    amd64) NODE_ARCH="x64"; AWS_ARCH="x86_64" ;; \
    arm64) NODE_ARCH="arm64"; AWS_ARCH="aarch64" ;; \
    *) echo "Unsupported TARGETARCH: ${TARGETARCH}" >&2; exit 1 ;; \
  esac \
  && curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz" -o /tmp/node.tar.xz \
  && tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1 --no-same-owner \
  && curl -fsSL "https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz" -o /tmp/maven.tar.gz \
  && mkdir -p /opt/maven \
  && tar -xzf /tmp/maven.tar.gz -C /opt/maven --strip-components=1 \
  && ln -sf /opt/maven/bin/mvn /usr/local/bin/mvn \
  && curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-${AWS_ARCH}.zip" -o /tmp/awscliv2.zip \
  && unzip -q /tmp/awscliv2.zip -d /tmp \
  && /tmp/aws/install --bin-dir /usr/local/bin --install-dir /usr/local/aws-cli \
  && npm install -g @openai/codex \
  && npm cache clean --force \
  && rm -rf /tmp/aws /tmp/awscliv2.zip /tmp/node.tar.xz /tmp/maven.tar.gz \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    TZ=Asia/Tokyo \
    JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 \
    MAVEN_HOME=/opt/maven
