import React, { Component } from 'react'
import DocumentTitle from 'react-document-title'
import NetUtils from '../../components/common/NetUtils';
import {getQueryString, requstObeject } from "../../util/util";
import {resultConfig} from '../../components/BankConfig';
import Result from './Result';


export default class Operator extends Component {
    constructor(props){
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
            resultMsg: {}, // 认证结果信息
            start:false, // 是否开启定时器
        }
    }
    componentDidMount(){
        this.getOperatorStatus();
    }
    componentWillUnmount() {
        if(this.timer){
            clearInterval(this.timer);
        }
    }
    // 获取运营商认证结果
    getOperatorStatus = () =>　{
        const params = requstObeject();
        NetUtils.fetchRequest('/api/h5/rest/GETUSEROPERATORSTATUS', params).then(rep => {
            if (rep.resultCode === 1000) {
                const { operatorStatus } = JSON.parse(rep.resultData) || {};
                this.getResultByStatus(operatorStatus);
            }
        });
    }
    //根据状态码和 url中是否携带endAuth决定最终呈现页面和描述
    getResultByStatus = (status) => {
        const url = window.location.href;
        const { endAuth } = getQueryString(url);
        let code = status;
        if(status === '20'){
            this.setState({start:true},()=>{
                if(!this.timer){
                    this.timer = setInterval(() => {
                        this.getOperatorStatus();
                      }, 30000);
                }
            })
        }else if(this.timer){
            this.setState({start:false},()=>{clearInterval(this.timer);});
        }
        if(endAuth === '1' && status === '30'){
                code ='60';
        }
        if(endAuth !== '1' && status === '50'){
            code ='10'
        }
        const resultMsg = resultConfig.find(item => item.statusCode === code);
        if(resultMsg){
            this.setState({resultMsg})
        }
    }
    render() {
        const {resultMsg} = this.state;
        return (
           <DocumentTitle title="运营商认证">
               { Object.keys(resultMsg).length !==0  ? <Result resultMsg={resultMsg}></Result> : null}
           </DocumentTitle>
        )
    }
}
