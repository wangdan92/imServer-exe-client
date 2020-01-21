<template>
    <div class="chat-panel">
        <div class="chat-box-list">
            <Search class="search-box" @showChat="showChat"></Search>
            <div class="group-box">
                <ul class="user-list">
                    <li class="user" v-for="chatGroup in chatGroupList">
                        <a href="javascript:" @click="showChat(chatGroup)">
                            <img v-if="chatGroup.groupType==2" src="/static/img/G-1.png">
                            <img v-else-if="chatGroup.groupType==1" src="/static/img/G-2.png">
                            <img v-else  src="/static/img/sysMsg.png">
                            <b style="width: 66%; overflow: hidden;text-overflow:ellipsis;white-space: nowrap;">{{ chatGroup.name}}</b>
                            <p v-if="chatGroup.notice"  style="width: 66%; overflow: hidden;text-overflow:ellipsis;white-space: nowrap;">{{"公告:"+chatGroup.notice}}</p>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <div class="chat-box">
            <Top></Top>
            <Welcome></Welcome>
        </div>
    </div>
</template>
<script>
  import Search from '../components/search.vue';
  import Top from '../components/top.vue';
  import UserChat from '../components/chat.vue';
  import Welcome from '../components/welcome.vue';
  import conf from '../conf';
  import { ChatListUtils, MessageTargetType } from '../../../utils/ChatUtils';
  import RequestUtils from '../../../utils/RequestUtils';
  import localStoregeUtil from '../../../utils/StoreUtils';
  export default {
  components: {
    Search,
    Top,
    UserChat,
    Welcome
  },
  data() {
    return {
      isAlert:false,
      //文件上传的路径
      multipartUrl:conf.getMultipartUrl(),
      //websocket链接
      wsUrl:conf.getWsUrl(),
      socket:null,
      //当前群组列表
      chatGroupList:[],
      //当前用户
      currentUser:{},
    };
  },
  mounted(){
     let that=this;
     that.currentUser=localStoregeUtil.getUser();
  },
  activated: function() {
      let that = this;
      that.initData();
    },
  methods: {
    //初始化群组列表
    initData: function() {
      let that=this;
      that.currentUser=localStoregeUtil.getUser();
      let requestApi = RequestUtils.getInstance();
      let userId=that.currentUser.id;
      requestApi.request(conf.getMyChatGroupListUrl(userId)).then(res => {
        console.log("群组列表响应结果",res);
        that.chatGroupList=res.data;
      }).catch(function(error) {
          console.log("群组列表接口触发异常",error);
      });
    },
    // 打开一个聊天对话框
    showChat: function(chatGroup) {
      let that = this;
      let chatGroupId=chatGroup.id;
      let requestApi = RequestUtils.getInstance();
      let param={"chatGroupId":chatGroupId,"userId":that.currentUser.id,"groupType":1};
      console.log("param",param);
      requestApi.request(conf.getChatGroupMessageInfoByIdUrl(),param).then(res => {
        if (res.code==1&&res.data!=null){
          //重置临时会话列表
          that.$router.push({
            path: '/index/chatBox/',
            query: { chat:res.data}
          });
        }else{
          console.log("暂无会话记录");
        }
      }).catch(function(error) {
        console.log("查询会话触发异常",error);
      });
    },
  },
};
</script>
<style lang="scss" scoped>
@import '../../../../../static/styles/theme';

.ivu-tabs-content {
  height: 100%;
}

.chat-panel {
  width: 26rem;
  background-color: $color-light-gray;
  height: 100%;
  display: flex;
  flex-direction: row;

  .chat-box {
    flex: 1;
    background-color: $color-box-bg;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .chat-box-list {
    height: 100%;
    width: 22rem;
    display: flex;
    flex-direction: column;

    .search-box {
      margin: 1.5rem;
      width: 19rem;
    }
  }
}

.group-box {
  height: 100%;
  overflow-y: scroll;

  .count {
    color: #aaaaaa;
  }

  li {
    list-style: none;
    position: relative;
    font-size: 1.2rem;
    cursor: pointer;
    font-weight: 200;
    margin-bottom: 2rem;

    h5 {
      padding: 0.5rem 0;
      cursor: pointer;
      font-size: 1.3rem;
      font-weight: 200;

      i {
        vertical-align: baseline;
      }
    }

    img {
      width: 4.4rem;
      height: 4.4rem;
      position: absolute;
      top: 0.4rem;
      left: 2rem;
    }

    b {
      position: absolute;
      font-size: 1.3rem;
      left: 7.5rem;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 600;
      top: 0.6rem;
    }

    p {
      position: absolute;
      left: 7.5rem;
      bottom: 0.4rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 75%;
      font-size: 1.1rem;
      color: #aaaaaa;
    }
  }

  .user {
    height: 5.2rem;
    position: relative;

    a {
      display: block;
      width: 100%;
      height: 100%;
      color: $color-default;
      position: relative;

      i {
        display: inline-block;
        width: 1.8rem;
        height: 1.6rem;
        background-color: #ff0000;
        border-radius: 50%;
        color: $color-write;
        text-align: center;
        font-style: normal;
        position: absolute;
        left: 1rem;
        top: 0;
        z-index: 99999999999;
      }

      p {
        width: 12rem;
      }
    }
  }
}
</style>
