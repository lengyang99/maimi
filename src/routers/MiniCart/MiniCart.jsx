import React, { Component } from 'react'

import { Modal,Toast } from 'antd-mobile'
import NetUtils from '../../components/common/NetUtils'
import { requstObeject, setUrl } from '../../util/util'
import './MiniCart.less'


class MiniCart extends Component {
    constructor(props) {
        super(props)
        this.state = {
            show: false,
            shoppingCartInfo: {}, //商品信息

        }
    }
    componentWillMount() {
        this.cartInfo()
    }
    showActionSheet = () => {
        const show = !this.state.show
        this.setState({
            show
        })
    }
    onClose = () => {
        this.setState({
            show: false
        })
    }
    cartInfo = () => {
        let params = {
            ...requstObeject()
        }
        NetUtils.fetchRequest('/api/h5/rest/ORDERGOODS_GETSHOPPINGCART', params).then(res => {
            if (res.resultCode ===1000) {
                let data = JSON.parse(res.resultData)
                this.setState({
                    shoppingCartInfo: data
                })
            }
        })
    }

    changeCart = (goodsId, skuId, isAdd, event) => {
        let serviceData = JSON.stringify({
            goodId: goodsId,
            skuId,
            isAdd
        })
        let params = {
            ...requstObeject(),
            serviceData
        }
        NetUtils.fetchRequest('/api/h5/rest/ORDERGOODS_MODIFYSHOPPINGCART', params).then(res => {
            if(res.resultCode===1109){
                Toast.info('您有商品已下架,请重新选择',1)
                this.props.updateProducts(1)
                this.cartInfo()
            }
           if(res.resultCode===1000){
            this.cartInfo()
            this.props.updateCartInfo()
           }
        })
    }

    emptyCart = (event) => {
        NetUtils.fetchRequest('/api/h5/rest/ORDERGOODS_CLEANSHOPPINGCART', { ...requstObeject() }).then(res => {
            if(res.resultCode===1000){
                this.cartInfo()
                this.props.updateCartInfo()
            }
        })
    }
    cartSubmit = () => {
        let {shortMoney} = this.state.shoppingCartInfo
        if(shortMoney !==0){
            return
        }
        setUrl(this)
        this.props.history.replace('/order')
    }
    goProductDetail = (e,buyGoods) =>{
        e.preventDefault()
        setUrl(this)
        this.props.history.replace({pathname:`/products/${buyGoods.goodsId}`, query:{skuModel:false,buyGoods}})
      }
    cartList = () => {
        const { shoppingCartInfo } = this.state.shoppingCartInfo
        if (!shoppingCartInfo) {
            return
        }
        return shoppingCartInfo.map((item, index) => {
            let buyGoods = {
                goodsId:item.goodsId,
                skuId: item.goodsSkuId,
                currentSku: item.goodsSkuName
              }
            return (
                <div key={index} className={'products-list'}>
                    <div onClick={(e)=>{this.goProductDetail(e,buyGoods)}} className={'image-wrap'}>
                        <img src={item.goodsImg} alt={item.goodsName} />
                    </div>
                    <div className={'products-info'}>
                        <p onClick={(e)=>{this.goProductDetail(e,buyGoods)}} className={'products-name'}>{item.goodsName}</p>
                        <p className={'products-sku'}>{item.goodsSkuName}</p>
                        <p className={'products-price-wrap'}><span>￥</span><em>{item.goodsPrice}</em><i>(放款时扣除)</i></p>
                    </div>
                    <div className={'buy-count-operate'}>
                        <em className={'buy-decrease'} onClick={(e) => this.changeCart(item.goodsId, item.goodsSkuId, false, e)}></em> <span className={'buy-count'}>{item.count}</span><em onClick={(e) => this.changeCart(item.goodsId, item.goodsSkuId, true, e)} className={'buy-add'}></em>
                    </div>
                </div>
            )
        })
    }

    cartComponent = () => {
        let { shoppingCartInfo } = this.state
        if (JSON.stringify(shoppingCartInfo) === '{}') {
            shoppingCartInfo = {
                shortMoney: 0,
                shoppingCartMoney: 0
            }
        }
        return (
            <>
                <div onClick={this.showActionSheet} className={'minicart-btn'}>
                    {shoppingCartInfo.goodsCount ? <i className={`count-icon`}>{shoppingCartInfo.goodsCount}</i> : null}
                    <div className={`cart-icon ${shoppingCartInfo.shortMoney === shoppingCartInfo.shortMoney + shoppingCartInfo.shoppingCartMoney ? 'cart-icon-none' : 'cart-icon-you'}`}></div>
                </div>
                <div className={'total-price'}>
                    {shoppingCartInfo.shoppingCartMoney ? `已选商品总额：${shoppingCartInfo.shoppingCartMoney}元` : `请选择总价¥${shoppingCartInfo.shortMoney}元的商品`}
                </div>
                {shoppingCartInfo.shortMoney === 0 ?
                    <div onClick={(e) => { this.cartSubmit(e) }} className={`cart-submit buy`}>
                        确认下单
            </div> :
                    <div className={`cart-submit no-buy`}>
                        还差{shoppingCartInfo.shortMoney}元
                    </div>
                }
            </>
        )
    }
    render() {
        const { show, shoppingCartInfo } = this.state
        return (
            <div className={'cart'}>
                <div ref="MiniCart" className={'cart-wrap'}>
                    {shoppingCartInfo ? this.cartComponent() : null}
                </div>
                {shoppingCartInfo.goodsCount ? <Modal
                    popup
                    visible={show}
                    animationType='slide-up'
                    onClose={this.onClose}
                    className={'modal'}
                >
                    <div className={'cart-content'}>
                        <div className={'cart-list'}>
                            <div className={'list-header'}>
                                <p>购物车</p>
                                <div className={'empty-wrap'} onClick={(e) => { this.emptyCart(e) }}>
                                    <span className={'empty-icon'}></span>
                                    <span className={'empty'}>清空</span>
                                </div>
                            </div>
                            <div>
                                {shoppingCartInfo ? this.cartList() : null}
                            </div>
                        </div>
                    </div>
                </Modal> : null}
            </div>
        )
    }
}

export default MiniCart