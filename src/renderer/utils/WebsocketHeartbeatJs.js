/**
 * `WebsocketHeartbeatJs` constructor.
 *
 * @param {Object} opts
 * {
 *  url                  websocket链接地址
 *  pingTimeout 未收到消息多少秒之后发送ping请求，默认15000毫秒
    pongTimeout  发送ping之后，未收到消息超时时间，默认10000毫秒
    reconnectTimeout
    pingMsg ping 消息值
 * }
 * @api public
 */
import StoreUtils from './StoreUtils';
const { MessageInfoType } = require('./ChatUtils');

function WebsocketHeartbeatJs({url,pingMsg}) {
  this.opts = {
    url: url,
    pingTimeout: 20000,
    pongTimeout: 15000,
    reconnectTimeout: 5000,
    pingMsg: pingMsg
  };
  this.ws = null; // websocket实例
  // override hook function
  this.onclose = () => {};
  this.onerror = () => {};
  this.onopen = () => {};
  this.onmessage = () => {};
  this.onreconnect = () => {};
  this.createWebSocket();
}

WebsocketHeartbeatJs.prototype.createWebSocket = function() {
  try {
    console.log("websocket链接地址",this.opts.url);
    this.ws = new WebSocket(this.opts.url);
    this.initEventHandle();
  } catch (e) {
    console.log("创建websocket链接触发异常",e);
    //this.reconnect();
    throw e;
  }
};
//初始化
WebsocketHeartbeatJs.prototype.initEventHandle = function() {
  //监听到websocket关闭,关闭后尝试去重连
  this.ws.onclose = event => {
    this.onclose(event);
    //this.reconnect();
  };
  //监听到websocket触发异常,然后尝试去重连websocket链接
  this.ws.onerror = error => {
    this.onerror(error);
    //this.reconnect();
  };
  this.ws.onopen = () => {
    this.onopen();
    // 心跳检测重置
    //this.heartCheck();
  };
  this.ws.onmessage = event => {
    this.onmessage(event);
    // 如果获取到消息，心跳检测重置
    // 拿到任何消息都说明当前连接是正常的
    //his.heartCheck();
  };
};
//发送信息到服务端
WebsocketHeartbeatJs.prototype.send = function(msg) {
  this.ws.send(msg);
};
//重连websocket
WebsocketHeartbeatJs.prototype.reconnect = function() {
  if (this.lockReconnect || this.forbidReconnect) return;
  this.lockReconnect = true;
  this.onreconnect();
  // 没连接上会一直重连，设置延迟避免请求过多
  setTimeout(() => {
    this.createWebSocket();
    this.lockReconnect = false;
  }, this.opts.reconnectTimeout);
};
// 心跳检测
WebsocketHeartbeatJs.prototype.heartCheck = function() {
  //this.heartReset();
  //this.heartStart();
};
//监听心跳
WebsocketHeartbeatJs.prototype.heartStart = function() {
  this.pingTimeoutId = setTimeout(() => {
    // 这里发送一个心跳，后端收到后，返回一个心跳消息，
    // onmessage拿到返回的心跳就说明连接正常
    this.ws.send(this.opts.pingMsg);
    // 如果超过一定时间还没重置，说明后端主动断开了
    this.pongTimeoutId = setTimeout(() => {
      // 如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
      this.ws.close();
    }, this.opts.pongTimeout);
  }, this.opts.pingTimeout);
};
WebsocketHeartbeatJs.prototype.heartReset = function() {
  clearTimeout(this.pingTimeoutId);
  clearTimeout(this.pongTimeoutId);
};
//手动关闭websocket链接
WebsocketHeartbeatJs.prototype.close = function() {
  // 如果手动关闭连接，不再重连
  this.forbidReconnect = true;
  this.ws.close();
};
if (window) window.WebsocketHeartbeatJs = WebsocketHeartbeatJs;
export default WebsocketHeartbeatJs;
