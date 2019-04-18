import React, {Component} from 'react'
import DocumentTitle from 'react-document-title'
import GoBack from '../../components/GoBack'
import {getQueryString, requstObeject} from "../../util/util";
import './LogisticsDetails.less'
import NetUtils from "../../components/common/NetUtils";

export default class LogisticsDetails extends Component {
    state = {
        status: '',
        item: {},
        serviceTel: ''
    }

    componentDidMount() {
        this.getLogisticsInfo();
        let params = requstObeject();
        NetUtils.fetchRequest('/api/h5/rest/GET_SERVICE_HOTLINE', params).then(res => {
            if (res.resultCode === 1000) {
                this.setState({
                    serviceTel:JSON.parse(res.resultData).serviceHotline
                })
            }
        })
    }

    //获取物流信息
    getLogisticsInfo = () => {
        let id = getQueryString(this.props.history.location.search).orderGoodsIdStr;
        let params = requstObeject();
        params.serviceData = JSON.stringify({orderGoodsIdStr: id});
        NetUtils.fetchRequest('/api/h5/rest/ORDERGOODS_GOODSDETAIL', params).then(res => {
            if (res.resultCode === 1000) {
                this.setState({
                    item: JSON.parse(res.resultData).orderGoodsDetail,
                    status: JSON.parse(res.resultData).orderGoodsDetail.transportStatusStr
                })
            }
        })
    }
    //确认收货
    received = () => {
        let id = getQueryString(this.props.history.location.search).orderGoodsIdStr;
        let params = requstObeject();
        params.serviceData = JSON.stringify({orderGoodsIdStr: id});
        NetUtils.fetchRequest('/api/h5/rest/ORDERGOODS_UPDATETRANSPORT', params).then(res => {
            if (res.resultCode === 1000) {
                this.getLogisticsInfo()
            }
        })
    }

    render() {
        let item = this.state.item
        return (
            <DocumentTitle title={'物流详情'}>
            <div className={'logistics'}>
                <GoBack who={this}/>
                <div className={'goodsInfo'}>
                    <div className={'info'}>
                    <img src={item.goodImgUrl} alt=""/>
                    <div className={'goods'}>
                        <p className={'goodsName'}>{item.goodsName}</p>
                        <p className={'goodsAttribute'}>{item.goodSkuName}</p>
                        <p className={'price&count'}>
                            <span className={'goodsPrice'}>¥{item.goodsPrice}</span>
                            <span className={'count'}>x{item.goodsCount}</span>
                        </p>
                        <div className={'toLogistics'}>{this.state.status}</div>
                    </div>
                    <span className={'title'}>商品信息</span>
                    </div>
                </div>
                <div className={'loanDetails'}>
                    <span className={'title'}>物流信息</span>
                    <ul>
                        <li>
                            <span className={'left'}>下单时间</span>
                            <span className={'right'}>{item.createTime}</span>
                        </li>
                        <li>
                            <span className={'left'}>快递公司</span>
                            <span className={'right'}>{item.transportCom}</span>
                        </li>
                        <li>
                            <span className={'left'}>快递单号</span>
                            <span className={'right'}>{item.transportNo}</span>
                        </li>
                        <li>
                            <span className={'left'}>收货人</span>
                            <span className={'right'}>{item.addressName}</span>
                        </li>
                        <li>
                            <span className={'left'}>收货地址</span>
                            <span className={'right'}>{item.address}</span>
                        </li>

                    </ul>
                </div>
                <div className={'loanDetails callPhone'}
                     id={this.state.refundButton?'isMargin':null}>
                    <span className={'title'}>物流信息</span>
                    <p className={'hint'}>如果收货时有商品的损坏，请联系客服沟通退货</p>
                    <a href={`tel:${this.state.serviceTel}`} className={'call'}>点击联系客服</a>
                </div>
                {
                    this.state.status === '待收货' ? <div className={'action'}>
                        <div className={'edit'} onClick={() => this.received()}>确认收货</div>
                    </div> : null
                }
            </div>
            </DocumentTitle>
        )
    }
}
