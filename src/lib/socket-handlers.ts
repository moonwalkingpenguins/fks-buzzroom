import { Server, Socket } from 'socket.io'
import { getGameState, createGameState, getLeaderboard } from './game-state'
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

        // Create or find session player
        let player = await prisma.sessionPlayer.findFirst({
          where: { sessionId: session.id, ...(userId ? { userId } : { guestName: displayName }) },
        })

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

    // HOST JOIN (to receive player_joined events)
    socket.on('host_join', (data: { sessionId: string }) => {
      socket.join(data.sessionId)
      socket.join(`host-${data.sessionId}`)
    })

    // DISCONNECT
    socket.on('disconnect', () => {
      // Players remain in state — they may reconnect
    })
  })
}
