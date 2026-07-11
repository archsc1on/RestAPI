import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'markdown-html', endpoint: '/api/tools/markdown-html', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    if (!text) throw new Error('text is required')

    let html = text
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
    html = '<p>' + html + '</p>'

    return { text, html }
  }
)
