<template>
  <el-dialog
    title="修改（据为己有，无耻！！！）"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="邮箱" prop="postbox">
        <template>
          <el-popover
            v-model="listPopover"
            ref="iconListPopover"
            placement="bottom-start"
            trigger="click"
            popper-class="mod-menu__icon-popover">
            <div class="mod-menu__icon-inner">
              <div class="mod-menu__icon-list">
                <el-input class="el-input-search" v-model="value" placeholder="输入邮箱搜索" @input="changePostbox"/>
                <ul class="el-input__ul">
                  <li class="el-input__li" v-for="(item, index) in postboxList" @click="postboxActiveHandle(item)" :class="{ 'is-active': item.postbox === dataForm.postbox }">{{item.postbox}}</li>
                </ul>
                <div class="el-search-result" v-if="postboxList.length === 0">暂无数据</div>
              </div>
            </div>
          </el-popover>
          <el-input v-model="dataForm.postbox" v-popover:iconListPopover placeholder="邮箱" :readonly="true"></el-input>
        </template>
      </el-form-item>
      <el-form-item label="文章" prop="article">
        <el-input v-model.trim="dataForm.article" type="textarea"  :autosize="{ minRows: 2, maxRows: 4}" placeholder="文章"></el-input>
      </el-form-item>
      <div class="el-input-author">
        <el-form-item label="作者" prop="author">
          <el-input v-model.trim="dataForm.author" placeholder="作者"></el-input>
        </el-form-item>
        <el-form-item label="出处" prop="provenance">
          <el-input v-model.trim="dataForm.provenance" placeholder="出处"></el-input>
        </el-form-item>
      </div>
      <div style="display: flex;">
        <el-form-item label="时间" prop="time">
          <el-date-picker
            v-model="dataForm.time"
            type="datetime"
            :editable= "false"
            :clearable= "false"
            :picker-options="pickerOptions"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择日期时间"
            @change="changeTime">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="推荐">
          <el-input v-model="dataForm.hot" :readonly="true"></el-input>
        </el-form-item>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  let postboxListStore = []
  import { debounce, formatDate } from '@/utils'
  export default {
    watch: {
      visible(newV) {
        if(!newV) this.value = ''
      }
    },
    data () {
      return {
        visible: false,
        listPopover: false,
        dataForm: {
          id: 0,
          userId: 0,
          postbox: '',
          article: '',
          author: '',
          provenance: '',
          time: '',
          hot: 0
        },
        value: '',
        postboxList: [],
        dataRule: {
          postbox: [
            { required: true, message: '邮箱不能为空', trigger: 'blur' }
          ],
          article: [
            { required: true, message: '文章不能为空', trigger: 'blur' }
          ]
        },
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now()
          }
        }
      }
    },
    methods: {
      init (id) {
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          this.$http.getOneDelete(id).then(res => {
            if (res.code === 200) {
              this.dataForm.postbox = res.user.postbox
              this.dataForm.userId = res.data.user_id
              this.dataForm.id = res.data.id
              this.dataForm.article = res.data.article
              this.dataForm.author = res.data.author
              this.dataForm.provenance = res.data.provenance
              this.dataForm.time = res.data.time
              this.dataForm.hot = res.data.hot
              postboxListStore = this.postboxList = res.postbox
            }
          })
        })
      },
      changePostbox: debounce(function(value) {
        this.postboxList = postboxListStore.filter(item=> item.postbox.indexOf(value) !== -1)
      }, 300),
      changeTime(date) {
        if(new Date(date).getTime() > Date.now()) {
          this.dataForm.time = formatDate(new Date())
        }
      },
      postboxActiveHandle(item) {
        this.listPopover = false
        this.dataForm.userId = item.id
        this.dataForm.postbox = item.postbox
      },
      // 表单提交
      dataFormSubmit () {
        if(this.dataForm.provenance) {
          if(!new RegExp("^《.*$").test(this.dataForm.provenance)) {
            this.dataForm.provenance = '《' + this.dataForm.provenance
          }
          if(!new RegExp("^.*》$").test(this.dataForm.provenance)) {
            this.dataForm.provenance = this.dataForm.provenance + '》'
          }
        }
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http.updateStaticDelete(this.dataForm).then(res => {
              if (res.code === 200) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                    this.$emit('refreshDataList')
                  }
                })
                this.$http.setLog(`修改并发布了id=${this.dataForm.id}的前端软删除文章`, 'admin/System/updateStaticDelete')
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .mod-menu {
    &__icon-inner {
      width: 540px;
      max-height: 400px;
      overflow-x: hidden;
      overflow-y: auto;
    }
    &__icon-list {
      padding: 0;
    }
  }
  .el-input__ul {
    display: flex;
    flex-wrap: wrap;
    .el-input__li {
      width: 45%;
      list-style: none;
      height: 28px;
      line-height: 28px;
      cursor: pointer;
      &.is-active {
        color: #17B3A3;
      }
    }
  }
  .el-search-result {
    width: 100%;
    text-align: center;
    color: #999;
    font-size: 14px;
  }
  .el-input-author {
    display: flex;
    & /deep/ .el-form-item {
      flex: auto;
    }
  }
  .el-input-search /deep/ .el-input__inner {
    border-left: none;
    border-right: none;
    border-top: none;
    border-radius: 0;
  }
</style>