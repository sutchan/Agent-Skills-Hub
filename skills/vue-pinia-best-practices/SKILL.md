---
name: vue-pinia-best-practices
description: Pinia 状态管理：store 设计、setup 风格定义、状态/ Getter/ Action 与响应式写法等最佳实践。当用户设计或重构 Vue 应用的全局状态时使用。
en_description: Pinia stores, state management patterns, store setup, and reactivity with stores."
zh_displayName: Vue Pinia 最佳实践
category: 前端开发
en_category: Frontend Dev
author: github.com/vuejs-ai
license: MIT
version: 1.0.0
---
Pinia best practices, common gotchas, and state management patterns.

### Store Setup
- Getting "getActivePinia was called" error at startup → See [pinia-no-active-pinia-error](reference/pinia-no-active-pinia-error.md)
- Setup stores missing state in DevTools or SSR → See [pinia-setup-store-return-all-state](reference/pinia-setup-store-return-all-state.md)

### Reactivity
- Store destructuring stops updating UI reactively → See [pinia-store-destructuring-breaks-reactivity](reference/pinia-store-destructuring-breaks-reactivity.md)
- Store methods lose context in template calls → See [store-method-binding-parentheses](reference/store-method-binding-parentheses.md)

### State Patterns
- Filters reset on refresh or can't be shared → See [state-url-for-ephemeral-filters](reference/state-url-for-ephemeral-filters.md)
- Building production app without DevTools or conventions → See [state-use-pinia-for-large-apps](reference/state-use-pinia-for-large-apps.md)
