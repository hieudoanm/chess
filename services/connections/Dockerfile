FROM golang

WORKDIR /app

COPY . .

RUN go mod download

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o ./dist/main

ENTRYPOINT ["./dist/main"]
