import { useEffect, useRef } from 'react'
import { getCurrentUser, signOut, setVideoAccess } from '../lib/premium'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'

export default function PremiumCertificate() {
  const nav = useNavigate()
  const user = getCurrentUser()
  const canvasRef = useRef(null)
  useEffect(() => {
    if (user?.id) setVideoAccess(user.id, true)
    const c = canvasRef.current
    if (!c || !user) return
    const ctx = c.getContext('2d')
    const w = c.width, h = c.height
    const bg = ctx.createLinearGradient(0, 0, w, h)
    bg.addColorStop(0, '#0b1628')
    bg.addColorStop(0.5, '#081120')
    bg.addColorStop(1, '#000000')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    ctx.globalAlpha = 0.12
    ctx.strokeStyle = '#1f2a3a'
    ctx.lineWidth = 1
    for (let x = 60; x < w; x += 60) {
      ctx.beginPath()
      ctx.moveTo(x, 40)
      ctx.lineTo(x, h - 40)
      ctx.stroke()
    }
    for (let y = 40; y < h; y += 60) {
      ctx.beginPath()
      ctx.moveTo(40, y)
      ctx.lineTo(w - 40, y)
      ctx.stroke()
    }
    ctx.globalAlpha = 0.08
    for (let i = 0; i < 18; i++) {
      const cx = 80 + i * ((w - 160) / 18)
      const base = h * 0.65 + Math.sin(i) * 20
      const high = base - (30 + (i % 5) * 8)
      const low = base + (20 + (i % 3) * 6)
      ctx.strokeStyle = i % 2 === 0 ? '#3fd07f' : '#ff6666'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx, high)
      ctx.lineTo(cx, low)
      ctx.stroke()
      ctx.fillStyle = ctx.strokeStyle
      const bh = 14
      const by = i % 2 === 0 ? high + 6 : base - 6
      ctx.fillRect(cx - 8, by, 16, bh)
    }
    ctx.globalAlpha = 1
    const gold = ctx.createLinearGradient(0, 0, w, 0)
    gold.addColorStop(0, '#f7e58a')
    gold.addColorStop(0.5, '#e6c76e')
    gold.addColorStop(1, '#c8a64a')
    ctx.strokeStyle = gold
    ctx.lineWidth = 10
    ctx.strokeRect(30, 30, w - 60, h - 60)
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = 12
    const titleGrad = ctx.createLinearGradient(w * 0.25, 0, w * 0.75, 0)
    titleGrad.addColorStop(0, '#f7e58a')
    titleGrad.addColorStop(1, '#c8a64a')
    ctx.fillStyle = titleGrad
    function fitSize(text, fontBase, maxWidth, maxSize, minSize) {
      let size = maxSize
      while (size > minSize) {
        ctx.font = `${fontBase} ${size}px Georgia, serif`
        if (ctx.measureText(text).width <= maxWidth) break
        size -= 2
      }
      return size
    }
    const innerW = w - 140
    const titleSize = fitSize('CERTIFICATE OF COMPLETION', 'bold', innerW, 140, 80)
    ctx.font = `bold ${titleSize}px Georgia, serif`
    ctx.fillText('CERTIFICATE OF COMPLETION', w / 2, Math.round(h * 0.18))
    ctx.shadowBlur = 0
    ctx.fillStyle = '#ffffff'
    ctx.font = '32px Arial, sans-serif'
    ctx.fillText('This is to proudly certify that', w / 2, Math.round(h * 0.25))
    ctx.fillStyle = '#ffffff'
    const nameText = (user?.name || 'Learner').toUpperCase()
    const nameSize = fitSize(nameText, 'bold', innerW * 0.9, 110, 72)
    ctx.font = `bold ${nameSize}px Georgia, serif`
    const nameY = Math.round(h * 0.38)
    ctx.fillText(nameText, w / 2, nameY)
    const body = `This is to proudly certify that ${(user?.name || 'Learner')} has successfully completed the Premium Advanced Crypto Trading & AI Automation Course under the expert mentorship of Mr. Solo Janagaraj. This certification acknowledges professional training in cryptocurrency trading strategies, AI bot systems, advanced market analysis, and structured risk management.`
    const close = 'We wish you continued success, consistent growth, and outstanding achievements in your trading journey.'
    function wrap(text, maxWidth, font) {
      ctx.font = font
      const words = text.split(' ')
      const lines = []
      let line = ''
      for (let i = 0; i < words.length; i++) {
        const test = line ? line + ' ' + words[i] : words[i]
        if (ctx.measureText(test).width > maxWidth) {
          lines.push(line)
          line = words[i]
        } else {
          line = test
        }
      }
      if (line) lines.push(line)
      return lines
    }
    const maxW = w * 0.84
    let bodySize = 30
    let bodyLines = []
    while (bodySize >= 22) {
      bodyLines = wrap(body, maxW, `${bodySize}px Arial, sans-serif`)
      if (bodyLines.length <= 5) break
      bodySize -= 2
    }
    let y = Math.round(h * 0.46)
    ctx.fillStyle = '#e7edf5'
    ctx.font = `${bodySize}px Arial, sans-serif`
    for (let i = 0; i < bodyLines.length; i++) {
      ctx.fillText(bodyLines[i], w / 2, y)
      y += Math.round(bodySize * 1.3)
    }
    ctx.fillStyle = titleGrad
    ctx.font = `bold ${nameSize}px Georgia, serif`
    const aiY = Math.min(y + Math.round(nameSize * 1.1), h - 180)
    ctx.fillText('AI TRENDEX', w / 2, aiY)
    y = aiY + Math.round(nameSize * 0.6)
    let closeSize = 32
    let closeLines = []
    while (closeSize >= 24) {
      closeLines = wrap(close, maxW, `${closeSize}px Georgia, serif`)
      if (closeLines.length <= 3) break
      closeSize -= 2
    }
    ctx.fillStyle = '#ffffff'
    ctx.font = `${closeSize}px Georgia, serif`
    y += Math.round(closeSize * 0.7)
    for (let i = 0; i < closeLines.length; i++) {
      ctx.fillText(closeLines[i], w / 2, y)
      y += Math.round(closeSize * 1.25)
    }
    const dObj = new Date()
    const d = `${String(dObj.getDate()).padStart(2, '0')}/${String(dObj.getMonth() + 1).padStart(2, '0')}/${dObj.getFullYear()}`
    ctx.fillStyle = '#c8a64a'
    ctx.font = '26px Arial, sans-serif'
    ctx.fillText(`Date: ${d}`, w / 2, h - 80)
  }, [user])
  function download() {
    const c = canvasRef.current
    if (!c) return
    const img = c.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [1600, 1000] })
    pdf.addImage(img, 'PNG', 0, 0, 1600, 1000)
    pdf.save('certificate.pdf')
  }
  return (
    <div>
      <h1 style={{ color: '#00ddeb' }}>Your Certificate</h1>
      <div className="card" style={{ maxWidth: 820, margin: '0 auto' }}>
        <canvas ref={canvasRef} width={1600} height={1000} style={{ width: '100%', borderRadius: 12 }} />
        <div style={{ marginTop: 10, textAlign: 'center' }}>
          <button className="btn" onClick={download}>Download as PDF</button>
          <button className="btn" style={{ marginLeft: 8 }} onClick={() => nav('/premium/course')}>Go back to Video</button>
          <button className="btn secondary" style={{ marginLeft: 8 }} onClick={() => { signOut(); nav('/premium/login') }}>Sign out</button>
        </div>
        <div style={{ marginTop: 8, textAlign: 'center', color: '#22c55e' }}>
          Video modules access enabled for your account.
        </div>
      </div>
    </div>
  )
}
