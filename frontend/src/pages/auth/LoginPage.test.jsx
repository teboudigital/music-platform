import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import LoginPage from './LoginPage'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset()
    mockNavigate.mockReset()
  })

  it('mostra i campi email e password', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument()
  })

  it('mostra il bottone di submit', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByRole('button', { name: 'auth.login' })).toBeInTheDocument()
  })

  it('chiama login con email e password al submit', async () => {
    mockLogin.mockResolvedValue({})
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'user@test.com' } })
    fireEvent.change(document.querySelector('input[type="password"]'), { target: { value: 'Pass1234!' } })
    fireEvent.click(screen.getByRole('button', { name: 'auth.login' }))
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'Pass1234!')
    })
  })

  it('naviga a /songs dopo login riuscito', async () => {
    mockLogin.mockResolvedValue({})
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'user@test.com' } })
    fireEvent.change(document.querySelector('input[type="password"]'), { target: { value: 'Pass1234!' } })
    fireEvent.click(screen.getByRole('button', { name: 'auth.login' }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/songs'))
  })

  it('mostra errore su login fallito', async () => {
    mockLogin.mockRejectedValue(new Error('401'))
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'bad@test.com' } })
    fireEvent.change(document.querySelector('input[type="password"]'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'auth.login' }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('contiene link alla pagina di registrazione', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'auth.register' })).toBeInTheDocument()
  })
})
