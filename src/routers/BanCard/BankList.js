import React, { Component } from 'react';
import { List } from 'antd-mobile';
import {requstObeject } from "../../util/util";
import NetUtils from '../../components/common/NetUtils';
import BankListItem from './BankListItem';

export default class BankList extends Component {
    state = {
        bankList: [],
    }
    componentDidMount(){
        const request = requstObeject()
        NetUtils.fetchRequest('/api/h5/rest/FUION_SUPPORT_BANK_LIST', request).then(rep => {
           const {list} = JSON.parse(rep.resultData) || {};
           this.getBankList(list);
        })
    }
    renderHeader = () => {
        return (
            <div onClick={this.props.goBack}>返回上一页</div>
        )
    }
    getBankList = (list = []) => {
        const bankImages = {
            '中国银行': 'China',
            '中国农业银行': 'ABC',
            '中国建设银行': 'build',
            '中国工商银行': 'ICBC',
            '招商银行': 'zhaoshang',
            '交通银行': 'jiaotong',
            '兴业银行': 'Xingye',
            '光大银行': 'Everbright',
            '中信银行': 'CITIC',
            '华夏银行':'huaxia',
            '广东发展银行': 'guangfa',
            '上海浦东发展银行': 'SPD',
            '中国邮政储蓄银行': 'youzheng',
            '中国民生银行': 'minsheng',
            '平安银行': 'pingan',
        };
        const bankList = [];
        list.forEach(item =>{
          bankList.push({
            bankIcon:bankImages[item.bank],
            bankName:item.bank,
            bankCode:item.code
          })
        })
        this.setState({bankList});
    }
    render() {
        const {bankList} = this.state;
        return (
            <div className='bank-list'>
                {this.props.hideHeader ?
                    <List>
                        <BankListItem data={bankList} onBankSelected={(item)=>{this.props.onBankSelected(item)}}></BankListItem>
                    </List> :
                    <List renderHeader={this.renderHeader}>
                        <BankListItem data={bankList} ></BankListItem>
                    </List>
                }
            </div>
        )
    }
}
