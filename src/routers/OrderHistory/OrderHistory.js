import React, {Component} from 'react'
import {ActivityIndicator} from 'antd-mobile'
import DocumentTitle from 'react-document-title'
import {getQueryString, requstObeject, setLocal, setUrl} from "../../util/util";
import NetUtils from '../../components/common/NetUtils';
import './OrderHistory.less'

export default class OrderHistory extends Component {
    state = {
        isLoading: true,
        orders: [],
        button: '',
        showButton: true,
        animating: false
    }

    //跳转详情
    toOrderDetails = (s) => {
        setUrl(this)
        this.props.history.replace('/orderdetails?orderId=' + s)
    }


    componentWillMount() {


        let token = getQueryString(this.props.history.location.search).token

        let url = getQueryString(this.props.history.location.search)['return_url']
        if (token) {
            setLocal('token', token)
        }
        if (url) {
            setLocal('url', url)
        }
    }

    componentDidMount() {
        this.getOrders()
    }
    // componentWillMount() {
    //     this.getOrders()
    // }


    //获取订单
    getOrders = () => {
        this.setState({
            animating: true
        })
        let status,button,showButton;
        let params = requstObeject();
        NetUtils.fetchRequest('/api/h5/rest/ORDER_HISTORYORDER', params).then(res => {
            if (res.resultCode === 1000) {
                if(JSON.parse(res.resultData).length){
                    status = JSON.parse(res.resultData)[0].status
                    button = '查看进度'; showButton = true;
                    if (status === 6 || status === 7) {
                        button = '去还款'
                    }
                    if (status === 2 || status === 5 || status === 8) {
                        showButton = false
                    }
                }

                this.setState({
                    isLoading: false,
                    orders: JSON.parse(res.resultData),
                    button,
                    showButton,
                    animating: false
                }, () => {

                })
            }
        })
    }

    render() {
        return (
            <DocumentTitle title={'历史订单'}>
                <div className={'orderHistory'}>
                    {
                        this.state.isLoading ? null :
                        this.state.orders.length ?
                            this.state.orders.map((item, index) => {
                                return <div className={'order'} key={index}
                                            onClick={() => this.toOrderDetails(item.orderId)}>
                                    <ul>
                                        <li>
                                            <span className={'left'}>借款金额</span>
                                            <span className={'right'}>{item.principal}元</span>
                                        </li>
                                        <li>
                                            <span className={'left'}>借款期限</span>
                                            <span className={'right'}>{item.periodDay}天</span>
                                        </li>
                                        <li>
                                            <span className={'left'}>借款时间</span>
                                            <span className={'right'}>{item.order_time}</span>
                                        </li>
                                        <li>
                                            <span className={'left'}>借款状态</span>
                                            <span className={'right'}>{item.statusStr}</span>
                                        </li>
                                    </ul>
                                    {index == 0 && this.state.showButton ?
                                        <div className={'button'}>{this.state.button}</div>
                                        : null}
                                </div>
                            }) :
                            <div className={'noOrder'}>
                                <div className={'noOrderImg'}></div>
                                <h4>您还没有历史订单</h4>
                                <p>您的历史订单为空，您可以去借一笔款哦～</p>
                                <div className={'retry'} onClick={() => this.getOrders()}>刷新重试</div>
                                <ActivityIndicator
                                    toast
                                    text="Loading..."
                                    animating={this.state.animating}
                                />
                            </div>
                    }
                </div>
            </DocumentTitle>
        )
    }
}
