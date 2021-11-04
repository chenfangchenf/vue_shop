<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-col :span="4">
        <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
      </el-col>
      <el-table :data="rolelist" style="width: 100%" border stripe>
        <!-- 展开列 -->
        <el-table-column label="序号" type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', i1 == 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag>{{ item1.authName }} </el-tag> <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 循环遍历两级权限 -->
                <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{ item2.authName }} </el-tag> <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{ item3.authName }} </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{ scope.row }}</pre> -->
          </template>
        </el-table-column>
        <el-table-column label="序号" type="index"> </el-table-column>
        <el-table-column label="角色名称" prop="roleName"> </el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"> </el-table-column>
        <el-table-column label="操作">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- {{ scope.row.id }} -->
            <!-- 修改 -->
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <!-- 删除 -->
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <!-- 分配quanxian  -->
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="30%" @close="addDialogClosed">
      <el-form :model="addRoleFrom" :rules="addRoleFromRules" ref="addRoleFromRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleFrom.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleFrom.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限 -->
    <el-dialog title="分配权限" :visible.sync="setRightdialogVisible" width="50%" @close="setRightDialogClosed">
      <!-- 树形 -->
      <el-tree :data="userRightlist" :props="treeProps" ref="treeRef" show-checkbox node-key="id" default-expand-all="true" :default-checked-keys="defKeys"></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色权限列表
      rolelist: [],
      // 控制分配权限对话框显示与隐藏
      setRightdialogVisible: false,
      userRightlist: [],
      // 树形控件属性绑定
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中节点
      defKeys: [],
      // 当前角色id
      roleId: '',
      // 添加用户角色对话框显示与隐藏
      addRoleDialogVisible: false,
      // 添加用户角色列表
      addRoleFrom: {
        roleName: '',
        roleDesc: ''
      }
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('请求权限列表失败')
      }
      this.rolelist = res.data
      // console.log(11111)
      // console.log(res)
      // console.log(this.rolelist)
    },
    // 删除角色指定权限
    async removeRightById(row, rightId) {
      const res = await this.$confirm('此操作将永久删除该用户该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (res !== 'confirm') {
        return this.$message.error('取消权限删除')
      }
      const { data: res1 } = await this.$http.delete(`roles/${row.id}/rights/${rightId}`)
      if (res1.meta.status !== 200) {
        return this.$message.error('权限删除失败')
      }
      // console.log(res1)
      row.children = res1.data
    },
    // 展示分配权限对话框
    async showSetRightDialog(role) {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.roleId = role.id
      this.userRightlist = res.data
      this.setRightdialogVisible = true
      this.getLeafKeys(role, this.defKeys)
      console.log(this.userRightlist)
    },
    // 通过递归方式获得角色下所有三级权限id，并保存到数组中
    getLeafKeys(node, arr) {
      // 如果是三级权限，存储id
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框关闭事件
    setRightDialogClosed() {
      console.log('setRightDIalogClose')
      this.defKeys = []
    },
    // 分配权限函数
    async allotRights() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      console.log(keys)
      const idSrr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idSrr
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.setRightdialogVisible = false
      this.getRoleList()
      return this.$message.success('分配权限成功')
    },
    // 增加角色
    async addRole() {
      const { data: res } = await this.$http.post('roles', this.addRoleFrom)

      if (res.meta.status !== 201) {
        return this.$message.error('添加角色失败')
      }
      this.getRoleList()
      this.addRoleDialogVisible = false
    },
    // 关闭添加用户角色
    addDialogClosed() {
      this.addRoleFrom = {}
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
