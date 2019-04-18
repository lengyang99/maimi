import { Component } from 'react';
// let common_url =' http://192.168.0.16:8182';//开发
let common_url ='';
// let common_url ='https://jie.youmibank.com'//测试
class NetUtils extends Component {
    fetchRequest(url, params = '') {
        let header = {
            'Accept': 'application/json',
            'Content-type' : 'application/json',
        }
        if (!params) {
            return new Promise(function (resolve, reject) {
                fetch(common_url + url, {
                    method: 'POST',
                    headers: header,
                    mode:'cors'
                }).then((response) => {
                    resolve(response.json())
                })
                    .catch((err) => {
                        reject(err);
                    });
            });
        } else {
            return new Promise(function (resolve, reject) {
                fetch(common_url + url, {
                    method: 'POST',
                    headers: header,
                    mode:'cors',
                    body: JSON.stringify(params)
                }).then((response) => {

                    resolve(response.json())

                }).catch((err) => {
                    reject(err);
                });
            });
        }
    }
}
export default new NetUtils();
