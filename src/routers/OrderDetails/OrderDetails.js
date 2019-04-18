import React, {Component} from 'react'
import DocumentTitle from 'react-document-title'
import {Toast} from 'antd-mobile'
import {getQueryString, requstObeject, redirect, getLocal, setUrl} from "../../util/util";
import GoBack from '../../components/GoBack'
import NetUtils from '../../components/common/NetUtils';
import './OrderDetails.less'

export default class Home extends Component {
    state = {
        orderId: '',
        status: '待还款',
        price: 1010,
        goods: [],  //商品详情
        orderDetails: {},  //订单详情
        alipayInfo: {}, //支付宝信息
        showLogistics: true,  //是否有查看物流按钮
        refundButton: false,  //是否有马上还款按钮
        showAlipayInfo: false,  //支付宝信息切换
        overdue: false,  //是否显示逾期信息
        payFor: false,  //确认支付弹窗
        isRepaying: false,  //是否还款处理中
        showCardNo: false,  //是否显示扣款银行卡
        cardWord: '收款银行卡'
    }


    //复制
    copy = () => {
        let copyDOM = document.querySelector('#alipayId');
        let range = document.createRange();
        range.selectNode(copyDOM);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        let successful = document.execCommand('copy');
        try {
            // Now that we've selected the anchor text, execute the copy command
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copy email command was ' + msg);
        } catch (err) {
            console.log('Oops, unable to copy');
        }
        // Remove the selections - NOTE: Should use
        // removeRange(range) when it is supported
        window.getSelection().removeAllRanges();

    }

    //支付宝弹窗控制
    showAlipayInfo = () => {
        if (!this.state.showAlipayInfo) {
            let params = requstObeject()
            NetUtils.fetchRequest('/api/h5/rest/GET_ALIPAY_ACCOUNT', params).then(res => {
                if (res.resultCode === 1000) {
                    this.setState({
                        alipayInfo: JSON.parse(res.resultData),
                        showAlipayInfo: !this.state.showAlipayInfo
                    })
                }
            })
        } else {
            this.setState({
                showAlipayInfo: !this.state.showAlipayInfo
            })
        }
    }

    //确认支付弹窗
    showPayFor = () => {
        let payFor = this.state.payFor
        this.setState({
            payFor: !payFor
        })
        !payFor ? document.querySelector('body').classList.add('noScroll') : document.querySelector('body').classList.remove('noScroll')
    }

    //确认还款
    refund = () => {
        let params = requstObeject();
        let token = getLocal('token')
        let url = getLocal('url')
        params.serviceData = JSON.stringify({orderId: this.state.orderId})
        NetUtils.fetchRequest('/api/h5/rest/ACTIVE_REPAY', params).then(res => {

            this.setState({
                payFor: !this.state.payFor
            })
            document.querySelector('body').classList.remove('noScroll')
            this.getOrderDetails()

        })
    }

    //获取订单详情
    getOrderDetails = () => {
        let params = requstObeject();
        params.serviceData = JSON.stringify({orderId: this.state.orderId})
        NetUtils.fetchRequest('/api/h5/rest/ORDER_GETORDERDETAILBYID', params).then(res => {
            if (res.resultCode === 1000) {
                this.setState({
                    orderDetails: JSON.parse(res.resultData).order,
                    goods: JSON.parse(res.resultData).goods,
                    isRepaying: JSON.parse(res.resultData).order.isRepaying !== '0'
                }, () => {
                    let status = this.state.orderDetails.statusStr;
                    status === '已逾期' ||
                    status === '已还款' ?
                        this.setState({overdue: true}) :
                        this.setState({overdue: false})
                    status === '审核中' ||
                    status === '审核失败' ||
                    status === '放款失败' ||
                    status === '放款中' ?
                        this.setState({showLogistics: false, cardWord: '收款银行卡'}) :
                        this.setState({showLogistics: true, cardWord: '扣款银行卡'})
                    status === '已逾期' ||
                    status === '待还款' ?
                        this.setState({refundButton: true}) :
                        this.setState({refundButton: false})
                    status === '审核中' ||
                    status === '审核失败' ?
                        this.setState({showCardNo: false}) :
                        this.setState({showCardNo: true})
                })
            }
        })
    }

