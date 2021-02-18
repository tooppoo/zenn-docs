module.exports = {
  filters: {
    allowlist: {
      allow: [
        "/\\[\\^[0-9]+\\]:.+p\\.[0-9]+/", // 脚注
      ],
    },
  },
  rules: {
    "ja-no-abusage": true,
    "ja-no-mixed-period": true,
    "no-double-negative-ja": true,
    "no-doubled-conjunction": true,
    "no-doubled-joshi": true,
    "no-mix-dearu-desumasu": true,
    "period-in-list-item": true,
    "web-plus-db": true,
  }
}