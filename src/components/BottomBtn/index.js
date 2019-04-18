import React from 'react';
import {Button} from 'antd-mobile';
import './index.less';

const BottomBtn = ({onClick,btnTxt = '',btnStyle='btn-image' , newProps = {}}) => {
   return( 
   <div className='bottom'>
        <Button onClick={onClick} className={`bottom-button ${btnStyle}`} {...newProps}>{btnTxt}</Button>
  </div>)
}
export default BottomBtn;