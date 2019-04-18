import React, { Component } from 'react'
import './Order.less'
import DocumentTitle  from 'react-document-title'
import NetUtils from '../../components/common/NetUtils'
import { requstObeject,getLocal,setUrl,redirect } from '../../util/util'
import {Toast} from 'antd-mobile'
import GoBack from '../../components/GoBack'
class Order extends Component {
    state = {
        defaultAddress: null, //默认地址信息
        shoppingCartInfo: null,
    }
    //进入地址选择页
    goShoppingAddress = () => {
        setUrl(this)
        this.props.history.replace('/shoppingaddress')
    
    }
    //首次添加地址
    goEditorAddress = () => {
        setUrl(this)
        this.props.history.replace('/editoraddress')
    }
    //购物车信息
    cartInfo = () => {
        let params = {
            ...requstObeject()
        }
        NetUtils.fetchRequest('/api/h5/rest/ORDERGOODS_GETSHOPPINGCART', params).then(res => {
            if (res.resultCode === 1000) {
                let data = JSON.parse(res.resultData)
                this.setState({
                    shoppingCartInfo: data
                })
            }
        })
    }
    //获取地址信息
    getAddressInfo = () => {
        NetUtils.fetchRequest('/api/h5/rest/GET_USER_ADDRESS', { ...requstObeject() }).then(res => {
            if (res.resultCode === 1000) {
                let data = JSON.parse(res.resultData)
                let defaultAddress = null
                data.map(item => {
                    if (item.isDefault === 1) {
                        defaultAddress = item
                    }
                })
                this.setState({
                    defaultAddress
                })
            }
        })
    }
    componentWillMount() {
        this.cartInfo()
        this.getAddressInfo()
    }
    //地址DOM
    addressStatus = () => {
        const { defaultAddress } = this.state
        if (defaultAddress) {
            return (
                <div onClick={() => { this.goShoppingAddress() }} className={'shipping-address'}>
                    <div >
                        <div className={'default-address-wrap'}>
                            <span className={'default-label'}>收货人</span>
                            <span className={'default-name'}>{defaultAddress.name}</span>
                            <span>{defaultAddress.phone}</span>
                        </div>
                        <div className={'default-address-info'}>
                            <span className={'default-label'}>收货地址</span>
                            <p className={'default-address'}>{`${defaultAddress.province}${defaultAddress.city}${defaultAddress.address}`}</p>
                        </div>
                    </div>
                    <span className={'arrow'}></span>
                </div>
            )
        } else {
            return (
                <div onClick={this.goEditorAddress} className={'shipping-address'}>
                    <div className={'add-address'}>添加收货地址</div>
                    <span className={'arrow'}></span>
                </div>
            )
        }
    }
    //商品列表DOM
    goodsList = () => {
        const { shoppingCartInfo } = this.state
        if(!shoppingCartInfo.shoppingCartInfo){
            return 
        }
        return shoppingCartInfo.shoppingCartInfo.map((item, index) => {
            return (
                <div key={index} className={'products-list'}>
                    <div className={'image-wrap'}>
                        <img src={item.goodsImg} alt={item.goodsName} />
                    </div>
                    <div className={'products-info'}>
                        <p className={'products-name'}>{item.goodsName}</p>
                        <p className={'products-sku'}><span>{item.goodsSkuName}</span> <span>数量：{item.count}</span></p>
                        <p className={'products-price-wrap'}><span>￥</span><em>{item.goodsPrice}</em><i>(放款时扣除)</i></p>
                    </div>
                </div>
            )
        })
    }
    //确认购物车
    verifyOrder = () => {
        if(!this.state.defaultAddress){
            Toast.info("请选择收货地址",1)
            return
        }
        let serviceData = JSON.stringify({
            addressId:this.state.defaultAddress.id
        })  
        let params = {
            ...requstObeject(),
            serviceData
        }
        NetUtils.fetchRequest('/api/h5/rest/SHOPPING_AUTH',params).then(res => {
            if(res.resultCode===1109){
                Toast.info('您购买的部分商品已下架,请重新选择',1)
                setTimeout(()=>{
                    this.props.history.replace('/products')
                },1000)
                return
            }
            if(res.resultCode===1000){
               let token = getLocal('token')
               let url = getLocal('url')
               redirect(token,2,url)
            }
        })
    }
    //确认下单DOM
    infoStatus = () => {
        const {defaultAddress} = this.state
        if(defaultAddress){
            return (
                <div onClick={this.verifyOrder} className={'order-submit-btn'}>
                    确认下单
                </div>
            )
        }else{
            return (
                <div onClick={this.verifyOrder} className={'order-submit-btn none'}>
                确认下单
            </div>
            )
        }
      
    }
    render() {
        const { shoppingCartInfo } = this.state
        return (
            <DocumentTitle title="购物认证">
                <div className={'order'}>
                    <GoBack who={this} />
                    {this.addressStatus()}
                    <div className={'goods-wrap'}>
                        <div className={'goods-label'}>
                            购物车
                        </div>
                        <div className={'order-goods'}>
                            {shoppingCartInfo && this.goodsList()}
                        </div>
                    </div>
                    <div className={'order-btn-wrap'}>
                        <p>已选商品总额：{shoppingCartInfo && shoppingCartInfo.shoppingCartMoney}元</p>
                        {this.infoStatus()}
                    </div>
                </div>
            </DocumentTitle>
        )
    }
}

export default Order