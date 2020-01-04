<template>
  <div class="mod-role">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.roleName" placeholder="角色名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('sys:role:add')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('sys:role:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
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
        prop="name"
        header-align="center"
        align="center"
        width="180"
        label="角色名称">
      </el-table-column>
      <el-table-column
        header-align="center"
        align="center"
        width="120"
        label="图像">
        <template slot-scope="scope">
          <img :src="scope.row.picture" :alt="scope.row.picture" class="picture">
        </template>
      </el-table-column>
      <el-table-column
        prop="postbox"
        header-align="center"
        align="center"
        width="180"
        label="邮箱">
      </el-table-column>
      <el-table-column
        prop="time"
        header-align="center"
        align="center"
        width="180"
        label="创建时间">
      </el-table-column>
      <el-table-column
        header-align="center"
        align="center"
        width="250"
        label="状态">
        <template slot-scope="scope">
          <el-switch
            :disabled="!isAuth('sys:role:update')"
            v-model="scope.row.status === 1"
            active-text="正常"
            inactive-text="禁言"
            @change="changeStatus(scope.$index, scope.row.status, scope.row.id)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        align="center"
        width="400"
        label="权限">
        <template slot-scope="scope">
          <el-radio-group :disabled="!isAuth('sys:role:update')" v-model="scope.row.authority" @change="changeAuthority(scope.$index, scope.row.id)">
            <el-radio  label="0">普通用户</el-radio>
            <el-radio label="1">管理员</el-radio>
            <el-radio label="2">超级管理员</el-radio>
          </el-radio-group>
          
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        label="操作">
        <template slot-scope="scope">
          <!-- <el-button v-if="isAuth('sys:role:update')" type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">修改</el-button> -->
          <el-button v-if="isAuth('sys:role:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
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
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
  import AddOrUpdate from './role-add-or-update'
  export default {
    data () {
      return {
        dataForm: {
          roleName: ''
        },
        authority: '0',
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
      refreshDataList() {
        this.getDataList()
      },
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http.getRole(this.pageIndex, this.pageSize).then(res => {
          if (res.code === 200) {
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
      // 修改状态
      changeStatus(index, status, id) {
        this.dataList[index].status = status ? 0 : 1
        this.$http.updateRoleStatus({
          id,
          status: this.dataList[index].status
        }).then(res=> {
          if(res.code === 200) {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1500
            })
            this.$http.setLog(`修改了id=${id}用户的状态`, 'admin/System/updateRoleStatus')
          }
        })
      },
      // 修改权限
      changeAuthority(index, id) {
        this.$http.updateRoleStatus({
          id,
          authority: this.dataList[index].authority
        }).then(res=> {
          if(res.code === 200) {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1500
            })
            this.$http.setLog(`修改了id=${id}用户的权限`, 'admin/System/updateRoleStatus')
          }
        })
      },
      // 新增 / 修改
      addOrUpdateHandle () {
        this.addOrUpdateVisible = true
        this.$nextTick(() => {
          this.$refs.addOrUpdate.init()
        })
      },
      // 删除
      deleteHandle (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.deleteStaticUser(ids).then(res => {
            if (res.code === 200) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.getDataList()
                }
              })
              this.$http.setLog(`删除了id=${ids}的用户`, 'admin/System/deleteStaticUser')
            } else {
              this.$message.error(data.msg)
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