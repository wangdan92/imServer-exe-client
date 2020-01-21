<template>
    <div class="user-info">
        <Row>
            <Col span="12">
                <h5 class="username">{{user.realName}}</h5>
            </Col>
            <Col span="12" class="text-right">
                <Avatar size="large" :src="user.photoPath?urlPrefix+user.photoPath:defaultPhoto"/>
            </Col>
        </Row>
        <Divider/>
        <Row>
            <Col span="3" class="label">手机</Col>
            <Col span="2">&nbsp;</Col>
            <Col span="18" class="value">{{user.mobile}}</Col>
        </Row>
        <Row>
            <Col span="3" class="label">部门</Col>
            <Col span="2">&nbsp;</Col>
            <Col span="18">{{user.departmentName}}</Col>
        </Row>
        <Row>
            <Col span="3" class="label">邮箱</Col>
            <Col span="2">&nbsp;</Col>
            <Col span="18">{{user.email==null||user.email.length<1?"暂无":user.email}}</Col>
        </Row>
        <Row>
            <Col span="18">&nbsp;</Col>
            <Col span="6" class="text-right">
                <i-button type="primary" shape="circle" size="large" @click="showChat()">发送消息</i-button>
            </Col>
        </Row>
        <Row>
            <Col span="24"> <Alert v-if="isAlert" type="warning" show-icon>{{alertMsg}}</Alert>
            </Col>
        </Row>
    </div>
</template>

<script>
  import conf from '../conf';
  import { MessageTargetType } from '../../../utils/ChatUtils';
  import RequestUtils from '../../../utils/RequestUtils';
  const { ChatListUtils } = require('../../../utils/ChatUtils.js');

  export default {
    name: 'userInfo',
    props: ['user'],
    data() {
      return {
        urlPrefix:conf.getFileUrl(),
        host: conf.getMultipartUrl(),
        requestApi : RequestUtils.getInstance(),
        defaultPhoto: '/static/img/defaultPhoto.png',
        currentUser:{},
        isAlert:false,
        alertMsg:'',
      };
    },
    mounted(){
      let that=this;
      that.currentUser=that.$store.state.user
    },
    methods:{
      setAlert:function(msg){
        if (msg==null||msg==undefined||msg.length<1){
            console.log("提示信息缺少参数");
            return;
        } ;
        let  that=this;
        that.isAlert=true;
        that.alertMsg=msg;
        setTimeout(function() {
          that.isAlert=false;
          that.alertMsg="";
        },3000);
      },
      // 打开一个聊天对话框
      showChat: function() {
        let self = this;
        let userId1=self.currentUser.id;
        let userId2=self.user.id;
        if (userId1==userId2){
           self.setAlert("抱歉,不支持与自己进行信息通讯");
           return;
        } ;
        if (userId1!=null&&userId2!=null&&userId1!=userId2){
          //创建单聊
          let obj={"userId1":self.currentUser.id,"userId2":self.user.id};
          self.requestApi.request(conf.getSingleChatUrl(obj)).then(res => {
            if (res.code==1&&res.data!=null){
              let chatGroupId=res.data.id;
              let userId=self.currentUser.id;
              if (chatGroupId!=null&&userId!=null){
                let param={"chatGroupId":chatGroupId,"userId":userId,"groupType":0};
                self.getChatGroupMessageInfoById(param);
              }else{
                console.log("发起群聊失败")
              }
            }else{
              console.log("发起群聊响应失败")
            }
          }).catch(function(error) {
            console.log("创建群聊触发异常",error);
          });
        }else{
          self.setAlert("抱歉,创建聊天失败!请稍后重试");
          return;
        }
      },
      //创建完群聊以后查询当前群信息详情
      getChatGroupMessageInfoById(param){
        let that=this;
        that.requestApi.request(conf.getChatGroupMessageInfoByIdUrl(),param).then(res => {
          if (res.code==1&&res.data!=null){
            console.log("点对点发起群聊结果",JSON.stringify(res.data));
            that.$router.push({
                 path: '/index/chatBox/',
                 query: { chat: res.data }
               });
          }else{
            console.log("发起群聊失败")
          }
        }).catch(function(error) {
          console.log("发起群聊触发异常",error);
        });
      }

    }

  };
</script>

<style scoped>
    .user-info {
        font-size: 16px;
        line-height: 200%;
        color: #666;

        .text-right {
            text-align: right;
        }

        .username {
            font-weight: bold;
            font-size: 20px;
        }

        .label {
            text-align: justify;
            text-align-last: justify;
            font-weight: bold;
        }
    }
</style>
