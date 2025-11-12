/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { StickyActions } from '../components/StickyActions'

test('renders and triggers callbacks', () => {
  const onBack = jest.fn()
  const onPrimary = jest.fn()
  render(<StickyActions variant="setup" onBack={onBack} backLabel="Back" primaryLabel="Continue" onPrimary={onPrimary} />)
  fireEvent.click(screen.getByText(/back/i))
  fireEvent.click(screen.getByText(/continue/i))
  expect(onBack).toHaveBeenCalled()
  expect(onPrimary).toHaveBeenCalled()
})
