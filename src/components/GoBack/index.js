import React, {Component} from 'react'
import {setUrl} from "../../util/util";
import './index.less'

export default class LogisticsDetails extends Component {
    goBack = () => {
        setUrl(this.props.who,-1);
    }

    render() {
        return (
            <div className={'goBack'}>
                <div className={'button'} onClick={() => this.goBack()}>返回上一页</div>
            </div>
        )
    }
}
