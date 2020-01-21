import {imageLoad, MessageInfoType,ChatListUtils} from './ChatUtils';
import conf from '../views/im/conf/index.js';
import StoreUtils from './StoreUtils';
import WebsocketHeartbeatJs from './WebsocketHeartbeatJs';

class RequestUtils {
  constructor() {
    this.instance = null;
  }

  /**
   * 单例构造方法，构造一个广为人知的接口，供用户对该类进行实例化
   * @returns {RequestUtils}
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new RequestUtils();
    }
    return this.instance;
  }

  /**
   * 带token的请求
   * @param url 请求路径
   * @param options 请求参数
   * @returns {Promise<Response | never>}
   */
  request(url, options) {
    let token = StoreUtils.getToken();
    let params = {};
    if (null != options) {
      params = JSON.stringify(options);
    };
    return fetch(url, {
      method: 'POST',
      model: 'cros', //跨域
      headers: {
        'Content-Type': 'application/json',
        token: token
      },
      body: params
    }).then(response => {
      if (response.status === 200) {
        return response.json();
      }
      else {
        return new Promise((resolve, reject) => {
          reject('请求异常[status:'+response.status+']');
        });
      }
    }).then(json => {
      return new Promise(resolve => {
        resolve(json);
      });
    });
  }

  /**
   * 用户登录的方法
   * @param username 用户名
   * @param password 密码
   * @returns {Promise<Response>} 登录状态
   */
  login(username, password) {
    let param = {
      'userName': username.trim(),
      'password': password.trim()
    };
    return fetch(conf.login(), {
      model: 'cros', //跨域
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(param)
    }).then(response => {
          if (response.status === 200) {
            return response.json();
          }
          else if (response.status === 401 || response.status === 400){
            return new Promise((resolve, reject) => {
              reject('登录请求失败[响应状态码:'+response.status+']');
            });
          }
          else {
            return new Promise((resolve, reject) => {
              reject('服务器错误');
            });
          }
    }).then(json => {
      return new Promise((resolve) => {
        resolve(json);
      });
    });
  }



  /**
   * websocket 连接处理
   * @param self vue
   */
  webSocketOperation(self) {
    let currentChatId= self.$store.state.currentChat.chatGroupId;
    let currentUserId=self.$store.state.user.id;
    if (currentChatId==null||currentChatId==undefined||currentUserId==null||currentUserId==undefined){
      console.log("websocket链接参数丢失");
      return;
    }
    let pingMsg={
      messageType:1, //1用户信息  2系统信息
      userId:currentUserId, //用户id
      chatGroupId:currentChatId,
      contentType:1,
      content: '{"text":"监听websocket状态","code":' + MessageInfoType.MSG_PING + '}'
    };
    //创建websocket对象
    let websocketHeartbeatJs = new WebsocketHeartbeatJs({
      url: conf.getWsUrl()+"/"+currentUserId+"/"+currentChatId,
      pingMsg:pingMsg
    });
    //监听是否连接
    websocketHeartbeatJs.onopen = function() {
      console.log("websocket打开正常");
      //websocketHeartbeatJs.send('{"code":' + MessageInfoType.MSG_READY + '}');
    };
    //监听收消息
    websocketHeartbeatJs.onmessage = function(event) {
        let data = event.data;
        let sendInfo = JSON.parse(data);
        console.log("监听到服务端返回的消息",sendInfo);
      // 接受人是当前的聊天窗口
      if (String(sendInfo.msg.chatGroupId) == String(self.$store.state.currentChat.chatGroupId)) {
        // 更新信息面板并渲染
        self.$store.commit('addMessage', sendInfo);
      } else {
        ChatListUtils.initChatList(self,currentUserId);
        //self.$store.commit('setUnReadCount', sendInfo.msg);
      }
      self.winControl.flashIcon();
      self.winControl.flashFrame();
      self.$store.commit('setLastMessage',sendInfo.msg);
      // 每次滚动到最底部
      self.$nextTick(() => {
          imageLoad('message-box');
        });
    };
    //重连websocket
    websocketHeartbeatJs.onreconnect = function() {
      console.log('reconnecting...');
    };
    websocketHeartbeatJs.onclose = function(e) {
        console.log("webscoket链接已关闭",e);
    };

    //监听异常
    websocketHeartbeatJs.onerror = function(error) {
        console.log("websocket监听到异常",error);
    };
    self.$store.commit('setWebsocket', websocketHeartbeatJs);
  }
}

export default RequestUtils;
