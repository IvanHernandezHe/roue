# syntax=docker/dockerfile:1

# Reuse a single SDK image for restore, build, and tests
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS sdk
WORKDIR /src

# Copy solution and project files first to leverage Docker layer caching
COPY Roue.sln ./
COPY src/Roue.API/Roue.API.csproj src/Roue.API/
COPY src/Roue.Application/Roue.Application.csproj src/Roue.Application/
COPY src/Roue.Domain/Roue.Domain.csproj src/Roue.Domain/
COPY src/Roue.Infrastructure/Roue.Infrastructure.csproj src/Roue.Infrastructure/
COPY tests/Roue.Tests.Unit/Roue.Tests.Unit.csproj tests/Roue.Tests.Unit/
COPY tools/Roue.CosmosSeeder/Roue.CosmosSeeder.csproj tools/Roue.CosmosSeeder/
RUN dotnet restore Roue.sln

# Bring in the rest of the source tree
COPY . .

# Build stage keeps build artifacts ready for publish or tests
FROM sdk AS build
RUN dotnet build Roue.sln -c Release --no-restore

############################################
# Publish API only (no frontend assets)
############################################
FROM build AS publish
RUN dotnet publish src/Roue.API/Roue.API.csproj -c Release -o /app/publish --no-build

# Dedicated test runner stage to execute solution tests inside Docker
FROM build AS test-runner
WORKDIR /src
CMD ["dotnet", "test", "Roue.sln", "-c", "Release", "--no-build", "--logger:trx"]

# Final runtime image for serving the ASP.NET Core API
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=publish /app/publish ./
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "Roue.API.dll"]
