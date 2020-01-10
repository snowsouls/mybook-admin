<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="type">
          <el-radio v-for="(type, index) in typeList" :label="index" :key="index">{{ type }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="typeList[type] + '名称'" prop="name">
        <el-input v-model="dataForm.name" :placeholder="typeList[type] + '名称'"></el-input>
      </el-form-item>
      <el-form-item  v-if="type !== 0" label="上级菜单" prop="parentName">
        <el-popover
          ref="menuListPopover"
          placement="bottom-start"
          trigger="click">
          <el-tree
            :data="menuList"
            :props="menuListTreeProps"
            node-key="id"
            ref="menuListTree"
            @current-change="menuListTreeCurrentChangeHandle"
            :default-expand-all="true"
            :highlight-current="true"
            :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.parentName" v-popover:menuListPopover :readonly="true" placeholder="点击选择上级菜单" class="menu-list__input"></el-input>
      </el-form-item>
      <el-form-item v-if="type === 1" label="菜单路由" prop="url">
        <el-input v-model="dataForm.url" placeholder="菜单路由，如：sys/menu，sys/user"></el-input>
      </el-form-item>
      <el-form-item label="授权标识" prop="perms">
        <el-input v-model="dataForm.perms" placeholder="授权标识, 如: user:list,user:create"></el-input>
      </el-form-item>
      <!-- <el-form-item v-if="dataForm.type !== 2" label="排序号" prop="orderNum">
        <el-input-number v-model="dataForm.orderNum" controls-position="right" :min="0" label="排序号"></el-input-number>
      </el-form-item> -->
      <el-form-item v-if="type !== 2" label="菜单图标" prop="icon">
        <el-row>
          <el-col :span="22">
            <el-popover
              ref="iconListPopover"
              placement="bottom-start"
              trigger="click"
              popper-class="mod-menu__icon-popover">
              <div class="mod-menu__icon-inner">
                <div class="mod-menu__icon-list">
                  <el-button
                    v-for="(item, index) in iconList"
                    :key="index"
                    @click="iconActiveHandle(item)"
                    :class="{ 'is-active': item === dataForm.icon }">
                    <icon-svg :name="item"></icon-svg>
                  </el-button>
                </div>
              </div>
            </el-popover>
            <el-input v-model="dataForm.icon" v-popover:iconListPopover :readonly="true" placeholder="菜单图标名称" class="icon-list__input"></el-input>
          </el-col>
          <el-col :span="2" class="icon-list__tips">
            <el-tooltip placement="top" effect="light">
              <div slot="content">不使用图标会很丑的哦 <a href="https://github.com/snowsouls/mybook" target="_blank">为此项目点赞</a></div>
              <i class="el-icon-warning"></i>
            </el-tooltip>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
    <p v-if="type === 0">注：授权标识填写为前端modules文件下的文件夹名字，如：sys</p>
    <p v-if="type === 1">注：授权标识（菜单路由）为上级目录的标识+：（/）+文件名，如：sys:menu（sys/menu）</p>
    <p v-if="type === 2">注：授权标识为上级目录的标识+：+(add/delete/update/info增删改查)，如：sys:menu:info</p>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { treeDataTranslate } from '@/utils'
  import Icon from '@/icons'
  export default {
    data () {
      var validateUrl = (rule, value, callback) => {
        if (this.dataForm.type === 1 && !/\S/.test(value)) {
          callback(new Error('菜单URL不能为空'))
        } else {
          callback()
        }
      }
      var validateParentName = (rule, value, callback) => {
        if (this.dataForm.type !== 0 && !/\S/.test(value)) {
          callback(new Error('上级菜单不能为空'))
        } else {
          callback()
        }
      }
      return {
        visible: false,
        type: 1,
        typeList: ['目录', '菜单', '按钮'],
        dataForm: {
          id: 0,
          name: '',
          parentId: 0,
          parentName: '',
          url: '',
          perms: '',
          orderNum: 0,
          icon: '',
          iconList: []
        },
        dataRule: {
          name: [
            { required: true, message: '菜单名称不能为空', trigger: 'blur' }
          ],
          parentName: [
            { required: true, validator: validateParentName, trigger: 'blur' }
          ],
          url: [
            { validator: validateUrl, trigger: 'blur' }
          ]
        },
        menuList: [],
        menuListTreeProps: {
          label: 'name',
          children: 'children'
        }
      }
    },
    created () {
      this.iconList = Icon.getNameList()
    },
    methods: {
      init (obj) {
        this.dataForm.id = obj ? obj.id : 0
        this.$http.getMenu().then(res => {
          if(res.code === 200) {
            let data = res.data.filter(item=> item.type < 2)
            this.menuList = treeDataTranslate(data)
            if(obj && obj.id) {  // 修改
              this.type = obj.type
              this.visible = true
              switch (obj.type) {
                case 0:
                  this.dataForm.name = obj.name
                  this.dataForm.icon = obj.icon
                  this.dataForm.perms = obj.perms
                  break;
                case 1:
                  this.dataForm.name = obj.name
                  this.dataForm.icon = obj.icon
                  this.dataForm.parentName = obj.parent_name
                  this.dataForm.parentId = obj.parent_id
                  this.dataForm.url = obj.url
                  this.dataForm.perms = obj.perms
                  break;
                case 2:
                  this.dataForm.name = obj.name
                  this.dataForm.parentName = obj.parent_name
                  this.dataForm.parentId = obj.parent_id
                  this.dataForm.perms = obj.perms
                  break;
                default:
                  this.$message.error('不知名的错误，请刷新重试')
              }
            } else {  // 增加
              this.visible = true
            }
          }
        })
      },
      // 菜单树选中
      menuListTreeCurrentChangeHandle (data, node) {
        this.dataForm.parentId = data.id
        this.dataForm.parentName = data.name
      },
      // 菜单树设置当前选中节点
      menuListTreeSetCurrentNode () {
        this.$refs.menuListTree.setCurrentKey(this.dataForm.parentId)
        this.dataForm.parentName = (this.$refs.menuListTree.getCurrentNode() || {})['name']
      },
      // 图标选中
      iconActiveHandle (iconName) {
        this.dataForm.icon = iconName
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          let handleName = ''
          if (valid) {
            if(this.type === 0) {
              handleName = '目录'
              var obj = {
                name: this.dataForm.name,
                icon: this.dataForm.icon,
                type: 0,
                perms: this.dataForm.perms
              }
            } else if (this.type === 1) {
              handleName = '菜单'
              var obj = {
                name: this.dataForm.name,
                icon: this.dataForm.icon,
                parentName: this.dataForm.parentName,
                parentId: this.dataForm.parentId,
                type: 1,
                url: this.dataForm.url,
                perms: this.dataForm.perms
              }
            } else if (this.type === 2) {
              handleName = '按钮'
              var obj = {
                name: this.dataForm.name,
                parentName: this.dataForm.parentName,
                parentId: this.dataForm.parentId,
                type: 2,
                perms: this.dataForm.perms
              }
            } else {
              this.$message.error('不知名的错误，请刷新重试')
              return
            }
            obj.id = this.dataForm.id
            this.$http.addMenu(obj).then(res => {
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
                if(obj.id) {
                  this.$http.setLog(`修改了id=${obj.id}的${handleName}`, 'admin/System/addMenu')
                } else {
                  this.$http.setLog(`增加了id=${res.data}的${handleName}`, 'admin/System/addMenu')
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

<style lang="less" scoped>
  .mod-menu {
    .menu-list__input,
    .icon-list__input {
       > .el-input__inner {
        cursor: pointer;
      }
    }
    &__icon-popover {
      width: 458px;
      overflow: hidden;
    }
    &__icon-inner {
      width: 478px;
      max-height: 258px;
      overflow-x: hidden;
      overflow-y: auto;
    }
    &__icon-list {
      width: 458px;
      padding: 0;
      margin: -8px 0 0 -8px;
      > .el-button {
        padding: 8px;
        margin: 8px 0 0 8px;
        > span {
          display: inline-block;
          vertical-align: middle;
          width: 18px;
          height: 18px;
          font-size: 18px;
        }
      }
    }
    .icon-list__tips {
      font-size: 18px;
      text-align: center;
      color: #e6a23c;
      cursor: pointer;
    }
  }
</style>
