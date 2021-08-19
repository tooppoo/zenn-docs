const path = require('path')
const prhRules = path.resolve(__dirname, 'node_modules', 'prh-rules')

module.exports = {
  filters: {
    allowlist: {
      allow: [
        "/\\[\\^[0-9]+\\]:.+p\\.[0-9]+/", // 脚注
      ],
    },
  },
  rules: {
    "footnote-order": true,
    "ja-no-abusage": true,
    "ja-no-mixed-period": true,
    "no-double-negative-ja": true,
    "no-doubled-conjunction": true,
    "no-doubled-joshi": true,
    "no-mix-dearu-desumasu": true,
    "period-in-list-item": true,
    "prh": {
      "rulePaths": [
        path.resolve(prhRules, "files", "markdown.yml")
      ]
    },
  },
}