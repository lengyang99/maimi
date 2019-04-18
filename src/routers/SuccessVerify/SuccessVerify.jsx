import React, { Component } from 'react';
import './SuccessVerify.less'
import { getLocal,redirect } from '../../util/util'
import DocumentTitle from 'react-document-title'
class SuccessVerify extends Component{
    toMaiMang = () => {
        let token = getLocal('token')
        let url = getLocal('url')
         redirect(token, 2 ,url)
    }
    render(){
        return (
            <DocumentTitle title="购物认证">
                <div>
                    <div className={'verify-wrap'}>
                        <div className={'verify-img'}>
                        </div>
                        <div className={'verify-title'}>
                            认证成功
                        </div>
                        <div className={'verify-content'}>
                            您已完成购物认证
                        </div>
                    </div>
                <div onClick={()=>{this.toMaiMang()}} className={'next'}>下一步</div>
                </div>
            </DocumentTitle>
        )
    }
}
export default SuccessVerify