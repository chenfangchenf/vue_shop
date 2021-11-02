<template>
  <el-container class="containerHome">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <div>
          <span>电商后台管理系统</span>
        </div>
      </div>
      <el-button type="info" @click="logout">退出登录</el-button>
    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <el-aside :width="isCollpase ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单 -->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" unique-opened="true" :collapse="isCollpase" :collapse-transition="false" :router="true" :default-active="activePath">
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i :class="iconlist[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item :index="'/' + itemchild.path" v-for="itemchild in item.children" :key="itemchild.id" @click="saveNavState('/' + itemchild.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ itemchild.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menulist: [],
      iconlist: {
        125: 'el-icon-user',
        103: 'el-icon-lock',
        101: 'el-icon-shopping-cart-full',
        102: 'el-icon-document',
        145: 'el-icon-coin'
      },
      // 菜单是否折叠
      isCollpase: false,
      // 被激活的用户链表
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      console.log(this.menulist)
    },
    // 点击按钮切换菜单折叠与展开
    toggleCollapse() {
      this.isCollpase = !this.isCollpase
    },
    // 保存链接激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
    }
  }
}
</script>

<style lang="less" scoped>
.containerHome {
  height: 100%;
  width: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  > div {
    display: flex;
    color: white;
    align-items: center;
    span {
      padding-left: 20px;
      font-size: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #eaedf1;
}
.el-menu {
  border-right: 0;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #eaedf1;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
