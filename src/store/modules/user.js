const state = {
    user: {}
}

const mutations = {
  updateUser (state, user) {
    state.user = user
  }
}


// 获取本地保存数据
if(!state.user.name) {
    if (sessionStorage.getItem("mybook_admin_user")) {
        state.user = JSON.parse(sessionStorage.getItem("mybook_admin_user"))
    }
}


export default {
  namespaced: true,
  state,
  mutations
}
