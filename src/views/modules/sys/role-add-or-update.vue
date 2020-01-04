<template>
  <el-dialog
    title="新增（添加僵尸号）"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="dataForm.name" placeholder="角色名称"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="postbox">
        <el-input v-model="dataForm.postbox" placeholder="邮箱"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="dataForm.password" placeholder="邮箱"></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-switch
          v-model="dataForm.status === 1"
          active-text="正常"
          inactive-text="禁言"
          @change="changeStatus">
        </el-switch>
      </el-form-item>
      <el-form-item size="mini" label="权限">
        <el-radio v-model="dataForm.authority" label="0">普通用户</el-radio>
        <el-radio v-model="dataForm.authority" label="1">管理员</el-radio>
        <el-radio v-model="dataForm.authority" label="2">超级管理员</el-radio>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { isEmail, isPassword } from '@/utils/validate'
  import { treeDataTranslate } from '@/utils'
  export default {
    data () {
      var validateEmail = (rule, value, callback) => {
        if (!isEmail(value)) {
          callback(new Error('邮箱格式错误'))
        } else {
          callback()
        }
      }
      var validatePassword = (rule, value, callback) => {
        if (!isPassword(value)) {
          callback(new Error('密码格式错误'))
        } else {
          callback()
        }
      }
      return {
        visible: false,
        dataForm: {
          name: '',
          postbox: '',
          password: '',
          status: 1,
          authority: '0'
        },
        dataRule: {
          name: [
            { required: false, message: '角色名称不能为空', trigger: 'blur' }
          ],
          postbox: [
            { required: false, message: '邮箱不能为空', trigger: 'blur' },
            // { validator: validateEmail, trigger: 'blur' }
          ],
          password: [
            { required: false, message: '密码不能为空', trigger: 'blur' },
            // { validator: validatePassword, trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init () {
        this.visible = true
      },
      changeStatus() {
        this.dataForm.status = this.dataForm.status ? 0 : 1
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http.addStaticUser(
              this.dataForm.name,
              this.dataForm.postbox,
              this.dataForm.password,
              this.dataForm.status,
              this.dataForm.authority,
            ).then(res=> {
              if(res.code === 200) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                    this.$emit('refreshDataList')
                  }
                })
                this.$http.setLog(`增加了id=${res.data}的用户`, 'admin/System/addStaticUser')
              } else {
                this.$message.error(res.message)
              }
            })
          }
        })
      }
    }
  }
</script>
