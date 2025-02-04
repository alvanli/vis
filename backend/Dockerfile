# Use the official Rust image as a base
FROM rust:latest as builder

# Set the working directory
WORKDIR /app

# Copy the Cargo.toml and Cargo.lock files
COPY Cargo.toml .
COPY Cargo.lock .

# Create a dummy main.rs to cache dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build the dependencies (this step is cached)
RUN cargo build --release

# Now copy the actual source code
COPY src/ src/
COPY points.csv .

# Build the application
RUN cargo build --release

# Use a smaller base image for the final stage
FROM debian:bullseye-slim

# Install necessary dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy the binary from the builder stage
COPY --from=builder /app/target/release/backend /usr/local/bin/backend

# Copy the CSV file
COPY --from=builder /app/points.csv /app/points.csv

# Set the working directory
WORKDIR /app

# Expose the port the app runs on
EXPOSE 8080

# Run the application
CMD ["backend"]