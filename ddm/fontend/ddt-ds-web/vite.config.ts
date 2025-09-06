/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import viteCompression from 'vite-plugin-compression'
import path from 'path'

let baseUrl = 'http://172.16.198.248:18080'
 // baseUrl = 'http://192.168.7.42'
 baseUrl = 'http://172.16.202.10'
// const baseUrl = 'http://192.168.5.245:18092' // 德栋
// const ddtBaseUrl = 'http://172.16.198.167:12345'
let ddtBaseUrl = 'http://172.16.198.248:18080'
 // ddtBaseUrl = 'http://192.168.7.42'
 ddtBaseUrl = 'http://172.16.202.10'
// const ddtBaseUrl = 'http://192.168.7.158:18080'

export default defineConfig({
  // base: process.env.NODE_ENV === 'production' ? '/dolphinscheduler/ui/' : '/',
  base: process.env.NODE_ENV === 'production' ? '/ds-app/' : '/',
  build: {
    outDir: 'dist', // 打包的目录
    assetsDir: 'static' // 打包的静态资源目录  部署同一根目录下的项目命名应该不一样
  },
  plugins: [
    vue(),
    vueJsx(),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // resolve vue-i18n warning: You are running the esm-bundler build of vue-i18n.
      'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js'
    }
  },
  server: {
    proxy: {
      '/dolphinscheduler': {
        // target: loadEnv('development', './').VITE_APP_DEV_WEB_URL,
        target: ddtBaseUrl,
        changeOrigin: true
      },
      '/ddd': {
        // target: 'http://192.168.7.158:18080',
        target: baseUrl,
        changeOrigin: true
      },
      '/ddm': {
        // target: 'http://192.168.7.158:18080',
        target: baseUrl,
        changeOrigin: true
      }
    }
  }
})
