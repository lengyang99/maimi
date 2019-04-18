import React from 'react';
import Loadable from 'react-loadable';
import { Loading } from '../Loading';
const LoadingComponent = ({isLoading, error}) => {
    if (isLoading) {
      return <Loading/>
    }
    else if (error) {
      console.log('错误信息：', error);
      return <div>Sorry, there was a problem loading the page.</div>;
    }
    else {
      return null;
    }
  };
const LoadingComponentUtils = ({loader,loading = LoadingComponent}) => Loadable({
    loader,
    loading,
  });
export default LoadingComponentUtils;
  