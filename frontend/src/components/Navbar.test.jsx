import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Navbar from './Navbar'

const mockLogout = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ logout: mockLogout }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

vi.mock('../i18n', () => ({
  default: { changeLanguage: vi.fn(), language: 'it' },
}))

describe('Navbar', () => {
  it('mostra tutti i link di navigazione', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'nav.songs' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'nav.groups' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'nav.setlists' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'nav.profile' })).toBeInTheDocument()
  })

  it('mostra il pulsante lingua con la lingua corrente e apre il dropdown al click', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    const langBtn = screen.getByRole('button', { name: /IT/ })
    expect(langBtn).toBeInTheDocument()
    // dropdown chiuso inizialmente
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    // click apre il dropdown con tutte le opzioni
    fireEvent.click(langBtn)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /IT/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /FR/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /EN/ })).toBeInTheDocument()
  })

  it('chiama logout e naviga a /login al click su logout', async () => {
    mockLogout.mockResolvedValue(undefined)
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'nav.logout' }))
    await new Promise((r) => setTimeout(r, 0))
    expect(mockLogout).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
