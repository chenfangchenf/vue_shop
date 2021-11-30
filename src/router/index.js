import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import GoodsList from '../components/goods/List.vue'
import GoodsAdd from '../components/goods/AddGoods.vue'
import Order from '../components/order/order.vue'
import Reports from '../components/report/Reports.vue'
Vue.use(VueRouter)

const routes = [
  // 重定向--访问根路径自动跳转
  { path: '/', redirect: './login' },
  {
    path: '/login', component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: GoodsAdd },
      { path: '/orders', component: Order },
      { path: '/reports', component: Reports }
    ]
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
