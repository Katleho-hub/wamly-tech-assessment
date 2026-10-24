import JSDOMEnvironment from 'jest-environment-jsdom'

// jsdom lacks the fetch and encoding globals react-router uses, so take them
// from Node. AbortController comes along too: Node's Request rejects jsdom's
// AbortSignal.
const nodeGlobals = {
  AbortController,
  AbortSignal,
  Headers,
  Request,
  Response,
  TextDecoder,
  TextEncoder,
}

export default class extends JSDOMEnvironment {
  constructor(...args) {
    super(...args)
    Object.assign(this.global, nodeGlobals)
  }
}