    //刷新
    refresh = () => {
        let params = requstObeject();
        params.serviceData = JSON.stringify({orderId: this.state.orderId})
        NetUtils.fetchRequest('/api/h5/rest/ORDER_GETORDERDETAILBYID', params).then(res => {
            if (res.resultCode === 1000) {
                window.scroll(0, 0);
                Toast.success('已刷新', 1);

                this.setState({
                    orderDetails: JSON.parse(res.resultData).order,
                    goods: JSON.parse(res.resultData).goods,
                    isRepaying: JSON.parse(res.resultData).order.isRepaying !== '0'
                }, () => {
                    let status = this.state.orderDetails.statusStr;
                    status === '已逾期' ||
                    status === '已还款' ?
                        this.setState({overdue: true}) :
                        this.setState({overdue: false})
                    status === '审核中' ||
                    status === '审核失败' ||
                    status === '放款失败' ||
                    status === '放款中' ?
                        this.setState({showLogistics: false, cardWord: '收款银行卡'}) :
                        this.setState({showLogistics: true, cardWord: '扣款银行卡'})
                    status === '已逾期' ||
                    status === '待还款' ?
                        this.setState({refundButton: true}) :
                        this.setState({refundButton: false})
                    status === '审核中' ||
                    status === '审核失败' ?
                        this.setState({showCardNo: false}) :
                        this.setState({showCardNo: true})
                })
            }
        })
    }

    componentWillMount() {


    }

    componentDidMount() {
        let id = getQueryString(this.props.history.location.search).orderId
        this.setState({
            orderId: id,
        }, () => {
            this.getOrderDetails()
        })


    }

    toLogistics = (id) => {
        setUrl(this)
        this.props.history.replace(`/logisticsdetails?orderGoodsIdStr=${id}`)
    }


