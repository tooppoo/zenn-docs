FROM jetpackio/devbox:latest@sha256:293d6d0a33205e88550198835e68bcff65a2e33d143857ad92c6c888e6a75ad7

# Installing your devbox project
WORKDIR /code
USER root:root
RUN mkdir -p /code && chown ${DEVBOX_USER}:${DEVBOX_USER} /code
USER ${DEVBOX_USER}:${DEVBOX_USER}
COPY --chown=${DEVBOX_USER}:${DEVBOX_USER} devbox.json devbox.json
COPY --chown=${DEVBOX_USER}:${DEVBOX_USER} devbox.lock devbox.lock



RUN devbox run -- echo "Installed Packages." && nix-store --gc && nix-store --optimise

RUN devbox shellenv --init-hook >> ~/.profile
