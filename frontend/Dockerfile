FROM node:24.14.0-bookworm-slim

WORKDIR /app

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    TZ=Asia/Tokyo \
    NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl unzip \
  && rm -rf /var/lib/apt/lists/*

COPY FE/spa-next/my-next-app/package*.json /app/
RUN npm ci

COPY FE/spa-next/my-next-app /app

EXPOSE 3000

CMD ["npm","run","dev","--","-H","0.0.0.0","-p","3000"]
