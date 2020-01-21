<template>
    <div class="chat-panel">
       <!--聊天列表/通讯录/im讨论群-->
        <div class="chat-box-list">
            <Search class="search-box" @showChat="showSearchChat"></Search>
            <Alert v-if="isAlert" type="warning" show-icon>您的浏览器不支持webscoket通讯链接</Alert>
            <div class="group-box">
                <ul class="user-list">
                    <li class="user" v-for="chat in chatList">
                        <a href="javascript:" @click="showChat(chat)"
                           :class="currentChat.chatGroupId===chat.chatGroupId?'active':''">
                            <i v-if="chat.unreadNum>0">{{ chat.unreadNum }}</i>
                            <img :src="chat.url==null||chat.url.length<1 ? defaultPhoto:chat.url" alt="头像">
                            <b style="width:66%; overflow: hidden;text-overflow:ellipsis;white-space: nowrap;">{{ chat.chatGroupName }}</b>
                            <p style="width:66%; overflow: hidden;text-overflow:ellipsis;white-space: nowrap;">{{ chat.sendName+":"+chat.content }}</p>
                        </a>
                        <Icon type="md-close" @click="delChat(chat)"></Icon>
                    </li>
                </ul>
            </div>
        </div>
       <!--聊天窗口部分-->
        <div class="chat-box">
            <Top></Top>
           <!-- <UserChat :chat="currentChat" @showChat="showChat"></UserChat>-->
            <chat :chat="currentChat"></chat>
        </div>
    </div>
