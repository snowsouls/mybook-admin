<template>
  <el-dialog
    title="核实文章（点击文章或评论删除，简单粗暴）"
    top="10vh"
    :close-on-click-modal="false"
    :lock-scroll="true"
    :visible.sync="visible">
    <div :class="comments.length !== 0 && 'mian'" v-if="info.user">
      <div class="title">
        <div class="left">
          <img :src="info.user.picture" alt="图像" />
          <div>
            <div class="name">{{ info.user.name }}</div>
            <div class="time">{{ info.time | transformDate }}</div>
          </div>
        </div>
      </div>
      <div class="address">
        <div class="article" v-html="info.article" @click="deleteArticle(1)"></div>
        <div class="author">
          <span v-if="info.author || info.provenance">——</span>
          <span>{{info.author}}</span>
          <span>{{info.provenance}}</span>
        </div>
      </div>
    </div>

    <div class="comment-box" v-loading="dataListLoading">
      <li class="comment" v-for="(item,index) in comments" :key="item.id">
        <img :src="item.picture" class="picture" alt="图像" />
        <div class="right">
          <div class="name-box">
            <div class="name">{{item.name}}<span class="time">{{item.time | transformDate}}</span></div>
          </div>
          <div class="content" @click="deleteArticle(2, item.id, index)">{{item.content}}</div>
          <div class="reply-box" v-if="item.replys && item.replys.length > 0">
            <div class="content" v-for="(reply, replyIndex) in item.replys" :key="replyIndex" @click="deleteArticle(3, reply.id, index, replyIndex)">
              <span class="text name">{{reply.comment_name}}</span>
              <span class="text old" v-if="reply.reply_name">回复</span>
              <span class="text name" v-if="reply.reply_name">{{reply.reply_name}}</span>
              <span class="text msg">：{{reply.content}}</span>
            </div>
          </div>
        </div>
      </li>
    </div>

    <div class="block">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :hide-on-single-page="totals > 5"
        :current-page="page"
        :page-sizes="[5, 10, 20]"
        :page-size="count"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totals">
      </el-pagination>
    </div>
    
    <!-- <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span> -->
  </el-dialog>
</template>

<script>
  import { debounce, formatDate } from '@/utils'
  export default {
    filters: {
      transformDate(time) {
        let timeMinus = parseInt(Date.now()/1000) - parseInt(new Date(time).getTime()/1000)
        if(timeMinus < 60) {
          return '刚刚'
        } else if (timeMinus < 120) {
          return '一分钟前'
        } else if (timeMinus < 600) {
          return '十分钟前'
        } else if (timeMinus < 3600) {
          return '1小时前'
        } else if (timeMinus < 86400) {
          var num = Math.floor(timeMinus/3600)
          return `${num}小时前`
        } else if (timeMinus < 2592000) {
          var num = Math.floor(timeMinus/86400)
          return `${num}天前`
        } else {
          let data = time.split(" ")[0].split("-")
          if(new Date().getYear() === data[0]) {
            return `${data[1]}-${data[2]}`    // 不带年份
          } else {
            return time.split(" ")[0]   // 带年份
          }
        }
      }
    },
    data () {
      return {
        id: 0,
        visible: false,
        listPopover: false,
        page: 1,
        count: 5,
        info: {},
        comments: [],
        totals: 0,
        dataListLoading: false
      }
    },
    methods: {
      getDetail(flag) {
        this.dataListLoading = true
        this.$http.getDetail(this.id, this.page, this.count).then(res => {
          if (res.code === 200) {
            if(flag) {
              this.info = res.data
            }
            this.comments = res.comment.data
            this.totals = res.counts
          }
          this.dataListLoading = false
        })
      },
      init (id) {
        this.id = id
        this.visible = true
        this.$nextTick(() => {
          this.getDetail(true)
        })
      },
      handleSizeChange(val) {
        this.page = 1
        this.count = val
        this.getDetail()
      },
      handleCurrentChange(val) {
        this.page = val
        this.getDetail()
      },
      deleteArticle(type, id, index, key) {
        let msg = type === 3 ? '回复' : (type === 2 ? '评论' : '文章')
        this.$confirm(`确定对此${msg}]进行[删除]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let obj = {}
          if(type === 3) obj['replyId'] = id
          if(type === 2) obj['commentId'] = id
          if(type === 1) obj['articleId'] = this.id
          this.$http.deleteArticleOrcommen(obj).then(res => {
            if (res.code === 200) {
              console.log('删除成功')
              if(type === 2) {
                this.comments.splice(index, 1)
              }
              if(type === 3) {
                this.comments[index]['replys'].splice(key, 1)
              }
              // this.$http.setLog(`删除了id=${id}的${handleName}`, 'admin/System/deleteMenu')
            }
          })
        }).catch(() => {})
      }
    }
  }
</script>

<style lang="less" scoped>
.mian {
  border-bottom: 1px solid #999;
}
.title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  .left {
    height: 40px;
    display: flex;
    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 10px;
    }
    .name {
      height: 24px;
      line-height: 24px;
      font-size: 16px;
      color: #333;
    }
    .time {
      height: 16px;
      line-height: 16px;
      font-size: 14px;
      color: #999;
    }
  }
}
.address {
  padding-bottom: 10px;
  .article {
    white-space: pre-line;
    cursor:pointer;
  }
  .author {
    text-align: right;
    padding-right: 30px;
    font-size: 14px;
  }
}
.comment-box {
  padding: 20px 20px 0;
  .comment {
    padding-bottom: 20px;
    display: flex;
    .picture {
      flex: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin-right: 10px;
    }
    .right {
      flex: auto;
      font-size: 0;
      .name-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .name {
          font-size: 14px;
          color: #07c0fc;
          .time {
            margin-left: 10px;
            font-size: 12px;
            color: #999;
          }
        }
      }
      .content {
        font-size: 16px;
        padding: 4px 0;
        word-break:break-all;
        cursor: pointer;
      }
      .handle-box {
        .time {
          color: #999;
          font-size: 12px;
        }
        .reply {
          color: #333;
          font-size: 12px;
        }
      }
      .reply-box {
        font-size: 0;
        margin-top: 8px;
        padding: 4px;
        background-color: #fafafa;
        border-radius: 4px;
        .content {
          cursor: pointer;
          &:hover {
            background-color: #ccc;
          }
        }
        .text {
          font-size: 12px;
          &.name {
            word-break: break-all;
            color: #07c0fc;
          }
          &.old {
            margin: 0 4px;
          }
          &.msg {
            word-break: break-all;
          }
        }
      }
    }
  }
  .noComment {
    display: flex;
    flex-direction: column;
    align-items: center;
    .img {
      width: 72px;
      height: 60px;
      margin-top: 10px;
    }
    .text {
      margin-top: 10px;
      color: #999;
    }
    .btn {
      margin-top: 10px;
      width: 90px;
      height: 30px;
      line-height: 30px;
      border-color: #d9d9d9;
      border-radius: 4px;
    }
  }
}
</style>