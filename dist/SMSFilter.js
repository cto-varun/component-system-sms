"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = SMSFilter;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _moment = _interopRequireDefault(require("moment"));
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
//css

const {
  RangePicker
} = _antd.DatePicker;
const {
  Search
} = _antd.Input;
const {
  Option
} = _antd.Select;
const initalFilterValues = {
  stateFilter: '',
  statusFilter: '',
  search: '',
  fromDate: '',
  toDate: ''
};
function SMSFilter(props) {
  const {
    currentIndex,
    setData,
    data,
    smsdata,
    handleChange,
    handlePostSms
  } = props;
  const {
    smsList: list,
    allSmsList: allList
  } = data;
  const [filters, setFilters] = (0, _react.useState)({
    stateFilter: [],
    statusFilter: []
  });
  const [selectedFilters, setSelectedFilters] = (0, _react.useState)(initalFilterValues);
  (0, _react.useEffect)(() => {
    generateFilters();
  }, [allList]);
  (0, _react.useEffect)(() => {
    handleFilter();
  }, [selectedFilters]);
  function generateFilters() {
    let stateFilter = [{
      name: 'ANY',
      value: ''
    }];
    let statusFilter = [{
      name: 'ANY',
      value: ''
    }];
    for (const element of list) {
      if (stateFilter?.findIndex(e => e.value === element.deliveryStatus) === -1 && element.deliveryStatus) stateFilter?.push({
        name: element.deliveryStatus,
        value: element.deliveryStatus
      });
      if (statusFilter?.findIndex(e => e.value === element.status) === -1 && element.status) statusFilter?.push({
        name: element.status,
        value: element.status
      });
    }
    setFilters({
      ...filters,
      statusFilter,
      stateFilter
    });
  }
  function handleDateFilter(date) {
    const byDate = {
      fromDate: (0, _moment.default)(date[0]).format('YYYY-MM-DD'),
      toDate: (0, _moment.default)(date[1]).format('YYYY-MM-DD')
    };
    handlePostSms(date[0] && byDate);
    setSelectedFilters({
      ...selectedFilters,
      fromDate: date[0],
      toDate: date[1]
    });
  }
  function handleFilter() {
    let {
      stateFilter,
      statusFilter,
      search
    } = selectedFilters;
    let newDataToRender = [];
    newDataToRender = allList?.filter(e => !search || e.id?.includes(search))?.filter(e => !statusFilter || e.status?.includes(statusFilter))?.filter(e => !stateFilter || e.deliveryStatus?.includes(stateFilter));
    setData({
      ...data,
      smsList: newDataToRender
    });
  }
  function handleSearch(e) {
    setSelectedFilters({
      ...selectedFilters,
      search: e.target.value
    });
  }
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex justify-content-between my-2 p-1 bg-light"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex align-items-center"
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    value: smsdata.length > 0 ? currentIndex : '',
    style: {
      width: 120
    },
    onChange: value => {
      handleChange(value);
      setSelectedFilters({
        ...selectedFilters,
        ...initalFilterValues
      });
    }
  }, smsdata.map((phone, index) => {
    return /*#__PURE__*/_react.default.createElement(Option, {
      value: index,
      key: index
    }, phone.phoneNumber || '');
  })), /*#__PURE__*/_react.default.createElement(_antd.Dropdown, {
    menu: renderMenu('state'),
    className: "ml-2"
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, null, "State : ", selectedFilters.stateFilter || 'ANY', ' ', /*#__PURE__*/_react.default.createElement(_icons.DownOutlined, null))), /*#__PURE__*/_react.default.createElement(_antd.Dropdown, {
    menu: renderMenu('status'),
    className: "ml-2"
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, null, "Status : ", selectedFilters.statusFilter || 'ANY', ' ', /*#__PURE__*/_react.default.createElement(_icons.DownOutlined, null))), /*#__PURE__*/_react.default.createElement(Search, {
    className: "ml-2",
    placeholder: "Search by SMS Id",
    style: {
      width: 200
    },
    onChange: handleSearch,
    value: selectedFilters.search
  })), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(RangePicker, {
    onChange: (e, date) => {
      handleDateFilter(date);
    }
  })));
  function renderMenu(type) {
    let myFilterVariable = `${type}Filter`;
    let menus = filters[myFilterVariable];
    return /*#__PURE__*/_react.default.createElement(_antd.Menu, {
      onClick: e => {
        handleMenuClick(myFilterVariable, e);
      }
    }, menus?.map((menu, index) => {
      return /*#__PURE__*/_react.default.createElement(_antd.Menu.Item, {
        key: index,
        icon: /*#__PURE__*/_react.default.createElement(_icons.OrderedListOutlined, null)
      }, menu.name);
    }));
  }
  function handleMenuClick(myFilterVariable, e) {
    setSelectedFilters({
      ...selectedFilters,
      [myFilterVariable]: filters[myFilterVariable][e.key]['value']
    });
  }
}
module.exports = exports.default;