</template>
<script>
  import Search from '../components/search.vue';
  import Top from '../components/top.vue';
  import chat from '../components/chat.vue';
  import { ChatListUtils, imageLoad } from '../../../utils/ChatUtils';
  import RequestUtils from '../../../utils/RequestUtils';
  import localStoregeUtil from '../../../utils/StoreUtils';
  import conf from '../conf';
  export default {
    components: {
      Search,
      Top,
      chat
    },
    data() {
      return {
        defaultPhoto: '/static/img/defaultPhoto.png',
        isAlert:false,
        //文件上传的路径
        multipartUrl:conf.getMultipartUrl(),
        //websocket链接
        wsUrl:conf.getWsUrl(),
        socket:null,
        //当前用户
       // currentUser:{},
      };
    },
    computed: {
          //当前会话
          currentChat: {
            get: function() {
              console.log("computed>>>currentChat");
              return this.$store.state.currentChat;
            },
            set: function(currentChat) {
              this.$store.commit('setCurrentChat', JSON.parse(JSON.stringify(currentChat)));
            }
          },
          //会话列表
          chatList: {
            get: function() {
              console.log("computed chatList",this.$store.state.chatList.length);
              return this.$store.state.chatList;
            },
            set: function(chatList) {
              this.$store.commit('setChatList', chatList);
            }
          },
         //当前用户
          currentUser:{
            get: function() {
              return this.$store.state.user;
            },
            set: function(currentUser) {
              this.$store.commit('setUser', currentUser);
            }
          }
        },
    methods: {
      //监听列表的websocket链接初始化
      connectSocketInit:function() {
        let that=this;
        let chatGroupId=0;
        let currentUserId=that.currentUser.id;
        let websocketUrl=that.wsUrl+"/"+currentUserId+"/"+chatGroupId;
        if(typeof(WebSocket) === "undefined"){
          that.isAlert=true;
          setTimeout(function() {
            that.isAlert=false;
          },3000)
        }else{
          // 实例化socket
          that.socket = new WebSocket(websocketUrl);
          // 监听socket连接
          that.socket.onopen = that.open;
          // 监听socket错误信息
          that.socket.onerror = that.error;
          // 监听socket消息
          that.socket.onmessage = that.getMessage;
          //监听websocket关闭
          that.socket.onclose=that.onClose;
        }
      },
      //列表界面的websocket链接实例对象监听
      open: function () {
        let that=this;
        console.log("列表界面socket连接成功");
        that.isConn=true;
      },
      //列表界面的websocket触发异常
      error: function () {
        console.log("列表界面websocket连接错误");
      },
      //监听websocket链接服务端的消息
      getMessage: function (msg) {
        let that=this;
        console.log("列表界面收到后台websocket信息,列表需要更新",msg);
        let currentUserId=that.currentUser.id;
        ChatListUtils.initChatList(that,currentUserId);
      },
      //列表发送消息到服务端
      send: function () {
        this.socket.send(params)
      },
      //关闭列表websocket链接
      onClose: function () {
        let that=this;
        that.isConn=false;
        console.log("列表界面socket已经关闭")
      },
      // 关闭列表websocket【离开这个页面的时候执行关闭】
      closeSocket() {
        let that=this;
        if (that.socket!=null&&that.isConn==true){
          console.log("主动关闭列表界面的websocket界面");
          that.socket.close();
        } ;
      },

      resetChat(chat){
        let that=this;
        let currentUserId=that.currentUser.id;
        that.$store.commit('setCurrentChat',chat);
        if (chat.chatGroupId!=null&&chat.chatGroupId!=undefined){
          let requestApi = RequestUtils.getInstance();
          let params={"chatGroupId":chat.chatGroupId,"userId":currentUserId};
          requestApi.request(conf.resetMarkReadUrl(), params).then(res => {
            if (res.code===1) {
              ChatListUtils.initChatList(that,currentUserId);
             /* let tempChatList = [];
              let chatList=ChatListUtils.getChatList(currentUserId);
              for (let item of chatList) {
                if (String(item.chatGroupId) == String(chat.chatGroupId)) {
                  item.unreadNum=0;
                }
                tempChatList.push(item);
              }
              if (tempChatList.length>0){
                ChatListUtils.setChatList(currentUserId, tempChatList);
                that.$store.commit("setChatList",tempChatList);
              }*/
            }
          }).catch(function(error) {
            console.log("重置当前群的未读数量触发异常",error);
          });
        }
      },

      //打开当前聊天会话窗口
      showChat: function(chat) {
        let self = this;
        self.resetChat(chat);
        let  preConn= self.$store.state.websocket;
        if (preConn.ws!=null){
          preConn.close();
        } ;
        RequestUtils.getInstance().webSocketOperation(self);
        // 每次滚动到最底部
        self.$nextTick(() => {
          imageLoad('message-box');
        });
      },
      //
      showSearchChat: function(chat) {
        let self = this;
        self.resetChat(chat);
      },
      //删除会话
      delChat(chat) {
        let that=this;
        let delChatGroupId=chat.chatGroupId;
        that.$store.commit('delChat', chat);
        let  preConn= that.$store.state.websocket;
        let preGroupId= preConn.opts.pingMsg.chatGroupId;
        if (delChatGroupId==preGroupId){
          console.log("关闭当前删除的聊天群组的websocket链接");
          preConn.close();
        } ;
      }
    },
    created:function(){
      let that = this;
      //that.currentUser=localStoregeUtil.getUser();
    },
    //vue-router使用keep-alive时奏效
    activated() {
      let that = this;
      let newChat=that.$route.query.chat;
      console.log("chatBox.vue:>>>activated函数");
      // 当前聊天室
      if (newChat) {
        console.log("新增会话",newChat);
        let currentChat=JSON.parse(JSON.stringify(newChat));
        //更新当前会话
        that.resetChat(currentChat);
        //建立新的websocket链接
        let  preConn= that.$store.state.websocket;
        if (preConn.ws!=null){
          preConn.close();
        } ;
        RequestUtils.getInstance().webSocketOperation(that);
      };
      // 每次滚动到最底部
      that.$nextTick(() => {
        imageLoad('message-box');
      });
    },
    mounted() {
      let  that=this;
      //如果缓存中存在临时会话记录,那么将第一个会话设置为当前会话窗口
      if (that.chatList !=null &&that.chatList.length>0){
        that.resetChat(that.chatList[0]);
        //初始化websocket链接
         if (that.currentChat.chatGroupId!=null&&that.currentChat.chatGroupId!=undefined){
           RequestUtils.getInstance().webSocketOperation(that);
         } ;
      };
     //建立聊天列表的websocket链接监听
      that.connectSocketInit();
    },
    destroyed(){
      // 销毁监听
      let that=this;
      that.closeSocket();
    }
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

            &:hover {
                background-color: $color-gray !important;

                & > i {
                    color: $color-default;
                    background-color: $color-write;
                }
            }

            .active {
                background-color: $color-gray !important;
            }

            & > i {
                position: absolute;
                right: 1rem;
                bottom: 1.6rem;
                cursor: pointer;
                border-radius: 50%;
                padding: 0.2rem;
                text-align: center;
                color: $color-light-gray;

                &:hover {
                    color: $color-default;
                    background-color: $color-write;
                }
            }
        }
    }
</style>
