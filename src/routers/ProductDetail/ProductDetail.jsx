import React, { Component } from 'react'
import { Carousel, Modal, Icon, Toast } from 'antd-mobile'
import GoBack from '../../components/GoBack'
import DocumentTitle from 'react-document-title'

import NetUtils from '../../components/common/NetUtils'
import { requstObeject, addClass, deleteClass, setUrl, setLocal, hasClass } from '../../util/util'

import './ProductDetail.less'
const alert = Modal.alert
class ProductDetail extends Component {
    state = {
        goodsInfo: null,//商品信息
        imgHeight: 176,//轮播图高度
        index: 1,
        show: true, //skuModal
        currentInventory: 0,//库存
        currentSku: null,//选择SKU
        buyGoods: {},//购买的商品信息
        skuIndex: 0,//SKU的下标
        canBuy: true,//是否可以购买
        editor: null, //富文本DOM
        inventoryStatus: true, //判断商家库存是否充足,
        update:0,
        cartInfo:null, //购物车信息
        joinCartButton: null, //加入购物车的按钮
        cartGoods: null //从购物车列表进来的
    }
    goodsInfo = async () =>{
        let goodsId = +this.props.match.params.id
        let serviceData = JSON.stringify({ goodsId })
        let request = requstObeject()
        let params = {
            ...request,
            serviceData
        }
        let goodsInfo = await NetUtils.fetchRequest('/api/h5/rest/GOODS_INFO', params);
        let cartInfo = await NetUtils.fetchRequest('/api/h5/rest/ORDERGOODS_GETSHOPPINGCART', {...requstObeject()})
        return {goodsInfo, cartInfo}
    }
    componentWillMount() {
        let show = this.props.location.query?this.props.location.query.skuModel:false
        let cartGoods = this.props.location.query?this.props.location.query.buyGoods:null;
        this.setState({
            show,
            cartGoods
        })

        //判断商品是否超额
        this.goodsInfo().then(res => {
            let {goodsInfo, cartInfo} = res
            let {show, cartGoods} = this.state
            if(goodsInfo.resultCode=== 1000){
                let data = JSON.parse(goodsInfo.resultData)
                if (data.goodsSkus.length) {
                    let firstGoodsInfo = data.goodsSkus[0] //motaikuan
                    if(!show){
                        if(!cartGoods){
                            let buyGoods = {
                                goodId: null,
                                skuId: null,
                            }
                            this.setState({
                                goodsInfo:data,
                                buyGoods,
                                skuIndex:firstGoodsInfo.id,
                                currentInventory: firstGoodsInfo.inventory,
                                joinCartButton: this.joinCart()
                            })
                        }else{
                            let buyGoods = {
                                goodId: cartGoods.goodsId,
                                skuId: cartGoods.skuId
                            }
                            this.setState({
                                goodsInfo:data,
                                buyGoods,
                                skuIndex:cartGoods.skuId,
                                currentSku:cartGoods.currentSku,
                                currentInventory: firstGoodsInfo.inventory,
                                joinCartButton: this.joinCart()
                            })
                        }
                    }else{
                        let buyGoods = {
                            goodId: firstGoodsInfo.goodsId,
                            skuId: firstGoodsInfo.id,
                        }
                        this.setState({
                            goodsInfo:data,
                            buyGoods,
                            skuIndex:firstGoodsInfo.id ,
                            currentSku:firstGoodsInfo.skuName,
                            currentInventory: firstGoodsInfo.inventory,
                            joinCartButton: this.joinCart()
                        })
                    }
                   
                }else{
                    this.setState({
                        canBuy:false,
                        inventoryStatus:false,
                        goodsInfo:data,
                        joinCartButton:this.stockout()
                    })
                }
                this.createFrame(data.goodsInfoUrl)
            }
            if(cartInfo.resultCode === 1000){
                let data = JSON.parse(cartInfo.resultData)
                this.setState({
                    cartInfo:data
                })
            }
            if(cartInfo.resultCode === 1000 && goodsInfo.resultCode=== 1000){
               const {cartInfo, goodsInfo} = this.state
               let price = goodsInfo.goods.tradingValue
               let shortMoney = cartInfo.shortMoney
               let canBuy = price> shortMoney? false: true
                this.setState({
                    canBuy
                })
            }
        })
    }
    //轮播图下标
    slide = (index) => {
        index++
        this.setState({
            index
        })
    }
    //操作SKUModal
    showSpec = (key) => {
        if(!this.state.inventoryStatus){
            return
        }
        let {cartGoods,show, goodsInfo,buyGoods,currentSku} = this.state
        if(!show&&!cartGoods&&currentSku===null){
            
            let buyGoodsInfo = {
                goodId: goodsInfo.goodsSkus[0].goodsId,
                skuId: goodsInfo.goodsSkus[0].id
            }
            this.setState({
                buyGoods:{...buyGoodsInfo},
                currentSku:goodsInfo.goodsSkus[0].skuName,
                skuIndex: goodsInfo.goodsSkus[0].id
            })
        }
        this.setState({
            [key]: true
        })
    }
    //闪电发货modal
    hint = () => {
        alert(<div className={'hint-title'}>温馨提示</div>, <div className={'hint-content'}>我们承诺72小时内发货</div>, [
            {
                text: '确定',
                onPress: () =>
                    new Promise((resolve) => {
                        setTimeout(resolve, 0);
                    }),
                style: {
                    fontFamily: 'PingFang-SC-Medium',
                    color: '#677DF5',
                    fontSize: '36px',
                    height: '80px',
                    lineHeight: '80px'
                }
            },
        ])
    }
    onClose = (key) => {
        this.setState({
            [key]: false
        })
    }
    //添加商品
    addGoods = () => {
        let { buyGoods } = this.state

        if(buyGoods.skuId === null){
            Toast.info('请选择商品属性',1)
            return
        }
        let serviceData = JSON.stringify({
            ...buyGoods,
            isAdd: true
        })
        let params = {
            ...requstObeject(),
            serviceData,
        }
        NetUtils.fetchRequest('/api/h5/rest/ORDERGOODS_MODIFYSHOPPINGCART', params).then(res => {
            if(res.resultCode===1109){
                Toast.info('此商品已下架',1)
               setTimeout(()=>{
                setUrl(this)
                this.props.history.replace('/products')
               },1000)
            }
            if (res.resultCode === 1000) {
                setUrl(this)
                this.props.history.replace('/products')
            }
        })
    }
    //选择SKU
    chooseSku = (e, goods) => {
        e.persist()
        const { buyGoods } = this.state
        let ddNodes = document.querySelectorAll('.sku-spec')
        
        for(let i=0; i<ddNodes.length;i++){
            if(hasClass(ddNodes[i],'active-spec')){
                deleteClass(ddNodes[i], 'active-spec')
            }
        }
        addClass(e.currentTarget, 'active-spec')
        let buyGoodsInfo = {
            ...buyGoods,
            goodId: goods.goodsId,
            skuId:goods.id
        }
        this.setState({
            currentInventory: goods.inventory,
            skuIndex: goods.id,
            buyGoods: buyGoodsInfo,
            currentSku: goods.skuName,
            show:false
        })

    }
    //轮播图DOM
    slideshow = () => {
        if (!this.state.goodsInfo) {
            return
        }
        let index = this.state.index
        let { imgs } = this.state.goodsInfo
        const count = imgs.length
        return (
            <div className={'slide-wrap'}>
                <Carousel
                    autoplay={false}
                    infinite
                    afterChange={this.slide}
                    dots={false}
                >
                    {imgs.map(val => (
                        <a
                            key={val}
                            className={'img-wrap'}
                        >
                            <img
                                src={val}
                                alt=""
                                style={{ width: 'auto', maxWidth: '100%', height: 'auto', maxHeight: '100%', verticalAlign: 'top' }}
                                onLoad={() => {
                                    window.dispatchEvent(new Event('resize'));
                                    this.setState({ imgHeight: '750px' });
                                }}
                            />
                        </a>
                    ))}
                </Carousel>
                <div className={'record'}>
                    {`${index}/${count}`}
                </div>
            </div>
        )
    }

