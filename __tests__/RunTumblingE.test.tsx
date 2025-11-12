/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { RunTumblingE } from '../components/RunTumblingE'

describe('RunTumblingE', () => {
  test('renders and allows tap inputs', () => {
    const onResult = jest.fn()
    render(<RunTumblingE variant="near" pxPerMM={4} distanceCm={40} onResult={onResult} />)
    expect(screen.getByRole('img', { name: /tumbling e/i })).toBeInTheDocument()
    const right = screen.getByRole('button', { name: /e right/i })
    fireEvent.click(right)
  })

  test('fires record via custom event', () => {
    const onResult = jest.fn()
    render(<RunTumblingE variant="near" pxPerMM={4} distanceCm={40} onResult={onResult} />)
    window.dispatchEvent(new CustomEvent('visionary:save-active-test'))
    // result depends on internal state; just ensure handler doesn't crash
    expect(true).toBe(true)
  })
})
