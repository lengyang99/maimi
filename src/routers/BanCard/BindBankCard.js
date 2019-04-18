/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react'
import { InputItem, List} from 'antd-mobile';
import NetUtils from '../../components/common/NetUtils';
import { requstObeject,redirect} from "../../util/util";
import BottomBtn from '../../components/BottomBtn';
import Alert from '../../components/Alert';
import NotifyModal from '../../components/NotifyModal/NotifyModal';
import { createForm } from 'rc-form';
import './BindBankCard.less';

class Bank extends Component {
  state = {
    count: 60,
    checked: false, //是否同意协议
    visible: false, // 是否弹出选择列表
    alertVisible: false, // 是否弹出警告框
    requestNo: null, //请求号
    title: '',  // 弹框的标题
    message: '', // 弹框的内容
    isPhone: false, // 手机号的校验
    bankInfo: {},// (银行名称 编码等信息)
    defaultName: '', // 获取的用户姓名
    saveBankData: false, // 是否需要保存银行信息
    notify:false,
    messageContent: '',
  }
  componentDidMount() {
    this.props.callbackRef(this);
    const request = requstObeject();
    // 查询用户信息（姓名，手机号）
    NetUtils.fetchRequest('/api/h5/rest/GET_USER_INFO', request).then(rep => {
      if (rep.resultCode === 1000) {
        const { name, phone} = JSON.parse(rep.resultData) || {};
        this.setState({ defaultName: name, isPhone:true});
        this.props.form.setFieldsValue({phone});
      }
    });
    // 获取通知
    const hasBindcardShow = sessionStorage.getItem('hasBindcardShow');
    if(!hasBindcardShow){
      NetUtils.fetchRequest('/api/h5/rest/GET_LATEST_MESSAGE_LIST', request).then(rep => {
        if (rep.resultCode === 1000) {
          const {bindcardShow : {isBindcardShow, messageContent}} = JSON.parse(rep.resultData) || {};
          if(isBindcardShow){
            this.setState({ messageContent, notify: true });
            sessionStorage.setItem('hasBindcardShow','1');
          }
        }
      });
    } 

    // 查看银行列表后返回时，检查缓存
    const bankData = sessionStorage.getItem('bankData');
    if(bankData){
      const {formData, stateData} = JSON.parse(bankData);
      this.setState(stateData);
      this.props.form.setFieldsValue(formData);
      sessionStorage.removeItem('bankData');
    }
    if(sessionStorage.getItem('count') && !this.props.count){
      sessionStorage.removeItem('count');
    }
  }
  // 查看银行列表后返回时，保留填写表达信息
  componentWillUnmount() {
    if(this.state.saveBankData){
      const formData = this.props.form.getFieldsValue();
      const stateData = {...this.state};
      const bankData = JSON.stringify({formData,stateData});
      sessionStorage.setItem('bankData',bankData);
    }else if(sessionStorage.getItem('bankData')){
      sessionStorage.removeItem('bankData');
    }
  }
  renderHeader = () => {
    return (
      <div className='list-header'>
        <label>请绑定银行卡</label>
        <label onClick={this.readBankList}>查看可支持银行</label>
      </div>
    )
  }
  renderFooter = () => {
    return (
      <div className='list-footer'>
        <input checked={this.state.checked} className='tui-checkbox' type='checkbox' onClick={this.onCheckBoxChange} />
        <div className='span-title'><span>我已经同意<a onClick={this.readAgreement}>《委托代扣款授权书》</a></span></div>
      </div>
    )
  }
  // 查看银行列表
  readBankList = () => {
    this.setState({saveBankData:true},()=>{
      this.props.goBankList(4);
    });
  }
  // 查看协议
  readAgreement = () => {
    const formData = this.props.form.getFieldsValue();
    const stateData = {...this.state};
    const bankData = JSON.stringify({formData,stateData});
    sessionStorage.setItem('bankData',bankData);
    window.location.href='/agreement/powerofAttorneyforDeduction.html';
  }
  // 同意协议
  onCheckBoxChange = () => {
    this.setState({ checked: !this.state.checked });
  }
  // 确定绑卡
  onSubFormData = (e) => {
    e.preventDefault();
    const { bankInfo: { bankCode }, requestNo } = this.state;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { cardNum, phone, message } = values;
        const request = requstObeject();
        const smsParam = {};
        Object.assign(smsParam, {
          bank: bankCode,
          cardNo: cardNum.replace(/\s/g, ''),
          bindMob: phone.replace(/\s/g, ''),
          validateCode: message,
          type: 0,
          requestNo,
        });
        request.serviceData = JSON.stringify(smsParam);
        NetUtils.fetchRequest('/api/h5/rest/FUION_BIND_BANK_CARD_AFFIRM', request).then(rep => {
          if (rep.resultCode === 1000) {
            this.setState({ title: '绑定成功', message: '您的银行卡已绑定成功', footer: '确定', alertVisible: true });
          } else {
            this.setState({ title: '绑定失败', message: rep.resultMessage ,footer:'重新绑定', alertVisible: true });
          }
        })
      }
    })
  }
  // 获取短信验证码 并发送请求绑卡 请求
  getMsgCode = () => {
    const { bankInfo: { bankCode } } = this.state;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { cardNum, phone } = values;
        const request = requstObeject();
        const smsParam = {};
        Object.assign(smsParam, {
          bank: bankCode,
          cardNo: cardNum.replace(/\s/g, ''),
          bindMob: phone.replace(/\s/g, ''),
        });
        request.serviceData = JSON.stringify(smsParam);
        NetUtils.fetchRequest('/api/h5/rest/FUION_BIND_BANK_CARD_REQUEST', request).then(rep => {
          if (rep.resultCode === 1000) {
            const { no_order } = JSON.parse(rep.resultData) || {};
            this.setState({ requestNo: no_order });
          } else {
            this.setState({ title: '操作失败', message: rep.resultMessage, alertVisible: true });
          }
        })
      }
    });
  }
  // 输入银行卡号失去焦点回调
  onBankCardBlur = () => {
    const cardNum = this.props.form.getFieldValue('cardNum');
    if (!cardNum || cardNum === '') {
      return
    }
    const request = requstObeject();
    const smsParam = {};
    smsParam.cardNo = cardNum.replace(/\s/g, '');;
    request.serviceData = JSON.stringify(smsParam);
    NetUtils.fetchRequest('/api/h5/rest/FUION_BCARD_BIN', request).then(rep => {
      if (rep.resultCode === 1000) {
        const { bankName, bankCode } = JSON.parse(rep.resultData) || {};
        const bankInfo = { bankCode, bankName };
        this.setState({ bankInfo });
      }else {
        this.setState({ title: '操作失败', message: rep.resultMessage, alertVisible: true });
      }
    })
  }
  // 验证手机
  validatorPhone = (rule, value, callback) => {
    let isPhone = /^1[3|4|5|6|7|8|9]\d{9}$/.test(value.replace(/\s/g, ''));
    this.setState({ isPhone });
    callback();
  }
  // 绑卡成功跳转
  onOk = () => {
    const {title} =this.state;
    this.setState({alertVisible:false});
    if(title === '绑定成功'){
      const url= sessionStorage.getItem('return_url');
      const token = sessionStorage.getItem('token');
      if(sessionStorage.getItem('bankData')){
        sessionStorage.removeItem('bankData');
      }
      redirect(token,0,url);
    }
  }
  closeNotify = () => {
    this.setState({notify:!this.state.notify});
  }
  render() {
    const { getFieldProps, getFieldValue, } = this.props.form;
    const {count ,sendAgain} = this.props;
    const {title, message, bankInfo, isPhone, checked, alertVisible, defaultName,requestNo,notify,messageContent} = this.state;
    const canSendMsg = getFieldValue('cardNum') && isPhone && bankInfo['bankName'];
    const canBind = getFieldValue('name') && getFieldValue('message') && canSendMsg && checked && requestNo;
    return (
      <div className={'bind-bank-list'}>
        <form>
          <List className={'form'} renderHeader={this.renderHeader} renderFooter={this.renderFooter}>
            <InputItem
              className={'form-item'}
              {...getFieldProps('name', { initialValue: defaultName, rules: [{ require: true }] })}
              placeholder='姓名'
            >持卡人姓名</InputItem>
            <InputItem
              className={'form-item'}
              type='bankCard'
              placeholder='请输入银行卡号'
              {...getFieldProps('cardNum', { rules: [{ require: true }] })}
              onBlur={this.onBankCardBlur}
            >银行卡卡号</InputItem>
            <InputItem
              className={'form-item'}
              placeholder='开户行'
              value={bankInfo['bankName'] ? bankInfo['bankName'] : ''}
              readOnly
            >开户行</InputItem>
            <InputItem
              className={'form-item'}
              type='phone'
              placeholder='请输入银行预留手机号'
              {...getFieldProps('phone', { rules: [{ validator: this.validatorPhone }] })}
            >预留手机号</InputItem>
            <InputItem
              className={'form-item'}
              type='number'
              placeholder='请输入验证码'
              extra={<div onClick={!sendAgain && canSendMsg ? () => this.props.getMsgTimer() : null}>{sendAgain ? `${count}s后重新获取` : '获取短信验证码'}</div>}
              {...getFieldProps('message')}
            >短信验证码      </InputItem>

          </List>
        </form>
        <BottomBtn
          btnStyle={canBind ? 'btn-color' : 'btn-image'}
          disabled={!canBind}
          onClick={canBind ? (e)=>this.onSubFormData(e) : null}
          btnTxt='绑定银行卡'
        />
        <Alert title={title}
          message={message}
          visible={alertVisible}
          onVisibleChange={() => {this.onOk()}}
        />
        <NotifyModal
          title="通知"
          visible={notify}
          onClose={this.closeNotify}
          messageContent={messageContent}
        >
        </NotifyModal>
      </div>

    )
  }
}
const BindBankCard = createForm()(Bank)
export default BindBankCard; 