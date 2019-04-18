import React, { Component } from 'react'
import { getQueryString, requstObeject, redirect} from "../../util/util";
import DocumentTitle from 'react-document-title'
import NetUtils from '../../components/common/NetUtils';
import BindBankCard from './BindBankCard';
import BankCard from './BankCard';
import BankList from './BankList';
import { bankConfig } from '../../components/BankConfig';

export default class Bank extends Component {
    constructor(props) {
        super(props);
        const url = window.location.href;
        const {token, return_url} = getQueryString(url);
        if(token){
            sessionStorage.setItem('token',token);
        }
        if(return_url){
            sessionStorage.setItem('return_url',return_url);
        }
        this.state = {
            bankMsg: {},
            status: null,
            count:60,
            sendAgain:false,
        }
    }
    bankRef = null;
    componentDidMount() {
        const params = requstObeject();
        NetUtils.fetchRequest('/api/h5/rest/FUION_GET_USER_BANKCARD', params).then(rep => {
            if (rep.resultCode === 1000) {
                const { bankName, cardNo, isBindCard, changeable } = JSON.parse(rep.resultData) || {};
                if (isBindCard) {
                    const bankMsg = this.getBankMsgByName(bankName);
                    const num = this.splitStr(cardNo);
                    Object.assign(bankMsg, { isBindCard, changeable, cardNo: num});
                    this.setState({bankMsg,status:1});
                } else {
                    this.setState({status:2})
                }

            }
        })
    }
    componentWillUnmount(){
        if(this.timer){
            clearInterval(this.timer);
        }
    }
    getBankMsgByName = (name = '', ) => {
        const bankMsg = bankConfig.find(item => item.name === name);
        return bankMsg || {};
    }
    splitStr = (cardNo) => {
        if (cardNo && cardNo === '') {
            return
        }
        const start = cardNo.substr(0,4);
        const end = cardNo.substr(cardNo.length-4,4);
        return [start,'****','****',end];
    }
    // status 1 已绑卡  2 未绑卡 3 换绑卡中  4 银行卡列表 else null
    onChangeStatus = (status) => {
        this.setState({status});
    }
    // 短信验证码倒计时定时器
    getMsgTimer = () =>{    
        if(this.bankRef && !this.state.sendAgain){
            this.bankRef.getMsgCode();
        }
        let count = this.state.count;
        if (count >= 1 && count <= 60) {
            this.setState({
              count: count - 1,
              sendAgain:true
            })
            setTimeout(
              () => {
                this.getMsgTimer();
              },
              1000
            );
          } else {
            this.setState({
              count: 60,
              sendAgain: false
            })
          }
        // this.timer=setInterval(()=>{
        //         this.setState({count:(count--),sendAgain:true},()=>{
        //             if(count === 0){
        //                 clearInterval(this.timer)
        //                 this.setState({count:60, sendAgain: false});
        //             }
        //         });
        // },1000);
    }
    render() {
        const { bankMsg, status, count} = this.state;
        let component = null;
        switch (status) {
            case 1: component = <BankCard data={bankMsg} onChangeBankCard={()=>{this.onChangeStatus(3)}} />;
            break;
            case 2:
            case 3: component = <BindBankCard 
            {...this.props}
            callbackRef={(ref)=>{this.bankRef=ref}} 
            sendAgain={this.state.sendAgain}
            count={count} 
            getMsgTimer={()=>this.getMsgTimer()} 
            goBankList={()=>this.onChangeStatus(4)} 
            />;
            break;
            case 4: component = <BankList goBack={()=>this.onChangeStatus(2)}/>;
            break;
            default:
            break;
        }
        return (
            <DocumentTitle title="绑卡认证">
                {component}
            </DocumentTitle>
        )
         ;
    }
}
