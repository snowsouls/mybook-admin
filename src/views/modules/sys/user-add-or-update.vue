<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="dataForm.userName" placeholder="登录帐号"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password" :class="{ 'is-required': !dataForm.id }">
        <el-input v-model="dataForm.password" type="password" placeholder="密码"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="comfirmPassword" :class="{ 'is-required': !dataForm.id }">
        <el-input v-model="dataForm.comfirmPassword" type="password" placeholder="确认密码"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="dataForm.email" placeholder="邮箱"></el-input>
      </el-form-item>
      <!-- <el-form-item label="手机号" prop="mobile">
        <el-input v-model="dataForm.mobile" placeholder="手机号"></el-input>
      </el-form-item> -->
      <el-form-item label="权限" size="mini" prop="roleIdList">
        <!-- <el-checkbox-group v-model="dataForm.roleIdList">
          <el-checkbox v-for="role in roleList" :key="role.roleId" :label="role.roleId">{{ role.roleName }}</el-checkbox>
        </el-checkbox-group> -->
        <el-tree
          :data="menuList"
          show-checkbox
          node-key="id"
          ref="tree"
          :default-checked-keys="roleList"
          :props="defaultProps">
        </el-tree>
      </el-form-item>
      <el-form-item label="状态" size="mini" prop="status">
        <el-radio-group v-model="dataForm.status">
          <el-radio :label="0">禁用</el-radio>
          <el-radio :label="1">正常</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { isEmail, isMobile, isMenu } from '@/utils/validate'
  import { treeDataTranslate, roleListTranslate } from '@/utils'
  export default {
    data () {
      var validatePassword = (rule, value, callback) => {
        if (!this.dataForm.id && !/\S/.test(value)) {
          callback(new Error('密码不能为空'))
        } else {
          callback()
        }
      }
      var validateComfirmPassword = (rule, value, callback) => {
        if (!this.dataForm.id && !/\S/.test(value)) {
          callback(new Error('确认密码不能为空'))
        } else if (this.dataForm.password !== value) {
          callback(new Error('确认密码与密码输入不一致'))
        } else {
          callback()
        }
      }
      var validateEmail = (rule, value, callback) => {
        if (!isEmail(value)) {
          callback(new Error('邮箱格式错误'))
        } else {
          callback()
        }
      }
      var validateMobile = (rule, value, callback) => {
        if (!isMobile(value)) {
          callback(new Error('手机号格式错误'))
        } else {
          callback()
        }
      }
      return {
        visible: false,
        menuList: [],
        roleList: [],
        dataForm: {
          id: 0,
          userName: '',
          password: '',
          comfirmPassword: '',
          email: '',
          roleIdList: '',
          status: 1
        },
        dataRule: {
          userName: [
            { required: true, message: '用户名不能为空', trigger: 'blur' }
          ],
          password: [
            { validator: validatePassword, trigger: 'blur' }
          ],
          comfirmPassword: [
            { validator: validateComfirmPassword, trigger: 'blur' }
          ],
          email: [
            { required: false, message: '邮箱不能为空', trigger: 'blur' },
            { validator: validateEmail, trigger: 'blur' }
          ],
          // mobile: [
          //   { required: true, message: '手机号不能为空', trigger: 'blur' },
          //   { validator: validateMobile, trigger: 'blur' }
          // ]
        },
        defaultProps: {
          children: 'children',
          label: 'name'
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        if(this.dataForm.id) {  // 修改
          let getMenu = this.$http.getMenu()
          let getPermission = this.$http.getPermission(this.dataForm.id)
          let getSystemUser = this.$http.getSystemUser(this.dataForm.id)

          Promise.all([getMenu, getPermission, getSystemUser]).then(res=>{
            this.visible = true
            this.menuList = treeDataTranslate(res[0].data)
            let authority = res[1].data.authority.split(',')
            this.roleList = roleListTranslate(res[0].data, authority)
            this.dataForm.userName = res[2].data.name
            this.dataForm.email = res[2].data.postbox
            this.dataForm.status = Number(res[2].data.status)
          })
        } else {  // 增加
          this.$http.getMenu().then(res=> {
            if(res.code === 200) {
              this.visible = true
              this.menuList = treeDataTranslate(res.data)
              this.$nextTick(() => {
                this.$refs['dataForm'].resetFields()
              })
            }
          })
        }
      },
      // 表单提交
      dataFormSubmit () {
        let authority = ''
        this.$refs.tree.getCheckedNodes().forEach(item=> {
          if(item.type === 2) {
            if(authority) {
              authority += `,${item.perms}`
            } else {
              authority = item.perms
            }
          }
        })
        this.dataForm.roleIdList = authority
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            let addOrUpdate = this.dataForm.id ? this.$http.updateUser : this.$http.addUser
            addOrUpdate(
              authority,
              this.dataForm.userName,
              this.dataForm.comfirmPassword,
              this.dataForm.email,
              this.dataForm.status,
              this.dataForm.id
              ).then(res => {
              if (res.code === 200) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                    this.$refs['dataForm'].resetFields()
                    this.$emit('refreshDataList')
                  }
                })
                if(this.dataForm.id) {
                  this.$http.setLog(`修改了id=${this.dataForm.id}的管理员`, 'admin/System/updateUser')
                } else {
                  this.$http.setLog(`增加了id=${this.dataForm.id}的管理员`, 'admin/System/addUser')
                }
              } else {
                this.$message.error(res.msg)
              }
            })
          }
        })
      }
    }
  }
</script>
