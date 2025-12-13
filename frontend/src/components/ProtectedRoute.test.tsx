import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect } from 'vitest'

import ProtectedRoute from './ProtectedRoute'
import { AuthContext } from '../context/AuthContext'

// Função auxiliar para renderizar o componente com o contexto de autenticação simulado
const renderWithAuth = (authValue: any, initial = ['/protegida']) =>
  render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={initial}>
        <Routes>
          {/* Rota para a página de login para onde os usuários não autenticados são redirecionados */}
          <Route path="/auth" element={<div>Página de Login</div>} />
          <Route element={<ProtectedRoute />}>
            {/* Rota filha (conteúdo protegido) */}
            <Route path="/protegida" element={<div>Conteúdo Protegido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )

describe('Componente ProtectedRoute', () => {
  it('mostra o estado de carregamento quando isLoading é verdadeiro', () => {

    renderWithAuth({ user: null, isAuthenticated: false, isLoading: true, login: () => {}, logout: () => {} })
    // Espera encontrar o texto "Carregando"
    expect(screen.getByText(/Carregando/i)).toBeTruthy()
  })

  it('redireciona para /auth quando não está autenticado', async () => {
    renderWithAuth({ user: null, isAuthenticated: false, isLoading: false, login: () => {}, logout: () => {} })
    // Espera encontrar o conteúdo da página de login após o redirecionamento
    expect(screen.getByText('Página de Login')).toBeTruthy()
  })

  it('renderiza as rotas filhas quando está autenticado', () => {
    // Configura o contexto com isAuthenticated: true
    renderWithAuth({ user: { id: 1, nome: 'Teste' }, isAuthenticated: true, isLoading: false, login: () => {}, logout: () => {} })
    // Espera encontrar o conteúdo protegido
    expect(screen.getByText('Conteúdo Protegido')).toBeTruthy()
  })
})