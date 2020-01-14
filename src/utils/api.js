import axios from './httpRequest.js'
import config from '@/config/index'
import store from '@/store/index'

/**
 * 读取文章
 * userId     {string}     用户id
 */
const login = (username, password, uuid) => new Promise((resolve, reject) => {
    axios.get(config.serverUrl + '/admin/index/login',{
        username,
        password,
        uuid
    }).then(res => {
        resolve(res)
    }).catch(err=>{
        reject(err)
    })
})

/**
 * 获取权限
 * userId     {string}     用户id
 */
const getPermissions = (userId) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/index/getPermissions', {
        userId
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 * 设置log
 * desc        日志描述
 * method        日志方法
 * user        日志 管理员名称
 * postbox        日志 管理员邮箱
 * objTemp        管理员名称和管理员邮箱的对象
 */
const setLog = (desc, method, login=true, objTemp={}) => new Promise((resolve, reject) => {
    if(login) {
        var obj = {
            desc,
            method,
            user: store.state.user.user.name,
            postbox: store.state.user.user.postbox,
        }
    } else {
        var obj = {
            desc,
            method,
            ...objTemp
        }
    }
    axios.post(config.serverUrl + '/admin/index/setLog', obj).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 * 获取log
 */
const getAdminList = (count, page) => new Promise((resolve, reject) => {
    axios.get(config.serverUrl + '/admin/index/getAdminList', {
        count,
        page
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

// 系统设置（system）

/**
 * 获取管理员
 * id     {number}     管理员id
 */
const getSystemUser = (id) => new Promise((resolve, reject) => {
    axios.get(config.serverUrl + '/admin/System/getUser', {
        id
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 * 获取管理员
 * id     {number}     菜单id
 */
const getMenuDetail = (id) => new Promise((resolve, reject) => {
    axios.get(config.serverUrl + '/admin/System/getMenuDetail', {
        id
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 * 获取菜单
 */
const getMenu = () => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/getMenu').then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 * 增加管理员
 * authority     {string}     用户权限
 * name     {string}     用户名
 * password     {string}     密码
 * postbox     {string}     邮箱
 * status     {number}     0/1  禁用/正常
 */
const addUser = (authority, name, password, postbox, status=1) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/addUser', {
        authority,
        name,
        password,
        postbox,
        status
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 * 删除管理员
 * id     {array}     用户id（删除一个或者一批）
 */
const deleteUser = (id) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/deleteUser', {
        id
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 * 修改管理员
 * authority     {string}     用户权限
 * name     {string}     用户名
 * password     {string}     密码
 * postbox     {string}     邮箱
 * status     {number}     0/1  禁用/正常
 * id     {number}     更新的id
 */
const updateUser = (authority, name, password, postbox, status, id) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/updateUser', {
        authority,
        name,
        password,
        postbox,
        status,
        id
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 * 增加或修改菜单
 * name         {string} [require]     菜单名称
 * type         {number} [require]     菜单类型（0：目录，1：菜单，2：按钮）
 * icon         {string}                菜单图标
 * parentName     {string}              父菜单名称
 * url           {string}                菜单路由
 * perms           {string} [require]    菜单对应的授权标识
 * parentId     {number}                对应的父菜单id
 * id          {number}                本条id（判断是新增还是修改的唯一标识）
 */
const addMenu = (obj) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/addMenu', obj).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 * 删除菜单
 * id     {number}     用户id
 */
const deleteMenu = (id) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/deleteMenu', {
        id
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 * 获取角色
 * count     {number}     每页数量
 * page     {number}     第几页
 */
const getRole = (page, count=10) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/getRole', {
        page,
        count
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 * 获取角色权限
 * userId     {number}     角色id
 */
const getPermission = (userId) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/getPermission', {
        userId
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 * 修改（前端）状态或权限
 * userId     {number}     用户id
 * status     {number/string}     用户状态（0/1）或者权限（'0'/'1'/'2'）
 */
const updateRoleStatus = (obj) => new Promise((resolve, reject) => {
    axios.get(config.serverUrl + '/admin/System/updateRoleStatus', obj).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 * 添加用户
 * name     {string}     用户名称
 * postbox     {string}     用户邮箱
 * password     {string}     用户密码
 * status     {number}      用户状态  0：禁言 1：正常
 * authority     {string}     角色权限 0 1 2 （普通、管理员、超级管理员）
 */
const addStaticUser = (name, postbox, password, status, authority) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/addStaticUser', {
        name,
        postbox,
        password,
        status,
        authority
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 * （批量）删除用户
 * id     {array}     用户id（删除一个或者一批）
 */
const deleteStaticUser = (id) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/deleteStaticUser', {
        id
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 *  获取日志
 * count     {number}     每页数量
 * page     {number}     第几页
 */
const getLog = (page, count=10) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/getLog', {
        page,
        count
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 *  获取前端删除的文章
 * count     {number}     每页数量
 * page     {number}     第几页
 */
const getStaticDelete = (page, count=10) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/getStaticDelete', {
        page,
        count
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 *  删除前端软删除的文章
 * id     {array}     文章id
 */
const deleteStaticDelete = (id) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/deleteStaticDelete', {
        id
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 *  获取某一个软删除的文章（修改它、占有它）
 * id     {number}     文章id
 */
const getOneDelete = (id) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/getOneDelete', {
        id
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 *  更新某一个软删除的文章（修改它、占有它，无耻）
 * id     {number}     文章id
 * userId     {number}     用户id
 * article     {string}     文章
 * time     {datetime}     重定义文章发表时间
 * author     {string}     文章作者
 * provenance     {string}     文章出处
 */
const updateStaticDelete = (obj) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/updateStaticDelete', obj).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 *  获取前端的举报反馈
 * count     {number}     每页数量
 * page     {number}     第几页
 */
const getReport = (page, count=10) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/getReport', {
        page,
        count
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 *  获取传递的id是否有前端文章（举报）
 * articleId     {number}     文章id
 */
const ishHaveDetail = (articleId) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/ishHaveDetail', {
        articleId
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 *  获取前端的举报反馈的文章详情
 * articleId     {number}     文章id
 * count     {number}     每页数量
 * page     {number}     第几页
 */
const getDetail = (articleId, page, count=10) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/getDetail', {
        articleId,
        page,
        count
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 *  删除前端举报反馈的文章或评论
 * articleId     {number}     文章id
 * commentId     {number}     评论id
 * replyId     {number}       回复id
 */
const deleteArticleOrcommen = (obj) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/deleteArticleOrcommen', obj).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 *  删除前端举报的信息
 * id     {array}     文章id
 */
const deleteStaticReport = (id) => new Promise((resolve, reject) => {
    axios.post(config.serverUrl + '/admin/System/deleteStaticReport', {
        id
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

/**
 *  举报、反馈后的邮件发送
 * id     {array}     文章id
 */
const emailReport = (email, time) => new Promise((resolve, reject) => {
    axios.post('http://192.168.15.34:8888/postReport', {
        email,
        time
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
})

export default {
    login,
    getPermissions,
    setLog,
    getAdminList,
    getSystemUser,
    getMenuDetail,
    getMenu,
    addUser,
    deleteUser,
    updateUser,
    addMenu,
    deleteMenu,
    getRole,
    getPermission,
    updateRoleStatus,
    addStaticUser,
    deleteStaticUser,
    getLog,
    getStaticDelete,
    deleteStaticDelete,
    getOneDelete,
    updateStaticDelete,
    getReport,
    ishHaveDetail,
    getDetail,
    deleteArticleOrcommen,
    deleteStaticReport,
    emailReport
}