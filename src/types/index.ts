export interface LeaderboardEntry {
  rank: number
  playerId: string
  displayName: string
  score: number
  joinMode: 'guest' | 'identified'
}

export interface QuestionWithOptions {
  id: string
  content: string
  imageUrl: string | null
  type: 'multiple_choice' | 'true_false' | 'puzzle'
  durationSecs: number
  orderIndex: number
  options: {
    id: string
    content: string
    orderIndex: number
  }[]
}

export interface SessionSummary {
  sessionId: string
  mode: 'standard' | 'team_vs_team' | 'hot_seat'
  quizTitle: string
  totalPlayers: number
  endedAt: Date | null
}