    goodsHeader = () => {
        let { goods } = this.state.goodsInfo
        return (
            <div>
                <p className={'product-name'}>
                    {goods.goodsName}
                </p>
                <p className={'product-price'}>￥{goods.tradingValue}</p>
            </div>
        )
    }
    //skuDOM
    skuModal = () => {
        let { show, goodsInfo, currentInventory,skuIndex,cartGoods} = this.state;
            var list = goodsInfo.goodsSkus.map((goods, index) => (
                <dd key={goods.id} onClick={e => this.chooseSku(e, goods)} className={`sku-spec ${goods.id === skuIndex ? 'active-spec' : ''}`}>{goods.skuName}</dd>
            ))
        return (<Modal
            popup
            visible={show}
            animationType='slide-up'
            onClose={() => { this.onClose('show') }}
            className={'modal'}
        >
            <div className={'sku-wrap'}>
                <div className={'sku-header'}>
                    <div className={'product-avatar-wrap'}>
                        <img className={'product-avatar'} src={goodsInfo.imgs[0]} alt="" />
                    </div>
                    <div className={'detail-info'}>
                        <div className={'product-title'}>
                            <p className={'product-price'}>￥{goodsInfo.goods.tradingValue}</p>
                            <p className={'stock'}>库存{currentInventory}件</p>
                        </div>
                        <div onClick={() => { this.onClose('show') }} className={'spec-close'}>
                            {/* <Icon type="cross" size="lg" color="#999" /> */}
                            <div className={'modal-colse'}></div>
                        </div>
                    </div>
                </div>
                <div>
                    <dl className={'spec-list'}>
                        <dt>属性</dt>
                        {list}
                    </dl>
                </div>
                {
                    this.joinCart()
                }
            </div>
        </Modal>)
    }
    //加入购物车DOM
    joinCart = () => {
        const { canBuy } = this.state
        return canBuy === true ? (<div onClick={this.addGoods} className={'join-cart join'}>
            加入购物车
                </div>) : (<div className={'join-cart over-age'}>
                超出额度
                </div>)

    }
    
