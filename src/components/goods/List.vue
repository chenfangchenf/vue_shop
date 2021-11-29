<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryinfo.query" clearable @clear="getGoodsList"> <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button> </el-input
        ></el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column property="goods_name" label="商品名称"> </el-table-column>
        <el-table-column property="goods_price" label="商品价格（元）" width="120px"> </el-table-column>
        <el-table-column property="goods_weight" label="商品重量" width="120px"> </el-table-column>
        <el-table-column property="add_time" label="创建时间" width="160px">
          <template slot-scope="scope">
            <!-- 过滤器 -->
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <!-- 操作 -->
          <template slot-scope="scope">
            <!-- {{ scope }} -->
            <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="deletegoods(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryinfo.pagenum" :page-sizes="[5, 8, 10, 20]" :page-size="queryinfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background> </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 查询信息
      queryinfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 列表总数
      total: 0,
      // 商品列表
      goodslist: []
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', { params: this.queryinfo })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('查询商品列表失败')
      }
      this.total = res.data.total
      this.goodslist = res.data.goods
    },
    // 页码大小change分页
    handleSizeChange(val) {
      this.queryinfo.pagesize = val
      this.getGoodsList()
    },
    // 当前页变动
    handleCurrentChange(val) {
      this.queryinfo.pagenum = val
      this.getGoodsList()
    },
    // 删除商品
    async deletegoods(row) {
      const res = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (res !== 'confirm') {
        return this.$message.error('取消删除操作')
      }
      const { data: res1 } = await this.$http.delete(`goods/${row.goods_id}`)
      if (res1.meta.status !== 200) {
        return this.$message.error('删除商品失败')
      }
      this.$message.success('删除商品成功')
      this.getGoodsList()
    },
    // 跳转到增加页面
    goAddPage() {
      // 路由跳转
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped></style>
