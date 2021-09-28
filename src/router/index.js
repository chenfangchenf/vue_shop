import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
Vue.use(VueRouter)

const routes = [
  // 重定向--访问根路径自动跳转
  { path: '/', redirect: './login' },
  {
    path: '/login', component: Login
  },
  {
    path: '/home', component: Home
  }
]

const router = new VueRouter({
  routes
})

// 导航守卫
// to：去哪个路径
// from 从哪个路径来
// next 放行函数 next（'/'）
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  //  没有登录，跳转到登录页面
  if (!tokenStr) return next('/login')
  next()
})
export default router
