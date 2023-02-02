import React, { useState, useEffect } from 'react';
import { DatePicker, Dropdown, Button, Menu, Input, Select } from 'antd';
import { DownOutlined, OrderedListOutlined } from '@ant-design/icons';
import moment from 'moment';

//css
import './styles.css';

const { RangePicker } = DatePicker;
const { Search } = Input;
const { Option } = Select;

const initalFilterValues = {
    stateFilter: '',
    statusFilter: '',
    search: '',
    fromDate: '',
    toDate: '',
};

export default function SMSFilter(props) {
    const {
        currentIndex,
        setData,
        data,
        smsdata,
        handleChange,
        handlePostSms,
    } = props;

    const { smsList: list, allSmsList: allList } = data;

    const [filters, setFilters] = useState({
        stateFilter: [],
        statusFilter: [],
    });

    const [selectedFilters, setSelectedFilters] = useState(initalFilterValues);

    useEffect(() => {
        generateFilters();
    }, [allList]);

    useEffect(() => {
        handleFilter();
    }, [selectedFilters]);

    function generateFilters() {
        let stateFilter = [{ name: 'ANY', value: '' }];
        let statusFilter = [{ name: 'ANY', value: '' }];

        for (const element of list) {
            if (
                stateFilter?.findIndex(
                    (e) => e.value === element.deliveryStatus
                ) === -1 &&
                element.deliveryStatus
            )
                stateFilter?.push({
                    name: element.deliveryStatus,
                    value: element.deliveryStatus,
                });
            if (
                statusFilter?.findIndex((e) => e.value === element.status) ===
                    -1 &&
                element.status
            )
                statusFilter?.push({
                    name: element.status,
                    value: element.status,
                });
        }

        setFilters({
            ...filters,
            statusFilter,
            stateFilter,
        });
    }

    function handleDateFilter(date) {
        const byDate = {
            fromDate: moment(date[0]).format('YYYY-MM-DD'),
            toDate: moment(date[1]).format('YYYY-MM-DD'),
        };
        handlePostSms(date[0] && byDate);
        setSelectedFilters({
            ...selectedFilters,
            fromDate: date[0],
            toDate: date[1],
        });
    }

    function handleFilter() {
        let { stateFilter, statusFilter, search } = selectedFilters;
        let newDataToRender = [];
        newDataToRender = allList
            ?.filter((e) => !search || e.id?.includes(search))
            ?.filter((e) => !statusFilter || e.status?.includes(statusFilter))
            ?.filter(
                (e) => !stateFilter || e.deliveryStatus?.includes(stateFilter)
            );
        setData({
            ...data,
            smsList: newDataToRender,
        });
    }

    function handleSearch(e) {
        setSelectedFilters({
            ...selectedFilters,
            search: e.target.value,
        });
    }

    return (
        <div className="d-flex justify-content-between my-2 p-1 bg-light">
            <div className="d-flex align-items-center">
                <Select
                    value={smsdata.length > 0 ? currentIndex : ''}
                    style={{ width: 120 }}
                    onChange={(value) => {
                        handleChange(value);
                        setSelectedFilters({
                            ...selectedFilters,
                            ...initalFilterValues,
                        });
                    }}
                >
                    {smsdata.map((phone, index) => {
                        return (
                            <Option value={index} key={index}>
                                {phone.phoneNumber || ''}
                            </Option>
                        );
                    })}
                </Select>
                <Dropdown menu={renderMenu('state')} className="ml-2">
                    <Button>
                        State : {selectedFilters.stateFilter || 'ANY'}{' '}
                        <DownOutlined />
                    </Button>
                </Dropdown>
                <Dropdown menu={renderMenu('status')} className="ml-2">
                    <Button>
                        Status : {selectedFilters.statusFilter || 'ANY'}{' '}
                        <DownOutlined />
                    </Button>
                </Dropdown>
                <Search
                    className="ml-2"
                    placeholder="Search by SMS Id"
                    style={{ width: 200 }}
                    onChange={handleSearch}
                    value={selectedFilters.search}
                />
            </div>
            <div>
                <RangePicker
                    onChange={(e, date) => {
                        handleDateFilter(date);
                    }}
                />
            </div>
        </div>
    );

    function renderMenu(type) {
        let myFilterVariable = `${type}Filter`;
        let menus = filters[myFilterVariable];
        return (
            <Menu
                onClick={(e) => {
                    handleMenuClick(myFilterVariable, e);
                }}
            >
                {menus?.map((menu, index) => {
                    return (
                        <Menu.Item key={index} icon={<OrderedListOutlined />}>
                            {menu.name}
                        </Menu.Item>
                    );
                })}
            </Menu>
        );
    }

    function handleMenuClick(myFilterVariable, e) {
        setSelectedFilters({
            ...selectedFilters,
            [myFilterVariable]: filters[myFilterVariable][e.key]['value'],
        });
    }
}
