import React from 'react'
import './index.less';
const Alert = (props) => {
    const { title, message, footer, visible, onVisibleChange } = props;
    return (
        visible ? <div className='alert-mask'>
            <div className='wrap'>
                <div className='content'>
                    <div className='header'>
                        <label>{title}</label>
                    </div>
                    <div className='body'>
                        <label>{message}</label>
                    </div>
                    <div className='footer' onClick={onVisibleChange}>
                        <label>{footer ? footer : '确定'}</label>
                    </div>
                </div>
            </div>
        </div> : null
    )
}

export default Alert;
