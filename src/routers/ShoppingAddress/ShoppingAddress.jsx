import React, { Component } from 'react'
import DocumentTitle from 'react-document-title'
import './ShoppingAddress.less'
import GoBack from '../../components/GoBack'
import NetUtils from '../../components/common/NetUtils'
import { requstObeject, setUrl } from '../../util/util'

class ShoppingAddress extends Component {
    state = {
        addressInfo: null,
        indexCheck: 0,
    }
    getAddressInfo = () => {
        NetUtils.fetchRequest('/api/h5/rest/GET_USER_ADDRESS', { ...requstObeject() }).then(res => {
            if (res.resultCode === 1000) {
                let data = JSON.parse(res.resultData)
                this.setState({
                    addressInfo: data
                })
            }

        })
    }
    componentDidMount() {
        this.getAddressInfo()
    }
    deleteAddress = (id) => {
        let serviceData = JSON.stringify({
            id
        })
        let params = {
            ...requstObeject(),
            serviceData
        }
        NetUtils.fetchRequest('/api/h5/rest/DELETE_USER_ADDRESS', params).then(res => {
            if (res.resultCode === 1000) {
                this.getAddressInfo()
            }
        })

    }
    setDefaultAddress = (id) => {
        let serviceData = JSON.stringify({
            id
        })
        let params = {
            ...requstObeject(),
            serviceData
        }
        NetUtils.fetchRequest('/api/h5/rest/DEFALT_USER_ADDRESS', params).then(res => {
            if(res.resultCode === 1000){
                setUrl(this)
                this.props.history.replace('/order')
            }
        })
    } 
    changeAddress = (address,e) => {
        e.stopPropagation()
        setUrl(this)
        this.props.history.replace({pathname:'/changeaddress',query:{address}})
    }
    addAddress = (e) => {
        e.stopPropagation()
        setUrl(this)
        this.props.history.replace('/editoraddress')
    }
    addressList = () => {
        const { addressInfo } = this.state
        return addressInfo.map((item, index) => {
            return (
                <div key={item.id} onClick={(e) => this.chooseAddress(item.id,e)} className={'address-content'}  style={{borderBottom: '1px solid #e5e5e5'}}>
                    <div><i className={`address-check ${item.isDefault ? 'active-check' : ''}`}></i></div>
                    <div>
                        <div className={'address-info'}>
                            <div className={'username'}>{item.name}</div>
                            <div className={'phone'}>{item.phone}</div>
                        </div>
                        <div className={'address-context'}>
                            {`${item.province}${item.city}${item.address}`}
                        </div>
                    </div>
                    <div>
                        <div className={'editor-address'} onClick={(e)=>{this.changeAddress(item,e)}}>编辑</div>
                        <div className={'delete-address'} onClick={(e) => { this.deleteAddress(item.id,e) }}>删除</div>
                    </div>
                </div>
            )
        })
    }
    chooseAddress = (id, e) => {
        e.persist()
        e.preventDefault()
        this.setDefaultAddress(id)

    }
    render() {
        const { addressInfo } = this.state
        return (
            <DocumentTitle title="购物认证">
                <div className={'address'}>
                    <GoBack who={this} />
                    <div className={'address-list'}>
                        {addressInfo && this.addressList()}
                    </div>
                    <div className={'btn-wrap'}>
                        <div onClick={this.addAddress} className={'address-btn'}>
                            添加收货地址
                        </div>
                    </div>
                </div>
            </DocumentTitle>
        )
    }
}
export default ShoppingAddress