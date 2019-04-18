import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router-dom'
import DocumentTitle from 'react-document-title'
import IScroll from 'better-scroll'
import { PullToRefresh, ListView } from 'antd-mobile'
import { requstObeject, addClass, deleteClass, getQueryString, setLocal, setUrl, reverse, getLocal } from '../../util/util'
import MiniCart from '../MiniCart/MiniCart'
import NotifyModal from '../../components/NotifyModal/NotifyModal'
import NetUtils from '../../components/common/NetUtils';
import './Products.less'


class Products extends Component {
    constructor(props) {
        super(props)
        const dataSource = new ListView.DataSource({  //这个dataSource有cloneWithRows方法
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.state = {
            //产品列表
            list: [
            ],
            isRepeat: 1,//
            cartInfo: null, //购物车信息
            currentPage: 1, //当前页面
            refresh: false,
            height: document.documentElement.clientHeight,//当前页面高度
            useBodyScroll: false,
            dataSource,
            haveGoods: true,//是否还有商品
            sort: 1,
            pageSize: 10,
            isLoad: true,
            loadText: '',
            loading: false,
            notify: false,
            messageContent:""
        }
    }
    //获取购物车信息
    cartInfo = () => {
        let params = {
            ...requstObeject()
        }
        NetUtils.fetchRequest('/api/h5/rest/ORDERGOODS_GETSHOPPINGCART', params).then(res => {
            if (res.resultCode === 1000) {
                let data = JSON.parse(res.resultData)
                this.setState({
                    cartInfo: data
                })
            }
        })
    }
    //获取商品
    getGoods = () => {
        let { currentPage, sort, pageSize } = this.state
        let request = requstObeject()
        let serviceData = JSON.stringify({
            currentPage,
            pageSize,
            sort
        })
        let params = {
            ...request,
            serviceData
        }
        NetUtils.fetchRequest('/api/h5/rest/GOODS_LIST', params).then(res => {
            let { list, refresh } = this.state
            let isLoad;
            if (res.resultCode === 1000) {
                if (refresh) {
                    this.setState({
                        refresh: false
                    })
                }
                let data = JSON.parse(res.resultData).data
                if (!data.length) {
                    this.setState({
                        haveGoods: false
                    })
                } else {
                    this.setState({
                        haveGoods: true
                    })
                }
                if (data.length < 10) {
                    isLoad = false
                } else {
                    isLoad = true
                }
                this.setState({
                    list: [...list, ...data],
                    loading: false,
                    isLoad
                }, () => {
                    setTimeout(() => {
                        this.myscroll.finishPullUp()
                        this.myscroll.refresh();
                    }, 0)
                })
            }
        })
    }
    shopverify = () => {
        NetUtils.fetchRequest('/api/h5/rest/GET_SHOPPING_AUTHSTATUS', { ...requstObeject() }).then(res => {
            if (res.resultCode === 1000) {
                let data = JSON.parse(res.resultData)
                if (data.isShoppingAuth) {
                    this.props.history.replace('/successverify')
                }
            }
        })
    }
    getNotify = () => {
        NetUtils.fetchRequest(`/api/h5/rest/GET_LATEST_MESSAGE_LIST`,{...requstObeject()}).then(res => {
            if(res.resultCode === 1000){
              let a =   getLocal('isStoreShow')
              let data = res.resultData
              if(!a){
                  setLocal('isStoreShow', data)
                let notify = JSON.parse(res.resultData)
                if(notify.storeShow){
                    this.setState({
                        notify:true,
                        messageContent:notify.storeShow.messageContent
                    })
                }
              }
            }
        })
    }
    componentWillMount() {
        let url = window.location.href
        let obj = getQueryString(url)
        let token = obj.token;
        let return_url = obj['return_url']
        if (token) {
            setLocal('token', token)
        }
        if (return_url) {
            setLocal('url', return_url)
        }
        this.shopverify()

    }
    componentDidMount() {
        const { isLoad } = this.state
        let option = {
            click: true,
            probeType: 2,
            bounce: true,
            pullUpLoad: true
        }
        this.getNotify()
        this.refs.sildeWrap.style.height = document.documentElement.clientHeight - this.refs.listHead.offsetHeight - this.refs.minicart.refs.MiniCart.offsetHeight + 'px';
        this.myscroll = new IScroll(this.refs.sildeWrap, option)
        this.myscroll.on('pullingUp', () => {
            if (this.state.isLoad) {
                let currentPage = this.state.currentPage + 1
                this.setState({
                    loading: true,
                    loadText: '正在加载商品...',
                    currentPage
                }, () => {
                    this.myscroll.refresh()
                    this.getGoods()
                })
            } else {
                this.setState({
                    loading: true,
                    loadText: '已显示所有商品'
                }, () => {
                    this.myscroll.on('scrollEnd', () => {
                        this.setState({
                            loading: false,
                            loadText: ''
                        })
                        this.myscroll.finishPullUp()
                    })
                })
            }
        })
        this.getGoods()
        this.cartInfo()
    }
    componentDidUpdate() {
    }
    componentWillUnmount() {
        document.body.style.overflow = 'auto'
    }
    //获取默认商品列表
    defaultProduct = (sort, event) => {
        if (event) {
            event.persist();
        }
        const currentTarget = event.target
        //切换点击样式
        const tabsNode = document.querySelectorAll('.tab')
        deleteClass(tabsNode[sort], 'default-active')
        addClass(currentTarget, 'default-active')
        this.setState({
            sort: sort,
            list: [],
            currentPage: 1,
            dataSource: this.state.dataSource.cloneWithRows([])
        }, function () {
            this.getGoods()
        })
    }
    //更新购物车信息

    goProductDetail = (e, id, skuModel) => {
        e.persist()
        e.preventDefault();
        e.stopPropagation()
        const { match } = this.props
        let isModal;
        setUrl(this)
        isModal = skuModel ? true : false
        this.props.history.replace({ pathname: `${match.url}/${id}`, query: { skuModel: isModal } })
    }
    //关闭通知
    closeNotify = () => {
        this.setState({
            notify:false
        })
    }
    render() {
        const { match } = this.props
        const { list,loadText,loading ,cartInfo, notify, messageContent} = this.state
        let index = list.length - 1; //产品列表下标
        const listItem = list.map(item => {
            return (<div key={item.id} onClick={(e) => { this.goProductDetail(e, item.id) }} >
                <div className={'products-list'}>
                    <div className={'image-wrap'}>
                        <img src={item.imgUrl} alt={item.goodsName} />
                    </div>
                    <div className={'products-info'}>
                        <p className={'products-name'}>{item.goodsName}</p>
                        <p className={'products-price-wrap'}><span>￥</span><em>{item.tradingValue}</em><i>(放款时扣除)</i></p>
                    </div>
                    <div onClick={cartInfo && item.tradingValue > cartInfo.shortMoney ? (e) => { e.stopPropagation() } : (e) => { this.goProductDetail(e, item.id, true) }} className={`products-btn ${cartInfo && item.tradingValue > cartInfo.shortMoney ? 'full-money' : 'add'}`}>
                    </div>
                </div>
            </div>)
        })
        return (
            <DocumentTitle title='购物认证'>
                <div>
                    <div ref="listHead" className={'products-nav-wrap'}>
                        <div className={'tab default-active'} onClick={(e) => { this.defaultProduct(1, e) }}>
                            默认
                    </div>
                        <div className={'tab'} onClick={(e) => { this.defaultProduct(0, e) }}>
                            销量
                    </div>
                    </div>
                    <div ref="sildeWrap" className={'products-list-wrap'}>
                        <div>
                            {
                                listItem
                            }
                            {loading ? <div className={'loading'}>{loadText}</div> : null}
                        </div>
                    </div>
                    <NotifyModal
                        title="通知"
                        visible={notify}
                        onClose={this.closeNotify}
                        messageContent = {messageContent}
                    >
                    </NotifyModal>
                    <MiniCart ref="minicart" updateProducts={this.defaultProduct} updateCartInfo={this.cartInfo} {...this.props} />    
                </div>
            </DocumentTitle>
        )
    }
}

export default Products