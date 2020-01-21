<template>
    <div class="im-chat" v-if="chat.chatGroupId">
<!--顶部导航菜单栏-->
        <div class="im-chat-top" v-if="chat">
            <span>{{ chat.chatGroupName }}</span>
            <a  v-if="chat.groupType!=0" href="javascript:;" @click="getGroupDetail()" class="pull-right menu">
                <Icon type="md-flag"></Icon>
            </a>
            <a  v-if="chat.groupType!=0" href="javascript:;" @click="updateNameModal=true" class="pull-right menu">
                <Icon type="md-menu"/>
            </a>
        </div>
<!--主界面-->
        <div class="im-chat-main">
            <!--通讯面板-->
            <div class="im-chat-main-left" >
               <!--信息记录面板-->
                <div class="im-chat-main-box messages"   id="message-box" ref="scrollDiv">
                    <ul>
                        <li v-for="item in messageList" :class="{'im-chat-mine': item.msg.userinfo.id==currentUser.id}">
                            <div class="im-chat-user">
                                <img :src="item.msg.userinfo.photoPath==null?defaultPhoto:item.msg.userinfo.photoPath" alt="头像">
                                <cite v-if="item.msg.userinfo.id==currentUser.id"><i>{{ item.msg.time }}</i>{{ item.msg.userinfo.realName }}</cite>
                                <cite v-else>{{ item.msg.userinfo.realName }}<i>{{ item.msg.time }}</i></cite>
                            </div>
                            <div class="im-chat-text">
                                <pre v-html="item.msg.content.text" v-on:click="openImageProxy($event)"></pre>
                            </div>
                        </li>
                    </ul>
                </div>
                <!--发送信息面板-->
                <div class="im-chat-footer">
                    <div class="im-chat-tool">
                        <!--表情面板入口-->
                        <Icon type="ios-happy-outline" @click="showFaceBox()"></Icon>
                        <!--上传图片组件-->
                        <Upload :action="action" name="fileName"
                                :format="imgFormat"
                                :data="tokenImg"
                                :show-upload-list="showUploadList"
                                :headers="headers"
                                :max-size="imgMaxSize"
                                :with-credentials="cookieAuth"
                                :before-upload="beforeUpload"
                                :on-progress="handleStart"
                                :on-format-error="handleFormatError"
                                :on-exceeded-size="handleImgMaxSize"
                                :on-success="handleSuccess"
                                :on-error="handleError">
                            <Icon type="ios-image-outline"></Icon>
                        </Upload>
                        <!--上传文件组件-->
                        <Upload :action="action" name="fileName"
                                :format="fileFormat"
                                :data="tokenFile"
                                :show-upload-list="false"
                                :headers="headers"
                                :max-size="fileMaxSize"
                                :with-credentials="cookieAuth"
                                :before-upload="beforeUpload"
                                :on-progress="handleStart"
                                :on-format-error="handleFormatError"
                                :on-exceeded-size="handleFileMaxSize"
                                :on-success="handleSuccess"
                                :on-error="handleError">
                            <Icon type="ios-folder-open-outline"></Icon>
                        </Upload>
                        <!--表情面板实体组件-->
                        <Faces v-show="showFace" @click="showFace = true" class="faces-box"  @insertFace="insertFace"></Faces>
                       <!--查看聊天记录入口-->
                        <Button class="history-message-btn" @click="getHistoryMessage()">聊天记录</Button>
                    </div>
                    <!--文本输入框-->
                    <textarea v-model="messageContent"  :placeholder="placeHolder" class="textarea"  @keydown="quickSend"></textarea>
                    <div class="im-chat-send">
                        <Button @click="mineSend()">发送</Button>
                    </div>
                </div>
            </div>
            <!-- 群成员面板-->
            <div v-if="chat.groupType ==1||chat.groupType ==2" class="im-chat-users">
                <ul class="chat-user-list">
                    <li v-for="item in userList" @dblclick="showChat(item)" @click="showUser(item)">
                        <span class="im-chat-avatar">
                            <img :src="item.photoPath?item.photoPath:defaultPhoto" alt="头像"/>
                        </span>
                        {{item.realName}}
                    </li>
                </ul>
            </div>
        </div>
