import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'

import { NavLink } from './NavLink'

describe('Componente NavLink', () => {
  it('renderiza uma âncora com o rótulo e href fornecidos', () => {
    render(
      <MemoryRouter initialEntries={["/teste"]}>
        <NavLink to="/teste">Rótulo do Link</NavLink>
      </MemoryRouter>,
    )

    const el = screen.getByText('Rótulo do Link')
    expect(el).toBeTruthy()
    // a âncora deve ter o atributo href
    expect(el.closest('a')?.getAttribute('href')).toBe('/teste')
  })

  it('aplica a classe ativa quando a rota corresponde', () => {
    render(
      <MemoryRouter initialEntries={["/ativo"]}>
        <NavLink to="/ativo" activeClassName="ativo">Link Ativo</NavLink>
      </MemoryRouter>,
    )

    const el = screen.getByText('Link Ativo')
    expect(el).toBeTruthy()
    // a lista de classes deve conter a classe ativa
    expect(el.closest('a')?.className.includes('ativo')).toBe(true)
  })
})