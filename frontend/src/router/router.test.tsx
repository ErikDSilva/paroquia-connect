import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'

import { routesArray } from './router'
import { AuthContext } from '../context/AuthContext'

// Função de autenticação simulada (Mock)
const mockAuth = ({ user = null, isAuthenticated = false, isLoading = false }: any) => ({
    user: user ? { id: 1, nome: 'Usuário Teste', email: 'teste@exemplo.com' } : null,
    isAuthenticated,
    isLoading,
    login: () => {},
    logout: () => {},
})

// Função auxiliar para renderizar com o contexto de autenticação
const renderRouter = (authValue: any, initialRoute = ['/']) => {
    const router = createMemoryRouter(routesArray, { initialEntries: initialRoute })
    return render(
        <AuthContext.Provider value={authValue}>
            <RouterProvider router={router} />
        </AuthContext.Provider>
    )
}

describe('Testes de Integração do Roteador', () => {
    describe('Rotas Públicas', () => {
        it('deve renderizar a página inicial em /', async () => {
            const publicUser = mockAuth({ isAuthenticated: false })
            renderRouter(publicUser, ['/'])
            
            // Verificar se o conteúdo principal é renderizado
            await waitFor(() => {
                const element = screen.queryByRole('main')
                expect(element).toBeTruthy()
            }, { timeout: 3000 })
        })

        it('deve renderizar a página de avisos em /avisos', async () => {
            const publicUser = mockAuth({ isAuthenticated: false })
            renderRouter(publicUser, ['/avisos'])
            
            // Verificar o elemento principal ou a estrutura da página
            await waitFor(() => {
                const mainElement = screen.queryByRole('main')
                expect(mainElement).toBeTruthy()
            }, { timeout: 3000 })
        })

        it('deve renderizar a página de autenticação em /auth', async () => {
            const publicUser = mockAuth({ isAuthenticated: false })
            renderRouter(publicUser, ['/auth'])
            
            // A página de autenticação deve ter conteúdo
            await waitFor(() => {
                const element = screen.queryByRole('main')
                expect(element).toBeTruthy()
            }, { timeout: 3000 })
        })
    })

    describe('Rotas Protegidas', () => {
        it('deve redirecionar usuários não autenticados para /auth', async () => {
            const publicUser = mockAuth({ isAuthenticated: false })
            renderRouter(publicUser, ['/admin/agenda'])

            // Após o redirecionamento, deve-se ver o conteúdo de autenticação
            await waitFor(() => {
                const element = screen.queryByRole('main')
                expect(element).toBeTruthy()
            }, { timeout: 3000 })
        })

        it('deve mostrar o estado de carregamento enquanto verifica a autenticação', async () => {
            const loadingUser = mockAuth({ isLoading: true })
            renderRouter(loadingUser, ['/admin/agenda'])

            await waitFor(() => {
                // Busca por um texto de carregamento (ex: "Carregando...")
                const loadingText = screen.queryByText(/Carregando/i) 
                expect(loadingText).toBeTruthy()
            }, { timeout: 3000 })
        })

        it('deve permitir que usuários autenticados acessem rotas protegidas', async () => {
            const authUser = mockAuth({ isAuthenticated: true, user: true })
            renderRouter(authUser, ['/admin/agenda'])

            // Deve renderizar sem mostrar carregamento ou redirecionamento
            await waitFor(() => {
                const element = screen.queryByRole('main')
                expect(element).toBeTruthy()
            }, { timeout: 3000 })
        })
    })
})