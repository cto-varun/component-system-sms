"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = SystemSms;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _moment = _interopRequireDefault(require("moment"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _SMSFilter = _interopRequireDefault(require("./SMSFilter"));
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const columns = [{
  title: 'SMS ID',
  dataIndex: 'id',
  key: 'id',
  render: data => /*#__PURE__*/_react.default.createElement("div", {
    className: "text-green text-bold"
  }, data)
}, {
  title: 'SENT DATE',
  dataIndex: 'sentTime',
  key: 'sentTime',
  render: data => /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, (0, _moment.default)(data).format('MM/DD/YY h:mm a'))
}, {
  title: 'RECIEVED DATE',
  dataIndex: 'deliveryTime',
  key: 'deliveryTime',
  render: data => /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, (0, _moment.default)(data).format('MM/DD/YY h:mm a'))
}, {
  title: 'SOURCE',
  dataIndex: 'sentFrom',
  key: 'sentFrom'
}, {
  title: 'STATE',
  dataIndex: 'deliveryStatus',
  key: 'deliveryStatus'
}, {
  title: 'STATUS',
  dataIndex: 'status',
  key: 'status'
}, {
  title: 'MESSSAGE TYPE',
  dataIndex: 'type',
  key: 'type'
}, {
  title: '',
  dataIndex: 'text',
  key: 'text',
  render: data => /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    title: data
  }, /*#__PURE__*/_react.default.createElement(_icons.CommentOutlined, null)))
}];
function SystemSms(_ref) {
  let {
    properties,
    parentProps
  } = _ref;
  const [smsData, setSmsData] = (0, _react.useState)([]);
  const [loading, setLoading] = (0, _react.useState)(false);
  const [currentIndex, setCurrentIndex] = (0, _react.useState)(0);
  const [errorMessage, setErrorMessage] = (0, _react.useState)('No SMS found matching the request criteria');
  const [data, setData] = (0, _react.useState)({
    smsList: [],
    allSmsList: [],
    phoneNumber: ''
  });
  const {
    workflow,
    responseMapping,
    successStates,
    errorStates
  } = properties?.workflow;
  (0, _react.useEffect)(() => {
    if (!smsData.length) {
      handleSmsData();
    }
    return () => {
      _componentMessageBus.MessageBus.unsubscribe(workflow + '-' + window[sessionStorage.tabId].NEW_BAN);
    };
  }, []);
  const handleResponse = (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        const response = eventData?.event?.data?.data;
        setSmsData(response);
        setData({
          ...response,
          smsList: response[currentIndex]?.smsList,
          allSmsList: response[currentIndex]?.smsList,
          phoneNumber: response[currentIndex]?.phoneNumber
        });
      }
      if (isFailure) {
        setSmsData([]);
        setData({
          smsList: [],
          allSmsList: [],
          phoneNumber: ''
        });
        setErrorMessage(eventData?.event?.data?.message || 'No SMS found matching the request criteria');
      }
      setLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const handleSmsData = byDate => {
    const datasource = parentProps.datasources[properties?.workflow?.datasource];
    const ban = window[window.sessionStorage?.tabId].NEW_BAN;
    const registrationId = `${workflow}-${ban}`;
    const requestBody = {
      billingAccountNumber: ban
    };
    setLoading(true);
    if (byDate) requestBody.byDate = byDate;
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: registrationId,
        workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleResponse);
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
      header: {
        registrationId: registrationId,
        workflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource,
        request: {
          body: requestBody
        },
        responseMapping
      }
    });
  };
  function handleChange(index) {
    setCurrentIndex(index);
    setData({
      ...data,
      smsList: smsData[index]?.smsList,
      allSmsList: smsData[index]?.smsList,
      phoneNumber: smsData[index]?.phoneNumber
    });
  }
  const {
    smsList
  } = data;
  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_SMSFilter.default, {
    setData: setData,
    handleChange: handleChange,
    handlePostSms: handleSmsData,
    smsdata: smsData,
    data: data,
    currentIndex: currentIndex
  }), /*#__PURE__*/_react.default.createElement(_antd.Table, {
    columns: columns,
    dataSource: smsList || [],
    rowClassName: "bg-transparent",
    className: "bg-transparent",
    locale: {
      emptyText: errorMessage
    },
    loading: loading
  }));
}
module.exports = exports.default;