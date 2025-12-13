import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock global fetch para todos os testes - retorna arrays vazios
global.fetch = vi.fn((url: string) => {
  // Retornar dados apropriados baseado na URL
  let responseData: any = []

  if (url.includes('eventos')) {
    responseData = []
  } else if (url.includes('avisos')) {
    responseData = []
  } else if (url.includes('auth/me')) {
    responseData = { is_authenticated: false, user: null }
  } else if (url.includes('admin')) {
    responseData = []
  } else {
    responseData = []
  }

  return Promise.resolve({
    ok: true,
    json: async () => responseData,
  } as Response)
}) as any