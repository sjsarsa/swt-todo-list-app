import { defineConfig } from 'astro/config'
import solid from '@astrojs/solid-js'
import tailwind from '@astrojs/tailwind'
import icon from 'astro-icon'

// https://astro.build/config
export default defineConfig({
  integrations: [solid(), tailwind(), icon()],
  server: {
    port: 4321,
    host: '0.0.0.0',
  },
})
