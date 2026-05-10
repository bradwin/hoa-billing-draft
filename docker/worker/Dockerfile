FROM node:20.17.0-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
COPY apps/worker/package.json apps/worker/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci --ignore-scripts
COPY tsconfig.base.json ./
COPY apps/worker apps/worker
COPY packages/shared packages/shared
RUN npm run build --workspace @hoa/worker

FROM node:20.17.0-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/worker/dist apps/worker/dist
COPY --from=build /app/packages/shared/package.json packages/shared/package.json
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/node_modules node_modules
CMD ["node", "apps/worker/dist/index.js"]
