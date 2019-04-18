import React, {Component} from 'react';
import LoadingComponentUtils from './components/common/LoadingComponentUtils';
import {Route,BrowserRouter,Switch} from 'react-router-dom';

// 运营商认证
const Operator = LoadingComponentUtils({loader: () => import('./routers/Operator/Operator')});
// 银行卡
const Bank = LoadingComponentUtils({loader: () => import('./routers/BanCard/Bank')});

//订单列表
const OrderHistory = LoadingComponentUtils({loader: () => import('./routers/OrderHistory/OrderHistory')});

//物流详情
const LogisticsDetails = LoadingComponentUtils({loader: () => import('./routers/LogisticsDetails/LogisticsDetails')});
//订单详情
const OrderDetails = LoadingComponentUtils({loader: () => import('./routers/OrderDetails/OrderDetails')});

//商品列表
const Products = LoadingComponentUtils({loader: () => import('./routers/Products/Products')})
//购物订单
const Order = LoadingComponentUtils({loader: () => import('./routers/Order/Order')})
//商品详情
const ProductDetail = LoadingComponentUtils({loader: () => import('./routers/ProductDetail/ProductDetail')})
//选择收货地址
const ShoppingAddress = LoadingComponentUtils({loader: () => import('./routers/ShoppingAddress/ShoppingAddress')})
//编辑收货地址
const EditorAddress = LoadingComponentUtils({loader: () => import('./routers/EditorAddress/EditorAddress')})
//修改收货地址
const ChangeAddress = LoadingComponentUtils({loader: () => import('./routers/ChangeAddress/ChangeAddress')})
//购物认证成功
const SuccessVerify = LoadingComponentUtils({loader: () => import('./routers/SuccessVerify/SuccessVerify')})
export default class Router extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route  exact path="/bankCard" component={Bank}/>
          <Route  exact path="/operator" component={Operator}/>
          <Route  exact path="/orderhistory" component={OrderHistory}/>
          <Route  exact path="/logisticsdetails" component={LogisticsDetails}/>
          <Route  exact path="/orderdetails" component={OrderDetails}/>
          
         
            <Route exact path='/products' component={Products} />
            <Route exact path='/products/:id' component={ProductDetail}/>
            <Route exact path='/order' component={Order} />
            <Route exact path='/shoppingaddress' component={ShoppingAddress} />
            <Route exact path='/editoraddress' component={EditorAddress} />
            <Route  exact path='/changeaddress' component={ChangeAddress} />
            <Route exact path='/successverify' component={SuccessVerify} />
        </Switch>
      </BrowserRouter>
    );
  }
}