import { createPlugin } from '@/lib/plugin'

const loremWords = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ')

function generateParagraph(): string {
  const len = 40 + Math.floor(Math.random() * 40)
  const words: string[] = []
  for (let i = 0; i < len; i++) {
    words.push(loremWords[Math.floor(Math.random() * loremWords.length)])
  }
  words[0] = words[0][0].toUpperCase() + words[0].slice(1)
  return words.join(' ') + '.'
}

export const GET = createPlugin(
  { name: 'lorem-ipsum', endpoint: '/api/tools/lorem-ipsum', costCredits: 1 },
  async (req, { searchParams }) => {
    const paragraphs = Math.min(parseInt(searchParams.get('paragraphs') || '3'), 20)
    const result: string[] = []

    for (let i = 0; i < paragraphs; i++) {
      result.push(generateParagraph())
    }

    return {
      paragraphs,
      text: result.join('\n\n'),
      html: result.map(p => `<p>${p}</p>`).join('\n')
    }
  }
)
