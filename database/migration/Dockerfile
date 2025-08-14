FROM debian:bookworm-slim

WORKDIR /service

# Install wget to fetch refinery
RUN apt update
RUN apt install -y wget

# Fetch and extract refinery
RUN wget https://github.com/rust-db/refinery/releases/download/0.8.14/refinery-0.8.14-x86_64-unknown-linux-musl.tar.gz
RUN tar xzf refinery-0.8.14-x86_64-unknown-linux-musl.tar.gz

# Move to refinery bin to workdir and add execution rights
RUN cp refinery-0.8.14-x86_64-unknown-linux-musl/refinery . && \
    chmod +x ./refinery

# Cleanup
RUN rm -rf refinery-0.8.14-x86_64-unknown-linux-musl.tar.gz refinery-0.8.14-x86_64-unknown-linux-musl
RUN apt remove -y wget
RUN rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["/service/refinery"]