<!--群组公告弹窗栏-->
        <Modal v-model="modal" width="300" class="user-model">
            <p slot="header" style="text-align: center">
                <span>{{"群["+chatDetail.name+"]公告"}}</span>
            </p>
            <i-input  v-model="chatAdv"  type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="暂无公告">
            </i-input>
            <div slot="footer">
                <i-button type="success" size="large" long :loading="updateLoading" @click="updateGroupNotice()">确认修改</i-button>
            </div>
        </Modal>
<!--修改群名称的弹窗-->
        <Modal v-model="updateNameModal" width="300" class="user-model">
            <p slot="header" style="text-align: center">
                <span>修改群名称</span>
            </p>
            <i-input v-model="chatName" placeholder="请输入群名称" size="large" :maxlength="nameMaxLength"></i-input>
            <div slot="footer">
                <i-button type="success" size="large" long :loading="updateNameLoading" @click="updateGroupName">确认修改</i-button>
            </div>
        </Modal>
 <!--聊天记录抽屉栏-->
        <Drawer title="聊天记录" :closable="true" v-model="showHistory" class="history-message" width="60%">
            <div class="im-chat-main">
                <div class="messages" id="his-chat-message">
                    <ul>
                        <li v-for="item in hisMessageList" :class="{'im-chat-mine': item.msg.userinfo.id==currentUser.id}">
                            <div class="im-chat-user" id="historyMessageBox">
                                <img  :src="item.msg.userinfo.photoPath==null?defaultPhoto:item.msg.userinfo.photoPath" alt="头像">
                                <cite v-if="item.msg.userinfo.id==currentUser.id"><i>{{ item.msg.time }}</i>{{ item.msg.userinfo.realName }}</cite>
                                <cite v-else="item.msg.userinfo.id==currentUser.id">{{ item.msg.userinfo.realName }}<i>{{ item.msg.time }}</i></cite>
                            </div>
                            <div class="im-chat-text">
                                <pre v-html="item.msg.content.text" v-on:click="openImageProxy($event)"></pre>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <Page :total="count" size="small" show-total class="page" :page-size="pageSize"
                  @on-change="getHistoryMessage"/>
        </Drawer>
    </div>
</template>

