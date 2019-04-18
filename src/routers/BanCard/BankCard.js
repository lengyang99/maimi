import React from 'react'
import BottomBtn from '../../components/BottomBtn';
import NetUtils from '../../components/common/NetUtils';
import {redirect,requstObeject} from "../../util/util";
import './BankCard.less'

const BankCard = ({ data = {
    icon: 'ABC',
    name: '中国农业银行',
    bgColor: 'green',
    cardNo: ['1234', '****', '****', '5678'],
}, onChangeBankCard}) => {
    const confrim = () => {
        const params = requstObeject();
        params.serviceData = JSON.stringify({type:1});
        NetUtils.fetchRequest('/api/h5/rest/FUION_BIND_BANK_CARD_AFFIRM', params).then(rep => {
            if (rep.resultCode === 1000) {
                const url= sessionStorage.getItem('return_url');
                const token = sessionStorage.getItem('token');
                redirect(token,0,url);
            }
        });
    }
    return (
        <div className='list'>
            <div className='list-header'><label>您已绑定以下银行卡</label></div>
            <div className='view'>
                <div className={`bank-card bank-bg-${data.bgColor}`}>
                    <div className={`bank-mark bank-${data.icon}-b`} />
                    <div className='bank-icon-name'>
                        <div className={`bank-icon bank-${data.icon}`} />
                        <div>
                            <div className='bank-name'>{data.name}</div>
                            <div className='bank-type'>储蓄卡</div>
                        </div>
                    </div>
                    <div></div>
                    <div className='bank-number'>
                        {(data.cardNo || []).map((item, index) => (
                            <label key={`${index}_${item}`}>{item}</label>
                        ))}
                    </div>
                </div>
               {data.changeable ===1 ?<div className='bank-info'>
                    <div>无法收款?</div>
                    <div onClick={onChangeBankCard}>换绑银行卡</div>
                </div> : null}
            </div>
            <BottomBtn
                btnTxt='确认银行卡'
                onClick={confrim}
                btnStyle={'btn-color'}
            ></BottomBtn>
        </div>
    )
}

export default BankCard;