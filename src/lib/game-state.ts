export interface PlayerState {
  playerId: string
  displayName: string
  joinMode: 'guest' | 'identified'
  score: number
  streak: number
  answeredCurrentQuestion: boolean
}

export interface GameState {
  sessionId: string
  status: 'lobby' | 'in_progress' | 'between_questions' | 'finished'
  currentQuestionIndex: number
  players: Map<string, PlayerState>   // key = socketId
  questionStartedAt: number | null    // Date.now() when question started
  hotSeatPlayerId: string | null      // socketId of hot seat player
  hotSeatVotes: Map<string, 'support' | 'challenge'> // key = socketId of voter
}

const sessions = new Map<string, GameState>()

export function createGameState(sessionId: string): GameState {
  const state: GameState = {
    sessionId,
    status: 'lobby',
    currentQuestionIndex: 0,
    players: new Map(),
    questionStartedAt: null,
    hotSeatPlayerId: null,
    hotSeatVotes: new Map(),
  }
  sessions.set(sessionId, state)
  return state
}

export function getGameState(sessionId: string): GameState | undefined {
  return sessions.get(sessionId)
}

export function deleteGameState(sessionId: string): void {
  sessions.delete(sessionId)
}

export function removePlayerFromAllSessions(socketId: string): void {
  for (const state of sessions.values()) {
    state.players.delete(socketId)
  }
}

export function getLeaderboard(state: GameState) {
  return Array.from(state.players.values())
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({
      rank: i + 1,
      playerId: p.playerId,
      displayName: p.displayName,
      score: p.score,
      joinMode: p.joinMode,
    }))
}
