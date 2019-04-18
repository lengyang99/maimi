import React, { Component } from 'react'
import DocumentTitle from 'react-document-title'
import './ChangeAddress.less'
import Modal from '../../components/Modal/index'
import GoBack from '../../components/GoBack'
import NetUtils from '../../components/common/NetUtils'
import { requstObeject, getLocal, setLocal, setUrl } from '../../util/util'
import { Toast } from 'antd-mobile';
class ChangeAddress extends Component {
    state = {
        visible: false,
        province: '请选择收货省份',
        title: '',
        provinceId: 0,
        addressBody: null,
        city: '',
        cityId: 0,
        addressInfo: null,
        oldAddress: null
    }
    autoHeight = (e) => {
        const elem = e.currentTarget
        elem.style.height = 'auto';
        elem.scrollTop = 0; //防抖动
        elem.style.height = elem.scrollHeight + 'px';
    }
    getPrivinceCity = (province) => {
        NetUtils.fetchRequest('/api/h5/rest/COMMON_PROVINCE', { ...requstObeject() }).then(res => {
            let addressInfo = JSON.parse(res.resultData)
            if (province) {
                addressInfo.map(item => {
                    if (item.name === province) {
                        this.setState({
                            provinceId: item.id,
                            cityId: 9999999
                        })
                    }
                })
            }
            this.setState({
                addressInfo
            })
        })
    }

    componentWillMount() {
        let oldAddress = (this.props.location.query && this.props.location.query.address) || JSON.parse(getLocal('mm-address'))
        setLocal('mm-address', oldAddress)
        this.getPrivinceCity(oldAddress.province)
        this.setState({
            oldAddress,
            province: oldAddress.province,
            city: oldAddress.city
        })
    }
    componentDidMount() {
        let { oldAddress } = this.state
        this.refs.name.value = oldAddress.name
        this.refs.phone.value = oldAddress.phone
        this.refs.detailAddress.value = oldAddress.address

    }
    chooseProvince = () => {
        const { addressInfo } = this.state
        let addressBody = addressInfo.map(province => {
            return <div onClick={(e) => { this.addProvince(e, province.id, province.name) }} className={'wp-modal-list'} key={province.id}>{province.name}</div>
        })
        this.setState({
            visible: true,
            title: '省份',
            addressBody
        })
    }
    chooseCity = () => {
        const { provinceId, addressInfo } = this.state
        if (!provinceId) {
            return
        }
        let citys;
        addressInfo.map(province => {
            if (province.id === provinceId) {
                citys = province.citys
            }
        })
        let addressBody = citys.map(city => {
            return <div onClick={(e) => { this.addCity(e, city.id, city.name) }} className={'wp-modal-list'} key={city.id}>{city.name}</div>
        })
        this.setState({
            visible: true,
            title: '城市',
            addressBody
        })
    }
    addCity = (e, cityId, cityName) => {
        this.setState({
            city: cityName,
            cityId,
            visible: false
        })
    }
    addProvince = (e, provinceId, provinceName) => {
        this.setState({
            province: provinceName,
            provinceId,
            city: '请选择城市',
            cityId: 0,
            visible: false
        })
    }
    submitAddress = (e) => {
        e.preventDefault()
        const { provinceId, cityId, province, city, oldAddress } = this.state
        const name = this.refs.name.value
        const phone = this.refs.phone.value
        const detailAddress = this.refs.detailAddress.value
        if (!name.trim()) {
            Toast.info('请输入收货人真实姓名', 1)
            return false;
        }
        if ((!(/^1[34578]\d{9}$/.test(phone))) && (!phone.length !== 11)) {
            Toast.info('请输入正确的手机号', 1)
            return false;
        }
        if (!provinceId) {
            Toast.info('请选择收货省份', 1)
            return false;
        }
        if (!cityId) {
            Toast.info('请选择收货城市', 1)
            return false;
        }
        if (!detailAddress.trim()) {
            Toast.info('请填写详细地址', 1)
            return false;
        }
        let serviceData = JSON.stringify({
            id: oldAddress.id,
            name,
            phone,
            province,
            city,
            address: detailAddress
        })
        let params = {
            ...requstObeject(),
            serviceData
        }
        NetUtils.fetchRequest('/api/h5/rest//UPDATE_USER_ADDRESS', params).then(res => {
            if (res.resultCode === 1000) {
                setUrl(this)
                this.props.history.replace('/shoppingaddress')
            }
        })
    }
    verifyPhone = (e) => {
        let phone = this.refs.phone.value.trim()
        this.refs.phone.value = phone.replace(/[^0-9]/g, '')
    }
    modalClose = () => {
        this.setState({
            visible: false
        })
    }
    render() {
        const { title, visible, addressBody } = this.state
        return (
            <DocumentTitle title="购物认证">
                <div className={'changeAddress'}>
                    <GoBack who={this} />
                    <div className={'form-wrap'}>
                        <form onSubmit={(e) => { this.submitAddress(e) }}>
                            <div className={'info-wrap'}>
                                <div className={'input-wrap'}>
                                    <div className={'input-label'}>收货人</div>
                                    <input type="text" ref="name" className={'input'} placeholder="请输入收货人真实姓名" />
                                </div>
                                <div className={'line'}></div>
                                <div className={'input-wrap'}>
                                    <div className={'input-label'}>手机号</div>
                                    <input maxLength={11} type="text" ref="phone" onInput={this.verifyPhone} className={'input'} placeholder="请输入收货人手机号码" />
                                </div>
                            </div>
                            <div className={'address-wrap'}>
                                <div>
                                    <div className={'input-wrap'} onClick={this.chooseProvince}>
                                        <div className={'input-label'}>省份</div>
                                        <div className={'input'} >{this.state.province}</div>
                                    </div>
                                    <div className={"line"}></div>
                                    <div onClick={this.chooseCity} className={'input-wrap'}>
                                        <div className={'input-label'}>城市</div>
                                        <div className={'input'} >{this.state.city}</div>
                                    </div>
                                    <div className={"line"}></div>
                                    <div className={'detail-address-wrap'}>
                                        <div className={'input-label'}>详细地址</div>
                                        <textarea ref="detailAddress" className={'detail-address'} onInput={(e) => { this.autoHeight(e) }} placeholder="请输入详细地址"></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className={'submit-wrap'}>
                                <button className={'submit'} type="submit">保存</button>
                            </div>
                        </form>
                    </div>
                    <Modal visible={visible} onClose={this.modalClose} title={title}>
                        {addressBody ? addressBody : null}
                    </Modal>
                </div>
            </DocumentTitle>
        )
    }
}
export default ChangeAddress