import React from 'react'
import {List} from 'antd-mobile';
import './BankList.less';

const BankListItem = ({data,onBankSelected}) => {
    const onBankClick = (item) => {
        if(onBankSelected){
            onBankSelected(item);
        }
    } 
    return (
           <List className='bank-list'>
            {data.map((item)=>{
                return (
                    <List.Item key={item.bankCode}>
                        <div className={`bank-${item.bankIcon} bank-size`}/>
                        <label className='bank-name' onClick={()=>onBankClick(item)}>{item.bankName}</label>
                    </List.Item>
                )
            })}
        </List>
    )
}
export default BankListItem;

