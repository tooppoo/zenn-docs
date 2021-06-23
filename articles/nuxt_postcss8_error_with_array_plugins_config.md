---
title: '@nuxt/postcss8 使用時 "Cannot find module 0" エラーが発生する場合とその対処'
emoji: "💣"
type: "tech"
topics: ["nuxtjs", "postcss8"]
published: true
---

# 現象
autoprefixer を v10 にバージョンアップする時、postcssをv8以上に更新する必要が生じた。
そこで、 [postcss8の移行ガイド](https://github.com/postcss/postcss/wiki/PostCSS-8-for-end-users#nuxtjs) に従って以下を試みた。

- Nuxt.js を `>= 2.15.3` に更新
- [@nuxt/postcss8](https://www.npmjs.com/package/@nuxt/postcss8) を追加

その後、 `nuxt generate` によって静的ファイルを生成しようとしたところ、掲題のエラーによって失敗した。

```
╭───────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                               │
│   ✖ Nuxt Fatal Error                                                                          │
│                                                                                               │
│   Error: Cannot find module '0'                                                               │
│   Require stack:                                                                              │
│   - /Users/path/to/app/node_modules/@nuxt/core/dist/core.js                                   │
│                                                                                               │
╰───────────────────────────────────────────────────────────────────────────────────────────────╯
```

# 発生時の状況
## `package.json` の依存関係定義
```json
{
  "dependencies": {
    "@nuxtjs/axios": "^5.3.6",
    "cross-env": "^7.0.0",
    "nuxt": "2.15.7"
  },
  "devDependencies": {
    "@nuxt/postcss8": "1.1.3",
    "@nuxtjs/eslint-config": "^6.0.0",
    "@vue/test-utils": "^1.0.0-beta.27",
    "autoprefixer": "^10.0.0",
    "babel-core": "7.0.0-bridge.0",
    "babel-eslint": "^10.0.1",
    "babel-jest": "^27.0.0",
    "eslint": "^7.0.0",
    "eslint-config-prettier": "^8.0.0",
    "eslint-config-standard": ">=12.0.0",
    "eslint-loader": "^4.0.0",
    "eslint-plugin-import": ">=2.16.0",
    "eslint-plugin-jest": ">=22.3.0",
    "eslint-plugin-node": ">=8.0.1",
    "eslint-plugin-nuxt": ">=0.4.2",
    "eslint-plugin-prettier": "^3.0.1",
    "eslint-plugin-promise": ">=4.0.1",
    "eslint-plugin-standard": ">=4.0.0",
    "eslint-plugin-vue": "^7.0.0",
    "jest": "^27.0.0",
    "nodemon": "^2.0.0",
    "postcss": "^8.3.5",
    "prettier": "^2.0.0",
    "tailwindcss": "^2.0.0",
    "vue-jest": "^3.0.3"
  }
}
```

## `nuxt.config.js` でのモジュール指定
```js
{
  buildModules: [
    '@nuxt/postcss8'
  ]
}
```

`'@nuxt/postcss8'` をコメントアウトすると掲題のエラーは発生しなくなった。
そのため、 `'@nuxt/postcss8'` が原因と判断。

# 対処法
`nuxt.config.js` の `build.postcss.plugins` 指定を配列からオブジェクト形式に変更することで、掲題の現象は発生しなくなった。

## before
```js
import path from 'path'
// (略)
export default {
  // (略)
  build: {
    postcss: {
      plugins: [
        require('tailwindcss')(
          path.join(__dirname, 'tailwind.js')
        ),
        require('autoprefixer')
      ]
    }
  }
}
```

## after
```js
import path from 'path'
// (略)
export default {
  build:
    postcss: {
      plugins: {
        tailwindcss: require('tailwindcss')(
          path.join(__dirname, 'tailwind.js')
        ),
        autoprefixer: require('autoprefixer')
      }
    }
  }
}
```

# 原因
`nuxt.config.js` におけるPostCSS用プラグインの指定方法と、 `@nuxt/postcss8` によるプラグインの加工が食い違っていたことによる。

## `@nuxt/postcss8` による config の書き換え
`@nuxt/postcss8` は、適用時に `build.postcss.plugins` 指定を書き換えて、 [プラグインの順番を並べ替えている](https://github.com/nuxt/postcss8/blob/eddef10709221cf256ff2a3aa39ebf9462bf9758/src/index.ts#L22-L32) [^1]。
この時、 `'@nuxt/postcss8'` は [defu](https://www.npmjs.com/package/defu) を利用してオプションをマージしているが、 `defu(baseObj, defaults)` によって `build.postcss.plugins` が以下のように書き換わる。

```js
{
  build: {
    postcss: {
      plugins: {
        '0': { /* プラグイン略 */ },
        '1': { /* プラグイン略 */ },
        'autoprefixer': {}
      }
    }
  }
}
```

この時 postcss-loader は `plugins` の [各キーをプラグイン名と見て解釈する](https://github.com/webpack-contrib/postcss-loader#config) ので、 `'0'` という名前のプラグインを参照しようとするが、そのような名前のプラグインは存在しないのでエラーとなった。

[^1]: 並び替えは `order(name)` に従って行われる。この `order(name)` はどうやら [nuxtによる独自拡張の模様](https://github.com/nuxt/nuxt.js/blob/35c6ac411dd6d1d218c56c0d764df2e5f804f975/packages/webpack/src/utils/postcss-v8.js#L142-L148)。

## `defu` によるマージ
今回のケースでは、 `defu(baseObj, defaults)` を実行した時のパラメータが `baseObj: Array` `defaults: Object` という組み合わせだったパターンに該当する。

`defu` は baseObj の各 key を走査して、 `defaults[key]` が [存在しない場合](https://github.com/unjs/defu/blob/c21b1329939a3aeb8e2baeabd3b71a01491db959/src/defu.ts#L34-L36) は key と key に対応する値を defaults に挿入することでマージを行う。

この時、 `baseObj: Array` であるから走査によって得られる key は `0, 1, 2, ...` といった添字になるため、 defaults に挿入される key もまた `"0", "1", "2", ...` といった内容になる。結果、上記のように数字が添字として入った `build.postcss.plugins` が発生する。

これを防ぐため、そもそも `nuxt.config.js` における `build.postcss.plugins` の指定を配列からオブジェクト形式に変更することで、問題が解消した。


# 懸念
## postcss-loader の設定方法
[postcss-loader](https://github.com/webpack-contrib/postcss-loader#config) を見ると、 `plugins` のキーをオブジェクトで指定する方法は `deprecated, will be removed in the next major release` であり、基本的には配列を用いることが推奨されている。従って、 `@nuxt/postcss8` を用いるためにプラグイン指定をオブジェクトにした場合、今後のバージョンアップに際して問題となる可能性がある。

## nuxt と postcss-loader のズレ？
他方、 nuxt では [Arrayではなくオブジェクト形式での指定を推奨しようとしている？](https://ja.nuxtjs.org/docs/2.x/configuration-glossary/configuration-build/#postcss)

postcss と nuxt で是とする方向が食い違っているように見える、しかも postcss は次期バージョンでオブジェクト方式を廃止しようとしている点が気がかり。
このI/F差分は、nuxt の plugin によって今後継続して埋めていくことになるのだろうか。
