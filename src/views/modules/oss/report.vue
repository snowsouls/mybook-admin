<template>
  <div class="mod-config">
    <el-form :inline="true" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="articleId" placeholder="文章ID" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getArticle()">查询</el-button>
        <el-button type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%;">
      <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="50">
      </el-table-column>
      <el-table-column
        prop="id"
        header-align="center"
        align="center"
        width="80"
        label="ID">
      </el-table-column>
      <el-table-column
        prop="user.name"
        header-align="center"
        align="center"
        label="姓名">
      </el-table-column>
      <el-table-column
        header-align="center"
        align="center"
        width="120"
        label="图像">
        <template slot-scope="scope">
          <img :src="$config.imagesUrl + scope.row.user.picture" alt="图像" class="picture">
        </template>
      </el-table-column>
      <el-table-column
        prop="user.postbox"
        header-align="center"
        align="center"
        label="邮箱">
      </el-table-column>
      <el-table-column
        prop="article_id"
        header-align="center"
        align="center"
        label="文章ID">
      </el-table-column>
      <el-table-column
        prop="article"
        header-align="center"
        align="center"
        label="文章">
      </el-table-column>
      <el-table-column
        prop="check"
        header-align="center"
        align="center"
        label="举报">
      </el-table-column>
      <el-table-column
        prop="message"
        header-align="center"
        align="center"
        label="反馈">
      </el-table-column>
      <el-table-column
        prop="phone"
        header-align="center"
        align="center"
        label="邮箱/微信">
      </el-table-column>
      <el-table-column
        prop="time"
        header-align="center"
        align="center"
        label="时间">
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="150"
        label="核实后操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('oss:report:update')" type="text" size="small" @click="solveHandle(scope.row)">解决或优化了</el-button>
          <el-button v-if="isAuth('oss:report:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">举报人扯犊子</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="getDetail" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
  import { Ajax } from '@/utils/validate'
  import AddOrUpdate from './report-detail'
  export default {
    data () {
      return {
        articleId: '',
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false
      }
    },
    components: {
      AddOrUpdate
    },
    activated () {
      this.getDataList()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http.getReport(this.pageIndex, this.pageSize).then(res => {
          if (res.code === 200) {
            res.data.data.forEach(item=> {
              if(item.article.length > 80)
              item.article = item.article.substring(0, 80) + '......'
            })
            this.dataList = res.data.data
            this.totalPage = res.num
          } else {
            this.dataList = []
            this.totalPage = 0
          }
          this.dataListLoading = false
        })
      },
      // 每页数
      sizeChangeHandle (val) {
        this.pageSize = val
        this.pageIndex = 1
        this.getDataList()
      },
      // 当前页
      currentChangeHandle (val) {
        this.pageIndex = val
        this.getDataList()
      },
      // 多选
      selectionChangeHandle (val) {
        this.dataListSelections = val
      },
      // 查询
      getArticle () {
        if(this.articleId === '' || /\D/.test(this.articleId)) {
          this.$message.error('请输入正确的id')
        } else {
          this.$http.ishHaveDetail(this.articleId).then(res=> {
            if(res.code === 200) {
              this.addOrUpdateVisible = true
              this.$nextTick(() => {
                this.$refs.getDetail.init(this.articleId)
              })
            } else {
              this.$message.error(res.message)
            }
          })
        }
      },
      // 解决或者优化
      solveHandle(obj) {
        this.$confirm(`您确定对[id=${obj.id}的文章的举报/、反馈进行核实处理了?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(()=> {
          if(obj.phone) {
            Ajax().request('http://192.168.15.34:8888/postReport', {
              method: 'POST',
              data: {
                id: obj.article_id,
                email: obj.phone,
                time: obj.time
              }
            })
          }
          this.$http.deleteStaticReport([obj.id]).then(res => {
            if (res.code === 200) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.getDataList()
                }
              })
              this.$http.setLog(`处理了id=${obj.id}的前端举报信息`, 'admin/System/deleteStaticReport')
            } else {
              this.$message.error('操作失败')
            }
          })
        }).catch(() => {})
      },
      // 删除
      deleteHandle (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对[id=${ids.join(',')}进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.deleteStaticReport(ids).then(res => {
            if (res.code === 200) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.getDataList()
                }
              })
              this.$http.setLog(`删除了id=${ids}的前端举报信息`, 'admin/System/deleteStaticReport')
            } else {
              this.$message.error('操作失败')
            }
          })
        }).catch(() => {})
      }
    }
  }
</script>

<style lang="less" scoped>
.picture {
  width: 60px;
  height: 60px;
  border-radius: 30px;
}
</style>