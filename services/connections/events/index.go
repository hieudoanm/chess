package events

import (
	"log"

	socketio "github.com/googollee/go-socket.io"
)

func ProcessEvents(server *socketio.Server) {
	server.OnEvent("/", "join-game", func(socket socketio.Conn, room string) {
		log.Printf("room: %s", room)
		socket.Join(room)
		server.BroadcastToRoom("/", room, "notification")
	})

	server.OnEvent("/", "move", func(socket socketio.Conn, room string, boardState interface{}) {
		socket.Emit("move", socket.ID(), boardState)
	})

	server.OnEvent("/", "notification", func(socket socketio.Conn, notification string) {
		socket.Emit("notification", notification)
		socket.Close()
	})
}
