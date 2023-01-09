import { cy } from 'cypress';
import '@testing-library/cypress/add-commands';

describe('Home page', () => {
    it('displays the correct content and functionality', () => {

        cy.visit('/');

        cy.get('head > title').should('have.text', 'What to Watch');
        cy.get('h1').should('have.text', 'What to Watch');

        cy.get('[data-testid="movie-input-1"]').should('have.attr', 'placeholder', 'Movie 1');
        cy.get('[data-testid="movie-input-2"]').should('have.attr', 'placeholder', 'Movie 2');
        cy.get('[data-testid="movie-input-3"]').should('have.attr', 'placeholder', 'Movie 3');

        cy.get('[data-testid="director-input-1"]').should('have.attr', 'placeholder', 'Director 1');
        cy.get('[data-testid="director-input-2"]').should('have.attr', 'placeholder', 'Director 2');
        cy.get('[data-testid="director-input-3"]').should('have.attr', 'placeholder', 'Director 3');

        cy.get('button[type="submit"]').should('be.disabled');
        cy.get('[data-testid="movie-input-1"]').type('Movie 1');
        cy.get('button[type="submit"]').should('be.disabled');
        cy.get('[data-testid="movie-input-2"]').type('Movie 2');
        cy.get('button[type="submit"]').should('be.disabled');
        cy.get('[data-testid="movie-input-3"]').type('Movie 3');
        cy.get('button[type="submit"]').should('not.be.disabled');

        cy.get('[data-testid="movie-input-1"]').type('Movie 1');
        cy.get('[data-testid="director-input-1"]').type('Director 1');
        cy.get('[data-testid="movie-input-2"]').type('Movie 2');
        cy.get('[data-testid="director-input-2"]').type('Director 2');
        cy.get('[data-testid="movie-input-3"]').type('Movie 3');
        cy.get('[data-testid="director-input-3"]').type('Director 3');
        cy.get('form').submit();

        cy.get('[data-testid="results-header"]').should('have.text', 'Your movie is:');
        cy.get('[data-testid="result-title"]').should('have.text', 'Movie Title');
        cy.get('[data-testid="result-year"]').should('have.text', '20XX');
        cy.get('[data-testid="result-director"]').should('have.text', 'Director Name');

    });
});