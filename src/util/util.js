import {JSEncrypt} from 'jsencrypt'
import publicKey from '../components/common/publicKey'
//检查是否有类名
export const hasClass = (node, className) => {
    const classNameArr = node.className.split(' ')
    const isHas = classNameArr.some(item => item === className)
    return isHas
}
//检查添加类名
export const addClass = (node, className) => {
    const isHas = hasClass(node, className)
    if (isHas) {
        return
    } else {
        const classNameArr = node.className.split(' ')
        classNameArr.push(className)
        const classStr = classNameArr.join(' ')
        node.className = classStr
    }
}
//删除类名
export const deleteClass = (node, className) => {
    const isHas = hasClass(node, className)
    if (!isHas) {
        return
    } else {
        const classNameArr = node.className.split(' ')
        const newClass = classNameArr.filter(item => {
            return item !== className
        })
        const classStr = newClass.join(' ')
        node.className = classStr
    }
}
//切换类名
export const toggleClass = (node, className) => {
    const isHas = hasClass(node, className)
    if (isHas) {
        deleteClass(node, className)
    } else {
        addClass(node, className)
    }
}

export const requstObeject = () => {
    let request = {}
    let token = getLocal('token')
    let encrypt = new JSEncrypt()
    encrypt.setPublicKey(publicKey)
    const currentTime = new Date().getTime()
    token = token && token !== 'undefined' ? token : `7_jishi_${currentTime}`
    request.accessToken = token;
    request.timeStamp = currentTime + ''
    request.sign = encrypt.encrypt(request.timeStamp + "")
    return request
}

export const getQueryString = (url) => {
    let result = {};
    let query = url.split("?")[1]||'';
    let queryArr = query.split("&");
    queryArr.forEach(function (item) {

        var key = item.split("=")[0];

        var value = decodeURIComponent(item.split("=")[1]);

        result[key] = value;

    });
    return result;
}

export const getLocal = (key) => {
    return  window.sessionStorage.getItem(key)
}

export const setLocal = (key, value) => {

    if(typeof value === 'object'){
      value = JSON.stringify(value)
    }

    window.sessionStorage.setItem(key, value)
}

export const setUrl = (who,type) => {
    const urlList = JSON.parse(getLocal('urlList')) || [];
    const length = urlList.length;
    if(type === -1 && length > 0){
        who.props.history.replace(urlList[length-1]);
        urlList.pop();
    }else {
        urlList.push(who.props.history.location.pathname+who.props.history.location.search);
    }
    setLocal('urlList', urlList);
}

export const redirect = (token , type , url) => {
	token = encodeURIComponent(token);
	url = encodeURIComponent(url);
    window.location.href = `/api/h5/redirect.htm?token=${token}&type=${type}&url=${url}`;
}

//反转数组

export const reverse =  (arr) => {
    let index = arr.length - 1
    let newArr = []
    for(let i =0; i<arr.length; i++){
        newArr.push(arr[index--])
    }
    return newArr
}
