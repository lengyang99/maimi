export const bankConfig = [{
    icon: 'China',
    name: '中国银行',
    bgColor: 'red',
},
{
    icon: 'ABC',
    name: '中国农业银行',
    bgColor: 'green',
},
{
    icon: 'build',
    name: '中国建设银行',
    bgColor: 'blue',
},
{
    icon: 'ICBC',
    name: '中国工商银行',
    bgColor: 'red',
},
{
    icon: 'zhaoshang',
    name: '招商银行',
    bgColor: 'red',
},
{
    icon: 'jiaotong',
    name: '交通银行',
    bgColor: 'blue',
},
{
    icon: 'Xingye',
    name: '兴业银行',
    bgColor: 'blue',
},
{
    icon: 'Everbright',
    name: '中国光大银行',
    bgColor: 'red',
},
{
    icon: 'CITIC',
    name: '中信银行',
    bgColor: 'red',
},
{
    icon: 'huaxia',
    name: '华夏银行',
    bgColor: 'red',
},
{
    icon: 'guangfa',
    name: '广东发展银行',
    bgColor: 'red',
},
{
    icon: 'SPD',
    name: '上海浦东发展银行',
    bgColor: 'blue',
},
{
    icon: 'youzheng',
    name: '中国邮政储蓄银行',
    bgColor: 'green',
},
{
    icon: 'minsheng',
    name: '中国民生银行',
    bgColor: 'green',
},
{
    icon: 'pingan',
    name: '平安银行',
    bgColor: 'red',
}
];
/**
 * nexAction : 10 跳转到运营商认证界面  20 跳转到 认证主界面 
 * status 映射 插图图片位置
 */
export const resultConfig = [{
    warn: '您还未完成运营商认证',
    info: '完成本人的运营商认证下一步便可申请借款',
    status: 'uncertified',
    statusCode: '10',
    btnText:'下一步',
    nextAction:'0'
},
{
    warn: '您的运营商认证已过期',
    info: '重新完成运营商认证下一步即可申请借款',
    status: 'uncertified',
    statusCode: '40',
    btnText:'下一步',
    nextAction:'0'
},
{
    warn: '您已完成运营商认证',
    info: '点击下一步去申请借款',
    status: 'certified',
    statusCode: '30',
    btnText:'下一步',
    nextAction:'1'
},
{
    warn: '认证成功',
    info: '点击下一步去申请借款',
    status: 'successful',
    statusCode: '60',
    btnText:'下一步',
    nextAction:'1'
},
{
    warn: '认证失败',
    info: '完成本人的运营商认证下一步便可申请借款',
    status: 'defult',
    statusCode: '50',
    btnText: '重新绑定',
    nextAction:'0',
},
{
    warn: '认证中',
    info: '您的运营商认证正处理中，请耐心等待...',
    status: 'loading',
    statusCode: '20',
    btnText: '请等待',
    nextAction:null,
}];