import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import modules from './modules';
import { Chat, ChatListUtils, MessageInfoType, MessageTargetType, transform } from '../utils/ChatUtils';
Vue.use(Vuex);
export default new Vuex.Store({
  state: {
    token: {},
    // 当前的用户
    user: {},
    websocket: {},
    //内存中的聊天记录
    messageListMap: new Map(),
    //聊天群的映射 id->chat
    chatMap: new Map(),
    messageList: [],
    // 当前聊天窗口
    currentChat: {},
    // 所有的聊天窗口
    chatList: [],
  },
  mutations: {
    //改变当前用户信息
    setUser: function(state, user) {
      state.user = user;
    },
    //webscoket放入全局状态管理
    setWebsocket: function(state, websocket) {
      state.websocket = websocket;
    },
    // 发送给服务器
    sendMessage: function(state, message) {
      console.log("客户端发送到后台的信息",message);
      state.websocket.send(JSON.stringify(message));
    },
    // 退出登录
    closeConnect: function(state) {
      if (state.websocket!={}){
        state.websocket.close();
      }
    },
    // 退出后清除内存中的聊天信息
    clear: function(state) {
      state.chatList= [] ;
      state.messageList = [];
      state.messageListMap = new Map();
      state.currentChat={};
      //state.user={};
      console.log("缓存数据清理成功")
    },
    // 新增信息内容,后端发送信息到前端的渲染
    addMessage: function(state, message) {
      let text=message.msg.content.text;
      //信息内容转换
      message.msg.content.text = transform(text);
      state.messageList.push(message);
    },

    // 在用户姓名下展示收到的最后一条信息
    setLastMessage: function(state, message) {
     // let list = ChatListUtils.getChatList(state.user.id);
      let list =state.chatList;
      let tempChatList = list.map(function(chat) {
        if (String(chat.chatGroupId) === String(message.chatGroupId)) {
          chat.content = message.content.text;
          chat.sendName= message.userinfo.realName;
        }
        return chat;
      });
      // 放入缓存
      //ChatListUtils.setChatList(state.user.id, tempChatList);
      state.chatList = tempChatList;
    },


    /**
     * 设置未读消息条数
     * @param state state
     * @param message 消息
     */
    setUnReadCount: function(state, message) {
      let tempChatList = [];
      let tempChat = {};
      for (let chat of state.chatList) {
        // 给接受消息的聊天室未读数量 +1
        if (String(chat.chatGroupId) === String(message.chatGroupId)) {
          if (!chat['unreadNum']) {
            chat['unreadNum'] = 0;
          }
          chat['unreadNum'] = chat['unreadNum'] + 1;
          tempChat = chat;
        }
        else {
          console.log("当前接收的信息不在会话列表中存在");
        }
      }
      // 添加到聊天室列表的第一个
      tempChatList.unshift(tempChat);
      // 重新设置chatList
      state.chatList = tempChatList;
      // 放入缓存
      ChatListUtils.setChatList(state.user.id, tempChatList);
    },

    //添加历史消息到消息列表
    addHistoryMessageList:function(state, historyMsgList){
       if (historyMsgList==null||historyMsgList.length<1){
          return;
       }else{
           for (let i=0;i<historyMsgList.length;i++){
             let text=historyMsgList[i].msg.content.text;
              historyMsgList[i].msg.content.text=transform(text);
              state.messageList.unshift(historyMsgList[i]);
           }
           console.log("当前消息面板中有"+state.messageList.length+"条记录");
       }
    },
    //设置消息列表
    setMessageList: function(state, messageList) {
      state.messageList = messageList;
    },
     //更新当前会话
    setCurrentChat: function(state, currentChat) {
      state.currentChat = currentChat;
    },
    //设置临时聊天会话列表
    setChatList: function(state, chatList) {
      state.chatList = chatList;
    },
    //删除临时会话列表
    delChat: function(state, chat) {
      state.chatList = ChatListUtils.delChat(state.user.id, chat);
      state.currentChat={};
    },
    //更改临时会话列表
 /*   updateChatList:function(state,chat){
      if (chat.chatGroupId!=null){
        //state.chatList=ChatListUtils.updateChat(state.user.id,chat);
        state.currentChat=chat;
      }
    }*/
  },
  modules: modules,
  plugins: [createPersistedState()],
  strict: process.env.NODE_ENV !== 'production'
});
