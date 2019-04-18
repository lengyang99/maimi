import React from 'react'
import BottomBtn from '../../components/BottomBtn';
import NetUtils from '../../components/common/NetUtils';
import { requstObeject,redirect} from "../../util/util";
import './Result.less';

const Result = ({ resultMsg }) => {
  const goNext = (action) => {
    const params = requstObeject();
    params.serviceData = JSON.stringify({ type: action });
    NetUtils.fetchRequest('/api/h5/rest/USEROPERATORAUTH', params).then(rep => {
      if (rep.resultCode === 1000) {
        if (action === '0') {
          const { moxieUrl } = JSON.parse(rep.resultData) || {};
          if (moxieUrl) {
            window.location.href = moxieUrl;
          }
        } else if (action === '1') {
          const url = sessionStorage.getItem('return_url');
          const token = sessionStorage.getItem('token');
          redirect(token, 1, url);
        }
      }
    });
  }
  const { warn, info, status, btnText} = resultMsg;
  return (
    <div className='result-view'>
      <div className={`result-img ${status}`}></div>
      <div className='result-warn'>{warn}</div>
      <div className='result-info'>{info}</div>
      <BottomBtn
        btnTxt={btnText}
        btnStyle={resultMsg.nextAction ? 'btn-color' : 'btn-image'}
        onClick={resultMsg.nextAction ? ()=>goNext(resultMsg.nextAction) : null}
      ></BottomBtn>
    </div>
  )
}

export default Result;
