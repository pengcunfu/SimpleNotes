import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// Configure marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.error('Highlight error:', err)
      }
    }
    return hljs.highlightAuto(code).value
  },
  langPrefix: 'hljs language-',
  breaks: true,
  gfm: true,
})

// Custom renderer for better styling
const renderer = new marked.Renderer()

// Custom heading renderer with anchor links
renderer.heading = function(text, level) {
  const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
  return `<h${level} id="${id}">${text}</h${level}>\n`
}

// Custom link renderer (open external links in new tab)
renderer.link = function(href, title, text) {
  const isExternal = href.startsWith('http')
  const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}"${titleAttr}${target}>${text}</a>`
}

// Custom image renderer with lazy loading
renderer.image = function(href, title, text) {
  const titleAttr = title ? ` title="${title}"` : ''
  const altAttr = text ? ` alt="${text}"` : ''
  return `<img src="${href}"${altAttr}${titleAttr} loading="lazy" />`
}

// Custom code block renderer
renderer.code = function(code, lang) {
  const language = lang || 'text'
  let highlighted
  
  if (lang && hljs.getLanguage(lang)) {
    try {
      highlighted = hljs.highlight(code, { language: lang }).value
    } catch (err) {
      highlighted = hljs.highlightAuto(code).value
    }
  } else {
    highlighted = hljs.highlightAuto(code).value
  }
  
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
}

// Set custom renderer
marked.use({ renderer })

// Convert markdown to HTML
export const markdownToHtml = (markdown) => {
  if (!markdown) return ''
  
  try {
    return marked.parse(markdown)
  } catch (error) {
    console.error('Markdown parsing error:', error)
    return '<p>Markdown 解析错误</p>'
  }
}

// Extract plain text from markdown (for excerpts)
export const markdownToText = (markdown) => {
  if (!markdown) return ''
  
  try {
    // Convert to HTML first
    const html = marked.parse(markdown)
    
    // Strip HTML tags
    const text = html.replace(/<[^>]*>/g, '')
    
    // Decode HTML entities
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    
    return textarea.value.trim()
  } catch (error) {
    console.error('Markdown to text conversion error:', error)
    return markdown
  }
}

// Get reading time estimate
export const getReadingTime = (markdown) => {
  if (!markdown) return 0
  
  const text = markdownToText(markdown)
  const words = text.split(/\s+/).length
  const wordsPerMinute = 200 // Average reading speed
  
  return Math.ceil(words / wordsPerMinute)
}

// Get word count
export const getWordCount = (markdown) => {
  if (!markdown) return 0
  
  const text = markdownToText(markdown)
  return text.split(/\s+/).filter(word => word.length > 0).length
}

// Extract headings for table of contents
export const extractHeadings = (markdown) => {
  if (!markdown) return []
  
  const headings = []
  const lines = markdown.split('\n')
  
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      
      headings.push({
        level,
        text,
        id,
        line: index + 1
      })
    }
  })
  
  return headings
}

// Sanitize markdown (remove potentially harmful content)
export const sanitizeMarkdown = (markdown) => {
  if (!markdown) return ''
  
  // Remove script tags and their content
  let sanitized = markdown.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, '')
  
  // Remove form tags
  sanitized = sanitized.replace(/<form\b[^>]*>.*?<\/form>/gi, '')
  
  // Remove dangerous event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Remove javascript: links
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  return sanitized
}

// Generate table of contents HTML
export const generateTOC = (headings) => {
  if (!headings || headings.length === 0) return ''
  
  let toc = '<div class="table-of-contents">\n'
  toc += '<h3>目录</h3>\n<ul>\n'
  
  headings.forEach(heading => {
    const indent = '  '.repeat(heading.level - 1)
    toc += `${indent}<li><a href="#${heading.id}">${heading.text}</a></li>\n`
  })
  
  toc += '</ul>\n</div>'
  
  return toc
}

export default {
  markdownToHtml,
  markdownToText,
  getReadingTime,
  getWordCount,
  extractHeadings,
  sanitizeMarkdown,
  generateTOC
}
