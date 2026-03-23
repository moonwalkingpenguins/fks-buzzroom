import { Server, Socket } from 'socket.io'
import { getGameState, createGameState, getLeaderboard, removePlayerFromAllSessions } from './game-state'
import { prisma } from './prisma'

export function registerSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {

    // JOIN SESSION
    socket.on('join_session', async (data: {
      pin: string
      employeeCode?: string
      guestName?: string
    }) => {
      try {
        const { pin, employeeCode, guestName } = data

        const session = await prisma.gameSession.findFirst({
          where: { pin, status: { in: ['lobby', 'in_progress'] } },
          include: {
            quiz: {
              include: {
                questions: {
                  include: { options: { orderBy: { orderIndex: 'asc' } } },
                  orderBy: { orderIndex: 'asc' },
                },
              },
            },
          },
        })

        if (!session) {
          socket.emit('error', { message: 'PIN tidak valid atau sesi sudah berakhir' })
          return
        }

        const state = getGameState(session.id) ?? createGameState(session.id)

        // Determine join mode
        let displayName = guestName?.trim() || 'Tamu'
        let joinMode: 'guest' | 'identified' = 'guest'
        let userId: string | null = null

        if (employeeCode?.trim()) {
          const user = await prisma.user.findUnique({
            where: { employeeCode: employeeCode.trim() },
            select: { id: true, name: true, isActive: true },
          })
          if (user?.isActive) {
            displayName = user.name
            joinMode = 'identified'
            userId = user.id
          }
        }

        // Find existing player — for identified users, match by userId in this session
        // For guests, always create a new record per connection (socket.id)
        let player = null
        if (joinMode === 'identified' && userId) {
          player = await prisma.sessionPlayer.findFirst({
            where: { sessionId: session.id, userId },
          })
        }

        if (!player) {
          player = await prisma.sessionPlayer.create({
            data: {
              sessionId: session.id,
              userId,
              guestName: joinMode === 'guest' ? displayName : null,
              joinMode,
            },
          })
        }

        state.players.set(socket.id, {
          playerId: player.id,
          displayName,
          joinMode,
          score: player.totalScore,
          streak: player.streakCount,
          answeredCurrentQuestion: false,
        })

        socket.join(session.id)

        // Notify all players in session
        io.to(session.id).emit('player_joined', {
          playerList: Array.from(state.players.values()).map(p => ({
            playerId: p.playerId,
            displayName: p.displayName,
            joinMode: p.joinMode,
          })),
        })

        socket.emit('joined_ok', {
          sessionId: session.id,
          playerId: player.id,
          displayName,
          joinMode,
        })

      } catch (err) {
        console.error('join_session error:', err)
        socket.emit('error', { message: 'Gagal bergabung ke sesi' })
      }
    })

    // HOST JOIN (to receive host-only events)
    // TODO(Task 10): Verify socket.data.userId matches session.hostId before joining host room
    socket.on('host_join', (data: { sessionId: string }) => {
      socket.join(data.sessionId)
      socket.join(`host-${data.sessionId}`)
    })

    // DISCONNECT
    socket.on('disconnect', () => {
      // Remove player from in-memory state on disconnect
      // They may rejoin; the DB record is preserved for reconnect
      removePlayerFromAllSessions(socket.id)
    })
  })
}