    createFrame = (url) => {
        if (this.state.editor) {
            return
        }
        // let urlHeader = /http:\/\/[^\/]*\/+/.exec(url)[0]
        // let newUrl = url.split(urlHeader)[1]
        fetch(url, {
            header: {
                'Accept': 'text/plain'
            },
            // mode: "cors"
        }).then(data => data.text()).then(res => {
            this.setState({
                editor: res
            })
        })
        .catch(e => {
            console.log(e)
        })
    }
    stockout = () => {
        return (
            <div className={'join-cart over-age'}>
                库存不足
                </div>
        )
    }
    render() {
        const { currentSku,inventoryStatus,joinCartButton, goodsInfo, editor } = this.state
        return (
            <DocumentTitle title="购物认证">
                <div className={'product-detail'}>
                    <GoBack who={this} />
                    {this.slideshow()}
                    <div className={'product-info-wrap'}>
                        <div className={'bg-white'}>
                            {goodsInfo ? this.goodsHeader() : null}
                            <div onClick={this.hint} className={'speed-consignment'}>
                                <div className={'flex-left'}>
                                    <i className={'speed-icon'}></i>
                                    <span className={'speed-consignment-font'}>闪电发货</span>
                                </div>
                                <i className={'arrow-right'}></i>
                            </div>
                        </div>
                        <div className={'bg-white'}>
                            <div className={'spec'} onClick={() => { this.showSpec('show') }}>
                                <div className='flex-left'><span>已选</span><p>{currentSku?currentSku:'请选择商品属性'}</p></div>
                                <i className={'arrow-right'}></i>
                            </div>
                        </div>
                        <div className={'bg-white'}>
                            <div className={'product-info'}>
                                商品信息
                            </div>
                            <div ref='infoWrap' className={'detail-info'} >
                                <div dangerouslySetInnerHTML={{ __html: editor ? editor : '' }}></div>
                            </div>
                        </div>
                    </div>
                    {inventoryStatus? this.joinCart():this.stockout()}
                    {goodsInfo && inventoryStatus ? this.skuModal() : null}
                </div>
            </DocumentTitle>
        )
    }
}

export default ProductDetail