<script>
  import Button from 'iview/src/components/button/button';
  import conf from '../conf';
  import Faces from './faces.vue';
  import RequestUtils from '../../../utils/RequestUtils';
  import StoreUtils from '../../../utils/StoreUtils';
  const { imageLoad, transform, ChatListUtils,selfAlert } = require('../../../utils/ChatUtils');
  export default {
    components: {
      Faces,
      Button
    },
    name: 'userChat',
    data() {
      return {
        defaultPhoto: '/static/img/defaultPhoto.png',
        updateLoading:false,
        updateNameLoading:false,
        loadingHeight:window.innerHeight/2,//加载信息显示的高度
        placeHolder:'Shift+Enter(换行)\r\nEnter(发送)',//提示
        //currentUser:{},//当前用户
        count: 0,//历史信息的总记录数
        //分页参数
        pageNum:1,
        pageSize: 20,
        showHistory: false,//历史信息显示开关
        hisMessageList: [],//聊天记录
        modal: false, //打开群公告弹窗开关
        updateNameModal:false,//打开修改群名称弹窗开关
        chatName:'',
        nameMaxLength:16,
        chatDetail:{}, //群信息详情
        messageContent: '',//发送信息内容
        chatAdv:'',//群公告
        showFace: false, //表情面板控制开关
        userList: [],//群成员
        //上传文件的文件类型(图片类型)
        imgFormat: ['jpg', 'jpeg', 'png', 'gif'],
        fileFormat: ['txt','doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'xls', 'xlsx', 'pdf', 'gif', 'exe', 'msi', 'swf', 'sql', 'apk', 'psd','zip','tar'],
        //上传图片时附带的额外参数
        tokenImg: {
          access_token: StoreUtils.getToken(),
          type: 'image'
        },
        //是否显示已上传文件列表
        showUploadList:false,
        //上传文件时附带的额外参数
        tokenFile: {
          access_token: StoreUtils.getToken(),
          type: 'file'
        },
        //上传的地址，必填
        action: conf.getMultipartUrl() + 'upload',
        //设置上传的请求头部
        headers: {
          'Access-Control-Allow-Origin': '*',
          'token': StoreUtils.getToken()
        },
        //图片最大限制，单位 kb
        imgMaxSize:5120,
        //上传文件最大限制 300M
        fileMaxSize:314572800,
        cookieAuth:true,
      };
    },
    props: ['chat'],
    computed: {
      messageList: {
        get: function() {
          console.log("computed>>>messageList");
          this.$Message.destroy();
          this.messageContent="";
          return this.$store.state.messageList;
        },
        set: function(messageList) {
          this.$store.commit('setMessageList', messageList);
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
    // 每次都会监听当前群的变化
    watch: {
      chat: function() {
        console.log(" chat.vue>>>watch....");
        let self = this;
        self.messageList = [];
        self.pageNum=1;
        self.$Message.destroy();
        if (self.chat.chatGroupId!=null&&self.chat.chatGroupId!=undefined){
          self.chatName=self.chat.chatGroupName;
          //获取群消息记录
          self.getChatGroupHistoryMsg();
          //如果是群消息,显示当前群成员
          self.getGroupMembers(self.chat);
        } ;
      }
    },
    mounted: function() {
      let that=this;
      let top=window.innerHeight-150;
      console.log("chat.vue >>> mounted....",top);
      that.$Notice.config({
        top: top,
        duration: 3
      });
    },

    updated: function () {
      let that=this;
      //监听元素滚动到顶部
      that.$refs.scrollDiv.addEventListener("scroll", that.scrollTopper);
    },

    methods: {
      showChat(user) {
        console.log("创建新的聊天群组",user);
      },
      showUser: function() {
        console.log("成员信息");
      },
      //表情面板显示控制开关
      showFaceBox: function() {
        this.showFace = !this.showFace;
      },
      //发送内容中插入表情
      insertFace: function(item) {
        this.messageContent = this.messageContent + 'face' + item;
        this.showFace = false;
      },
      //上传文件之前的钩子，参数为上传的文件，若返回 false 或者 Promise 则停止上传
      beforeUpload(file) {
        console.log("上传文件之前的钩子",file);
        this.$Loading.start();
        this.tokenImg = {
          access_token: StoreUtils.getToken(),
          type: 'image'
        };
        this.tokenFile = {
          access_token: StoreUtils.getToken(),
          type: 'file'
        };
        return new Promise(resolve => {
          this.$nextTick(function() {
            resolve(true);
          });
        });
      },
      //文件上传时的钩子，返回字段为 event, file, fileList
      handleStart() {
        console.log("文件正在上传");
      },
      //文件格式验证失败时的钩子，返回字段为 file, fileList
      handleFormatError(file) {
        let that=this;
        this.$Loading.finish();
        selfAlert('文件 ' + file.name + ' 格式不正确。',this.loadingHeight,2,'warning',that);
      },
      //上传的图片超出指定大小
      handleImgMaxSize(file) {
        let that=this;
        that.$Loading.finish();
        selfAlert('图片 ' + file.name + ' 太大，不能超过 512K！',this.loadingHeight,2,'warning',that);
      },
      //上传的文件超出指定大小
      handleFileMaxSize(file) {
        let that=this;
        that.$Loading.finish();
        selfAlert('文件 ' + file.name + ' 太大，不能超过 300M！',this.loadingHeight,2,'warning',that);
      },
      //文件上传成功时的钩子，返回字段为 response, file, fileList
      handleSuccess(res, file) {
        this.$Loading.finish();
        let self = this;
        let msgObj={};
        console.log("上传的响应信息",res);
        console.log("上传的文件信息",file);
        if (res.code === 1) {
          // let path = self.action+"/getFileFromParam?filePath="+res.data;
          let path = conf.getMultipartUrl() +"/getFileFromParam?filePath="+res.data;
          let fileName = file.name;
          // 文件后缀
          let suffix = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length);
          // 文件
          if (self.imgFormat.indexOf(suffix) === -1) {
            msgObj={'text': 'file(' + path + ')[' + fileName + ']','fileUrl':path,'fileName':fileName};
          }
          // 图片
          else {
            let imgText= 'img[' + path + ']';
            msgObj={'text':imgText,'url':path,'fileName':fileName};
          }
          if (msgObj.text!=null&&msgObj.text.length>0){
            self.send(1,1,msgObj);
          } ;
        } else {
          selfAlert("系统繁忙,请稍后重试",this.loadingHeight,2,'error',self);
        }
      },
      //文件上传失败时的钩子，返回字段为 error, file, fileList
      handleError: function(error) {
        let that=this;
        that.$Loading.finish();
        console.log("上传触发异常",error);
        selfAlert("上传错误",this.loadingHeight,2,'error',that);
      },
      // 附件和图片点击展开
      openImageProxy: function(event) {
        let self = this;
        event.preventDefault();
        if (event.target.nodeName === 'IMG') {
          self.winControl.openURL(event.target.src);
        } else if (event.target.className === 'message-file') {
          self.winControl.openURL(event.target.href);
        }
      },
      //获取群成员
      getGroupMembers:function(chatGroup){
        let that=this;
        if (chatGroup.groupType!=3) {
          console.log("请求当前群["+chatGroup.chatGroupId+"]成员的接口");
          //查询当前在线成员信息
          RequestUtils.getInstance().request(conf.getChatUsersUrl(chatGroup.chatGroupId)).then(response => {
            if (response.code==1){
              that.userList=response.data;
            }
            else{
              console.log("群成员接口异常");
            } ;
          })
        }
      },
      //快捷键发送信息
      quickSend(e){
        let that=this;
        //发送信息
        if (e.shiftKey==false&&e.key==="Enter"){
          e.preventDefault();
          that.mineSend();
          that.placeHolder="";
        } ;
      },
      // 本人发送信息
      mineSend() {
        let self = this;
        let content = self.messageContent;
        if (content !== '' && content !== '\n') {
          if (content.length > 2000) {
            selfAlert("不能超过2000个字符",this.loadingHeight,2,'error',self);
            return;
          }
          else {
            let msg={'text':content};
            //判断是否含有敏感词
            RequestUtils.getInstance() .request(conf.validateMsgUrl(), msg).then(response => {
              if (response.code==1&& response.data!=null){
                    let keyWords= response.data;
                    let msg="";
                    for (let i = 0; i <keyWords.length ; i++) {
                       if (i==keyWords.length-1){
                         msg=msg+"["+keyWords[i]+"]";
                       }
                       else{
                         msg=msg+"["+keyWords[i]+"],";
                       }
                    }
                    console.log("抱歉,您发送的信息内容含特殊敏感词",msg);
                    self.$Notice.error({
                      title: '发送失败,信息内容含以下特殊敏感词:',
                      desc:msg,
                      duration: 10
                    });
                    //self.messageContent="";
                    return;
              }else{
                self.send(1,1,msg);
              }
            })
          }
        }
      },
      // 发送消息的基础方法
      send(messageType,contentType,content) {
        let self = this;
        let currentUser = self.$store.state.user;
        if (messageType==null){
          messageType=1;
        } ;
        if (contentType==null){
          contentType=1;
        } ;
        let currentMessage = {
          messageType:messageType,   //信息类型  1用户信息  2系统信息
          userId: currentUser.id,  //用户id
          chatGroupId:self.chat.chatGroupId, //群组id
          content:content, //发送的内容
          contentType: contentType        //信息内容类型 1文字 2图片信息  3语音 4视频  5文件 6其他
        };
        selfAlert("正在发送",self.loadingHeight,0,'loading',self);
        //发送消息到后端
        self.$store.commit('sendMessage', currentMessage);
        // 每次滚动到最底部
        self.$nextTick(() => {
          imageLoad('message-box');
        });
        setTimeout(function() {
          self.$Message.destroy();
        },100000)
      },
      //获取历史消息
      getHistoryMessage(pageNo) {
        let that = this;
        that.showHistory = true;
        if (!pageNo) {
          pageNo = 1;
        }
        let pageNum=pageNo;
        let pageSize=that.pageSize;
        let groupId=that.chat.chatGroupId;
        let param={"pageNum":pageNum,"pageSize":pageSize,"chatGroupId":groupId};
        console.log("查询聊天记录参数",param);
        RequestUtils.getInstance() .request(conf.getChatGroupHistoryMsgUrl(), param).then(response => {
          if (response.code==1){
            let historyMsgList=response.data.map(function(element) {
              let text=element.msg.content.text;
              element.msg.content.text = transform(text);
              return element;
            });
            that.hisMessageList = historyMsgList.reverse();
            that.count = response.pageInfo.total;
            that.pageSize = response.pageInfo.pageSize;
            // 每次滚动到最底部
            that.$nextTick(() => {
              imageLoad('his-chat-message');
            });
          } ;
        })
      },
      //加载历史记录
      getChatGroupHistoryMsg(){
        let that=this;
        let pageNum=that.pageNum;
        let pageSize=that.pageSize;
        let groupId=that.chat.chatGroupId;
        let param={"pageNum":pageNum,"pageSize":pageSize,"chatGroupId":groupId};
        //console.log("加载历史记录",param);
        RequestUtils.getInstance().request(conf.getChatGroupHistoryMsgUrl(),param).then(response => {
          if (response.code==1){
            let list= response.data;
            console.log("本次查询群组[ID:"+param.chatGroupId+"]历史信息记录有["+list.length+"]条,起始页["+param.pageNum+"]");
            if (list!=null&&list.length>0){
              that.$store.commit("addHistoryMessageList",list);
            } ;
            that.$nextTick().then(function () {
              // DOM 更新了
              if (pageNum==1){
                imageLoad('message-box');
              } ;
            })
          }
          else{
            console.log("暂无更多历史信息记录");
          } ;
        });
      },
      //获取详情
      getGroupDetail(){
        let that=this;
        let chatGroupId=that.chat.chatGroupId;
        if (chatGroupId==null||chatGroupId==undefined){
          selfAlert("群ID不能为空",self.loadingHeight,2,'error',that);
          return ;
        } ;
        RequestUtils.getInstance().request(conf.getChatGroupDetailUrl(chatGroupId)).then(response => {
          if (response.code==1&&response.data!=null){
            that.chatDetail=response.data;
            if (that.chatDetail.notice!=null&&that.chatDetail.notice.length>0){
              that.chatAdv=that.chatDetail.notice;
            } ;
            console.log("群详情",that.chatDetail);
            that.modal = true;
          }
          else{
            console.log("查询群详情失败");
          } ;
        });
      },
      //修改群公告
      updateGroupNotice(){
        let that=this;
        if (that.chatAdv.length<1){
           selfAlert("公告内容不能为空",that.loadingHeight,2,"error",that);
           return;
        } ;
        that.updateLoading=true;
        let param={"id":that.chatDetail.id,"notice":that.chatAdv};
        RequestUtils.getInstance().request(conf.updateChatGroupNoticeUrl(),param).then(response => {
          if (response.code==1){
            that.updateLoading=false;
            that.modal = false;
          }
          else{
            console.log("修改群公告失败");
          } ;
        });
        setTimeout(function() {
          that.updateLoading=false;
        },10000)
      },
      //修改群名称
      updateGroupName(){
        let that=this;
        let param={"id":that.chat.chatGroupId,"name":that.chatName};
        if (param.id==null||param.id==undefined||param.name==null||param.name==undefined){
          selfAlert("修改群名称参数丢失",this.loadingHeight,2,'error',that);
          return;
        } ;
        if (param.name.length<1){
          selfAlert("群名称长度不能为空",this.loadingHeight,2,'error',that);
          return;
        } ;
        that.updateNameLoading=true;
        RequestUtils.getInstance().request(conf.updateChatGroupNameUrl(),param).then(response => {
          if (response.code==1){
            console.log("修改群名称成功");
            that.updateNameLoading=false;
            that.updateNameModal = false;
            //对象转换,不然会报错:在mutation函数外修改VUEX存储状态
            let  tempChat=JSON.parse(JSON.stringify(that.chat));
            tempChat.chatGroupName=that.chatName;
            that.$store.commit('setCurrentChat',tempChat);
            ChatListUtils.initChatList(that,that.currentUser.id);
          }
          else{
            console.log("修改群名称失败");
            that.updateNameLoading=false;
          } ;
        });
        setTimeout(function() {
          that.updateNameLoading=false;
        },10000)
      },
      //监听信息面板滚动到顶部,然后加载历史记录
      scrollTopper(e){
        let that=this;
       // console.log("距离顶部的距离",e.target.scrollTop);
        let scrollHeight= e.target.scrollHeight;
        //console.log("滚动条的高度",scrollHeight);
        let showWindowHeight= e.target.clientHeight;
        //console.log("可见窗口高度",showWindowHeight);
        //滚到到距离顶部10个单位的时候加载更多的历史信息
        if (e.target.scrollTop<5){
          console.log("触碰到顶部");
          that.pageNum=that.pageNum+1;
          that.getChatGroupHistoryMsg();
        } ;
      },
    },
   //销毁之前
    beforeDestory:function() {
      let that=this;
      //清楚缓存
      that.$store.commit("clear");
   }
  };
</script>

<style lang="scss">
    @import '../../../../../static/styles/theme';
      .demo-spin-icon-load{
        animation: ani-demo-spin 1s linear infinite;
    }
    .im-chat {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-top: 4rem;
        overflow: hidden;
    }

    .im-chat-top {
        border-bottom: 1px solid #cccccc;
        color: $color-default;
        padding: 0 0 0.2rem 1rem;
        font-size: 1.6rem;
        font-weight: bold;
        height: 40px;
        .menu {
            color: $color-default;
            display: inline-block;
            padding: 0 10px;
        }
    }

    .user-model {
        .user-model-img {
            padding: 30px;
            text-align: center;
            img {
                border-radius: 50%;
            }
        }

        .user-model-item {
            display: flex;
            padding: 5px 0;

            label {
                flex: 2;
                font-weight: bold;
                text-align: right;
            }

            span {
                flex: 3;
            }
        }
    }

    .im-chat-main {
        flex: 1;
        display: flex;
        flex-direction: row;
        height: calc(100% - 40px);

        .im-chat-main-left {
            flex: 4;
            display: flex;
            flex-direction: column;

            .im-chat-main-box {
                flex: 1;
                padding-top: 1rem;
                overflow-x: hidden;
                overflow-y: auto;
            }
        }

        .message-img {
            max-width: 20rem;
        }

        .im-chat-users {
            flex: 1;
            border-left: 1px solid #cccccc;
            overflow-y: scroll;
        }

        .messages {
            width: 100%;
            height: calc(100% - 3rem);
            overflow-y: scroll;

            ul {
                width: 100%;

                li {
                    position: relative;
                    font-size: 0;
                    margin-bottom: 10px;
                    padding-left: 60px;
                    min-height: 68px;

                    .im-chat-text {
                        position: relative;
                        line-height: 22px;
                        margin-top: 25px;
                        padding: 0.8rem 1.5rem;
                        background-color: #e2e2e2;
                        border-radius: 3px;
                        color: #333;
                        word-break: break-all;
                        display: inline-block;
                        vertical-align: top;
                        font-size: 14px;

                        &:after {
                            content: '';
                            position: absolute;
                            left: -10px;
                            top: 13px;
                            width: 0;
                            height: 0;
                            border-style: solid dashed dashed;
                            border-color: #e2e2e2 transparent transparent;
                            overflow: hidden;
                            border-width: 10px;
                        }

                        pre {
                            width: 100%;
                            white-space: pre-wrap;
                            word-break: break-all;
                        }
                    }
                }
            }

            .im-chat-user {
                width: 4rem;
                height: 4rem;
                position: absolute;
                display: inline-block;
                vertical-align: top;
                font-size: 14px;
                left: 3px;
                right: auto;

                cite {
                    position: absolute;
                    left: 60px;
                    top: -2px;
                    width: 500px;
                    line-height: 24px;
                    font-size: 12px;
                    white-space: nowrap;
                    color: #999;
                    text-align: left;
                    font-style: normal;

                    i {
                        font-style: normal;
                        padding-left: 15px;
                    }
                }

                img {
                    width: 4rem;
                    height: 4rem;
                    border-radius: 100%;
                }
            }

            .im-chat-mine {
                text-align: right;
                padding-left: 0;
                padding-right: 60px;

                .im-chat-text {
                    margin-left: 0;
                    text-align: left;
                    background-color: $color-message-bg;
                    color: #fff;
                    display: inline-block;
                    vertical-align: top;
                    font-size: 14px;

                    &:after {
                        left: auto;
                        right: -10px;
                        border-top-color: $color-message-bg;
                    }
                }

                .im-chat-user {
                    left: auto;
                    right: 3px;

                    cite {
                        left: auto;
                        right: 60px;
                        text-align: right;

                        i {
                            padding-left: 0;
                            padding-right: 15px;
                        }
                    }
                }
            }
        }
    }

    .im-chat-footer {
        border-top: 1px solid $color-gray;
        height: 15rem;
        display: flex;
        flex-direction: column;

        .im-chat-tool {
            padding: 0.5rem 1rem;
            height: 3.4rem;
            position: relative;

            i {
                font-size: 2.4rem;
                cursor: pointer;
                margin-left: 1rem;
            }

            .faces-box {
                position: absolute;
                bottom: 3.8rem;
            }

            .ivu-upload {
                display: inline-block;
            }

            .history-message-btn {
                float: right;
            }


        }

        textarea {
            border: 0;
            padding: 0.5rem;
            width: 100%;
            flex: 1;
            resize: none;
            background-color: $color-box-bg !important;
            &:focus {
                border: 0;
            };
        }



        .im-chat-send {
            height: 4rem;
            text-align: right;
            padding: 0 1rem 1rem 0;
        }
    }

    .ivu-scroll-wrapper {
        margin: 0 !important;
    }

    .ivu-scroll-container {
        padding: 15px 15px 5px;
        overflow-y: visible !important;
    }

    /* 重新覆盖iview 里面的 model 小于768px 时候 宽度变100% 的问题 */
    @media (max-width: 768px) {
        .user-model {
            .ivu-modal {
                width: 30rem !important;
                margin: 0 auto;
            }
        }
    }

    .history-message {
        width: 80%;
        height: calc(100% - 30px);
    }

    .page {
        position: fixed;
        bottom: 0;
        width: 100%;
        margin: 0.5rem;
    }

    .ivu-drawer-body {
        padding: 0 !important;

        .messages {
            height: calc(100% - 3rem);
        }
    }

    .chat-user-list {
        list-style: none;
        margin: 0;
        padding: 1rem;

        & > li {
            margin-bottom: 1rem;
            cursor: pointer;

            & > .im-chat-avatar {
                width: 3.2rem;
                height: 3.2rem;
                display: inline-block;
                vertical-align: middle;

                & > img {
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }
</style>
