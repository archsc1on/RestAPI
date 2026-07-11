import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'rock-paper-scissors', endpoint: '/api/tools/rock-paper-scissors', costCredits: 1 },
  async (req, { searchParams }) => {
    const choice = searchParams.get('choice')?.toLowerCase()

    if (!choice || !['rock', 'paper', 'scissors'].includes(choice)) {
      throw new Error('choice parameter required (rock|paper|scissors)')
    }

    const choices = ['rock', 'paper', 'scissors']
    const computer = choices[Math.floor(Math.random() * 3)]

    let result: string
    if (choice === computer) {
      result = 'draw'
    } else if (
      (choice === 'rock' && computer === 'scissors') ||
      (choice === 'paper' && computer === 'rock') ||
      (choice === 'scissors' && computer === 'paper')
    ) {
      result = 'win'
    } else {
      result = 'lose'
    }

    return {
      player: choice,
      computer,
      result,
      emoji: {
        rock: '🪨',
        paper: '📄',
        scissors: '✂️'
      }
    }
  }
)
