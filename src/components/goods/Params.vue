<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
      <!-- <el-breadcrumb-item>活动详情</el-breadcrumb-item> -->
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 头部警告 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false"> </el-alert>
      <el-cascader v-model="selectdCatekeys" :options="catelist" :props="cateprops" @change="handleChange"></el-cascader>

      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtn" @click="adddialogVisible = true">添加参数</el-button>
          <el-table :data="manytableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(scope.row, i)">{{ item }}</el-tag>
                <!-- <el-tag>{{ scope.attr_name }}</el-tag> -->
                <!-- 输入的文本框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"> </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <!-- <el-table-column label="参数名称" prop="attr_vals"></el-table-column> -->
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- {{ scope.attr_id }} -->
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="updateshowdialog(scope.row)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteAttr(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtn" @click="adddialogVisible = true">添加属性</el-button>
          <el-table :data="onlytableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(scope.row, i)">{{ item }}</el-tag>
                <!-- <el-tag>{{ scope.attr_name }}</el-tag> -->
                <!-- 输入的文本框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"> </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                {{ scope.attr_id }}
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="updateshowdialog(scope.row)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteAttr(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="adddialogVisible" width="50%" @close="adddialogclose">
      <!-- 添加参数对话框 -->
      <el-form :model="addForm" :rules="addFormrules" ref="addFormref" label-width="100px" class="demo-ruleForm">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="adddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editdialogVisible" width="50%" @close="editdialogclose">
      <!-- 添加参数对话框 -->
      <el-form :model="editForm" :rules="editFormrules" ref="editFormref" label-width="100px" class="demo-ruleForm">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      catelist: [],
      // 级联选择框配置
      cateprops: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: 'true'
      },
      // 级联选择框选择的部分
      selectdCatekeys: [],
      // 被激活tabs的名称
      activeName: 'many',
      // 动态数据
      manytableData: [],
      // 静态
      onlytableData: [],
      // 控制添加对话框
      adddialogVisible: false,
      // 控制修改对话框
      editdialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      editForm: {},
      // 添加表单验证规则
      addFormrules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      editFormrules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    // 获取商品分类
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }
      // res.data.forEach(attr => {
      //   attr.attr_vals = attr.attr_vals.split(' ')
      // })
      this.catelist = res.data
      console.log(this.catelist)
    },
    async handleChange() {
      this.getDataList()
    },
    // tab页签点击事件处理函数
    handleTabClick() {
      this.getDataList()
      console.log(this.activeName)
    },
    // 分类参数，选择商品分类
    async getDataList() {
      console.log(this.selectdCatekeys)
      if (this.selectdCatekeys.length !== 3) {
        this.selectdCatekeys = []
        this.manytableData = []
        this.onlytableData = []
        return
      }
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('查询失败')
      }

      res.data.forEach(element => {
        if (element.attr_vals.length > 0) {
          element.attr_vals = element.attr_vals.split(' ')
        } else {
          element.attr_vals = []
        }
        // 控制按钮与文本框展示
        element.inputVisible = false
        // 文本框输入内容
        element.inputValue = ''
      })

      if (this.activeName === 'many') {
        this.manytableData = res.data
        console.log(this.manytableData)
      } else {
        this.onlytableData = res.data
        console.log(this.onlytableData)
      }
    },
    // 展示修改对话框
    async updateshowdialog(row) {
      this.editdialogVisible = true
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${row.attr_id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取详情失败')
      }
      this.editForm = res.data
    },
    // 监听添加对话框的关闭事件
    adddialogclose() {
      this.$refs.addFormref.resetFields()
    },
    editdialogclose() {
      this.$refs.editFormref.resetFields()
    },
    addParams() {
      this.$refs.addFormref.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })

        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.adddialogVisible = false
        this.getDataList()
      })
    },
    async editParams() {
      // console.log('edit')
      // this.$http.put(`categories/${this.cateId}/attributes/:attrId`)

      // this.updateAttr_vals(this.editForm)

      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
        attr_name: this.editForm.attr_name,
        attr_sel: this.editForm.attr_sel,
        attr_vals: this.editForm.attr_vals
      })

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      }
      this.$message.success('修改参数项成功！')

      this.$refs.editFormref.resetFields()
      this.editdialogVisible = false
      this.getDataList()
    },
    // 展示增加tag
    showInput(row) {
      row.inputVisible = true
      // 当页面上元素被重新渲染后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 文本框失去焦点，或按下enter都会改变
    handleInputConfirm(row) {
      console.log(row)
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
        return
      }
      // trim去掉空格
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible = false
      row.inputValue = ''
      this.updateAttr_vals(row)
    },
    // 删除tag
    handleClose(row, i) {
      // 删除一项
      row.attr_vals.splice(i, 1)
      this.updateAttr_vals(row)
    },
    // 保存tag标签修改
    async updateAttr_vals(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      }
      this.$message.success('修改参数项成功！')
    },
    // 删除参数
    async deleteAttr(row) {
      const res = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (res !== 'confirm') {
        return this.$message.error('取消删除操作')
      }

      console.log(res)
      const { data: res1 } = await this.$http.delete(`categories/${this.cateId}/attributes/${row.attr_id}`)
      console.log(row)
      console.log(res1)
      if (res1.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.getDataList()
      return this.$message.success('删除参数成功')
    }
  },

  computed: {
    // 如果按钮需要被禁用，返回true
    isBtn() {
      if (this.selectdCatekeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类id
    cateId() {
      if (this.selectdCatekeys.length === 3) {
        return this.selectdCatekeys[2]
      }
      return null
    },

    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin-left: 10px;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
