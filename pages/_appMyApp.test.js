import React from 'react'
import MyApp from './index'

describe('<MyApp />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<MyApp />)
  })
})