import '@testing-library/jest-dom'

declare global {
  namespace Vi {
    interface Assertion extends jest.Matchers<void, any> {}
    interface AsymmetricMatchersContaining {}
  }
}
