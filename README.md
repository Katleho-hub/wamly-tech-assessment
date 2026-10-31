# wamlystore

A small storefront built for the Wamly technical assessment. You can browse the
products from the [Fake Store API](https://fakestoreapi.com), add them to a cart
and change the cart.

## Getting started

You need Node 24.9 or later. With nvm, run `nvm use` to switch to it.

```sh
npm install
npm run dev
```

Then open http://localhost:5173.

## Scripts

| Script                 | What it does                                       |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Starts the Vite dev server                         |
| `npm run build`        | Type-checks, then builds for production to `dist/` |
| `npm run preview`      | Serves the production build                        |
| `npm test`             | Runs the Jest and React Testing Library tests      |
| `npm run lint`         | Runs ESLint                                        |
| `npm run format`       | Formats the code with Prettier                     |
| `npm run format:check` | Checks the formatting without changing any files   |

## Stack

- React 19, TypeScript and Vite
- Tailwind CSS v4
- TanStack Query for server state
- React Router, with three routes: the products at `/`, the cart at `/cart`,
  and a not-found page for anything else
- Jest and React Testing Library

## How the cart works

Fake Store accepts cart writes but doesn't save them. A `GET` after a `PUT`
returns the original cart, and a new cart can't be fetched at all. The app works
around this:

- The first add creates a cart with `POST /carts`. Later changes send the whole
  product list with `PUT /carts/:id`.
- Each response is written straight into the query cache. `useCartQuery` uses
  `staleTime: 'static'`, so it never refetches, because a refetch would replace
  the cart with the server's unchanged copy.
- The cart id lives in React context (`CartIdProvider`). `useCart` gives
  the product list and the cart page the cart, its actions and the shared busy
  and error state. The top nav reads the cart for its item count.

### Why cart writes run one at a time

Every `PUT` sends the full product list, built from the cart in the cache. If
two requests ran at once, both would start from the same cart, and the second
response would drop the first one's change. So all cart mutations share a
mutation key, and while any of them is running, every add, quantity and remove
button is disabled. The cost is that quick clicks on different products have to
wait for each other.

## Error handling

- **Products fail to load:** queries retry up to three times (but not on a
  404). After that, the page shows an alert with a "Try again" button.
- **A cart write fails:** the cart only changes once the server responds, so a
  failure leaves it as it was. The product card that sent the request shows an
  error and turns its button into "Try again". The cart page shows an alert.
- **Missing resources:** Fake Store responds with `200` and an empty or `null`
  body. The API client treats an empty `GET` response as a 404.
- **A page crashes:** a route error boundary shows an error page inside the
  layout, so the top nav stays. It offers "Try again", and a link back to the
  products when the crash wasn't on the product list itself.
- **Unknown URLs** show the not-found page.

## Images on slow connections

Fake Store's product images are 220–320 kB PNGs. The app loads them through the
[wsrv.nl](https://wsrv.nl) image proxy, which resizes them and converts them to
WebP. A 320px image is about 20 kB. `srcset` and `sizes` let the browser pick
the smallest width for the screen. If the proxy fails, `ProductImage` falls back
to the original image from Fake Store.

The first four cards, which are above the fold, load their images eagerly at
high priority. The rest load lazily. `index.html` also preconnects to the API
and the proxy, and loads the Poppins font without blocking rendering.

## Tests

`npm test` runs these tests:

- the add-to-cart flow, including the in-flight state, failures and retries
- the cart page
- routing and the error pages
- the product card
- the product image fallback

`fetch` is mocked in `src/test/fake-store.ts`, so the tests don't use the
network.

React Router ships as ES modules only. Jest runs with
`--experimental-vm-modules` so that it can load them, and a custom jsdom
environment adds the fetch and encoding globals from Node. This setup is why the
project needs Node 24.9.

## Known limitations

- **The cart resets when you reload the page.** The cart id and contents live
  only in memory, and Fake Store doesn't keep them.
- Every cart belongs to user 1. There's no sign-in.
- There's no checkout, delivery cost or promo code. The total is added up in the
  browser.
- If wsrv.nl is down, images fall back to the full-size PNGs, which are much
  slower to load.
- Cart writes run one at a time, so quick adds wait for each other.

## What I'd do next

- Save the cart in `localStorage` so it survives a reload.
- Update the cart optimistically with a rollback, and queue writes instead of
  disabling the buttons.
- Add search and category filters, and a product detail page.
- Add end-to-end tests with Playwright against the real API.
