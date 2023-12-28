import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  {
    path: '/about',
    name: 'about',
    component: function () {
      return import('../views/AboutView.vue')
    }
  },
  {
    path: '/',
    name: 'chat',
    component: () => import('../components/Chat.vue')
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
