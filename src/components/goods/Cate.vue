<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      <!-- <el-breadcrumb-item>活动详情</el-breadcrumb-item> -->
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="addGoods">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table class="treeTable" :data="catelist" :columns="colums" :selection-type="false" :expand-type="false" show-index index-text="#" border>
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="editGoods(scope.row.id)">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryinfo.pagenum" :page-sizes="[3, 5, 8, 10]" :page-size="queryinfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="提示" :visible.sync="addGoodsdialogVisible" width="30%" @closed="addGoodsClosed">
      <el-form :rules="addCateformRules" ref="form" :model="addCateform" label-width="100px" class="demo-ruleForm">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateform.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级名称">
          <el-cascader v-model="selectdkeys" :options="parentList" :props="parentListprops" @change="parentCateChange" :clearable="true"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addGoodsdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品分类列表
      catelist: [],
      // 查询条件
      queryinfo: {
        type: 3,
        // 当前页码
        pagenum: 1,
        // 每页显示多少数据
        pagesize: 5
      },
      // 总数据条数
      total: 0,
      colums: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 添加分类对话框
      addGoodsdialogVisible: false,
      // addCateform添加分类
      addCateform: {
        // 将要添加的分类名称
        cat_name: '',
        // 要添加1级分类，则父分类Id应该设置为  `0`
        cat_pid: 0,
        // `0`表示一级分类；`1`表示二级分类；`2`表示三级分类
        cat_level: 0
      },
      // 父级分类列表
      parentList: [],
      // 级联选择器配置
      parentListprops: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: 'true'
      },
      // 选中的父级分类的id数组
      selectdkeys: [],
      addCateformRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.cateList()
  },
  methods: {
    // 分类列表
    async cateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryinfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      // console.log(res.data)
      console.log(res.data.result)
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 分页--监控size改变
    handleSizeChange(val1) {
      this.queryinfo.pagesize = val1
      this.cateList()
    },
    // 分页-监控页码改变
    handleCurrentChange(val2) {
      this.queryinfo.pagenum = val2
      this.cateList()
    },
    // 添加用户分类
    addGoods() {
      this.addGoodsdialogVisible = true
      this.getParentCateList()
    },
    // 添加分类关闭
    addGoodsClosed() {
      this.$refs.form.resetFields()
      this.selectdkeys = []
      this.addCateform.cat_pid = 0
      this.addCateform.cat_level = 0
    },
    // 获取父级分类
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      console.log(res.data)
      this.parentList = res.data
    },
    // 选择项发生变化触发
    async parentCateChange() {
      console.log(this.selectdkeys)
      if (this.selectdkeys.length > 0) {
        this.addCateform.cat_pid = this.selectdkeys[this.selectdkeys.length - 1]
        this.addCateform.cat_level = this.selectdkeys.length
      } else {
        this.addCateform.cat_pid = 0
        this.addCateform.cat_level = 0
      }
    },
    async addCate() {
      console.log(this.addCateform)
      const { data: res } = await this.$http.post('categories', this.addCateform)
      if (res.meta.status !== 201) {
        return this.$message.error('增加分类失败')
      }
      this.addGoodsdialogVisible = false
      return this.$message.success('添加分类成功')
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
</style>