    render() {
        let order = this.state.orderDetails;
        return (order ?
                <DocumentTitle title={'订单详情'}>
                    <div className={'container'}>
                        <GoBack who={this}/>
                        <div className={'orderStatus'}>
                            <span>订单状态</span>
                            <span className={'status'}>{order.statusStr}</span>
                        </div>
                        <div className={'loanDetails'}>
                            <span className={'title'}>借款详情</span>
                            <ul>
                                <li>
                                    <span className={'left'}>订单编号</span>
                                    <span className={'right'}>{order.orderNo}</span>
                                </li>
                                <li>
                                    <span className={'left'}>借款金额</span>
                                    <span className={'right'}>{order.principal ? order.principal.toFixed(2) : 0}元</span>
                                </li>
                                <li>
                                    <span className={'left'}>借款期限</span>
                                    <span className={'right'}>{order.period}天</span>
                                </li>
                                <li>
                                    <span className={'left'}>利息</span>
                                    <span className={'right'}>{order.interest ? order.interest.toFixed(2) : 0}元</span>
                                </li>
                                {
                                    !this.state.overdue ? null : <div>
                                        <li>
                                            <span className={'left'}>逾期天数</span>
                                            <span className={'right'}>{order.penaltyDay}天</span>
                                        </li>
                                        < li>
                                            < span className={'left'}> 逾期利息 </span>
                                            <span
                                                className={'right'}>{order.penalty ? order.penalty.toFixed(2) : 0}元</span>
                                        </li>
                                        <li>
                                            <span className={'left'}>逾期管理费</span>
                                            <span
                                                className={'right'}>{order.duePenaltyFee ? order.duePenaltyFee.toFixed(2) : 0}元</span>
                                        </li>
                                    </div>
                                }
                            </ul>
                        </div>
                        {
                            !this.state.showCardNo ? null :
                                <div>
                                    <div className={'bankCard'}>
                                        <ul>
                                            <li>
                                                <span className={'left'}>{this.state.cardWord}</span>
                                                <span className={'right'}>{order.cardNo}</span>
                                            </li>
                                            <li>
                                                <span className={'left'}>应还日期</span>
                                                <span className={'right'}>{order.dueTime}</span>
                                            </li>
                                            <li className={'sum'}>
                                                <span className={'left'}>应还金额</span>
                                                <span
                                                    className={'right'}>{order.repayAmount ? order.repayAmount.toFixed(2) : 0}元</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className={this.state.refundButton ? 'isMargin' : null}>
                                        {this.state.goods.map((item, index) => {
                                            return <div className={'goodsInfo'} key={index}>
                                                <div className={'info'}>
                                                    <img src={item.goodsImg} alt=""/>
                                                    <div className={'goods'}>
                                                        <p className={'goodsName'}>{item.goodsName}</p>
                                                        <p className={'goodsAttribute'}>{item.goodsSkuName}</p>
                                                        <p className={'price&count'}>
                                                            <span className={'goodsPrice'}>¥{item.goodsPrice}</span>
                                                            <span className={'count'}>x{item.goodsCount}</span>
                                                        </p>
                                                    </div>
                                                    <span className={'title'}>商品信息</span>
                                                </div>
                                                {this.state.showLogistics ?
                                                    <span className={'toLogistics'}
                                                          onClick={() => this.toLogistics(item.orderGoodsIdStr)}>查看物流</span> : null
                                                }
                                            </div>
                                        })}
                                    </div>
                                </div>
                        }
                        {
                            this.state.refundButton ? <div className={'refund'}>
                                <div className={'button'} id={this.state.isRepaying ? 'isRepaying' : null}>
                                    <div className={'leftButton'}
                                         onClick={!this.state.isRepaying ? () => this.showPayFor() : () => this.refresh()}>{!this.state.isRepaying ? '马上还款' : '查看还款进度'}</div>
                                    <div className={'rightButton'}
                                         onClick={!this.state.isRepaying ? () => this.showAlipayInfo() : null}/>
                                </div>
                            </div> : null
                        }

                        {
                            this.state.showAlipayInfo ? <div className={'mask'}>
                                <div className={'content'}>
                                    <ul>
                                        <li className={'title'}>支付宝信息</li>
                                        <li className={'alipayId'}>
                                            <span className={'left'}>支付宝账号</span>
                                            <span id={'alipayId'}
                                                  className={'right'}>{this.state.alipayInfo.alipayAccount}</span>
                                        </li>
                                        <li className={'copyId'} onClick={() => this.copy()}>复制账号</li>
                                        <li className={'name'}>
                                            <span className={'left'}>账户名</span>
                                            <span className={'right'}>{this.state.alipayInfo.alipayUserName}</span>
                                        </li>
                                        <li className={'hint'}>温馨提示</li>
                                        <li className={'hintInfo'}> 如您需要支付宝转账，请备注：<span>姓名+注册手机</span>。客服收到转账后会为您及时处理订单信息。
                                        </li>
                                    </ul>
                                    <button className={'iKnow'} onClick={() => this.showAlipayInfo()}>我知道了</button>
                                </div>
                            </div> : null
                        }
                        {
                            this.state.payFor ? <div className={'mask'}>
                                <div className={'payFor'}>
                                    <h4 className={'title'}>支付确认</h4>
                                    <p className={'price'}>是否支付<span>{order.repayAmount.toFixed(2)}</span>元</p>
                                    <div className={'cancel'} onClick={() => this.showPayFor()}>取消</div>
                                    <div className={'ok'} onClick={() => this.refund()}>确认</div>
                                </div>
                            </div> : null
                        }
                    </div>
                </DocumentTitle> : null
        )
    }
}
