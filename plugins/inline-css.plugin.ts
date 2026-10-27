import type { Plugin } from 'vite'

export default function inlineCss(): Plugin {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const html = Object.values(bundle).find(
        (f) => f.type === 'asset' && f.fileName.endsWith('.html'),
      )
      if (!html || html.type !== 'asset') return

      let source = html.source.toString()
      for (const [name, css] of Object.entries(bundle)) {
        if (css.type !== 'asset' || !name.endsWith('.css')) continue
        const link = source.match(
          new RegExp(`<link[^>]*href="[^"]*${name}"[^>]*>`),
        )
        if (!link) {
          this.warn(`No link tag found for ${name}`)
          continue
        }
        source = source.replace(
          link[0],
          () => `<style>${css.source.toString()}</style>`,
        )
        delete bundle[name]
      }
      html.source = source
    },
  }
}
