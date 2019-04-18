import React ,{ Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import './NotifyModal.less'
class Modal extends Component{
    constructor(props){
        super(props)
        this.moadl = null;
    }
    componentDidMount(){
        let {visible}  = this.props
        this.moadl = document.createElement('div')
        visible && document.body.append(this.moadl)
        this._renderModal()
    }
    componentDidUpdate () {
        if (this.props.visible) {
            document.body.appendChild(this.moadl);
            this._renderModal();
        } else {
            this.moadl.parentNode && this.moadl.parentNode.removeChild(this.moadl);
        }
    }
    onClose = () => {
        this.props.onClose&&this.props.onClose()
    }
    closeModal = (e) => {
        e.persist()
        if(e.target!==e.currentTarget){
            return
        }
        this.moadl.parentNode && this.moadl.parentNode.removeChild(this.moadl);
    }
    _renderModal = () => {
        const {title,messageContent} = this.props
      let jsDom = (
            <div className={''}>
                <div className={'shade'}>
                </div>
                <div className={'modal-wrap'}>
                    <div className={'modal-document'}>
                        <div className={'modal-content'}>
                            <div className={'modal-content-header'}>
                                {title?title: '标题'}
                            </div>
                            <div className={'modal-content-body'}>
                            <div className={'notify-content'}>{messageContent?messageContent:null}</div>
                            </div>
                            <div onClick={(e)=> {this.onClose(e)}} className={'cancel'}>取消</div>
                        </div>
                    </div>
                </div>
            </div>
        )
        ReactDOM.render(jsDom, this.moadl)
    }
    render(){
        return null
    }
}

Modal.propTypes = {
    title: PropTypes.string,
    onClose: PropTypes.func,
    visible: PropTypes.bool,
    messageContent: PropTypes.string
}
export default Modal