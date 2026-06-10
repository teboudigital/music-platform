import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const LOWER = 'abcdefghjkmnpqrstuvwxyz'
const DIGITS = '23456789'
const SPECIAL = '!@#$%&*'
const ALL = UPPER + LOWER + DIGITS + SPECIAL

function generatePassword() {
  const required = [
    UPPER[Math.floor(Math.random() * UPPER.length)],
    LOWER[Math.floor(Math.random() * LOWER.length)],
    DIGITS[Math.floor(Math.random() * DIGITS.length)],
    SPECIAL[Math.floor(Math.random() * SPECIAL.length)],
  ]
  const rest = Array.from({ length: 12 }, () => ALL[Math.floor(Math.random() * ALL.length)])
  return [...required, ...rest].sort(() => Math.random() - 0.5).join('')
}

export default function PasswordSuggestPopover({ onAccept }) {
  const { t } = useTranslation()
  const [show, setShow] = useState(false)
  const [pwd, setPwd] = useState('')
  const popoverRef = useRef(null)

  const open = () => {
    setPwd(generatePassword())
    setShow(true)
  }

  // chiude il popover cliccando fuori
  useEffect(() => {
    if (!show) return
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShow(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [show])

  const accept = () => {
    onAccept(pwd)
    setShow(false)
  }

  return (
    <div className="pwd-suggest" ref={popoverRef}>
      <button type="button" className="pwd-suggest-trigger" onClick={open}>
        ✨ {t('auth.suggestPassword')}
      </button>
      {show && (
        <div className="pwd-suggest-popover" role="dialog" aria-label={t('auth.suggestPassword')}>
          <p className="pwd-suggest-label">{t('auth.suggestHint')}</p>
          <code className="pwd-suggest-value">{pwd}</code>
          <div className="pwd-suggest-actions">
            <button
              type="button"
              className="pwd-suggest-regen"
              onClick={() => setPwd(generatePassword())}
              title={t('auth.regenerate')}
              aria-label={t('auth.regenerate')}
            >
              ↻
            </button>
            <button type="button" className="btn-primary pwd-suggest-use" onClick={accept}>
              {t('auth.usePassword')}
            </button>
            <button
              type="button"
              className="pwd-suggest-close"
              onClick={() => setShow(false)}
              aria-label={t('common.cancel')}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
