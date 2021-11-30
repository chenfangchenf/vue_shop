<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
      <!-- <el-breadcrumb-item>活动详情</el-breadcrumb-item> -->
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryinfo.query">
            <el-button slot="append" icon="el-icon-search" @click="searchOrder"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- list列表区域 -->
      <el-table :data="orderlist" border style="width: 100%" stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"> </el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.order_pay === '0'" type="danger">未付款</el-tag>
            <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"> </el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="showAddress">编辑</el-button>
          <el-button type="success" size="mini" icon="el-icon-location-outline" @click="showProgressBox">按钮</el-button>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryinfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryinfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
    <el-dialog title="修改地址信息" :visible.sync="addressVisible" width="40%" @close="addressClosed">
      <el-form :model="addAddress" :rules="addAddressrules" ref="addAddressruleRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader v-model="addAddress.address1" :options="citydata" :props="addressprops" @change="addresshandleChange"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addAddress.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="物流信息" :visible.sync="progressVisible" width="50%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in progressinfo" :key="index" :timestamp="activity.time">
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import citydata from './citydata.js'
export default {
  data() {
    return {
      // 查询条件
      queryinfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // order list列表
      orderlist: [],
      // 数据总数
      total: 0,
      addressVisible: false,
      addAddress: {
        address1: [],
        address2: ''
      },
      addAddressrules: {
        address1: [{ required: true, message: '请选择省市区/县', trigger: 'blur' }],
        address2: [{ required: true, message: '请填写详细地址', trigger: 'blur' }]
      },
      citydata,
      // 级联选择器
      addressprops: {
        expandTrigger: 'hover'
      },
      progressVisible: false,
      // 物流信息
      progress: {
        data: [
          {
            time: '2018-05-10 09:39:00',
            ftime: '2018-05-10 09:39:00',
            context: '已签收,感谢使用顺丰,期待再次为您服务',
            location: ''
          },
          {
            time: '2018-05-10 08:23:00',
            ftime: '2018-05-10 08:23:00',
            context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
            location: ''
          },
          {
            time: '2018-05-10 07:32:00',
            ftime: '2018-05-10 07:32:00',
            context: '快件到达 [北京海淀育新小区营业点]',
            location: ''
          },
          {
            time: '2018-05-10 02:03:00',
            ftime: '2018-05-10 02:03:00',
            context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
            location: ''
          },
          {
            time: '2018-05-09 23:05:00',
            ftime: '2018-05-09 23:05:00',
            context: '快件到达 [北京顺义集散中心]',
            location: ''
          },
          {
            time: '2018-05-09 21:21:00',
            ftime: '2018-05-09 21:21:00',
            context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
            location: ''
          },
          {
            time: '2018-05-09 13:07:00',
            ftime: '2018-05-09 13:07:00',
            context: '顺丰速运 已收取快件',
            location: ''
          },
          {
            time: '2018-05-09 12:25:03',
            ftime: '2018-05-09 12:25:03',
            context: '卖家发货',
            location: ''
          },
          {
            time: '2018-05-09 12:22:24',
            ftime: '2018-05-09 12:22:24',
            context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
            location: ''
          },
          {
            time: '2018-05-08 21:36:04',
            ftime: '2018-05-08 21:36:04',
            context: '商品已经下单',
            location: ''
          }
        ],
        meta: { status: 200, message: '获取物流信息成功！' }
      },
      progressinfo: []
    }
  },
  methods: {
    // 获取订单列表、
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.queryinfo })
      if (res.meta.status !== 200) {
        return this.$http.error('获取订单列表失败')
      }
      this.orderlist = res.data.goods
      this.total = res.data.total
      console.log(res)
    },
    // pageSize 改变时会触发
    handleSizeChange(val) {
      this.queryinfo.pagesize = val
      this.getOrderList()
    },
    // currentPage 改变时会触发
    handleCurrentChange(val) {
      this.queryinfo.pagenum = val
      this.getOrderList()
    },
    // 搜索框
    searchOrder() {
      console.log(this.queryinfo)
      this.getOrderList()
    },
    // 展示修改地址
    showAddress() {
      this.addressVisible = true
    },
    // 地址级联选择器触发
    addresshandleChange() {},
    addressClosed() {
      this.$refs.addAddressruleRef.resetFields()
    },
    // 展示物流信息
    showProgressBox() {
      // const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (this.progress.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
      this.progressinfo = this.progress.data
      console.log(this.progressinfo)
      this.progressVisible = true
    }
  },

  created() {
    this.getOrderList()
  }
}
</script>

<style lang="less" scoped>
@import '../../plugins/timeline-item/timeline-item.css';
@import '../../plugins/timeline/timeline.css';
.el-cascader {
  width: 100%;
}
</style>
